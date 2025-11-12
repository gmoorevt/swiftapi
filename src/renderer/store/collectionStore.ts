/**
 * Collection Store
 *
 * Zustand store for managing collections and saved requests
 */

import { create } from 'zustand';
import { Collection } from '../../models/Collection';
import { SavedRequest } from '../../models/SavedRequest';
import { Request } from '../../models/Request';
import { CollectionService } from '../services/collectionService';

interface CollectionState {
  // State
  collections: Record<string, Collection>;
  savedRequests: Record<string, SavedRequest>;
  isLoaded: boolean;

  // Actions
  actions: {
    // Initialize store (load from service)
    loadCollections: () => void;

    // Collection management
    createCollection: (name: string) => string;
    renameCollection: (id: string, newName: string) => void;
    deleteCollection: (id: string) => void;
    reorderCollections: (orderedIds: string[]) => void;

    // Request management
    saveRequest: (name: string, collectionId: string, request: Request, rawUrl: string) => string;
    loadRequest: (requestId: string) => SavedRequest | undefined;
    updateRequest: (requestId: string, changes: { name?: string; url?: string }) => void;
    deleteRequest: (requestId: string) => void;
    reorderRequests: (collectionId: string, orderedIds: string[]) => void;

    // Selectors
    getCollections: () => Collection[];
    getRequestsInCollection: (collectionId: string) => SavedRequest[];
    getRequestById: (id: string) => SavedRequest | undefined;
  };
}

// Create service instance (singleton)
const collectionService = new CollectionService();

export const useCollectionStore = create<CollectionState>((set, get) => ({
  // Initial state
  collections: {},
  savedRequests: {},
  isLoaded: false,

  actions: {
    /**
     * Load collections and requests from service
     */
    loadCollections: () => {
      const collections = collectionService.getAllCollections();
      const collectionsMap: Record<string, Collection> = {};
      const requestsMap: Record<string, SavedRequest> = {};

      // Build collections map
      collections.forEach((collection) => {
        collectionsMap[collection.id] = collection;

        // Load requests for each collection
        const requests = collectionService.getRequestsInCollection(collection.id);
        requests.forEach((request) => {
          requestsMap[request.id] = request;
        });
      });

      set({
        collections: collectionsMap,
        savedRequests: requestsMap,
        isLoaded: true,
      });
    },

    /**
     * Create a new collection
     * Returns the created collection ID
     */
    createCollection: (name: string): string => {
      const collection = collectionService.createCollection(name);

      set((state) => ({
        collections: {
          ...state.collections,
          [collection.id]: collection,
        },
      }));

      return collection.id;
    },

    /**
     * Rename a collection
     */
    renameCollection: (id: string, newName: string): void => {
      const updated = collectionService.updateCollection(id, { name: newName });
      if (!updated) {
        return;
      }

      set((state) => ({
        collections: {
          ...state.collections,
          [id]: updated,
        },
      }));
    },

    /**
     * Delete a collection and all its requests (cascade)
     */
    deleteCollection: (id: string): void => {
      // Delete from service (cascade deletes requests)
      collectionService.deleteCollection(id);

      set((state) => {
        const newCollections = { ...state.collections };
        delete newCollections[id];

        // Remove all requests in this collection
        const newRequests = { ...state.savedRequests };
        Object.keys(newRequests).forEach((requestId) => {
          if (newRequests[requestId]?.collectionId === id) {
            delete newRequests[requestId];
          }
        });

        return {
          collections: newCollections,
          savedRequests: newRequests,
        };
      });
    },

    /**
     * Reorder collections
     */
    reorderCollections: (orderedIds: string[]): void => {
      collectionService.reorderCollections(orderedIds);

      // Reload collections with updated order
      const collections = collectionService.getAllCollections();
      const collectionsMap: Record<string, Collection> = {};
      collections.forEach((collection) => {
        collectionsMap[collection.id] = collection;
      });

      set({ collections: collectionsMap });
    },

    /**
     * Save current request to a collection
     * Returns the saved request ID
     */
    saveRequest: (name: string, collectionId: string, request: Request, rawUrl: string): string => {
      const savedRequest = SavedRequest.fromRequest(request, collectionId, name, rawUrl);
      const added = collectionService.addRequest(savedRequest);

      set((state) => ({
        savedRequests: {
          ...state.savedRequests,
          [added.id]: added,
        },
      }));

      return added.id;
    },

    /**
     * Load a saved request (returns the SavedRequest object)
     */
    loadRequest: (requestId: string): SavedRequest | undefined => {
      return get().savedRequests[requestId];
    },

    /**
     * Update a saved request
     */
    updateRequest: (requestId: string, changes: { name?: string; url?: string }): void => {
      const updated = collectionService.updateRequest(requestId, changes);
      if (!updated) {
        return;
      }

      set((state) => ({
        savedRequests: {
          ...state.savedRequests,
          [requestId]: updated,
        },
      }));
    },

    /**
     * Delete a saved request
     */
    deleteRequest: (requestId: string): void => {
      collectionService.deleteRequest(requestId);

      set((state) => {
        const newRequests = { ...state.savedRequests };
        delete newRequests[requestId];
        return { savedRequests: newRequests };
      });
    },

    /**
     * Reorder requests within a collection
     */
    reorderRequests: (collectionId: string, orderedIds: string[]): void => {
      collectionService.reorderRequests(collectionId, orderedIds);

      // Reload requests with updated order
      const requests = collectionService.getRequestsInCollection(collectionId);
      const requestsMap: Record<string, SavedRequest> = { ...get().savedRequests };
      requests.forEach((request) => {
        requestsMap[request.id] = request;
      });

      set({ savedRequests: requestsMap });
    },

    /**
     * Get all collections sorted by order
     */
    getCollections: (): Collection[] => {
      return Object.values(get().collections).sort((a, b) => a.order - b.order);
    },

    /**
     * Get all requests in a collection sorted by order
     */
    getRequestsInCollection: (collectionId: string): SavedRequest[] => {
      return Object.values(get().savedRequests)
        .filter((req) => req.collectionId === collectionId)
        .sort((a, b) => a.order - b.order);
    },

    /**
     * Get request by ID
     */
    getRequestById: (id: string): SavedRequest | undefined => {
      return get().savedRequests[id];
    },
  },
}));
