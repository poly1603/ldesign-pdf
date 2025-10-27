# @ldesign/pdf-react

React组件和Hooks，用于集成企业级PDF查看器。

## 安装

```bash
npm install @ldesign/pdf-react @ldesign/pdf-core
# 或
pnpm add @ldesign/pdf-react @ldesign/pdf-core
# 或
yarn add @ldesign/pdf-react @ldesign/pdf-core
```

## 快速开始

### 使用PDFViewer组件

```tsx
import React from 'react';
import { PDFViewer } from '@ldesign/pdf-react';

function App() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <PDFViewer
        pdfUrl="/path/to/document.pdf"
        toolbar={true}
        sidebar={false}
        onPageChange={(page) => console.log('当前页:', page)}
        onDocumentLoad={() => console.log('文档加载完成')}
      />
    </div>
  );
}

export default App;
```

### 使用usePDFViewer Hook

```tsx
import React from 'react';
import { usePDFViewer } from '@ldesign/pdf-react';

function CustomPDFViewer() {
  const { containerRef, state, actions } = usePDFViewer({
    pdfUrl: '/path/to/document.pdf',
    enableForms: true,
    enableSignatures: true
  });

  return (
    <div>
      {/* 自定义工具栏 */}
      <div className="toolbar">
        <button onClick={actions.previousPage} disabled={state.currentPage <= 1}>
          上一页
        </button>
        <span>{state.currentPage} / {state.totalPages}</span>
        <button onClick={actions.nextPage} disabled={state.currentPage >= state.totalPages}>
          下一页
        </button>
        <button onClick={actions.zoomIn}>放大</button>
        <button onClick={actions.zoomOut}>缩小</button>
        <span>{Math.round(state.scale * 100)}%</span>
        <button onClick={actions.print}>打印</button>
        <button onClick={actions.download}>下载</button>
      </div>

      {/* PDF查看器容器 */}
      <div ref={containerRef} style={{ width: '100%', height: '600px' }} />

      {/* 加载状态 */}
      {state.isLoading && <div>加载中...</div>}
      {state.error && <div>错误: {state.error.message}</div>}
    </div>
  );
}

export default CustomPDFViewer;
```

## API文档

### PDFViewer组件

#### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `pdfUrl` | `string` | - | PDF文件URL |
| `style` | `CSSProperties` | - | 容器样式 |
| `className` | `string` | - | 容器CSS类名 |
| `toolbar` | `boolean \| ToolbarConfig` | `true` | 工具栏配置 |
| `sidebar` | `boolean \| SidebarConfig` | `false` | 侧边栏配置 |
| `initialScale` | `number` | `1.0` | 初始缩放级别 |
| `initialPage` | `number` | `1` | 初始页码 |
| `enableForms` | `boolean` | `true` | 启用表单功能 |
| `enableSignatures` | `boolean` | `true` | 启用签名功能 |
| `enableVirtualScroll` | `boolean` | `true` | 启用虚拟滚动 |
| `enableTouchGestures` | `boolean` | `true` | 启用触摸手势 |
| `onPageChange` | `(page: number) => void` | - | 页面变化回调 |
| `onDocumentLoad` | `() => void` | - | 文档加载完成回调 |
| `onScaleChange` | `(scale: number) => void` | - | 缩放变化回调 |
| `onError` | `(error: Error) => void` | - | 错误回调 |
| `onFormSubmit` | `(data: any) => void` | - | 表单提交回调 |
| `onSignatureAdd` | `(signature: any) => void` | - | 签名添加回调 |

### usePDFViewer Hook

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
  containerRef: RefObject<HTMLDivElement>;
  viewer: PDFViewer | null;
  formManager: FormManager | null;
  signatureManager: SignatureManager | null;
  
  // State
  state: {
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    scale: number;
    error: Error | null;
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

### 自定义工具栏

```tsx
import { PDFViewer } from '@ldesign/pdf-react';

function CustomToolbar() {
  return (
    <PDFViewer
      pdfUrl="/document.pdf"
      toolbar={{
        visible: true,
        items: ['zoom', 'navigation', 'print', 'download'],
        customItems: (
          <>
            <button>自定义按钮1</button>
            <button>自定义按钮2</button>
          </>
        )
      }}
    />
  );
}
```

### 表单处理

```tsx
import { usePDFViewer } from '@ldesign/pdf-react';

function PDFForm() {
  const { containerRef, formManager, actions } = usePDFViewer({
    pdfUrl: '/form.pdf',
    enableForms: true
  });

  const handleSubmit = async () => {
    if (formManager) {
      const data = await actions.getFormData();
      console.log('表单数据:', data);
      
      // 提交到服务器
      await fetch('/api/submit-form', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  };

  const handleFillForm = async () => {
    await actions.fillForm({
      name: 'John Doe',
      email: 'john@example.com',
      date: new Date().toISOString()
    });
  };

  return (
    <div>
      <button onClick={handleFillForm}>自动填充</button>
      <button onClick={handleSubmit}>提交表单</button>
      <div ref={containerRef} style={{ width: '100%', height: '600px' }} />
    </div>
  );
}
```

### 数字签名

```tsx
import { usePDFViewer } from '@ldesign/pdf-react';

function PDFWithSignature() {
  const { containerRef, actions } = usePDFViewer({
    pdfUrl: '/contract.pdf',
    enableSignatures: true
  });

  const handleAddSignature = async () => {
    // 获取签名数据（例如从签名板组件）
    const signatureData = await getSignatureFromUser();
    
    // 添加签名到PDF
    await actions.addSignature(signatureData, {
      page: 1,
      x: 100,
      y: 500,
      width: 200,
      height: 50
    });
  };

  return (
    <div>
      <button onClick={handleAddSignature}>添加签名</button>
      <div ref={containerRef} style={{ width: '100%', height: '600px' }} />
    </div>
  );
}
```

### 导出功能

```tsx
import { usePDFViewer } from '@ldesign/pdf-react';

function PDFExporter() {
  const { containerRef, actions, state } = usePDFViewer({
    pdfUrl: '/document.pdf'
  });

  const handleExportPage = async () => {
    const blob = await actions.exportToImage(state.currentPage, {
      scale: 2,
      format: 'png'
    });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `page-${state.currentPage}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    const blob = await actions.exportToPDF({
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

  return (
    <div>
      <button onClick={handleExportPage}>导出当前页为图片</button>
      <button onClick={handleExportPDF}>导出为PDF</button>
      <div ref={containerRef} style={{ width: '100%', height: '600px' }} />
    </div>
  );
}
```

## 样式自定义

组件使用标准的CSS类名，可以通过CSS覆盖默认样式：

```css
/* 自定义工具栏样式 */
.pdf-toolbar {
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  padding: 10px;
}

.pdf-toolbar-group {
  display: inline-flex;
  align-items: center;
  margin-right: 20px;
}

/* 自定义查看器容器 */
.pdf-viewer-container {
  background: #f0f0f0;
}

/* 自定义加载状态 */
.pdf-loading {
  color: #1890ff;
  font-size: 16px;
}
```

## TypeScript支持

该包完全使用TypeScript编写，提供完整的类型定义：

```tsx
import type { PDFViewerProps, UsePDFViewerOptions } from '@ldesign/pdf-react';

const viewerProps: PDFViewerProps = {
  pdfUrl: '/document.pdf',
  onPageChange: (page: number) => console.log(page)
};

const hookOptions: UsePDFViewerOptions = {
  enableForms: true,
  enableSignatures: true
};
```

## 许可证

MIT



