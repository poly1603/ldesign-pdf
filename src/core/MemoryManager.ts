/**
 * 高级内存管理器
 * Advanced Memory Manager for PDF Viewer
 */

import { Logger } from './Logger';
import { PerformanceMonitor } from './PerformanceMonitor';

/**
 * 内存使用统计
 */
export interface MemoryStats {
  used: number;
  limit: number;
  percentage: number;
  allocations: number;
  deallocations: number;
  leaks: number;
}

/**
 * 内存分配记录
 */
interface MemoryAllocation {
  id: string;
  size: number;
  type: string;
  timestamp: number;
  weakRef?: WeakRef<object>;
  freed?: boolean;
}

/**
 * 内存管理配置
 */
export interface MemoryManagerOptions {
  maxMemoryMB?: number;
  warningThresholdPercent?: number;
  criticalThresholdPercent?: number;
  gcInterval?: number;
  enableAutoCleanup?: boolean;
  enableLeakDetection?: boolean;
  logger?: Logger;
  performanceMonitor?: PerformanceMonitor;
}

/**
 * 内存管理器
 */
export class MemoryManager {
  private readonly maxMemory: number;
  private readonly warningThreshold: number;
  private readonly criticalThreshold: number;
  private readonly logger: Logger;
  private readonly performanceMonitor?: PerformanceMonitor;
  
  private allocations = new Map<string, MemoryAllocation>();
  private totalAllocated = 0;
  private gcTimer?: number;
  private leakDetectionTimer?: number;
  
  // 缓存池
  private canvasPool: HTMLCanvasElement[] = [];
  private arrayBufferPool: ArrayBuffer[] = [];
  private typedArrayPool = new Map<string, any[]>();
  
  // 内存压力回调
  private pressureCallbacks = new Set<(stats: MemoryStats) => void>();

  constructor(options: MemoryManagerOptions = {}) {
    this.maxMemory = (options.maxMemoryMB || 500) * 1024 * 1024;
    this.warningThreshold = (options.warningThresholdPercent || 70) / 100;
    this.criticalThreshold = (options.criticalThresholdPercent || 90) / 100;
    this.logger = options.logger || new Logger('MemoryManager');
    this.performanceMonitor = options.performanceMonitor;
    
    if (options.enableAutoCleanup !== false) {
      this.startAutoCleanup(options.gcInterval || 30000);
    }
    
    if (options.enableLeakDetection) {
      this.startLeakDetection();
    }
    
    this.setupMemoryPressureAPI();
  }

  /**
   * 分配内存
   */
  allocate<T extends object>(
    object: T,
    size: number,
    type: string = 'unknown'
  ): T {
    const id = this.generateId();
    
    const allocation: MemoryAllocation = {
      id,
      size,
      type,
      timestamp: Date.now(),
      weakRef: new WeakRef(object)
    };
    
    this.allocations.set(id, allocation);
    this.totalAllocated += size;
    
    // 检查内存压力
    this.checkMemoryPressure();
    
    // 记录性能指标
    if (this.performanceMonitor) {
      this.performanceMonitor.recordMetric('memory-allocation', size, { type });
    }
    
    return object;
  }

  /**
   * 释放内存
   */
  deallocate(id: string): boolean {
    const allocation = this.allocations.get(id);
    if (!allocation || allocation.freed) {
      return false;
    }
    
    allocation.freed = true;
    this.totalAllocated -= allocation.size;
    
    // 延迟删除记录，用于泄漏检测
    setTimeout(() => {
      this.allocations.delete(id);
    }, 5000);
    
    return true;
  }

  /**
   * 获取或创建Canvas
   */
  getCanvas(width: number, height: number): HTMLCanvasElement {
    // 尝试从池中获取
    const pooled = this.canvasPool.find(canvas => 
      canvas.width === width && canvas.height === height
    );
    
    if (pooled) {
      this.canvasPool = this.canvasPool.filter(c => c !== pooled);
      const ctx = pooled.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
      }
      return pooled;
    }
    
    // 创建新的Canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const size = width * height * 4; // RGBA
    this.allocate(canvas, size, 'canvas');
    
