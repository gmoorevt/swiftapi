/**
 * SendButton Component Tests
 *
 * Tests for send request button component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SendButton } from './SendButton';
import { useRequestStore } from '../../store/requestStore';

describe('SendButton', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useRequestStore.getState();
    store.actions.resetRequest();
  });

  it('should render button with "Send" text', () => {
    render(<SendButton />);
    const button = screen.getByRole('button', { name: /send/i });
    expect(button).toBeInTheDocument();
  });

  it('should be enabled when not loading', () => {
    render(<SendButton />);
    const button = screen.getByRole('button', { name: /send/i });
    expect(button).not.toBeDisabled();
  });

  it('should be disabled when loading', () => {
    const store = useRequestStore.getState();
    store.actions.setLoading(true);

    render(<SendButton />);
    const button = screen.getByRole('button', { name: /send/i });
    expect(button).toBeDisabled();
  });

  it('should show "Sending..." text when loading', () => {
    const store = useRequestStore.getState();
    store.actions.setLoading(true);

    render(<SendButton />);
    expect(screen.getByText(/sending/i)).toBeInTheDocument();
  });

  it('should call sendRequest action when clicked', () => {
    const store = useRequestStore.getState();
    store.actions.setUrl('https://api.example.com');

    render(<SendButton />);
    const button = screen.getByRole('button', { name: /send/i });

    fireEvent.click(button);

    // After clicking, loading should be true
    const state = useRequestStore.getState();
    expect(state.isLoading).toBe(true);
  });

  it('should not trigger request when clicked while loading', () => {
    const store = useRequestStore.getState();
    store.actions.setLoading(true);

    render(<SendButton />);
    const button = screen.getByRole('button', { name: /sending/i });

    // Button should be disabled, so click won't do anything
    expect(button).toBeDisabled();
  });
});
