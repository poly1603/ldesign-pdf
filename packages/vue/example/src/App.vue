<template>
  <div class="app">
    <header class="header">
      <h1>PDF Viewer - Vue Demo</h1>
      <p>基于Vue 3的PDF查看器示例</p>
    </header>
    
    <main class="main">
      <PDFViewer
        :pdf-url="pdfUrl"
        :toolbar="true"
        :sidebar="false"
        :initial-scale="1.2"
        @page-change="handlePageChange"
        @document-load="handleDocumentLoad"
        @error="handleError"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PDFViewer } from '@ldesign/pdf-vue';

const pdfUrl = ref('/sample.pdf');

const handlePageChange = (page: number) => {
  console.log('当前页:', page);
};

const handleDocumentLoad = () => {
  console.log('文档加载完成');
};

const handleError = (error: Error) => {
  console.error('错误:', error);
};
</script>

<style scoped>
.app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.header h1 {
  font-size: 28px;
  margin-bottom: 10px;
}

.header p {
  font-size: 14px;
  opacity: 0.9;
}

.main {
  flex: 1;
  overflow: hidden;
}
</style>
