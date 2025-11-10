/**
 * HTTP Service Tests
 *
 * Tests for the HTTP service that sends requests using axios
 *
 * @see specs/001-basic-request-builder/research.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { HttpService } from './httpService';
import { Request } from '../../models/Request';
import { HttpMethod, BodyType } from '../../types/request.types';

// Mock axios
vi.mock('axios');

describe('HttpService', () => {
  let httpService: HttpService;
  let mockCancelToken: any;

  beforeEach(() => {
    httpService = new HttpService();

    // Setup cancel token mock
    mockCancelToken = {
      token: 'mock-token',
      cancel: vi.fn(),
    };

    (axios.CancelToken as any) = {
      source: vi.fn(() => mockCancelToken),
    };

    vi.clearAllMocks();
  });

  describe('sendRequest', () => {
    it('should send GET request with correct URL', async () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        data: { message: 'success' },
      };

      (axios as any).mockResolvedValueOnce(mockResponse);

      const request = new Request({
        url: 'https://api.example.com/test',
        method: HttpMethod.GET,
      });

      const result = await httpService.sendRequest(request);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.response.statusCode).toBe(200);
        expect(result.response.statusText).toBe('OK');
      }
    });

    it('should return response with correct status code and body', async () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        data: { user: 'test' },
      };

      (axios as any).mockResolvedValueOnce(mockResponse);

      const request = new Request({
        url: 'https://api.example.com',
        method: HttpMethod.GET,
      });

      const result = await httpService.sendRequest(request);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.response.statusCode).toBe(200);
        expect(result.response.body).toContain('user');
      }
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      (networkError as any).isAxiosError = true;
      (networkError as any).response = undefined;
      (axios as any).mockRejectedValueOnce(networkError);
      (axios.isAxiosError as any) = vi.fn(() => true);

      const request = new Request({
        url: 'https://api.example.com',
        method: HttpMethod.GET,
      });

      const result = await httpService.sendRequest(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Network Error');
        expect(result.error.isNetworkError).toBe(true);
      }
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('timeout of 30000ms exceeded');
      (timeoutError as any).code = 'ECONNABORTED';
      (timeoutError as any).isAxiosError = true;
      (timeoutError as any).response = undefined;

      (axios as any).mockRejectedValueOnce(timeoutError);
      (axios.isAxiosError as any) = vi.fn(() => true);

      const request = new Request({
        url: 'https://api.example.com',
        method: HttpMethod.GET,
        timeout: 30000,
      });

      const result = await httpService.sendRequest(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.isTimeout).toBe(true);
      }
    });

    it('should measure response time accurately', async () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: {},
        data: {},
      };

      // Simulate 100ms delay
      (axios as any).mockImplementation(() =>
        new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100))
      );

      const request = new Request({
        url: 'https://api.example.com',
        method: HttpMethod.GET,
      });

      const result = await httpService.sendRequest(request);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.response.responseTime).toBeGreaterThanOrEqual(90);
        expect(result.response.responseTime).toBeLessThan(200);
      }
    });

    it('should send POST request with JSON body', async () => {
      const mockResponse = {
        status: 201,
        statusText: 'Created',
        headers: {},
        data: { id: 1 },
      };

      (axios as any).mockResolvedValueOnce(mockResponse);

      const request = new Request({
        url: 'https://api.example.com/posts',
        method: HttpMethod.POST,
        body: '{"title":"test"}',
        bodyType: BodyType.JSON,
      });

      const result = await httpService.sendRequest(request);

      expect(result.success).toBe(true);
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          data: '{"title":"test"}',
        })
      );
    });

    it('should set Content-Type header based on bodyType', async () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: {},
        data: {},
      };

      (axios as any).mockResolvedValueOnce(mockResponse);

      const request = new Request({
        url: 'https://api.example.com',
        method: HttpMethod.POST,
        body: '{"test":"data"}',
        bodyType: BodyType.JSON,
      });

      await httpService.sendRequest(request);

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should include enabled headers in request', async () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: {},
        data: {},
      };

      (axios as any).mockResolvedValueOnce(mockResponse);

      const request = new Request({
        url: 'https://api.example.com',
        method: HttpMethod.GET,
        headers: [
          { name: 'Authorization', value: 'Bearer token', enabled: true },
          { name: 'X-Custom', value: 'disabled', enabled: false },
        ],
      });

      await httpService.sendRequest(request);

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer token',
          }),
        })
      );
    });
  });

  describe('cancelRequest', () => {
    it('should cancel in-flight request', async () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: {},
        data: {},
      };

      (axios as any).mockImplementation(() =>
        new Promise((resolve) => setTimeout(() => resolve(mockResponse), 1000))
      );

      const request = new Request({
        url: 'https://api.example.com',
        method: HttpMethod.GET,
      });

      const requestPromise = httpService.sendRequest(request);

      // Cancel immediately
      httpService.cancelRequest();

      expect(mockCancelToken.cancel).toHaveBeenCalled();

      await requestPromise;
    });

    it('should handle cancelled request error', async () => {
      const cancelledError = new Error('Request cancelled');
      (cancelledError as any).code = 'ERR_CANCELED';

      (axios as any).mockRejectedValueOnce(cancelledError);
      (axios.isCancel as any) = vi.fn(() => true);

      const request = new Request({
        url: 'https://api.example.com',
        method: HttpMethod.GET,
      });

      const result = await httpService.sendRequest(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.isCancelled).toBe(true);
      }
    });
  });

  describe('isRequestInProgress', () => {
    it('should return false initially', () => {
      expect(httpService.isRequestInProgress()).toBe(false);
    });

    it('should return true while request is in progress', async () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: {},
        data: {},
      };

      (axios as any).mockImplementation(() =>
        new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100))
      );

      const request = new Request({
        url: 'https://api.example.com',
        method: HttpMethod.GET,
      });

      const requestPromise = httpService.sendRequest(request);

      expect(httpService.isRequestInProgress()).toBe(true);

      await requestPromise;

      expect(httpService.isRequestInProgress()).toBe(false);
    });
  });
});
