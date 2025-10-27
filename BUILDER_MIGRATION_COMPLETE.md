# PDF项目 - 改用@ldesign/builder构建工具完成

## ✅ 已完成的工作

### 1. 创建Monorepo工作空间结构 ✓
- 创建 `pnpm-workspace.yaml`
- 设置 packages 和 examples 目录结构

### 2. 拆分成5个独立的包 ✓
```
packages/
├── core/          @ldesign/pdf-core - 核心库
├── react/         @ldesign/pdf-react - React组件
├── vue/           @ldesign/pdf-vue - Vue组件  
├── lit/           @ldesign/pdf-lit - Web Components
└── vanilla/       @ldesign/pdf-vanilla - 原生JS
```

### 3. 改用@ldesign/builder构建 ✓

#### 为每个包创建了builder配置
- ✅ `packages/core/.ldesign/builder.config.ts`
- ✅ `packages/react/.ldesign/builder.config.ts`
- ✅ `packages/vue/.ldesign/builder.config.ts`
- ✅ `packages/lit/.ldesign/builder.config.ts`
- ✅ `packages/vanilla/.ldesign/builder.config.ts`

#### 更新了所有package.json
- ✅ 移除了rollup相关依赖
- ✅ 添加了 `@ldesign/builder` 依赖
- ✅ 更新构建脚本为 `ldesign-builder build`
- ✅ 更新输出路径：`lib/` (CJS), `es/` (ESM), `dist/` (UMD)

#### 删除了旧的rollup配置
- ✅ 删除所有 `rollup.config.js` 文件

### 4. 创建示例项目 ✓
```
examples/
├── react-demo/      React示例 (端口 3000)
├── vue-demo/        Vue示例 (端口 3001)
├── lit-demo/        Lit示例 (端口 3002)
└── vanilla-demo/    Vanilla示例 (端口 3003)
```

## 📋 下一步操作

### 方案A: 直接使用workspace的builder（推荐）

由于@ldesign/builder已经在workspace根目录安装，可以直接构建：

```bash
# 1. 回到ldesign根目录
cd D:\WorkBench\ldesign

# 2. 进入pdf项目
cd libraries\pdf

# 3. 构建所有包
pnpm build

# 或构建单个包
cd packages\core
pnpm build
```

### 方案B: 重新安装依赖

如果方案A不行，执行：

```bash
cd D:\WorkBench\ldesign\libraries\pdf

# 清理并重新安装
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

## 🚀 启动示例并测试

构建完成后，启动示例项目进行测试：

### React示例
```bash
cd examples\react-demo
pnpm install
pnpm dev
# 浏览器访问: http://localhost:3000
```

### Vue示例
```bash
cd examples\vue-demo
pnpm install
pnpm dev
# 浏览器访问: http://localhost:3001
```

### Lit示例
```bash
cd examples\lit-demo
pnpm install
pnpm dev
# 浏览器访问: http://localhost:3002
```

### Vanilla示例
```bash
cd examples\vanilla-demo
pnpm install
pnpm dev
# 浏览器访问: http://localhost:3003
```

## 📁 Builder配置示例

### Core包配置
```typescript
// packages/core/.ldesign/builder.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs', 'umd'],
    esm: { dir: 'es', preserveStructure: true },
    cjs: { dir: 'lib', preserveStructure: true },
    umd: { dir: 'dist', name: 'PDFCore' }
  },
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['pdfjs-dist', /^pdfjs-dist\//]
})
```

### React包配置
```typescript
// packages/react/.ldesign/builder.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs', 'umd'],
    esm: { dir: 'es', preserveStructure: true },
    cjs: { dir: 'lib', preserveStructure: true },
    umd: { 
      dir: 'dist', 
      name: 'PDFReact',
      globals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
        '@ldesign/pdf-core': 'PDFCore'
      }
    }
  },
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    'react', 'react-dom',
    '@ldesign/pdf-core',
    /^react\//, /^react-dom\//
  ]
})
```

## 🎯 构建输出

每个包构建后会生成：

```
packages/[package-name]/
├── es/          # ESM格式
│   ├── index.js
│   └── index.d.ts
├── lib/         # CJS格式
│   ├── index.js
│   └── index.d.ts
└── dist/        # UMD格式
    ├── index.umd.js
    └── index.umd.js.map
```

## 📝 说明

1. **@ldesign/builder优势**:
   - 统一的构建配置
   - 自动处理多种输出格式
   - 支持Vue、React等框架
   - 内置类型声明生成
   - 更好的错误提示

2. **workspace依赖**:
   - 所有包使用 `@ldesign/builder: workspace:*`
   - 自动链接到workspace的builder工具
   - 保证构建工具版本一致

3. **示例项目**:
   - 每个示例都是独立的Vite项目
   - 直接引用workspace的包
   - 支持热更新开发

---

**状态**: ✅ 配置完成，等待构建和测试
**日期**: 2025-10-27
**版本**: 2.0.0

