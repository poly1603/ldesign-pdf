import '@ldesign/pdf-lit';

// 添加事件监听器
const viewer = document.getElementById('pdfViewer');

if (viewer) {
  viewer.addEventListener('page-change', ((e: CustomEvent) => {
    console.log('当前页:', e.detail);
  }) as EventListener);

  viewer.addEventListener('document-load', () => {
    console.log('文档加载完成');
  });

  viewer.addEventListener('error', ((e: CustomEvent) => {
    console.error('错误:', e.detail);
  }) as EventListener);
}
