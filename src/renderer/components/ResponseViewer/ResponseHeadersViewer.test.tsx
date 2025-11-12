/**
 * ResponseHeadersViewer Component Tests
 *
 * Tests for response headers viewer component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResponseHeadersViewer } from './ResponseHeadersViewer';
import { useRequestStore } from '../../store/requestStore';
import { Response } from '../../../models/Response';

describe('ResponseHeadersViewer', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useRequestStore.getState();
    store.actions.resetRequest();
  });

  it('should show empty state when no response', () => {
    render(<ResponseHeadersViewer />);
    expect(screen.getByText(/no response headers/i)).toBeInTheDocument();
  });

  it('should display response headers in a table', () => {
    const mockResponse = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [
        { name: 'content-type', value: 'application/json', enabled: true },
        { name: 'content-length', value: '1234', enabled: true },
      ],
      body: '{}',
      responseTime: 100,
      size: 2,
      timestamp: '2025-11-07T10:00:00Z',
    });

    const store = useRequestStore.getState();
    store.actions.setResponse(mockResponse);

    render(<ResponseHeadersViewer />);

    expect(screen.getByText('content-type')).toBeInTheDocument();
    expect(screen.getByText('application/json')).toBeInTheDocument();
    expect(screen.getByText('content-length')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('should display header count', () => {
    const mockResponse = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [
        { name: 'content-type', value: 'application/json', enabled: true },
        { name: 'content-length', value: '1234', enabled: true },
        { name: 'server', value: 'nginx', enabled: true },
      ],
      body: '{}',
      responseTime: 100,
      size: 2,
      timestamp: '2025-11-07T10:00:00Z',
    });

    const store = useRequestStore.getState();
    store.actions.setResponse(mockResponse);

    render(<ResponseHeadersViewer />);
    expect(screen.getByText(/3 headers/i)).toBeInTheDocument();
  });

  it('should filter headers based on search input', async () => {
    const user = userEvent.setup();
    const mockResponse = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [
        { name: 'content-type', value: 'application/json', enabled: true },
        { name: 'content-length', value: '1234', enabled: true },
        { name: 'server', value: 'nginx', enabled: true },
      ],
      body: '{}',
      responseTime: 100,
      size: 2,
      timestamp: '2025-11-07T10:00:00Z',
    });

    const store = useRequestStore.getState();
    store.actions.setResponse(mockResponse);

    render(<ResponseHeadersViewer />);

    const searchInput = screen.getByPlaceholderText(/search headers/i);
    await user.type(searchInput, 'content');

    // Should show headers containing "content"
    expect(screen.getByText('content-type')).toBeInTheDocument();
    expect(screen.getByText('content-length')).toBeInTheDocument();

    // Should not show "server"
    expect(screen.queryByText('server')).not.toBeInTheDocument();
  });

  it('should filter headers case-insensitively', async () => {
    const user = userEvent.setup();
    const mockResponse = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [
        { name: 'Content-Type', value: 'application/json', enabled: true },
        { name: 'Server', value: 'nginx', enabled: true },
      ],
      body: '{}',
      responseTime: 100,
      size: 2,
      timestamp: '2025-11-07T10:00:00Z',
    });

    const store = useRequestStore.getState();
    store.actions.setResponse(mockResponse);

    render(<ResponseHeadersViewer />);

    const searchInput = screen.getByPlaceholderText(/search headers/i);
    await user.type(searchInput, 'CONTENT');

    expect(screen.getByText('Content-Type')).toBeInTheDocument();
    expect(screen.queryByText('Server')).not.toBeInTheDocument();
  });

  it('should show "no matching headers" when filter returns no results', async () => {
    const user = userEvent.setup();
    const mockResponse = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [
        { name: 'content-type', value: 'application/json', enabled: true },
      ],
      body: '{}',
      responseTime: 100,
      size: 2,
      timestamp: '2025-11-07T10:00:00Z',
    });

    const store = useRequestStore.getState();
    store.actions.setResponse(mockResponse);

    render(<ResponseHeadersViewer />);

    const searchInput = screen.getByPlaceholderText(/search headers/i);
    await user.type(searchInput, 'nonexistent');

    expect(screen.getByText(/no matching headers/i)).toBeInTheDocument();
  });

  it('should display headers in table format with proper structure', () => {
    const mockResponse = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [
        { name: 'content-type', value: 'application/json', enabled: true },
      ],
      body: '{}',
      responseTime: 100,
      size: 2,
      timestamp: '2025-11-07T10:00:00Z',
    });

    const store = useRequestStore.getState();
    store.actions.setResponse(mockResponse);

    render(<ResponseHeadersViewer />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    // Check table headers
    expect(screen.getByText('Header Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('should handle empty headers array', () => {
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

    render(<ResponseHeadersViewer />);
    expect(screen.getByText(/0 headers/i)).toBeInTheDocument();
  });
});
