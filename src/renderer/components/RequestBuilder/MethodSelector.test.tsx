/**
 * MethodSelector Component Tests
 *
 * Tests for HTTP method selector component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MethodSelector } from './MethodSelector';
import { useRequestStore } from '../../store/requestStore';
import { HttpMethod } from '../../../types/request.types';

describe('MethodSelector', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useRequestStore.getState();
    store.actions.resetRequest();
  });

  it('should render select dropdown', () => {
    render(<MethodSelector />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('should render all HTTP method options', () => {
    render(<MethodSelector />);

    expect(screen.getByText('GET')).toBeInTheDocument();
    expect(screen.getByText('POST')).toBeInTheDocument();
    expect(screen.getByText('PUT')).toBeInTheDocument();
    expect(screen.getByText('DELETE')).toBeInTheDocument();
  });

  it('should display GET method as default', () => {
    render(<MethodSelector />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('GET');
  });

  it('should update store when method changes', () => {
    render(<MethodSelector />);
    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: 'POST' } });

    const state = useRequestStore.getState();
    expect(state.method).toBe(HttpMethod.POST);
  });

  it('should display current method from store', () => {
    const store = useRequestStore.getState();
    store.actions.setMethod(HttpMethod.PUT);

    render(<MethodSelector />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('PUT');
  });

  it('should allow changing between all methods', () => {
    render(<MethodSelector />);
    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: 'POST' } });
    expect(useRequestStore.getState().method).toBe(HttpMethod.POST);

    fireEvent.change(select, { target: { value: 'PUT' } });
    expect(useRequestStore.getState().method).toBe(HttpMethod.PUT);

    fireEvent.change(select, { target: { value: 'DELETE' } });
    expect(useRequestStore.getState().method).toBe(HttpMethod.DELETE);

    fireEvent.change(select, { target: { value: 'GET' } });
    expect(useRequestStore.getState().method).toBe(HttpMethod.GET);
  });
});
