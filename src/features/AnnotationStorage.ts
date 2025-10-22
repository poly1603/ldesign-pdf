/**
 * 注释存储管理器 - 持久化注释数据
 * Annotation Storage Manager for persisting annotations
 */

import { Logger } from '../core/Logger';
import { EventEmitter } from '../core/EventEmitter';

export interface Annotation {
  id: string;
  type: 'highlight' | 'underline' | 'strikeout' | 'rectangle' | 'circle' | 'arrow' | 'freehand' | 'text' | 'stamp';
  pageNumber: number;
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  color: string;
  opacity?: number;
  content?: string; // 文本注释内容
  author?: string;
  createdAt: Date;
  modifiedAt?: Date;
  metadata?: any;
  // 自由手绘路径
  paths?: Array<{ x: number; y: number }[]>;
}

export interface AnnotationComment {
  id: string;
  annotationId: string;
  content: string;
  author: string;
  createdAt: Date;
}

export interface StorageOptions {
  storageType?: 'localStorage' | 'indexedDB' | 'memory';
  storageKey?: string;
  autoSave?: boolean;
  autoSaveInterval?: number; // 毫秒
}

export class AnnotationStorage extends EventEmitter {
  private logger: Logger;
  private annotations = new Map<string, Annotation>();
  private comments = new Map<string, AnnotationComment[]>();
  private storageType: 'localStorage' | 'indexedDB' | 'memory';
  private storageKey: string;
  private autoSave: boolean;
  private autoSaveTimer: any = null;
  private isDirty: boolean = false;

  constructor(options: StorageOptions = {}) {
    super();
    this.logger = new Logger('AnnotationStorage');
    this.storageType = options.storageType || 'localStorage';
    this.storageKey = options.storageKey || 'pdf-annotations';
    this.autoSave = options.autoSave ?? true;

    if (this.autoSave) {
      this.startAutoSave(options.autoSaveInterval || 30000); // 默认30秒
    }

    // 加载已保存的注释
    this.load();
  }

  /**
   * 添加注释
   */
  addAnnotation(annotation: Omit<Annotation, 'id' | 'createdAt'>): Annotation {
    const fullAnnotation: Annotation = {
      ...annotation,
      id: this.generateId(),
      createdAt: new Date()
    };

    this.annotations.set(fullAnnotation.id, fullAnnotation);
    this.isDirty = true;

    this.emit('annotation-added', fullAnnotation);
    this.logger.debug(`Annotation added: ${fullAnnotation.id}`);

    return fullAnnotation;
  }

  /**
   * 更新注释
   */
  updateAnnotation(id: string, updates: Partial<Annotation>): boolean {
    const annotation = this.annotations.get(id);

    if (!annotation) {
      this.logger.warn(`Annotation not found: ${id}`);
      return false;
    }

    Object.assign(annotation, updates, {
      modifiedAt: new Date()
    });

    this.isDirty = true;
    this.emit('annotation-updated', annotation);
    this.logger.debug(`Annotation updated: ${id}`);

    return true;
  }

  /**
   * 删除注释
   */
  deleteAnnotation(id: string): boolean {
    const deleted = this.annotations.delete(id);

    if (deleted) {
      // 删除相关评论
      this.comments.delete(id);
      this.isDirty = true;

      this.emit('annotation-deleted', id);
      this.logger.debug(`Annotation deleted: ${id}`);
    }

    return deleted;
  }

  /**
   * 获取注释
   */
  getAnnotation(id: string): Annotation | undefined {
    return this.annotations.get(id);
  }

  /**
   * 获取所有注释
   */
  getAllAnnotations(): Annotation[] {
    return Array.from(this.annotations.values());
  }

  /**
   * 根据页码获取注释
   */
  getAnnotationsByPage(pageNumber: number): Annotation[] {
    return Array.from(this.annotations.values())
      .filter(a => a.pageNumber === pageNumber);
  }

  /**
   * 根据类型获取注释
   */
  getAnnotationsByType(type: Annotation['type']): Annotation[] {
    return Array.from(this.annotations.values())
      .filter(a => a.type === type);
  }

