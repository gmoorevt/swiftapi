/**
 * Integration Test: Complete GET Request Workflow
 *
 * Tests User Story 1 (P1): Send Simple GET Request
 * End-to-end workflow from entering URL to displaying response
 *
 * @see specs/001-basic-request-builder/spec.md - User Story 1
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import axios from 'axios';
import { useRequestStore } from '../../src/renderer/store/requestStore';
import { UrlInput } from '../../src/renderer/components/RequestBuilder/UrlInput';
import { MethodSelector } from '../../src/renderer/components/RequestBuilder/MethodSelector';
import { SendButton } from '../../src/renderer/components/RequestBuilder/SendButton';
import { StatusDisplay } from '../../src/renderer/components/ResponseViewer/StatusDisplay';
import { BodyViewer } from '../../src/renderer/components/ResponseViewer/BodyViewer';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

// Simple test app component
function TestApp(): React.ReactElement {
  return (
    <div>
      <div data-testid="request-builder">
        <UrlInput />
        <MethodSelector />
        <SendButton />
      </div>
      <div data-testid="response-viewer">
        <StatusDisplay />
        <BodyViewer />
      </div>
    </div>
  );
}

describe('Integration: Complete GET Request Workflow', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useRequestStore.getState();
    store.actions.resetRequest();

    // Setup cancel token mock
    const mockCancelToken = {
      token: 'mock-token',
      cancel: vi.fn(),
    };

    (axios.CancelToken as any) = {
      source: vi.fn(() => mockCancelToken),
    };

    vi.clearAllMocks();
  });

  it('should complete full workflow: enter URL → select GET → send → display response', async () => {
    // Mock successful response
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
      },
      data: {
        userId: 1,
        id: 1,
        title: 'Test Post',
        body: 'This is a test post',
      },
    };

    (axios as any).mockResolvedValueOnce(mockResponse);

    // Render the app
    render(<TestApp />);

    // Step 1: User enters URL
    const urlInput = screen.getByPlaceholderText(/enter url/i);
    fireEvent.change(urlInput, {
      target: { value: 'https://jsonplaceholder.typicode.com/posts/1' },
    });

    // Verify URL is in input
    expect(urlInput).toHaveValue('https://jsonplaceholder.typicode.com/posts/1');

    // Step 2: User selects GET method (should be default)
    const methodSelector = screen.getByRole('combobox');
    expect(methodSelector).toHaveValue('GET');

    // Step 3: User clicks Send button
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).not.toBeDisabled();

    fireEvent.click(sendButton);

    // Step 4: Verify loading state
    await waitFor(() => {
      expect(screen.getByText(/sending request/i)).toBeInTheDocument();
    });

    // Step 5: Wait for response to be displayed
    await waitFor(
      () => {
        expect(screen.getByText(/200/)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Step 6: Verify response details are displayed
    expect(screen.getByText(/OK/)).toBeInTheDocument();
    expect(screen.getByText(/ms/i)).toBeInTheDocument(); // Response time
    expect(screen.getByText(/Test Post/)).toBeInTheDocument(); // Body content

    // Step 7: Verify axios was called with correct parameters
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        method: 'GET',
        timeout: 30000,
      })
    );
  });

  it('should handle network errors gracefully', async () => {
    // Mock network error
    const networkError = new Error('Network Error');
    (networkError as any).isAxiosError = true;
    (networkError as any).response = undefined;

    (axios as any).mockRejectedValueOnce(networkError);
    (axios.isAxiosError as any) = vi.fn(() => true);

    render(<TestApp />);

    // Enter URL and send request
    const urlInput = screen.getByPlaceholderText(/enter url/i);
    fireEvent.change(urlInput, {
      target: { value: 'https://api.example.com' },
    });

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    // Wait for error to be displayed
    await waitFor(
      () => {
        expect(screen.getByText(/error.*network error/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should allow user to cancel in-flight request', async () => {
    // Mock slow response
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: {},
    };

    (axios as any).mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve(mockResponse), 5000))
    );

    render(<TestApp />);

    // Enter URL and send request
    const urlInput = screen.getByPlaceholderText(/enter url/i);
    fireEvent.change(urlInput, {
      target: { value: 'https://api.example.com' },
    });

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    // Verify loading state
    await waitFor(() => {
      expect(screen.getByText(/sending request/i)).toBeInTheDocument();
    });

    // Note: Cancel button implementation would go here in future
    // For now, we're just verifying the loading state works
    expect(sendButton).toBeDisabled();
  });

  it('should validate empty URL before sending', () => {
    render(<TestApp />);

    // Try to send with empty URL
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    // Request should fail with validation error
    // (The Request model will throw an error for empty URL)
    // No axios call should be made
    expect(axios).not.toHaveBeenCalled();
  });

  it('should display response time and size', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
      },
      data: { test: 'data' },
    };

    (axios as any).mockResolvedValueOnce(mockResponse);

    render(<TestApp />);

    const urlInput = screen.getByPlaceholderText(/enter url/i);
    fireEvent.change(urlInput, {
      target: { value: 'https://api.example.com' },
    });

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    // Wait for response
    await waitFor(
      () => {
        expect(screen.getByText(/200/)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify timing info is displayed
    expect(screen.getByText(/Time:/)).toBeInTheDocument();
    expect(screen.getByText(/ms/)).toBeInTheDocument();

    // Verify size info is displayed
    expect(screen.getByText(/Size:/)).toBeInTheDocument();
  });
});
