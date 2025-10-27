/**
 * 表单管理器 - PDF表单识别和填写
 * Form Manager for PDF forms
 */

import type { PDFDocumentProxy, PDFPageProxy } from '../types';
import { Logger } from '../core/Logger';
import { EventEmitter } from '../core/EventEmitter';

export type FormFieldType = 'text' | 'checkbox' | 'radio' | 'select' | 'button' | 'signature';

export interface FormField {
  id: string;
  name: string;
  type: FormFieldType;
  pageNumber: number;
  rect: { x: number; y: number; width: number; height: number };
  value?: any;
  defaultValue?: any;
  required?: boolean;
  readonly?: boolean;
  options?: string[]; // For select and radio
  validation?: FormValidation;
}

export interface FormValidation {
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  required?: boolean;
  custom?: (value: any) => boolean | string;
}

export interface FormData {
  [fieldName: string]: any;
}

export class FormManager extends EventEmitter {
  private document: PDFDocumentProxy;
  private fields: Map<string, FormField> = new Map();
  private logger: Logger;
  private formData: FormData = {};

  constructor(document: PDFDocumentProxy) {
    super();
    this.document = document;
    this.logger = new Logger('FormManager');
  }

  /**
   * 检测PDF中的表单字段
   */
  async detectFields(): Promise<FormField[]> {
    this.fields.clear();
    const allFields: FormField[] = [];

    try {
      for (let i = 1; i <= this.document.numPages; i++) {
        const page = await this.document.getPage(i);
        const pageFields = await this.detectPageFields(page, i);
        pageFields.forEach(field => {
          this.fields.set(field.id, field);
          allFields.push(field);
        });
      }

      this.logger.info(`Detected ${allFields.length} form fields`);
      this.emit('fields-detected', allFields);

      return allFields;
    } catch (error) {
      this.logger.error('Failed to detect form fields', error);
      throw error;
    }
  }

