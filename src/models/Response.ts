/**
 * Response Model
 *
 * Represents an HTTP response received from an API endpoint.
 * Includes computed properties for UI display.
 *
 * @see specs/001-basic-request-builder/data-model.md
 */

import type { Header, StatusCategory } from '../types/request.types';

interface ResponseOptions {
  statusCode: number;
  statusText: string;
  headers: Header[];
  body: string;
  responseTime: number;
  size: number;
  timestamp: string;
}

export class Response {
  readonly statusCode: number;
  readonly statusText: string;
  readonly headers: Header[];
  readonly body: string;
  readonly responseTime: number;
  readonly size: number;
  readonly contentType: string | null;
  readonly timestamp: string;

  // Computed properties
  readonly statusCategory: StatusCategory;
  readonly formattedSize: string;
  readonly isJson: boolean;
  readonly isXml: boolean;
  readonly isHtml: boolean;

  constructor(options: ResponseOptions) {
    this.statusCode = options.statusCode;
    this.statusText = options.statusText;
    this.headers = options.headers;
    this.body = options.body;
    this.responseTime = options.responseTime;
    this.size = options.size;
    this.timestamp = options.timestamp;

    // Extract content-type from headers
    const contentTypeHeader = this.headers.find(
      (h) => h.name.toLowerCase() === 'content-type'
    );
    this.contentType = contentTypeHeader?.value ?? null;

    // Compute derived properties
    this.statusCategory = this.computeStatusCategory();
    this.formattedSize = this.formatSize();
    this.isJson = this.checkIsJson();
    this.isXml = this.checkIsXml();
    this.isHtml = this.checkIsHtml();
  }

  /**
   * Determine status category based on status code
   */
  private computeStatusCategory(): StatusCategory {
    if (this.statusCode >= 200 && this.statusCode < 300) {
      return 'success';
    }
    if (this.statusCode >= 300 && this.statusCode < 400) {
      return 'redirect';
    }
    if (this.statusCode >= 400) {
      return 'error';
    }
    return 'info'; // 1xx
  }

  /**
   * Format size for human-readable display
   */
  private formatSize(): string {
    const KB = 1024;
    const MB = KB * 1024;

    if (this.size >= MB) {
      return `${(this.size / MB).toFixed(2)} MB`;
    }
    if (this.size >= KB) {
      return `${(this.size / KB).toFixed(2)} KB`;
    }
    return `${this.size} bytes`;
  }

  /**
   * Check if response is JSON based on content-type
   */
  private checkIsJson(): boolean {
    if (!this.contentType) {
      return false;
    }
    return this.contentType.toLowerCase().includes('application/json');
  }

  /**
   * Check if response is XML based on content-type
   */
  private checkIsXml(): boolean {
    if (!this.contentType) {
      return false;
    }
    const lower = this.contentType.toLowerCase();
    return lower.includes('application/xml') || lower.includes('text/xml');
  }

  /**
   * Check if response is HTML based on content-type
   */
  private checkIsHtml(): boolean {
    if (!this.contentType) {
      return false;
    }
    return this.contentType.toLowerCase().includes('text/html');
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      statusCode: this.statusCode,
      statusText: this.statusText,
      headers: this.headers,
      body: this.body,
      responseTime: this.responseTime,
      size: this.size,
      contentType: this.contentType,
      timestamp: this.timestamp,
      statusCategory: this.statusCategory,
      formattedSize: this.formattedSize,
      isJson: this.isJson,
      isXml: this.isXml,
      isHtml: this.isHtml,
    };
  }
}
