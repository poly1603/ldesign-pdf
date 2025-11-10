/**
 * Vitest测试环境设置
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/dom';

// 扩展expect匹配器
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// 全局清理
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.clearAllTimers();
});

// Mock Canvas API
HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
  if (contextType === '2d') {
    return {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      measureText: vi.fn(() => ({ width: 100 })),
      drawImage: vi.fn(),
      createImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(4),
        width: 1,
        height: 1
      })),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(4),
        width: 1,
        height: 1
      })),
      putImageData: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      translate: vi.fn(),
      transform: vi.fn(),
      setTransform: vi.fn(),
      resetTransform: vi.fn(),
      createLinearGradient: vi.fn(),
      createRadialGradient: vi.fn(),
      createPattern: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      rect: vi.fn(),
      arc: vi.fn(),
      arcTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      clip: vi.fn(),
      isPointInPath: vi.fn(),
      isPointInStroke: vi.fn(),
      canvas: document.createElement('canvas')
    } as any;
  }
  return null;
}) as any;

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: []
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock requestIdleCallback
global.requestIdleCallback = vi.fn((callback) => {
  const deadline = {
    timeRemaining: () => 50,
    didTimeout: false
  };
  setTimeout(() => callback(deadline as any), 0);
  return Math.random();
});

global.cancelIdleCallback = vi.fn();

// Mock PDF.js
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {
    workerSrc: ''
  },
  getDocument: vi.fn(() => ({
    promise: Promise.resolve({
      numPages: 10,
      fingerprint: 'test-fingerprint',
      getPage: vi.fn((pageNum: number) => 
        Promise.resolve({
          pageNumber: pageNum,
          rotate: 0,
          getViewport: vi.fn(({ scale }) => ({
            width: 600 * scale,
            height: 800 * scale,
            scale,
            rotation: 0,
            transform: [1, 0, 0, -1, 0, 800]
          })),
          render: vi.fn(() => ({
            promise: Promise.resolve(),
            cancel: vi.fn()
          })),
          getTextContent: vi.fn(() => 
            Promise.resolve({
              items: [
                { str: 'Test text', dir: 'ltr', width: 100, height: 20 }
              ]
            })
          ),
          getAnnotations: vi.fn(() => Promise.resolve([]))
        })
      ),
      getMetadata: vi.fn(() => 
        Promise.resolve({
          info: { Title: 'Test PDF', Author: 'Test Author' },
          metadata: null,
          contentDispositionFilename: null
        })
      ),
      getOutline: vi.fn(() => Promise.resolve(null)),
      getAttachments: vi.fn(() => Promise.resolve(null)),
      destroy: vi.fn()
    })
  }))
}));

// Mock Worker
global.Worker = vi.fn().mockImplementation(() => ({
  postMessage: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  terminate: vi.fn()
})) as any;

// Mock performance.memory
Object.defineProperty(performance, 'memory', {
  value: {
    usedJSHeapSize: 50000000,
    totalJSHeapSize: 100000000,
    jsHeapSizeLimit: 200000000
  },
  writable: true
});

// Mock navigator.storage
Object.defineProperty(navigator, 'storage', {
  value: {
    estimate: vi.fn(() => Promise.resolve({
      usage: 50000000,
      quota: 100000000
    }))
  },
  writable: true
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock FileReader
global.FileReader = vi.fn().mockImplementation(() => ({
  readAsDataURL: vi.fn(function(this: any) {
    setTimeout(() => {
      this.result = 'data:application/pdf;base64,mock-data';
      this.onload?.({ target: this });
    }, 0);
  }),
  readAsArrayBuffer: vi.fn(function(this: any) {
    setTimeout(() => {
      this.result = new ArrayBuffer(100);
      this.onload?.({ target: this });
    }, 0);
  }),
  readAsText: vi.fn(function(this: any) {
    setTimeout(() => {
      this.result = 'mock text content';
      this.onload?.({ target: this });
    }, 0);
  }),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
})) as any;

// 自定义匹配器类型声明
declare global {
  namespace Vi {
    interface Assertion {
      toBeWithinRange(floor: number, ceiling: number): void;
    }
  }
}