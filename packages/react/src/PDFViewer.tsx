import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  PDFViewer as CorePDFViewer,
  createEnhancedPDFViewer,
  EnhancedPDFViewerOptions,
  FormManager,
  SignatureManager,
  PageManager,
  ExportManager,
  TouchGestureHandler,
  KeyboardHandler,
  PageCacheManager,
  PerformanceMonitor
} from '@ldesign/pdf-core';

export interface PDFViewerProps extends Partial<EnhancedPDFViewerOptions> {
  /** PDF文件URL */
  pdfUrl?: string;
  /** 容器样式 */
  style?: React.CSSProperties;
  /** 容器类名 */
  className?: string;
  /** 工具栏配置 */
  toolbar?: boolean | ToolbarConfig;
  /** 侧边栏配置 */
  sidebar?: boolean | SidebarConfig;
  /** 页面变化回调 */
  onPageChange?: (pageNum: number) => void;
  /** 文档加载完成回调 */
  onDocumentLoad?: () => void;
  /** 错误回调 */
  onError?: (error: Error) => void;
  /** 缩放变化回调 */
  onScaleChange?: (scale: number) => void;
  /** 表单提交回调 */
  onFormSubmit?: (data: any) => void;
  /** 签名添加回调 */
  onSignatureAdd?: (signature: any) => void;
}

interface ToolbarConfig {
  visible?: boolean;
  items?: string[];
  customItems?: React.ReactNode;
}

interface SidebarConfig {
  visible?: boolean;
  defaultPanel?: 'thumbnails' | 'bookmarks' | 'attachments';
  panels?: string[];
}

interface ViewerInstance {
  viewer: CorePDFViewer;
  cacheManager?: PageCacheManager;
  performanceMonitor?: PerformanceMonitor;
  touchHandler?: TouchGestureHandler;
  keyboardHandler?: KeyboardHandler;
  formManager?: FormManager;
  signatureManager?: SignatureManager;
  pageManager?: PageManager;
  exportManager?: ExportManager;
}

/**
 * React PDF查看器组件
 */
export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  style,
  className,
  toolbar = true,
  sidebar = false,
  onPageChange,
  onDocumentLoad,
  onError,
  onScaleChange,
  onFormSubmit,
  onSignatureAdd,
  ...viewerOptions
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ViewerInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);

  // 初始化查看器
  useEffect(() => {
    if (!containerRef.current) return;

    const initViewer = async () => {
      try {
        setIsLoading(true);

        const viewerContainer = document.createElement('div');
        viewerContainer.className = 'pdf-viewer-container';
        viewerContainer.style.width = '100%';
        viewerContainer.style.height = '100%';
        containerRef.current?.appendChild(viewerContainer);

        const instance = await createEnhancedPDFViewer({
          container: viewerContainer,
          pdfUrl,
          enableCaching: true,
          enableVirtualScroll: true,
          enableForms: true,
          enableSignatures: true,
          enableExport: true,
          enablePageManagement: true,
          enableTouchGestures: true,
          enableKeyboard: true,
          enablePerformanceMonitoring: true,
          ...viewerOptions
        });

        viewerRef.current = instance;

        // 设置事件监听器
        instance.viewer.on('page-change', (pageNum: number) => {
          setCurrentPage(pageNum);
          onPageChange?.(pageNum);
        });

        instance.viewer.on('document-loaded', () => {
          setTotalPages(instance.viewer.totalPages || 0);
          setIsLoading(false);
          onDocumentLoad?.();
        });

        instance.viewer.on('scale-change', (newScale: number) => {
          setScale(newScale);
          onScaleChange?.(newScale);
        });

        instance.viewer.on('error', (error: Error) => {
          console.error('PDF Viewer Error:', error);
          setIsLoading(false);
          onError?.(error);
        });

        // 表单管理器事件
        if (instance.formManager && onFormSubmit) {
          instance.formManager.on('submit', onFormSubmit);
        }

        // 签名管理器事件
        if (instance.signatureManager && onSignatureAdd) {
          instance.signatureManager.on('signature-added', onSignatureAdd);
        }

      } catch (error) {
        console.error('Failed to initialize PDF viewer:', error);
        setIsLoading(false);
        onError?.(error as Error);
      }
    };

    initViewer();

    // 清理函数
    return () => {
      if (viewerRef.current) {
        viewerRef.current.viewer.destroy();
        viewerRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 加载新的PDF
  useEffect(() => {
    if (pdfUrl && viewerRef.current) {
      viewerRef.current.viewer.loadPDF(pdfUrl).catch(error => {
        console.error('Failed to load PDF:', error);
        onError?.(error);
      });
    }
  }, [pdfUrl, onError]);

  // 工具栏操作处理函数
  const handleZoomIn = useCallback(() => {
    if (viewerRef.current) {
      const newScale = Math.min(scale * 1.2, 5);
      viewerRef.current.viewer.setScale(newScale);
    }
  }, [scale]);

  const handleZoomOut = useCallback(() => {
    if (viewerRef.current) {
      const newScale = Math.max(scale / 1.2, 0.25);
      viewerRef.current.viewer.setScale(newScale);
    }
  }, [scale]);

  const handlePreviousPage = useCallback(() => {
    if (viewerRef.current && currentPage > 1) {
      viewerRef.current.viewer.goToPage(currentPage - 1);
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (viewerRef.current && currentPage < totalPages) {
      viewerRef.current.viewer.goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const handlePrint = useCallback(() => {
    viewerRef.current?.viewer.print();
  }, []);

  const handleDownload = useCallback(() => {
    viewerRef.current?.viewer.download();
  }, []);

  // 渲染工具栏
  const renderToolbar = useMemo(() => {
    if (!toolbar) return null;

    const config = typeof toolbar === 'object' ? toolbar : {};
    if (config.visible === false) return null;

    return (
      <div className="pdf-toolbar">
        <div className="pdf-toolbar-group">
          <button onClick={handleZoomOut} title="缩小">
            <span>－</span>
          </button>
          <span className="pdf-toolbar-scale">{Math.round(scale * 100)}%</span>
          <button onClick={handleZoomIn} title="放大">
            <span>＋</span>
          </button>
        </div>

        <div className="pdf-toolbar-group">
          <button onClick={handlePreviousPage} disabled={currentPage <= 1} title="上一页">
            <span>◀</span>
          </button>
          <span className="pdf-toolbar-page">
            {currentPage} / {totalPages}
          </span>
          <button onClick={handleNextPage} disabled={currentPage >= totalPages} title="下一页">
            <span>▶</span>
          </button>
        </div>

        <div className="pdf-toolbar-group">
          <button onClick={handlePrint} title="打印">
            <span>🖨</span>
          </button>
          <button onClick={handleDownload} title="下载">
            <span>💾</span>
          </button>
        </div>

        {config.customItems}
      </div>
    );
  }, [toolbar, scale, currentPage, totalPages, handleZoomIn, handleZoomOut, handlePreviousPage, handleNextPage, handlePrint, handleDownload]);

  // 渲染侧边栏
  const renderSidebar = useMemo(() => {
    if (!sidebar) return null;

    const config = typeof sidebar === 'object' ? sidebar : {};
    if (config.visible === false) return null;

    return (
      <div className="pdf-sidebar">
        {/* 侧边栏内容 */}
      </div>
    );
  }, [sidebar]);

  return (
    <div
      className={`pdf-viewer-wrapper ${className || ''}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...style
      }}
    >
      {renderToolbar}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {renderSidebar}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {isLoading && (
            <div className="pdf-loading" style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '18px',
              color: '#666'
            }}>
              加载中...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;



