/**
 * 性能监控器
 * Performance monitoring for PDF viewer
 */

import { Logger } from './Logger';

export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: any;
}

export interface PerformanceStats {
  // 渲染性能
  averageRenderTime: number;
  minRenderTime: number;
  maxRenderTime: number;
  totalRenders: number;

  // 内存使用
  currentMemoryMB?: number;
  peakMemoryMB?: number;

  // 帧率
  currentFPS: number;
  averageFPS: number;

  // 页面加载
  averagePageLoadTime: number;
  totalPagesLoaded: number;

  // 用户交互
  totalInteractions: number;
  averageInteractionTime: number;
}

export class PerformanceMonitor {
  private logger: Logger;
  private metrics = new Map<string, PerformanceMetric>();
  private completedMetrics: PerformanceMetric[] = [];
  private maxStoredMetrics: number;

  // 渲染统计
  private renderTimes: number[] = [];
  private pageLo adTimes: number[] = [];

  // FPS监控
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private fpsHistory: number[] = [];
  private fpsInterval: any = null;

  // 内存监控
  private memoryCheckInterval: any = null;
  private peakMemory: number = 0;

  // 交互监控
  private interactionTimes: number[] = [];

  constructor(logger?: Logger, options: { maxStoredMetrics?: number } = {}) {
    this.logger = logger || new Logger('PerformanceMonitor');
    this.maxStoredMetrics = options.maxStoredMetrics || 1000;
    this.startFPSMonitoring();
    this.startMemoryMonitoring();
  }

  /**
   * 开始性能测量
   */
  start(name: string, metadata?: any): void {
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata
    };

