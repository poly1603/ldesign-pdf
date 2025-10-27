import { useEffect, useRef, useState } from 'react';
import {
  PDFViewer,
  createEnhancedPDFViewer,
  EnhancedPDFViewerOptions,
  FormManager,
  SignatureManager,
  PageManager,
  ExportManager
} from '@ldesign/pdf-core';

export interface UsePDFViewerOptions extends EnhancedPDFViewerOptions {
  onPageChange?: (pageNum: number) => void;
  onDocumentLoad?: () => void;
  onError?: (error: Error) => void;
  onScaleChange?: (scale: number) => void;
}

export interface PDFViewerState {
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  scale: number;
  error: Error | null;
}

export interface PDFViewerActions {
  loadPDF: (url: string) => Promise<void>;
  goToPage: (pageNum: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setScale: (scale: number) => void;
  print: () => void;
  download: () => void;
  getFormData: () => Promise<any>;
  fillForm: (data: any) => Promise<void>;
  addSignature: (signature: any, position: any) => Promise<void>;
  exportToPDF: (options?: any) => Promise<Blob>;
  exportToImage: (pageNum: number, options?: any) => Promise<Blob>;
  search: (query: string) => Promise<any[]>;
  destroy: () => void;
}

export interface UsePDFViewerReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  viewer: PDFViewer | null;
  formManager: FormManager | null;
  signatureManager: SignatureManager | null;
  pageManager: PageManager | null;
  exportManager: ExportManager | null;
  state: PDFViewerState;
  actions: PDFViewerActions;
}

/**
 * React Hook for PDF Viewer
 * 
 * @example
 * ```tsx
 * const { containerRef, state, actions } = usePDFViewer({
 *   pdfUrl: 'path/to/document.pdf',
 *   onPageChange: (page) => console.log('Page:', page)
 * });
 * 
 * return (
 *   <div>
 *     <button onClick={() => actions.zoomIn()}>Zoom In</button>
 *     <button onClick={() => actions.zoomOut()}>Zoom Out</button>
 *     <div ref={containerRef} style={{ width: '100%', height: '600px' }} />
 *   </div>
 * );
 * ```
 */
export function usePDFViewer(options: UsePDFViewerOptions = {}): UsePDFViewerReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<PDFViewer | null>(null);
  const formManagerRef = useRef<FormManager | null>(null);
  const signatureManagerRef = useRef<SignatureManager | null>(null);
  const pageManagerRef = useRef<PageManager | null>(null);
  const exportManagerRef = useRef<ExportManager | null>(null);

  const [state, setState] = useState<PDFViewerState>({
    isLoading: false,
    currentPage: 1,
    totalPages: 0,
    scale: 1,
    error: null
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const initViewer = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const result = await createEnhancedPDFViewer({
          container: containerRef.current!,
          enableCaching: true,
          enableVirtualScroll: true,
          enableForms: true,
          enableSignatures: true,
          enableExport: true,
          enablePageManagement: true,
          ...options
        });

        viewerRef.current = result.viewer;
        formManagerRef.current = result.formManager || null;
        signatureManagerRef.current = result.signatureManager || null;
        pageManagerRef.current = result.pageManager || null;
        exportManagerRef.current = result.exportManager || null;

        // 设置事件监听
        result.viewer.on('page-change', (pageNum: number) => {
          setState(prev => ({ ...prev, currentPage: pageNum }));
          options.onPageChange?.(pageNum);
        });

        result.viewer.on('document-loaded', () => {
          setState(prev => ({
            ...prev,
            isLoading: false,
            totalPages: result.viewer.totalPages || 0
          }));
          options.onDocumentLoad?.();
        });

        result.viewer.on('scale-change', (scale: number) => {
          setState(prev => ({ ...prev, scale }));
          options.onScaleChange?.(scale);
        });

        result.viewer.on('error', (error: Error) => {
          setState(prev => ({ ...prev, error, isLoading: false }));
          options.onError?.(error);
        });

        // 如果提供了初始PDF URL，加载它
        if (options.pdfUrl) {
          await result.viewer.loadPDF(options.pdfUrl);
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error as Error,
          isLoading: false
        }));
        options.onError?.(error as Error);
      }
    };

    initViewer();

    return () => {
      viewerRef.current?.destroy();
      viewerRef.current = null;
      formManagerRef.current = null;
      signatureManagerRef.current = null;
      pageManagerRef.current = null;
      exportManagerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const actions: PDFViewerActions = {
    loadPDF: async (url: string) => {
      if (!viewerRef.current) throw new Error('Viewer not initialized');
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        await viewerRef.current.loadPDF(url);
      } catch (error) {
        setState(prev => ({ ...prev, error: error as Error, isLoading: false }));
        throw error;
      }
    },

    goToPage: (pageNum: number) => {
      viewerRef.current?.goToPage(pageNum);
    },

    nextPage: () => {
      if (viewerRef.current && state.currentPage < state.totalPages) {
        viewerRef.current.goToPage(state.currentPage + 1);
      }
    },

    previousPage: () => {
      if (viewerRef.current && state.currentPage > 1) {
        viewerRef.current.goToPage(state.currentPage - 1);
      }
    },

    zoomIn: () => {
      if (viewerRef.current) {
        const newScale = Math.min(state.scale * 1.2, 5);
        viewerRef.current.setScale(newScale);
      }
    },

    zoomOut: () => {
      if (viewerRef.current) {
        const newScale = Math.max(state.scale / 1.2, 0.25);
        viewerRef.current.setScale(newScale);
      }
    },

    setScale: (scale: number) => {
      viewerRef.current?.setScale(scale);
    },

    print: () => {
      viewerRef.current?.print();
    },

    download: () => {
      viewerRef.current?.download();
    },

    getFormData: async () => {
      if (!formManagerRef.current) throw new Error('Form manager not initialized');
      return formManagerRef.current.getFormData();
    },

    fillForm: async (data: any) => {
      if (!formManagerRef.current) throw new Error('Form manager not initialized');
      return formManagerRef.current.fillForm(data);
    },

    addSignature: async (signature: any, position: any) => {
      if (!signatureManagerRef.current) throw new Error('Signature manager not initialized');
      return signatureManagerRef.current.addSignature(signature, position);
    },

    exportToPDF: async (options?: any) => {
      if (!exportManagerRef.current) throw new Error('Export manager not initialized');
      return exportManagerRef.current.exportToPDF(options);
    },

    exportToImage: async (pageNum: number, options?: any) => {
      if (!exportManagerRef.current) throw new Error('Export manager not initialized');
      return exportManagerRef.current.exportPageAsImage(pageNum, options);
    },

    search: async (query: string) => {
      if (!viewerRef.current) throw new Error('Viewer not initialized');
      // 实现搜索逻辑
      return [];
    },

    destroy: () => {
      viewerRef.current?.destroy();
    }
  };

  return {
    containerRef,
    viewer: viewerRef.current,
    formManager: formManagerRef.current,
    signatureManager: signatureManagerRef.current,
    pageManager: pageManagerRef.current,
    exportManager: exportManagerRef.current,
    state,
    actions
  };
}



