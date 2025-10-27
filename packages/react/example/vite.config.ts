import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ldesign/pdf-core': resolve(__dirname, '../../core/es/index.js'),
      '@ldesign/pdf-react': resolve(__dirname, '../es/index.js')
    }
  },
  server: {
    port: 3001
  }
});