  /**
   * 根据作者获取注释
   */
  getAnnotationsByAuthor(author: string): Annotation[] {
    return Array.from(this.annotations.values())
      .filter(a => a.author === author);
  }

  /**
   * 添加评论
   */
  addComment(annotationId: string, content: string, author: string): AnnotationComment | null {
    if (!this.annotations.has(annotationId)) {
      this.logger.warn(`Annotation not found: ${annotationId}`);
      return null;
    }

    const comment: AnnotationComment = {
      id: this.generateId(),
      annotationId,
      content,
      author,
      createdAt: new Date()
    };

    const existing = this.comments.get(annotationId) || [];
    existing.push(comment);
    this.comments.set(annotationId, existing);

    this.isDirty = true;
    this.emit('comment-added', comment);

    return comment;
  }

  /**
   * 获取注释的评论
   */
  getComments(annotationId: string): AnnotationComment[] {
    return this.comments.get(annotationId) || [];
  }

  /**
   * 删除评论
   */
  deleteComment(commentId: string): boolean {
    for (const [annotationId, comments] of this.comments.entries()) {
      const index = comments.findIndex(c => c.id === commentId);

      if (index >= 0) {
        comments.splice(index, 1);
        this.isDirty = true;
        this.emit('comment-deleted', commentId);
        return true;
      }
    }

    return false;
  }

  /**
   * 保存到存储
   */
  async save(): Promise<boolean> {
    try {
      const data = {
        annotations: Array.from(this.annotations.values()),
        comments: Object.fromEntries(this.comments),
        version: '2.0',
        savedAt: new Date().toISOString()
      };

      switch (this.storageType) {
        case 'localStorage':
          await this.saveToLocalStorage(data);
          break;
        case 'indexedDB':
          await this.saveToIndexedDB(data);
          break;
        case 'memory':
          // Memory storage doesn't persist
          break;
      }

      this.isDirty = false;
      this.emit('saved', data);
      this.logger.info('Annotations saved');

      return true;
    } catch (error) {
      this.logger.error('Failed to save annotations', error);
      this.emit('save-error', error);
      return false;
    }
  }

