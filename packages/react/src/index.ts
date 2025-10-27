/**
 * @ldesign/pdf-react
 * React components and hooks for PDF viewer
 */

// Components
export { PDFViewer } from './PDFViewer';
export type { PDFViewerProps } from './PDFViewer';

// Hooks
export { usePDFViewer } from './hooks/usePDFViewer';
export type {
  UsePDFViewerOptions,
  PDFViewerState,
  PDFViewerActions,
  UsePDFViewerReturn
} from './hooks/usePDFViewer';

// Re-export core types
export type {
  PDFViewerOptions,
  ViewerState,
  LogLevel,
  LogEntry,
  LoggerOptions,
  ErrorCode,
  ErrorHandlerOptions,
  CachedPage,
  CacheOptions,
  CanvasPoolOptions,
  PerformanceMetric,
  PerformanceStats,
  SimpleToolbarOptions,
  FormField,
  FormFieldType,
  FormData,
  FormValidation,
  Signature,
  SignaturePosition,
  PlacedSignature,
  VirtualScrollerOptions,
  TouchGestureOptions,
  GestureEvent,
  KeyboardShortcut,
  KeyboardHandlerOptions,
  PageInfo,
  PageOperation,
  ExportOptions,
  ExportProgress,
  EnhancedPDFViewerOptions
} from '@ldesign/pdf-core';

// Re-export utilities
export {
  createEnhancedPDFViewer,
  globalLogger,
  globalErrorHandler,
  globalCanvasPool,
  globalPerformanceMonitor,
  VERSION
} from '@ldesign/pdf-core';



