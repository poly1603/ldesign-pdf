/**
 * 增强的TypeScript类型定义
 * Enhanced TypeScript Type Definitions
 */

import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

// ============ 严格的事件类型映射 ============

/**
 * PDF查看器事件映射
 */
export interface PDFViewerEventMap {
  // 文档事件
  'document-loading': { source: string | ArrayBuffer };
  'document-loaded': { document: PDFDocumentProxy; numPages: number; fingerprint: string };
  'document-error': { error: PDFError; source: string | ArrayBuffer };
  'document-closed': void;

  // 页面事件
  'page-changing': { from: number; to: number };
  'page-changed': { current: number; total: number };
  'page-rendered': { pageNumber: number; renderTime: number };
  'page-error': { pageNumber: number; error: Error };

  // 缩放事件
  'scale-changing': { from: number; to: number };
  'scale-changed': { scale: number };

  // 旋转事件
  'rotation-changed': { rotation: 0 | 90 | 180 | 270 };

  // 搜索事件
  'search-started': { query: string; options: SearchOptions };
  'search-complete': { query: string; results: SearchResult[]; totalResults: number };
  'search-cleared': void;

  // 注释事件
  'annotation-added': { annotation: Annotation };
  'annotation-updated': { annotation: Annotation };
  'annotation-removed': { id: string };
  'annotation-clicked': { annotation: Annotation; event: MouseEvent };

  // 书签事件
  'bookmark-added': { bookmark: Bookmark };
  'bookmark-removed': { id: string };
  'bookmark-navigated': { bookmark: Bookmark };

  // 表单事件
  'form-field-changed': { field: FormField; oldValue: unknown; newValue: unknown };
  'form-submitted': { data: FormData };
  'form-reset': void;

  // UI事件
  'toolbar-action': { action: string; data?: unknown };
  'sidebar-toggled': { visible: boolean };
  'fullscreen-changed': { isFullscreen: boolean };

  // 性能事件
  'performance-warning': { metric: string; value: number; threshold: number };
  'memory-pressure': { usage: number; limit: number };

  // 通用事件
  'error': PDFError;
  'warning': { message: string; code?: string };
  'info': { message: string; data?: unknown };
}

/**
 * 类型安全的事件发射器接口
 */
export interface TypedEventEmitter<TEventMap extends Record<string, unknown>> {
  on<K extends keyof TEventMap>(
    event: K,
    handler: TEventMap[K] extends void 
      ? () => void 
      : (data: TEventMap[K]) => void
  ): void;

  off<K extends keyof TEventMap>(
    event: K,
    handler?: TEventMap[K] extends void 
      ? () => void 
      : (data: TEventMap[K]) => void
  ): void;

  once<K extends keyof TEventMap>(
    event: K,
    handler: TEventMap[K] extends void 
      ? () => void 
      : (data: TEventMap[K]) => void
  ): void;

  emit<K extends keyof TEventMap>(
    event: K,
    ...args: TEventMap[K] extends void ? [] : [TEventMap[K]]
  ): void;
}

// ============ 配置选项的严格类型 ============

/**
 * 视图模式
 */
export type ViewMode = 'single' | 'continuous' | 'book' | 'presentation';

/**
 * 缩放模式
 */
export type ScaleMode = number | 'page-fit' | 'page-width' | 'page-height' | 'auto';

/**
 * 页面过渡类型
 */
export type PageTransitionType = 'none' | 'fade' | 'slide' | 'flip' | 'zoom' | 'rotate';

/**
 * 主题类型
 */
export type Theme = 'light' | 'dark' | 'auto' | CustomTheme;

/**
 * 工具栏位置
 */
export type ToolbarPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * 侧边栏面板类型
 */
export type SidebarPanel = 'thumbnails' | 'outline' | 'bookmarks' | 'attachments' | 'layers' | 'search';

// ============ 增强的错误处理 ============

/**
 * PDF错误代码枚举
 */
export enum PDFErrorCode {
  // 文档错误
  DOCUMENT_LOAD_FAILED = 'DOCUMENT_LOAD_FAILED',
  DOCUMENT_INVALID = 'DOCUMENT_INVALID',
  DOCUMENT_PASSWORD_REQUIRED = 'DOCUMENT_PASSWORD_REQUIRED',
  DOCUMENT_PASSWORD_INCORRECT = 'DOCUMENT_PASSWORD_INCORRECT',
  DOCUMENT_CORRUPTED = 'DOCUMENT_CORRUPTED',

  // 渲染错误
  RENDER_FAILED = 'RENDER_FAILED',
  PAGE_NOT_FOUND = 'PAGE_NOT_FOUND',
  CANVAS_ERROR = 'CANVAS_ERROR',
  CONTEXT_LOST = 'CONTEXT_LOST',

  // 资源错误
  WORKER_LOAD_FAILED = 'WORKER_LOAD_FAILED',
  FONT_LOAD_FAILED = 'FONT_LOAD_FAILED',
  CMAP_LOAD_FAILED = 'CMAP_LOAD_FAILED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

