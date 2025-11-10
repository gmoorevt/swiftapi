/**
 * Integration Test: POST Request Workflow
 *
 * Tests User Story 2 (P2): Send POST Request with Body
 * End-to-end workflow from entering URL to sending POST with JSON body
 *
 * @see specs/001-basic-request-builder/spec.md - User Story 2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import axios from 'axios';
import { useRequestStore } from '../../src/renderer/store/requestStore';
import { UrlInput } from '../../src/renderer/components/RequestBuilder/UrlInput';
import { MethodSelector } from '../../src/renderer/components/RequestBuilder/MethodSelector';
import { BodyEditor } from '../../src/renderer/components/RequestBuilder/BodyEditor';
import { SendButton } from '../../src/renderer/components/RequestBuilder/SendButton';
import { StatusDisplay } from '../../src/renderer/components/ResponseViewer/StatusDisplay';
import { BodyViewer } from '../../src/renderer/components/ResponseViewer/BodyViewer';
import { BodyType } from '../../src/types/request.types';

// Mock axios
vi.mock('axios');

// Mock MonacoWrapper to avoid loading Monaco Editor in integration tests
vi.mock('../../src/renderer/components/ResponseViewer/MonacoWrapper', () => ({
  MonacoWrapper: ({ content }: { content: string }) => (
    <div data-testid="monaco-wrapper">{content}</div>
  ),
}));

// Test app component with all request builder features
function TestApp(): React.ReactElement {
  return (
    <div>
      <div data-testid="request-builder">
        <UrlInput />
        <MethodSelector />
        <BodyEditor />
        <SendButton />
      </div>
      <div data-testid="response-viewer">
        <StatusDisplay />
        <BodyViewer />
      </div>
    </div>
  );
}

describe('Integration: POST Request Workflow', () => {
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

  it('should complete full workflow: enter URL → select POST → enter JSON → send → display response', async () => {
    // Mock successful response
    const mockResponse = {
      status: 201,
      statusText: 'Created',
      headers: {
        'content-type': 'application/json',
      },
      data: {
        id: 101,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: '2024-01-01T00:00:00Z',
      },
    };

    (axios as any).mockResolvedValueOnce(mockResponse);

    // Render the app
    render(<TestApp />);

    // Step 1: User enters URL
    const urlInput = screen.getByPlaceholderText(/enter url/i);
    fireEvent.change(urlInput, {
      target: { value: 'https://api.example.com/users' },
    });

    expect(urlInput).toHaveValue('https://api.example.com/users');

    // Step 2: User selects POST method
    const methodSelector = screen.getByRole('combobox', { name: '' });
    fireEvent.change(methodSelector, { target: { value: 'POST' } });
    expect(methodSelector).toHaveValue('POST');

    // Step 3: Verify body editor appears
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter request body/i)).toBeInTheDocument();
    });

    // Step 4: User enters JSON body
    const bodyTextarea = screen.getByPlaceholderText(/enter request body/i);
    const jsonBody = JSON.stringify({
      name: 'John Doe',
      email: 'john@example.com',
    });

    fireEvent.change(bodyTextarea, { target: { value: jsonBody } });
    expect(bodyTextarea).toHaveValue(jsonBody);

    // Step 5: Verify no validation error for valid JSON
    expect(screen.queryByText(/Invalid JSON:/i)).not.toBeInTheDocument();

    // Step 6: User clicks Send button
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).not.toBeDisabled();
    fireEvent.click(sendButton);

    // Step 7: Verify loading state
    await waitFor(() => {
      expect(screen.getByText(/sending request/i)).toBeInTheDocument();
    });

    // Step 8: Wait for response to be displayed
    await waitFor(
      () => {
        expect(screen.getByText(/201/)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Step 9: Verify response details are displayed
    expect(screen.getByText(/201/)).toBeInTheDocument();
    // Check for unique field from response (id:101 and createdAt are only in response)
    expect(screen.getByText(/2024-01-01T00:00:00Z/)).toBeInTheDocument();

    // Step 10: Verify axios was called with correct parameters
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.example.com/users',
        method: 'POST',
        data: jsonBody,
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        timeout: 30000,
      })
    );
  });

  it('should show validation error for invalid JSON in body', async () => {
    render(<TestApp />);

    // Select POST method
    const methodSelector = screen.getByRole('combobox', { name: '' });
    fireEvent.change(methodSelector, { target: { value: 'POST' } });

    // Wait for body editor to appear
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter request body/i)).toBeInTheDocument();
    });

    // Enter invalid JSON
    const bodyTextarea = screen.getByPlaceholderText(/enter request body/i);
    fireEvent.change(bodyTextarea, { target: { value: '{invalid json}' } });

    // Verify validation error is shown
    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON:/i)).toBeInTheDocument();
    });

    // Send button should still work (validation is just a warning)
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).not.toBeDisabled();
  });

  it('should send POST request with form-data body type', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: { success: true },
    };

    (axios as any).mockResolvedValueOnce(mockResponse);

    render(<TestApp />);

    // Enter URL and select POST
    const urlInput = screen.getByPlaceholderText(/enter url/i);
    fireEvent.change(urlInput, {
      target: { value: 'https://api.example.com/form' },
    });

    const methodSelector = screen.getByRole('combobox', { name: '' });
    fireEvent.change(methodSelector, { target: { value: 'POST' } });

    // Wait for body editor
    await waitFor(() => {
      expect(screen.getByLabelText(/body type/i)).toBeInTheDocument();
    });

    // Change body type to form-data
    const bodyTypeSelect = screen.getByLabelText(/body type/i);
    fireEvent.change(bodyTypeSelect, { target: { value: BodyType.FORM_DATA } });

    // Enter form data
    const bodyTextarea = screen.getByPlaceholderText(/enter request body/i);
    fireEvent.change(bodyTextarea, {
      target: { value: 'key1=value1&key2=value2' },
    });

    // Send request
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    // Wait for response
    await waitFor(
      () => {
        expect(screen.getByText(/200/)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify Content-Type header was set correctly
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      })
    );
  });

  it('should send POST request with raw text body type', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: { received: true },
    };

    (axios as any).mockResolvedValueOnce(mockResponse);

    render(<TestApp />);

    // Enter URL and select POST
    const urlInput = screen.getByPlaceholderText(/enter url/i);
    fireEvent.change(urlInput, {
      target: { value: 'https://api.example.com/text' },
    });

    const methodSelector = screen.getByRole('combobox', { name: '' });
    fireEvent.change(methodSelector, { target: { value: 'POST' } });

    // Wait for body editor
    await waitFor(() => {
      expect(screen.getByLabelText(/body type/i)).toBeInTheDocument();
    });

    // Change body type to raw
    const bodyTypeSelect = screen.getByLabelText(/body type/i);
    fireEvent.change(bodyTypeSelect, { target: { value: BodyType.RAW } });

    // Enter raw text
    const bodyTextarea = screen.getByPlaceholderText(/enter request body/i);
    fireEvent.change(bodyTextarea, {
      target: { value: 'This is plain text content' },
    });

    // Send request
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    // Wait for response
    await waitFor(
      () => {
        expect(screen.getByText(/200/)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify Content-Type header was set correctly
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'text/plain',
        }),
        data: 'This is plain text content',
      })
    );
  });

  it('should send PUT request with JSON body', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: { id: 1, name: 'Updated Name' },
    };

    (axios as any).mockResolvedValueOnce(mockResponse);

    render(<TestApp />);

    // Enter URL
    const urlInput = screen.getByPlaceholderText(/enter url/i);
    fireEvent.change(urlInput, {
      target: { value: 'https://api.example.com/users/1' },
    });

    // Select PUT method
    const methodSelector = screen.getByRole('combobox', { name: '' });
    fireEvent.change(methodSelector, { target: { value: 'PUT' } });

    // Wait for body editor to appear
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter request body/i)).toBeInTheDocument();
    });

    // Enter JSON body
    const bodyTextarea = screen.getByPlaceholderText(/enter request body/i);
    const jsonBody = '{"name":"Updated Name"}';
    fireEvent.change(bodyTextarea, { target: { value: jsonBody } });

    // Send request
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    // Wait for response
    await waitFor(
      () => {
        expect(screen.getByText(/200/)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify axios was called with PUT method
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.example.com/users/1',
        method: 'PUT',
        data: jsonBody,
      })
    );
  });

  it('should hide body editor when switching from POST to GET', async () => {
    render(<TestApp />);

    // Select POST method
    const methodSelector = screen.getByRole('combobox', { name: '' });
    fireEvent.change(methodSelector, { target: { value: 'POST' } });

    // Wait for body editor to appear
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter request body/i)).toBeInTheDocument();
    });

    // Switch to GET method
    fireEvent.change(methodSelector, { target: { value: 'GET' } });

    // Body editor should disappear
    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/enter request body/i)).not.toBeInTheDocument();
    });
  });

  it('should handle network errors for POST requests', async () => {
    const networkError = new Error('Network Error');
    (networkError as any).isAxiosError = true;
    (networkError as any).response = undefined;

    (axios as any).mockRejectedValueOnce(networkError);
    (axios.isAxiosError as any) = vi.fn(() => true);

    render(<TestApp />);

    // Setup POST request
    const urlInput = screen.getByPlaceholderText(/enter url/i);
    fireEvent.change(urlInput, {
      target: { value: 'https://api.example.com/users' },
    });

    const methodSelector = screen.getByRole('combobox', { name: '' });
    fireEvent.change(methodSelector, { target: { value: 'POST' } });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter request body/i)).toBeInTheDocument();
    });

    const bodyTextarea = screen.getByPlaceholderText(/enter request body/i);
    fireEvent.change(bodyTextarea, { target: { value: '{"test":"data"}' } });

    // Send request
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
});
