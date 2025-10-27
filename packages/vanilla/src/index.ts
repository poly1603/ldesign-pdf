/**
 * @ldesign/pdf-vanilla
 * Vanilla JavaScript wrapper for PDF viewer
 */

// Main class
export { PDFViewerVanilla } from './PDFViewerVanilla';
export type { PDFViewerConfig } from './PDFViewerVanilla';

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
  PDFViewer,
  globalLogger,
  globalErrorHandler,
  globalCanvasPool,
  globalPerformanceMonitor,
  VERSION
} from '@ldesign/pdf-core';

// Default export
import { PDFViewerVanilla } from './PDFViewerVanilla';
export default PDFViewerVanilla;

