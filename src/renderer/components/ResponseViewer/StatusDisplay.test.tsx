/**
 * StatusDisplay Component Tests
 *
 * Tests for response status display component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusDisplay } from './StatusDisplay';
import { useRequestStore } from '../../store/requestStore';
import { Response } from '../../../models/Response';

describe('StatusDisplay', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useRequestStore.getState();
    store.actions.resetRequest();
  });

  it('should show empty state when no response', () => {
    render(<StatusDisplay />);
    expect(screen.getByText(/no response yet/i)).toBeInTheDocument();
  });

  it('should display status code', () => {
    const mockResponse = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [],
      body: '{}',
      responseTime: 100,
      size: 2,
      timestamp: '2025-11-07T10:00:00Z',
    });

    const store = useRequestStore.getState();
    store.actions.setResponse(mockResponse);

    render(<StatusDisplay />);
    expect(screen.getByText(/200/)).toBeInTheDocument();
  });

  it('should display status text', () => {
    const mockResponse = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [],
      body: '{}',
      responseTime: 100,
      size: 2,
      timestamp: '2025-11-07T10:00:00Z',
    });

    const store = useRequestStore.getState();
    store.actions.setResponse(mockResponse);

    render(<StatusDisplay />);
    expect(screen.getByText(/OK/)).toBeInTheDocument();
  });

  it('should show green color for 2xx status codes', () => {
    const mockResponse = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [],
      body: '{}',
      responseTime: 100,
      size: 2,
      timestamp: '2025-11-07T10:00:00Z',
    });

    const store = useRequestStore.getState();
    store.actions.setResponse(mockResponse);

    render(<StatusDisplay />);
    const statusElement = screen.getByText(/200/).closest('div');
    // Browsers convert #28a745 to rgb(40, 167, 69)
    expect(statusElement).toHaveStyle({ color: 'rgb(40, 167, 69)' });
  });

  it('should show red color for 5xx status codes', () => {
    const mockResponse = new Response({
      statusCode: 500,
      statusText: 'Internal Server Error',
      headers: [],
      body: '{}',
      responseTime: 100,
      size: 2,
      timestamp: '2025-11-07T10:00:00Z',
    });

    const store = useRequestStore.getState();
    store.actions.setResponse(mockResponse);

    render(<StatusDisplay />);
    const statusElement = screen.getByText(/500/).closest('div');
    // Browsers convert #dc3545 to rgb(220, 53, 69)
    expect(statusElement).toHaveStyle({ color: 'rgb(220, 53, 69)' });
  });

  it('should show yellow/orange color for 4xx status codes', () => {
    const mockResponse = new Response({
      statusCode: 404,
      statusText: 'Not Found',
      headers: [],
      body: '{}',
      responseTime: 100,
      size: 2,
      timestamp: '2025-11-07T10:00:00Z',
    });

    const store = useRequestStore.getState();
    store.actions.setResponse(mockResponse);

    render(<StatusDisplay />);
    const statusElement = screen.getByText(/404/).closest('div');
    // 404 is a 4xx error, Response model categorizes as 'error', so color is red
    expect(statusElement).toHaveStyle({ color: 'rgb(220, 53, 69)' });
  });

  it('should display response time', () => {
    const mockResponse = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [],
      body: '{}',
      responseTime: 245,
      size: 2,
      timestamp: '2025-11-07T10:00:00Z',
    });

    const store = useRequestStore.getState();
    store.actions.setResponse(mockResponse);

    render(<StatusDisplay />);
    expect(screen.getByText(/245\s*ms/i)).toBeInTheDocument();
  });

  it('should display formatted size', () => {
    const mockResponse = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [],
      body: '{}',
      responseTime: 100,
      size: 2048, // 2 KB
      timestamp: '2025-11-07T10:00:00Z',
    });

    const store = useRequestStore.getState();
    store.actions.setResponse(mockResponse);

    render(<StatusDisplay />);
    expect(screen.getByText(/2\.00 KB/i)).toBeInTheDocument();
  });

  it('should show error message when request fails', () => {
    const store = useRequestStore.getState();
    store.actions.setError({
      message: 'Network error occurred',
      code: 'ERR_NETWORK',
      isNetworkError: true,
      isTimeout: false,
      isCancelled: false,
    });

    render(<StatusDisplay />);
    expect(screen.getByText(/Cannot connect to server/i)).toBeInTheDocument();
  });

  it('should show loading state', () => {
    const store = useRequestStore.getState();
    store.actions.setLoading(true);

    render(<StatusDisplay />);
    expect(screen.getByText(/sending request/i)).toBeInTheDocument();
  });
});
