/**
 * 导出管理器 - PDF导出为各种格式
 * Export Manager for exporting PDF to various formats
 */

import type { PDFDocumentProxy } from '../types';
import { Logger } from '../core/Logger';
import { EventEmitter } from '../core/EventEmitter';

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'webp' | 'text';
  pageNumbers?: number[]; // 导出指定页面，默认全部
  quality?: number; // 0-1，仅用于jpeg/webp
  scale?: number; // 渲染比例，默认2.0
  filename?: string;
  includeAnnotations?: boolean;
}

export interface ExportProgress {
  current: number;
  total: number;
  percentage: number;
  currentPage?: number;
}

export class ExportManager extends EventEmitter {
  private document: PDFDocumentProxy;
  private logger: Logger;
  private isExporting: boolean = false;
  private cancelRequested: boolean = false;

  constructor(document: PDFDocumentProxy) {
    super();
    this.document = document;
    this.logger = new Logger('ExportManager');
  }

  /**
   * 导出为图片
   */
  async exportAsImages(options: ExportOptions): Promise<Blob[] | null> {
    if (this.isExporting) {
      this.logger.warn('Export already in progress');
      return null;
    }

    try {
      this.isExporting = true;
      this.cancelRequested = false;

      const {
        format = 'png',
        pageNumbers,
        quality = 0.92,
        scale = 2.0
      } = options;

      // 确定要导出的页面
      const pages = pageNumbers && pageNumbers.length > 0
        ? pageNumbers.filter(p => p >= 1 && p <= this.document.numPages)
        : Array.from({ length: this.document.numPages }, (_, i) => i + 1);

      if (pages.length === 0) {
        this.logger.warn('No valid pages to export');
        return null;
      }

      this.logger.info(`Exporting ${pages.length} pages as ${format}`);
      this.emit('export-started', { format, pageCount: pages.length });

      const blobs: Blob[] = [];

      for (let i = 0; i < pages.length; i++) {
        if (this.cancelRequested) {
          this.logger.info('Export cancelled');
          this.emit('export-cancelled');
          break;
        }

        const pageNumber = pages[i];
        const blob = await this.exportPageAsImage(pageNumber, format, quality, scale);

        if (blob) {
          blobs.push(blob);
        }

        // 更新进度
        const progress: ExportProgress = {
          current: i + 1,
          total: pages.length,
          percentage: Math.round(((i + 1) / pages.length) * 100),
          currentPage: pageNumber
        };

        this.emit('export-progress', progress);
      }

      this.isExporting = false;
      this.emit('export-completed', { format, count: blobs.length });

      return blobs;
    } catch (error) {
      this.isExporting = false;
      this.logger.error('Export failed', error);
      this.emit('export-error', error);
      return null;
    }
  }

