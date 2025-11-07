/**
 * Store Interface for Basic HTTP Request Builder
 *
 * This file defines the Zustand store contract for managing application state.
 *
 * @see research.md for state management decision (Zustand)
 */

import type { Request, Response, HttpMethod, BodyType, Header } from './types';

/**
 * Actions available in the request store
 */
export interface RequestActions {
  // Request setters
  setUrl: (url: string) => void;
  setMethod: (method: HttpMethod) => void;
  setBody: (body: string) => void;
  setBodyType: (bodyType: BodyType) => void;
  setTimeout: (timeout: number) => void;

  // Header management
  addHeader: () => void;
  updateHeader: (index: number, field: keyof Header, value: string | boolean) => void;
  removeHeader: (index: number) => void;
  toggleHeader: (index: number) => void;

  // Request execution
  sendRequest: () => Promise<void>;
  cancelRequest: () => void;

  // Response handling
  setResponse: (response: Response | null) => void;
  setError: (error: string | null) => void;
  clearResponse: () => void;

  // State management
  setLoading: (isLoading: boolean) => void;
  resetRequest: () => void;
}

/**
 * Complete request store interface
 *
 * Combines state and actions for the request builder
 */
export interface RequestStore {
  // Current state
  url: string;
  method: HttpMethod;
  headers: Header[];
  body: string;
  bodyType: BodyType;
  timeout: number;

  // Response state
  response: Response | null;
  error: string | null;
  isLoading: boolean;

  // Actions
  actions: RequestActions;
}

/**
 * Store selector helpers for optimized re-renders
 */
export interface RequestSelectors {
  selectUrl: (state: RequestStore) => string;
  selectMethod: (state: RequestStore) => HttpMethod;
  selectHeaders: (state: RequestStore) => Header[];
  selectBody: (state: RequestStore) => string;
  selectResponse: (state: RequestStore) => Response | null;
  selectIsLoading: (state: RequestStore) => boolean;
  selectError: (state: RequestStore) => string | null;
}
