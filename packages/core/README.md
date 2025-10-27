# @ldesign/pdf-core

企业级PDF查看器核心库，提供强大的PDF渲染和管理功能。

## 特性

- 🚀 高性能PDF渲染
- 📝 表单填写与管理
- ✍️ 数字签名支持
- 🔍 全文搜索
- 📄 虚拟滚动
- 👆 触摸手势
- ⌨️ 键盘快捷键
- 📊 性能监控
- 🎨 自定义UI组件

## 安装

```bash
npm install @ldesign/pdf-core
# 或
pnpm add @ldesign/pdf-core
# 或
yarn add @ldesign/pdf-core
```

## 使用

### 基础使用

```javascript
import { PDFViewer } from '@ldesign/pdf-core';

// 创建PDF查看器
const viewer = new PDFViewer({
  container: document.getElementById('pdf-container'),
  pdfUrl: 'path/to/document.pdf',
  initialScale: 1.5
});

// 加载PDF
await viewer.loadPDF('path/to/document.pdf');

// 事件监听
viewer.on('page-change', (pageNum) => {
  console.log('当前页码:', pageNum);
});
```

### 高级使用

```javascript
import { createEnhancedPDFViewer } from '@ldesign/pdf-core';

// 创建增强型查看器
const { 
  viewer, 
  formManager, 
  signatureManager,
  exportManager 
} = await createEnhancedPDFViewer({
  container: document.getElementById('pdf-container'),
  pdfUrl: 'path/to/document.pdf',
  enableForms: true,
  enableSignatures: true,
  enableExport: true,
  enableVirtualScroll: true,
  enableTouchGestures: true
});

// 使用表单管理器
const formData = await formManager.getFormData();
await formManager.fillForm({
  name: 'John Doe',
  date: new Date()
});

// 使用签名管理器
await signatureManager.addSignature(signatureData, {
  page: 1,
  x: 100,
  y: 200,
  width: 200,
  height: 50
});

// 导出PDF
await exportManager.exportToPDF({
  includeAnnotations: true,
  includeFormData: true
});
```

## API文档

### PDFViewer

主要的PDF查看器类。

#### 构造函数选项

- `container`: HTMLElement - 容器元素
- `pdfUrl`: string - PDF文件URL（可选）
- `initialScale`: number - 初始缩放级别（默认：1.0）
- `initialPage`: number - 初始页码（默认：1）
- `enableTextLayer`: boolean - 启用文本层（默认：true）
- `enableAnnotationLayer`: boolean - 启用注释层（默认：true）

#### 方法

- `loadPDF(url: string)`: 加载PDF文件
- `goToPage(pageNum: number)`: 跳转到指定页
- `setScale(scale: number)`: 设置缩放级别
- `print()`: 打印PDF
- `download()`: 下载PDF
- `destroy()`: 销毁查看器

#### 事件

- `document-loaded`: 文档加载完成
- `page-change`: 页面变化
- `scale-change`: 缩放变化
- `error`: 错误发生

### FormManager

表单管理器，处理PDF表单。

```javascript
const formManager = new FormManager(pdfDocument);

// 获取表单数据
const data = await formManager.getFormData();

// 填充表单
await formManager.fillForm(data);

// 验证表单
const isValid = await formManager.validateForm();

// 提交表单
await formManager.submitForm(url);
```

### SignatureManager

签名管理器，处理数字签名。

```javascript
const signatureManager = new SignatureManager();

// 添加签名
await signatureManager.addSignature(signatureData, position);

// 验证签名
const isValid = await signatureManager.verifySignature(signatureId);

// 删除签名
await signatureManager.removeSignature(signatureId);
```

## 性能优化

### 虚拟滚动

对于大型PDF文档，启用虚拟滚动以提高性能：

```javascript
import { VirtualScroller } from '@ldesign/pdf-core';

const virtualScroller = new VirtualScroller({
  container: document.getElementById('pdf-container'),
  itemHeight: 1000,
  bufferSize: 3
});
```

### 页面缓存

使用页面缓存管理器优化内存使用：

```javascript
import { PageCacheManager } from '@ldesign/pdf-core';

const cacheManager = new PageCacheManager({
  maxCacheSize: 50, // MB
  maxPages: 10
});
```

## 许可证

MIT



