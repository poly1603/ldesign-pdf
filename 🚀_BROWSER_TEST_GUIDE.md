# 🚀 PDF示例项目浏览器测试指南

## ✅ 所有包已成功构建

- ✅ @ldesign/pdf-core (3.00 MB, 116文件)
- ✅ @ldesign/pdf-react (106.68 KB, 22文件)
- ✅ @ldesign/pdf-vue (116.96 KB, 24文件)
- ✅ @ldesign/pdf-lit (134.88 KB, 12文件)
- ✅ @ldesign/pdf-vanilla (143.03 KB, 12文件)

---

## 🧪 如何测试示例

### 方法1: 逐个启动测试（推荐）

#### 1️⃣ 测试React示例

打开**新终端**，执行：
```bash
cd D:\WorkBench\ldesign\libraries\pdf\examples\react-demo
pnpm install
pnpm dev
```

然后在浏览器中打开：
**http://localhost:3000**

预期看到：
- 紫色渐变header
- "PDF Viewer - React Demo"标题
- PDF查看器工具栏
- PDF文档显示

---

#### 2️⃣ 测试Vue示例

打开**另一个新终端**，执行：
```bash
cd D:\WorkBench\ldesign\libraries\pdf\examples\vue-demo
pnpm install
pnpm dev
```

然后在浏览器中打开：
**http://localhost:3001**

预期看到：
- 紫色渐变header
- "PDF Viewer - Vue Demo"标题
- PDF查看器工具栏
- PDF文档显示

---

#### 3️⃣ 测试Lit示例

打开**另一个新终端**，执行：
```bash
cd D:\WorkBench\ldesign\libraries\pdf\examples\lit-demo
pnpm install
pnpm dev
```

然后在浏览器中打开：
**http://localhost:3002**

预期看到：
- 紫色渐变header
- "PDF Viewer - Lit Demo"标题
- PDF查看器工具栏
- PDF文档显示

---

#### 4️⃣ 测试Vanilla示例

打开**另一个新终端**，执行：
```bash
cd D:\WorkBench\ldesign\libraries\pdf\examples\vanilla-demo
pnpm install
pnpm dev
```

然后在浏览器中打开：
**http://localhost:3003**

预期看到：
- 紫色渐变header
- "PDF Viewer - Vanilla Demo"标题
- PDF查看器工具栏
- PDF文档显示

---

### 方法2: 使用根目录快捷命令

从PDF项目根目录执行：

```bash
cd D:\WorkBench\ldesign\libraries\pdf

# 启动React示例
pnpm example:react

# 启动Vue示例
pnpm example:vue

# 启动Lit示例
pnpm example:lit

# 启动Vanilla示例
pnpm example:vanilla
```

---

## ✨ 功能测试清单

在每个示例中测试以下功能：

### 基础功能
- [ ] PDF文档正常显示
- [ ] 工具栏可见
- [ ] 页面显示 "1 / N"（N为总页数）

### 工具栏操作
- [ ] 点击 "＋" 按钮 - PDF放大
- [ ] 点击 "－" 按钮 - PDF缩小
- [ ] 缩放百分比正确显示
- [ ] 点击 "◀" 按钮 - 上一页
- [ ] 点击 "▶" 按钮 - 下一页
- [ ] 页码正确更新
- [ ] 点击 "🖨" 按钮 - 打开打印对话框
- [ ] 点击 "💾" 按钮 - 下载PDF文件

### 控制台输出
打开浏览器开发者工具（F12），检查控制台：
- [ ] 看到 "当前页: 1"
- [ ] 看到 "文档加载完成"
- [ ] 翻页时看到页码变化日志
- [ ] 无错误信息

---

## 🎨 示例项目特点

### React示例
- 使用React 18 + TypeScript
- 使用`<PDFViewer>`组件
- Props传递和事件处理
- 现代化的React开发体验

### Vue示例
- 使用Vue 3 Composition API
- 使用`<PDFViewer>`组件
- Reactive数据绑定
- Vue 3最佳实践

### Lit示例
- 使用Lit Web Components
- 使用`<pdf-viewer>`自定义元素
- 原生浏览器支持
- 框架无关

### Vanilla示例
- 纯JavaScript + TypeScript
- 使用`PDFViewerVanilla`类
- 无框架依赖
- 最小化的实现

---

## 🐛 如果遇到问题

### 问题1: pnpm install失败

**解决方案**:
```bash
# 清理并重新安装
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install --no-frozen-lockfile
```

### 问题2: 端口被占用

**解决方案**:
修改对应示例的`vite.config.ts`，更改端口号：
```typescript
export default defineConfig({
  server: {
    port: 3010 // 改成其他端口
  }
})
```

### 问题3: PDF不显示

**检查**:
1. 确认`public/sample.pdf`文件存在
2. 检查浏览器控制台是否有错误
3. 确认所有包已成功构建

### 问题4: 模块找不到

**解决方案**:
```bash
# 回到pdf根目录重新构建
cd D:\WorkBench\ldesign\libraries\pdf

# 重新构建所有包
cd packages\core && node ..\..\..\..\tools\builder\bin\ldesign-builder.js build
cd ..\react && node ..\..\..\..\tools\builder\bin\ldesign-builder.js build
cd ..\vue && node ..\..\..\..\tools\builder\bin\ldesign-builder.js build
cd ..\lit && node ..\..\..\..\tools\builder\bin\ldesign-builder.js build
cd ..\vanilla && node ..\..\..\..\tools\builder\bin\ldesign-builder.js build
```

---

## 📊 测试报告模板

测试完成后，记录：

| 示例 | URL | 启动 | PDF显示 | 工具栏 | 翻页 | 缩放 | 打印 | 下载 |
|------|-----|------|---------|--------|------|------|------|------|
| React | :3000 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Vue | :3001 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Lit | :3002 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Vanilla | :3003 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |

✅ = 通过 | ❌ = 失败 | ⏳ = 待测试

---

## 🎯 测试步骤

1. **启动一个示例**
   ```bash
   cd examples/react-demo
   pnpm install
   pnpm dev
   ```

2. **打开浏览器**
   - 访问 http://localhost:3000
   - 打开开发者工具（F12）

3. **测试功能**
   - 检查PDF是否显示
   - 点击所有工具栏按钮
   - 观察控制台输出

4. **重复测试其他示例**
   - 每个示例在新终端启动
   - 使用不同的端口

---

## 💻 推荐测试环境

- **操作系统**: Windows 10/11
- **浏览器**: Chrome 90+ / Edge 90+ / Firefox 88+
- **Node.js**: 16+ 
- **pnpm**: 8.0+

---

## 🎉 完成标志

当所有示例都能在浏览器中正常工作时，项目100%完成！

**期望结果**: 
✅ 4个示例全部在浏览器中成功运行
✅ PDF正常显示和交互
✅ 所有工具栏功能正常
✅ 控制台无错误信息

---

**准备就绪！** 现在可以开始在浏览器中测试各个示例了！🎊

