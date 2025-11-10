/**
 * HTTP Service
 *
 * Handles sending HTTP requests using axios with cancel token support.
 * Measures response time and parses errors.
 *
 * @see specs/001-basic-request-builder/research.md
 */

import axios, { type CancelTokenSource, type AxiosError } from 'axios';
import type { Request } from '../../models/Request';
import { Response } from '../../models/Response';
import type { HttpResult, HttpError, Header } from '../../types/request.types';
import { BodyType } from '../../types/request.types';

export class HttpService {
  private cancelTokenSource: CancelTokenSource | null = null;

  /**
   * Send an HTTP request
   *
   * @param request - The request to send
   * @returns Promise resolving to response or error
   */
  async sendRequest(request: Request): Promise<HttpResult> {
    // Create cancel token for this request
    this.cancelTokenSource = axios.CancelToken.source();
    const startTime = Date.now();

    try {
      const response = await axios({
        url: request.url,
        method: request.method,
        headers: this.buildHeaders(request),
        data: request.hasBody() ? this.buildBody(request) : undefined,
        timeout: request.timeout,
        cancelToken: this.cancelTokenSource.token,
        validateStatus: () => true, // Accept all status codes
      });

      const responseTime = Date.now() - startTime;

      // Convert axios response to our Response model
      const headers: Header[] = Object.entries(response.headers).map(
        ([name, value]) => ({
          name,
          value: String(value),
          enabled: true,
        })
      );

      const body = this.serializeResponseBody(response.data);
      const size = body.length;

      const responseModel = new Response({
        statusCode: response.status,
        statusText: response.statusText,
        headers,
        body,
        responseTime,
        size,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        response: responseModel,
      };
    } catch (error) {
      return {
        success: false,
        error: this.parseError(error),
      };
    } finally {
      this.cancelTokenSource = null;
    }
  }

  /**
   * Cancel the current in-flight request
   */
  cancelRequest(): void {
    if (this.cancelTokenSource) {
      this.cancelTokenSource.cancel('Request cancelled by user');
    }
  }

  /**
   * Check if a request is currently in progress
   */
  isRequestInProgress(): boolean {
    return this.cancelTokenSource !== null;
  }

  /**
   * Build headers object from request
   */
  private buildHeaders(request: Request): Record<string, string> {
    const headers: Record<string, string> = {};

    // Add enabled custom headers
    request.getEnabledHeaders().forEach((header) => {
      headers[header.name] = header.value;
    });

    // Add Content-Type based on body type (if not already set)
    if (request.hasBody() && !this.hasContentType(headers)) {
      headers['Content-Type'] = this.getContentTypeForBodyType(
        request.bodyType
      );
    }

    return headers;
  }

  /**
   * Check if headers already contain Content-Type
   */
  private hasContentType(headers: Record<string, string>): boolean {
    return Object.keys(headers).some(
      (key) => key.toLowerCase() === 'content-type'
    );
  }

  /**
   * Get Content-Type header value based on body type
   */
  private getContentTypeForBodyType(bodyType: BodyType): string {
    switch (bodyType) {
      case BodyType.JSON:
        return 'application/json';
      case BodyType.FORM_DATA:
        return 'application/x-www-form-urlencoded';
      case BodyType.RAW:
        return 'text/plain';
      default:
        return 'application/json';
    }
  }

  /**
   * Build request body
   */
  private buildBody(request: Request): string {
    // For now, just return the body as-is
    // Future: Handle form-data encoding
    return request.body;
  }

  /**
   * Serialize response body to string
   */
  private serializeResponseBody(data: unknown): string {
    if (typeof data === 'string') {
      return data;
    }
    return JSON.stringify(data);
  }

  /**
   * Parse axios error into our HttpError format
   */
  private parseError(error: unknown): HttpError {
    if (axios.isCancel(error)) {
      return {
        message: 'Request was cancelled',
        code: 'ERR_CANCELED',
        isNetworkError: false,
        isTimeout: false,
        isCancelled: true,
      };
    }

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Check for timeout
      if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
        return {
          message: 'Request timed out',
          code: axiosError.code,
          isNetworkError: false,
          isTimeout: true,
          isCancelled: false,
        };
      }

      // Check for network error
      if (!axiosError.response) {
        return {
          message: axiosError.message || 'Network error occurred',
          ...(axiosError.code ? { code: axiosError.code } : {}),
          isNetworkError: true,
          isTimeout: false,
          isCancelled: false,
        };
      }

      // HTTP error with response
      return {
        message: axiosError.message,
        ...(axiosError.code ? { code: axiosError.code } : {}),
        statusCode: axiosError.response.status,
        isNetworkError: false,
        isTimeout: false,
        isCancelled: false,
      };
    }

    // Unknown error
    return {
      message: error instanceof Error ? error.message : 'Unknown error',
      isNetworkError: false,
      isTimeout: false,
      isCancelled: false,
    };
  }
}
