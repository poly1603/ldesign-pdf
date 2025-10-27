/**
 * @ldesign/pdf-lit
 * Lit Web Components for PDF viewer
 */

// Export the main component
export { PDFViewer } from './pdf-viewer';

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

// Register the component globally
import './pdf-viewer';


