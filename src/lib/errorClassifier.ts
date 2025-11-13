/**
 * Error Classifier
 *
 * Classifies HTTP errors and provides user-friendly error messages
 * with suggested actions for recovery.
 */

import type { HttpError } from '../types/request.types';

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  NETWORK = 'network',
  DNS = 'dns',
  CONNECTION_REFUSED = 'connection_refused',
  TIMEOUT = 'timeout',
  SSL_ERROR = 'ssl_error',
  INVALID_URL = 'invalid_url',
  CANCELLED = 'cancelled',
  CLIENT_ERROR = 'client_error',
  SERVER_ERROR = 'server_error',
  VARIABLE_ERROR = 'variable_error',
  UNKNOWN = 'unknown',
}

/**
 * Classified error with user-friendly information
 */
export interface ClassifiedError {
  category: ErrorCategory;
  userMessage: string;
  suggestion: string;
  technicalDetails: string;
  retryable: boolean;
  originalError: HttpError;
}

/**
 * Classify an HTTP error and provide user-friendly information
 */
export function classifyError(error: HttpError): ClassifiedError {
  const category = determineErrorCategory(error);
  const userMessage = getErrorMessage(category, error.statusCode);
  const suggestion = getErrorSuggestion(category, error.statusCode);
  const technicalDetails = formatTechnicalDetails(error);
  const retryable = isRetryable(category, error.statusCode);

  return {
    category,
    userMessage,
    suggestion,
    technicalDetails,
    retryable,
    originalError: error,
  };
}

/**
 * Check if error is a variable resolution error
 */
function isVariableError(error: HttpError): boolean {
  return error.message.includes('Variable') && error.message.includes('not defined');
}

/**
 * Check if error is a DNS error
 */
function isDNSError(error: HttpError): boolean {
  return error.code === 'ENOTFOUND' || error.message.includes('getaddrinfo');
}

/**
 * Categorize error by HTTP status code
 */
function categorizeByStatusCode(statusCode?: number): ErrorCategory | null {
  if (!statusCode) {
    return null;
  }
  if (statusCode >= 400 && statusCode < 500) {
    return ErrorCategory.CLIENT_ERROR;
  }
  if (statusCode >= 500) {
    return ErrorCategory.SERVER_ERROR;
  }
  return null;
}

/**
 * Determine the error category from an HTTP error
 */
function determineErrorCategory(error: HttpError): ErrorCategory {
  if (isVariableError(error)) {
    return ErrorCategory.VARIABLE_ERROR;
  }
  if (error.isCancelled) {
    return ErrorCategory.CANCELLED;
  }
  if (error.isTimeout) {
    return ErrorCategory.TIMEOUT;
  }
  if (error.code === 'ERR_INVALID_URL') {
    return ErrorCategory.INVALID_URL;
  }
  if (isSSLError(error)) {
    return ErrorCategory.SSL_ERROR;
  }
  if (isDNSError(error)) {
    return ErrorCategory.DNS;
  }
  if (error.code === 'ECONNREFUSED') {
    return ErrorCategory.CONNECTION_REFUSED;
  }
  if (error.isNetworkError) {
    return ErrorCategory.NETWORK;
  }

  const statusCategory = categorizeByStatusCode(error.statusCode);
  if (statusCategory) {
    return statusCategory;
  }

  return ErrorCategory.UNKNOWN;
}

/**
 * Check if error is an SSL/TLS error
 */
function isSSLError(error: HttpError): boolean {
  const sslCodes = [
    'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
    'SELF_SIGNED_CERT_IN_CHAIN',
    'DEPTH_ZERO_SELF_SIGNED_CERT',
    'CERT_HAS_EXPIRED',
    'CERT_NOT_YET_VALID',
    'UNABLE_TO_GET_ISSUER_CERT',
    'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
  ];

  if (error.code && sslCodes.includes(error.code)) {
    return true;
  }

  const sslKeywords = [
    'certificate',
    'cert',
    'ssl',
    'tls',
    'self signed',
    'unable to verify',
  ];

  return sslKeywords.some((keyword) =>
    error.message.toLowerCase().includes(keyword)
  );
}

/**
 * Error message lookup map
 */
