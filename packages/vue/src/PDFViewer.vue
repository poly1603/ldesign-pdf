<template>
  <div 
    :class="['pdf-viewer-wrapper', className]"
    :style="wrapperStyle"
  >
    <!-- 工具栏 -->
    <div v-if="showToolbar" class="pdf-toolbar">
      <div class="pdf-toolbar-group">
        <button @click="handleZoomOut" title="缩小">
          <span>－</span>
        </button>
        <span class="pdf-toolbar-scale">{{ Math.round(scale * 100) }}%</span>
        <button @click="handleZoomIn" title="放大">
          <span>＋</span>
        </button>
      </div>

      <div class="pdf-toolbar-group">
        <button 
          @click="handlePreviousPage" 
          :disabled="currentPage <= 1" 
          title="上一页"
        >
          <span>◀</span>
        </button>
        <span class="pdf-toolbar-page">
          {{ currentPage }} / {{ totalPages }}
        </span>
        <button 
          @click="handleNextPage" 
          :disabled="currentPage >= totalPages" 
          title="下一页"
        >
          <span>▶</span>
        </button>
      </div>

      <div class="pdf-toolbar-group">
        <button @click="handlePrint" title="打印">
          <span>🖨</span>
        </button>
        <button @click="handleDownload" title="下载">
          <span>💾</span>
        </button>
      </div>

      <!-- 自定义工具栏项 -->
      <slot name="toolbar-items"></slot>
    </div>

    <div class="pdf-viewer-main">
      <!-- 侧边栏 -->
      <div v-if="showSidebar" class="pdf-sidebar">
        <slot name="sidebar">
          <!-- 默认侧边栏内容 -->
        </slot>
      </div>

      <!-- PDF容器 -->
      <div ref="containerRef" class="pdf-container">
        <div v-if="isLoading" class="pdf-loading">
          <slot name="loading">
            <span>加载中...</span>
          </slot>
        </div>
        
        <div v-if="error" class="pdf-error">
          <slot name="error" :error="error">
            <span>加载失败: {{ error.message }}</span>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import {
  createEnhancedPDFViewer,
  PDFViewer as CorePDFViewer,
  FormManager,
  SignatureManager,
  PageManager,
  ExportManager,
  TouchGestureHandler,
  KeyboardHandler,
  PageCacheManager,
  PerformanceMonitor,
  type EnhancedPDFViewerOptions
} from '@ldesign/pdf-core';

// Props定义
export interface PDFViewerProps extends /* @vue-ignore */ Partial<EnhancedPDFViewerOptions> {
  /** PDF文件URL */
  pdfUrl?: string;
  /** 容器样式 */
  style?: Record<string, any>;
  /** 容器类名 */
  className?: string;
  /** 是否显示工具栏 */
  toolbar?: boolean;
  /** 是否显示侧边栏 */
  sidebar?: boolean;
  /** 初始缩放级别 */
  initialScale?: number;
  /** 初始页码 */
  initialPage?: number;
}

const props = withDefaults(defineProps<PDFViewerProps>(), {
  toolbar: true,
  sidebar: false,
  initialScale: 1.0,
  initialPage: 1,
  enableCaching: true,
  enableVirtualScroll: true,
  enableForms: true,
  enableSignatures: true,
  enableExport: true,
  enablePageManagement: true,
  enableTouchGestures: true,
  enableKeyboard: true,
  enablePerformanceMonitoring: true
});

// Emits定义
const emit = defineEmits<{
  'page-change': [pageNum: number];
  'document-load': [];
  'error': [error: Error];
  'scale-change': [scale: number];
  'form-submit': [data: any];
  'signature-add': [signature: any];
}>();

// 模板引用
const containerRef = ref<HTMLDivElement>();

// 状态
const isLoading = ref(false);
const currentPage = ref(1);
const totalPages = ref(0);
const scale = ref(1);
const error = ref<Error | null>(null);

// 查看器实例
let viewer: CorePDFViewer | null = null;
let formManager: FormManager | null = null;
let signatureManager: SignatureManager | null = null;
let pageManager: PageManager | null = null;
let exportManager: ExportManager | null = null;
let touchHandler: TouchGestureHandler | null = null;
let keyboardHandler: KeyboardHandler | null = null;
let cacheManager: PageCacheManager | null = null;
let performanceMonitor: PerformanceMonitor | null = null;

// 计算属性
const showToolbar = computed(() => props.toolbar);
const showSidebar = computed(() => props.sidebar);

const wrapperStyle = computed(() => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  ...props.style
}));