  /**
   * 从存储加载
   */
  async load(): Promise<boolean> {
    try {
      let data: any = null;

      switch (this.storageType) {
        case 'localStorage':
          data = await this.loadFromLocalStorage();
          break;
        case 'indexedDB':
          data = await this.loadFromIndexedDB();
          break;
      }

      if (data) {
        this.annotations.clear();
        this.comments.clear();

        // 恢复注释
        if (data.annotations) {
          data.annotations.forEach((ann: Annotation) => {
            // 恢复日期对象
            ann.createdAt = new Date(ann.createdAt);
            if (ann.modifiedAt) {
              ann.modifiedAt = new Date(ann.modifiedAt);
            }
            this.annotations.set(ann.id, ann);
          });
        }

        // 恢复评论
        if (data.comments) {
          for (const [annotationId, comments] of Object.entries(data.comments)) {
            const commentList = (comments as AnnotationComment[]).map(c => ({
              ...c,
              createdAt: new Date(c.createdAt)
            }));
            this.comments.set(annotationId, commentList);
          }
        }

        this.isDirty = false;
        this.emit('loaded', data);
        this.logger.info(`Loaded ${this.annotations.size} annotations`);

        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('Failed to load annotations', error);
      this.emit('load-error', error);
      return false;
    }
  }

  /**
   * 保存到LocalStorage
   */
  private async saveToLocalStorage(data: any): Promise<void> {
    if (typeof localStorage === 'undefined') {
      throw new Error('LocalStorage not available');
    }

    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  /**
   * 从LocalStorage加载
   */
  private async loadFromLocalStorage(): Promise<any> {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const json = localStorage.getItem(this.storageKey);
    return json ? JSON.parse(json) : null;
  }

  /**
   * 保存到IndexedDB
   */
  private async saveToIndexedDB(data: any): Promise<void> {
    // 简化的IndexedDB实现
    if (typeof indexedDB === 'undefined') {
      throw new Error('IndexedDB not available');
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PDFAnnotations', 1);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('annotations')) {
          db.createObjectStore('annotations');
        }
      };

      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction(['annotations'], 'readwrite');
        const store = transaction.objectStore('annotations');

        store.put(data, this.storageKey);

        transaction.oncomplete = () => {
          db.close();
          resolve();
        };

        transaction.onerror = () => reject(transaction.error);
      };
    });
  }

  /**
   * 从IndexedDB加载
   */
  private async loadFromIndexedDB(): Promise<any> {
    if (typeof indexedDB === 'undefined') {
      return null;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PDFAnnotations', 1);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('annotations')) {
          db.createObjectStore('annotations');
        }
      };

      request.onsuccess = (event: any) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('annotations')) {
          db.close();
          resolve(null);
          return;
        }

        const transaction = db.transaction(['annotations'], 'readonly');
        const store = transaction.objectStore('annotations');
        const getRequest = store.get(this.storageKey);

        getRequest.onsuccess = () => {
          db.close();
          resolve(getRequest.result || null);
        };

        getRequest.onerror = () => {
          db.close();
          reject(getRequest.error);
        };
      };
    });
  }

  /**
   * 开始自动保存
   */
  private startAutoSave(interval: number): void {
    this.stopAutoSave();

    this.autoSaveTimer = setInterval(() => {
      if (this.isDirty) {
        this.save();
      }
    }, interval);
  }

  /**
   * 停止自动保存
   */
  private stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * 导出为JSON
   */
  exportToJSON(): string {
    const data = {
      annotations: Array.from(this.annotations.values()),
      comments: Object.fromEntries(this.comments),
      version: '2.0',
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * 从JSON导入
   */
  importFromJSON(json: string): boolean {
    try {
      const data = JSON.parse(json);

      if (data.annotations) {
        data.annotations.forEach((ann: Annotation) => {
          ann.createdAt = new Date(ann.createdAt);
          if (ann.modifiedAt) {
            ann.modifiedAt = new Date(ann.modifiedAt);
          }
          this.annotations.set(ann.id, ann);
        });
      }

      if (data.comments) {
        for (const [annotationId, comments] of Object.entries(data.comments)) {
          const commentList = (comments as AnnotationComment[]).map(c => ({
            ...c,
            createdAt: new Date(c.createdAt)
          }));
          this.comments.set(annotationId, commentList);
        }
      }

      this.isDirty = true;
      this.emit('imported', data);
      this.logger.info('Annotations imported');

      return true;
    } catch (error) {
      this.logger.error('Failed to import annotations', error);
      return false;
    }
  }

  /**
   * 清空所有注释
   */
  clear(): void {
    this.annotations.clear();
    this.comments.clear();
    this.isDirty = true;

    this.emit('cleared');
    this.logger.info('All annotations cleared');
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `ann-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalAnnotations: this.annotations.size,
      totalComments: Array.from(this.comments.values()).reduce((sum, comments) => sum + comments.length, 0),
      annotationsByType: this.getAnnotationCountByType(),
      annotationsByPage: this.getAnnotationCountByPage()
    };
  }

  /**
   * 按类型统计注释数量
   */
  private getAnnotationCountByType(): Record<string, number> {
    const counts: Record<string, number> = {};

    for (const annotation of this.annotations.values()) {
      counts[annotation.type] = (counts[annotation.type] || 0) + 1;
    }

    return counts;
  }

  /**
   * 按页码统计注释数量
   */
  private getAnnotationCountByPage(): Record<number, number> {
    const counts: Record<number, number> = {};

    for (const annotation of this.annotations.values()) {
      counts[annotation.pageNumber] = (counts[annotation.pageNumber] || 0) + 1;
    }

    return counts;
  }

  /**
   * 销毁存储管理器
   */
  destroy(): void {
    this.stopAutoSave();

    if (this.isDirty && this.autoSave) {
      this.save(); // 最后保存一次
    }

    this.annotations.clear();
    this.comments.clear();
    this.removeAllListeners();
  }
}

