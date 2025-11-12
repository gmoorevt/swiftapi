/**
 * Error Classifier Tests
 *
 * Tests for error classification and user-friendly error message generation
 */

import { describe, it, expect } from 'vitest';
import {
  classifyError,
  ErrorCategory,
  getErrorMessage,
  getErrorSuggestion,
} from './errorClassifier';
import type { HttpError } from '../types/request.types';

describe('errorClassifier', () => {
  describe('classifyError', () => {
    it('should classify network errors', () => {
      const error: HttpError = {
        message: 'Network Error',
        code: 'ERR_NETWORK',
        isNetworkError: true,
        isTimeout: false,
        isCancelled: false,
      };

      const result = classifyError(error);

      expect(result.category).toBe(ErrorCategory.NETWORK);
      expect(result.userMessage).toContain('Cannot connect to server');
    });

    it('should classify DNS errors', () => {
      const error: HttpError = {
        message: 'getaddrinfo ENOTFOUND api.example.com',
        code: 'ENOTFOUND',
        isNetworkError: true,
        isTimeout: false,
        isCancelled: false,
      };

      const result = classifyError(error);

      expect(result.category).toBe(ErrorCategory.DNS);
      expect(result.userMessage).toContain('Could not resolve hostname');
    });

    it('should classify connection refused errors', () => {
      const error: HttpError = {
        message: 'connect ECONNREFUSED 127.0.0.1:3000',
        code: 'ECONNREFUSED',
        isNetworkError: true,
        isTimeout: false,
        isCancelled: false,
      };

      const result = classifyError(error);

      expect(result.category).toBe(ErrorCategory.CONNECTION_REFUSED);
      expect(result.userMessage).toContain('Connection refused');
    });

    it('should classify timeout errors', () => {
      const error: HttpError = {
        message: 'timeout of 30000ms exceeded',
        code: 'ECONNABORTED',
        isNetworkError: false,
        isTimeout: true,
        isCancelled: false,
      };

      const result = classifyError(error);

      expect(result.category).toBe(ErrorCategory.TIMEOUT);
      expect(result.userMessage).toContain('Request timed out');
    });

    it('should classify SSL/TLS certificate errors', () => {
      const error: HttpError = {
        message: 'unable to verify the first certificate',
        code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
        isNetworkError: true,
        isTimeout: false,
        isCancelled: false,
      };

      const result = classifyError(error);

      expect(result.category).toBe(ErrorCategory.SSL_ERROR);
      expect(result.userMessage).toContain('SSL certificate verification failed');
    });

    it('should classify self-signed certificate errors', () => {
      const error: HttpError = {
        message: 'self signed certificate',
        code: 'DEPTH_ZERO_SELF_SIGNED_CERT',
        isNetworkError: true,
        isTimeout: false,
        isCancelled: false,
      };

      const result = classifyError(error);

      expect(result.category).toBe(ErrorCategory.SSL_ERROR);
      expect(result.userMessage).toContain('SSL certificate verification failed');
    });

    it('should classify invalid URL errors', () => {
      const error: HttpError = {
        message: 'Invalid URL',
        code: 'ERR_INVALID_URL',
        isNetworkError: false,
        isTimeout: false,
        isCancelled: false,
      };

      const result = classifyError(error);

      expect(result.category).toBe(ErrorCategory.INVALID_URL);
      expect(result.userMessage).toContain('Invalid URL format');
    });

    it('should classify cancelled requests', () => {
      const error: HttpError = {
        message: 'Request was cancelled',
        code: 'ERR_CANCELED',
        isNetworkError: false,
        isTimeout: false,
        isCancelled: true,
      };

      const result = classifyError(error);

      expect(result.category).toBe(ErrorCategory.CANCELLED);
      expect(result.userMessage).toContain('Request was cancelled');
    });

    it('should classify 4xx client errors', () => {
      const error: HttpError = {
        message: 'Request failed with status code 404',
        statusCode: 404,
        isNetworkError: false,
        isTimeout: false,
        isCancelled: false,
      };

      const result = classifyError(error);

      expect(result.category).toBe(ErrorCategory.CLIENT_ERROR);
      expect(result.userMessage).toContain('Client error');
    });

    it('should classify 401 authentication errors', () => {
      const error: HttpError = {
        message: 'Request failed with status code 401',
        statusCode: 401,
        isNetworkError: false,
        isTimeout: false,
        isCancelled: false,
      };

      const result = classifyError(error);

      expect(result.category).toBe(ErrorCategory.CLIENT_ERROR);
      expect(result.userMessage).toContain('401');
      expect(result.suggestion.toLowerCase()).toContain('authentication');
    });

    it('should classify 5xx server errors', () => {
      const error: HttpError = {
        message: 'Request failed with status code 500',
        statusCode: 500,
        isNetworkError: false,
        isTimeout: false,
        isCancelled: false,
      };

      const result = classifyError(error);

      expect(result.category).toBe(ErrorCategory.SERVER_ERROR);
      expect(result.userMessage).toContain('Server error');
    });

    it('should classify unknown errors', () => {
      const error: HttpError = {
        message: 'Something went wrong',
        isNetworkError: false,
        isTimeout: false,
        isCancelled: false,
      };

      const result = classifyError(error);

      expect(result.category).toBe(ErrorCategory.UNKNOWN);
      expect(result.userMessage).toContain('error occurred');
    });

    it('should include technical details in classified error', () => {
      const error: HttpError = {
        message: 'Network Error',
        code: 'ERR_NETWORK',
        isNetworkError: true,
        isTimeout: false,
        isCancelled: false,
      };

      const result = classifyError(error);

      expect(result.technicalDetails).toContain('Network Error');
      expect(result.technicalDetails).toContain('ERR_NETWORK');
    });

    it('should include status code in technical details', () => {
      const error: HttpError = {
        message: 'Request failed with status code 404',
        statusCode: 404,
        code: 'ERR_BAD_REQUEST',
        isNetworkError: false,
        isTimeout: false,
        isCancelled: false,
      };

      const result = classifyError(error);

      expect(result.technicalDetails).toContain('404');
      expect(result.technicalDetails).toContain('ERR_BAD_REQUEST');
    });
  });

  describe('getErrorMessage', () => {
    it('should return user-friendly message for network errors', () => {
      const message = getErrorMessage(ErrorCategory.NETWORK);
      expect(message).toContain('Cannot connect to server');
    });

    it('should return user-friendly message for DNS errors', () => {
      const message = getErrorMessage(ErrorCategory.DNS);
      expect(message).toContain('Could not resolve hostname');
    });

    it('should return user-friendly message for timeout errors', () => {
      const message = getErrorMessage(ErrorCategory.TIMEOUT);
      expect(message).toContain('Request timed out');
    });

    it('should return user-friendly message for SSL errors', () => {
      const message = getErrorMessage(ErrorCategory.SSL_ERROR);
      expect(message).toContain('SSL certificate verification failed');
    });

    it('should return user-friendly message for invalid URL', () => {
      const message = getErrorMessage(ErrorCategory.INVALID_URL);
      expect(message).toContain('Invalid URL format');
    });

    it('should return user-friendly message for client errors', () => {
      const message = getErrorMessage(ErrorCategory.CLIENT_ERROR, 404);
      expect(message).toContain('404');
      expect(message).toContain('Client error');
    });

    it('should return user-friendly message for server errors', () => {
      const message = getErrorMessage(ErrorCategory.SERVER_ERROR, 500);
      expect(message).toContain('500');
      expect(message).toContain('Server error');
    });
  });

  describe('getErrorSuggestion', () => {
    it('should provide suggestion for network errors', () => {
      const suggestion = getErrorSuggestion(ErrorCategory.NETWORK);
      expect(suggestion).toContain('internet connection');
    });

    it('should provide suggestion for DNS errors', () => {
      const suggestion = getErrorSuggestion(ErrorCategory.DNS);
      expect(suggestion).toContain('URL is correct');
    });

    it('should provide suggestion for connection refused', () => {
      const suggestion = getErrorSuggestion(ErrorCategory.CONNECTION_REFUSED);
      expect(suggestion).toContain('server is running');
    });

    it('should provide suggestion for timeout errors', () => {
      const suggestion = getErrorSuggestion(ErrorCategory.TIMEOUT);
      expect(suggestion).toContain('Try again');
    });

    it('should provide suggestion for SSL errors', () => {
      const suggestion = getErrorSuggestion(ErrorCategory.SSL_ERROR);
      expect(suggestion).toContain('certificate');
    });

    it('should provide suggestion for invalid URL', () => {
      const suggestion = getErrorSuggestion(ErrorCategory.INVALID_URL);
      expect(suggestion).toContain('valid URL');
    });

    it('should provide suggestion for 401 errors', () => {
      const suggestion = getErrorSuggestion(ErrorCategory.CLIENT_ERROR, 401);
      expect(suggestion.toLowerCase()).toContain('authentication');
    });

    it('should provide suggestion for 403 errors', () => {
      const suggestion = getErrorSuggestion(ErrorCategory.CLIENT_ERROR, 403);
      expect(suggestion).toContain('permissions');
    });

    it('should provide suggestion for 404 errors', () => {
      const suggestion = getErrorSuggestion(ErrorCategory.CLIENT_ERROR, 404);
      expect(suggestion).toContain('endpoint');
    });

    it('should provide suggestion for server errors', () => {
      const suggestion = getErrorSuggestion(ErrorCategory.SERVER_ERROR);
      expect(suggestion).toContain('Try again later');
    });

    it('should provide generic suggestion for cancelled requests', () => {
      const suggestion = getErrorSuggestion(ErrorCategory.CANCELLED);
      expect(suggestion).toBe('');
    });
  });

  describe('isRetryable', () => {
    it('should mark network errors as retryable', () => {
      const error: HttpError = {
        message: 'Network Error',
        code: 'ERR_NETWORK',
        isNetworkError: true,
        isTimeout: false,
        isCancelled: false,
      };

      const result = classifyError(error);
      expect(result.retryable).toBe(true);
    });

    it('should mark timeout errors as retryable', () => {
      const error: HttpError = {
        message: 'timeout',
        isNetworkError: false,
        isTimeout: true,
        isCancelled: false,
      };

      const result = classifyError(error);
      expect(result.retryable).toBe(true);
    });

    it('should mark 5xx errors as retryable', () => {
      const error: HttpError = {
        message: 'Server error',
        statusCode: 503,
        isNetworkError: false,
        isTimeout: false,
        isCancelled: false,
      };

      const result = classifyError(error);
      expect(result.retryable).toBe(true);
    });

    it('should mark 4xx errors as non-retryable', () => {
      const error: HttpError = {
        message: 'Client error',
        statusCode: 404,
        isNetworkError: false,
        isTimeout: false,
        isCancelled: false,
      };

      const result = classifyError(error);
      expect(result.retryable).toBe(false);
    });

    it('should mark cancelled requests as non-retryable', () => {
      const error: HttpError = {
        message: 'Cancelled',
        isCancelled: true,
        isNetworkError: false,
        isTimeout: false,
      };

      const result = classifyError(error);
      expect(result.retryable).toBe(false);
    });

    it('should mark SSL errors as non-retryable', () => {
      const error: HttpError = {
        message: 'SSL error',
        code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
        isNetworkError: true,
        isTimeout: false,
        isCancelled: false,
      };

      const result = classifyError(error);
      expect(result.retryable).toBe(false);
    });
  });
});