// 初始化查看器
const initViewer = async () => {
  if (!containerRef.value) return;

  try {
    isLoading.value = true;
    error.value = null;

    const viewerContainer = document.createElement('div');
    viewerContainer.className = 'pdf-viewer-container';
    viewerContainer.style.width = '100%';
    viewerContainer.style.height = '100%';
    containerRef.value.appendChild(viewerContainer);

    const instance = await createEnhancedPDFViewer({
      container: viewerContainer,
      pdfUrl: props.pdfUrl,
      initialScale: props.initialScale,
      initialPage: props.initialPage,
      enableCaching: props.enableCaching,
      enableVirtualScroll: props.enableVirtualScroll,
      enableForms: props.enableForms,
      enableSignatures: props.enableSignatures,
      enableExport: props.enableExport,
      enablePageManagement: props.enablePageManagement,
      enableTouchGestures: props.enableTouchGestures,
      enableKeyboard: props.enableKeyboard,
      enablePerformanceMonitoring: props.enablePerformanceMonitoring,
      ...props
    });

    // 保存实例引用
    viewer = instance.viewer;
    formManager = instance.formManager || null;
    signatureManager = instance.signatureManager || null;
    pageManager = instance.pageManager || null;
    exportManager = instance.exportManager || null;
    touchHandler = instance.touchHandler || null;
    keyboardHandler = instance.keyboardHandler || null;
    cacheManager = instance.cacheManager || null;
    performanceMonitor = instance.performanceMonitor || null;

    // 设置事件监听
    viewer.on('page-change', (pageNum: number) => {
      currentPage.value = pageNum;
      emit('page-change', pageNum);
    });

    viewer.on('document-loaded', () => {
      totalPages.value = viewer?.totalPages || 0;
      isLoading.value = false;
      emit('document-load');
    });

    viewer.on('scale-change', (newScale: number) => {
      scale.value = newScale;
      emit('scale-change', newScale);
    });

    viewer.on('error', (err: Error) => {
      console.error('PDF Viewer Error:', err);
      error.value = err;
      isLoading.value = false;
      emit('error', err);
    });

    // 表单管理器事件
    if (formManager) {
      formManager.on('submit', (data: any) => {
        emit('form-submit', data);
      });
    }

    // 签名管理器事件
    if (signatureManager) {
      signatureManager.on('signature-added', (signature: any) => {
        emit('signature-add', signature);
      });
    }

  } catch (err) {
    console.error('Failed to initialize PDF viewer:', err);
    error.value = err as Error;
    isLoading.value = false;
    emit('error', err as Error);
  }
};

// 工具栏操作
const handleZoomIn = () => {
  if (viewer) {
    const newScale = Math.min(scale.value * 1.2, 5);
    viewer.setScale(newScale);
  }
};

const handleZoomOut = () => {
  if (viewer) {
    const newScale = Math.max(scale.value / 1.2, 0.25);
    viewer.setScale(newScale);
  }
};

const handlePreviousPage = () => {
  if (viewer && currentPage.value > 1) {
    viewer.goToPage(currentPage.value - 1);
  }
};

const handleNextPage = () => {
  if (viewer && currentPage.value < totalPages.value) {
    viewer.goToPage(currentPage.value + 1);
  }
};

const handlePrint = () => {
  viewer?.print();
};

const handleDownload = () => {
  viewer?.download();
};

// 公开的方法
const loadPDF = async (url: string) => {
  if (!viewer) throw new Error('Viewer not initialized');
  isLoading.value = true;
  error.value = null;
  try {
    await viewer.loadPDF(url);
  } catch (err) {
    error.value = err as Error;
    throw err;
  }
};

const goToPage = (pageNum: number) => {
  viewer?.goToPage(pageNum);
};

const setScale = (newScale: number) => {
  viewer?.setScale(newScale);
};

const getFormData = async () => {
  if (!formManager) throw new Error('Form manager not initialized');
  return formManager.getFormData();
};

const fillForm = async (data: any) => {
  if (!formManager) throw new Error('Form manager not initialized');
  return formManager.fillForm(data);
};

const addSignature = async (signature: any, position: any) => {
  if (!signatureManager) throw new Error('Signature manager not initialized');
  return signatureManager.addSignature(signature, position);
};

const exportToPDF = async (options?: any) => {
  if (!exportManager) throw new Error('Export manager not initialized');
  return exportManager.exportToPDF(options);
};

const exportToImage = async (pageNum: number, options?: any) => {
  if (!exportManager) throw new Error('Export manager not initialized');
  return exportManager.exportPageAsImage(pageNum, options);
};

// 生命周期
onMounted(() => {
  initViewer();
});

onBeforeUnmount(() => {
  if (viewer) {
    viewer.destroy();
    viewer = null;
  }
  if (containerRef.value) {
    containerRef.value.innerHTML = '';
  }
});

// 监听URL变化
watch(() => props.pdfUrl, (newUrl) => {
  if (newUrl && viewer) {
    loadPDF(newUrl);
  }
});

// 暴露给父组件的方法
defineExpose({
  loadPDF,
  goToPage,
  setScale,
  getFormData,
  fillForm,
  addSignature,
  exportToPDF,
  exportToImage,
  viewer: () => viewer,
  formManager: () => formManager,
  signatureManager: () => signatureManager,
  pageManager: () => pageManager,
  exportManager: () => exportManager
});
</script>

<style scoped>
.pdf-viewer-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.pdf-toolbar {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.pdf-toolbar-group {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.pdf-toolbar-group button {
  padding: 5px 10px;
  margin: 0 5px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pdf-toolbar-group button:hover:not(:disabled) {
  background: #e0e0e0;
}

.pdf-toolbar-group button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pdf-toolbar-scale,
.pdf-toolbar-page {
  margin: 0 10px;
  font-size: 14px;
}

.pdf-viewer-main {
  display: flex;
  flex: 1;
  position: relative;
  overflow: hidden;
}

.pdf-sidebar {
  width: 250px;
  background: #f9f9f9;
  border-right: 1px solid #ddd;
  overflow-y: auto;
}

.pdf-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.pdf-loading,
.pdf-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
  color: #666;
}

.pdf-error {
  color: #f5222d;
}

.pdf-viewer-container {
  width: 100%;
  height: 100%;
}
</style>


