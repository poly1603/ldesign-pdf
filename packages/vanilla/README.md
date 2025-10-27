# @ldesign/pdf-vanilla

纯JavaScript PDF查看器，无需任何框架，开箱即用。

## 特性

- 🚀 零依赖框架，纯JavaScript实现
- 📦 体积小巧，性能优异
- 🎨 自动创建工具栏和侧边栏
- 🔧 高度可配置和可扩展
- 📱 支持移动端触摸手势
- 💪 完整的TypeScript类型支持

## 安装

```bash
npm install @ldesign/pdf-vanilla @ldesign/pdf-core
# 或
pnpm add @ldesign/pdf-vanilla @ldesign/pdf-core
# 或
yarn add @ldesign/pdf-vanilla @ldesign/pdf-core
```

### CDN引入

```html
<!-- 通过CDN引入 -->
<script src="https://unpkg.com/@ldesign/pdf-vanilla@latest/dist/index.umd.js"></script>

<!-- 压缩版本 -->
<script src="https://unpkg.com/@ldesign/pdf-vanilla@latest/dist/index.min.js"></script>
```

## 快速开始

### 基础使用

```html
<!DOCTYPE html>
<html>
<head>
  <title>PDF Viewer</title>
  <style>
    #pdf-container {
      width: 100%;
      height: 100vh;
    }
  </style>
</head>
<body>
  <div id="pdf-container"></div>

  <script type="module">
    import { PDFViewerVanilla } from '@ldesign/pdf-vanilla';

    const viewer = new PDFViewerVanilla({
      container: '#pdf-container',
      pdfUrl: 'document.pdf',
      createToolbar: true,
      createSidebar: false,
      onPageChange: (page) => console.log('当前页:', page),
      onDocumentLoad: () => console.log('文档加载完成')
    });

    await viewer.init();
  </script>
</body>
</html>
```

### CDN使用

```html
<!DOCTYPE html>
<html>
<head>
  <title>PDF Viewer</title>
  <style>
    #pdf-container {
      width: 100%;
      height: 100vh;
    }
  </style>
</head>
<body>
  <div id="pdf-container"></div>

  <script src="https://unpkg.com/@ldesign/pdf-vanilla@latest/dist/index.umd.js"></script>
  <script>
    const viewer = new PDFViewer.PDFViewerVanilla({
      container: '#pdf-container',
      pdfUrl: 'document.pdf',
      createToolbar: true,
      onPageChange: function(page) {
        console.log('当前页:', page);
      }
    });

    viewer.init().then(function() {
      console.log('初始化完成');
    });
  </script>
</body>
</html>
```

## API文档

### 构造函数

```javascript
const viewer = new PDFViewerVanilla(config);
```

#### 配置选项 (PDFViewerConfig)

```typescript
interface PDFViewerConfig {
  // 容器元素或CSS选择器
  container: HTMLElement | string;
  
  // PDF文件URL
  pdfUrl?: string;
  
  // UI配置
  createToolbar?: boolean;        // 是否创建工具栏（默认：false）
  createSidebar?: boolean;        // 是否创建侧边栏（默认：false）
  
  // 工具栏配置
  toolbarConfig?: {
    items?: string[];             // 工具栏项目
    customButtons?: Array<{       // 自定义按钮
      id: string;
      label: string;
      icon?: string;
      onClick: () => void;
    }>;
  };
  
  // 侧边栏配置
  sidebarConfig?: {
    panels?: string[];            // 侧边栏面板
    width?: number;               // 宽度（默认：250px）
    defaultPanel?: string;        // 默认面板
  };
  
  // 查看器选项
  initialScale?: number;          // 初始缩放（默认：1.0）
  initialPage?: number;           // 初始页码（默认：1）
  enableForms?: boolean;          // 启用表单（默认：true）
  enableSignatures?: boolean;     // 启用签名（默认：true）
  enableVirtualScroll?: boolean;  // 启用虚拟滚动（默认：true）
  enableTouchGestures?: boolean;  // 启用触摸手势（默认：true）
  
  // 事件回调
  onPageChange?: (pageNum: number) => void;
  onDocumentLoad?: () => void;
  onError?: (error: Error) => void;
  onScaleChange?: (scale: number) => void;
  onFormSubmit?: (data: any) => void;
  onSignatureAdd?: (signature: any) => void;
}
```

### 方法

#### 初始化

```javascript
await viewer.init();
```

#### 导航控制

```javascript
// 跳转到指定页
viewer.goToPage(5);

// 下一页
viewer.nextPage();

// 上一页
viewer.previousPage();
```

#### 缩放控制

```javascript
// 放大
viewer.zoomIn();

// 缩小
viewer.zoomOut();

// 设置缩放级别
viewer.setScale(1.5);
```

#### 文档操作

```javascript
// 加载新PDF
await viewer.loadPDF('new-document.pdf');

// 打印
viewer.print();

// 下载
viewer.download();
```

#### 表单操作

```javascript
// 获取表单数据
const formData = await viewer.getFormData();

// 填充表单
await viewer.fillForm({
  name: 'John Doe',
  email: 'john@example.com'
});
```

#### 签名操作

```javascript
// 添加签名
await viewer.addSignature(signatureData, {
  page: 1,
  x: 100,
  y: 200,
  width: 200,
  height: 50
});
```

#### 导出功能

```javascript
// 导出为PDF
const pdfBlob = await viewer.exportToPDF({
  includeAnnotations: true,
  includeFormData: true
});

// 导出页面为图片
const imageBlob = await viewer.exportToImage(1, {
  scale: 2,
  format: 'png'
});
```

#### 销毁

```javascript
viewer.destroy();
```

