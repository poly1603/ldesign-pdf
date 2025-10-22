/**
 * Canvas对象池 - 复用Canvas避免频繁创建销毁
 * Canvas Object Pool for performance optimization
 */

export interface CanvasPoolOptions {
  maxPoolSize?: number;
  initialSize?: number;
  enableAutoCleanup?: boolean;
  cleanupInterval?: number; // 毫秒
}

export class CanvasPool {
  private pool: HTMLCanvasElement[] = [];
  private inUse = new Set<HTMLCanvasElement>();
  private maxPoolSize: number;
  private enableAutoCleanup: boolean;
  private cleanupTimer: any = null;

  // 统计信息
  private stats = {
    created: 0,
    reused: 0,
    destroyed: 0,
    currentPoolSize: 0,
    currentInUse: 0
  };

  constructor(options: CanvasPoolOptions = {}) {
    this.maxPoolSize = options.maxPoolSize || 20;
    this.enableAutoCleanup = options.enableAutoCleanup ?? true;

    // 预创建一些Canvas
    const initialSize = options.initialSize || 3;
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createCanvas());
    }

    // 启动自动清理
    if (this.enableAutoCleanup) {
      this.startAutoCleanup(options.cleanupInterval || 30000); // 默认30秒
    }
  }

  /**
   * 获取一个Canvas
   */
  acquire(width?: number, height?: number): HTMLCanvasElement {
    let canvas: HTMLCanvasElement;

    if (this.pool.length > 0) {
      // 从池中获取
      canvas = this.pool.pop()!;
      this.stats.reused++;
    } else {
      // 创建新的
      canvas = this.createCanvas();
      this.stats.created++;
    }

    // 设置尺寸
    if (width !== undefined && height !== undefined) {
      canvas.width = width;
      canvas.height = height;
    }

    // 清空内容
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    this.inUse.add(canvas);
    this.updateStats();

    return canvas;
  }

  /**
   * 归还Canvas到池中
   */
  release(canvas: HTMLCanvasElement): void {
    if (!this.inUse.has(canvas)) {
      console.warn('Attempting to release a canvas that is not in use');
      return;
    }

    this.inUse.delete(canvas);

    // 检查池是否已满
    if (this.pool.length < this.maxPoolSize) {
      // 重置Canvas但保留对象
      this.resetCanvas(canvas);
      this.pool.push(canvas);
    } else {
      // 池已满，销毁Canvas
      this.destroyCanvas(canvas);
      this.stats.destroyed++;
    }

    this.updateStats();
  }

  /**
   * 批量归还Canvas
   */
  releaseAll(canvases: HTMLCanvasElement[]): void {
    canvases.forEach(canvas => this.release(canvas));
  }

  /**
   * 创建新Canvas
   */
  private createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    // 设置默认尺寸
    canvas.width = 1;
    canvas.height = 1;
    return canvas;
  }

  /**
   * 重置Canvas状态
   */
  private resetCanvas(canvas: HTMLCanvasElement): void {
    // 清空内容
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0); // 重置变换
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // 重置尺寸为最小值以释放内存
    canvas.width = 1;
    canvas.height = 1;

    // 移除所有属性
    canvas.className = '';
    canvas.style.cssText = '';
  }

  /**
   * 销毁Canvas
   */
  private destroyCanvas(canvas: HTMLCanvasElement): void {
    canvas.width = 0;
    canvas.height = 0;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 1, 1);
    }
  }

  /**
   * 清理未使用的Canvas
   */
  cleanup(): void {
    const cleanupCount = Math.max(0, this.pool.length - Math.floor(this.maxPoolSize / 2));

    for (let i = 0; i < cleanupCount; i++) {
      const canvas = this.pool.pop();
      if (canvas) {
        this.destroyCanvas(canvas);
        this.stats.destroyed++;
      }
    }

    this.updateStats();
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(interval: number): void {
    this.stopAutoCleanup();

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, interval);
  }

  /**
   * 停止自动清理
   */
  private stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    this.stats.currentPoolSize = this.pool.length;
    this.stats.currentInUse = this.inUse.size;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.stats,
      totalAllocated: this.stats.created,
      reuseRate: this.stats.created > 0
        ? ((this.stats.reused / (this.stats.created + this.stats.reused)) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  /**
   * 清空池
   */
  clear(): void {
    // 销毁池中所有Canvas
    this.pool.forEach(canvas => this.destroyCanvas(canvas));
    this.pool = [];

    // 警告：仍在使用的Canvas
    if (this.inUse.size > 0) {
      console.warn(`CanvasPool.clear(): ${this.inUse.size} canvases still in use`);
    }

    this.updateStats();
  }

  /**
   * 获取池状态
   */
  getStatus() {
    return {
      available: this.pool.length,
      inUse: this.inUse.size,
      total: this.pool.length + this.inUse.size,
      maxSize: this.maxPoolSize,
      utilizationRate: this.maxPoolSize > 0
        ? ((this.inUse.size / this.maxPoolSize) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  /**
   * 销毁对象池
   */
  destroy(): void {
    this.stopAutoCleanup();
    this.clear();
    this.inUse.clear();
    this.stats = {
      created: 0,
      reused: 0,
      destroyed: 0,
      currentPoolSize: 0,
      currentInUse: 0
    };
  }
}

// 导出全局单例
export const globalCanvasPool = new CanvasPool({
  maxPoolSize: 20,
  initialSize: 5,
  enableAutoCleanup: true,
  cleanupInterval: 30000
});

