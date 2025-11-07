/**
 * Request Store
 *
 * Zustand store for managing request builder state
 *
 * @see specs/001-basic-request-builder/contracts/store.ts
 */

import { create } from 'zustand';
import { HttpMethod, BodyType } from '../../types/request.types';
import type { Header } from '../../types/request.types';
import type { Response } from '../../models/Response';
import { Request } from '../../models/Request';
import { HttpService } from '../services/httpService';

interface RequestState {
  // Current request state
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
  actions: {
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
  };
}

// Create HTTP service instance (singleton)
const httpService = new HttpService();

/**
 * Request Store
 *
 * Central state management for the request builder
 */
export const useRequestStore = create<RequestState>((set, get) => ({
  // Initial state
  url: '',
  method: HttpMethod.GET,
  headers: [],
  body: '',
  bodyType: BodyType.JSON,
  timeout: 30000,
  response: null,
  error: null,
  isLoading: false,

  // Actions
  actions: {
    // Request setters
    setUrl: (url: string) => set({ url }),

    setMethod: (method: HttpMethod) => set({ method }),

    setBody: (body: string) => set({ body }),

    setBodyType: (bodyType: BodyType) => set({ bodyType }),

    setTimeout: (timeout: number) => set({ timeout }),

    // Header management
    addHeader: () => {
      const currentHeaders = get().headers;
      set({
        headers: [
          ...currentHeaders,
          { name: '', value: '', enabled: true },
        ],
      });
    },

    updateHeader: (index: number, field: keyof Header, value: string | boolean) => {
      const currentHeaders = get().headers;
      const updatedHeaders = currentHeaders.map((header, i) => {
        if (i === index) {
          return { ...header, [field]: value };
        }
        return header;
      });
      set({ headers: updatedHeaders });
    },

    removeHeader: (index: number) => {
      const currentHeaders = get().headers;
      set({
        headers: currentHeaders.filter((_, i) => i !== index),
      });
    },

    toggleHeader: (index: number) => {
      const currentHeaders = get().headers;
      const updatedHeaders = currentHeaders.map((header, i) => {
        if (i === index) {
          return { ...header, enabled: !header.enabled };
        }
        return header;
      });
      set({ headers: updatedHeaders });
    },

    // Request execution
    sendRequest: async () => {
      const state = get();

      // Clear previous response/error
      set({ response: null, error: null, isLoading: true });

      try {
        // Build request from current state
        const request = new Request({
          url: state.url,
          method: state.method,
          headers: state.headers,
          body: state.body,
          bodyType: state.bodyType,
          timeout: state.timeout,
        });

        // Send request via HTTP service
        const result = await httpService.sendRequest(request);

        if (result.success) {
          set({ response: result.response, error: null, isLoading: false });
        } else {
          set({
            response: null,
            error: result.error.message,
            isLoading: false
          });
        }
      } catch (error) {
        // Handle unexpected errors
        const errorMessage = error instanceof Error
          ? error.message
          : 'An unexpected error occurred';
        set({ response: null, error: errorMessage, isLoading: false });
      }
    },

    cancelRequest: () => {
      httpService.cancelRequest();
      set({ isLoading: false });
    },

    // Response handling
    setResponse: (response: Response | null) => set({ response }),

    setError: (error: string | null) => set({ error }),

    clearResponse: () => set({ response: null, error: null }),

    // State management
    setLoading: (isLoading: boolean) => set({ isLoading }),

    resetRequest: () => set({
      url: '',
      method: HttpMethod.GET,
      headers: [],
      body: '',
      bodyType: BodyType.JSON,
      timeout: 30000,
      response: null,
      error: null,
      isLoading: false,
    }),
  },
}));