  // 功能错误
  FEATURE_NOT_SUPPORTED = 'FEATURE_NOT_SUPPORTED',
  BROWSER_NOT_SUPPORTED = 'BROWSER_NOT_SUPPORTED',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  OPERATION_CANCELLED = 'OPERATION_CANCELLED',
  OPERATION_TIMEOUT = 'OPERATION_TIMEOUT',

  // 内存错误
  OUT_OF_MEMORY = 'OUT_OF_MEMORY',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  CACHE_FULL = 'CACHE_FULL',

  // 网络错误
  NETWORK_ERROR = 'NETWORK_ERROR',
  CORS_ERROR = 'CORS_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  OFFLINE_ERROR = 'OFFLINE_ERROR',

  // 安全错误
  SECURITY_ERROR = 'SECURITY_ERROR',
  CSP_VIOLATION = 'CSP_VIOLATION',
  INVALID_CERTIFICATE = 'INVALID_CERTIFICATE',

  // 未知错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * PDF错误类
 */
export class PDFError extends Error {
  public readonly code: PDFErrorCode;
  public readonly originalError?: Error;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: number;
  public readonly recoverable: boolean;
  public readonly retryable: boolean;
  public readonly userMessage: string;

  constructor(options: {
    code: PDFErrorCode;
    message: string;
    originalError?: Error;
    context?: Record<string, unknown>;
    recoverable?: boolean;
    retryable?: boolean;
    userMessage?: string;
  }) {
    super(options.message);
    this.name = 'PDFError';
    this.code = options.code;
    this.originalError = options.originalError;
    this.context = options.context;
    this.recoverable = options.recoverable ?? false;
    this.retryable = options.retryable ?? false;
    this.userMessage = options.userMessage ?? this.getDefaultUserMessage();
    this.timestamp = Date.now();

    // 保持原型链
    Object.setPrototypeOf(this, PDFError.prototype);
  }

  private getDefaultUserMessage(): string {
    const messages: Record<PDFErrorCode, string> = {
      [PDFErrorCode.DOCUMENT_LOAD_FAILED]: '无法加载PDF文档',
      [PDFErrorCode.DOCUMENT_INVALID]: '无效的PDF文档',
      [PDFErrorCode.DOCUMENT_PASSWORD_REQUIRED]: '需要密码才能打开此文档',
      [PDFErrorCode.DOCUMENT_PASSWORD_INCORRECT]: '密码不正确',
      [PDFErrorCode.DOCUMENT_CORRUPTED]: 'PDF文档已损坏',
      [PDFErrorCode.RENDER_FAILED]: '页面渲染失败',
      [PDFErrorCode.PAGE_NOT_FOUND]: '找不到指定页面',
      [PDFErrorCode.CANVAS_ERROR]: 'Canvas渲染错误',
      [PDFErrorCode.CONTEXT_LOST]: 'WebGL上下文丢失',
      [PDFErrorCode.WORKER_LOAD_FAILED]: 'PDF工作线程加载失败',
      [PDFErrorCode.FONT_LOAD_FAILED]: '字体加载失败',
      [PDFErrorCode.CMAP_LOAD_FAILED]: '字符映射加载失败',
      [PDFErrorCode.RESOURCE_NOT_FOUND]: '资源未找到',
      [PDFErrorCode.FEATURE_NOT_SUPPORTED]: '此功能不受支持',
      [PDFErrorCode.BROWSER_NOT_SUPPORTED]: '浏览器不支持此功能',
      [PDFErrorCode.INVALID_PARAMETER]: '参数无效',
      [PDFErrorCode.OPERATION_CANCELLED]: '操作已取消',
      [PDFErrorCode.OPERATION_TIMEOUT]: '操作超时',
      [PDFErrorCode.OUT_OF_MEMORY]: '内存不足',
      [PDFErrorCode.QUOTA_EXCEEDED]: '存储空间已满',
      [PDFErrorCode.CACHE_FULL]: '缓存已满',
      [PDFErrorCode.NETWORK_ERROR]: '网络错误',
      [PDFErrorCode.CORS_ERROR]: '跨域访问被拒绝',
      [PDFErrorCode.TIMEOUT_ERROR]: '请求超时',
      [PDFErrorCode.OFFLINE_ERROR]: '当前处于离线状态',
      [PDFErrorCode.SECURITY_ERROR]: '安全错误',
      [PDFErrorCode.CSP_VIOLATION]: '内容安全策略违规',
      [PDFErrorCode.INVALID_CERTIFICATE]: '证书无效',
      [PDFErrorCode.UNKNOWN_ERROR]: '发生未知错误'
    };

    return messages[this.code] || '操作失败';
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      recoverable: this.recoverable,
      retryable: this.retryable,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack,
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
        stack: this.originalError.stack
      } : undefined
    };
  }
}

// ============ 表单相关类型 ============

/**
 * 表单字段类型
 */
export type FormFieldType = 
  | 'text' 
  | 'password'
  | 'email'
  | 'number'
  | 'checkbox' 
  | 'radio' 
  | 'select' 
  | 'multiselect'
  | 'date'
  | 'time'
  | 'datetime'
  | 'file'
  | 'signature'
  | 'button';

