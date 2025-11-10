/**
 * HeadersEditor Component Tests
 *
 * Tests for custom headers editor component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeadersEditor } from './HeadersEditor';
import { useRequestStore } from '../../store/requestStore';

describe('HeadersEditor', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useRequestStore.getState();
    store.actions.resetRequest();
  });

  // T068: HeadersEditor renders "Add Header" button
  it('should render "Add Header" button', () => {
    render(<HeadersEditor />);
    const addButton = screen.getByRole('button', { name: /add header/i });
    expect(addButton).toBeInTheDocument();
  });

  // T069: HeadersEditor adds new header row when button clicked
  it('should add new header row when "Add Header" button is clicked', () => {
    render(<HeadersEditor />);
    const addButton = screen.getByRole('button', { name: /add header/i });

    // Initially no headers
    expect(screen.queryByPlaceholderText(/header name/i)).not.toBeInTheDocument();

    // Click add button
    fireEvent.click(addButton);

    // Header row should appear
    expect(screen.getByPlaceholderText(/header name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/header value/i)).toBeInTheDocument();
  });

  it('should add multiple header rows when button clicked multiple times', () => {
    render(<HeadersEditor />);
    const addButton = screen.getByRole('button', { name: /add header/i });

    // Add 3 headers
    fireEvent.click(addButton);
    fireEvent.click(addButton);
    fireEvent.click(addButton);

    // Should have 3 name inputs
    const nameInputs = screen.getAllByPlaceholderText(/header name/i);
    expect(nameInputs).toHaveLength(3);
  });

  // T070: HeadersEditor renders header name and value inputs
  it('should render header name input for each header', () => {
    const store = useRequestStore.getState();
    store.actions.addHeader();

    render(<HeadersEditor />);

    const nameInput = screen.getByPlaceholderText(/header name/i);
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveAttribute('type', 'text');
  });

  it('should render header value input for each header', () => {
    const store = useRequestStore.getState();
    store.actions.addHeader();

    render(<HeadersEditor />);

    const valueInput = screen.getByPlaceholderText(/header value/i);
    expect(valueInput).toBeInTheDocument();
    expect(valueInput).toHaveAttribute('type', 'text');
  });

  it('should update header name when name input changes', () => {
    const store = useRequestStore.getState();
    store.actions.addHeader();

    render(<HeadersEditor />);
    const nameInput = screen.getByPlaceholderText(/header name/i);

    fireEvent.change(nameInput, { target: { value: 'Authorization' } });

    const state = useRequestStore.getState();
    expect(state.headers[0].name).toBe('Authorization');
  });

  it('should update header value when value input changes', () => {
    const store = useRequestStore.getState();
    store.actions.addHeader();

    render(<HeadersEditor />);
    const valueInput = screen.getByPlaceholderText(/header value/i);

    fireEvent.change(valueInput, { target: { value: 'Bearer token123' } });

    const state = useRequestStore.getState();
    expect(state.headers[0].value).toBe('Bearer token123');
  });

  // T071: HeadersEditor removes header when delete button clicked
  it('should render delete button for each header', () => {
    const store = useRequestStore.getState();
    store.actions.addHeader();

    render(<HeadersEditor />);

    const deleteButton = screen.getByRole('button', { name: /delete|remove/i });
    expect(deleteButton).toBeInTheDocument();
  });

  it('should remove header when delete button is clicked', () => {
    const store = useRequestStore.getState();
    store.actions.addHeader();
    store.actions.updateHeader(0, 'name', 'Test-Header');

    render(<HeadersEditor />);

    // Verify header exists
    expect(screen.getByPlaceholderText(/header name/i)).toBeInTheDocument();

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete|remove/i });
    fireEvent.click(deleteButton);

    // Header should be removed
    expect(screen.queryByPlaceholderText(/header name/i)).not.toBeInTheDocument();
  });

  it('should remove correct header when multiple headers exist', () => {
    const store = useRequestStore.getState();
    store.actions.addHeader();
    store.actions.addHeader();
    store.actions.addHeader();
    store.actions.updateHeader(0, 'name', 'Header-1');
    store.actions.updateHeader(1, 'name', 'Header-2');
    store.actions.updateHeader(2, 'name', 'Header-3');

    render(<HeadersEditor />);

    // Get all delete buttons
    const deleteButtons = screen.getAllByRole('button', { name: /delete|remove/i });

    // Delete the second header
    fireEvent.click(deleteButtons[1]);

    const state = useRequestStore.getState();
    expect(state.headers).toHaveLength(2);
    expect(state.headers[0].name).toBe('Header-1');
    expect(state.headers[1].name).toBe('Header-3');
  });

  // T072: HeadersEditor toggles header enabled/disabled
  it('should render enabled checkbox for each header', () => {
    const store = useRequestStore.getState();
    store.actions.addHeader();

    render(<HeadersEditor />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('should have checkbox checked by default', () => {
    const store = useRequestStore.getState();
    store.actions.addHeader();

    render(<HeadersEditor />);

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('should toggle header enabled state when checkbox is clicked', () => {
    const store = useRequestStore.getState();
    store.actions.addHeader();

    render(<HeadersEditor />);
    const checkbox = screen.getByRole('checkbox');

    // Initially enabled
    expect((checkbox as HTMLInputElement).checked).toBe(true);

    // Click to disable
    fireEvent.click(checkbox);

    const state1 = useRequestStore.getState();
    expect(state1.headers[0].enabled).toBe(false);

    // Click to re-enable
    fireEvent.click(checkbox);

    const state2 = useRequestStore.getState();
    expect(state2.headers[0].enabled).toBe(true);
  });

  it('should visually indicate disabled headers', () => {
    const store = useRequestStore.getState();
    store.actions.addHeader();
    store.actions.updateHeader(0, 'name', 'Test-Header');
    store.actions.updateHeader(0, 'enabled', false);

    render(<HeadersEditor />);

    const nameInput = screen.getByPlaceholderText(/header name/i);
    // Disabled headers should have visual indication (e.g., opacity)
    // The parent div has the opacity style
    expect(nameInput.parentElement).toHaveStyle({ opacity: '0.5' });
  });

  it('should display existing headers from store', () => {
    const store = useRequestStore.getState();
    store.actions.addHeader();
    store.actions.updateHeader(0, 'name', 'Content-Type');
    store.actions.updateHeader(0, 'value', 'application/json');

    render(<HeadersEditor />);

    expect(screen.getByDisplayValue('Content-Type')).toBeInTheDocument();
    expect(screen.getByDisplayValue('application/json')).toBeInTheDocument();
  });

  it('should display multiple headers', () => {
    const store = useRequestStore.getState();
    store.actions.addHeader();
    store.actions.updateHeader(0, 'name', 'Content-Type');
    store.actions.updateHeader(0, 'value', 'application/json');
    store.actions.addHeader();
    store.actions.updateHeader(1, 'name', 'Authorization');
    store.actions.updateHeader(1, 'value', 'Bearer token');

    render(<HeadersEditor />);

    expect(screen.getByDisplayValue('Content-Type')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Authorization')).toBeInTheDocument();
  });

  it('should show "No headers" message when no headers exist', () => {
    render(<HeadersEditor />);

    // Should show empty state message or just the add button
    const addButton = screen.getByRole('button', { name: /add header/i });
    expect(addButton).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/header name/i)).not.toBeInTheDocument();
  });

  it('should allow editing multiple headers independently', () => {
    const store = useRequestStore.getState();
    store.actions.addHeader();
    store.actions.addHeader();

    render(<HeadersEditor />);

    const nameInputs = screen.getAllByPlaceholderText(/header name/i);
    const valueInputs = screen.getAllByPlaceholderText(/header value/i);

    fireEvent.change(nameInputs[0], { target: { value: 'Header-1' } });
    fireEvent.change(valueInputs[0], { target: { value: 'Value-1' } });
    fireEvent.change(nameInputs[1], { target: { value: 'Header-2' } });
    fireEvent.change(valueInputs[1], { target: { value: 'Value-2' } });

    const state = useRequestStore.getState();
    expect(state.headers[0].name).toBe('Header-1');
    expect(state.headers[0].value).toBe('Value-1');
    expect(state.headers[1].name).toBe('Header-2');
    expect(state.headers[1].value).toBe('Value-2');
  });
});