### 属性 (Getters)

```javascript
// 是否已初始化
const ready = viewer.isReady;

// 当前页码
const page = viewer.currentPageNumber;

// 总页数
const total = viewer.totalPageCount;

// 当前缩放
const scale = viewer.currentScale;

// 是否正在加载
const loading = viewer.loading;

// 最后的错误
const error = viewer.lastError;
```

## 使用示例

### 带自定义工具栏

```javascript
const viewer = new PDFViewerVanilla({
  container: '#pdf-container',
  pdfUrl: 'document.pdf',
  createToolbar: true,
  toolbarConfig: {
    customButtons: [
      {
        id: 'fullscreen',
        label: '全屏',
        onClick: () => {
          document.documentElement.requestFullscreen();
        }
      },
      {
        id: 'rotate',
        label: '旋转',
        onClick: () => {
          console.log('旋转页面');
        }
      }
    ]
  }
});

await viewer.init();
```

### 表单处理

```javascript
const viewer = new PDFViewerVanilla({
  container: '#pdf-container',
  pdfUrl: 'form.pdf',
  createToolbar: true,
  enableForms: true,
  onFormSubmit: async (data) => {
    console.log('表单数据:', data);
    
    // 提交到服务器
    await fetch('/api/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
});

await viewer.init();

// 自动填充表单
document.getElementById('fill-form').addEventListener('click', async () => {
  await viewer.fillForm({
    name: 'John Doe',
    email: 'john@example.com',
    date: new Date().toISOString()
  });
});

// 获取表单数据
document.getElementById('get-data').addEventListener('click', async () => {
  const data = await viewer.getFormData();
  console.log('表单数据:', data);
});
```

### 数字签名

```javascript
const viewer = new PDFViewerVanilla({
  container: '#pdf-container',
  pdfUrl: 'contract.pdf',
  createToolbar: true,
  enableSignatures: true,
  onSignatureAdd: (signature) => {
    console.log('签名已添加:', signature);
  }
});

await viewer.init();

// 添加签名
document.getElementById('add-signature').addEventListener('click', async () => {
  // 从签名板获取签名数据
  const signatureData = signaturePad.toDataURL();
  
  await viewer.addSignature(signatureData, {
    page: 1,
    x: 100,
    y: 500,
    width: 200,
    height: 50
  });
});
```

### 导出功能

```javascript
const viewer = new PDFViewerVanilla({
  container: '#pdf-container',
  pdfUrl: 'document.pdf',
  createToolbar: true
});

await viewer.init();

// 导出当前页为图片
document.getElementById('export-page').addEventListener('click', async () => {
  const blob = await viewer.exportToImage(viewer.currentPageNumber, {
    scale: 2,
    format: 'png'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `page-${viewer.currentPageNumber}.png`;
  a.click();
  URL.revokeObjectURL(url);
});

// 导出整个PDF
document.getElementById('export-pdf').addEventListener('click', async () => {
  const blob = await viewer.exportToPDF({
    includeAnnotations: true,
    includeFormData: true
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'exported.pdf';
  a.click();
  URL.revokeObjectURL(url);
});
```

### 响应式设计

```javascript
const viewer = new PDFViewerVanilla({
  container: '#pdf-container',
  pdfUrl: 'document.pdf',
  createToolbar: true,
  createSidebar: window.innerWidth > 768 // 仅在桌面显示侧边栏
});

await viewer.init();

// 监听窗口大小变化
window.addEventListener('resize', () => {
  // 根据屏幕大小调整缩放
  if (window.innerWidth < 768) {
    viewer.setScale(0.8);
  } else {
    viewer.setScale(1.0);
  }
});
```

### 错误处理

```javascript
const viewer = new PDFViewerVanilla({
  container: '#pdf-container',
  pdfUrl: 'document.pdf',
  createToolbar: true,
  onError: (error) => {
    console.error('PDF错误:', error);
    
    // 显示错误消息
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px;
      background: #f44336;
      color: white;
      border-radius: 4px;
    `;
    errorDiv.textContent = `错误: ${error.message}`;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 5000);
  }
});

try {
  await viewer.init();
} catch (error) {
  console.error('初始化失败:', error);
}
```

### 多个查看器实例

```javascript
// 创建多个PDF查看器
const viewer1 = new PDFViewerVanilla({
  container: '#pdf-container-1',
  pdfUrl: 'document1.pdf',
  createToolbar: true
});

const viewer2 = new PDFViewerVanilla({
  container: '#pdf-container-2',
  pdfUrl: 'document2.pdf',
  createToolbar: true
});

await Promise.all([
  viewer1.init(),
  viewer2.init()
]);

// 同步页面
viewer1.onPageChange = (page) => {
  viewer2.goToPage(page);
};

viewer2.onPageChange = (page) => {
  viewer1.goToPage(page);
};
```

## TypeScript支持

完整的TypeScript类型定义：

```typescript
import { PDFViewerVanilla, PDFViewerConfig } from '@ldesign/pdf-vanilla';

const config: PDFViewerConfig = {
  container: '#pdf-container',
  pdfUrl: 'document.pdf',
  createToolbar: true,
  initialScale: 1.5,
  onPageChange: (page: number) => {
    console.log('页码:', page);
  },
  onError: (error: Error) => {
    console.error('错误:', error);
  }
};

const viewer = new PDFViewerVanilla(config);

(async () => {
  await viewer.init();
  
  // 类型安全的方法调用
  viewer.goToPage(5);
  viewer.setScale(1.2);
  
  const formData = await viewer.getFormData();
  console.log('表单数据:', formData);
})();
```

## 浏览器支持

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## 许可证

MIT

