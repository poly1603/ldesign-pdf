# @ldesign/pdf-lit

基于Lit的Web Components PDF查看器组件，可在任何框架或原生JavaScript中使用。

## 安装

```bash
npm install @ldesign/pdf-lit @ldesign/pdf-core
# 或
pnpm add @ldesign/pdf-lit @ldesign/pdf-core
# 或
yarn add @ldesign/pdf-lit @ldesign/pdf-core
```

## 快速开始

### 在HTML中使用

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import '@ldesign/pdf-lit';
  </script>
</head>
<body>
  <pdf-viewer 
    pdf-url="/path/to/document.pdf"
    show-toolbar="true"
    show-sidebar="false"
    initial-scale="1.5"
  ></pdf-viewer>

  <script>
    const viewer = document.querySelector('pdf-viewer');
    
    // 监听事件
    viewer.addEventListener('page-change', (e) => {
      console.log('当前页:', e.detail);
    });
    
    viewer.addEventListener('document-load', () => {
      console.log('文档加载完成');
    });
  </script>
</body>
</html>
```

### 在JavaScript中使用

```javascript
import '@ldesign/pdf-lit';

// 创建元素
const viewer = document.createElement('pdf-viewer');
viewer.setAttribute('pdf-url', '/path/to/document.pdf');
viewer.setAttribute('show-toolbar', 'true');

// 添加到DOM
document.getElementById('container').appendChild(viewer);

// 调用方法
viewer.goToPage(5);
viewer.zoomIn();
viewer.print();

// 监听事件
viewer.addEventListener('page-change', (e) => {
  console.log('页面变化:', e.detail);
});
```

### 在React中使用

```jsx
import React, { useEffect, useRef } from 'react';
import '@ldesign/pdf-lit';

function App() {
  const viewerRef = useRef(null);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handlePageChange = (e) => {
      console.log('页面变化:', e.detail);
    };

    viewer.addEventListener('page-change', handlePageChange);
    
    return () => {
      viewer.removeEventListener('page-change', handlePageChange);
    };
  }, []);

  return (
    <pdf-viewer
      ref={viewerRef}
      pdf-url="/document.pdf"
      show-toolbar="true"
      initial-scale="1.5"
    ></pdf-viewer>
  );
}
```

### 在Vue中使用

```vue
<template>
  <pdf-viewer
    ref="viewer"
    :pdf-url="pdfUrl"
    show-toolbar="true"
    @page-change="handlePageChange"
    @document-load="handleDocumentLoad"
  ></pdf-viewer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import '@ldesign/pdf-lit';

const pdfUrl = ref('/document.pdf');
const viewer = ref(null);

const handlePageChange = (e) => {
  console.log('页面变化:', e.detail);
};

const handleDocumentLoad = () => {
  console.log('文档加载完成');
};

onMounted(() => {
  // 可以调用组件方法
  if (viewer.value) {
    viewer.value.goToPage(2);
  }
});
</script>
```

### 在Angular中使用

```typescript
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import '@ldesign/pdf-lit';

@Component({
  selector: 'app-root',
  template: `
    <pdf-viewer
      #pdfViewer
      pdf-url="/document.pdf"
      show-toolbar="true"
      (page-change)="onPageChange($event)"
      (document-load)="onDocumentLoad()"
    ></pdf-viewer>
  `
})
export class AppComponent implements AfterViewInit {
  @ViewChild('pdfViewer') pdfViewer!: ElementRef;

  ngAfterViewInit() {
    const viewer = this.pdfViewer.nativeElement;
    
    // 调用方法
    viewer.goToPage(3);
  }

  onPageChange(event: CustomEvent) {
    console.log('页面变化:', event.detail);
  }

  onDocumentLoad() {
    console.log('文档加载完成');
  }
}
```

## API文档

### 属性 (Attributes)

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `pdf-url` | `string` | - | PDF文件URL |
| `show-toolbar` | `boolean` | `true` | 是否显示工具栏 |
| `show-sidebar` | `boolean` | `false` | 是否显示侧边栏 |
| `initial-scale` | `number` | `1.0` | 初始缩放级别 |
| `initial-page` | `number` | `1` | 初始页码 |
| `enable-forms` | `boolean` | `true` | 启用表单功能 |
| `enable-signatures` | `boolean` | `true` | 启用签名功能 |
| `enable-virtual-scroll` | `boolean` | `true` | 启用虚拟滚动 |
| `enable-touch-gestures` | `boolean` | `true` | 启用触摸手势 |

### 方法 (Methods)

```javascript
const viewer = document.querySelector('pdf-viewer');

// 加载PDF
await viewer.loadPDF('/new-document.pdf');

// 页面导航
viewer.goToPage(5);
viewer.nextPage();
viewer.previousPage();

// 缩放控制
viewer.zoomIn();
viewer.zoomOut();
viewer.setScale(1.5);

// 打印和下载
viewer.print();
viewer.download();

// 表单操作
const formData = await viewer.getFormData();
await viewer.fillForm({ name: 'John Doe' });

// 签名操作
await viewer.addSignature(signatureData, {
  page: 1,
  x: 100,
  y: 200,
  width: 200,
  height: 50
});

