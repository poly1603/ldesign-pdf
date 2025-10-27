# PDF Monorepo 快速启动指南

## 🎉 项目改造完成

PDF项目已成功改造为monorepo工作空间，支持多框架（React、Vue、Lit、Vanilla JS）。

## 📦 项目结构

```
pdf/
├── packages/          # 5个独立的包
│   ├── core/         # @ldesign/pdf-core - 核心库
│   ├── react/        # @ldesign/pdf-react - React组件
│   ├── vue/          # @ldesign/pdf-vue - Vue组件
│   ├── lit/          # @ldesign/pdf-lit - Web Components
│   └── vanilla/      # @ldesign/pdf-vanilla - 原生JS
└── examples/         # 4个示例项目
    ├── react-demo/
    ├── vue-demo/
    ├── lit-demo/
    └── vanilla-demo/
```

## 🚀 立即开始

### 步骤1: 安装依赖

```bash
cd D:\WorkBench\ldesign\libraries\pdf
pnpm install
```

### 步骤2: 构建所有包

```bash
pnpm build
```

这会依次构建：
- ✅ @ldesign/pdf-core
- ✅ @ldesign/pdf-react
- ✅ @ldesign/pdf-vue
- ✅ @ldesign/pdf-lit
- ✅ @ldesign/pdf-vanilla

### 步骤3: 运行示例

打开新的终端窗口运行你想测试的示例：

**React示例:**
```bash
pnpm example:react
# 访问 http://localhost:3000
```

**Vue示例:**
```bash
pnpm example:vue
# 访问 http://localhost:3001
```

**Lit示例:**
```bash
pnpm example:lit
# 访问 http://localhost:3002
```

**Vanilla示例:**
```bash
pnpm example:vanilla
# 访问 http://localhost:3003
```

## 💡 使用方法

### React

```tsx
import { PDFViewer } from '@ldesign/pdf-react';

function App() {
  return (
    <PDFViewer
      pdfUrl="/sample.pdf"
      toolbar={true}
      onPageChange={(page) => console.log(page)}
    />
  );
}
```

### Vue

```vue
<template>
  <PDFViewer
    :pdf-url="pdfUrl"
    :toolbar="true"
    @page-change="handlePageChange"
  />
</template>

<script setup>
import { PDFViewer } from '@ldesign/pdf-vue';
const pdfUrl = '/sample.pdf';
</script>
```

### Lit (Web Components)

```html
<script type="module">
  import '@ldesign/pdf-lit';
</script>

<pdf-viewer 
  pdf-url="/sample.pdf"
  show-toolbar="true"
></pdf-viewer>
```

### Vanilla JavaScript

```javascript
import { PDFViewerVanilla } from '@ldesign/pdf-vanilla';

const viewer = new PDFViewerVanilla({
  container: '#pdf-container',
  pdfUrl: '/sample.pdf',
  createToolbar: true
});

await viewer.init();
```

## 🔧 常用命令

```bash
# 构建
pnpm build              # 构建所有包
pnpm build:core        # 只构建核心包
pnpm build:react       # 只构建React包

# 开发
pnpm dev               # 所有包监听模式

# 测试
pnpm test              # 运行所有测试
pnpm typecheck         # 类型检查

# 示例
pnpm example:react     # 运行React示例
pnpm example:vue       # 运行Vue示例
```

## 📚 文档链接

- [项目结构说明](./PROJECT_STRUCTURE.md)
- [核心包文档](./packages/core/README.md)
- [React包文档](./packages/react/README.md)
- [Vue包文档](./packages/vue/README.md)
- [Lit包文档](./packages/lit/README.md)
- [Vanilla包文档](./packages/vanilla/README.md)

## ⚠️ 注意事项

1. **首次使用**: 必须先运行 `pnpm build` 构建所有包
2. **修改核心包**: 修改core包后需要重新构建
3. **PDF文件**: 示例需要 `sample.pdf` 文件（放在public目录）
4. **端口冲突**: 如果端口被占用，可以修改各示例的 `vite.config.ts`

## 🎯 下一步

1. ✅ 查看示例项目了解使用方法
2. ✅ 阅读各包的README了解详细API
3. ✅ 根据需求选择合适的包
4. ✅ 在你的项目中集成使用

## 💬 需要帮助？

- 查看各包的README文档
- 参考examples目录下的示例代码
- 查看核心包的类型定义

---

**状态**: ✅ 所有功能已完成
**版本**: 2.0.0
**创建时间**: 2025-10-27

