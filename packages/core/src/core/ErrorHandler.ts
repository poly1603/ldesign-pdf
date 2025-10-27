/**
 * 统一错误处理系统
 * Unified error handling system
 */

import { Logger, LogLevel } from './Logger';

export enum ErrorCode {
  // 文档错误
  DOCUMENT_LOAD_FAILED = 'DOCUMENT_LOAD_FAILED',
  DOCUMENT_INVALID = 'DOCUMENT_INVALID',
  DOCUMENT_PASSWORD_REQUIRED = 'DOCUMENT_PASSWORD_REQUIRED',
  DOCUMENT_PASSWORD_INCORRECT = 'DOCUMENT_PASSWORD_INCORRECT',

  // 渲染错误
  RENDER_FAILED = 'RENDER_FAILED',
  PAGE_NOT_FOUND = 'PAGE_NOT_FOUND',
  CANVAS_ERROR = 'CANVAS_ERROR',

  // 资源错误
  WORKER_LOAD_FAILED = 'WORKER_LOAD_FAILED',
  FONT_LOAD_FAILED = 'FONT_LOAD_FAILED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

  // 功能错误
  FEATURE_NOT_SUPPORTED = 'FEATURE_NOT_SUPPORTED',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  OPERATION_CANCELLED = 'OPERATION_CANCELLED',

  // 内存错误
  OUT_OF_MEMORY = 'OUT_OF_MEMORY',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',

  // 网络错误
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // 未知错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class PDFError extends Error {
  public readonly code: ErrorCode;
  public readonly originalError?: Error;
  public readonly context?: any;
  public readonly timestamp: number;
  public readonly recoverable: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    options: {
      originalError?: Error;
      context?: any;
      recoverable?: boolean;
    } = {}
  ) {
    super(message);
    this.name = 'PDFError';
    this.code = code;
    this.originalError = options.originalError;
    this.context = options.context;
    this.recoverable = options.recoverable ?? false;
    this.timestamp = Date.now();

    // 保持正确的原型链
    Object.setPrototypeOf(this, PDFError.prototype);
  }

  /**
   * 转换为JSON
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      recoverable: this.recoverable,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack,
      originalError: this.originalError ? {
        message: this.originalError.message,
        stack: this.originalError.stack
      } : undefined
    };
  }

  /**
   * 获取用户友好的错误消息
   */
  getUserMessage(): string {
    const messages: Record<ErrorCode, string> = {
      [ErrorCode.DOCUMENT_LOAD_FAILED]: '无法加载PDF文档，请检查文件路径或网络连接',
      [ErrorCode.DOCUMENT_INVALID]: '无效的PDF文档格式',
      [ErrorCode.DOCUMENT_PASSWORD_REQUIRED]: '此PDF文档需要密码',
      [ErrorCode.DOCUMENT_PASSWORD_INCORRECT]: '密码不正确',
      [ErrorCode.RENDER_FAILED]: '页面渲染失败',
      [ErrorCode.PAGE_NOT_FOUND]: '找不到指定的页面',
      [ErrorCode.CANVAS_ERROR]: 'Canvas渲染错误',
      [ErrorCode.WORKER_LOAD_FAILED]: 'PDF工作线程加载失败',
      [ErrorCode.FONT_LOAD_FAILED]: '字体加载失败',
      [ErrorCode.RESOURCE_NOT_FOUND]: '资源未找到',
      [ErrorCode.FEATURE_NOT_SUPPORTED]: '您的浏览器不支持此功能',
      [ErrorCode.INVALID_PARAMETER]: '参数无效',
      [ErrorCode.OPERATION_CANCELLED]: '操作已取消',
      [ErrorCode.OUT_OF_MEMORY]: '内存不足',
      [ErrorCode.QUOTA_EXCEEDED]: '存储配额已超出',
      [ErrorCode.NETWORK_ERROR]: '网络错误',
      [ErrorCode.TIMEOUT_ERROR]: '操作超时',
      [ErrorCode.UNKNOWN_ERROR]: '发生未知错误'
    };

    return messages[this.code] || this.message;
  }
}

export interface ErrorHandlerOptions {
  logger?: Logger;
  onError?: (error: PDFError) => void;
  enableUserNotification?: boolean;
  enableErrorRecovery?: boolean;
}

export class ErrorHandler {
  private logger: Logger;
  private onErrorCallback?: (error: PDFError) => void;
  private enableUserNotification: boolean;
  private enableErrorRecovery: boolean;
  private errorCounts = new Map<ErrorCode, number>();