    return canvas;
  }

  /**
   * 回收Canvas到池
   */
  recycleCanvas(canvas: HTMLCanvasElement): void {
    if (this.canvasPool.length < 10) { // 最多缓存10个
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      this.canvasPool.push(canvas);
    }
  }

  /**
   * 获取或创建ArrayBuffer
   */
  getArrayBuffer(size: number): ArrayBuffer {
    // 尝试从池中获取相同或更大的buffer
    const pooled = this.arrayBufferPool.find(buffer => 
      buffer.byteLength >= size
    );
    
    if (pooled) {
      this.arrayBufferPool = this.arrayBufferPool.filter(b => b !== pooled);
      
      // 如果池中的buffer太大，创建一个视图
      if (pooled.byteLength === size) {
        return pooled;
      } else {
        return pooled.slice(0, size);
      }
    }
    
    // 创建新的ArrayBuffer
    const buffer = new ArrayBuffer(size);
    this.allocate(buffer as any, size, 'arraybuffer');
    
    return buffer;
  }

  /**
   * 回收ArrayBuffer到池
   */
  recycleArrayBuffer(buffer: ArrayBuffer): void {
    if (this.arrayBufferPool.length < 20 && buffer.byteLength <= 10 * 1024 * 1024) {
      this.arrayBufferPool.push(buffer);
    }
  }

  /**
   * 获取或创建TypedArray
   */
  getTypedArray<T extends TypedArray>(
    constructor: new (length: number) => T,
    length: number
  ): T {
    const key = constructor.name;
    const pool = this.typedArrayPool.get(key) || [];
    
    const pooled = pool.find((array: T) => array.length >= length);
    
    if (pooled) {
      const index = pool.indexOf(pooled);
      pool.splice(index, 1);
      
      if (pooled.length === length) {
        pooled.fill(0); // 清零
        return pooled as T;
      } else {
        return pooled.subarray(0, length) as T;
      }
    }
    
    const array = new constructor(length);
    const size = array.byteLength;
    this.allocate(array as any, size, `typedarray-${key}`);
    
    return array;
  }

  /**
   * 回收TypedArray到池
   */
  recycleTypedArray<T extends TypedArray>(array: T): void {
    const key = array.constructor.name;
    let pool = this.typedArrayPool.get(key);
    
    if (!pool) {
      pool = [];
      this.typedArrayPool.set(key, pool);
    }
    
    if (pool.length < 10) {
      array.fill(0); // 清零
      pool.push(array);
    }
  }

  /**
   * 检查内存压力
   */
  private checkMemoryPressure(): void {
    const stats = this.getStats();
    const percentage = stats.percentage / 100;
    
    if (percentage >= this.criticalThreshold) {
      this.logger.error('Critical memory pressure', stats);
      this.emergencyCleanup();
      this.notifyPressure(stats);
    } else if (percentage >= this.warningThreshold) {
      this.logger.warn('High memory usage', stats);
      this.cleanup();
      this.notifyPressure(stats);
    }
  }

  /**
   * 普通清理
   */
  private cleanup(): void {
    let freedCount = 0;
    let freedSize = 0;
    
    // 清理已被垃圾回收的对象
    for (const [id, allocation] of this.allocations) {
      if (allocation.weakRef) {
        const obj = allocation.weakRef.deref();
        if (!obj && !allocation.freed) {
          allocation.freed = true;
          this.totalAllocated -= allocation.size;
          freedSize += allocation.size;
          freedCount++;
        }
      }
    }
    
    // 清理过期的分配记录
    const now = Date.now();
    const expiry = 60000; // 1分钟
    
    for (const [id, allocation] of this.allocations) {
      if (allocation.freed && now - allocation.timestamp > expiry) {
        this.allocations.delete(id);
      }
    }
    
    // 缩减池大小
    this.canvasPool = this.canvasPool.slice(0, 5);
    this.arrayBufferPool = this.arrayBufferPool.slice(0, 10);
    
    for (const [key, pool] of this.typedArrayPool) {
      pool.splice(5);
    }
    
    if (freedCount > 0) {
      this.logger.info(`Cleaned up ${freedCount} objects, freed ${this.formatBytes(freedSize)}`);
    }
    
    // 建议浏览器进行垃圾回收
    if ('gc' in globalThis) {
      (globalThis as any).gc();
    }
  }

  /**
   * 紧急清理
   */
  private emergencyCleanup(): void {
    this.logger.warn('Emergency cleanup triggered');
    
    // 清空所有池
    this.canvasPool = [];
    this.arrayBufferPool = [];
    this.typedArrayPool.clear();
    
    // 强制清理所有可清理的分配
    let freedSize = 0;
    for (const [id, allocation] of this.allocations) {
      if (!allocation.freed && allocation.weakRef) {
        const obj = allocation.weakRef.deref();
        if (!obj) {
          allocation.freed = true;
          this.totalAllocated -= allocation.size;
          freedSize += allocation.size;
        }
      }
    }
    
    // 清理所有已释放的记录
    for (const [id, allocation] of this.allocations) {
      if (allocation.freed) {
        this.allocations.delete(id);
      }
    }
    
    this.logger.info(`Emergency cleanup freed ${this.formatBytes(freedSize)}`);
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(interval: number): void {
    this.gcTimer = window.setInterval(() => {
      this.cleanup();
    }, interval);
  }

  /**
   * 启动泄漏检测
   */
  private startLeakDetection(): void {
    this.leakDetectionTimer = window.setInterval(() => {
      const leaks = this.detectLeaks();
      if (leaks.length > 0) {
        this.logger.warn(`Detected ${leaks.length} potential memory leaks`, leaks);
      }
    }, 60000); // 每分钟检测一次
  }

  /**
   * 检测内存泄漏
   */
  private detectLeaks(): MemoryAllocation[] {
    const now = Date.now();
    const leakThreshold = 5 * 60 * 1000; // 5分钟
    const leaks: MemoryAllocation[] = [];
    
    for (const allocation of this.allocations.values()) {
      if (!allocation.freed && 
          now - allocation.timestamp > leakThreshold &&
          allocation.weakRef) {
        const obj = allocation.weakRef.deref();
        if (obj) {
          leaks.push(allocation);
        }
      }
    }
    
    return leaks;
  }

  /**
   * 设置Memory Pressure API
   */
  private setupMemoryPressureAPI(): void {
    if ('memory' in navigator && 'addEventListener' in (navigator as any).memory) {
      (navigator as any).memory.addEventListener('pressure', (event: any) => {
        this.logger.warn('System memory pressure detected', event);
        if (event.level === 'critical') {
          this.emergencyCleanup();
        } else {
          this.cleanup();
        }
      });
    }
  }

  /**
   * 通知内存压力
   */
  private notifyPressure(stats: MemoryStats): void {
    for (const callback of this.pressureCallbacks) {
      try {
        callback(stats);
      } catch (error) {
        this.logger.error('Error in pressure callback', error);
      }
    }
  }

  /**
   * 监听内存压力
   */
  onMemoryPressure(callback: (stats: MemoryStats) => void): () => void {
    this.pressureCallbacks.add(callback);
    return () => this.pressureCallbacks.delete(callback);
  }

  /**
   * 获取内存统计
   */
  getStats(): MemoryStats {
    let allocations = 0;
    let deallocations = 0;
    let leaks = 0;
    
    for (const allocation of this.allocations.values()) {
      if (allocation.freed) {
        deallocations++;
      } else {
        allocations++;
        if (allocation.weakRef && !allocation.weakRef.deref()) {
          leaks++;
        }
      }
    }
    
    return {
      used: this.totalAllocated,
      limit: this.maxMemory,
      percentage: (this.totalAllocated / this.maxMemory) * 100,
      allocations,
      deallocations,
      leaks
    };
  }

  /**
   * 获取详细报告
   */
  getDetailedReport(): string {
    const stats = this.getStats();
    const typeStats = new Map<string, { count: number; size: number }>();
    
    for (const allocation of this.allocations.values()) {
      if (!allocation.freed) {
        const stat = typeStats.get(allocation.type) || { count: 0, size: 0 };
        stat.count++;
        stat.size += allocation.size;
        typeStats.set(allocation.type, stat);
      }
    }
    
    let report = '=== Memory Report ===\n';
    report += `Total Used: ${this.formatBytes(stats.used)} / ${this.formatBytes(stats.limit)} (${stats.percentage.toFixed(1)}%)\n`;
    report += `Allocations: ${stats.allocations} | Deallocations: ${stats.deallocations} | Leaks: ${stats.leaks}\n`;
    report += '\n=== By Type ===\n';
    
    for (const [type, stat] of typeStats) {
      report += `${type}: ${stat.count} objects, ${this.formatBytes(stat.size)}\n`;
    }
    
    report += '\n=== Pools ===\n';
    report += `Canvas Pool: ${this.canvasPool.length} items\n`;
    report += `ArrayBuffer Pool: ${this.arrayBufferPool.length} items\n`;
    report += `TypedArray Pools: ${this.typedArrayPool.size} types\n`;
    
    return report;
  }

  /**
   * 格式化字节数
   */
  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let index = 0;
    let value = bytes;
    
    while (value >= 1024 && index < units.length - 1) {
      value /= 1024;
      index++;
    }
    
    return `${value.toFixed(2)} ${units[index]}`;
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
    }
    
    if (this.leakDetectionTimer) {
      clearInterval(this.leakDetectionTimer);
    }
    
    this.canvasPool = [];
    this.arrayBufferPool = [];
    this.typedArrayPool.clear();
    this.allocations.clear();
    this.pressureCallbacks.clear();
  }
}

// TypedArray类型定义
type TypedArray = 
  | Int8Array 
  | Uint8Array 
  | Uint8ClampedArray 
  | Int16Array 
  | Uint16Array 
  | Int32Array 
  | Uint32Array 
  | Float32Array 
  | Float64Array;