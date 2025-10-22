/**
 * 触摸手势处理器 - 移动端交互优化
 * Touch Gesture Handler for mobile interactions
 */

import { Logger } from '../core/Logger';
import { EventEmitter } from '../core/EventEmitter';

export interface TouchGestureOptions {
  container: HTMLElement;
  enablePinchZoom?: boolean;
  enableDoubleTapZoom?: boolean;
  enableSwipe?: boolean;
  enableLongPress?: boolean;
  minPinchScale?: number;
  maxPinchScale?: number;
  longPressDuration?: number; // 毫秒
  swipeThreshold?: number; // 像素
}

export interface GestureEvent {
  type: 'pinch' | 'doubletap' | 'swipe' | 'longpress' | 'tap';
  data?: any;
}

export class TouchGestureHandler extends EventEmitter {
  private container: HTMLElement;
  private logger: Logger;

  // 配置
  private enablePinchZoom: boolean;
  private enableDoubleTapZoom: boolean;
  private enableSwipe: boolean;
  private enableLongPress: boolean;
  private minPinchScale: number;
  private maxPinchScale: number;
  private longPressDuration: number;
  private swipeThreshold: number;

  // 触摸状态
  private touches: Touch[] = [];
  private initialDistance: number = 0;
  private currentScale: number = 1;
  private lastTapTime: number = 0;
  private tapTimeout: any = null;
  private longPressTimer: any = null;
  private startX: number = 0;
  private startY: number = 0;
  private startTime: number = 0;
  private isSwiping: boolean = false;
  private isPinching: boolean = false;

  constructor(options: TouchGestureOptions) {
    super();
    this.container = options.container;
    this.logger = new Logger('TouchGestureHandler');

    this.enablePinchZoom = options.enablePinchZoom ?? true;
    this.enableDoubleTapZoom = options.enableDoubleTapZoom ?? true;
    this.enableSwipe = options.enableSwipe ?? true;
    this.enableLongPress = options.enableLongPress ?? true;
    this.minPinchScale = options.minPinchScale || 0.5;
    this.maxPinchScale = options.maxPinchScale || 5.0;
    this.longPressDuration = options.longPressDuration || 500;
    this.swipeThreshold = options.swipeThreshold || 50;

    this.init();
  }

  /**
   * 初始化事件监听
   */
  private init(): void {
    this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.container.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.container.addEventListener('touchcancel', this.handleTouchCancel.bind(this));
  }

  /**
   * 处理触摸开始
   */
  private handleTouchStart(e: TouchEvent): void {
    this.touches = Array.from(e.touches);
    this.startTime = Date.now();

    if (this.touches.length === 1) {
      // 单指触摸
      const touch = this.touches[0];
      this.startX = touch.clientX;
      this.startY = touch.clientY;

      // 检测双击
      if (this.enableDoubleTapZoom) {
        this.detectDoubleTap(touch);
      }

      // 开始长按检测
      if (this.enableLongPress) {
        this.startLongPressDetection(touch);
      }

    } else if (this.touches.length === 2 && this.enablePinchZoom) {
      // 双指触摸 - 捏合缩放
      e.preventDefault();
      this.isPinching = true;
      this.initialDistance = this.getDistance(this.touches[0], this.touches[1]);
      this.cancelLongPress();
    }
  }

  /**
   * 处理触摸移动
   */
  private handleTouchMove(e: TouchEvent): void {
    this.touches = Array.from(e.touches);

    if (this.touches.length === 2 && this.isPinching && this.enablePinchZoom) {
      // 捏合缩放
      e.preventDefault();
      this.handlePinchZoom();
      this.cancelLongPress();

    } else if (this.touches.length === 1 && this.enableSwipe) {
      // 单指滑动
      const touch = this.touches[0];
      const deltaX = touch.clientX - this.startX;
      const deltaY = touch.clientY - this.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 如果移动距离超过阈值，取消长按
      if (distance > 10) {
        this.cancelLongPress();
        this.isSwiping = true;
      }
    }
  }

  /**
   * 处理触摸结束
   */
  private handleTouchEnd(e: TouchEvent): void {
    const duration = Date.now() - this.startTime;

    if (this.touches.length === 1 && this.isSwiping && this.enableSwipe) {
      // 检测滑动手势
      this.detectSwipe();
    }

    if (this.isPinching) {
      this.isPinching = false;
      this.emit('pinch-end', { scale: this.currentScale });
    }

    this.touches = Array.from(e.touches);
    this.isSwiping = false;
    this.cancelLongPress();
  }

