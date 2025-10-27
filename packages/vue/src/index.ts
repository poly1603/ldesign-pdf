/**
 * @ldesign/pdf-vue
 * Vue 3 components and composables for PDF viewer
 */

import { App } from 'vue';
import PDFViewer from './PDFViewer.vue';

// 组件
export { default as PDFViewer } from './PDFViewer.vue';

// Composables
export { usePDFViewer } from './composables/usePDFViewer';
export type {
  UsePDFViewerOptions,
  PDFViewerState,
  PDFViewerActions,
  UsePDFViewerReturn
} from './composables/usePDFViewer';

// 组件Props类型
export type { PDFViewerProps } from './PDFViewer.vue';

// 插件安装函数
export function install(app: App) {
  app.component('PDFViewer', PDFViewer);
}

// 默认导出插件
export default {
  install
};

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


