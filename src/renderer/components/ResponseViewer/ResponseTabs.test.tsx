/**
 * ResponseTabs Component Tests
 *
 * Tests for tabbed response viewer component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResponseTabs } from './ResponseTabs';
import { useRequestStore } from '../../store/requestStore';
import { Response } from '../../../models/Response';

// Mock child components
vi.mock('./BodyViewer', () => ({
  BodyViewer: () => <div data-testid="body-viewer">Body Viewer Content</div>,
}));

vi.mock('./ResponseHeadersViewer', () => ({
  ResponseHeadersViewer: () => (
    <div data-testid="headers-viewer">Headers Viewer Content</div>
  ),
}));

describe('ResponseTabs', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useRequestStore.getState();
    store.actions.resetRequest();
  });

  it('should render tab buttons for Body and Headers', () => {
    render(<ResponseTabs />);

    expect(screen.getByRole('button', { name: /body/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /headers/i })).toBeInTheDocument();
  });

  it('should show Body tab as active by default', () => {
    render(<ResponseTabs />);

    const bodyButton = screen.getByRole('button', { name: /body/i });
    const headersButton = screen.getByRole('button', { name: /headers/i });

    // Body tab should be active (has specific styles)
    expect(bodyButton).toHaveStyle({
      borderBottom: '2px solid #007bff',
      color: '#007bff'
    });
    expect(headersButton).toHaveStyle({ color: '#666666' });
  });

  it('should display BodyViewer content by default', () => {
    render(<ResponseTabs />);

    expect(screen.getByTestId('body-viewer')).toBeInTheDocument();
    expect(screen.queryByTestId('headers-viewer')).not.toBeInTheDocument();
  });

  it('should switch to Headers tab when clicked', async () => {
    const user = userEvent.setup();
    render(<ResponseTabs />);

    const headersButton = screen.getByRole('button', { name: /headers/i });
    await user.click(headersButton);

    expect(screen.getByTestId('headers-viewer')).toBeInTheDocument();
    expect(screen.queryByTestId('body-viewer')).not.toBeInTheDocument();
  });

  it('should switch back to Body tab when clicked', async () => {
    const user = userEvent.setup();
    render(<ResponseTabs />);

    // Switch to Headers
    const headersButton = screen.getByRole('button', { name: /headers/i });
    await user.click(headersButton);

    expect(screen.getByTestId('headers-viewer')).toBeInTheDocument();

    // Switch back to Body
    const bodyButton = screen.getByRole('button', { name: /body/i });
    await user.click(bodyButton);

    expect(screen.getByTestId('body-viewer')).toBeInTheDocument();
    expect(screen.queryByTestId('headers-viewer')).not.toBeInTheDocument();
  });

  it('should update active tab styling when switching tabs', async () => {
    const user = userEvent.setup();
    render(<ResponseTabs />);

    const bodyButton = screen.getByRole('button', { name: /body/i });
    const headersButton = screen.getByRole('button', { name: /headers/i });

    // Initially Body is active
    expect(bodyButton).toHaveStyle({
      borderBottom: '2px solid #007bff',
      color: '#007bff'
    });

    // Click Headers
    await user.click(headersButton);

    // Headers should now be active
    expect(headersButton).toHaveStyle({
      borderBottom: '2px solid #007bff',
      color: '#007bff'
    });
    expect(bodyButton).toHaveStyle({ color: '#666666' });
  });

  it('should display header count badge when response has headers', () => {
    const mockResponse = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [
        { name: 'content-type', value: 'application/json', enabled: true },
        { name: 'content-length', value: '1234', enabled: true },
        { name: 'server', value: 'nginx', enabled: true },
      ],
      body: '{}',
      responseTime: 100,
      size: 2,
      timestamp: '2025-11-07T10:00:00Z',
    });

    const store = useRequestStore.getState();
    store.actions.setResponse(mockResponse);

    render(<ResponseTabs />);

    // Headers button should show count
    const headersButton = screen.getByRole('button', { name: /headers/i });
    expect(headersButton).toHaveTextContent('3');
  });

  it('should not display header count badge when no response', () => {
    render(<ResponseTabs />);

    const headersButton = screen.getByRole('button', { name: /headers/i });
    expect(headersButton).toHaveTextContent('Headers');
    expect(headersButton).not.toHaveTextContent(/\d+/);
  });

  it('should display 0 count when response has no headers', () => {
    const mockResponse = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [],
      body: '{}',
      responseTime: 100,
      size: 2,
      timestamp: '2025-11-07T10:00:00Z',
    });

    const store = useRequestStore.getState();
    store.actions.setResponse(mockResponse);

    render(<ResponseTabs />);

    const headersButton = screen.getByRole('button', { name: /headers/i });
    expect(headersButton).toHaveTextContent('0');
  });
});
