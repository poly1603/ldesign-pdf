# PDF Monorepo 项目结构说明

## ✅ 项目已完成改造

PDF项目已成功改造为monorepo工作空间架构，支持多框架使用。

## 📦 包结构

```
pdf/
├── packages/                          # 所有包
│   ├── core/                         # @ldesign/pdf-core - 核心包
│   │   ├── src/                      # 源代码
│   │   │   ├── core/                 # 核心模块
│   │   │   ├── features/             # 功能模块
│   │   │   ├── ui/                   # UI组件
│   │   │   ├── utils/                # 工具函数
│   │   │   ├── types/                # 类型定义
│   │   │   ├── styles/               # 样式文件
│   │   │   └── index.ts              # 入口文件
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── rollup.config.js
│   │   └── README.md
│   │
│   ├── react/                        # @ldesign/pdf-react - React包
│   │   ├── src/
│   │   │   ├── PDFViewer.tsx         # React组件
│   │   │   ├── hooks/                # React Hooks
│   │   │   │   └── usePDFViewer.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── rollup.config.js
│   │   └── README.md
│   │
│   ├── vue/                          # @ldesign/pdf-vue - Vue包
│   │   ├── src/
│   │   │   ├── PDFViewer.vue         # Vue组件
│   │   │   ├── composables/          # Composition API
│   │   │   │   └── usePDFViewer.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── rollup.config.js
│   │   └── README.md
│   │
│   ├── lit/                          # @ldesign/pdf-lit - Lit包
│   │   ├── src/
│   │   │   ├── pdf-viewer.ts         # Web Component
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── rollup.config.js
│   │   └── README.md
│   │
│   └── vanilla/                      # @ldesign/pdf-vanilla - 原生JS包
│       ├── src/
│       │   ├── PDFViewerVanilla.ts   # Vanilla包装器
│       │   └── index.ts
│       ├── package.json
│       ├── tsconfig.json
│       ├── rollup.config.js
│       └── README.md
│
├── examples/                          # 示例项目
│   ├── react-demo/                   # React示例
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   ├── App.css
│   │   │   └── index.css
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── vue-demo/                     # Vue示例
│   │   ├── src/
│   │   │   ├── App.vue
│   │   │   ├── main.ts
│   │   │   └── style.css
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── lit-demo/                     # Lit示例
│   │   ├── src/
│   │   │   └── main.ts
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── vanilla-demo/                 # Vanilla示例
│       ├── src/
│       │   └── main.ts
│       ├── index.html
│       ├── package.json
│       └── vite.config.ts
│
├── package.json                       # 根package.json
├── pnpm-workspace.yaml               # workspace配置
└── README.md                         # 项目文档
```

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 构建所有包

```bash
# 构建所有包
pnpm build

# 或构建单个包
pnpm build:core
pnpm build:react
pnpm build:vue
pnpm build:lit
pnpm build:vanilla
```

### 3. 运行示例

```bash
# React示例 (端口 3000)
pnpm example:react

# Vue示例 (端口 3001)
pnpm example:vue

# Lit示例 (端口 3002)
pnpm example:lit

# Vanilla示例 (端口 3003)
pnpm example:vanilla
```

## 📖 包说明

### @ldesign/pdf-core

核心PDF查看器库，提供所有基础功能：

- PDF渲染和显示
- 页面缓存管理
- 性能监控
- 表单管理
- 签名管理
- 搜索功能
- 导出功能
- 虚拟滚动
- 触摸手势
- 键盘导航

**安装:**
```bash
npm install @ldesign/pdf-core
```

**文档:** [packages/core/README.md](./packages/core/README.md)

---

### @ldesign/pdf-react

React组件和Hooks：

- `<PDFViewer>` - React组件
- `usePDFViewer()` - React Hook

**安装:**
```bash
npm install @ldesign/pdf-react @ldesign/pdf-core
```

**使用:**
```tsx
import { PDFViewer } from '@ldesign/pdf-react';

<PDFViewer pdfUrl="/document.pdf" toolbar={true} />
```

**文档:** [packages/react/README.md](./packages/react/README.md)

---

### @ldesign/pdf-vue

Vue 3组件和Composables：

- `<PDFViewer>` - Vue组件
- `usePDFViewer()` - Composition API

**安装:**
```bash
npm install @ldesign/pdf-vue @ldesign/pdf-core
```

