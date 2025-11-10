/**
 * HistoryService
 *
 * Service for managing request history
 * Stores up to 50 recent requests locally
 *
 * Constitutional requirement: Local-First Architecture
 */

import { HistoryEntry, HistoryEntryData } from '../../models/HistoryEntry';
import { createStorageAdapter } from './storageAdapter';

const MAX_HISTORY_ENTRIES = 50;

interface HistorySchema {
  history: HistoryEntryData[];
}

export class HistoryService {
  private store: ReturnType<typeof createStorageAdapter>;

  constructor() {
    this.store = createStorageAdapter('swiftapi-history');
  }

  /**
   * Add entry to history
   * Maintains max 50 entries (FIFO)
   */
  add(entry: HistoryEntry): void {
    const history = this.store.get('history', []);

    // Add new entry at the end
    history.push(entry.toJSON());

    // Trim to max entries (remove oldest)
    if (history.length > MAX_HISTORY_ENTRIES) {
      history.splice(0, history.length - MAX_HISTORY_ENTRIES);
    }

    this.store.set('history', history);
  }

  /**
   * Get all history entries
   * Returns newest first (reverse chronological)
   */
  getAll(): HistoryEntry[] {
    const history = this.store.get('history', []);
    return history
      .map(data => HistoryEntry.fromJSON(data))
      .reverse(); // Newest first
  }

  /**
   * Get entry by ID
   */
  getById(id: string): HistoryEntry | undefined {
    const history = this.store.get('history', []);
    const data = history.find(entry => entry.id === id);
    return data ? HistoryEntry.fromJSON(data) : undefined;
  }

  /**
   * Remove specific entry by ID
   */
  remove(id: string): void {
    const history = this.store.get('history', []);
    const filtered = history.filter(entry => entry.id !== id);
    this.store.set('history', filtered);
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.store.set('history', []);
  }
}
