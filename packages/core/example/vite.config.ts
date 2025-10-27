import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@ldesign/pdf-core': resolve(__dirname, '../es/index.js')
    }
  },
  server: {
    port: 3000
  }
});

