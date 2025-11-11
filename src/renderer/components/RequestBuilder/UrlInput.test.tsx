/**
 * UrlInput Component Tests
 *
 * Tests for URL input field component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UrlInput } from './UrlInput';
import { useRequestStore } from '../../store/requestStore';
import { useEnvironmentStore } from '../../store/environmentStore';

describe('UrlInput', () => {
  beforeEach(() => {
    // Reset stores before each test
    const requestStore = useRequestStore.getState();
    requestStore.actions.resetRequest();

    const envStore = useEnvironmentStore.getState();
    envStore.actions.reset();
  });

  it('should render input field', () => {
    render(<UrlInput />);
    const input = screen.getByPlaceholderText(/enter url/i);
    expect(input).toBeInTheDocument();
  });

  it('should display current URL from store', () => {
    const store = useRequestStore.getState();
    store.actions.setUrl('https://api.example.com');

    render(<UrlInput />);
    const input = screen.getByDisplayValue('https://api.example.com');
    expect(input).toBeInTheDocument();
  });

  it('should update store when value changes', () => {
    render(<UrlInput />);
    const input = screen.getByPlaceholderText(/enter url/i);

    fireEvent.change(input, { target: { value: 'https://test.com' } });

    const state = useRequestStore.getState();
    expect(state.url).toBe('https://test.com');
  });

  it('should have type="text" attribute', () => {
    render(<UrlInput />);
    const input = screen.getByPlaceholderText(/enter url/i);
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should clear URL when input is cleared', () => {
    const store = useRequestStore.getState();
    store.actions.setUrl('https://test.com');

    render(<UrlInput />);
    const input = screen.getByDisplayValue('https://test.com');

    fireEvent.change(input, { target: { value: '' } });

    const state = useRequestStore.getState();
    expect(state.url).toBe('');
  });

  describe('Variable resolution hints', () => {
    it('should not show hint when no variables are used', () => {
      const store = useRequestStore.getState();
      store.actions.setUrl('https://api.example.com');

      render(<UrlInput />);

      expect(screen.queryByText(/resolved:/i)).not.toBeInTheDocument();
    });

    it('should not show hint when no active environment', () => {
      const store = useRequestStore.getState();
      store.actions.setUrl('{{base_url}}/users');

      render(<UrlInput />);

      expect(screen.queryByText(/resolved:/i)).not.toBeInTheDocument();
    });

    it('should show resolved URL hint when variables are present', () => {
      const envStore = useEnvironmentStore.getState();
      const envId = envStore.actions.createEnvironment('Development', {
        base_url: 'https://dev.example.com'
      });
      envStore.actions.setActiveEnvironment(envId);

      const requestStore = useRequestStore.getState();
      requestStore.actions.setUrl('{{base_url}}/users');

      render(<UrlInput />);

      expect(screen.getByText(/resolved:/i)).toBeInTheDocument();
      expect(screen.getByText(/https:\/\/dev\.example\.com\/users/i)).toBeInTheDocument();
    });

    it('should show environment name in hint', () => {
      const envStore = useEnvironmentStore.getState();
      const envId = envStore.actions.createEnvironment('Production', {
        base_url: 'https://api.example.com'
      });
      envStore.actions.setActiveEnvironment(envId);

      const requestStore = useRequestStore.getState();
      requestStore.actions.setUrl('{{base_url}}/products');

      render(<UrlInput />);

      expect(screen.getByText(/production/i)).toBeInTheDocument();
    });

    it('should update hint when URL changes', () => {
      const envStore = useEnvironmentStore.getState();
      const envId = envStore.actions.createEnvironment('Development', {
        base_url: 'https://dev.example.com',
        version: 'v1'
      });
      envStore.actions.setActiveEnvironment(envId);

      const requestStore = useRequestStore.getState();
      requestStore.actions.setUrl('{{base_url}}/{{version}}/users');

      const { rerender } = render(<UrlInput />);

      expect(screen.getByText(/https:\/\/dev\.example\.com\/v1\/users/i)).toBeInTheDocument();

      // Change URL
      requestStore.actions.setUrl('{{base_url}}/{{version}}/products');
      rerender(<UrlInput />);

      expect(screen.getByText(/https:\/\/dev\.example\.com\/v1\/products/i)).toBeInTheDocument();
    });

    it('should show error when variable is undefined', () => {
      const envStore = useEnvironmentStore.getState();
      const envId = envStore.actions.createEnvironment('Development', {
        base_url: 'https://dev.example.com'
      });
      envStore.actions.setActiveEnvironment(envId);

      const requestStore = useRequestStore.getState();
      requestStore.actions.setUrl('{{base_url}}/{{undefined_var}}/users');

      render(<UrlInput />);

      expect(screen.getByText(/error:/i)).toBeInTheDocument();
      expect(screen.getByText(/undefined_var.*not defined/i)).toBeInTheDocument();
    });

    it('should handle nested variables', () => {
      const envStore = useEnvironmentStore.getState();
      const envId = envStore.actions.createEnvironment('Development', {
        protocol: 'https',
        domain: 'example.com',
        base_url: '{{protocol}}://{{domain}}'
      });
      envStore.actions.setActiveEnvironment(envId);

      const requestStore = useRequestStore.getState();
      requestStore.actions.setUrl('{{base_url}}/api');

      render(<UrlInput />);

      expect(screen.getByText(/https:\/\/example\.com\/api/i)).toBeInTheDocument();
    });

    it('should clear hint when all variables are removed', () => {
      const envStore = useEnvironmentStore.getState();
      const envId = envStore.actions.createEnvironment('Development', {
        base_url: 'https://dev.example.com'
      });
      envStore.actions.setActiveEnvironment(envId);

      const requestStore = useRequestStore.getState();
      requestStore.actions.setUrl('{{base_url}}/users');

      const { rerender } = render(<UrlInput />);

      expect(screen.getByText(/resolved:/i)).toBeInTheDocument();

      // Remove variables
      requestStore.actions.setUrl('https://api.example.com/users');
      rerender(<UrlInput />);

      expect(screen.queryByText(/resolved:/i)).not.toBeInTheDocument();
    });

    it('should clear hint when environment is deactivated', () => {
      const envStore = useEnvironmentStore.getState();
      const envId = envStore.actions.createEnvironment('Development', {
        base_url: 'https://dev.example.com'
      });
      envStore.actions.setActiveEnvironment(envId);

      const requestStore = useRequestStore.getState();
      requestStore.actions.setUrl('{{base_url}}/users');

      const { rerender } = render(<UrlInput />);

      expect(screen.getByText(/resolved:/i)).toBeInTheDocument();

      // Deactivate environment
      envStore.actions.setActiveEnvironment(null);
      rerender(<UrlInput />);

      expect(screen.queryByText(/resolved:/i)).not.toBeInTheDocument();
    });
  });
});
