/**
 * Request Store
 *
 * Zustand store for managing request builder state
 *
 * @see specs/001-basic-request-builder/contracts/store.ts
 */

import { create } from 'zustand';
import { HttpMethod, BodyType } from '../../types/request.types';
import type { Header, QueryParam } from '../../types/request.types';
import type { Response } from '../../models/Response';
import { Request } from '../../models/Request';
import { HttpService } from '../services/httpService';
import { HistoryService } from '../services/historyService';
import { HistoryEntry } from '../../models/HistoryEntry';
import { Auth } from '../../models/Auth';
import type { Auth as AuthConfig } from '../../types/auth.types';
import { parseQueryParams, buildUrlWithParams, getBaseUrl } from '../../lib/urlUtils';
import { useEnvironmentStore } from './environmentStore';

interface RequestState {
  // Current request state
  url: string;
  method: HttpMethod;
  headers: Header[];
  queryParams: QueryParam[];
  body: string;
  bodyType: BodyType;
  timeout: number;
  auth: Auth;

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
    setAuth: (auth: AuthConfig) => void;

    // Header management
    addHeader: () => void;
    updateHeader: (index: number, field: keyof Header, value: string | boolean) => void;
    removeHeader: (index: number) => void;
    toggleHeader: (index: number) => void;

    // Query params management
    addQueryParam: () => void;
    updateQueryParam: (index: number, field: keyof QueryParam, value: string | boolean) => void;
    removeQueryParam: (index: number) => void;
    toggleQueryParam: (index: number) => void;
    syncUrlWithParams: () => void;
    syncParamsWithUrl: () => void;

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
    restoreFromHistory: (entry: HistoryEntry) => void;
  };
}

// Create service instances (singletons)
const httpService = new HttpService();
const historyService = new HistoryService();

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
  queryParams: [],
  body: '',
  bodyType: BodyType.JSON,
  timeout: 30000,
  auth: Auth.createDefault(),
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

    setAuth: (authConfig: AuthConfig) => set({ auth: new Auth(authConfig) }),

    // Header management
    addHeader: () => {
      const currentHeaders = get().headers;
      set({
        headers: [...currentHeaders, { name: '', value: '', enabled: true }],
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

    // Query params management
    addQueryParam: () => {
      const currentParams = get().queryParams;
      set({
        queryParams: [...currentParams, { key: '', value: '', description: '', enabled: true }],
      });
    },

    updateQueryParam: (index: number, field: keyof QueryParam, value: string | boolean) => {
      const currentParams = get().queryParams;
      const updatedParams = currentParams.map((param, i) => {
        if (i === index) {
          return { ...param, [field]: value };
        }
        return param;
      });
      set({ queryParams: updatedParams });
    },

    removeQueryParam: (index: number) => {
      const currentParams = get().queryParams;
      set({
        queryParams: currentParams.filter((_, i) => i !== index),
      });
    },

    toggleQueryParam: (index: number) => {
      const currentParams = get().queryParams;
      const updatedParams = currentParams.map((param, i) => {
        if (i === index) {
          return { ...param, enabled: !param.enabled };
        }
        return param;
      });
      set({ queryParams: updatedParams });
    },

    syncUrlWithParams: () => {
      const state = get();
      const baseUrl = getBaseUrl(state.url) || state.url;
      const newUrl = buildUrlWithParams(baseUrl, state.queryParams);
      set({ url: newUrl });
    },

    syncParamsWithUrl: () => {
      const state = get();
      const parsedParams = parseQueryParams(state.url);
      set({ queryParams: parsedParams });
    },

    // Request execution
    sendRequest: async () => {
      const state = get();

      // Clear previous response/error
      set({ response: null, error: null, isLoading: true });

      try {
        // Get environment store for variable resolution
        const envStore = useEnvironmentStore.getState();
        const resolveVariables = envStore.actions.resolveVariables;

        // Resolve variables in URL
        const resolvedUrl = resolveVariables(state.url);

        // Resolve variables in headers
        const resolvedHeaders = state.headers.map(header => ({
          ...header,
          name: resolveVariables(header.name),
          value: resolveVariables(header.value),
        }));

        // Apply authentication to headers
        const headersWithAuth = state.auth.applyToHeaders(resolvedHeaders);

        // Resolve variables in body
        const resolvedBody = resolveVariables(state.body);

        // Build request from current state with resolved variables
        const request = new Request({
          url: resolvedUrl,
          method: state.method,
          headers: headersWithAuth,
          body: resolvedBody,
          bodyType: state.bodyType,
          timeout: state.timeout,
        });

        // Send request via HTTP service
        const result = await httpService.sendRequest(request);

        if (result.success) {
          set({ response: result.response, error: null, isLoading: false });

          // Save complete request to history for restoration (with original, unresolved values)
          const historyEntry = new HistoryEntry({
            id: HistoryEntry.generateId(),
            timestamp: new Date().toISOString(),
            method: state.method,
            url: state.url, // Save original URL with variables
            statusCode: result.response?.statusCode,
            responseTime: result.response?.responseTime,
            headers: state.headers, // Save original headers with variables
            queryParams: state.queryParams,
            body: state.body, // Save original body with variables
            bodyType: state.bodyType,
          });
          historyService.add(historyEntry);
        } else {
          set({
            response: null,
            error: result.error.message,
            isLoading: false,
          });
        }
      } catch (error) {
        // Handle unexpected errors
        const errorMessage =
          error instanceof Error ? error.message : 'An unexpected error occurred';
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

    resetRequest: () =>
      set({
        url: '',
        method: HttpMethod.GET,
        headers: [],
        queryParams: [],
        body: '',
        bodyType: BodyType.JSON,
        timeout: 30000,
        auth: Auth.createDefault(),
        response: null,
        error: null,
        isLoading: false,
      }),

    restoreFromHistory: (entry: HistoryEntry) =>
      set({
        url: entry.url,
        method: entry.method,
        headers: entry.headers,
        queryParams: entry.queryParams,
        body: entry.body,
        bodyType: entry.bodyType,
        response: null,
        error: null,
        isLoading: false,
      }),
  },
}));
