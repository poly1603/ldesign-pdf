import { ref, onMounted, onBeforeUnmount, Ref } from 'vue';
import {
  PDFViewer,
  createEnhancedPDFViewer,
  EnhancedPDFViewerOptions,
  FormManager,
  SignatureManager,
  PageManager,
  ExportManager,
  TouchGestureHandler,
  KeyboardHandler,
  PageCacheManager,
  PerformanceMonitor
} from '@ldesign/pdf-core';

export interface UsePDFViewerOptions extends EnhancedPDFViewerOptions {
  onPageChange?: (pageNum: number) => void;
  onDocumentLoad?: () => void;
  onError?: (error: Error) => void;
  onScaleChange?: (scale: number) => void;
}

export interface PDFViewerState {
  isLoading: Ref<boolean>;
  currentPage: Ref<number>;
  totalPages: Ref<number>;
  scale: Ref<number>;
  error: Ref<Error | null>;
}

export interface PDFViewerActions {
  loadPDF: (url: string) => Promise<void>;
  goToPage: (pageNum: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setScale: (scale: number) => void;
  print: () => void;
  download: () => void;
  getFormData: () => Promise<any>;
  fillForm: (data: any) => Promise<void>;
  addSignature: (signature: any, position: any) => Promise<void>;
  exportToPDF: (options?: any) => Promise<Blob>;
  exportToImage: (pageNum: number, options?: any) => Promise<Blob>;
  search: (query: string) => Promise<any[]>;
  destroy: () => void;
}

export interface UsePDFViewerReturn {
  containerRef: Ref<HTMLDivElement | undefined>;
  viewer: Ref<PDFViewer | null>;
  formManager: Ref<FormManager | null>;
  signatureManager: Ref<SignatureManager | null>;
  pageManager: Ref<PageManager | null>;
  exportManager: Ref<ExportManager | null>;
  state: PDFViewerState;
  actions: PDFViewerActions;
}

/**
 * Vue Composition API Hook for PDF Viewer
 * 
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <button @click="actions.zoomIn()">放大</button>
 *     <button @click="actions.zoomOut()">缩小</button>
 *     <div ref="containerRef" style="width: 100%; height: 600px;" />
 *   </div>
 * </template>
 * 
 * <script setup>
 * import { usePDFViewer } from '@ldesign/pdf-vue';
 * 
 * const { containerRef, state, actions } = usePDFViewer({
 *   pdfUrl: 'path/to/document.pdf',
 *   onPageChange: (page) => console.log('Page:', page)
 * });
 * </script>
 * ```
 */
export function usePDFViewer(options: UsePDFViewerOptions = {}): UsePDFViewerReturn {
  const containerRef = ref<HTMLDivElement>();
  const viewer = ref<PDFViewer | null>(null);
  const formManager = ref<FormManager | null>(null);
  const signatureManager = ref<SignatureManager | null>(null);
  const pageManager = ref<PageManager | null>(null);
  const exportManager = ref<ExportManager | null>(null);
  const touchHandler = ref<TouchGestureHandler | null>(null);
  const keyboardHandler = ref<KeyboardHandler | null>(null);
  const cacheManager = ref<PageCacheManager | null>(null);
  const performanceMonitor = ref<PerformanceMonitor | null>(null);

  // 状态
  const isLoading = ref(false);
  const currentPage = ref(1);
  const totalPages = ref(0);
  const scale = ref(1);
  const error = ref<Error | null>(null);

  const state: PDFViewerState = {
    isLoading,
    currentPage,
    totalPages,
    scale,
    error
  };

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

      const result = await createEnhancedPDFViewer({
        container: viewerContainer,
        enableCaching: true,
        enableVirtualScroll: true,
        enableForms: true,
        enableSignatures: true,
        enableExport: true,
        enablePageManagement: true,
        enableTouchGestures: true,
        enableKeyboard: true,
        enablePerformanceMonitoring: true,
        ...options
      });

      viewer.value = result.viewer;
      formManager.value = result.formManager || null;
      signatureManager.value = result.signatureManager || null;
      pageManager.value = result.pageManager || null;
      exportManager.value = result.exportManager || null;
      touchHandler.value = result.touchHandler || null;
      keyboardHandler.value = result.keyboardHandler || null;
      cacheManager.value = result.cacheManager || null;
      performanceMonitor.value = result.performanceMonitor || null;

      // 设置事件监听
      result.viewer.on('page-change', (pageNum: number) => {
        currentPage.value = pageNum;
        options.onPageChange?.(pageNum);
      });

      result.viewer.on('document-loaded', () => {
        totalPages.value = result.viewer.totalPages || 0;
        isLoading.value = false;
        options.onDocumentLoad?.();
      });

      result.viewer.on('scale-change', (newScale: number) => {
        scale.value = newScale;
        options.onScaleChange?.(newScale);
      });

      result.viewer.on('error', (err: Error) => {
        error.value = err;
        isLoading.value = false;
        options.onError?.(err);
      });

      // 如果提供了初始PDF URL，加载它
      if (options.pdfUrl) {
        await result.viewer.loadPDF(options.pdfUrl);
      }
    } catch (err) {
      error.value = err as Error;
      isLoading.value = false;
      options.onError?.(err as Error);
    }
  };

  // 操作方法
  const actions: PDFViewerActions = {
    loadPDF: async (url: string) => {
      if (!viewer.value) throw new Error('Viewer not initialized');
      isLoading.value = true;
      error.value = null;
      try {
        await viewer.value.loadPDF(url);
      } catch (err) {
        error.value = err as Error;
        isLoading.value = false;
        throw err;
      }
    },

    goToPage: (pageNum: number) => {
      viewer.value?.goToPage(pageNum);
    },

    nextPage: () => {
      if (viewer.value && currentPage.value < totalPages.value) {
        viewer.value.goToPage(currentPage.value + 1);
      }
    },

    previousPage: () => {
      if (viewer.value && currentPage.value > 1) {
        viewer.value.goToPage(currentPage.value - 1);
      }
    },

    zoomIn: () => {
      if (viewer.value) {
        const newScale = Math.min(scale.value * 1.2, 5);
        viewer.value.setScale(newScale);
      }
    },

    zoomOut: () => {
      if (viewer.value) {
        const newScale = Math.max(scale.value / 1.2, 0.25);
        viewer.value.setScale(newScale);
      }
    },

    setScale: (newScale: number) => {
      viewer.value?.setScale(newScale);
    },

    print: () => {
      viewer.value?.print();
    },

    download: () => {
      viewer.value?.download();
    },

    getFormData: async () => {
      if (!formManager.value) throw new Error('Form manager not initialized');
      return formManager.value.getFormData();
    },

    fillForm: async (data: any) => {
      if (!formManager.value) throw new Error('Form manager not initialized');
      return formManager.value.fillForm(data);
    },

    addSignature: async (signature: any, position: any) => {
      if (!signatureManager.value) throw new Error('Signature manager not initialized');
      return signatureManager.value.addSignature(signature, position);
    },

    exportToPDF: async (options?: any) => {
      if (!exportManager.value) throw new Error('Export manager not initialized');
      return exportManager.value.exportToPDF(options);
    },

    exportToImage: async (pageNum: number, options?: any) => {
      if (!exportManager.value) throw new Error('Export manager not initialized');
      return exportManager.value.exportPageAsImage(pageNum, options);
    },

    search: async (query: string) => {
      if (!viewer.value) throw new Error('Viewer not initialized');
      // 实现搜索逻辑
      return [];
    },

    destroy: () => {
      viewer.value?.destroy();
      viewer.value = null;
      formManager.value = null;
      signatureManager.value = null;
      pageManager.value = null;
      exportManager.value = null;
    }
  };

  // 生命周期
  onMounted(() => {
    initViewer();
  });

  onBeforeUnmount(() => {
    actions.destroy();
    if (containerRef.value) {
      containerRef.value.innerHTML = '';
    }
  });

  return {
    containerRef,
    viewer,
    formManager,
    signatureManager,
    pageManager,
    exportManager,
    state,
    actions
  };
}


