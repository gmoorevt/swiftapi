/**
 * BodyEditor Component Tests
 *
 * Tests for request body editor component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BodyEditor } from './BodyEditor';
import { useRequestStore } from '../../store/requestStore';
import { HttpMethod, BodyType } from '../../../types/request.types';

describe('BodyEditor', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useRequestStore.getState();
    store.actions.resetRequest();
  });

  // T052: BodyEditor renders textarea for POST method
  it('should render textarea when method is POST', () => {
    const store = useRequestStore.getState();
    store.actions.setMethod(HttpMethod.POST);

    render(<BodyEditor />);
    const textarea = screen.getByPlaceholderText(/enter request body/i);
    expect(textarea).toBeInTheDocument();
  });

  // T053: BodyEditor hidden when method is GET
  it('should not render textarea when method is GET', () => {
    const store = useRequestStore.getState();
    store.actions.setMethod(HttpMethod.GET);

    render(<BodyEditor />);
    const textarea = screen.queryByPlaceholderText(/enter request body/i);
    expect(textarea).not.toBeInTheDocument();
  });

  it('should render textarea for PUT method', () => {
    const store = useRequestStore.getState();
    store.actions.setMethod(HttpMethod.PUT);

    render(<BodyEditor />);
    const textarea = screen.getByPlaceholderText(/enter request body/i);
    expect(textarea).toBeInTheDocument();
  });

  it('should render textarea for DELETE method', () => {
    const store = useRequestStore.getState();
    store.actions.setMethod(HttpMethod.DELETE);

    render(<BodyEditor />);
    const textarea = screen.getByPlaceholderText(/enter request body/i);
    expect(textarea).toBeInTheDocument();
  });

  // T054: BodyEditor shows body type selector (JSON, form-data, raw)
  it('should render body type selector', () => {
    const store = useRequestStore.getState();
    store.actions.setMethod(HttpMethod.POST);

    render(<BodyEditor />);
    const select = screen.getByLabelText(/body type/i);
    expect(select).toBeInTheDocument();
  });

  it('should render all body type options', () => {
    const store = useRequestStore.getState();
    store.actions.setMethod(HttpMethod.POST);

    render(<BodyEditor />);

    expect(screen.getByText('JSON')).toBeInTheDocument();
    expect(screen.getByText('Form Data')).toBeInTheDocument();
    expect(screen.getByText('Raw Text')).toBeInTheDocument();
  });

  it('should update store when body type changes', () => {
    const store = useRequestStore.getState();
    store.actions.setMethod(HttpMethod.POST);

    render(<BodyEditor />);
    const select = screen.getByLabelText(/body type/i);

    fireEvent.change(select, { target: { value: BodyType.RAW } });

    const state = useRequestStore.getState();
    expect(state.bodyType).toBe(BodyType.RAW);
  });

  it('should display current body type from store', () => {
    const store = useRequestStore.getState();
    store.actions.setMethod(HttpMethod.POST);
    store.actions.setBodyType(BodyType.FORM_DATA);

    render(<BodyEditor />);
    const select = screen.getByLabelText(/body type/i) as HTMLSelectElement;
    expect(select.value).toBe(BodyType.FORM_DATA);
  });

  it('should update store when body content changes', () => {
    const store = useRequestStore.getState();
    store.actions.setMethod(HttpMethod.POST);

    render(<BodyEditor />);
    const textarea = screen.getByPlaceholderText(/enter request body/i);

    fireEvent.change(textarea, { target: { value: '{"test": "data"}' } });

    const state = useRequestStore.getState();
    expect(state.body).toBe('{"test": "data"}');
  });

  it('should display current body from store', () => {
    const store = useRequestStore.getState();
    store.actions.setMethod(HttpMethod.POST);
    store.actions.setBody('{"name": "John"}');

    render(<BodyEditor />);
    const textarea = screen.getByDisplayValue('{"name": "John"}');
    expect(textarea).toBeInTheDocument();
  });

  // T055: BodyEditor validates JSON syntax when type is JSON
  it('should validate JSON when body type is JSON', () => {
    const store = useRequestStore.getState();
    store.actions.setMethod(HttpMethod.POST);
    store.actions.setBodyType(BodyType.JSON);
    store.actions.setBody('{invalid}');

    render(<BodyEditor />);

    // Validation error should be displayed (look for the error message specifically)
    const error = screen.queryByText(/Invalid JSON:/i);
    expect(error).toBeInTheDocument();
  });

  // T056: BodyEditor shows validation error for malformed JSON
  it('should show validation error for malformed JSON', () => {
    const store = useRequestStore.getState();
    store.actions.setMethod(HttpMethod.POST);
    store.actions.setBodyType(BodyType.JSON);

    render(<BodyEditor />);
    const textarea = screen.getByPlaceholderText(/enter request body/i);

    // Enter invalid JSON
    fireEvent.change(textarea, { target: { value: '{"name": "John"' } });

    // Error should be displayed
    const error = screen.queryByText(/Invalid JSON:/i);
    expect(error).toBeInTheDocument();
  });

  it('should not show validation error for valid JSON', () => {
    const store = useRequestStore.getState();
    store.actions.setMethod(HttpMethod.POST);
    store.actions.setBodyType(BodyType.JSON);

    render(<BodyEditor />);
    const textarea = screen.getByPlaceholderText(/enter request body/i);

    // Enter valid JSON
    fireEvent.change(textarea, { target: { value: '{"name": "John"}' } });

    // Error should not be displayed
    const error = screen.queryByText(/Invalid JSON:/i);
    expect(error).not.toBeInTheDocument();
  });

  it('should not validate when body type is not JSON', () => {
    const store = useRequestStore.getState();
    store.actions.setMethod(HttpMethod.POST);
    store.actions.setBodyType(BodyType.RAW);

    render(<BodyEditor />);
    const textarea = screen.getByPlaceholderText(/enter request body/i);

    // Enter invalid JSON (but it's raw text, so should not validate)
    fireEvent.change(textarea, { target: { value: '{invalid}' } });

    // Error should not be displayed because it's raw text
    const error = screen.queryByText(/Invalid JSON:/i);
    expect(error).not.toBeInTheDocument();
  });

  it('should clear validation error when body type changes from JSON to RAW', () => {
    const store = useRequestStore.getState();
    store.actions.setMethod(HttpMethod.POST);
    store.actions.setBodyType(BodyType.JSON);
    store.actions.setBody('{invalid}');

    render(<BodyEditor />);

    // Error should be visible for JSON type
    expect(screen.queryByText(/Invalid JSON:/i)).toBeInTheDocument();

    // Change to RAW type
    const select = screen.getByLabelText(/body type/i);
    fireEvent.change(select, { target: { value: BodyType.RAW } });

    // Error should disappear
    expect(screen.queryByText(/Invalid JSON:/i)).not.toBeInTheDocument();
  });

  it('should clear body when switching from POST to GET', () => {
    const store = useRequestStore.getState();
    store.actions.setMethod(HttpMethod.POST);
    store.actions.setBody('{"test": "data"}');

    const { rerender } = render(<BodyEditor />);

    // Verify body is shown
    expect(screen.getByPlaceholderText(/enter request body/i)).toBeInTheDocument();

    // Change to GET
    store.actions.setMethod(HttpMethod.GET);
    rerender(<BodyEditor />);

    // Body editor should not be visible
    expect(screen.queryByPlaceholderText(/enter request body/i)).not.toBeInTheDocument();
  });
});
