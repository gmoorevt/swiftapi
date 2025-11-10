/**
 * UrlInput Component Tests
 *
 * Tests for URL input field component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UrlInput } from './UrlInput';
import { useRequestStore } from '../../store/requestStore';

describe('UrlInput', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useRequestStore.getState();
    store.actions.resetRequest();
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
});
