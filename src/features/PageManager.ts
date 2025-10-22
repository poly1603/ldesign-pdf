/**
 * 页面管理器 - PDF页面操作
 * Page Manager for PDF page operations
 */

import type { PDFDocumentProxy } from '../types';
import { Logger } from '../core/Logger';
import { EventEmitter } from '../core/EventEmitter';

export interface PageInfo {
  pageNumber: number;
  width: number;
  height: number;
  rotation: number;
}

export interface PageOperation {
  type: 'extract' | 'delete' | 'reorder' | 'rotate' | 'insert';
  pageNumbers?: number[];
  targetPosition?: number;
  rotation?: number;
  data?: any;
}

export class PageManager extends EventEmitter {
  private document: PDFDocumentProxy;
  private logger: Logger;
  private pageRotations: Map<number, number> = new Map();

  constructor(document: PDFDocumentProxy) {
    super();
    this.document = document;
    this.logger = new Logger('PageManager');
  }

  /**
   * 获取页面信息
   */
  async getPageInfo(pageNumber: number): Promise<PageInfo | null> {
    try {
      if (pageNumber < 1 || pageNumber > this.document.numPages) {
        this.logger.warn(`Invalid page number: ${pageNumber}`);
        return null;
      }

      const page = await this.document.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.0 });

