/**
 * BodyViewer Component Tests
 *
 * Tests for response body viewer component with Monaco Editor
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BodyViewer } from './BodyViewer';
import { useRequestStore } from '../../store/requestStore';
import { Response } from '../../../models/Response';

// Mock MonacoWrapper to avoid loading Monaco Editor in tests
vi.mock('./MonacoWrapper', () => ({
  MonacoWrapper: ({ content, language }: { content: string; language: string }) => (
    <div data-testid="monaco-wrapper" data-language={language}>
      {content}
    </div>
  ),
}));

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

  it('should use MonacoWrapper for displaying response', () => {
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
    const monacoWrapper = screen.getByTestId('monaco-wrapper');
    expect(monacoWrapper).toBeInTheDocument();
    expect(monacoWrapper).toHaveTextContent('Response body content');
  });

  it('should use correct language for JSON responses', () => {
    const mockResponse = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [
        { name: 'content-type', value: 'application/json', enabled: true },
      ],
      body: '{"test": "value"}',
      responseTime: 100,
      size: 17,
      timestamp: '2025-11-07T10:00:00Z',
    });

    const store = useRequestStore.getState();
    store.actions.setResponse(mockResponse);

    render(<BodyViewer />);
    const monacoWrapper = screen.getByTestId('monaco-wrapper');
    expect(monacoWrapper).toHaveAttribute('data-language', 'json');
  });

  it('should use correct language for plain text responses', () => {
    const mockResponse = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [
        { name: 'content-type', value: 'text/plain', enabled: true },
      ],
      body: 'Plain text content',
      responseTime: 100,
      size: 18,
      timestamp: '2025-11-07T10:00:00Z',
    });

    const store = useRequestStore.getState();
    store.actions.setResponse(mockResponse);

    render(<BodyViewer />);
    const monacoWrapper = screen.getByTestId('monaco-wrapper');
    expect(monacoWrapper).toHaveAttribute('data-language', 'plaintext');
  });
});
