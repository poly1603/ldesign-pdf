import { PDFViewerVanilla } from '@ldesign/pdf-vanilla';

// 创建PDF查看器实例
const viewer = new PDFViewerVanilla({
  container: '#pdf-container',
  pdfUrl: '/sample.pdf',
  createToolbar: true,
  createSidebar: false,
  initialScale: 1.2,
  onPageChange: (page) => {
    console.log('当前页:', page);
  },
  onDocumentLoad: () => {
    console.log('文档加载完成');
  },
  onError: (error) => {
    console.error('错误:', error);
  }
});

// 初始化查看器
viewer.init().then(() => {
  console.log('PDF查看器初始化完成');
}).catch((error) => {
  console.error('初始化失败:', error);
});
