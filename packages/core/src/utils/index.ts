/**
 * 工具函数集合
 * Utility functions
 */

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: any;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;

    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * 深度克隆
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }

  if (obj instanceof Object) {
    const clonedObj = {} as T;

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }

    return clonedObj;
  }

  return obj;
}

/**
 * 生成唯一ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 格式化时间
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;

  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);

  return `${minutes}:${seconds.padStart(2, '0')}`;
}

/**
 * 休眠函数
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2,
    onRetry
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts) {
        if (onRetry) {
          onRetry(attempt, error);
        }

        const waitTime = delay * Math.pow(backoff, attempt - 1);
        await sleep(waitTime);
      }
    }
  }

  throw lastError;
}

/**
 * 批处理
 */
export async function batch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batchItems = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batchItems.map(processor));
    results.push(...batchResults);
  }

  return results;
}

/**
 * 限制并发数
 */
export async function concurrent<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number = 3
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  const executing: Promise<void>[] = [];

  for (let i = 0; i < items.length; i++) {
    const index = i;
    const item = items[i];

    const promise = processor(item).then(result => {
      results[index] = result;
    });

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      const completedIndex = executing.findIndex(p =>
        Promise.race([p, Promise.resolve()]).then(() => true)
      );
      if (completedIndex >= 0) {
        executing.splice(completedIndex, 1);
      }
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * 检测浏览器特性
 */
export const browserFeatures = {
  hasIntersectionObserver: typeof IntersectionObserver !== 'undefined',
  hasResizeObserver: typeof ResizeObserver !== 'undefined',
  hasRequestIdleCallback: typeof requestIdleCallback !== 'undefined',
  hasOffscreenCanvas: typeof OffscreenCanvas !== 'undefined',
  hasWebWorker: typeof Worker !== 'undefined',
  hasIndexedDB: typeof indexedDB !== 'undefined',
  hasLocalStorage: typeof localStorage !== 'undefined',
  hasSessionStorage: typeof sessionStorage !== 'undefined',
  hasTouchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  hasPointerEvents: typeof PointerEvent !== 'undefined',
  hasClipboardAPI: typeof navigator.clipboard !== 'undefined',
  hasFileSystemAccess: 'showSaveFilePicker' in window,
};

/**
 * 检测是否为移动设备
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * 检测是否为触摸设备
 */
export function isTouchDevice(): boolean {
  return browserFeatures.hasTouchSupport;
}

/**
 * 获取设备像素比
 */
export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1;
}

/**
 * 限制数值范围
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 线性插值
 */
export function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}

/**
 * 数组去重
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * 数组分组
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

/**
 * 对象合并（深度）
 */
export function mergeDeep<T extends object>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (source) {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = target[key];

        if (
          sourceValue &&
          typeof sourceValue === 'object' &&
          !Array.isArray(sourceValue) &&
          targetValue &&
          typeof targetValue === 'object' &&
          !Array.isArray(targetValue)
        ) {
          target[key] = mergeDeep(targetValue as any, sourceValue as any);
        } else {
          target[key] = sourceValue as any;
        }
      }
    }
  }

  return mergeDeep(target, ...sources);
}

/**
 * 安全的JSON解析
 */
export function safeJSONParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
}

/**
 * 下载文件
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * 复制到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  // 降级方案
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    document.body.removeChild(textarea);
    return false;
  }
}

/**
 * 创建事件
 */
export function createEvent<T = any>(type: string, detail?: T): CustomEvent<T> {
  return new CustomEvent(type, { detail });
}

