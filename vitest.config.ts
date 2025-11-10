import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // 测试环境
    environment: 'jsdom',
    
    // 全局设置
    globals: true,
    
    // 覆盖率配置
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/**/__tests__/**',
        'src/**/__mocks__/**',
        'src/**/*.d.ts',
        'src/types/**'
      ],
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    },
    
    // 设置文件
    setupFiles: ['./test/setup.ts'],
    
    // 包含的测试文件
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'test/**/*.{test,spec}.{ts,tsx}'
    ],
    
    // 排除的文件
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache'
    ],
    
    // 监视模式配置
    watch: false,
    
    // 测试超时
    testTimeout: 10000,
    
    // 钩子超时
    hookTimeout: 10000,
    
    // 并发
    threads: true,
    maxThreads: 4,
    minThreads: 1,
    
    // Mock配置
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    
    // 输出配置
    reporters: ['default', 'html'],
    outputFile: {
      html: './test-results/index.html'
    },
    
    // 依赖优化
    deps: {
      inline: ['pdfjs-dist']
    }
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@core': resolve(__dirname, './src/core'),
      '@features': resolve(__dirname, './src/features'),
      '@ui': resolve(__dirname, './src/ui'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
      '@test': resolve(__dirname, './test')
    }
  }
});