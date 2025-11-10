/**
 * StorageService
 *
 * Service for persisting user settings locally using electron-store
 * Only stores non-sensitive data (URL and method)
 *
 * Constitutional requirement: Local-First Architecture (zero cloud dependencies)
 */

import Store from 'electron-store';
import { HttpMethod } from '../../types/request.types';

interface StorageSchema {
  lastUrl: string;
  lastMethod: HttpMethod;
}

export interface StoredSettings {
  lastUrl: string | null;
  lastMethod: HttpMethod;
}

export class StorageService {
  private store: Store<StorageSchema>;

  constructor() {
    this.store = new Store<StorageSchema>({
      name: 'swiftapi-settings',
      // Don't store sensitive data - only URL and method
    });
  }

  /**
   * Save the last used URL
   *
   * @param url - URL to persist
   */
  saveLastUrl(url: string): void {
    this.store.set('lastUrl', url);
  }

  /**
   * Get the last used URL
   *
   * @returns Last URL or null if not set
   */
  getLastUrl(): string | null {
    const url = this.store.get('lastUrl');
    return url !== undefined ? url : null;
  }

  /**
   * Save the last used HTTP method
   *
   * @param method - HTTP method to persist
   */
  saveLastMethod(method: HttpMethod): void {
    this.store.set('lastMethod', method);
  }

  /**
   * Get the last used HTTP method
   *
   * @returns Last method or GET as default
   */
  getLastMethod(): HttpMethod {
    const method = this.store.get('lastMethod');

    // Validate that stored method is a valid HttpMethod
    if (
      method &&
      Object.values(HttpMethod).includes(method as HttpMethod)
    ) {
      return method as HttpMethod;
    }

    // Default to GET
    return HttpMethod.GET;
  }

  /**
   * Save both URL and method together
   *
   * @param url - URL to persist
   * @param method - HTTP method to persist
   */
  saveSettings(url: string, method: HttpMethod): void {
    this.saveLastUrl(url);
    this.saveLastMethod(method);
  }

  /**
   * Get all stored settings
   *
   * @returns Stored settings with defaults
   */
  getSettings(): StoredSettings {
    return {
      lastUrl: this.getLastUrl(),
      lastMethod: this.getLastMethod(),
    };
  }

  /**
   * Clear all stored settings
   */
  clearAll(): void {
    this.store.clear();
  }
}
