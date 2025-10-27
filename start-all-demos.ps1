# PDF示例项目一键启动脚本
# 此脚本会启动所有5个示例项目

Write-Host "🚀 启动所有PDF示例项目..." -ForegroundColor Green
Write-Host ""

$projectRoot = $PSScriptRoot

# Core示例
Write-Host "启动 Core 示例 (端口 3000)..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\packages\core\example'; pnpm install; pnpm dev"

Start-Sleep -Seconds 2

# React示例
Write-Host "启动 React 示例 (端口 3001)..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\packages\react\example'; pnpm install; pnpm dev"

Start-Sleep -Seconds 2

# Vue示例
Write-Host "启动 Vue 示例 (端口 3002)..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\packages\vue\example'; pnpm install; pnpm dev"

Start-Sleep -Seconds 2

# Lit示例
Write-Host "启动 Lit 示例 (端口 3003)..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\packages\lit\example'; pnpm install; pnpm dev"

Start-Sleep -Seconds 2

# Vanilla示例
Write-Host "启动 Vanilla 示例 (端口 3004)..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\packages\vanilla\example'; pnpm install; pnpm dev"

Write-Host ""
Write-Host "✅ 所有示例项目已启动！" -ForegroundColor Green
Write-Host ""
Write-Host "请在浏览器中访问以下地址:" -ForegroundColor Yellow
Write-Host "  Core:    http://localhost:3000" -ForegroundColor White
Write-Host "  React:   http://localhost:3001" -ForegroundColor White
Write-Host "  Vue:     http://localhost:3002" -ForegroundColor White
Write-Host "  Lit:     http://localhost:3003" -ForegroundColor White
Write-Host "  Vanilla: http://localhost:3004" -ForegroundColor White
Write-Host ""
Write-Host "提示: 每个示例都在独立的终端窗口中运行" -ForegroundColor Gray
