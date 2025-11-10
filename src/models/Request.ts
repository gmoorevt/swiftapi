/**
 * Request Model
 *
 * Represents an HTTP request to be sent to an API endpoint.
 * Validates URL and provides helper methods.
 *
 * @see specs/001-basic-request-builder/data-model.md
 */

import { HttpMethod, BodyType, type Header } from '../types/request.types';
import { validateUrl } from '../lib/validation';

interface RequestOptions {
  url: string;
  method?: HttpMethod;
  headers?: Header[];
  body?: string;
  bodyType?: BodyType;
  timeout?: number;
}

export class Request {
  readonly url: string;
  readonly method: HttpMethod;
  readonly headers: Header[];
  readonly body: string;
  readonly bodyType: BodyType;
  readonly timeout: number;

  constructor(options: RequestOptions) {
    // Validate and normalize URL
    const urlValidation = validateUrl(options.url);
    if (!urlValidation.valid) {
      throw new Error(urlValidation.error);
    }
    this.url = urlValidation.url ?? options.url;

    // Set defaults
    this.method = options.method ?? HttpMethod.GET;
    this.headers = options.headers ?? [];
    this.body = options.body ?? '';
    this.bodyType = options.bodyType ?? BodyType.JSON;
    this.timeout = options.timeout ?? 30000; // 30 seconds default
  }

  /**
   * Get only enabled headers (those that should be sent with request)
   *
   * @returns Array of enabled headers
   */
  getEnabledHeaders(): Header[] {
    return this.headers.filter((header) => header.enabled);
  }

  /**
   * Check if this request method supports a body
   *
   * @returns true if method is POST, PUT, or DELETE
   */
  hasBody(): boolean {
    return (
      this.method === HttpMethod.POST ||
      this.method === HttpMethod.PUT ||
      this.method === HttpMethod.DELETE
    );
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON() {
    return {
      url: this.url,
      method: this.method,
      headers: this.headers,
      body: this.body,
      bodyType: this.bodyType,
      timeout: this.timeout,
    };
  }
}
