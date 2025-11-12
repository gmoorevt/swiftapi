/**
 * ErrorDisplay Component Tests
 *
 * Tests for the enhanced error display component with expandable details
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorDisplay } from './ErrorDisplay';
import { ErrorCategory } from '../../../lib/errorClassifier';
import type { ClassifiedError } from '../../../lib/errorClassifier';

describe('ErrorDisplay', () => {
  const mockNetworkError: ClassifiedError = {
    category: ErrorCategory.NETWORK,
    userMessage: 'Cannot connect to server',
    suggestion: 'Check your internet connection and verify the server is accessible.',
    technicalDetails: 'Message: Network Error\nCode: ERR_NETWORK',
    retryable: true,
    originalError: {
      message: 'Network Error',
      code: 'ERR_NETWORK',
      isNetworkError: true,
      isTimeout: false,
      isCancelled: false,
    },
  };

  const mockClientError: ClassifiedError = {
    category: ErrorCategory.CLIENT_ERROR,
    userMessage: 'Client error (404) - Check your request',
    suggestion: 'The requested endpoint was not found. Verify the URL path.',
    technicalDetails: 'Message: Not Found\nStatus Code: 404',
    retryable: false,
    originalError: {
      message: 'Not Found',
      statusCode: 404,
      isNetworkError: false,
      isTimeout: false,
      isCancelled: false,
    },
  };

  it('should render error message', () => {
    render(<ErrorDisplay error={mockNetworkError} />);
    expect(screen.getByText('Cannot connect to server')).toBeInTheDocument();
  });

  it('should render suggestion text', () => {
    render(<ErrorDisplay error={mockNetworkError} />);
    expect(
      screen.getByText(/Check your internet connection/)
    ).toBeInTheDocument();
  });

  it('should not show technical details by default', () => {
    render(<ErrorDisplay error={mockNetworkError} />);
    expect(screen.queryByText(/Message: Network Error/)).not.toBeInTheDocument();
  });

  it('should toggle technical details when clicked', () => {
    render(<ErrorDisplay error={mockNetworkError} />);

    const toggleButton = screen.getByRole('button', { name: /technical details/i });
    fireEvent.click(toggleButton);

    expect(screen.getByText(/Message: Network Error/)).toBeVisible();
  });

  it('should show retry button for retryable errors', () => {
    const onRetry = vi.fn();
    render(<ErrorDisplay error={mockNetworkError} onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should not show retry button for non-retryable errors', () => {
    render(<ErrorDisplay error={mockClientError} />);

    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorDisplay error={mockNetworkError} onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should render with network error styling', () => {
    const { container } = render(<ErrorDisplay error={mockNetworkError} />);
    const errorContainer = container.querySelector('[data-error-category="network"]');
    expect(errorContainer).toBeInTheDocument();
  });

  it('should render with client error styling', () => {
    const { container } = render(<ErrorDisplay error={mockClientError} />);
    const errorContainer = container.querySelector('[data-error-category="client_error"]');
    expect(errorContainer).toBeInTheDocument();
  });

  it('should expand and collapse technical details', () => {
    render(<ErrorDisplay error={mockNetworkError} />);

    const toggleButton = screen.getByRole('button', { name: /technical details/i });

    // Initially collapsed
    expect(screen.queryByText(/Message: Network Error/)).not.toBeInTheDocument();

    // Expand
    fireEvent.click(toggleButton);
    expect(screen.getByText(/Message: Network Error/)).toBeInTheDocument();

    // Collapse
    fireEvent.click(toggleButton);
    expect(screen.queryByText(/Message: Network Error/)).not.toBeInTheDocument();
  });

  it('should show SSL error with appropriate styling', () => {
    const sslError: ClassifiedError = {
      category: ErrorCategory.SSL_ERROR,
      userMessage: 'SSL certificate verification failed',
      suggestion: 'The server has an invalid or expired SSL certificate.',
      technicalDetails: 'Message: SSL Error\nCode: UNABLE_TO_VERIFY_LEAF_SIGNATURE',
      retryable: false,
      originalError: {
        message: 'SSL Error',
        code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
        isNetworkError: true,
        isTimeout: false,
        isCancelled: false,
      },
    };

    render(<ErrorDisplay error={sslError} />);
    expect(screen.getByText('SSL certificate verification failed')).toBeInTheDocument();
  });

  it('should show timeout error', () => {
    const timeoutError: ClassifiedError = {
      category: ErrorCategory.TIMEOUT,
      userMessage: 'Request timed out',
      suggestion: 'Try again or increase the timeout value.',
      technicalDetails: 'Message: timeout\nCode: ECONNABORTED',
      retryable: true,
      originalError: {
        message: 'timeout',
        code: 'ECONNABORTED',
        isNetworkError: false,
        isTimeout: true,
        isCancelled: false,
      },
    };

    render(<ErrorDisplay error={timeoutError} />);
    expect(screen.getByText('Request timed out')).toBeInTheDocument();
  });

  it('should render technical details with proper formatting', () => {
    render(<ErrorDisplay error={mockNetworkError} />);

    const toggleButton = screen.getByRole('button', { name: /technical details/i });
    fireEvent.click(toggleButton);

    const technicalDetails = screen.getByText(/Message: Network Error/);
    expect(technicalDetails).toBeInTheDocument();
    expect(technicalDetails).toHaveStyle({ whiteSpace: 'pre-wrap' });
  });

  it('should show cancelled error without retry button', () => {
    const cancelledError: ClassifiedError = {
      category: ErrorCategory.CANCELLED,
      userMessage: 'Request was cancelled',
      suggestion: '',
      technicalDetails: 'Message: Cancelled',
      retryable: false,
      originalError: {
        message: 'Cancelled',
        isCancelled: true,
        isNetworkError: false,
        isTimeout: false,
      },
    };

    render(<ErrorDisplay error={cancelledError} />);
    expect(screen.getByText('Request was cancelled')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });

  it('should update when error prop changes', () => {
    const { rerender } = render(<ErrorDisplay error={mockNetworkError} />);
    expect(screen.getByText('Cannot connect to server')).toBeInTheDocument();

    rerender(<ErrorDisplay error={mockClientError} />);
    expect(screen.getByText(/Client error \(404\)/)).toBeInTheDocument();
  });

  it('should handle error without suggestion', () => {
    const errorWithoutSuggestion: ClassifiedError = {
      ...mockNetworkError,
      suggestion: '',
    };

    render(<ErrorDisplay error={errorWithoutSuggestion} />);
    expect(screen.getByText('Cannot connect to server')).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(<ErrorDisplay error={mockNetworkError} />);

    // Check for ARIA attributes
    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toBeInTheDocument();
  });
});
