import { PDFViewer } from '@ldesign/pdf-react';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>PDF Viewer - React Demo</h1>
        <p>基于React的PDF查看器示例</p>
      </header>

      <main className="main">
        <PDFViewer
          pdfUrl="/sample.pdf"
          toolbar={true}
          sidebar={false}
          initialScale={1.2}
          onPageChange={(page) => console.log('当前页:', page)}
          onDocumentLoad={() => console.log('文档加载完成')}
          onError={(error) => console.error('错误:', error)}
        />
      </main>
    </div>
  );
}

export default App;
