/**
 * Request Store Tests
 *
 * Tests for Zustand state management store
 *
 * @see specs/001-basic-request-builder/contracts/store.ts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useRequestStore } from './requestStore';
import { HttpMethod, BodyType } from '../../types/request.types';
import type { Response } from '../../models/Response';

describe('Request Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useRequestStore.getState();
    store.actions.resetRequest();
  });

  describe('initial state', () => {
    it('should initialize with empty URL', () => {
      const state = useRequestStore.getState();
      expect(state.url).toBe('');
    });

    it('should initialize with GET method', () => {
      const state = useRequestStore.getState();
      expect(state.method).toBe(HttpMethod.GET);
    });

    it('should initialize with empty headers array', () => {
      const state = useRequestStore.getState();
      expect(state.headers).toEqual([]);
    });

    it('should initialize with empty body', () => {
      const state = useRequestStore.getState();
      expect(state.body).toBe('');
    });

    it('should initialize with JSON body type', () => {
      const state = useRequestStore.getState();
      expect(state.bodyType).toBe(BodyType.JSON);
    });

    it('should initialize with 30000ms timeout', () => {
      const state = useRequestStore.getState();
      expect(state.timeout).toBe(30000);
    });

    it('should initialize with null response', () => {
      const state = useRequestStore.getState();
      expect(state.response).toBeNull();
    });

    it('should initialize with null error', () => {
      const state = useRequestStore.getState();
      expect(state.error).toBeNull();
    });

    it('should initialize with isLoading false', () => {
      const state = useRequestStore.getState();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setUrl action', () => {
    it('should update URL in state', () => {
      const store = useRequestStore.getState();
      store.actions.setUrl('https://api.example.com');

      const state = useRequestStore.getState();
      expect(state.url).toBe('https://api.example.com');
    });

    it('should handle empty URL', () => {
      const store = useRequestStore.getState();
      store.actions.setUrl('https://test.com');
      store.actions.setUrl('');

      const state = useRequestStore.getState();
      expect(state.url).toBe('');
    });
  });

  describe('setMethod action', () => {
    it('should update method in state', () => {
      const store = useRequestStore.getState();
      store.actions.setMethod(HttpMethod.POST);

      const state = useRequestStore.getState();
      expect(state.method).toBe(HttpMethod.POST);
    });

    it('should allow changing between all HTTP methods', () => {
      const store = useRequestStore.getState();

      store.actions.setMethod(HttpMethod.POST);
      expect(useRequestStore.getState().method).toBe(HttpMethod.POST);

      store.actions.setMethod(HttpMethod.PUT);
      expect(useRequestStore.getState().method).toBe(HttpMethod.PUT);

      store.actions.setMethod(HttpMethod.DELETE);
      expect(useRequestStore.getState().method).toBe(HttpMethod.DELETE);

      store.actions.setMethod(HttpMethod.GET);
      expect(useRequestStore.getState().method).toBe(HttpMethod.GET);
    });
  });

  describe('setBody action', () => {
    it('should update body in state', () => {
      const store = useRequestStore.getState();
      store.actions.setBody('{"test": "data"}');

      const state = useRequestStore.getState();
      expect(state.body).toBe('{"test": "data"}');
    });
  });

  describe('setBodyType action', () => {
    it('should update body type in state', () => {
      const store = useRequestStore.getState();
      store.actions.setBodyType(BodyType.FORM_DATA);

      const state = useRequestStore.getState();
      expect(state.bodyType).toBe(BodyType.FORM_DATA);
    });
  });

  describe('setTimeout action', () => {
    it('should update timeout in state', () => {
      const store = useRequestStore.getState();
      store.actions.setTimeout(60000);

      const state = useRequestStore.getState();
      expect(state.timeout).toBe(60000);
    });
  });

  describe('setLoading action', () => {
    it('should update isLoading flag', () => {
      const store = useRequestStore.getState();
      store.actions.setLoading(true);

      expect(useRequestStore.getState().isLoading).toBe(true);

      store.actions.setLoading(false);
      expect(useRequestStore.getState().isLoading).toBe(false);
    });
  });

  describe('header management', () => {
    it('should add a new header', () => {
      const store = useRequestStore.getState();
      store.actions.addHeader();

      const state = useRequestStore.getState();
      expect(state.headers).toHaveLength(1);
      expect(state.headers[0]).toEqual({
        name: '',
        value: '',
        enabled: true,
      });
    });

    it('should update header name', () => {
      const store = useRequestStore.getState();
      store.actions.addHeader();
      store.actions.updateHeader(0, 'name', 'Authorization');

      const state = useRequestStore.getState();
      expect(state.headers[0]?.name).toBe('Authorization');
    });

    it('should update header value', () => {
      const store = useRequestStore.getState();
      store.actions.addHeader();
      store.actions.updateHeader(0, 'value', 'Bearer token');

      const state = useRequestStore.getState();
      expect(state.headers[0]?.value).toBe('Bearer token');
    });

    it('should toggle header enabled state', () => {
      const store = useRequestStore.getState();
      store.actions.addHeader();
      store.actions.toggleHeader(0);

      expect(useRequestStore.getState().headers[0]?.enabled).toBe(false);

      store.actions.toggleHeader(0);
      expect(useRequestStore.getState().headers[0]?.enabled).toBe(true);
    });

    it('should remove header', () => {
      const store = useRequestStore.getState();
      store.actions.addHeader();
      store.actions.addHeader();

      expect(useRequestStore.getState().headers).toHaveLength(2);

      store.actions.removeHeader(0);
      expect(useRequestStore.getState().headers).toHaveLength(1);
    });
  });

  describe('setResponse action', () => {
    it('should update response in state', () => {
      const mockResponse: Response = {
        statusCode: 200,
        statusText: 'OK',
        headers: [],
        body: '{"success": true}',
        responseTime: 100,
        size: 18,
        contentType: 'application/json',
        timestamp: '2025-11-07T10:00:00Z',
        statusCategory: 'success',
        formattedSize: '18 bytes',
        isJson: true,
        isXml: false,
        isHtml: false,
        toJSON: () => ({}),
      } as any;

      const store = useRequestStore.getState();
      store.actions.setResponse(mockResponse);

      const state = useRequestStore.getState();
      expect(state.response).toBe(mockResponse);
    });

    it('should clear response when set to null', () => {
      const mockResponse: Response = {
        statusCode: 200,
        statusText: 'OK',
        headers: [],
        body: '{}',
        responseTime: 100,
        size: 2,
        contentType: 'application/json',
        timestamp: '2025-11-07T10:00:00Z',
        statusCategory: 'success',
        formattedSize: '2 bytes',
        isJson: true,
        isXml: false,
        isHtml: false,
        toJSON: () => ({}),
      } as any;

      const store = useRequestStore.getState();
      store.actions.setResponse(mockResponse);
      store.actions.setResponse(null);

      const state = useRequestStore.getState();
      expect(state.response).toBeNull();
    });
  });

  describe('setError action', () => {
    it('should update error in state', () => {
      const store = useRequestStore.getState();
      store.actions.setError('Network error occurred');

      const state = useRequestStore.getState();
      expect(state.error).toBe('Network error occurred');
    });

    it('should clear error when set to null', () => {
      const store = useRequestStore.getState();
      store.actions.setError('Some error');
      store.actions.setError(null);

      const state = useRequestStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('clearResponse action', () => {
    it('should clear both response and error', () => {
      const mockResponse: Response = {
        statusCode: 200,
        statusText: 'OK',
        headers: [],
        body: '{}',
        responseTime: 100,
        size: 2,
        contentType: 'application/json',
        timestamp: '2025-11-07T10:00:00Z',
        statusCategory: 'success',
        formattedSize: '2 bytes',
        isJson: true,
        isXml: false,
        isHtml: false,
        toJSON: () => ({}),
      } as any;

      const store = useRequestStore.getState();
      store.actions.setResponse(mockResponse);
      store.actions.setError('Some error');
      store.actions.clearResponse();

      const state = useRequestStore.getState();
      expect(state.response).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('query params management', () => {
    it('should initialize with empty query params array', () => {
      const state = useRequestStore.getState();
      expect(state.queryParams).toEqual([]);
    });

    it('should add a new query param', () => {
      const store = useRequestStore.getState();
      store.actions.addQueryParam();

      const state = useRequestStore.getState();
      expect(state.queryParams).toHaveLength(1);
      expect(state.queryParams[0]).toEqual({
        key: '',
        value: '',
        description: '',
        enabled: true,
      });
    });

    it('should update query param key', () => {
      const store = useRequestStore.getState();
      store.actions.addQueryParam();
      store.actions.updateQueryParam(0, 'key', 'page');

      const state = useRequestStore.getState();
      expect(state.queryParams[0]?.key).toBe('page');
    });

    it('should update query param value', () => {
      const store = useRequestStore.getState();
      store.actions.addQueryParam();
      store.actions.updateQueryParam(0, 'value', '1');

      const state = useRequestStore.getState();
      expect(state.queryParams[0]?.value).toBe('1');
    });

    it('should update query param description', () => {
      const store = useRequestStore.getState();
      store.actions.addQueryParam();
      store.actions.updateQueryParam(0, 'description', 'Page number');

      const state = useRequestStore.getState();
      expect(state.queryParams[0]?.description).toBe('Page number');
    });

    it('should toggle query param enabled state', () => {
      const store = useRequestStore.getState();
      store.actions.addQueryParam();
      store.actions.toggleQueryParam(0);

      expect(useRequestStore.getState().queryParams[0]?.enabled).toBe(false);

      store.actions.toggleQueryParam(0);
      expect(useRequestStore.getState().queryParams[0]?.enabled).toBe(true);
    });

    it('should remove query param', () => {
      const store = useRequestStore.getState();
      store.actions.addQueryParam();
      store.actions.addQueryParam();

      expect(useRequestStore.getState().queryParams).toHaveLength(2);

      store.actions.removeQueryParam(0);
      expect(useRequestStore.getState().queryParams).toHaveLength(1);
    });

    it('should add multiple query params', () => {
      const store = useRequestStore.getState();
      store.actions.addQueryParam();
      store.actions.updateQueryParam(0, 'key', 'page');
      store.actions.updateQueryParam(0, 'value', '1');

      store.actions.addQueryParam();
      store.actions.updateQueryParam(1, 'key', 'limit');
      store.actions.updateQueryParam(1, 'value', '10');

      const state = useRequestStore.getState();
      expect(state.queryParams).toHaveLength(2);
      expect(state.queryParams[0]?.key).toBe('page');
      expect(state.queryParams[1]?.key).toBe('limit');
    });
  });

  describe('URL synchronization', () => {
    it('should sync URL with query params', () => {
      const store = useRequestStore.getState();
      store.actions.setUrl('https://api.example.com/users');

      store.actions.addQueryParam();
      store.actions.updateQueryParam(0, 'key', 'page');
      store.actions.updateQueryParam(0, 'value', '1');

      store.actions.addQueryParam();
      store.actions.updateQueryParam(1, 'key', 'limit');
      store.actions.updateQueryParam(1, 'value', '10');

      store.actions.syncUrlWithParams();

      const state = useRequestStore.getState();
      expect(state.url).toBe('https://api.example.com/users?page=1&limit=10');
    });

    it('should sync params with URL', () => {
      const store = useRequestStore.getState();
      store.actions.setUrl('https://api.example.com/users?page=1&limit=10&sort=name');

      store.actions.syncParamsWithUrl();

      const state = useRequestStore.getState();
      expect(state.queryParams).toHaveLength(3);
      expect(state.queryParams[0]?.key).toBe('page');
      expect(state.queryParams[0]?.value).toBe('1');
      expect(state.queryParams[1]?.key).toBe('limit');
      expect(state.queryParams[1]?.value).toBe('10');
      expect(state.queryParams[2]?.key).toBe('sort');
      expect(state.queryParams[2]?.value).toBe('name');
    });

    it('should only include enabled params when syncing URL', () => {
      const store = useRequestStore.getState();
      store.actions.setUrl('https://api.example.com/users');

      store.actions.addQueryParam();
      store.actions.updateQueryParam(0, 'key', 'page');
      store.actions.updateQueryParam(0, 'value', '1');

      store.actions.addQueryParam();
      store.actions.updateQueryParam(1, 'key', 'limit');
      store.actions.updateQueryParam(1, 'value', '10');
      store.actions.toggleQueryParam(1); // Disable limit param

      store.actions.syncUrlWithParams();

      const state = useRequestStore.getState();
      expect(state.url).toBe('https://api.example.com/users?page=1');
    });

    it('should preserve base URL when syncing', () => {
      const store = useRequestStore.getState();
      store.actions.setUrl('https://api.example.com:8080/v1/users?old=param');

      store.actions.addQueryParam();
      store.actions.updateQueryParam(0, 'key', 'new');
      store.actions.updateQueryParam(0, 'value', 'param');

      store.actions.syncUrlWithParams();

      const state = useRequestStore.getState();
      expect(state.url).toBe('https://api.example.com:8080/v1/users?new=param');
    });
  });

  describe('resetRequest action', () => {
    it('should reset all request fields to defaults', () => {
      const store = useRequestStore.getState();

      // Set some values
      store.actions.setUrl('https://test.com');
      store.actions.setMethod(HttpMethod.POST);
      store.actions.setBody('{"test": "data"}');
      store.actions.addHeader();
      store.actions.addQueryParam();

      // Reset
      store.actions.resetRequest();

      const state = useRequestStore.getState();
      expect(state.url).toBe('');
      expect(state.method).toBe(HttpMethod.GET);
      expect(state.headers).toEqual([]);
      expect(state.queryParams).toEqual([]);
      expect(state.body).toBe('');
      expect(state.bodyType).toBe(BodyType.JSON);
      expect(state.response).toBeNull();
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });
});
