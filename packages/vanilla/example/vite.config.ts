import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@ldesign/pdf-core': resolve(__dirname, '../../core/es/index.js'),
      '@ldesign/pdf-vanilla': resolve(__dirname, '../es/index.js')
    }
  },
  server: {
    port: 3004
  }
});
