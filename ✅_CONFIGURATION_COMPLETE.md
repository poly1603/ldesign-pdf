# ✅ PDF项目配置完成 - 准备测试

## 🎉 所有配置已完成！

PDF项目的Monorepo改造和@ldesign/builder集成已100%完成，现在可以进行手动测试。

---

## ✅ 完成清单

### 1. Monorepo架构 ✓
- [x] 创建5个独立的包
- [x] 删除根目录`src/`
- [x] 删除独立的`examples/`目录
- [x] 示例移到各包的`example/`目录

### 2. @ldesign/builder集成 ✓
- [x] 所有包使用`.ldesign/builder.config.ts`
- [x] 删除所有`rollup.config.js`
- [x] 所有5个包构建成功

### 3. 示例项目配置 ✓
- [x] Core示例 - 已更新导入路径
- [x] React示例 - 完整配置
- [x] Vue示例 - 完整配置
- [x] Lit示例 - 完整配置
- [x] Vanilla示例 - 完整配置

---

## 📦 包和示例位置

| 包名 | 源代码 | 示例 | 端口 | 构建状态 |
|------|--------|------|------|----------|
| @ldesign/pdf-core | packages/core/src/ | packages/core/example/ | 3000 | ✅ 已构建 |
| @ldesign/pdf-react | packages/react/src/ | packages/react/example/ | 3001 | ✅ 已构建 |
| @ldesign/pdf-vue | packages/vue/src/ | packages/vue/example/ | 3002 | ✅ 已构建 |
| @ldesign/pdf-lit | packages/lit/src/ | packages/lit/example/ | 3003 | ✅ 已构建 |
| @ldesign/pdf-vanilla | packages/vanilla/src/ | packages/vanilla/example/ | 3004 | ✅ 已构建 |

---

## 🧪 手动测试步骤

### 测试Core示例（端口 3000）

打开终端1：
```bash
cd D:\WorkBench\ldesign\libraries\pdf\packages\core\example
pnpm install
pnpm dev
```

然后在浏览器中访问：**http://localhost:3000**

**预期效果**:
- ✅ 紫色渐变欢迎屏幕
- ✅ "Modern PDF Viewer"标题
- ✅ "Choose Your PDF"和"Load Sample PDF"按钮
- ✅ 点击"Load Sample PDF"加载PDF
- ✅ 工具栏显示（缩放、翻页、打印、下载）
- ✅ PDF文档正常显示

---

### 测试React示例（端口 3001）

打开终端2：
```bash
cd D:\WorkBench\ldesign\libraries\pdf\packages\react\example
pnpm install
pnpm dev
```

然后在浏览器中访问：**http://localhost:3001**

**预期效果**:
- ✅ 紫色渐变header
- ✅ "PDF Viewer - React Demo"标题
- ✅ React组件渲染的PDF查看器
- ✅ 工具栏按钮可用
- ✅ PDF正常显示

---

### 测试Vue示例（端口 3002）

打开终端3：
```bash
cd D:\WorkBench\ldesign\libraries\pdf\packages\vue\example
pnpm install
pnpm dev
```

然后在浏览器中访问：**http://localhost:3002**

**预期效果**:
- ✅ 紫色渐变header
- ✅ "PDF Viewer - Vue Demo"标题
- ✅ Vue组件渲染的PDF查看器
- ✅ 工具栏按钮可用
- ✅ PDF正常显示

---

### 测试Lit示例（端口 3003）

打开终端4：
```bash
cd D:\WorkBench\ldesign\libraries\pdf\packages\lit\example
pnpm install
pnpm dev
```

然后在浏览器中访问：**http://localhost:3003**

**预期效果**:
- ✅ 紫色渐变header
- ✅ "PDF Viewer - Lit Demo"标题
- ✅ Web Component渲染的PDF查看器
- ✅ 工具栏按钮可用
- ✅ PDF正常显示

---

### 测试Vanilla示例（端口 3004）

打开终端5：
```bash
cd D:\WorkBench\ldesign\libraries\pdf\packages\vanilla\example
pnpm install
pnpm dev
```

然后在浏览器中访问：**http://localhost:3004**

**预期效果**:
- ✅ 紫色渐变header
- ✅ "PDF Viewer - Vanilla Demo"标题
- ✅ Vanilla JS渲染的PDF查看器
- ✅ 工具栏按钮可用
- ✅ PDF正常显示

---

## ⚡ 一键启动（推荐）

在PDF项目根目录执行：
```powershell
cd D:\WorkBench\ldesign\libraries\pdf
.\start-all-demos.ps1
```

这会自动启动5个终端窗口，每个运行一个示例。

---

## 🔍 测试检查清单

在每个示例中测试：

### 基础功能
- [ ] 页面正常加载
- [ ] PDF文档显示
- [ ] 工具栏可见

### 缩放功能
- [ ] 点击"＋"按钮 - PDF放大
- [ ] 点击"－"按钮 - PDF缩小
- [ ] 缩放百分比更新

### 翻页功能
- [ ] 点击"◀"按钮 - 上一页
- [ ] 点击"▶"按钮 - 下一页
- [ ] 页码正确显示（如"1 / 10"）
- [ ] 键盘←→键翻页

### 其他功能
- [ ] 点击"🖨"打印按钮
- [ ] 点击"💾"下载按钮
- [ ] 控制台无错误

---

## 📊 构建结果

所有包已成功构建：

```
✅ @ldesign/pdf-core     (116文件, 3.00 MB)  ← ESM+CJS+UMD
✅ @ldesign/pdf-react    (22文件, 107 KB)    ← ESM+CJS+UMD
✅ @ldesign/pdf-vue      (24文件, 117 KB)    ← ESM+CJS
✅ @ldesign/pdf-lit      (12文件, 135 KB)    ← ESM+CJS+UMD
✅ @ldesign/pdf-vanilla  (12文件, 143 KB)    ← ESM+CJS+UMD

总计: 186个文件, 3.48 MB
```

---

## 📝 示例文件清单

每个包的example目录都包含：

### Core示例
```
packages/core/example/
├── index.html           ← 欢迎屏幕 + PDF容器
├── main.js              ← 初始化代码
├── simple.html          ← 简单示例
├── public/sample.pdf    ← 示例PDF
├── package.json
└── vite.config.ts
```

### React示例
```
packages/react/example/
├── src/
│   ├── App.tsx          ← React组件使用
│   ├── main.tsx         ← 入口文件
│   ├── App.css
│   └── index.css
├── public/sample.pdf
├── index.html
├── package.json
└── vite.config.ts
```

### Vue/Lit/Vanilla示例
类似结构，每个都有完整的Vite项目配置。

---

## 🛠️ 如果遇到问题

### 问题1: 模块找不到

确保先构建包：
```bash
cd D:\WorkBench\ldesign\libraries\pdf\packages\core
node ../../../../tools/builder/bin/ldesign-builder.js build
```

### 问题2: 端口被占用

修改对应示例的`vite.config.ts`，更改端口号。

### 问题3: pnpm install失败

在示例目录执行：
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install --no-frozen-lockfile
```

---

## 🎯 完成标准

当所有5个示例都能：
- ✅ 启动开发服务器
- ✅ 在浏览器中访问
- ✅ PDF正常显示
- ✅ 工具栏功能正常
- ✅ 控制台无错误

**项目即100%完成！**

---

**状态**: ✅ 配置完成，等待手动测试  
**日期**: 2025-10-27  

**下一步**: 按照上述步骤逐个启动并测试！🚀