/**
 * 表单字段验证规则
 */
export interface FormFieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp | string;
  min?: number;
  max?: number;
  email?: boolean;
  url?: boolean;
  custom?: (value: unknown) => boolean | string;
}

/**
 * 表单字段接口
 */
export interface FormField {
  id: string;
  name: string;
  type: FormFieldType;
  pageNumber: number;
  position: Rectangle;
  value?: unknown;
  defaultValue?: unknown;
  placeholder?: string;
  label?: string;
  required?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  visible?: boolean;
  options?: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  validation?: FormFieldValidation;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * 表单数据
 */
export type FormData = Map<string, unknown>;

// ============ 几何类型 ============

/**
 * 点
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * 矩形
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 边界框
 */
export interface BoundingBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

// ============ 注释类型 ============

/**
 * 注释类型
 */
export type AnnotationType = 
  | 'text'
  | 'highlight'
  | 'underline'
  | 'strikeout'
  | 'squiggly'
  | 'note'
  | 'circle'
  | 'square'
  | 'arrow'
  | 'line'
  | 'polygon'
  | 'polyline'
  | 'ink'
  | 'stamp'
  | 'image'
  | 'redaction';

/**
 * 注释接口
 */
export interface Annotation {
  id: string;
  type: AnnotationType;
  pageNumber: number;
  position: Rectangle;
  color?: string;
  opacity?: number;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  content?: string;
  author?: string;
  subject?: string;
  createdAt: Date;
  modifiedAt?: Date;
  replies?: AnnotationReply[];
  flags?: AnnotationFlags;
  customData?: Record<string, unknown>;
}

/**
 * 注释回复
 */
export interface AnnotationReply {
  id: string;
  annotationId: string;
  content: string;
  author: string;
  createdAt: Date;
  modifiedAt?: Date;
}

/**
 * 注释标记
 */
export interface AnnotationFlags {
  invisible?: boolean;
  hidden?: boolean;
  print?: boolean;
  noZoom?: boolean;
  noRotate?: boolean;
  noView?: boolean;
  readOnly?: boolean;
  locked?: boolean;
  toggleNoView?: boolean;
  lockedContents?: boolean;
}

// ============ 书签类型 ============

/**
 * 书签接口
 */
export interface Bookmark {
  id: string;
  title: string;
  pageNumber: number;
  position?: Point;
  zoom?: number;
  parentId?: string;
  children?: Bookmark[];
  color?: string;
  bold?: boolean;
  italic?: boolean;
  createdAt: Date;
  modifiedAt?: Date;
  customData?: Record<string, unknown>;
}

// ============ 搜索类型 ============

/**
 * 搜索选项
 */
export interface SearchOptions {
  caseSensitive?: boolean;
  entireWord?: boolean;
  regex?: boolean;
  highlightAll?: boolean;
  findPrevious?: boolean;
  pageRange?: {
    start: number;
    end: number;
  };
  maxResults?: number;
}

/**
 * 搜索结果
 */
export interface SearchResult {
  pageNumber: number;
  matches: SearchMatch[];
}

/**
 * 搜索匹配
 */
export interface SearchMatch {
  text: string;
  position: Rectangle;
  context?: {
    before: string;
    after: string;
  };
}

// ============ 性能类型 ============

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  fps: number;
  pageLoadTime: number;
  cacheHitRate: number;
  [key: string]: number;
}

/**
 * 性能阈值
 */
export interface PerformanceThresholds {
  maxRenderTime?: number;
  maxMemoryUsage?: number;
  minFPS?: number;
  maxPageLoadTime?: number;
  minCacheHitRate?: number;
}

// ============ 工具函数类型守卫 ============

/**
 * 检查是否为有效的缩放值
 */
export function isValidScale(value: unknown): value is number {
  return typeof value === 'number' && value > 0 && value <= 10;
}

/**
 * 检查是否为有效的页码
 */
export function isValidPageNumber(value: unknown, totalPages: number): value is number {
  return typeof value === 'number' && 
         Number.isInteger(value) && 
         value >= 1 && 
         value <= totalPages;
}

/**
 * 检查是否为PDF错误
 */
export function isPDFError(error: unknown): error is PDFError {
  return error instanceof PDFError;
}

/**
 * 检查是否为有效的旋转角度
 */
export function isValidRotation(value: unknown): value is 0 | 90 | 180 | 270 {
  return typeof value === 'number' && [0, 90, 180, 270].includes(value);
}

// ============ 辅助类型 ============

/**
 * 深度部分类型
 */
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = T extends (infer R)[] ? 
  DeepReadonlyArray<R> :
  T extends Function ? 
    T : 
    T extends object ? 
      DeepReadonlyObject<T> : 
      T;

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

/**
 * 可空类型
 */
export type Nullable<T> = T | null;

/**
 * 可选类型
 */
export type Optional<T> = T | undefined;

/**
 * 可能类型
 */
export type Maybe<T> = T | null | undefined;

/**
 * 提取Promise类型
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * 非空数组
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * 字符串字面量联合类型
 */
export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never;