**使用:**
```vue
<template>
  <PDFViewer :pdf-url="pdfUrl" :toolbar="true" />
</template>

<script setup>
import { PDFViewer } from '@ldesign/pdf-vue';
</script>
```

**文档:** [packages/vue/README.md](./packages/vue/README.md)

---

### @ldesign/pdf-lit

Lit Web Components：

- `<pdf-viewer>` - Web Component

**安装:**
```bash
npm install @ldesign/pdf-lit @ldesign/pdf-core
```

**使用:**
```html
<script type="module">
  import '@ldesign/pdf-lit';
</script>

<pdf-viewer pdf-url="/document.pdf" show-toolbar="true"></pdf-viewer>
```

**文档:** [packages/lit/README.md](./packages/lit/README.md)

---

### @ldesign/pdf-vanilla

原生JavaScript包装器：

- `PDFViewerVanilla` - 类接口

**安装:**
```bash
npm install @ldesign/pdf-vanilla @ldesign/pdf-core
```

**使用:**
```javascript
import { PDFViewerVanilla } from '@ldesign/pdf-vanilla';

const viewer = new PDFViewerVanilla({
  container: '#pdf-container',
  pdfUrl: '/document.pdf',
  createToolbar: true
});

await viewer.init();
```

**文档:** [packages/vanilla/README.md](./packages/vanilla/README.md)

---

## 🛠️ 开发命令

```bash
# 安装依赖
pnpm install

# 构建
pnpm build                  # 构建所有包
pnpm build:core            # 构建核心包
pnpm build:react           # 构建React包
pnpm build:vue             # 构建Vue包
pnpm build:lit             # 构建Lit包
pnpm build:vanilla         # 构建Vanilla包

# 开发模式（监听变化）
pnpm dev

# 测试
pnpm test                  # 运行所有测试
pnpm test:watch           # 监听模式测试

# 类型检查
pnpm typecheck            # 所有包类型检查

# 运行示例
pnpm example:react        # React示例
pnpm example:vue          # Vue示例
pnpm example:lit          # Lit示例
pnpm example:vanilla      # Vanilla示例

# 清理
pnpm clean                # 清理所有构建产物
```

## 📝 开发工作流

### 1. 修改核心包

```bash
# 修改 packages/core/src 下的文件
cd packages/core
pnpm build

# 其他包会自动使用最新的核心包（workspace:*）
```

### 2. 修改框架包

```bash
# 修改对应框架包
cd packages/react  # 或 vue / lit / vanilla
pnpm build

# 在示例中测试
cd ../../examples/react-demo
pnpm dev
```

### 3. 测试示例

```bash
# 确保包已构建
pnpm build

# 运行示例
cd examples/react-demo
pnpm dev
```

## 🔗 包依赖关系

```
@ldesign/pdf-core  (核心包，无依赖)
      ↓
      ├─→ @ldesign/pdf-react   (依赖 core + React)
      ├─→ @ldesign/pdf-vue     (依赖 core + Vue)
      ├─→ @ldesign/pdf-lit     (依赖 core + Lit)
      └─→ @ldesign/pdf-vanilla (依赖 core)
```

## ✨ 特性对比

| 特性 | Core | React | Vue | Lit | Vanilla |
|------|------|-------|-----|-----|---------|
| PDF渲染 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 表单管理 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 数字签名 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 虚拟滚动 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 触摸手势 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 组件化 | ❌ | ✅ | ✅ | ✅ | ✅ |
| Hooks/Composables | ❌ | ✅ | ✅ | ❌ | ❌ |
| Web Components | ❌ | ❌ | ❌ | ✅ | ❌ |
| 自动UI | ❌ | ✅ | ✅ | ✅ | ✅ |

## 🎯 使用建议

- **React项目**: 使用 `@ldesign/pdf-react`
- **Vue 3项目**: 使用 `@ldesign/pdf-vue`
- **Web Components / 跨框架**: 使用 `@ldesign/pdf-lit`
- **原生JS / 无框架**: 使用 `@ldesign/pdf-vanilla`
- **高度定制 / 底层控制**: 使用 `@ldesign/pdf-core`

## 📄 许可证

MIT

---

**创建时间:** 2025-10-27
**版本:** 2.0.0
**状态:** ✅ 已完成

