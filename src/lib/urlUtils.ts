/**
 * URL Utilities
 *
 * Helper functions for parsing and building URLs with query parameters
 */

import type { QueryParam } from '../types/request.types';

/**
 * Parse query parameters from a URL string
 * @param url - URL string to parse
 * @returns Array of QueryParam objects
 */
export function parseQueryParams(url: string): QueryParam[] {
  try {
    const urlObj = new URL(url);
    const params: QueryParam[] = [];

    urlObj.searchParams.forEach((value, key) => {
      params.push({
        key,
        value,
        description: '',
        enabled: true,
      });
    });

    return params;
  } catch {
    // Invalid URL, return empty array
    return [];
  }
}

/**
 * Build URL with query parameters
 * @param baseUrl - Base URL without query params
 * @param queryParams - Array of query params to append
 * @returns Complete URL with query string
 */
export function buildUrlWithParams(baseUrl: string, queryParams: QueryParam[]): string {
  // Filter to only enabled params
  const enabledParams = queryParams.filter(p => p.enabled && p.key.trim() !== '');

  // If no enabled params, return base URL
  if (enabledParams.length === 0) {
    return baseUrl;
  }

  try {
    // Parse base URL and clear any existing params
    const urlObj = new URL(baseUrl);
    urlObj.search = '';

    // Add each enabled param
    enabledParams.forEach(param => {
      urlObj.searchParams.append(param.key, param.value);
    });

    return urlObj.toString();
  } catch {
    // If base URL is invalid, try to build query string manually
    const baseWithoutParams = baseUrl.split('?')[0];
    const queryString = enabledParams
      .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&');

    return queryString ? `${baseWithoutParams}?${queryString}` : baseWithoutParams;
  }
}

/**
 * Get base URL without query parameters
 * @param url - Full URL string
 * @returns Base URL without query string
 */
export function getBaseUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    urlObj.search = '';
    return urlObj.toString();
  } catch {
    // If invalid URL, just split on '?'
    return url.split('?')[0];
  }
}
