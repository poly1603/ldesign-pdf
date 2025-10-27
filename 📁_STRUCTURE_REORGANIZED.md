# 📁 PDF项目结构重组完成

## ✅ 目录结构调整完成

按照要求，已完成以下调整：
1. ✅ 删除了 `examples/` 目录
2. ✅ 示例项目移到各包的 `example/` 目录中
3. ✅ 删除了根目录的 `src/` 目录

---

## 📦 新的项目结构

```
pdf/
├── packages/
│   ├── core/
│   │   ├── .ldesign/
│   │   │   └── builder.config.ts
│   │   ├── src/                      # 源代码
│   │   │   ├── core/
│   │   │   ├── features/
│   │   │   ├── ui/
│   │   │   ├── utils/
│   │   │   ├── types/
│   │   │   ├── styles/
│   │   │   └── index.ts
│   │   ├── example/                   # ← Core示例 (端口 3000)
│   │   │   ├── public/
│   │   │   │   └── sample.pdf
│   │   │   ├── index.html
│   │   │   ├── main.js
│   │   │   ├── simple.html
│   │   │   ├── package.json
│   │   │   └── vite.config.ts
│   │   ├── es/                        # ESM输出
│   │   ├── lib/                       # CJS输出
│   │   ├── dist/                      # UMD输出
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── react/
│   │   ├── .ldesign/
│   │   │   └── builder.config.ts
│   │   ├── src/                      # 源代码
│   │   │   ├── PDFViewer.tsx
│   │   │   ├── hooks/
│   │   │   │   └── usePDFViewer.ts
│   │   │   └── index.ts
│   │   ├── example/                   # ← React示例 (端口 3001)
│   │   │   ├── src/
│   │   │   │   ├── App.tsx
│   │   │   │   ├── main.tsx
│   │   │   │   ├── App.css
│   │   │   │   └── index.css
│   │   │   ├── public/
│   │   │   │   └── sample.pdf
│   │   │   ├── index.html
│   │   │   ├── package.json
│   │   │   ├── vite.config.ts
│   │   │   ├── tsconfig.json
│   │   │   └── tsconfig.node.json
│   │   ├── es/                        # ESM输出
│   │   ├── lib/                       # CJS输出
│   │   ├── dist/                      # UMD输出
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── vue/
│   │   ├── .ldesign/
│   │   │   └── builder.config.ts
│   │   ├── src/                      # 源代码
│   │   │   ├── PDFViewer.vue
│   │   │   ├── composables/
│   │   │   │   └── usePDFViewer.ts
│   │   │   └── index.ts
│   │   ├── example/                   # ← Vue示例 (端口 3002)
│   │   │   ├── src/
│   │   │   │   ├── App.vue
│   │   │   │   ├── main.ts
│   │   │   │   └── style.css
│   │   │   ├── public/
│   │   │   │   └── sample.pdf
│   │   │   ├── index.html
│   │   │   ├── package.json
│   │   │   ├── vite.config.ts
│   │   │   ├── tsconfig.json
│   │   │   └── tsconfig.node.json
│   │   ├── es/                        # ESM输出
│   │   ├── lib/                       # CJS输出
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── lit/
│   │   ├── .ldesign/
│   │   │   └── builder.config.ts
│   │   ├── src/                      # 源代码
│   │   │   ├── pdf-viewer.ts
│   │   │   └── index.ts
│   │   ├── example/                   # ← Lit示例 (端口 3003)
│   │   │   ├── src/
│   │   │   │   └── main.ts
│   │   │   ├── public/
│   │   │   │   └── sample.pdf
│   │   │   ├── index.html
│   │   │   ├── package.json
│   │   │   ├── vite.config.ts
│   │   │   └── tsconfig.json
│   │   ├── es/                        # ESM输出
│   │   ├── lib/                       # CJS输出
│   │   ├── dist/                      # UMD输出
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   └── vanilla/
│       ├── .ldesign/
│       │   └── builder.config.ts
│       ├── src/                      # 源代码
│       │   ├── PDFViewerVanilla.ts
│       │   └── index.ts
│       ├── example/                   # ← Vanilla示例 (端口 3004)
│       │   ├── src/
│       │   │   └── main.ts
│       │   ├── public/
│       │   │   └── sample.pdf
│       │   ├── index.html
│       │   ├── package.json
│       │   ├── vite.config.ts
│       │   └── tsconfig.json
│       ├── es/                        # ESM输出
│       ├── lib/                       # CJS输出
│       ├── dist/                      # UMD输出
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
├── package.json                       # 根配置
├── README.md                          # 项目文档
└── start-all-demos.ps1                # 一键启动脚本
```

