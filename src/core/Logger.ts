/**
 * 分级日志系统
 * Hierarchical logging system
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

export interface LogEntry {
  level: LogLevel;
  timestamp: number;
  message: string;
  data?: any;
  context?: string;
}

export interface LoggerOptions {
  level?: LogLevel;
  enableConsole?: boolean;
  enableStorage?: boolean;
  maxStorageSize?: number;
  onLog?: (entry: LogEntry) => void;
}

export class Logger {
  private level: LogLevel;
  private enableConsole: boolean;
  private enableStorage: boolean;
  private maxStorageSize: number;
  private logs: LogEntry[] = [];
  private onLogCallback?: (entry: LogEntry) => void;
  private context: string;

  constructor(context: string = 'PDFViewer', options: LoggerOptions = {}) {
    this.context = context;
    this.level = options.level ?? LogLevel.WARN;
    this.enableConsole = options.enableConsole ?? true;
    this.enableStorage = options.enableStorage ?? false;
    this.maxStorageSize = options.maxStorageSize || 100;
    this.onLogCallback = options.onLog;
  }

  /**
   * Debug级别日志
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Info级别日志
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Warning级别日志
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Error级别日志
   */
  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * 核心日志方法
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (level < this.level) {
      return; // 低于当前级别，不记录
    }

    const entry: LogEntry = {
      level,
      timestamp: Date.now(),
      message,
      data,
      context: this.context
    };

    // 控制台输出
    if (this.enableConsole) {
      this.logToConsole(entry);
    }

    // 存储日志
    if (this.enableStorage) {
      this.storeLog(entry);
    }

    // 回调
    if (this.onLogCallback) {
      try {
        this.onLogCallback(entry);
      } catch (error) {
        console.error('Logger callback error:', error);
      }
    }
  }

  /**
   * 输出到控制台
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${this.context}] [${this.getLevelName(entry.level)}]`;
    const time = new Date(entry.timestamp).toISOString();
    const message = `${prefix} ${time} - ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(message, entry.data || '');
        break;
    }
  }

  /**
   * 存储日志
   */
  private storeLog(entry: LogEntry): void {
    this.logs.push(entry);

    // 限制存储大小
    if (this.logs.length > this.maxStorageSize) {
      this.logs.shift(); // 移除最旧的日志
    }
  }

  /**
   * 获取级别名称
   */
  private getLevelName(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return 'DEBUG';
      case LogLevel.INFO: return 'INFO';
      case LogLevel.WARN: return 'WARN';
      case LogLevel.ERROR: return 'ERROR';
      default: return 'UNKNOWN';
    }
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * 获取当前日志级别
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * 获取存储的日志
   */
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * 导出日志为文本
   */
  exportLogs(): string {
    return this.logs.map(entry => {
      const time = new Date(entry.timestamp).toISOString();
      const level = this.getLevelName(entry.level);
      const data = entry.data ? `\nData: ${JSON.stringify(entry.data, null, 2)}` : '';
      return `[${time}] [${level}] [${entry.context}] ${entry.message}${data}`;
    }).join('\n\n');
  }

  /**
   * 清空日志
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * 创建子Logger（继承配置但使用不同上下文）
   */
  createChild(context: string): Logger {
    return new Logger(context, {
      level: this.level,
      enableConsole: this.enableConsole,
      enableStorage: this.enableStorage,
      maxStorageSize: this.maxStorageSize,
      onLog: this.onLogCallback
    });
  }
}

// 导出全局Logger实例
export const globalLogger = new Logger('PDFViewer', {
  level: LogLevel.WARN,
  enableConsole: true,
  enableStorage: false
});

