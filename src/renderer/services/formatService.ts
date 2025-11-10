/**
 * FormatService
 *
 * Service for formatting response bodies (JSON, XML, HTML)
 * Handles content-type detection and pretty-printing
 */

export type ContentType = 'json' | 'xml' | 'html' | 'text';

export interface FormatResult {
  content: string;
  formatted: boolean;
  contentType: ContentType;
}

export class FormatService {
  /**
   * Pretty-print JSON with 2-space indentation
   *
   * @param jsonString - JSON string to format
   * @returns Formatted JSON or original string if invalid
   */
  formatJson(jsonString: string): string {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // Return original string if invalid JSON
      return jsonString;
    }
  }

  /**
   * Check if a string is valid JSON
   *
   * @param input - String to validate
   * @returns True if valid JSON, false otherwise
   */
  isValidJson(input: string): boolean {
    if (!input.trim()) {
      return false;
    }

    try {
      JSON.parse(input);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Detect content type from response body
   *
   * @param content - Response body content
   * @returns Detected content type
   */
  detectContentType(content: string): ContentType {
    const trimmed = content.trim();

    // Check for JSON
    if (this.isValidJson(trimmed)) {
      return 'json';
    }

    // Check for XML
    if (trimmed.startsWith('<?xml') || trimmed.startsWith('<')) {
      // Simple heuristic: if it starts with XML declaration or tag
      // and doesn't look like HTML, it's probably XML
      if (
        !trimmed.toLowerCase().includes('<!doctype html') &&
        !trimmed.toLowerCase().includes('<html')
      ) {
        return 'xml';
      }
    }

    // Check for HTML
    if (
      trimmed.toLowerCase().includes('<!doctype html') ||
      trimmed.toLowerCase().includes('<html') ||
      trimmed.toLowerCase().includes('<body') ||
      trimmed.toLowerCase().includes('<head')
    ) {
      return 'html';
    }

    // Default to plain text
    return 'text';
  }

  /**
   * Format response body based on content type
   *
   * @param body - Response body content
   * @param contentTypeHeader - Content-Type header value (optional)
   * @returns Formatted content with metadata
   */
  formatResponse(body: string, contentTypeHeader?: string): FormatResult {
    // Auto-detect content type if not provided
    const detectedType = this.detectContentType(body);

    // Determine content type from header or detection
    let contentType: ContentType = detectedType;

    if (contentTypeHeader) {
      const lowerHeader = contentTypeHeader.toLowerCase();
      if (lowerHeader.includes('json')) {
        contentType = 'json';
      } else if (lowerHeader.includes('xml')) {
        contentType = 'xml';
      } else if (lowerHeader.includes('html')) {
        contentType = 'html';
      } else if (lowerHeader.includes('text')) {
        contentType = 'text';
      }
    }

    // Format based on content type
    if (contentType === 'json') {
      const formatted = this.formatJson(body);
      // Check if formatting actually changed the content
      const wasFormatted = formatted !== body;

      return {
        content: formatted,
        formatted: wasFormatted || this.isValidJson(body),
        contentType: 'json',
      };
    }

    // For XML, HTML, and plain text, return as-is
    // (Future enhancement: add XML/HTML formatting)
    return {
      content: body,
      formatted: contentType !== 'text',
      contentType,
    };
  }
}
