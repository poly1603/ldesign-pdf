/**
 * 页面缓存管理器 - 实现LRU缓存策略
 * Page Cache Manager with LRU (Least Recently Used) strategy
 */

export interface CachedPage {
  pageNumber: number;
  canvas: HTMLCanvasElement;
  timestamp: number;
  size: number; // 内存占用估算（字节）
  lastAccessed: number;
}

export interface CacheOptions {
  maxCacheSize?: number; // 最大缓存页数
  maxMemoryMB?: number; // 最大内存占用（MB）
  enableMemoryMonitoring?: boolean;
}

export class PageCacheManager {
  private cache = new Map<number, CachedPage>();
  private accessOrder: number[] = []; // LRU队列
  private maxCacheSize: number;
  private maxMemoryBytes: number;
  private currentMemoryUsage: number = 0;
  private enableMemoryMonitoring: boolean;

  // 性能监控
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalMemoryFreed: 0
  };

  constructor(options: CacheOptions = {}) {
    this.maxCacheSize = options.maxCacheSize || 10;
    this.maxMemoryBytes = (options.maxMemoryMB || 50) * 1024 * 1024; // 默认50MB
    this.enableMemoryMonitoring = options.enableMemoryMonitoring ?? true;
  }

  /**
   * 获取缓存的页面
   */
  get(pageNumber: number): CachedPage | null {
    const cached = this.cache.get(pageNumber);

    if (cached) {
      // 更新访问时间和顺序
      cached.lastAccessed = Date.now();
      this.updateAccessOrder(pageNumber);
      this.stats.hits++;
      return cached;
    }

    this.stats.misses++;
    return null;
  }

  /**
   * 添加页面到缓存
   */
  set(pageNumber: number, canvas: HTMLCanvasElement): void {
    // 计算内存占用
    const size = this.estimateCanvasSize(canvas);

    // 检查是否需要清理
    this.ensureCapacity(size);

    const cachedPage: CachedPage = {
      pageNumber,
      canvas: this.cloneCanvas(canvas),
      timestamp: Date.now(),
      size,
      lastAccessed: Date.now()
    };

    // 如果已存在，先删除旧的
    if (this.cache.has(pageNumber)) {
      this.remove(pageNumber);
    }

    this.cache.set(pageNumber, cachedPage);
    this.accessOrder.push(pageNumber);
    this.currentMemoryUsage += size;
  }

  /**
   * 移除指定页面
   */
  remove(pageNumber: number): boolean {
    const cached = this.cache.get(pageNumber);
    if (!cached) return false;

    this.cache.delete(pageNumber);
    this.currentMemoryUsage -= cached.size;
    this.accessOrder = this.accessOrder.filter(n => n !== pageNumber);

    // 释放Canvas资源
    this.releaseCanvas(cached.canvas);

    return true;
  }

  /**
   * 确保有足够容量
   */
  private ensureCapacity(requiredSize: number): void {
    // 检查页数限制
    while (this.cache.size >= this.maxCacheSize && this.accessOrder.length > 0) {
      this.evictLRU();
    }

    // 检查内存限制
    while (this.currentMemoryUsage + requiredSize > this.maxMemoryBytes && this.accessOrder.length > 0) {
      this.evictLRU();
    }
  }

  /**
   * 驱逐最少使用的页面 (LRU)
   */
  private evictLRU(): void {
    if (this.accessOrder.length === 0) return;

    const pageNumberToEvict = this.accessOrder.shift()!;
    const cached = this.cache.get(pageNumberToEvict);

    if (cached) {
      this.stats.evictions++;
      this.stats.totalMemoryFreed += cached.size;
      this.currentMemoryUsage -= cached.size;
      this.cache.delete(pageNumberToEvict);
      this.releaseCanvas(cached.canvas);
    }
  }

  /**
   * 更新访问顺序（将页面移到队列末尾）
   */
  private updateAccessOrder(pageNumber: number): void {
    const index = this.accessOrder.indexOf(pageNumber);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
      this.accessOrder.push(pageNumber);
    }
  }

  /**
   * 估算Canvas内存占用
   */
  private estimateCanvasSize(canvas: HTMLCanvasElement): number {
    // 每个像素4字节 (RGBA)
    return canvas.width * canvas.height * 4;
  }

  /**
   * 克隆Canvas
   */
  private cloneCanvas(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
    const clonedCanvas = document.createElement('canvas');
    clonedCanvas.width = sourceCanvas.width;
    clonedCanvas.height = sourceCanvas.height;

    const ctx = clonedCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(sourceCanvas, 0, 0);
    }

    return clonedCanvas;
  }

  /**
   * 释放Canvas资源
   */
  private releaseCanvas(canvas: HTMLCanvasElement): void {
    // 清空canvas内容释放内存
    canvas.width = 0;
    canvas.height = 0;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 1, 1);
    }
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    for (const cached of this.cache.values()) {
      this.releaseCanvas(cached.canvas);
    }

    this.cache.clear();
    this.accessOrder = [];
    this.currentMemoryUsage = 0;
  }

  /**
   * 预加载指定范围的页面
   */
  preload(pageNumbers: number[]): number[] {
    return pageNumbers.filter(num => !this.cache.has(num));
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : '0.00';

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      currentSize: this.cache.size,
      currentMemoryMB: (this.currentMemoryUsage / 1024 / 1024).toFixed(2),
      maxMemoryMB: (this.maxMemoryBytes / 1024 / 1024).toFixed(2),
      memoryUsagePercent: ((this.currentMemoryUsage / this.maxMemoryBytes) * 100).toFixed(2) + '%'
    };
  }

  /**
   * 检查是否有页面被缓存
   */
  has(pageNumber: number): boolean {
    return this.cache.has(pageNumber);
  }

  /**
   * 获取当前缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 获取当前内存占用（MB）
   */
  getMemoryUsage(): number {
    return this.currentMemoryUsage / 1024 / 1024;
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    this.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalMemoryFreed: 0
    };
  }
}