    this.metrics.set(name, metric);
  }

  /**
   * 结束性能测量
   */
  end(name: string, metadata?: any): number | null {
    const metric = this.metrics.get(name);

    if (!metric) {
      this.logger.warn(`Performance metric "${name}" not found`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    if (metadata) {
      metric.metadata = { ...metric.metadata, ...metadata };
    }

    this.metrics.delete(name);
    this.storeMetric(metric);

    // 特殊统计
    if (name.startsWith('render-')) {
      this.renderTimes.push(metric.duration);
      this.limitArray(this.renderTimes, 100);
    } else if (name.startsWith('page-load-')) {
      this.pageLoadTimes.push(metric.duration);
      this.limitArray(this.pageLoadTimes, 100);
    } else if (name.startsWith('interaction-')) {
      this.interactionTimes.push(metric.duration);
      this.limitArray(this.interactionTimes, 100);
    }

    return metric.duration;
  }

  /**
   * 测量函数执行时间
   */
  async measure<T>(
    name: string,
    fn: () => T | Promise<T>,
    metadata?: any
  ): Promise<T> {
    this.start(name, metadata);

    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name, { error: true });
      throw error;
    }
  }

  /**
   * 记录自定义指标
   */
  recordMetric(name: string, value: number, metadata?: any): void {
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      endTime: performance.now(),
      duration: value,
      metadata
    };

    this.storeMetric(metric);
  }

  /**
   * 存储完成的指标
   */
  private storeMetric(metric: PerformanceMetric): void {
    this.completedMetrics.push(metric);

    // 限制存储数量
    if (this.completedMetrics.length > this.maxStoredMetrics) {
      this.completedMetrics.shift();
    }

    // 记录日志（仅记录较慢的操作）
    if (metric.duration && metric.duration > 100) {
      this.logger.warn(`Slow operation: ${metric.name} took ${metric.duration.toFixed(2)}ms`, metric.metadata);
    }
  }

  /**
   * 启动FPS监控
   */
  private startFPSMonitoring(): void {
    let lastTime = performance.now();
    let frames = 0;

    const updateFPS = () => {
      const now = performance.now();
      frames++;

      if (now >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (now - lastTime));
        this.fpsHistory.push(fps);
        this.limitArray(this.fpsHistory, 60);

        frames = 0;
        lastTime = now;
      }

      this.fpsInterval = requestAnimationFrame(updateFPS);
    };

    this.fpsInterval = requestAnimationFrame(updateFPS);
  }

  /**
   * 启动内存监控
   */
  private startMemoryMonitoring(): void {
    // 检查是否支持内存API
    if (!(performance as any).memory) {
      return;
    }

    this.memoryCheckInterval = setInterval(() => {
      const memory = (performance as any).memory;
      if (memory) {
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        this.peakMemory = Math.max(this.peakMemory, usedMB);
      }
    }, 5000); // 每5秒检查一次
  }

  /**
   * 获取当前内存使用（MB）
   */
  getCurrentMemory(): number | undefined {
    const memory = (performance as any).memory;
    if (memory) {
      return memory.usedJSHeapSize / 1024 / 1024;
    }
    return undefined;
  }

  /**
   * 获取当前FPS
   */
  getCurrentFPS(): number {
    return this.fpsHistory.length > 0
      ? this.fpsHistory[this.fpsHistory.length - 1]
      : 0;
  }

  /**
   * 获取平均FPS
   */
  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.fpsHistory.length);
  }

  /**
   * 计算平均值
   */
  private average(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  /**
   * 计算最小值
   */
  private min(arr: number[]): number {
    if (arr.length === 0) return 0;
    return Math.min(...arr);
  }

  /**
   * 计算最大值
   */
  private max(arr: number[]): number {
    if (arr.length === 0) return 0;
    return Math.max(...arr);
  }

  /**
   * 限制数组长度
   */
  private limitArray(arr: number[], maxLength: number): void {
    while (arr.length > maxLength) {
      arr.shift();
    }
  }

  /**
   * 获取性能统计
   */
  getStats(): PerformanceStats {
    return {
      // 渲染性能
      averageRenderTime: this.average(this.renderTimes),
      minRenderTime: this.min(this.renderTimes),
      maxRenderTime: this.max(this.renderTimes),
      totalRenders: this.renderTimes.length,

      // 内存使用
      currentMemoryMB: this.getCurrentMemory(),
      peakMemoryMB: this.peakMemory || undefined,

      // 帧率
      currentFPS: this.getCurrentFPS(),
      averageFPS: this.getAverageFPS(),

      // 页面加载
      averagePageLoadTime: this.average(this.pageLoadTimes),
      totalPagesLoaded: this.pageLoadTimes.length,

      // 用户交互
      totalInteractions: this.interactionTimes.length,
      averageInteractionTime: this.average(this.interactionTimes)
    };
  }

  /**
   * 获取指定类型的指标
   */
  getMetricsByName(namePrefix: string): PerformanceMetric[] {
    return this.completedMetrics.filter(m => m.name.startsWith(namePrefix));
  }

  /**
   * 获取最慢的操作
   */
  getSlowestOperations(limit: number = 10): PerformanceMetric[] {
    return [...this.completedMetrics]
      .filter(m => m.duration !== undefined)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, limit);
  }

  /**
   * 导出性能报告
   */
  exportReport(): string {
    const stats = this.getStats();
    const slowest = this.getSlowestOperations(5);

    return `
# PDF Viewer Performance Report
Generated: ${new Date().toISOString()}

## Rendering Performance
- Average Render Time: ${stats.averageRenderTime.toFixed(2)}ms
- Min Render Time: ${stats.minRenderTime.toFixed(2)}ms
- Max Render Time: ${stats.maxRenderTime.toFixed(2)}ms
- Total Renders: ${stats.totalRenders}

## Memory Usage
- Current Memory: ${stats.currentMemoryMB?.toFixed(2) || 'N/A'} MB
- Peak Memory: ${stats.peakMemoryMB?.toFixed(2) || 'N/A'} MB

## Frame Rate
- Current FPS: ${stats.currentFPS}
- Average FPS: ${stats.averageFPS}

## Page Loading
- Average Load Time: ${stats.averagePageLoadTime.toFixed(2)}ms
- Total Pages Loaded: ${stats.totalPagesLoaded}

## User Interactions
- Total Interactions: ${stats.totalInteractions}
- Average Interaction Time: ${stats.averageInteractionTime.toFixed(2)}ms

## Slowest Operations
${slowest.map((m, i) =>
      `${i + 1}. ${m.name}: ${m.duration?.toFixed(2)}ms`
    ).join('\n')}

## All Metrics
Total Recorded: ${this.completedMetrics.length}
`.trim();
  }

  /**
   * 清除所有指标
   */
  clear(): void {
    this.metrics.clear();
    this.completedMetrics = [];
    this.renderTimes = [];
    this.pageLoadTimes = [];
    this.interactionTimes = [];
    this.fpsHistory = [];
    this.peakMemory = 0;
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    this.clear();

    if (this.fpsInterval) {
      cancelAnimationFrame(this.fpsInterval);
      this.fpsInterval = null;
    }

    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = null;
    }
  }
}

// 导出全局性能监控器
export const globalPerformanceMonitor = new PerformanceMonitor();

