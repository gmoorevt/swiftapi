/**
 * Integration Test: Custom Headers Workflow
 *
 * Tests User Story 3 (P3): Add Custom Headers
 * End-to-end workflow from adding headers to sending request with headers
 *
 * @see specs/001-basic-request-builder/spec.md - User Story 3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import axios from 'axios';
import { useRequestStore } from '../../src/renderer/store/requestStore';
import { UrlInput } from '../../src/renderer/components/RequestBuilder/UrlInput';
import { MethodSelector } from '../../src/renderer/components/RequestBuilder/MethodSelector';
import { HeadersEditor } from '../../src/renderer/components/RequestBuilder/HeadersEditor';
import { SendButton } from '../../src/renderer/components/RequestBuilder/SendButton';
import { StatusDisplay } from '../../src/renderer/components/ResponseViewer/StatusDisplay';

// Mock axios
vi.mock('axios');

// Test app component with headers editor
function TestApp(): React.ReactElement {
  return (
    <div>
      <div data-testid="request-builder">
        <UrlInput />
        <MethodSelector />
        <HeadersEditor />
        <SendButton />
      </div>
      <div data-testid="response-viewer">
        <StatusDisplay />
      </div>
    </div>
  );
}

describe('Integration: Custom Headers Workflow', () => {
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

  it('should complete full workflow: add Authorization header → send request → verify header in request', async () => {
    // Mock successful response
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
      },
      data: { authenticated: true },
    };

    (axios as any).mockResolvedValueOnce(mockResponse);

    // Render the app
    render(<TestApp />);

    // Step 1: User enters URL
    const urlInput = screen.getByPlaceholderText(/enter url/i);
    fireEvent.change(urlInput, {
      target: { value: 'https://api.example.com/protected' },
    });

    // Step 2: User adds a header
    const addHeaderButton = screen.getByRole('button', { name: /add header/i });
    fireEvent.click(addHeaderButton);

    // Step 3: User enters header name and value
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/header name/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/header name/i);
    const valueInput = screen.getByPlaceholderText(/header value/i);

    fireEvent.change(nameInput, { target: { value: 'Authorization' } });
    fireEvent.change(valueInput, { target: { value: 'Bearer token123' } });

    // Step 4: User clicks Send button
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    // Step 5: Wait for response
    await waitFor(
      () => {
        expect(screen.getByText(/200/)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Step 6: Verify axios was called with the Authorization header
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.example.com/protected',
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer token123',
        }),
      })
    );
  });

  it('should add multiple custom headers to request', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: {},
    };

    (axios as any).mockResolvedValueOnce(mockResponse);

    render(<TestApp />);

    // Enter URL
    const urlInput = screen.getByPlaceholderText(/enter url/i);
    fireEvent.change(urlInput, {
      target: { value: 'https://api.example.com' },
    });

    // Add first header
    const addHeaderButton = screen.getByRole('button', { name: /add header/i });
    fireEvent.click(addHeaderButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/header name/i)).toBeInTheDocument();
    });

    const nameInputs1 = screen.getAllByPlaceholderText(/header name/i);
    const valueInputs1 = screen.getAllByPlaceholderText(/header value/i);

    fireEvent.change(nameInputs1[0]!, { target: { value: 'X-API-Key' } });
    fireEvent.change(valueInputs1[0]!, { target: { value: 'secret-key-123' } });

    // Add second header
    fireEvent.click(addHeaderButton);

    await waitFor(() => {
      const nameInputs = screen.getAllByPlaceholderText(/header name/i);
      expect(nameInputs).toHaveLength(2);
    });

    const nameInputs2 = screen.getAllByPlaceholderText(/header name/i);
    const valueInputs2 = screen.getAllByPlaceholderText(/header value/i);

    fireEvent.change(nameInputs2[1]!, { target: { value: 'X-Request-ID' } });
    fireEvent.change(valueInputs2[1]!, { target: { value: 'req-abc-123' } });

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

    // Verify both headers were sent
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-API-Key': 'secret-key-123',
          'X-Request-ID': 'req-abc-123',
        }),
      })
    );
  });

  it('should not send disabled headers', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: {},
    };

    (axios as any).mockResolvedValueOnce(mockResponse);

    render(<TestApp />);

    // Enter URL
    const urlInput = screen.getByPlaceholderText(/enter url/i);
    fireEvent.change(urlInput, {
      target: { value: 'https://api.example.com' },
    });

    // Add two headers
    const addHeaderButton = screen.getByRole('button', { name: /add header/i });
    fireEvent.click(addHeaderButton);
    fireEvent.click(addHeaderButton);

    await waitFor(() => {
      const nameInputs = screen.getAllByPlaceholderText(/header name/i);
      expect(nameInputs).toHaveLength(2);
    });

    const nameInputs = screen.getAllByPlaceholderText(/header name/i);
    const valueInputs = screen.getAllByPlaceholderText(/header value/i);

    // Set up first header (enabled)
    fireEvent.change(nameInputs[0]!, { target: { value: 'X-Enabled' } });
    fireEvent.change(valueInputs[0]!, { target: { value: 'enabled-value' } });

    // Set up second header (will be disabled)
    fireEvent.change(nameInputs[1]!, { target: { value: 'X-Disabled' } });
    fireEvent.change(valueInputs[1]!, { target: { value: 'disabled-value' } });

    // Disable the second header
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]!); // Uncheck second header

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

    // Verify only enabled header was sent
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Enabled': 'enabled-value',
        }),
      })
    );

    // Verify disabled header was NOT sent
    const callArgs = (axios as any).mock.calls[0][0];
    expect(callArgs.headers).not.toHaveProperty('X-Disabled');
  });

  it('should allow removing headers before sending', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: {},
    };

    (axios as any).mockResolvedValueOnce(mockResponse);

    render(<TestApp />);

    // Enter URL
    const urlInput = screen.getByPlaceholderText(/enter url/i);
    fireEvent.change(urlInput, {
      target: { value: 'https://api.example.com' },
    });

    // Add three headers
    const addHeaderButton = screen.getByRole('button', { name: /add header/i });
    fireEvent.click(addHeaderButton);
    fireEvent.click(addHeaderButton);
    fireEvent.click(addHeaderButton);

    await waitFor(() => {
      const nameInputs = screen.getAllByPlaceholderText(/header name/i);
      expect(nameInputs).toHaveLength(3);
    });

    const nameInputs = screen.getAllByPlaceholderText(/header name/i);
    const valueInputs = screen.getAllByPlaceholderText(/header value/i);

    fireEvent.change(nameInputs[0]!, { target: { value: 'Header-1' } });
    fireEvent.change(valueInputs[0]!, { target: { value: 'value-1' } });
    fireEvent.change(nameInputs[1]!, { target: { value: 'Header-2' } });
    fireEvent.change(valueInputs[1]!, { target: { value: 'value-2' } });
    fireEvent.change(nameInputs[2]!, { target: { value: 'Header-3' } });
    fireEvent.change(valueInputs[2]!, { target: { value: 'value-3' } });

    // Remove the second header
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[1]!);

    // Wait for header to be removed
    await waitFor(() => {
      const nameInputsAfterDelete = screen.getAllByPlaceholderText(/header name/i);
      expect(nameInputsAfterDelete).toHaveLength(2);
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

    // Verify only remaining headers were sent
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          'Header-1': 'value-1',
          'Header-3': 'value-3',
        }),
      })
    );

    // Verify removed header was NOT sent
    const callArgs = (axios as any).mock.calls[0][0];
    expect(callArgs.headers).not.toHaveProperty('Header-2');
  });

  it('should work with empty headers list', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: {},
    };

    (axios as any).mockResolvedValueOnce(mockResponse);

    render(<TestApp />);

    // Enter URL
    const urlInput = screen.getByPlaceholderText(/enter url/i);
    fireEvent.change(urlInput, {
      target: { value: 'https://api.example.com' },
    });

    // Don't add any headers, just send request
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    // Wait for response
    await waitFor(
      () => {
        expect(screen.getByText(/200/)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify request was sent (axios was called)
    expect(axios).toHaveBeenCalled();
  });

  it('should persist headers between requests', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: {},
    };

    (axios as any).mockResolvedValue(mockResponse);

    render(<TestApp />);

    // Add a header
    const addHeaderButton = screen.getByRole('button', { name: /add header/i });
    fireEvent.click(addHeaderButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/header name/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/header name/i);
    const valueInput = screen.getByPlaceholderText(/header value/i);

    fireEvent.change(nameInput, { target: { value: 'X-Persistent' } });
    fireEvent.change(valueInput, { target: { value: 'persistent-value' } });

    // Send first request
    const urlInput = screen.getByPlaceholderText(/enter url/i);
    fireEvent.change(urlInput, {
      target: { value: 'https://api.example.com/endpoint1' },
    });

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/200/)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Send second request with different URL
    fireEvent.change(urlInput, {
      target: { value: 'https://api.example.com/endpoint2' },
    });

    fireEvent.click(sendButton);

    await waitFor(() => {
      expect((axios as any).mock.calls).toHaveLength(2);
    }, { timeout: 3000 });

    // Verify both requests had the same header
    expect((axios as any).mock.calls[0][0].headers).toHaveProperty(
      'X-Persistent',
      'persistent-value'
    );
    expect((axios as any).mock.calls[1][0].headers).toHaveProperty(
      'X-Persistent',
      'persistent-value'
    );
  });
});
