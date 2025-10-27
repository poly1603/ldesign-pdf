# PDF项目清理和完成指南

## 当前状态

✅ **@ldesign/builder集成完成** - 构建工具已成功运行
✅ **Monorepo架构完成** - 所有包和示例已创建
⚠️ **需要清理重复文件** - src目录有重复代码

## 立即执行的操作

### 1. 清理core包的重复文件（必需）

运行以下命令删除src根目录下的重复文件：

```powershell
cd D:\WorkBench\ldesign\libraries\pdf\packages\core\src

# 删除重复文件（这些文件在子目录中已存在）
Remove-Item -Path PDFViewer.ts -Force -ErrorAction SilentlyContinue
Remove-Item -Path PerformanceMonitor.ts -Force -ErrorAction SilentlyContinue
Remove-Item -Path EventEmitter.ts -Force -ErrorAction SilentlyContinue
Remove-Item -Path Logger.ts -Force -ErrorAction SilentlyContinue  
Remove-Item -Path ErrorHandler.ts -Force -ErrorAction SilentlyContinue
Remove-Item -Path CanvasPool.ts -Force -ErrorAction SilentlyContinue
Remove-Item -Path PageCacheManager.ts -Force -ErrorAction SilentlyContinue
Remove-Item -Path PDFRenderer.ts -Force -ErrorAction SilentlyContinue
Remove-Item -Path EnhancedPDFViewer.ts -Force -ErrorAction SilentlyContinue
```

### 2. 更新其他包的builder配置

将React、Vue、Lit、Vanilla包的配置也改为不使用import：

**packages/react/.ldesign/builder.config.ts**:
```typescript
export default {
  input: 'src/index.ts',
  // ... 其余配置
}
```

**packages/vue/.ldesign/builder.config.ts**:
```typescript
export default {
  input: 'src/index.ts',
  plugins: { vue: true },
  // ... 其余配置
}
```

**packages/lit/.ldesign/builder.config.ts**:
```typescript
export default {
  input: 'src/index.ts',
  // ... 其余配置
}
```

**packages/vanilla/.ldesign/builder.config.ts**:
```typescript
export default {
  input: 'src/index.ts',
  // ... 其余配置
}
```

### 3. 构建所有包

```bash
# 从ldesign根目录执行
cd D:\WorkBench\ldesign

# 构建core包
cd libraries\pdf\packages\core
node ..\..\..\..\tools\builder\bin\ldesign-builder.js build

# 构建react包
cd ..\react
node ..\..\..\..\tools\builder\bin\ldesign-builder.js build

# 构建vue包
cd ..\vue
node ..\..\..\..\tools\builder\bin\ldesign-builder.js build

# 构建lit包
cd ..\lit
node ..\..\..\..\tools\builder\bin\ldesign-builder.js build

# 构建vanilla包
cd ..\vanilla
node ..\..\..\..\tools\builder\bin\ldesign-builder.js build
```

### 4. 测试示例项目（用浏览器打开）

#### React示例
```bash
cd D:\WorkBench\ldesign\libraries\pdf\examples\react-demo
pnpm dev
```
→ 打开浏览器访问 http://localhost:3000

#### Vue示例
```bash
cd D:\WorkBench\ldesign\libraries\pdf\examples\vue-demo
pnpm dev
```
→ 打开浏览器访问 http://localhost:3001

#### Lit示例
```bash
cd D:\WorkBench\ldesign\libraries\pdf\examples\lit-demo
pnpm dev
```
→ 打开浏览器访问 http://localhost:3002

#### Vanilla示例
```bash
cd D:\WorkBench\ldesign\libraries\pdf\examples\vanilla-demo
pnpm dev
```
→ 打开浏览器访问 http://localhost:3003

## 预期结果

构建成功后，每个包应该生成：

```
packages/[package-name]/
├── es/          # ESM格式 + 类型声明
├── lib/         # CJS格式 + 类型声明
└── dist/        # UMD格式
```

示例项目应该能够：
- ✅ 正常启动开发服务器
- ✅ 在浏览器中显示PDF查看器
- ✅ 工具栏按钮可以正常工作
- ✅ 页面导航功能正常

## 快速测试命令

一键清理并构建（PowerShell）:

```powershell
# 清理
cd D:\WorkBench\ldesign\libraries\pdf\packages\core\src
Remove-Item PDFViewer.ts, PerformanceMonitor.ts, EventEmitter.ts, Logger.ts, ErrorHandler.ts, CanvasPool.ts, PageCacheManager.ts, PDFRenderer.ts, EnhancedPDFViewer.ts -Force -ErrorAction SilentlyContinue

# 构建core包
cd ..
node ..\..\..\..\tools\builder\bin\ldesign-builder.js build
```

## 完成标志

- [ ] 所有重复文件已删除
- [ ] 所有5个包成功构建
- [ ] 生成了es/、lib/、dist/目录
- [ ] 4个示例项目能在浏览器中正常运行
- [ ] PDF文件能正常显示和操作

---

**下一步**: 执行上述清理和构建步骤，然后在浏览器中测试所有示例！

