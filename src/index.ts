/**
 * PDF Library - Enhanced Version
 * 增强版PDF库 - 企业级PDF查看器
 * 
 * @version 2.0.0
 * @author PDF Viewer Team
 * @license MIT
 */

// ============ Core Components ============
export { PDFViewer } from './core/PDFViewer';
export type { PDFViewerOptions, ViewerState } from './core/PDFViewer';

export { EventEmitter } from './core/EventEmitter';
export { Logger, LogLevel } from './core/Logger';
export type { LogEntry, LoggerOptions } from './core/Logger';

export { ErrorHandler, PDFError, ErrorCode } from './core/ErrorHandler';
export type { ErrorHandlerOptions } from './core/ErrorHandler';

export { PageCacheManager } from './core/PageCacheManager';
export type { CachedPage, CacheOptions } from './core/PageCacheManager';

export { CanvasPool, globalCanvasPool } from './core/CanvasPool';
export type { CanvasPoolOptions } from './core/CanvasPool';

export { PerformanceMonitor, globalPerformanceMonitor } from './core/PerformanceMonitor';
export type { PerformanceMetric, PerformanceStats } from './core/PerformanceMonitor';

// ============ UI Components ============
export { SimpleToolbar } from './ui/SimpleToolbar';
export type { SimpleToolbarOptions } from './ui/SimpleToolbar';

export { SidebarManager } from './ui/SidebarManager';

export { ToolbarManager } from './ui/ToolbarManager';

// ============ Feature Modules ============
export { SearchManager } from './features/SearchManager';
export { FormManager } from './features/FormManager';
export type { FormField, FormFieldType, FormData, FormValidation } from './features/FormManager';

export { SignatureManager } from './features/SignatureManager';
export type { Signature, SignaturePosition, PlacedSignature } from './features/SignatureManager';

export { VirtualScroller } from './features/VirtualScroller';
export type { VirtualScrollerOptions } from './features/VirtualScroller';

export { TouchGestureHandler } from './features/TouchGestureHandler';
export type { TouchGestureOptions, GestureEvent } from './features/TouchGestureHandler';

export { KeyboardHandler } from './features/KeyboardHandler';
export type { KeyboardShortcut, KeyboardHandlerOptions } from './features/KeyboardHandler';

export { PageManager } from './features/PageManager';
export type { PageInfo, PageOperation } from './features/PageManager';

export { ExportManager } from './features/ExportManager';
export type { ExportOptions, ExportProgress } from './features/ExportManager';

// ============ Types ============
export * from './types';

// ============ Utilities ============
export * as utils from './utils';

// ============ Global Instances ============
export { globalLogger } from './core/Logger';
export { globalErrorHandler } from './core/ErrorHandler';

/**
 * 创建完整配置的PDF查看器
 */
export interface EnhancedPDFViewerOptions extends PDFViewerOptions {
  // 性能优化
  enableCaching?: boolean;
  enableVirtualScroll?: boolean;
  cacheOptions?: CacheOptions;

  // 功能开关
  enableForms?: boolean;
  enableSignatures?: boolean;
  enableExport?: boolean;
  enablePageManagement?: boolean;

  // 移动端
  enableTouchGestures?: boolean;
  touchGestureOptions?: TouchGestureOptions;

  // 键盘
  enableKeyboard?: boolean;
  keyboardOptions?: KeyboardHandlerOptions;

  // 性能监控
  enablePerformanceMonitoring?: boolean;

  // 日志
  logLevel?: LogLevel;
}

/**
 * 创建增强型PDF查看器
 */
export async function createEnhancedPDFViewer(
  options: EnhancedPDFViewerOptions
): Promise<{
  viewer: PDFViewer;
  cacheManager?: PageCacheManager;
  performanceMonitor?: PerformanceMonitor;
  touchHandler?: TouchGestureHandler;
  keyboardHandler?: KeyboardHandler;
  formManager?: FormManager;
  signatureManager?: SignatureManager;
  pageManager?: PageManager;
  exportManager?: ExportManager;
}> {
  // 设置日志级别
  if (options.logLevel !== undefined) {
    globalLogger.setLevel(options.logLevel);
  }

  // 创建主查看器
  const viewer = new PDFViewer(options);

  const result: any = { viewer };

  // 性能缓存
  if (options.enableCaching) {
    result.cacheManager = new PageCacheManager(options.cacheOptions);
  }

  // 性能监控
  if (options.enablePerformanceMonitoring) {
    result.performanceMonitor = new PerformanceMonitor();
  }

  // 触摸手势
  if (options.enableTouchGestures && options.container) {
    result.touchHandler = new TouchGestureHandler({
      container: options.container,
      ...options.touchGestureOptions
    });
  }

  // 键盘处理
  if (options.enableKeyboard) {
    result.keyboardHandler = new KeyboardHandler({
      container: options.container,
      ...options.keyboardOptions
    });
  }

  // 等待PDF加载后初始化文档相关功能
  const initDocumentFeatures = () => {
    if (!viewer.document) return;

    // 表单管理
    if (options.enableForms) {
      result.formManager = new FormManager(viewer.document);
    }

    // 签名管理
    if (options.enableSignatures) {
      result.signatureManager = new SignatureManager();
    }

    // 页面管理
    if (options.enablePageManagement) {
      result.pageManager = new PageManager(viewer.document);
    }

    // 导出管理
    if (options.enableExport) {
      result.exportManager = new ExportManager(viewer.document);
    }
  };

  // 监听文档加载
  viewer.on('document-loaded', initDocumentFeatures);

  // 如果已经有URL，开始加载
  if (options.pdfUrl) {
    await viewer.loadPDF(options.pdfUrl);
  }

  return result;
}

/**
 * 版本信息
 */
export const VERSION = '2.0.0';

/**
 * 默认导出
 */
export default {
  PDFViewer,
  createEnhancedPDFViewer,
  VERSION,

  // Core
  Logger,
  ErrorHandler,
  PageCacheManager,
  CanvasPool,
  PerformanceMonitor,

  // Features
  FormManager,
  SignatureManager,
  VirtualScroller,
  TouchGestureHandler,
  KeyboardHandler,
  PageManager,
  ExportManager,

  // Global instances
  globalLogger,
  globalErrorHandler,
  globalCanvasPool,
  globalPerformanceMonitor
};
