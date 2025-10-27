/**
 * 虚拟滚动器 - 支持大型PDF流畅滚动
 * Virtual scroller for smooth scrolling of large PDFs
 */

import type { PDFDocumentProxy } from '../types';
import { Logger } from '../core/Logger';

export interface VirtualScrollerOptions {
  container: HTMLElement;
  document: PDFDocumentProxy;
  itemHeight?: number; // 预估页面高度
  bufferSize?: number; // 缓冲区大小（上下各渲染几页）
  renderPage: (pageNumber: number, container: HTMLElement) => Promise<void>;
  onPageVisible?: (pageNumber: number) => void;
  onScroll?: (scrollTop: number, scrollHeight: number) => void;
}

interface VirtualItem {
  pageNumber: number;
  top: number;
  height: number;
  element?: HTMLElement;
  rendered: boolean;
}

export class VirtualScroller {
  private container: HTMLElement;
  private document: PDFDocumentProxy;
  private renderPage: (pageNumber: number, container: HTMLElement) => Promise<void>;
  private onPageVisible?: (pageNumber: number) => void;
  private onScroll?: (scrollTop: number, scrollHeight: number) => void;

  private items: VirtualItem[] = [];
  private renderedItems = new Set<number>();
  private bufferSize: number;
  private estimatedItemHeight: number;
  private scrollContainer: HTMLElement;
  private contentContainer: HTMLElement;

  private logger: Logger;
  private observer: IntersectionObserver | null = null;
  private scrollTimeout: any = null;
  private isScrolling: boolean = false;

  // 性能优化
  private renderQueue: number[] = [];
  private isRendering: boolean = false;
  private maxConcurrentRenders: number = 2;

  constructor(options: VirtualScrollerOptions) {
    this.container = options.container;
    this.document = options.document;
    this.renderPage = options.renderPage;
    this.onPageVisible = options.onPageVisible;
    this.onScroll = options.onScroll;
    this.bufferSize = options.bufferSize || 3;
    this.estimatedItemHeight = options.itemHeight || 800;

    this.logger = new Logger('VirtualScroller');

    this.scrollContainer = this.createScrollContainer();
    this.contentContainer = this.createContentContainer();

    this.init();
  }

  /**
   * 初始化虚拟滚动
   */
  private init(): void {
    const totalPages = this.document.numPages;

    // 创建所有虚拟项
    let cumulativeTop = 0;
    for (let i = 1; i <= totalPages; i++) {
      this.items.push({
        pageNumber: i,
        top: cumulativeTop,
        height: this.estimatedItemHeight,
        rendered: false
      });
      cumulativeTop += this.estimatedItemHeight;
    }

    // 设置内容容器总高度
    this.updateContentHeight();

    // 设置滚动监听
    this.setupScrollListener();

    // 设置交叉观察器
    this.setupIntersectionObserver();

    // 初始渲染
    this.updateVisibleItems();
  }

  /**
   * 创建滚动容器
   */
  private createScrollContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'virtual-scroll-container';
    container.style.cssText = `
      width: 100%;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
    `;

