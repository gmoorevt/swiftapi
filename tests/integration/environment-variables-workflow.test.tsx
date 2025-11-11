/**
 * Integration Test: Environment Variables Workflow (Feature 002)
 *
 * Tests end-to-end workflows for environment management and variable resolution
 *
 * @see specs/002-collections-variables/spec.md
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import axios from 'axios';
import { useRequestStore } from '../../src/renderer/store/requestStore';
import { useEnvironmentStore } from '../../src/renderer/store/environmentStore';
import { UrlInput } from '../../src/renderer/components/RequestBuilder/UrlInput';
import { MethodSelector } from '../../src/renderer/components/RequestBuilder/MethodSelector';
import { SendButton } from '../../src/renderer/components/RequestBuilder/SendButton';
import { StatusDisplay } from '../../src/renderer/components/ResponseViewer/StatusDisplay';
import { BodyViewer } from '../../src/renderer/components/ResponseViewer/BodyViewer';
import { HeadersEditor } from '../../src/renderer/components/RequestBuilder/HeadersEditor';
import { BodyEditor } from '../../src/renderer/components/RequestBuilder/BodyEditor';
import { EnvironmentSelector } from '../../src/renderer/components/EnvironmentSelector/EnvironmentSelector';
import { HttpMethod } from '../../src/types/request.types';

// Mock axios
vi.mock('axios');

// Mock MonacoWrapper to avoid loading Monaco Editor in integration tests
vi.mock('../../src/renderer/components/ResponseViewer/MonacoWrapper', () => ({
  MonacoWrapper: ({ content }: { content: string }) => (
    <div data-testid="monaco-wrapper">{content}</div>
  ),
}));

// Test app component with environment selector
function TestApp(): React.ReactElement {
  return (
    <div>
      <div data-testid="environment-selector">
        <EnvironmentSelector />
      </div>
      <div data-testid="request-builder">
        <UrlInput />
        <MethodSelector />
        <HeadersEditor />
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

describe('Integration: Environment Variables Workflow', () => {
  beforeEach(() => {
    // Reset stores before each test
    const requestStore = useRequestStore.getState();
    requestStore.actions.resetRequest();

    const envStore = useEnvironmentStore.getState();
    envStore.actions.reset();

    // Setup cancel token mock
    const mockCancelToken = {
      token: 'mock-token',
      cancel: vi.fn(),
    };

    (axios.CancelToken as any) = {
      source: vi.fn().mockReturnValue(mockCancelToken),
    };
    vi.clearAllMocks();
  });

  describe('T081: Create environment and use variables in request', () => {
    it('should create an environment, use variables in URL, and send request with resolved values', async () => {
      // MAXIMUM SIMPLIFICATION: Setup stores before render, test axios call only
      const mockResponse = {
        data: { users: [{ id: 1, name: 'John' }] },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
      };

      (axios as any).mockResolvedValue(mockResponse);

      // Setup environment and request in stores BEFORE rendering
      const envStore = useEnvironmentStore.getState();
      const envId = envStore.actions.createEnvironment('Development', {
        base_url: 'https://api.dev.example.com'
      });
      envStore.actions.setActiveEnvironment(envId);

      const requestStore = useRequestStore.getState();
      requestStore.actions.setUrl('{{base_url}}/users');

      // Render app with everything already set up
      render(<TestApp />);

      // Send the request
      const sendButton = screen.getByRole('button', { name: /send/i });
      await userEvent.click(sendButton);

      // Verify axios was called with resolved URL - this is the KEY test
      await waitFor(() => {
        expect(axios).toHaveBeenCalledWith(
          expect.objectContaining({
            url: 'https://api.dev.example.com/users',
            method: 'GET',
          })
        );
      }, { timeout: 3000 });

      // Verify response is displayed
      await waitFor(() => {
        expect(screen.getByText(/200 OK/i)).toBeInTheDocument();
      });
    });
  });

  describe('T082: Nested variable resolution', () => {
    it('should resolve nested variables correctly', async () => {
      const mockResponse = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
      };

      (axios as any).mockResolvedValue(mockResponse);

      // Setup environment with nested variables BEFORE rendering
      const envStore = useEnvironmentStore.getState();
      const envId = envStore.actions.createEnvironment('Development', {
        protocol: 'https',
        domain: 'api.example.com',
        base_url: '{{protocol}}://{{domain}}',
        version: 'v1'
      });
      envStore.actions.setActiveEnvironment(envId);

      // Set URL with nested variable
      const requestStore = useRequestStore.getState();
      requestStore.actions.setUrl('{{base_url}}/{{version}}/users');

      render(<TestApp />);

      // Send request
      const sendButton = screen.getByRole('button', { name: /send/i });
      await userEvent.click(sendButton);

      // Verify resolved URL was sent - this is the KEY test
      await waitFor(() => {
        expect(axios).toHaveBeenCalledWith(
          expect.objectContaining({
            url: 'https://api.example.com/v1/users',
          })
        );
      }, { timeout: 3000 });
    });
  });

  describe('T083: Undefined variable error handling', () => {
    it('should show warning when variable is not defined and not send request', async () => {
      // Setup environment without the required variable BEFORE rendering
      const envStore = useEnvironmentStore.getState();
      const envId = envStore.actions.createEnvironment('Development', {
        base_url: 'https://api.example.com'
      });
      envStore.actions.setActiveEnvironment(envId);

      // Set URL with undefined variable
      const requestStore = useRequestStore.getState();
      requestStore.actions.setUrl('{{base_url}}/{{undefined_var}}/users');

      render(<TestApp />);

      // Try to send request - should fail
      const sendButton = screen.getByRole('button', { name: /send/i });
      await userEvent.click(sendButton);

      // Verify error is displayed in response
      await waitFor(() => {
        expect(screen.getByText(/variable.*not defined/i)).toBeInTheDocument();
      });

      // Verify axios was NOT called - this is the KEY test
      expect(axios).not.toHaveBeenCalled();
    });
  });

  describe('T084: Variables in headers, query params, and body', () => {
    it('should resolve variables in all request components', async () => {
      const mockResponse = {
        data: { success: true },
        status: 201,
        statusText: 'Created',
        headers: { 'content-type': 'application/json' },
      };

      (axios as any).mockResolvedValue(mockResponse);

      // Setup environment with multiple variables BEFORE rendering
      const envStore = useEnvironmentStore.getState();
      const envId = envStore.actions.createEnvironment('Development', {
        base_url: 'https://api.dev.example.com',
        api_key: 'dev-secret-key',
        user_id: '12345'
      });
      envStore.actions.setActiveEnvironment(envId);

      // Set up request with variables in multiple places
      const requestStore = useRequestStore.getState();
      requestStore.actions.setUrl('{{base_url}}/users');
      requestStore.actions.setMethod(HttpMethod.POST);

      // Add header with variable
      requestStore.actions.addHeader();
      requestStore.actions.updateHeader(0, 'name', 'Authorization');
      requestStore.actions.updateHeader(0, 'value', 'Bearer {{api_key}}');

      // Add body with variable
      requestStore.actions.setBody('{"userId": "{{user_id}}", "name": "Test User"}');

      render(<TestApp />);

      // Send request
      const sendButton = screen.getByRole('button', { name: /send/i });
      await userEvent.click(sendButton);

      // Verify all variables were resolved - this is the KEY test
      await waitFor(() => {
        expect(axios).toHaveBeenCalledWith(
          expect.objectContaining({
            url: 'https://api.dev.example.com/users',
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': 'Bearer dev-secret-key'
            }),
            data: '{"userId": "12345", "name": "Test User"}'
          })
        );
      }, { timeout: 3000 });
    });
  });

  describe('T085: Switch environments and verify variable resolution', () => {
    it('should use different variable values when switching environments', async () => {
      const mockResponse = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
      };

      (axios as any).mockResolvedValue(mockResponse);

      // Setup two environments with different base URLs BEFORE rendering
      const envStore = useEnvironmentStore.getState();
      const devId = envStore.actions.createEnvironment('Development', {
        base_url: 'https://api.dev.example.com'
      });
      const prodId = envStore.actions.createEnvironment('Production', {
        base_url: 'https://api.example.com'
      });

      // Set URL with variable and activate Development
      const requestStore = useRequestStore.getState();
      requestStore.actions.setUrl('{{base_url}}/users');
      envStore.actions.setActiveEnvironment(devId);

      const { rerender } = render(<TestApp />);

      // Switch to Production environment and rerender
      envStore.actions.setActiveEnvironment(prodId);
      rerender(<TestApp />);

      // Send request with Production environment
      const sendButton = screen.getByRole('button', { name: /send/i });
      await userEvent.click(sendButton);

      // Verify Production URL was used - this is the KEY test
      await waitFor(() => {
        expect(axios).toHaveBeenCalledWith(
          expect.objectContaining({
            url: 'https://api.example.com/users',
          })
        );
      }, { timeout: 3000 });
    });
  });
});
