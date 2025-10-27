import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@ldesign/pdf-core': resolve(__dirname, '../../core/es/index.js'),
      '@ldesign/pdf-vue': resolve(__dirname, '../es/index.js')
    }
  },
  server: {
    port: 3002
  }
});
