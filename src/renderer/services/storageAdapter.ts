/**
 * Storage Adapter
 *
 * Provides a unified interface for storage that works in both
 * Electron (electron-store) and browser (localStorage)
 */

interface StorageAdapter {
  get<T>(key: string, defaultValue: T): T;
  set<T>(key: string, value: T): void;
  clear(): void;
  has(key: string): boolean;
}

/**
 * Create storage adapter based on environment
 */
export function createStorageAdapter(storeName: string): StorageAdapter {
  // Check if we're in Electron environment
  const isElectron = typeof window !== 'undefined' && window.process?.type === 'renderer';

  if (isElectron) {
    // Use electron-store in Electron
    try {
      // Dynamic import to avoid bundling issues
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Store = require('electron-store') as new (options: { name: string }) => {
        get<T>(key: string, defaultValue: T): T;
        set<T>(key: string, value: T): void;
        clear(): void;
        has(key: string): boolean;
      };
      const store = new Store({ name: storeName });

      return {
        get<T>(key: string, defaultValue: T): T {
          return store.get(key, defaultValue);
        },
        set<T>(key: string, value: T): void {
          store.set(key, value);
        },
        clear(): void {
          store.clear();
        },
        has(key: string): boolean {
          return store.has(key);
        },
      };
    } catch (error) {
      console.warn('electron-store not available, falling back to localStorage');
    }
  }

  // Fallback to localStorage for browser/testing
  return {
    get<T>(key: string, defaultValue: T): T {
      try {
        const item = localStorage.getItem(`${storeName}.${key}`);
        return item ? (JSON.parse(item) as T) : defaultValue;
      } catch {
        return defaultValue;
      }
    },
    set<T>(key: string, value: T): void {
      try {
        localStorage.setItem(`${storeName}.${key}`, JSON.stringify(value));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    },
    clear(): void {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.startsWith(`${storeName}.`)) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.error('Failed to clear localStorage:', error);
      }
    },
    has(key: string): boolean {
      return localStorage.getItem(`${storeName}.${key}`) !== null;
    },
  };
}
