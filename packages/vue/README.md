# @ldesign/pdf-vue

Vue 3组件和Composition API，用于集成企业级PDF查看器。

## 安装

```bash
npm install @ldesign/pdf-vue @ldesign/pdf-core
# 或
pnpm add @ldesign/pdf-vue @ldesign/pdf-core
# 或
yarn add @ldesign/pdf-vue @ldesign/pdf-core
```

## 快速开始

### 全局注册

```javascript
import { createApp } from 'vue';
import PDFViewer from '@ldesign/pdf-vue';
import App from './App.vue';

const app = createApp(App);
app.use(PDFViewer);
app.mount('#app');
```

### 使用PDFViewer组件

```vue
<template>
  <div class="app">
    <PDFViewer
      :pdf-url="pdfUrl"
      :toolbar="true"
      :sidebar="false"
      @page-change="handlePageChange"
      @document-load="handleDocumentLoad"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { PDFViewer } from '@ldesign/pdf-vue';

const pdfUrl = ref('/path/to/document.pdf');

const handlePageChange = (page) => {
  console.log('当前页:', page);
};

const handleDocumentLoad = () => {
  console.log('文档加载完成');
};
</script>

<style>
.app {
  width: 100%;
  height: 100vh;
}
</style>
```

### 使用Composition API

```vue
<template>
  <div class="pdf-viewer-container">
    <!-- 自定义工具栏 -->
    <div class="toolbar">
      <button @click="actions.previousPage" :disabled="state.currentPage.value <= 1">
        上一页
      </button>
      <span>{{ state.currentPage.value }} / {{ state.totalPages.value }}</span>
      <button @click="actions.nextPage" :disabled="state.currentPage.value >= state.totalPages.value">
        下一页
      </button>
      <button @click="actions.zoomIn">放大</button>
      <button @click="actions.zoomOut">缩小</button>
      <span>{{ Math.round(state.scale.value * 100) }}%</span>
      <button @click="actions.print">打印</button>
      <button @click="actions.download">下载</button>
    </div>

    <!-- PDF查看器容器 -->
    <div ref="containerRef" class="pdf-container"></div>

    <!-- 加载状态 -->
    <div v-if="state.isLoading.value" class="loading">加载中...</div>
    <div v-if="state.error.value" class="error">
      错误: {{ state.error.value.message }}
    </div>
  </div>
</template>

<script setup>
import { usePDFViewer } from '@ldesign/pdf-vue';

const { containerRef, state, actions } = usePDFViewer({
  pdfUrl: '/path/to/document.pdf',
  enableForms: true,
  enableSignatures: true,
  onPageChange: (page) => console.log('页面变化:', page)
});
</script>

<style>
.pdf-viewer-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.toolbar {
  padding: 10px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.pdf-container {
  flex: 1;
  position: relative;
}
</style>
```

## API文档

### PDFViewer组件

#### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `pdfUrl` | `string` | - | PDF文件URL |
| `style` | `object` | - | 容器样式对象 |
| `className` | `string` | - | 容器CSS类名 |
| `toolbar` | `boolean` | `true` | 是否显示工具栏 |
| `sidebar` | `boolean` | `false` | 是否显示侧边栏 |
| `initialScale` | `number` | `1.0` | 初始缩放级别 |
| `initialPage` | `number` | `1` | 初始页码 |
| `enableForms` | `boolean` | `true` | 启用表单功能 |
| `enableSignatures` | `boolean` | `true` | 启用签名功能 |
| `enableVirtualScroll` | `boolean` | `true` | 启用虚拟滚动 |
| `enableTouchGestures` | `boolean` | `true` | 启用触摸手势 |

#### Events

| 事件名 | 参数 | 描述 |
|--------|------|------|
| `page-change` | `(pageNum: number)` | 页面变化时触发 |
| `document-load` | `()` | 文档加载完成时触发 |
| `scale-change` | `(scale: number)` | 缩放级别变化时触发 |
| `error` | `(error: Error)` | 发生错误时触发 |
| `form-submit` | `(data: any)` | 表单提交时触发 |
| `signature-add` | `(signature: any)` | 添加签名时触发 |

#### Slots

| 插槽名 | 描述 |
|--------|------|
| `toolbar-items` | 自定义工具栏项目 |
| `sidebar` | 自定义侧边栏内容 |
| `loading` | 自定义加载状态 |
| `error` | 自定义错误状态 |

#### 公开方法

通过ref访问组件实例的方法：

```vue
<template>
  <PDFViewer ref="pdfViewerRef" />
</template>

<script setup>
import { ref, onMounted } from 'vue';

const pdfViewerRef = ref(null);

onMounted(async () => {
  // 加载PDF
  await pdfViewerRef.value.loadPDF('/new-document.pdf');
  
  // 跳转到指定页
  pdfViewerRef.value.goToPage(5);
  
  // 设置缩放
  pdfViewerRef.value.setScale(1.5);
  
  // 获取表单数据
  const formData = await pdfViewerRef.value.getFormData();
  
  // 填充表单
  await pdfViewerRef.value.fillForm({ name: 'John Doe' });
});
</script>
```

### usePDFViewer Composable

#### 参数

