/**
 * CollectionService
 *
 * Service for managing collections and saved requests
 * Uses electron-store for local persistence
 *
 * Constitutional requirement: Local-First Architecture
 */

import { Collection, CollectionData, CollectionUpdateOptions } from '../../models/Collection';
import { SavedRequest, SavedRequestData, SavedRequestUpdateOptions } from '../../models/SavedRequest';
import { createStorageAdapter } from './storageAdapter';

export class CollectionService {
  private store: ReturnType<typeof createStorageAdapter>;

  constructor() {
    this.store = createStorageAdapter('swiftapi-collections');
  }

  /**
   * Create a new collection
   * Throws error if collection with same name already exists (case-insensitive)
   */
  createCollection(name: string): Collection {
    // Check for duplicate name (case-insensitive)
    const existing = this.getAllCollections();
    const duplicate = existing.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      throw new Error(`Collection with name "${name}" already exists`);
    }

    // Auto-assign order based on existing collections
    const maxOrder = existing.length > 0 ? Math.max(...existing.map((c) => c.order)) : -1;
    const collection = Collection.create(name, maxOrder + 1);

    // Save to storage
    const collections = this.store.get<Record<string, CollectionData>>('collections', {});
    collections[collection.id] = collection.toJSON();
    this.store.set('collections', collections);

    return collection;
  }

  /**
   * Get all collections sorted by order
   */
  getAllCollections(): Collection[] {
    const collections = this.store.get<Record<string, CollectionData>>('collections', {});
    return Object.values(collections)
      .map((data) => Collection.fromJSON(data))
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Get collection by ID
   */
  getCollectionById(id: string): Collection | undefined {
    const collections = this.store.get<Record<string, CollectionData>>('collections', {});
    const data = collections[id];
    return data ? Collection.fromJSON(data) : undefined;
  }

  /**
   * Update collection
   * Throws error if updating to duplicate name (case-insensitive)
   */
  updateCollection(id: string, changes: CollectionUpdateOptions): Collection | undefined {
    const collections = this.store.get<Record<string, CollectionData>>('collections', {});
    const data = collections[id];
    if (!data) {
      return undefined;
    }

    const collection = Collection.fromJSON(data);

    // Check for duplicate name if name is being changed
    if (changes.name && changes.name.toLowerCase() !== collection.name.toLowerCase()) {
      const existing = this.getAllCollections();
      const duplicate = existing.find((c) => c.name.toLowerCase() === changes.name!.toLowerCase());
      if (duplicate) {
        throw new Error(`Collection with name "${changes.name}" already exists`);
      }
    }

    const updated = collection.update(changes);

    collections[id] = updated.toJSON();
    this.store.set('collections', collections);

    return updated;
  }

  /**
   * Delete collection and all its requests (cascade)
   */
  deleteCollection(id: string): void {
    // Delete all requests in this collection
    const requests = this.getRequestsInCollection(id);
    requests.forEach((req) => this.deleteRequest(req.id));

    // Delete collection
    const collections = this.store.get<Record<string, CollectionData>>('collections', {});
    delete collections[id];
    this.store.set('collections', collections);
  }

  /**
   * Add request to storage
   * Auto-assigns order based on existing requests in collection
   */
  addRequest(savedRequest: SavedRequest): SavedRequest {
    // Auto-assign order if not set
    const existing = this.getRequestsInCollection(savedRequest.collectionId);
    const maxOrder = existing.length > 0 ? Math.max(...existing.map((r) => r.order)) : -1;
    const requestWithOrder = savedRequest.order === 0 && existing.length > 0
      ? savedRequest.update({ order: maxOrder + 1 })
      : savedRequest;

    // Save to storage
    const requests = this.store.get<Record<string, SavedRequestData>>('requests', {});
    requests[requestWithOrder.id] = requestWithOrder.toJSON();
    this.store.set('requests', requests);

    return requestWithOrder;
  }

  /**
   * Get all requests in a collection sorted by order
   */
  getRequestsInCollection(collectionId: string): SavedRequest[] {
    const requests = this.store.get<Record<string, SavedRequestData>>('requests', {});
    return Object.values(requests)
      .filter((data) => data.collectionId === collectionId)
      .map((data) => SavedRequest.fromJSON(data))
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Get request by ID
   */
  getRequestById(id: string): SavedRequest | undefined {
    const requests = this.store.get<Record<string, SavedRequestData>>('requests', {});
    const data = requests[id];
    return data ? SavedRequest.fromJSON(data) : undefined;
  }

  /**
   * Update request
   */
  updateRequest(id: string, changes: SavedRequestUpdateOptions): SavedRequest | undefined {
    const requests = this.store.get<Record<string, SavedRequestData>>('requests', {});
    const data = requests[id];
    if (!data) {
      return undefined;
    }

    const request = SavedRequest.fromJSON(data);
    const updated = request.update(changes);

    requests[id] = updated.toJSON();
    this.store.set('requests', requests);

    return updated;
  }

  /**
   * Delete request
   */
  deleteRequest(id: string): void {
    const requests = this.store.get<Record<string, SavedRequestData>>('requests', {});
    delete requests[id];
    this.store.set('requests', requests);
  }

  /**
   * Reorder collections
   * Updates order field for each collection based on array position
   */
  reorderCollections(orderedIds: string[]): void {
    const collections = this.store.get<Record<string, CollectionData>>('collections', {});

    orderedIds.forEach((id, index) => {
      const data = collections[id];
      if (data) {
        const collection = Collection.fromJSON(data);
        const updated = collection.update({ order: index });
        collections[id] = updated.toJSON();
      }
    });

    this.store.set('collections', collections);
  }

  /**
   * Reorder requests within a collection
   * Updates order field for each request based on array position
   */
  reorderRequests(collectionId: string, orderedIds: string[]): void {
    const requests = this.store.get<Record<string, SavedRequestData>>('requests', {});

    orderedIds.forEach((id, index) => {
      const data = requests[id];
      if (data && data.collectionId === collectionId) {
        const request = SavedRequest.fromJSON(data);
        const updated = request.update({ order: index });
        requests[id] = updated.toJSON();
      }
    });

    this.store.set('requests', requests);
  }

  /**
   * Clear all collections and requests (for testing)
   */
  clear(): void {
    this.store.set<Record<string, CollectionData>>('collections', {});
    this.store.set<Record<string, SavedRequestData>>('requests', {});
  }
}
