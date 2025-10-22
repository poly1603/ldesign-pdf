/**
 * @ldesign/pdf 构建配置
 * 
 * PDF 处理库
 */

import { defineConfig, libraryPackage } from '@ldesign/builder'

export default defineConfig(
  libraryPackage({
    // UMD 构建配置
    umd: {
      enabled: true,
      name: 'LDesignPdf'
    },

    // 输出配置
    output: {
      esm: {
        dir: 'es',
        format: 'esm',
        preserveStructure: true,
        dts: true
      },
      cjs: {
        dir: 'lib',
        format: 'cjs',
        preserveStructure: true,
        dts: true
      },
      umd: {
        dir: 'dist',
        format: 'umd',
        minify: true
      }
    },

    // 排除非生产代码
    exclude: [
      '**/examples/**',
      '**/__tests__/**',
      '**/*.test.*',
      '**/*.spec.*',
      '**/docs/**'
    ],

    // 外部依赖 - PDF.js 等
    external: [
      'pdfjs-dist'
    ],

    globals: {
      'pdfjs-dist': 'pdfjsLib'
    },

    // TypeScript 配置
    typescript: {
      declaration: true,
      target: 'ES2020',
      module: 'ESNext'
    }
  })
)