```typescript
interface UsePDFViewerOptions {
  pdfUrl?: string;
  container?: HTMLElement;
  initialScale?: number;
  initialPage?: number;
  enableForms?: boolean;
  enableSignatures?: boolean;
  enableVirtualScroll?: boolean;
  enableTouchGestures?: boolean;
  onPageChange?: (page: number) => void;
  onDocumentLoad?: () => void;
  onScaleChange?: (scale: number) => void;
  onError?: (error: Error) => void;
}
```

#### 返回值

```typescript
interface UsePDFViewerReturn {
  // Refs
  containerRef: Ref<HTMLDivElement | undefined>;
  viewer: Ref<PDFViewer | null>;
  formManager: Ref<FormManager | null>;
  signatureManager: Ref<SignatureManager | null>;
  
  // State
  state: {
    isLoading: Ref<boolean>;
    currentPage: Ref<number>;
    totalPages: Ref<number>;
    scale: Ref<number>;
    error: Ref<Error | null>;
  };
  
  // Actions
  actions: {
    loadPDF: (url: string) => Promise<void>;
    goToPage: (page: number) => void;
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
    exportToImage: (page: number, options?: any) => Promise<Blob>;
    search: (query: string) => Promise<any[]>;
    destroy: () => void;
  };
}
```

## 高级用法

### 表单处理

```vue
<template>
  <div>
    <button @click="autoFillForm">自动填充</button>
    <button @click="submitForm">提交表单</button>
    <PDFViewer
      ref="pdfViewer"
      :pdf-url="'/form.pdf'"
      :enable-forms="true"
      @form-submit="handleFormSubmit"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { PDFViewer } from '@ldesign/pdf-vue';

const pdfViewer = ref(null);

const autoFillForm = async () => {
  await pdfViewer.value.fillForm({
    name: 'John Doe',
    email: 'john@example.com',
    date: new Date().toISOString()
  });
};

const submitForm = async () => {
  const formData = await pdfViewer.value.getFormData();
  
  // 提交到服务器
  await fetch('/api/submit-form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
};

const handleFormSubmit = (data) => {
  console.log('表单提交:', data);
};
</script>
```

### 数字签名

```vue
<template>
  <div>
    <button @click="addSignature">添加签名</button>
    <PDFViewer
      ref="pdfViewer"
      :pdf-url="'/contract.pdf'"
      :enable-signatures="true"
      @signature-add="handleSignatureAdd"
    />
    <!-- 签名板组件 -->
    <SignaturePad ref="signaturePad" v-show="showSignaturePad" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { PDFViewer } from '@ldesign/pdf-vue';
import SignaturePad from './SignaturePad.vue';

const pdfViewer = ref(null);
const signaturePad = ref(null);
const showSignaturePad = ref(false);

const addSignature = async () => {
  showSignaturePad.value = true;
  
  // 获取签名数据
  const signatureData = await signaturePad.value.getSignature();
  
  // 添加到PDF
  await pdfViewer.value.addSignature(signatureData, {
    page: 1,
    x: 100,
    y: 500,
    width: 200,
    height: 50
  });
  
  showSignaturePad.value = false;
};

const handleSignatureAdd = (signature) => {
  console.log('签名已添加:', signature);
};
</script>
```

### 搜索功能

```vue
<template>
  <div>
    <div class="search-bar">
      <input
        v-model="searchQuery"
        @input="handleSearch"
        placeholder="搜索..."
      />
      <span v-if="searchResults.length">
        找到 {{ searchResults.length }} 个结果
      </span>
    </div>
    <div ref="containerRef" class="pdf-container"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { usePDFViewer } from '@ldesign/pdf-vue';

const searchQuery = ref('');
const searchResults = ref([]);

const { containerRef, actions } = usePDFViewer({
  pdfUrl: '/document.pdf'
});

const handleSearch = async () => {
  if (searchQuery.value.length > 2) {
    searchResults.value = await actions.search(searchQuery.value);
  }
};
</script>
```

### 导出功能

```vue
<template>
  <div>
    <button @click="exportCurrentPage">导出当前页</button>
    <button @click="exportAllPages">导出所有页</button>
    <PDFViewer ref="pdfViewer" :pdf-url="'/document.pdf'" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { PDFViewer } from '@ldesign/pdf-vue';

const pdfViewer = ref(null);

const exportCurrentPage = async () => {
  const blob = await pdfViewer.value.exportToImage(
    pdfViewer.value.state.currentPage, 
    { scale: 2, format: 'png' }
  );
  
  // 下载图片
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `page-${pdfViewer.value.state.currentPage}.png`;
  a.click();
  URL.revokeObjectURL(url);
};

const exportAllPages = async () => {
  const blob = await pdfViewer.value.exportToPDF({
    includeAnnotations: true,
    includeFormData: true
  });
  
  // 下载PDF
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'exported.pdf';
  a.click();
  URL.revokeObjectURL(url);
};
</script>
```

## TypeScript支持

该包完全使用TypeScript编写，提供完整的类型定义：

```typescript
import type { PDFViewerProps, UsePDFViewerOptions } from '@ldesign/pdf-vue';

const viewerProps: PDFViewerProps = {
  pdfUrl: '/document.pdf',
  toolbar: true,
  sidebar: false
};

const composableOptions: UsePDFViewerOptions = {
  enableForms: true,
  enableSignatures: true,
  onPageChange: (page: number) => console.log(page)
};
```

## 许可证

MIT