      return {
        pageNumber,
        width: viewport.width,
        height: viewport.height,
        rotation: this.pageRotations.get(pageNumber) || 0
      };
    } catch (error) {
      this.logger.error(`Failed to get page info for page ${pageNumber}`, error);
      return null;
    }
  }

  /**
   * 获取所有页面信息
   */
  async getAllPagesInfo(): Promise<PageInfo[]> {
    const pagesInfo: PageInfo[] = [];

    for (let i = 1; i <= this.document.numPages; i++) {
      const info = await this.getPageInfo(i);
      if (info) {
        pagesInfo.push(info);
      }
    }

    return pagesInfo;
  }

  /**
   * 提取页面（返回页面数据）
   */
  async extractPages(pageNumbers: number[]): Promise<Blob | null> {
    try {
      this.logger.info(`Extracting pages: ${pageNumbers.join(', ')}`);

      // 验证页码
      const validPages = pageNumbers.filter(p => p >= 1 && p <= this.document.numPages);

      if (validPages.length === 0) {
        this.logger.warn('No valid pages to extract');
        return null;
      }

      // Note: 实际提取需要PDF.js的高级API或第三方库
      // 这里提供接口定义，实际实现需要使用pdf-lib等库
      this.emit('pages-extracted', { pageNumbers: validPages });

      // 占位实现
      this.logger.warn('Page extraction not fully implemented - requires pdf-lib');
      return null;
    } catch (error) {
      this.logger.error('Failed to extract pages', error);
      return null;
    }
  }

  /**
   * 旋转页面（仅影响显示，不修改PDF文件）
   */
  rotatePage(pageNumber: number, degrees: 90 | 180 | 270 | -90 | -180 | -270): boolean {
    try {
      if (pageNumber < 1 || pageNumber > this.document.numPages) {
        this.logger.warn(`Invalid page number: ${pageNumber}`);
        return false;
      }

      const current Rotation = this.pageRotations.get(pageNumber) || 0;
      const newRotation = (currentRotation + degrees) % 360;

      this.pageRotations.set(pageNumber, newRotation);
      this.emit('page-rotated', { pageNumber, rotation: newRotation });

      this.logger.debug(`Page ${pageNumber} rotated to ${newRotation}°`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to rotate page ${pageNumber}`, error);
      return false;
    }
  }

  /**
   * 旋转多个页面
   */
  rotatePages(pageNumbers: number[], degrees: 90 | 180 | 270 | -90 | -180 | -270): number {
    let successCount = 0;

    for (const pageNumber of pageNumbers) {
      if (this.rotatePage(pageNumber, degrees)) {
        successCount++;
      }
    }

    this.logger.info(`Rotated ${successCount}/${pageNumbers.length} pages`);
    return successCount;
  }

  /**
   * 旋转所有页面
   */
  rotateAllPages(degrees: 90 | 180 | 270 | -90 | -180 | -270): void {
    const allPages = Array.from({ length: this.document.numPages }, (_, i) => i + 1);
    this.rotatePages(allPages, degrees);
  }

  /**
   * 获取页面旋转角度
   */
  getPageRotation(pageNumber: number): number {
    return this.pageRotations.get(pageNumber) || 0;
  }

  /**
   * 重置页面旋转
   */
  resetPageRotation(pageNumber: number): void {
    this.pageRotations.delete(pageNumber);
    this.emit('page-rotation-reset', { pageNumber });
  }

  /**
   * 重置所有页面旋转
   */
  resetAllRotations(): void {
    this.pageRotations.clear();
    this.emit('all-rotations-reset');
    this.logger.info('All page rotations reset');
  }

  /**
   * 获取页面总数
   */
  getTotalPages(): number {
    return this.document.numPages;
  }

  /**
   * 验证页码范围
   */
  validatePageNumbers(pageNumbers: number[]): { valid: number[]; invalid: number[] } {
    const valid: number[] = [];
    const invalid: number[] = [];

    for (const pageNumber of pageNumbers) {
      if (pageNumber >= 1 && pageNumber <= this.document.numPages) {
        valid.push(pageNumber);
      } else {
        invalid.push(pageNumber);
      }
    }

    return { valid, invalid };
  }

  /**
   * 解析页码范围字符串 (例如: "1-5,7,10-12")
   */
  parsePageRange(rangeString: string): number[] {
    const pages: number[] = [];
    const parts = rangeString.split(',');

    for (const part of parts) {
      const trimmed = part.trim();

      if (trimmed.includes('-')) {
        // 范围
        const [start, end] = trimmed.split('-').map(s => parseInt(s.trim(), 10));

        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= this.document.numPages && !pages.includes(i)) {
              pages.push(i);
            }
          }
        }
      } else {
        // 单个页码
        const pageNum = parseInt(trimmed, 10);

        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= this.document.numPages && !pages.includes(pageNum)) {
          pages.push(pageNum);
        }
      }
    }

    return pages.sort((a, b) => a - b);
  }

  /**
   * 获取连续页码范围
   */
  getConsecutiveRanges(pageNumbers: number[]): string {
    if (pageNumbers.length === 0) return '';

    const sorted = [...pageNumbers].sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = sorted[0];
    let end = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === end + 1) {
        end = sorted[i];
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = sorted[i];
        end = sorted[i];
      }
    }

    ranges.push(start === end ? `${start}` : `${start}-${end}`);

    return ranges.join(',');
  }

  /**
   * 导出页面管理状态
   */
  exportState(): string {
    const state = {
      totalPages: this.document.numPages,
      rotations: Object.fromEntries(this.pageRotations),
      timestamp: new Date().toISOString()
    };

    return JSON.stringify(state, null, 2);
  }

  /**
   * 导入页面管理状态
   */
  importState(jsonState: string): boolean {
    try {
      const state = JSON.parse(jsonState);

      if (state.rotations) {
        this.pageRotations.clear();

        for (const [pageStr, rotation] of Object.entries(state.rotations)) {
          const pageNum = parseInt(pageStr, 10);
          if (!isNaN(pageNum) && typeof rotation === 'number') {
            this.pageRotations.set(pageNum, rotation);
          }
        }
      }

      this.emit('state-imported', state);
      this.logger.info('Page manager state imported');

      return true;
    } catch (error) {
      this.logger.error('Failed to import state', error);
      return false;
    }
  }

  /**
   * 销毁页面管理器
   */
  destroy(): void {
    this.pageRotations.clear();
    this.removeAllListeners();
  }
}