// 导出功能
const pdfBlob = await viewer.exportToPDF();
const imageBlob = await viewer.exportToImage(1, { scale: 2 });
```

### 事件 (Events)

| 事件名 | 详情类型 | 描述 |
|--------|----------|------|
| `page-change` | `number` | 页面变化时触发 |
| `document-load` | `void` | 文档加载完成时触发 |
| `scale-change` | `number` | 缩放级别变化时触发 |
| `error` | `Error` | 发生错误时触发 |
| `form-submit` | `any` | 表单提交时触发 |
| `signature-add` | `any` | 添加签名时触发 |

### 插槽 (Slots)

| 插槽名 | 描述 |
|--------|------|
| `toolbar-items` | 自定义工具栏项目 |
| `sidebar` | 自定义侧边栏内容 |
| `loading` | 自定义加载状态 |
| `error` | 自定义错误状态 |

### CSS Parts

使用CSS Parts自定义样式：

```css
pdf-viewer::part(container) {
  background: #f0f0f0;
}

pdf-viewer::part(toolbar) {
  background: #333;
  color: white;
}

pdf-viewer::part(sidebar) {
  width: 300px;
  background: #f9f9f9;
}

pdf-viewer::part(viewer) {
  border: 2px solid #ddd;
}
```

## 高级用法

### 自定义工具栏

```html
<pdf-viewer pdf-url="/document.pdf">
  <div slot="toolbar-items">
    <button id="custom-btn">自定义操作</button>
  </div>
</pdf-viewer>

<script>
  document.getElementById('custom-btn').addEventListener('click', () => {
    const viewer = document.querySelector('pdf-viewer');
    // 执行自定义操作
    viewer.goToPage(10);
  });
</script>
```

### 表单处理

```html
<pdf-viewer id="form-viewer" pdf-url="/form.pdf" enable-forms="true"></pdf-viewer>

<button id="fill-btn">自动填充</button>
<button id="submit-btn">提交表单</button>

<script>
  const viewer = document.getElementById('form-viewer');
  
  document.getElementById('fill-btn').addEventListener('click', async () => {
    await viewer.fillForm({
      name: 'John Doe',
      email: 'john@example.com',
      date: new Date().toISOString()
    });
  });
  
  document.getElementById('submit-btn').addEventListener('click', async () => {
    const formData = await viewer.getFormData();
    
    // 提交到服务器
    await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
  });
  
  viewer.addEventListener('form-submit', (e) => {
    console.log('表单提交:', e.detail);
  });
</script>
```

### 数字签名

```html
<pdf-viewer id="signature-viewer" pdf-url="/contract.pdf" enable-signatures="true"></pdf-viewer>

<canvas id="signature-pad"></canvas>
<button id="add-signature">添加签名</button>

<script>
  const viewer = document.getElementById('signature-viewer');
  const signaturePad = document.getElementById('signature-pad');
  
  document.getElementById('add-signature').addEventListener('click', async () => {
    // 从签名板获取签名数据
    const signatureData = signaturePad.toDataURL();
    
    // 添加到PDF
    await viewer.addSignature(signatureData, {
      page: 1,
      x: 100,
      y: 500,
      width: 200,
      height: 50
    });
  });
  
  viewer.addEventListener('signature-add', (e) => {
    console.log('签名已添加:', e.detail);
  });
</script>
```

### 自定义样式

```css
/* 全局样式 */
pdf-viewer {
  --pdf-toolbar-bg: #2c3e50;
  --pdf-toolbar-color: #ecf0f1;
  --pdf-sidebar-width: 280px;
  --pdf-border-color: #bdc3c7;
}

/* 使用CSS Parts */
pdf-viewer::part(toolbar) {
  background: var(--pdf-toolbar-bg);
  color: var(--pdf-toolbar-color);
  padding: 15px;
}

pdf-viewer::part(sidebar) {
  width: var(--pdf-sidebar-width);
  border-right: 1px solid var(--pdf-border-color);
}

/* 自定义加载状态 */
pdf-viewer .pdf-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #3498db;
}

/* 响应式设计 */
@media (max-width: 768px) {
  pdf-viewer::part(sidebar) {
    display: none;
  }
  
  pdf-viewer::part(toolbar) {
    flex-direction: column;
    gap: 10px;
  }
}
```

### TypeScript支持

```typescript
import '@ldesign/pdf-lit';
import type { PDFViewer } from '@ldesign/pdf-lit';

// 类型安全的元素引用
const viewer = document.querySelector<PDFViewer>('pdf-viewer');

if (viewer) {
  // TypeScript知道所有可用的方法和属性
  viewer.goToPage(5);
  viewer.zoomIn();
  
  // 类型安全的事件监听
  viewer.addEventListener('page-change', (e: CustomEvent<number>) => {
    const pageNum: number = e.detail;
    console.log('页码:', pageNum);
  });
  
  // 异步操作
  (async () => {
    const formData = await viewer.getFormData();
    await viewer.fillForm({ name: 'John' });
  })();
}
```

## 浏览器支持

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 支持所有支持Web Components的现代浏览器

## 许可证

MIT


