import {
  createEnhancedPDFViewer,
  PDFViewer as CorePDFViewer,
  FormManager,
  SignatureManager,
  PageManager,
  ExportManager,
  TouchGestureHandler,
  KeyboardHandler,
  PageCacheManager,
  PerformanceMonitor,
  type EnhancedPDFViewerOptions
} from '@ldesign/pdf-core';

export interface PDFViewerConfig extends EnhancedPDFViewerOptions {
  /** 容器元素或选择器 */
  container: HTMLElement | string;
  /** 是否创建默认工具栏 */
  createToolbar?: boolean;
  /** 是否创建默认侧边栏 */
  createSidebar?: boolean;
  /** 工具栏配置 */
  toolbarConfig?: ToolbarConfig;
  /** 侧边栏配置 */
  sidebarConfig?: SidebarConfig;
  /** 事件处理器 */
  onPageChange?: (pageNum: number) => void;
  onDocumentLoad?: () => void;
  onError?: (error: Error) => void;
  onScaleChange?: (scale: number) => void;
  onFormSubmit?: (data: any) => void;
  onSignatureAdd?: (signature: any) => void;
}

interface ToolbarConfig {
  items?: string[];
  customButtons?: Array<{
    id: string;
    label: string;
    icon?: string;
    onClick: () => void;
  }>;
}

interface SidebarConfig {
  panels?: string[];
  width?: number;
  defaultPanel?: string;
}

/**
 * Vanilla JavaScript PDF Viewer
 * 
 * @example
 * ```javascript
 * const viewer = new PDFViewerVanilla({
 *   container: '#pdf-container',
 *   pdfUrl: 'document.pdf',
 *   createToolbar: true,
 *   onPageChange: (page) => console.log('Page:', page)
 * });
 * 
 * await viewer.init();
 * ```
 */
export class PDFViewerVanilla {
  private config: PDFViewerConfig;
  private container: HTMLElement;
  private wrapperElement: HTMLElement | null = null;
  private toolbarElement: HTMLElement | null = null;
  private sidebarElement: HTMLElement | null = null;
  private viewerContainer: HTMLElement | null = null;

  // Core instances
  private viewer: CorePDFViewer | null = null;
  private formManager: FormManager | null = null;
  private signatureManager: SignatureManager | null = null;
  private pageManager: PageManager | null = null;
  private exportManager: ExportManager | null = null;
  private touchHandler: TouchGestureHandler | null = null;
  private keyboardHandler: KeyboardHandler | null = null;
  private cacheManager: PageCacheManager | null = null;
  private performanceMonitor: PerformanceMonitor | null = null;

  // State
  private currentPage = 1;
  private totalPages = 0;
  private scale = 1;
  private isLoading = false;
  private error: Error | null = null;

  constructor(config: PDFViewerConfig) {
    this.config = config;

    // 获取容器元素
    if (typeof config.container === 'string') {
      const element = document.querySelector(config.container);
      if (!element) {
        throw new Error(`Container element not found: ${config.container}`);
      }
      this.container = element as HTMLElement;
    } else {
      this.container = config.container;
    }
  }