  constructor(options: ErrorHandlerOptions = {}) {
    this.logger = options.logger || new Logger('ErrorHandler', {
      level: LogLevel.ERROR,
      enableConsole: true
    });
    this.onErrorCallback = options.onError;
    this.enableUserNotification = options.enableUserNotification ?? true;
    this.enableErrorRecovery = options.enableErrorRecovery ?? true;
  }

  /**
   * 处理错误
   */
  handle(error: Error | PDFError, context?: any): void {
    const pdfError = error instanceof PDFError
      ? error
      : this.wrapError(error, context);

    // 记录错误
    this.logger.error(pdfError.message, {
      code: pdfError.code,
      context: pdfError.context,
      stack: pdfError.stack,
      originalError: pdfError.originalError
    });

    // 统计错误次数
    const count = (this.errorCounts.get(pdfError.code) || 0) + 1;
    this.errorCounts.set(pdfError.code, count);

    // 用户通知
    if (this.enableUserNotification) {
      this.notifyUser(pdfError);
    }

    // 回调
    if (this.onErrorCallback) {
      try {
        this.onErrorCallback(pdfError);
      } catch (callbackError) {
        this.logger.error('Error in error callback', callbackError);
      }
    }

    // 尝试恢复
    if (this.enableErrorRecovery && pdfError.recoverable) {
      this.attemptRecovery(pdfError);
    }
  }

  /**
   * 包装普通错误为PDFError
   */
  private wrapError(error: Error, context?: any): PDFError {
    // 尝试推断错误类型
    const code = this.inferErrorCode(error);

    return new PDFError(code, error.message, {
      originalError: error,
      context,
      recoverable: this.isRecoverable(code)
    });
  }

  /**
   * 推断错误代码
   */
  private inferErrorCode(error: Error): ErrorCode {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return ErrorCode.NETWORK_ERROR;
    }
    if (message.includes('timeout')) {
      return ErrorCode.TIMEOUT_ERROR;
    }
    if (message.includes('password')) {
      return ErrorCode.DOCUMENT_PASSWORD_REQUIRED;
    }
    if (message.includes('memory') || message.includes('quota')) {
      return ErrorCode.OUT_OF_MEMORY;
    }
    if (message.includes('worker')) {
      return ErrorCode.WORKER_LOAD_FAILED;
    }
    if (message.includes('render')) {
      return ErrorCode.RENDER_FAILED;
    }

    return ErrorCode.UNKNOWN_ERROR;
  }

  /**
   * 判断错误是否可恢复
   */
  private isRecoverable(code: ErrorCode): boolean {
    const recoverableErrors = new Set([
      ErrorCode.RENDER_FAILED,
      ErrorCode.NETWORK_ERROR,
      ErrorCode.TIMEOUT_ERROR,
      ErrorCode.CANVAS_ERROR
    ]);

    return recoverableErrors.has(code);
  }

  /**
   * 通知用户
   */
  private notifyUser(error: PDFError): void {
    // 这里可以集成UI通知系统
    // 目前只是控制台输出
    console.error(`[PDF Viewer Error] ${error.getUserMessage()}`);
  }

  /**
   * 尝试错误恢复
   */
  private attemptRecovery(error: PDFError): void {
    this.logger.info(`Attempting recovery for error: ${error.code}`);

    // 根据错误类型执行不同的恢复策略
    switch (error.code) {
      case ErrorCode.RENDER_FAILED:
        // 可以尝试重新渲染
        this.logger.info('Retrying render...');
        break;

      case ErrorCode.NETWORK_ERROR:
        // 可以尝试重新加载
        this.logger.info('Retrying network request...');
        break;

      case ErrorCode.CANVAS_ERROR:
        // 可以尝试重新创建Canvas
        this.logger.info('Recreating canvas...');
        break;

      default:
        this.logger.warn(`No recovery strategy for error: ${error.code}`);
    }
  }

  /**
   * 创建PDFError
   */
  createError(
    code: ErrorCode,
    message: string,
    options?: {
      originalError?: Error;
      context?: any;
      recoverable?: boolean;
    }
  ): PDFError {
    return new PDFError(code, message, options);
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): Map<ErrorCode, number> {
    return new Map(this.errorCounts);
  }

  /**
   * 清除错误统计
   */
  clearStats(): void {
    this.errorCounts.clear();
  }

  /**
   * 获取最常见的错误
   */
  getMostCommonErrors(limit: number = 5): Array<{ code: ErrorCode; count: number }> {
    return Array.from(this.errorCounts.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

// 导出全局错误处理器
export const globalErrorHandler = new ErrorHandler({
  enableUserNotification: true,
  enableErrorRecovery: true
});