  /**
   * 检测单页的表单字段
   */
  private async detectPageFields(page: PDFPageProxy, pageNumber: number): Promise<FormField[]> {
    const fields: FormField[] = [];

    try {
      const annotations = await page.getAnnotations();

      for (let i = 0; i < annotations.length; i++) {
        const annotation = annotations[i];

        // 检查是否是表单字段
        if (this.isFormField(annotation)) {
          const field = this.parseFormField(annotation, pageNumber, i);
          if (field) {
            fields.push(field);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Failed to detect fields on page ${pageNumber}`, error);
    }

    return fields;
  }

  /**
   * 判断注释是否为表单字段
   */
  private isFormField(annotation: any): boolean {
    const formTypes = ['Tx', 'Btn', 'Ch'];
    return annotation.fieldType && formTypes.includes(annotation.fieldType);
  }

  /**
   * 解析表单字段
   */
  private parseFormField(annotation: any, pageNumber: number, index: number): FormField | null {
    try {
      const fieldType = this.mapFieldType(annotation.fieldType, annotation.checkBox, annotation.radioButton);

      const field: FormField = {
        id: annotation.id || `field-${pageNumber}-${index}`,
        name: annotation.fieldName || `field-${index}`,
        type: fieldType,
        pageNumber,
        rect: {
          x: annotation.rect[0],
          y: annotation.rect[1],
          width: annotation.rect[2] - annotation.rect[0],
          height: annotation.rect[3] - annotation.rect[1]
        },
        value: annotation.fieldValue,
        defaultValue: annotation.defaultFieldValue,
        required: annotation.required || false,
        readonly: annotation.readOnly || false,
        options: annotation.options || undefined
      };

      return field;
    } catch (error) {
      this.logger.warn('Failed to parse form field', error);
      return null;
    }
  }

  /**
   * 映射字段类型
   */
  private mapFieldType(fieldType: string, isCheckBox?: boolean, isRadio?: boolean): FormFieldType {
    if (fieldType === 'Tx') return 'text';
    if (fieldType === 'Btn') {
      if (isCheckBox) return 'checkbox';
      if (isRadio) return 'radio';
      return 'button';
    }
    if (fieldType === 'Ch') return 'select';
    return 'text';
  }

  /**
   * 填写字段
   */
  fillField(fieldId: string, value: any): boolean {
    const field = this.fields.get(fieldId);

    if (!field) {
      this.logger.warn(`Field not found: ${fieldId}`);
      return false;
    }

    if (field.readonly) {
      this.logger.warn(`Field is readonly: ${fieldId}`);
      return false;
    }

    // 验证
    const validation = this.validateField(field, value);
    if (validation !== true) {
      this.logger.warn(`Validation failed for ${fieldId}: ${validation}`);
      this.emit('validation-error', { field, error: validation });
      return false;
    }

    // 更新值
    field.value = value;
    this.formData[field.name] = value;

    this.emit('field-changed', { field, value });
    this.logger.debug(`Field ${fieldId} set to:`, value);

    return true;
  }

  /**
   * 批量填写表单
   */
  fillForm(data: FormData): Map<string, boolean> {
    const results = new Map<string, boolean>();

    for (const [fieldName, value] of Object.entries(data)) {
      const field = Array.from(this.fields.values()).find(f => f.name === fieldName);

      if (field) {
        const success = this.fillField(field.id, value);
        results.set(fieldName, success);
      } else {
        this.logger.warn(`Field not found by name: ${fieldName}`);
        results.set(fieldName, false);
      }
    }

    return results;
  }

  /**
   * 验证字段
   */
  validateField(field: FormField, value: any): true | string {
    if (!field.validation) {
      return true;
    }

    const v = field.validation;

    // Required check
    if (v.required && (value === undefined || value === null || value === '')) {
      return 'This field is required';
    }

    // Type-specific validation
    if (field.type === 'text' && typeof value === 'string') {
      if (v.minLength && value.length < v.minLength) {
        return `Minimum length is ${v.minLength}`;
      }
      if (v.maxLength && value.length > v.maxLength) {
        return `Maximum length is ${v.maxLength}`;
      }
      if (v.pattern && !v.pattern.test(value)) {
        return 'Invalid format';
      }
    }

    // Numeric validation
    if (typeof value === 'number') {
      if (v.min !== undefined && value < v.min) {
        return `Minimum value is ${v.min}`;
      }
      if (v.max !== undefined && value > v.max) {
        return `Maximum value is ${v.max}`;
      }
    }

    // Custom validation
    if (v.custom) {
      const result = v.custom(value);
      if (result !== true) {
        return typeof result === 'string' ? result : 'Validation failed';
      }
    }

    return true;
  }

  /**
   * 验证整个表单
   */
  validateForm(): Map<string, string> {
    const errors = new Map<string, string>();

    for (const field of this.fields.values()) {
      const validation = this.validateField(field, field.value);
      if (validation !== true) {
        errors.set(field.id, validation);
      }
    }

    if (errors.size > 0) {
      this.emit('form-validation-error', errors);
    }

    return errors;
  }

  /**
   * 获取字段值
   */
  getFieldValue(fieldId: string): any {
    const field = this.fields.get(fieldId);
    return field?.value;
  }

  /**
   * 获取所有字段
   */
  getAllFields(): FormField[] {
    return Array.from(this.fields.values());
  }

  /**
   * 根据类型获取字段
   */
  getFieldsByType(type: FormFieldType): FormField[] {
    return Array.from(this.fields.values()).filter(f => f.type === type);
  }

  /**
   * 根据页码获取字段
   */
  getFieldsByPage(pageNumber: number): FormField[] {
    return Array.from(this.fields.values()).filter(f => f.pageNumber === pageNumber);
  }

  /**
   * 导出表单数据
   */
  exportFormData(): FormData {
    return { ...this.formData };
  }

  /**
   * 导入表单数据
   */
  importFormData(data: FormData): Map<string, boolean> {
    return this.fillForm(data);
  }

  /**
   * 重置表单
   */
  reset(): void {
    for (const field of this.fields.values()) {
      field.value = field.defaultValue;
    }
    this.formData = {};
    this.emit('form-reset');
    this.logger.info('Form reset');
  }

  /**
   * 清空表单
   */
  clear(): void {
    for (const field of this.fields.values()) {
      field.value = undefined;
    }
    this.formData = {};
    this.emit('form-cleared');
    this.logger.info('Form cleared');
  }

  /**
   * 检查表单是否已填写
   */
  isFormFilled(): boolean {
    return this.fields.size > 0 && Object.keys(this.formData).length > 0;
  }

  /**
   * 检查表单是否有效
   */
  isFormValid(): boolean {
    return this.validateForm().size === 0;
  }

  /**
   * 获取表单完成百分比
   */
  getCompletionPercentage(): number {
    if (this.fields.size === 0) return 0;

    const filledFields = Array.from(this.fields.values())
      .filter(f => f.value !== undefined && f.value !== null && f.value !== '').length;

    return Math.round((filledFields / this.fields.size) * 100);
  }

  /**
   * 导出为JSON
   */
  toJSON(): string {
    const data = {
      fields: Array.from(this.fields.values()),
      formData: this.formData,
      metadata: {
        totalFields: this.fields.size,
        filledFields: Object.keys(this.formData).length,
        completionPercentage: this.getCompletionPercentage(),
        isValid: this.isFormValid()
      }
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * 销毁表单管理器
   */
  destroy(): void {
    this.fields.clear();
    this.formData = {};
    this.removeAllListeners();
  }
}

