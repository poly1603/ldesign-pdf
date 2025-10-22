/**
 * 签名管理器 - 数字签名功能
 * Signature Manager for digital signatures
 */

import { Logger } from '../core/Logger';
import { EventEmitter } from '../core/EventEmitter';

export interface Signature {
  id: string;
  type: 'draw' | 'text' | 'image';
  data: string; // Base64 for image/draw, text for text signatures
  name?: string;
  createdAt: Date;
  width: number;
  height: number;
}

export interface SignaturePosition {
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlacedSignature {
  id: string;
  signatureId: string;
  position: SignaturePosition;
  timestamp: Date;
}

export class SignatureManager extends EventEmitter {
  private logger: Logger;
  private signatures: Map<string, Signature> = new Map();
  private placedSignatures: Map<string, PlacedSignature> = new Map();
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing: boolean = false;
  private drawingPoints: Array<{ x: number; y: number }> = [];

  constructor() {
    super();
    this.logger = new Logger('SignatureManager');
  }

  /**
   * 创建绘制签名的Canvas
   */
  createDrawingCanvas(width: number = 400, height: number = 200): HTMLCanvasElement {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');

    if (this.ctx) {
      // 设置样式
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
    }

    // 添加事件监听
    this.setupDrawingEvents();

    return this.canvas;
  }

