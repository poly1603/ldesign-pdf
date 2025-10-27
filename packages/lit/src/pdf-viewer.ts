import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
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

/**
 * PDF Viewer Web Component
 * 
 * @element pdf-viewer
 * 
 * @fires page-change - Fired when page changes
 * @fires document-load - Fired when document loads
 * @fires scale-change - Fired when scale changes
 * @fires error - Fired on error
 * @fires form-submit - Fired when form is submitted
 * @fires signature-add - Fired when signature is added
 * 
 * @slot toolbar-items - Custom toolbar items
 * @slot sidebar - Custom sidebar content
 * @slot loading - Custom loading content
 * @slot error - Custom error content
 * 
 * @csspart container - The main container
 * @csspart toolbar - The toolbar
 * @csspart sidebar - The sidebar
 * @csspart viewer - The PDF viewer area
 */
@customElement('pdf-viewer')
export class PDFViewer extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
    }

    .pdf-viewer-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .pdf-toolbar {
      display: flex;
      align-items: center;
      padding: 10px;
      background: #f5f5f5;
      border-bottom: 1px solid #ddd;
      gap: 20px;
    }

    .pdf-toolbar-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .pdf-toolbar button {
      padding: 5px 10px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 3px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .pdf-toolbar button:hover:not(:disabled) {
      background: #e0e0e0;
    }

    .pdf-toolbar button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pdf-viewer-main {
      display: flex;
      flex: 1;
      position: relative;
      overflow: hidden;
    }

    .pdf-sidebar {
      width: 250px;
      background: #f9f9f9;
      border-right: 1px solid #ddd;
      overflow-y: auto;
    }

    .pdf-container {
      flex: 1;
      position: relative;
      overflow: hidden;
    }

    .pdf-viewer-container {
      width: 100%;
      height: 100%;
    }

    .pdf-loading,
    .pdf-error {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 16px;
      color: #666;
    }

    .pdf-error {
      color: #f5222d;
    }

    .hidden {
      display: none;
    }
  `;

  // Properties
  @property({ type: String, attribute: 'pdf-url' })
  pdfUrl?: string;

  @property({ type: Boolean, attribute: 'show-toolbar' })
  showToolbar = true;

  @property({ type: Boolean, attribute: 'show-sidebar' })
  showSidebar = false;

  @property({ type: Number, attribute: 'initial-scale' })
  initialScale = 1.0;

  @property({ type: Number, attribute: 'initial-page' })
  initialPage = 1;

  @property({ type: Boolean, attribute: 'enable-forms' })
  enableForms = true;

  @property({ type: Boolean, attribute: 'enable-signatures' })
  enableSignatures = true;

  @property({ type: Boolean, attribute: 'enable-virtual-scroll' })
  enableVirtualScroll = true;

  @property({ type: Boolean, attribute: 'enable-touch-gestures' })
  enableTouchGestures = true;

  // State
  @state()
  private isLoading = false;

  @state()
  private currentPage = 1;

  @state()
  private totalPages = 0;

  @state()
  private scale = 1;

  @state()
  private error: Error | null = null;

  // Query elements
  @query('.pdf-container')
  private container!: HTMLDivElement;

  // Instance properties
  private viewer: CorePDFViewer | null = null;
  private formManager: FormManager | null = null;
  private signatureManager: SignatureManager | null = null;
  private pageManager: PageManager | null = null;
  private exportManager: ExportManager | null = null;
  private touchHandler: TouchGestureHandler | null = null;
  private keyboardHandler: KeyboardHandler | null = null;
  private cacheManager: PageCacheManager | null = null;
  private performanceMonitor: PerformanceMonitor | null = null;

  override connectedCallback() {
    super.connectedCallback();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.destroyViewer();
  }

  override firstUpdated() {
    this.initViewer();
  }

  override updated(changedProperties: PropertyValues) {
    if (changedProperties.has('pdfUrl') && this.pdfUrl && this.viewer) {
      this.loadPDF(this.pdfUrl);
    }
  }

  private async initViewer() {
    if (!this.container) return;

    try {
      this.isLoading = true;
      this.error = null;

      const viewerContainer = document.createElement('div');
      viewerContainer.className = 'pdf-viewer-container';
      this.container.appendChild(viewerContainer);

      const options: EnhancedPDFViewerOptions = {
        container: viewerContainer,
        pdfUrl: this.pdfUrl,
        initialScale: this.initialScale,
        initialPage: this.initialPage,
        enableCaching: true,
        enableVirtualScroll: this.enableVirtualScroll,
        enableForms: this.enableForms,
        enableSignatures: this.enableSignatures,
        enableExport: true,
        enablePageManagement: true,
        enableTouchGestures: this.enableTouchGestures,
        enableKeyboard: true,
        enablePerformanceMonitoring: true
      };

      const instance = await createEnhancedPDFViewer(options);

      this.viewer = instance.viewer;
      this.formManager = instance.formManager || null;
      this.signatureManager = instance.signatureManager || null;
      this.pageManager = instance.pageManager || null;
      this.exportManager = instance.exportManager || null;
      this.touchHandler = instance.touchHandler || null;
      this.keyboardHandler = instance.keyboardHandler || null;
      this.cacheManager = instance.cacheManager || null;
      this.performanceMonitor = instance.performanceMonitor || null;

      // Set up event listeners
      this.viewer.on('page-change', (pageNum: number) => {
        this.currentPage = pageNum;
        this.dispatchEvent(new CustomEvent('page-change', { detail: pageNum }));
      });

      this.viewer.on('document-loaded', () => {
        this.totalPages = this.viewer?.totalPages || 0;
        this.isLoading = false;
        this.dispatchEvent(new CustomEvent('document-load'));
      });

      this.viewer.on('scale-change', (newScale: number) => {
        this.scale = newScale;
        this.dispatchEvent(new CustomEvent('scale-change', { detail: newScale }));
      });

      this.viewer.on('error', (err: Error) => {
        console.error('PDF Viewer Error:', err);
        this.error = err;
        this.isLoading = false;
        this.dispatchEvent(new CustomEvent('error', { detail: err }));
      });

      if (this.formManager) {
        this.formManager.on('submit', (data: any) => {
          this.dispatchEvent(new CustomEvent('form-submit', { detail: data }));
        });
      }

      if (this.signatureManager) {
        this.signatureManager.on('signature-added', (signature: any) => {
          this.dispatchEvent(new CustomEvent('signature-add', { detail: signature }));
        });
      }

    } catch (err) {
      console.error('Failed to initialize PDF viewer:', err);
      this.error = err as Error;
      this.isLoading = false;
      this.dispatchEvent(new CustomEvent('error', { detail: err }));
    }
  }

  private destroyViewer() {
    if (this.viewer) {
      this.viewer.destroy();
      this.viewer = null;
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  // Public methods
  async loadPDF(url: string) {
    if (!this.viewer) throw new Error('Viewer not initialized');
    this.isLoading = true;
    this.error = null;
    try {
      await this.viewer.loadPDF(url);
    } catch (err) {
      this.error = err as Error;
      throw err;
    }
  }

  goToPage(pageNum: number) {
    this.viewer?.goToPage(pageNum);
  }

  nextPage() {
    if (this.viewer && this.currentPage < this.totalPages) {
      this.viewer.goToPage(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.viewer && this.currentPage > 1) {
      this.viewer.goToPage(this.currentPage - 1);
    }
  }

  zoomIn() {
    if (this.viewer) {
      const newScale = Math.min(this.scale * 1.2, 5);
      this.viewer.setScale(newScale);
    }
  }

  zoomOut() {
    if (this.viewer) {
      const newScale = Math.max(this.scale / 1.2, 0.25);
      this.viewer.setScale(newScale);
    }
  }

  setScale(scale: number) {
    this.viewer?.setScale(scale);
  }

  print() {
    this.viewer?.print();
  }

  download() {
    this.viewer?.download();
  }

  async getFormData() {
    if (!this.formManager) throw new Error('Form manager not initialized');
    return this.formManager.getFormData();
  }

  async fillForm(data: any) {
    if (!this.formManager) throw new Error('Form manager not initialized');
    return this.formManager.fillForm(data);
  }

  async addSignature(signature: any, position: any) {
    if (!this.signatureManager) throw new Error('Signature manager not initialized');
    return this.signatureManager.addSignature(signature, position);
  }

  async exportToPDF(options?: any) {
    if (!this.exportManager) throw new Error('Export manager not initialized');
    return this.exportManager.exportToPDF(options);
  }

  async exportToImage(pageNum: number, options?: any) {
    if (!this.exportManager) throw new Error('Export manager not initialized');
    return this.exportManager.exportPageAsImage(pageNum, options);
  }

  override render() {
    return html`
      <div class="pdf-viewer-wrapper" part="container">
        ${this.showToolbar ? this.renderToolbar() : ''}
        <div class="pdf-viewer-main">
          ${this.showSidebar ? this.renderSidebar() : ''}
          <div class="pdf-container" part="viewer">
            ${this.isLoading ? this.renderLoading() : ''}
            ${this.error ? this.renderError() : ''}
          </div>
        </div>
      </div>
    `;
  }

  private renderToolbar() {
    return html`
      <div class="pdf-toolbar" part="toolbar">
        <div class="pdf-toolbar-group">
          <button @click=${this.zoomOut}>－</button>
          <span>${Math.round(this.scale * 100)}%</span>
          <button @click=${this.zoomIn}>＋</button>
        </div>
        <div class="pdf-toolbar-group">
          <button @click=${this.previousPage} ?disabled=${this.currentPage <= 1}>◀</button>
          <span>${this.currentPage} / ${this.totalPages}</span>
          <button @click=${this.nextPage} ?disabled=${this.currentPage >= this.totalPages}>▶</button>
        </div>
        <div class="pdf-toolbar-group">
          <button @click=${this.print}>🖨</button>
          <button @click=${this.download}>💾</button>
        </div>
        <slot name="toolbar-items"></slot>
      </div>
    `;
  }

  private renderSidebar() {
    return html`
      <div class="pdf-sidebar" part="sidebar">
        <slot name="sidebar"></slot>
      </div>
    `;
  }

  private renderLoading() {
    return html`
      <div class="pdf-loading">
        <slot name="loading">
          <span>加载中...</span>
        </slot>
      </div>
    `;
  }

  private renderError() {
    return html`
      <div class="pdf-error">
        <slot name="error">
          <span>加载失败: ${this.error?.message}</span>
        </slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pdf-viewer': PDFViewer;
  }
}


