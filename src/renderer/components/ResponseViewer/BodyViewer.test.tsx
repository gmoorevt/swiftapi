/**
 * BodyViewer Component Tests
 *
 * Tests for response body viewer component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BodyViewer } from './BodyViewer';
import { useRequestStore } from '../../store/requestStore';
import { Response } from '../../../models/Response';

describe('BodyViewer', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useRequestStore.getState();
    store.actions.resetRequest();
  });

  it('should show empty state when no response', () => {
    render(<BodyViewer />);
    expect(screen.getByText(/no response/i)).toBeInTheDocument();
  });

  it('should display plain text response body', () => {
    const mockResponse = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [
        { name: 'content-type', value: 'text/plain', enabled: true },
      ],
      body: 'Hello World',
      responseTime: 100,
      size: 11,
      timestamp: '2025-11-07T10:00:00Z',
    });

    const store = useRequestStore.getState();
    store.actions.setResponse(mockResponse);

    render(<BodyViewer />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should display JSON response body', () => {
    const mockResponse = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [
        { name: 'content-type', value: 'application/json', enabled: true },
      ],
      body: '{"message": "success", "data": {"id": 1}}',
      responseTime: 100,
      size: 40,
      timestamp: '2025-11-07T10:00:00Z',
    });

    const store = useRequestStore.getState();
    store.actions.setResponse(mockResponse);

    render(<BodyViewer />);
    expect(screen.getByText(/message/)).toBeInTheDocument();
    expect(screen.getByText(/success/)).toBeInTheDocument();
  });

  it('should render in a scrollable container', () => {
    const mockResponse = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [],
      body: 'Response body content',
      responseTime: 100,
      size: 21,
      timestamp: '2025-11-07T10:00:00Z',
    });

    const store = useRequestStore.getState();
    store.actions.setResponse(mockResponse);

    render(<BodyViewer />);
    const container = screen.getByText('Response body content').closest('div');
    expect(container).toHaveStyle({ overflowY: 'auto' });
  });

  it('should use monospace font for body content', () => {
    const mockResponse = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [],
      body: 'Test content',
      responseTime: 100,
      size: 12,
      timestamp: '2025-11-07T10:00:00Z',
    });

    const store = useRequestStore.getState();
    store.actions.setResponse(mockResponse);

    render(<BodyViewer />);
    const container = screen.getByText('Test content').closest('pre');
    // Check that fontFamily includes one of the monospace fonts
    const style = container && window.getComputedStyle(container);
    const fontFamily = style?.fontFamily.toLowerCase() || '';
    expect(fontFamily).toContain('monaco');
  });
});
