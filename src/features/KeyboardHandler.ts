/**
 * 键盘处理器 - 键盘导航和快捷键
 * Keyboard Handler for navigation and shortcuts
 */

import { Logger } from '../core/Logger';
import { EventEmitter } from '../core/EventEmitter';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean; // Command key on Mac
  description: string;
  action: () => void;
  enabled?: boolean;
}

export interface KeyboardHandlerOptions {
  container?: HTMLElement;
  enableDefaultShortcuts?: boolean;
}

export class KeyboardHandler extends EventEmitter {
  private logger: Logger;
  private shortcuts = new Map<string, KeyboardShortcut>();
  private container: HTMLElement;
  private enabled: boolean = true;

  constructor(options: KeyboardHandlerOptions = {}) {
    super();
    this.logger = new Logger('KeyboardHandler');
    this.container = options.container || document.body;

    if (options.enableDefaultShortcuts !== false) {
      this.registerDefaultShortcuts();
    }

    this.init();
  }

  /**
   * 初始化键盘监听
   */
  private init(): void {
    this.container.addEventListener('keydown', this.handleKeyDown.bind(this));

    // 确保容器可获得焦点
    if (this.container.tabIndex < 0) {
      this.container.tabIndex = 0;
    }
  }

  /**
   * 处理按键
   */
  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.enabled) return;

    const shortcutKey = this.getShortcutKey(e);
    const shortcut = this.shortcuts.get(shortcutKey);

    if (shortcut && shortcut.enabled !== false) {
      // 阻止默认行为
      e.preventDefault();
      e.stopPropagation();

      try {
        shortcut.action();
        this.emit('shortcut-executed', { key: shortcutKey, shortcut });
        this.logger.debug(`Shortcut executed: ${shortcutKey}`);
      } catch (error) {
        this.logger.error(`Error executing shortcut ${shortcutKey}`, error);
      }
    }
  }

  /**
   * 生成快捷键标识
   */
  private getShortcutKey(e: KeyboardEvent): string {
    const parts: string[] = [];

    if (e.ctrlKey) parts.push('Ctrl');
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');
    if (e.metaKey) parts.push('Meta');

    parts.push(e.key);

    return parts.join('+');
  }

  /**
   * 注册快捷键
   */
  register(shortcut: KeyboardShortcut): void {
    const key = this.buildKey(shortcut);
    this.shortcuts.set(key, { ...shortcut, enabled: shortcut.enabled ?? true });
    this.logger.debug(`Shortcut registered: ${key}`);
  }

  /**
   * 批量注册快捷键
   */
  registerMultiple(shortcuts: KeyboardShortcut[]): void {
    shortcuts.forEach(shortcut => this.register(shortcut));
  }

  /**
   * 构建快捷键标识
   */
  private buildKey(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];

    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.meta) parts.push('Meta');

    parts.push(shortcut.key);

    return parts.join('+');
  }

  /**
   * 注销快捷键
   */
  unregister(key: string): boolean {
    const removed = this.shortcuts.delete(key);
    if (removed) {
      this.logger.debug(`Shortcut unregistered: ${key}`);
    }
    return removed;
  }

  /**
   * 启用/禁用特定快捷键
   */
  setShortcutEnabled(key: string, enabled: boolean): void {
    const shortcut = this.shortcuts.get(key);
    if (shortcut) {
      shortcut.enabled = enabled;
    }
  }

  /**
   * 启用/禁用所有快捷键
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.logger.info(`Keyboard handler ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * 注册默认快捷键
   */
  private registerDefaultShortcuts(): void {
    // 这些快捷键需要由使用者提供具体的action
    // 这里只提供示例结构
    const defaults: Array<Omit<KeyboardShortcut, 'action'> & { actionName: string }> = [
      {
        key: ' ', // Space
        actionName: 'nextPage',
        description: '下一页'
      },
      {
        key: ' ',
        shift: true,
        actionName: 'previousPage',
        description: '上一页'
      },
      {
        key: 'ArrowRight',
        actionName: 'nextPage',
        description: '下一页'
      },
      {
        key: 'ArrowLeft',
        actionName: 'previousPage',
        description: '上一页'
      },
      {
        key: 'PageDown',
        actionName: 'nextPage',
        description: '下一页'
      },
      {
        key: 'PageUp',
        actionName: 'previousPage',
        description: '上一页'
      },
      {
        key: 'Home',
        actionName: 'firstPage',
        description: '第一页'
      },
      {
        key: 'End',
        actionName: 'lastPage',
        description: '最后一页'
      },
      {
        key: '+',
        ctrl: true,
        actionName: 'zoomIn',
        description: '放大'
      },
      {
        key: '=',
        ctrl: true,
        actionName: 'zoomIn',
        description: '放大'
      },
      {
        key: '-',
        ctrl: true,
        actionName: 'zoomOut',
        description: '缩小'
      },
      {
        key: '0',
        ctrl: true,
        actionName: 'resetZoom',
        description: '重置缩放'
      },
      {
        key: 'f',
        ctrl: true,
        actionName: 'search',
        description: '搜索'
      },
      {
        key: 'p',
        ctrl: true,
        actionName: 'print',
        description: '打印'
      },
      {
        key: 's',
        ctrl: true,
        actionName: 'download',
        description: '下载'
      },
      {
        key: 'F11',
        actionName: 'toggleFullscreen',
        description: '全屏'
      },
      {
        key: 'Escape',
        actionName: 'exitFullscreen',
        description: '退出全屏'
      }
    ];

    // 注册占位action，实际使用时需要被覆盖
    defaults.forEach(({ actionName, ...shortcut }) => {
      this.register({
        ...shortcut as KeyboardShortcut,
        action: () => {
          this.emit(actionName);
        }
      });
    });
  }

  /**
   * 获取所有快捷键
   */
  getAllShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * 获取快捷键帮助信息
   */
  getShortcutHelp(): string {
    const shortcuts = this.getAllShortcuts()
      .filter(s => s.enabled !== false)
      .sort((a, b) => a.description.localeCompare(b.description));

    return shortcuts
      .map(s => {
        const key = this.buildKey(s);
        return `${key.padEnd(20)} - ${s.description}`;
      })
      .join('\n');
  }

  /**
   * 显示快捷键帮助面板
   */
  showHelp(): void {
    const help = this.getShortcutHelp();
    this.emit('show-help', help);
  }

  /**
   * 销毁键盘处理器
   */
  destroy(): void {
    this.container.removeEventListener('keydown', this.handleKeyDown.bind(this));
    this.shortcuts.clear();
    this.removeAllListeners();
  }
}