    this.container.appendChild(container);
    return container;
  }

  /**
   * 创建内容容器
   */
  private createContentContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'virtual-content-container';
    container.style.cssText = `
      position: relative;
      width: 100%;
    `;

    this.scrollContainer.appendChild(container);
    return container;
  }

  /**
   * 更新内容高度
   */
  private updateContentHeight(): void {
    const totalHeight = this.items.reduce((sum, item) => sum + item.height, 0);
    this.contentContainer.style.height = `${totalHeight}px`;
  }

  /**
   * 设置滚动监听
   */
  private setupScrollListener(): void {
    this.scrollContainer.addEventListener('scroll', () => {
      this.isScrolling = true;

      // 清除之前的超时
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }

      // 立即更新可见项
      this.updateVisibleItems();

      // 触发滚动回调
      if (this.onScroll) {
        this.onScroll(
          this.scrollContainer.scrollTop,
          this.scrollContainer.scrollHeight
        );
      }

      // 滚动结束后的处理
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
        this.processRenderQueue();
      }, 150);
    });
  }

  /**
   * 设置交叉观察器
   */
  private setupIntersectionObserver(): void {
    const options = {
      root: this.scrollContainer,
      rootMargin: `${this.bufferSize * this.estimatedItemHeight}px`,
      threshold: 0.01
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const pageNumber = parseInt(entry.target.getAttribute('data-page-number') || '0');

        if (entry.isIntersecting) {
          if (this.onPageVisible) {
            this.onPageVisible(pageNumber);
          }
        }
      });
    }, options);
  }

  /**
   * 更新可见项
   */
  private updateVisibleItems(): void {
    const scrollTop = this.scrollContainer.scrollTop;
    const scrollBottom = scrollTop + this.scrollContainer.clientHeight;

    // 计算需要渲染的范围
    const bufferHeight = this.bufferSize * this.estimatedItemHeight;
    const visibleStart = Math.max(0, scrollTop - bufferHeight);
    const visibleEnd = scrollBottom + bufferHeight;

    // 找到可见范围内的项
    const visibleItems: VirtualItem[] = [];
    for (const item of this.items) {
      const itemBottom = item.top + item.height;

      if (item.top <= visibleEnd && itemBottom >= visibleStart) {
        visibleItems.push(item);
      }
    }

    // 渲染可见项
    for (const item of visibleItems) {
      if (!item.rendered) {
        this.addToRenderQueue(item.pageNumber);
      }
    }

    // 移除不可见的项
    for (const item of this.items) {
      const itemBottom = item.top + item.height;
      const isVisible = item.top <= visibleEnd && itemBottom >= visibleStart;

      if (item.rendered && !isVisible) {
        this.unrenderItem(item);
      }
    }

    // 处理渲染队列
    if (!this.isScrolling) {
      this.processRenderQueue();
    }
  }

  /**
   * 添加到渲染队列
   */
  private addToRenderQueue(pageNumber: number): void {
    if (!this.renderQueue.includes(pageNumber) && !this.renderedItems.has(pageNumber)) {
      this.renderQueue.push(pageNumber);
    }
  }

  /**
   * 处理渲染队列
   */
  private async processRenderQueue(): Promise<void> {
    if (this.isRendering || this.renderQueue.length === 0) {
      return;
    }

    this.isRendering = true;

    // 批量渲染
    const batch = this.renderQueue.splice(0, this.maxConcurrentRenders);

    try {
      await Promise.all(batch.map(pageNumber => this.renderItem(pageNumber)));
    } catch (error) {
      this.logger.error('Error rendering batch', error);
    }

    this.isRendering = false;

    // 继续处理队列
    if (this.renderQueue.length > 0) {
      requestIdleCallback(() => {
        this.processRenderQueue();
      });
    }
  }

  /**
   * 渲染单个项
   */
  private async renderItem(pageNumber: number): Promise<void> {
    const item = this.items.find(i => i.pageNumber === pageNumber);
    if (!item || item.rendered) {
      return;
    }

    try {
      // 创建页面容器
      const pageContainer = document.createElement('div');
      pageContainer.className = 'virtual-page-item';
      pageContainer.setAttribute('data-page-number', pageNumber.toString());
      pageContainer.style.cssText = `
        position: absolute;
        top: ${item.top}px;
        left: 0;
        right: 0;
        min-height: ${item.height}px;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 10px 0;
      `;

      // 渲染页面内容
      await this.renderPage(pageNumber, pageContainer);

      // 获取实际高度
      this.contentContainer.appendChild(pageContainer);
      const actualHeight = pageContainer.offsetHeight;

      // 更新项信息
      item.element = pageContainer;
      item.rendered = true;
      item.height = actualHeight;
      this.renderedItems.add(pageNumber);

      // 重新计算后续项的位置
      this.recalculatePositions(pageNumber);

      // 观察该元素
      if (this.observer) {
        this.observer.observe(pageContainer);
      }

      this.logger.debug(`Rendered page ${pageNumber}, height: ${actualHeight}px`);
    } catch (error) {
      this.logger.error(`Failed to render page ${pageNumber}`, error);
      item.rendered = false;
    }
  }

  /**
   * 取消渲染项
   */
  private unrenderItem(item: VirtualItem): void {
    if (item.element) {
      // 停止观察
      if (this.observer) {
        this.observer.unobserve(item.element);
      }

      // 移除元素
      item.element.remove();
      item.element = undefined;
    }

    item.rendered = false;
    this.renderedItems.delete(item.pageNumber);

    this.logger.debug(`Unrendered page ${item.pageNumber}`);
  }

  /**
   * 重新计算位置
   */
  private recalculatePositions(fromPageNumber: number): void {
    const startIndex = fromPageNumber - 1;

    for (let i = startIndex + 1; i < this.items.length; i++) {
      const prevItem = this.items[i - 1];
      const currentItem = this.items[i];

      currentItem.top = prevItem.top + prevItem.height;

      // 更新元素位置
      if (currentItem.element) {
        currentItem.element.style.top = `${currentItem.top}px`;
      }
    }

    // 更新总高度
    this.updateContentHeight();
  }

  /**
   * 滚动到指定页面
   */
  scrollToPage(pageNumber: number, smooth: boolean = true): void {
    const item = this.items.find(i => i.pageNumber === pageNumber);
    if (!item) {
      this.logger.warn(`Page ${pageNumber} not found`);
      return;
    }

    this.scrollContainer.scrollTo({
      top: item.top,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }

  /**
   * 获取当前可见的页面
   */
  getVisiblePages(): number[] {
    const scrollTop = this.scrollContainer.scrollTop;
    const scrollBottom = scrollTop + this.scrollContainer.clientHeight;
    const centerY = scrollTop + this.scrollContainer.clientHeight / 2;

    const visiblePages: number[] = [];

    for (const item of this.items) {
      const itemBottom = item.top + item.height;

      if (item.top <= scrollBottom && itemBottom >= scrollTop) {
        visiblePages.push(item.pageNumber);
      }
    }

    return visiblePages;
  }

  /**
   * 获取中心页面
   */
  getCenterPage(): number {
    const scrollTop = this.scrollContainer.scrollTop;
    const centerY = scrollTop + this.scrollContainer.clientHeight / 2;

    for (const item of this.items) {
      const itemBottom = item.top + item.height;

      if (centerY >= item.top && centerY <= itemBottom) {
        return item.pageNumber;
      }
    }

    return 1;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalPages: this.items.length,
      renderedPages: this.renderedItems.size,
      queuedPages: this.renderQueue.length,
      visiblePages: this.getVisiblePages().length,
      currentPage: this.getCenterPage(),
      isScrolling: this.isScrolling,
      isRendering: this.isRendering
    };
  }

  /**
   * 销毁虚拟滚动器
   */
  destroy(): void {
    // 停止观察
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // 清除超时
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = null;
    }

    // 清空所有项
    for (const item of this.items) {
      this.unrenderItem(item);
    }

    // 移除容器
    if (this.scrollContainer) {
      this.scrollContainer.remove();
    }

    this.items = [];
    this.renderedItems.clear();
    this.renderQueue = [];
  }
}