const ERROR_MESSAGES: Record<ErrorCategory, string> = {
  [ErrorCategory.NETWORK]: 'Cannot connect to server',
  [ErrorCategory.DNS]: 'Could not resolve hostname',
  [ErrorCategory.CONNECTION_REFUSED]: 'Connection refused by server',
  [ErrorCategory.TIMEOUT]: 'Request timed out',
  [ErrorCategory.SSL_ERROR]: 'SSL certificate verification failed',
  [ErrorCategory.INVALID_URL]: 'Invalid URL format',
  [ErrorCategory.CANCELLED]: 'Request was cancelled',
  [ErrorCategory.CLIENT_ERROR]: 'Client error - Check your request',
  [ErrorCategory.SERVER_ERROR]: 'Server error - Try again later',
  [ErrorCategory.VARIABLE_ERROR]: 'Variable not defined',
  [ErrorCategory.UNKNOWN]: 'An unexpected error occurred',
};

/**
 * Get user-friendly error message based on category
 */
export function getErrorMessage(category: ErrorCategory, statusCode?: number): string {
  const baseMessage = ERROR_MESSAGES[category] || 'An error occurred';

  if (category === ErrorCategory.CLIENT_ERROR && statusCode) {
    return `Client error (${statusCode}) - Check your request`;
  }
  if (category === ErrorCategory.SERVER_ERROR && statusCode) {
    return `Server error (${statusCode}) - Try again later`;
  }

  return baseMessage;
}

/**
 * Error suggestion lookup map
 */
const ERROR_SUGGESTIONS: Record<ErrorCategory, string> = {
  [ErrorCategory.NETWORK]: 'Check your internet connection and verify the server is accessible.',
  [ErrorCategory.DNS]: 'Verify the URL is correct and the domain exists.',
  [ErrorCategory.CONNECTION_REFUSED]: 'Ensure the server is running and the port is correct.',
  [ErrorCategory.TIMEOUT]: 'Try again or increase the timeout value in your request settings.',
  [ErrorCategory.SSL_ERROR]:
    'The server has an invalid or expired SSL certificate. Contact the server administrator.',
  [ErrorCategory.INVALID_URL]: 'Enter a valid URL starting with http:// or https://',
  [ErrorCategory.CANCELLED]: '',
  [ErrorCategory.CLIENT_ERROR]: 'Review your request parameters, headers, and body.',
  [ErrorCategory.SERVER_ERROR]:
    'Try again later or contact the API administrator if the problem persists.',
  [ErrorCategory.VARIABLE_ERROR]:
    'Define the variable in your active environment or remove it from your request.',
  [ErrorCategory.UNKNOWN]: 'Review the technical details below for more information.',
};

/**
 * Get suggested action based on error category
 */
export function getErrorSuggestion(category: ErrorCategory, statusCode?: number): string {
  if (category === ErrorCategory.CLIENT_ERROR && statusCode) {
    return getClientErrorSuggestion(statusCode);
  }

  return ERROR_SUGGESTIONS[category] || '';
}

/**
 * Get specific suggestion for client errors based on status code
 */
function getClientErrorSuggestion(statusCode?: number): string {
  switch (statusCode) {
    case 400:
      return 'Check your request parameters and body format.';
    case 401:
      return 'Authentication required. Verify your credentials or API token.';
    case 403:
      return 'You do not have permissions to access this resource.';
    case 404:
      return 'The requested endpoint was not found. Verify the URL path.';
    case 405:
      return 'This HTTP method is not allowed for this endpoint.';
    case 408:
      return 'Request timeout. Try again.';
    case 429:
      return 'Too many requests. Wait a moment before trying again.';
    default:
      return 'Review your request parameters, headers, and body.';
  }
}

/**
 * Format technical details for display
 */
function formatTechnicalDetails(error: HttpError): string {
  const parts: string[] = [];

  parts.push(`Message: ${error.message}`);

  if (error.code) {
    parts.push(`Code: ${error.code}`);
  }

  if (error.statusCode) {
    parts.push(`Status Code: ${error.statusCode}`);
  }

  return parts.join('\n');
}

/**
 * Determine if an error is retryable
 */
function isRetryable(category: ErrorCategory, statusCode?: number): boolean {
  // Network and timeout errors are retryable
  if (
    category === ErrorCategory.NETWORK ||
    category === ErrorCategory.TIMEOUT ||
    category === ErrorCategory.CONNECTION_REFUSED
  ) {
    return true;
  }

  // Some 5xx errors are retryable
  if (category === ErrorCategory.SERVER_ERROR) {
    // 501 (Not Implemented) is not retryable
    if (statusCode === 501) {
      return false;
    }
    return true;
  }

  // 408 (Request Timeout) and 429 (Too Many Requests) are retryable
  if (category === ErrorCategory.CLIENT_ERROR && (statusCode === 408 || statusCode === 429)) {
    return true;
  }

  // All other errors are not retryable
  return false;
}