  /**
   * 处理触摸取消
   */
  private handleTouchCancel(): void {
    this.touches = [];
    this.isSwiping = false;
    this.isPinching = false;
    this.cancelLongPress();
  }

  /**
   * 检测双击
   */
  private detectDoubleTap(touch: Touch): void {
    const now = Date.now();
    const timeDiff = now - this.lastTapTime;

    if (timeDiff < 300 && timeDiff > 0) {
      // 双击
      this.emit('doubletap', {
        x: touch.clientX,
        y: touch.clientY
      });

      this.logger.debug('Double tap detected');
      this.lastTapTime = 0;
    } else {
      // 单击
      this.lastTapTime = now;

      // 延迟触发单击，等待可能的双击
      if (this.tapTimeout) {
        clearTimeout(this.tapTimeout);
      }

      this.tapTimeout = setTimeout(() => {
        this.emit('tap', {
          x: touch.clientX,
          y: touch.clientY
        });
      }, 300);
    }
  }

  /**
   * 开始长按检测
   */
  private startLongPressDetection(touch: Touch): void {
    this.cancelLongPress();

    this.longPressTimer = setTimeout(() => {
      this.emit('longpress', {
        x: touch.clientX,
        y: touch.clientY
      });

      this.logger.debug('Long press detected');
    }, this.longPressDuration);
  }

  /**
   * 取消长按
   */
  private cancelLongPress(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  /**
   * 处理捏合缩放
   */
  private handlePinchZoom(): void {
    const currentDistance = this.getDistance(this.touches[0], this.touches[1]);
    const scaleChange = currentDistance / this.initialDistance;

    this.currentScale = Math.max(
      this.minPinchScale,
      Math.min(this.maxPinchScale, scaleChange)
    );

    // 计算中心点
    const centerX = (this.touches[0].clientX + this.touches[1].clientX) / 2;
    const centerY = (this.touches[0].clientY + this.touches[1].clientY) / 2;

    this.emit('pinch', {
      scale: this.currentScale,
      scaleChange,
      center: { x: centerX, y: centerY }
    });
  }

  /**
   * 检测滑动
   */
  private detectSwipe(): void {
    const touch = this.touches[0];
    if (!touch) return;

    const deltaX = touch.clientX - this.startX;
    const deltaY = touch.clientY - this.startY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // 判断是否达到滑动阈值
    if (absDeltaX < this.swipeThreshold && absDeltaY < this.swipeThreshold) {
      return;
    }

    // 判断滑动方向
    let direction: 'left' | 'right' | 'up' | 'down';

    if (absDeltaX > absDeltaY) {
      // 水平滑动
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      // 垂直滑动
      direction = deltaY > 0 ? 'down' : 'up';
    }

    this.emit('swipe', {
      direction,
      deltaX,
      deltaY,
      distance: Math.sqrt(deltaX * deltaX + deltaY * deltaY),
      duration: Date.now() - this.startTime
    });

    this.logger.debug(`Swipe detected: ${direction}`);
  }

  /**
   * 计算两点距离
   */
  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 设置缩放范围
   */
  setScaleRange(min: number, max: number): void {
    this.minPinchScale = min;
    this.maxPinchScale = max;
  }

  /**
   * 启用/禁用手势
   */
  setGestureEnabled(gesture: 'pinch' | 'doubletap' | 'swipe' | 'longpress', enabled: boolean): void {
    switch (gesture) {
      case 'pinch':
        this.enablePinchZoom = enabled;
        break;
      case 'doubletap':
        this.enableDoubleTapZoom = enabled;
        break;
      case 'swipe':
        this.enableSwipe = enabled;
        break;
      case 'longpress':
        this.enableLongPress = enabled;
        break;
    }
  }

  /**
   * 获取当前状态
   */
  getState() {
    return {
      touchCount: this.touches.length,
      isPinching: this.isPinching,
      isSwiping: this.isSwiping,
      currentScale: this.currentScale,
      enabledGestures: {
        pinchZoom: this.enablePinchZoom,
        doubleTapZoom: this.enableDoubleTapZoom,
        swipe: this.enableSwipe,
        longPress: this.enableLongPress
      }
    };
  }

  /**
   * 销毁手势处理器
   */
  destroy(): void {
    this.container.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.container.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.container.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.container.removeEventListener('touchcancel', this.handleTouchCancel.bind(this));

    this.cancelLongPress();

    if (this.tapTimeout) {
      clearTimeout(this.tapTimeout);
    }

    this.removeAllListeners();
  }
}