  /**
   * 导出单页为图片
   */
  private async exportPageAsImage(
    pageNumber: number,
    format: 'png' | 'jpeg' | 'webp',
    quality: number,
    scale: number
  ): Promise<Blob | null> {
    try {
      const page = await this.document.getPage(pageNumber);
      const viewport = page.getViewport({ scale });

      // 创建canvas
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        this.logger.error('Failed to get canvas context');
        return null;
      }

      // 渲染页面
      await page.render({
        canvasContext: ctx,
        viewport: viewport
      }).promise;

      // 转换为blob
      return new Promise((resolve) => {
        const mimeType = `image/${format}`;
        canvas.toBlob(
          (blob) => resolve(blob),
          mimeType,
          format === 'jpeg' || format === 'webp' ? quality : undefined
        );
      });
    } catch (error) {
      this.logger.error(`Failed to export page ${pageNumber}`, error);
      return null;
    }
  }

  /**
   * 导出为文本
   */
  async exportAsText(options: Omit<ExportOptions, 'format' | 'quality'> = {}): Promise<string | null> {
    try {
      this.logger.info('Exporting as text');
      this.emit('export-started', { format: 'text' });

      const {
        pageNumbers
      } = options;

      // 确定要导出的页面
      const pages = pageNumbers && pageNumbers.length > 0
        ? pageNumbers.filter(p => p >= 1 && p <= this.document.numPages)
        : Array.from({ length: this.document.numPages }, (_, i) => i + 1);

      const textParts: string[] = [];

      for (let i = 0; i < pages.length; i++) {
        const pageNumber = pages[i];
        const pageText = await this.extractPageText(pageNumber);

        if (pageText) {
          textParts.push(`\n\n--- Page ${pageNumber} ---\n\n${pageText}`);
        }

        // 更新进度
        const progress: ExportProgress = {
          current: i + 1,
          total: pages.length,
          percentage: Math.round(((i + 1) / pages.length) * 100),
          currentPage: pageNumber
        };

        this.emit('export-progress', progress);
      }

      const fullText = textParts.join('\n');
      this.emit('export-completed', { format: 'text', length: fullText.length });

      return fullText;
    } catch (error) {
      this.logger.error('Failed to export as text', error);
      this.emit('export-error', error);
      return null;
    }
  }

  /**
   * 提取单页文本
   */
  private async extractPageText(pageNumber: number): Promise<string | null> {
    try {
      const page = await this.document.getPage(pageNumber);
      const textContent = await page.getTextContent();

      const text = textContent.items
        .map((item: any) => item.str)
        .join(' ');

      return text;
    } catch (error) {
      this.logger.error(`Failed to extract text from page ${pageNumber}`, error);
      return null;
    }
  }

  /**
   * 批量导出并下载
   */
  async exportAndDownload(options: ExportOptions): Promise<void> {
    const { format, filename = 'export' } = options;

    if (format === 'text') {
      // 导出文本
      const text = await this.exportAsText(options);
      if (text) {
        this.downloadText(text, `${filename}.txt`);
      }
    } else {
      // 导出图片
      const blobs = await this.exportAsImages(options);
      if (blobs && blobs.length > 0) {
        // 单页直接下载
        if (blobs.length === 1) {
          this.downloadBlob(blobs[0], `${filename}.${format}`);
        } else {
          // 多页：每页单独下载或打包为ZIP（需要额外库）
          blobs.forEach((blob, index) => {
            const pageNum = (options.pageNumbers && options.pageNumbers[index]) || (index + 1);
            this.downloadBlob(blob, `${filename}-page${pageNum}.${format}`);
          });
        }
      }
    }
  }

  /**
   * 下载Blob
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    // 延迟释放URL
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * 下载文本
   */
  private downloadText(text: string, filename: string): void {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    this.downloadBlob(blob, filename);
  }

  /**
   * 取消导出
   */
  cancel(): void {
    if (this.isExporting) {
      this.cancelRequested = true;
      this.logger.info('Export cancellation requested');
    }
  }

  /**
   * 获取导出状态
   */
  getStatus() {
    return {
      isExporting: this.isExporting,
      cancelRequested: this.cancelRequested
    };
  }

  /**
   * 估算导出大小
   */
  async estimateExportSize(options: ExportOptions): Promise<number> {
    // 粗略估算：每页约1-5MB，取决于格式和质量
    const pageCount = options.pageNumbers?.length || this.document.numPages;
    const scale = options.scale || 2.0;

    let sizePerPageMB = 1.0;

    if (options.format === 'png') {
      sizePerPageMB = 2.0 * scale;
    } else if (options.format === 'jpeg') {
      sizePerPageMB = 0.5 * scale * (options.quality || 0.92);
    } else if (options.format === 'webp') {
      sizePerPageMB = 0.3 * scale * (options.quality || 0.92);
    } else if (options.format === 'text') {
      sizePerPageMB = 0.01; // 文本很小
    }

    return pageCount * sizePerPageMB * 1024 * 1024; // 返回字节数
  }

  /**
   * 销毁导出管理器
   */
  destroy(): void {
    this.cancel();
    this.removeAllListeners();
  }
}