  /**
   * 设置绘制事件
   */
  private setupDrawingEvents(): void {
    if (!this.canvas) return;

    this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    this.canvas.addEventListener('mousemove', this.draw.bind(this));
    this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    this.canvas.addEventListener('mouseleave', this.stopDrawing.bind(this));

    // 触摸事件
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas?.dispatchEvent(mouseEvent);
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas?.dispatchEvent(mouseEvent);
    });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      const mouseEvent = new MouseEvent('mouseup', {});
      this.canvas?.dispatchEvent(mouseEvent);
    });
  }

  /**
   * 开始绘制
   */
  private startDrawing(e: MouseEvent): void {
    if (!this.canvas || !this.ctx) return;

    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.drawingPoints = [{ x, y }];
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  /**
   * 绘制
   */
  private draw(e: MouseEvent): void {
    if (!this.isDrawing || !this.canvas || !this.ctx) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.drawingPoints.push({ x, y });
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  /**
   * 停止绘制
   */
  private stopDrawing(): void {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.emit('drawing-complete', this.drawingPoints);
    }
  }

  /**
   * 保存手绘签名
   */
  saveDrawnSignature(name?: string): Signature | null {
    if (!this.canvas) {
      this.logger.error('No canvas available');
      return null;
    }

    try {
      const dataURL = this.canvas.toDataURL('image/png');
      const signature: Signature = {
        id: this.generateId(),
        type: 'draw',
        data: dataURL,
        name: name || 'Drawn Signature',
        createdAt: new Date(),
        width: this.canvas.width,
        height: this.canvas.height
      };

      this.signatures.set(signature.id, signature);
      this.emit('signature-saved', signature);
      this.logger.info(`Signature saved: ${signature.id}`);

      return signature;
    } catch (error) {
      this.logger.error('Failed to save signature', error);
      return null;
    }
  }

  /**
   * 创建文字签名
   */
  createTextSignature(text: string, options: {
    font?: string;
    fontSize?: number;
    color?: string;
    name?: string;
  } = {}): Signature | null {
    try {
      const {
        font = 'cursive',
        fontSize = 48,
        color = '#000000',
        name
      } = options;

      // 创建临时canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // 设置字体
      ctx.font = `${fontSize}px ${font}`;

      // 测量文本
      const metrics = ctx.measureText(text);
      const width = Math.ceil(metrics.width) + 20;
      const height = fontSize + 20;

      // 设置canvas尺寸
      canvas.width = width;
      canvas.height = height;

      // 重新设置字体（尺寸改变后会重置）
      ctx.font = `${fontSize}px ${font}`;
      ctx.fillStyle = color;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      // 绘制文本
      ctx.fillText(text, width / 2, height / 2);

      const dataURL = canvas.toDataURL('image/png');
      const signature: Signature = {
        id: this.generateId(),
        type: 'text',
        data: dataURL,
        name: name || `Text: ${text}`,
        createdAt: new Date(),
        width,
        height
      };

      this.signatures.set(signature.id, signature);
      this.emit('signature-saved', signature);
      this.logger.info(`Text signature created: ${signature.id}`);

      return signature;
    } catch (error) {
      this.logger.error('Failed to create text signature', error);
      return null;
    }
  }

  /**
   * 从图片创建签名
   */
  async createImageSignature(imageFile: File, name?: string): Promise<Signature | null> {
    return new Promise((resolve) => {
      try {
        const reader = new FileReader();

        reader.onload = (e) => {
          const img = new Image();

          img.onload = () => {
            const signature: Signature = {
              id: this.generateId(),
              type: 'image',
              data: e.target?.result as string,
              name: name || imageFile.name,
              createdAt: new Date(),
              width: img.width,
              height: img.height
            };

            this.signatures.set(signature.id, signature);
            this.emit('signature-saved', signature);
            this.logger.info(`Image signature created: ${signature.id}`);

            resolve(signature);
          };

          img.onerror = () => {
            this.logger.error('Failed to load image');
            resolve(null);
          };

          img.src = e.target?.result as string;
        };

        reader.onerror = () => {
          this.logger.error('Failed to read image file');
          resolve(null);
        };

        reader.readAsDataURL(imageFile);
      } catch (error) {
        this.logger.error('Failed to create image signature', error);
        resolve(null);
      }
    });
  }

  /**
   * 放置签名到PDF
   */
  placeSignature(signatureId: string, position: SignaturePosition): PlacedSignature | null {
    const signature = this.signatures.get(signatureId);

    if (!signature) {
      this.logger.error(`Signature not found: ${signatureId}`);
      return null;
    }

    const placed: PlacedSignature = {
      id: this.generateId(),
      signatureId,
      position,
      timestamp: new Date()
    };

    this.placedSignatures.set(placed.id, placed);
    this.emit('signature-placed', { signature, placed });
    this.logger.info(`Signature placed: ${placed.id} on page ${position.pageNumber}`);

    return placed;
  }

  /**
   * 移除已放置的签名
   */
  removePlacedSignature(placedId: string): boolean {
    const removed = this.placedSignatures.delete(placedId);

    if (removed) {
      this.emit('signature-removed', placedId);
      this.logger.info(`Placed signature removed: ${placedId}`);
    }

    return removed;
  }

  /**
   * 清空绘制区域
   */
  clearDrawing(): void {
    if (this.canvas && this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawingPoints = [];
      this.emit('drawing-cleared');
    }
  }

  /**
   * 获取所有签名
   */
  getAllSignatures(): Signature[] {
    return Array.from(this.signatures.values());
  }

  /**
   * 获取已放置的签名
   */
  getPlacedSignatures(): PlacedSignature[] {
    return Array.from(this.placedSignatures.values());
  }

  /**
   * 根据页码获取签名
   */
  getSignaturesByPage(pageNumber: number): Array<{ signature: Signature; placed: PlacedSignature }> {
    return Array.from(this.placedSignatures.values())
      .filter(placed => placed.position.pageNumber === pageNumber)
      .map(placed => ({
        signature: this.signatures.get(placed.signatureId)!,
        placed
      }))
      .filter(item => item.signature !== undefined);
  }

  /**
   * 删除签名
   */
  deleteSignature(signatureId: string): boolean {
    // 先删除所有使用该签名的放置实例
    const placedToRemove = Array.from(this.placedSignatures.entries())
      .filter(([_, placed]) => placed.signatureId === signatureId)
      .map(([id]) => id);

    placedToRemove.forEach(id => this.placedSignatures.delete(id));

    // 删除签名本身
    const removed = this.signatures.delete(signatureId);

    if (removed) {
      this.emit('signature-deleted', signatureId);
      this.logger.info(`Signature deleted: ${signatureId}`);
    }

    return removed;
  }

  /**
   * 导出签名库
   */
  exportSignatures(): string {
    const data = {
      signatures: Array.from(this.signatures.values()),
      placedSignatures: Array.from(this.placedSignatures.values())
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * 导入签名库
   */
  importSignatures(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      if (data.signatures) {
        data.signatures.forEach((sig: Signature) => {
          this.signatures.set(sig.id, {
            ...sig,
            createdAt: new Date(sig.createdAt)
          });
        });
      }

      if (data.placedSignatures) {
        data.placedSignatures.forEach((placed: PlacedSignature) => {
          this.placedSignatures.set(placed.id, {
            ...placed,
            timestamp: new Date(placed.timestamp)
          });
        });
      }

      this.emit('signatures-imported', data);
      this.logger.info('Signatures imported successfully');

      return true;
    } catch (error) {
      this.logger.error('Failed to import signatures', error);
      return false;
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `sig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 销毁签名管理器
   */
  destroy(): void {
    this.signatures.clear();
    this.placedSignatures.clear();

    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
      this.ctx = null;
    }

    this.removeAllListeners();
  }
}