  /**
   * 初始化查看器
   */
  async init(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;

      // 创建包装器
      this.createWrapper();

      // 创建工具栏
      if (this.config.createToolbar) {
        this.createToolbar();
      }

      // 创建侧边栏
      if (this.config.createSidebar) {
        this.createSidebar();
      }

      // 创建查看器容器
      this.createViewerContainer();

      // 初始化核心查看器
      const instance = await createEnhancedPDFViewer({
        ...this.config,
        container: this.viewerContainer!
      });

      this.viewer = instance.viewer;
      this.formManager = instance.formManager || null;
      this.signatureManager = instance.signatureManager || null;
      this.pageManager = instance.pageManager || null;
      this.exportManager = instance.exportManager || null;
      this.touchHandler = instance.touchHandler || null;
      this.keyboardHandler = instance.keyboardHandler || null;
      this.cacheManager = instance.cacheManager || null;
      this.performanceMonitor = instance.performanceMonitor || null;

      // 设置事件监听
      this.setupEventListeners();

      // 加载PDF
      if (this.config.pdfUrl) {
        await this.loadPDF(this.config.pdfUrl);
      }

      this.isLoading = false;
    } catch (error) {
      this.error = error as Error;
      this.isLoading = false;
      this.config.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * 创建包装器元素
   */
  private createWrapper(): void {
    this.wrapperElement = document.createElement('div');
    this.wrapperElement.className = 'pdf-viewer-wrapper';
    this.wrapperElement.style.cssText = `
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
    `;
    this.container.appendChild(this.wrapperElement);
  }

  /**
   * 创建工具栏
   */
  private createToolbar(): void {
    this.toolbarElement = document.createElement('div');
    this.toolbarElement.className = 'pdf-toolbar';
    this.toolbarElement.style.cssText = `
      display: flex;
      align-items: center;
      padding: 10px;
      background: #f5f5f5;
      border-bottom: 1px solid #ddd;
      gap: 20px;
    `;

    // 缩放控制
    const zoomGroup = this.createToolbarGroup([
      { label: '－', onClick: () => this.zoomOut() },
      { label: `${Math.round(this.scale * 100)}%`, id: 'scale-display' },
      { label: '＋', onClick: () => this.zoomIn() }
    ]);

    // 页面导航
    const navGroup = this.createToolbarGroup([
      { label: '◀', onClick: () => this.previousPage(), id: 'prev-page' },
      { label: `${this.currentPage} / ${this.totalPages}`, id: 'page-display' },
      { label: '▶', onClick: () => this.nextPage(), id: 'next-page' }
    ]);

    // 操作按钮
    const actionGroup = this.createToolbarGroup([
      { label: '🖨', onClick: () => this.print() },
      { label: '💾', onClick: () => this.download() }
    ]);

    this.toolbarElement.appendChild(zoomGroup);
    this.toolbarElement.appendChild(navGroup);
    this.toolbarElement.appendChild(actionGroup);

    // 添加自定义按钮
    if (this.config.toolbarConfig?.customButtons) {
      const customGroup = document.createElement('div');
      customGroup.style.cssText = 'display: flex; gap: 10px;';

      this.config.toolbarConfig.customButtons.forEach(btn => {
        const button = document.createElement('button');
        button.id = btn.id;
        button.textContent = btn.label;
        button.onclick = btn.onClick;
        button.style.cssText = `
          padding: 5px 10px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 3px;
          cursor: pointer;
        `;
        customGroup.appendChild(button);
      });

      this.toolbarElement.appendChild(customGroup);
    }

    this.wrapperElement!.appendChild(this.toolbarElement);
  }

  /**
   * 创建工具栏按钮组
   */
  private createToolbarGroup(buttons: Array<{ label: string, onClick?: () => void, id?: string }>): HTMLElement {
    const group = document.createElement('div');
    group.style.cssText = 'display: flex; align-items: center; gap: 10px;';

    buttons.forEach(btn => {
      if (btn.onClick) {
        const button = document.createElement('button');
        if (btn.id) button.id = btn.id;
        button.textContent = btn.label;
        button.onclick = btn.onClick;
        button.style.cssText = `
          padding: 5px 10px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 3px;
          cursor: pointer;
          transition: background-color 0.2s;
        `;
        button.onmouseover = () => button.style.background = '#e0e0e0';
        button.onmouseout = () => button.style.background = 'white';
        group.appendChild(button);
      } else {
        const span = document.createElement('span');
        if (btn.id) span.id = btn.id;
        span.textContent = btn.label;
        span.style.cssText = 'font-size: 14px;';
        group.appendChild(span);
      }
    });

    return group;
  }

  /**
   * 创建侧边栏
   */
  private createSidebar(): void {
    this.sidebarElement = document.createElement('div');
    this.sidebarElement.className = 'pdf-sidebar';
    this.sidebarElement.style.cssText = `
      width: ${this.config.sidebarConfig?.width || 250}px;
      background: #f9f9f9;
      border-right: 1px solid #ddd;
      overflow-y: auto;
    `;

    const mainContainer = document.createElement('div');
    mainContainer.style.cssText = 'display: flex; flex: 1;';

    mainContainer.appendChild(this.sidebarElement);
    this.wrapperElement!.appendChild(mainContainer);
  }

  /**
   * 创建查看器容器
   */
  private createViewerContainer(): void {
    this.viewerContainer = document.createElement('div');
    this.viewerContainer.className = 'pdf-viewer-container';
    this.viewerContainer.style.cssText = `
      flex: 1;
      position: relative;
      overflow: hidden;
    `;

    if (this.sidebarElement) {
      const parent = this.sidebarElement.parentElement;
      parent?.appendChild(this.viewerContainer);
    } else {
      this.wrapperElement!.appendChild(this.viewerContainer);
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (!this.viewer) return;

    this.viewer.on('page-change', (pageNum: number) => {
      this.currentPage = pageNum;
      this.updatePageDisplay();
      this.config.onPageChange?.(pageNum);
    });

    this.viewer.on('document-loaded', () => {
      this.totalPages = this.viewer?.totalPages || 0;
      this.updatePageDisplay();
      this.config.onDocumentLoad?.();
    });

    this.viewer.on('scale-change', (newScale: number) => {
      this.scale = newScale;
      this.updateScaleDisplay();
      this.config.onScaleChange?.(newScale);
    });

    this.viewer.on('error', (error: Error) => {
      this.error = error;
      this.config.onError?.(error);
    });

    if (this.formManager) {
      this.formManager.on('submit', (data: any) => {
        this.config.onFormSubmit?.(data);
      });
    }

    if (this.signatureManager) {
      this.signatureManager.on('signature-added', (signature: any) => {
        this.config.onSignatureAdd?.(signature);
      });
    }
  }

  /**
   * 更新页码显示
   */
  private updatePageDisplay(): void {
    const display = document.getElementById('page-display');
    if (display) {
      display.textContent = `${this.currentPage} / ${this.totalPages}`;
    }

    // 更新按钮状态
    const prevBtn = document.getElementById('prev-page') as HTMLButtonElement;
    const nextBtn = document.getElementById('next-page') as HTMLButtonElement;
    if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = this.currentPage >= this.totalPages;
  }

  /**
   * 更新缩放显示
   */
  private updateScaleDisplay(): void {
    const display = document.getElementById('scale-display');
    if (display) {
      display.textContent = `${Math.round(this.scale * 100)}%`;
    }
  }

  // Public API

  async loadPDF(url: string): Promise<void> {
    if (!this.viewer) throw new Error('Viewer not initialized');
    await this.viewer.loadPDF(url);
  }

  goToPage(pageNum: number): void {
    this.viewer?.goToPage(pageNum);
  }

  nextPage(): void {
    if (this.viewer && this.currentPage < this.totalPages) {
      this.viewer.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.viewer && this.currentPage > 1) {
      this.viewer.goToPage(this.currentPage - 1);
    }
  }

  zoomIn(): void {
    if (this.viewer) {
      const newScale = Math.min(this.scale * 1.2, 5);
      this.viewer.setScale(newScale);
    }
  }

  zoomOut(): void {
    if (this.viewer) {
      const newScale = Math.max(this.scale / 1.2, 0.25);
      this.viewer.setScale(newScale);
    }
  }

  setScale(scale: number): void {
    this.viewer?.setScale(scale);
  }

  print(): void {
    this.viewer?.print();
  }

  download(): void {
    this.viewer?.download();
  }

  async getFormData(): Promise<any> {
    if (!this.formManager) throw new Error('Form manager not initialized');
    return this.formManager.getFormData();
  }

  async fillForm(data: any): Promise<void> {
    if (!this.formManager) throw new Error('Form manager not initialized');
    return this.formManager.fillForm(data);
  }

  async addSignature(signature: any, position: any): Promise<void> {
    if (!this.signatureManager) throw new Error('Signature manager not initialized');
    return this.signatureManager.addSignature(signature, position);
  }

  async exportToPDF(options?: any): Promise<Blob> {
    if (!this.exportManager) throw new Error('Export manager not initialized');
    return this.exportManager.exportToPDF(options);
  }

  async exportToImage(pageNum: number, options?: any): Promise<Blob> {
    if (!this.exportManager) throw new Error('Export manager not initialized');
    return this.exportManager.exportPageAsImage(pageNum, options);
  }

  destroy(): void {
    this.viewer?.destroy();
    this.viewer = null;
    this.formManager = null;
    this.signatureManager = null;
    this.pageManager = null;
    this.exportManager = null;
    this.touchHandler = null;
    this.keyboardHandler = null;
    this.cacheManager = null;
    this.performanceMonitor = null;

    if (this.wrapperElement) {
      this.wrapperElement.remove();
    }
  }

  // Getters
  get isReady(): boolean {
    return !!this.viewer;
  }

  get currentPageNumber(): number {
    return this.currentPage;
  }

  get totalPageCount(): number {
    return this.totalPages;
  }

  get currentScale(): number {
    return this.scale;
  }

  get loading(): boolean {
    return this.isLoading;
  }

  get lastError(): Error | null {
    return this.error;
  }
}