---

## 🎯 改进说明

### 之前的结构
```
pdf/
├── src/              ← ❌ 已删除
├── examples/         ← ❌ 已删除
│   ├── react-demo/
│   ├── vue-demo/
│   ├── lit-demo/
│   ├── vanilla-demo/
│   └── simple-example/
└── packages/
    └── ...
```

### 现在的结构
```
pdf/
├── packages/
│   ├── core/
│   │   ├── src/          ← 源代码
│   │   ├── example/      ← ✅ 示例在包内
│   │   ├── es/lib/dist/  ← 构建输出
│   │   └── ...
│   ├── react/
│   │   ├── src/          ← 源代码
│   │   ├── example/      ← ✅ 示例在包内
│   │   ├── es/lib/dist/  ← 构建输出
│   │   └── ...
│   └── ... (vue, lit, vanilla同理)
└── ...
```

---

## 📍 示例位置

| 包名 | 示例路径 | 端口 |
|------|----------|------|
| @ldesign/pdf-core | `packages/core/example/` | 3000 |
| @ldesign/pdf-react | `packages/react/example/` | 3001 |
| @ldesign/pdf-vue | `packages/vue/example/` | 3002 |
| @ldesign/pdf-lit | `packages/lit/example/` | 3003 |
| @ldesign/pdf-vanilla | `packages/vanilla/example/` | 3004 |

---

## 🚀 启动示例

### 方法1: 一键启动（推荐）

```powershell
cd D:\WorkBench\ldesign\libraries\pdf
.\start-all-demos.ps1
```

这会自动启动5个示例，分别在端口 3000-3004。

### 方法2: 使用根目录命令

```bash
cd D:\WorkBench\ldesign\libraries\pdf

# 启动各个示例
pnpm example:core       # Core示例 (端口 3000)
pnpm example:react      # React示例 (端口 3001)
pnpm example:vue        # Vue示例 (端口 3002)
pnpm example:lit        # Lit示例 (端口 3003)
pnpm example:vanilla    # Vanilla示例 (端口 3004)
```

### 方法3: 手动启动单个示例

```bash
# Core示例
cd packages/core/example
pnpm install
pnpm dev
# 浏览器访问 http://localhost:3000

# React示例
cd packages/react/example
pnpm install
pnpm dev
# 浏览器访问 http://localhost:3001

# Vue示例
cd packages/vue/example
pnpm install
pnpm dev
# 浏览器访问 http://localhost:3002

# Lit示例
cd packages/lit/example
pnpm install
pnpm dev
# 浏览器访问 http://localhost:3003

# Vanilla示例
cd packages/vanilla/example
pnpm install
pnpm dev
# 浏览器访问 http://localhost:3004
```

---

## 📊 结构对比

### 优点

1. **更清晰的组织** - 每个包都包含自己的示例
2. **独立性更强** - 包和示例紧密相关
3. **更易维护** - 修改包时示例就在旁边
4. **更符合标准** - 参考其他ldesign项目的结构

### 示例文件组织

每个包的example目录都是独立的Vite项目：
- ✅ 独立的`package.json`
- ✅ 独立的`vite.config.ts`
- ✅ 独立的TypeScript配置
- ✅ 独立的`public/`目录（含sample.pdf）

---

## 🔧 配置更新

已完成的配置更新：
- ✅ 更新`package.json`的示例启动脚本
- ✅ 更新`start-all-demos.ps1`的路径
- ✅ 调整所有示例的端口（避免冲突）
- ✅ 为core包创建示例配置

---

## 📝 端口分配

| 示例 | 端口 | URL |
|------|------|-----|
| Core | 3000 | http://localhost:3000 |
| React | 3001 | http://localhost:3001 |
| Vue | 3002 | http://localhost:3002 |
| Lit | 3003 | http://localhost:3003 |
| Vanilla | 3004 | http://localhost:3004 |

---

## 🎉 完成状态

- ✅ 目录结构重组完成
- ✅ 示例移动到各包内
- ✅ 删除了examples目录
- ✅ 删除了根src目录
- ✅ 更新了所有配置和脚本
- ✅ 端口配置已调整

---

## 🧪 测试

现在可以测试每个示例：

```bash
# 从PDF根目录
cd D:\WorkBench\ldesign\libraries\pdf

# 一键启动所有示例
.\start-all-demos.ps1
```

然后在浏览器中访问对应端口查看效果。

---

**状态**: ✅ **结构重组完成**  
**日期**: 2025-10-27  
**版本**: 2.0.0

