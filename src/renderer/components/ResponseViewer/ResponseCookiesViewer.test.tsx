/**
 * ResponseCookiesViewer Component Tests
 *
 * Tests for the cookies viewer component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResponseCookiesViewer } from './ResponseCookiesViewer';
import { useRequestStore } from '../../store/requestStore';
import { Response } from '../../../models/Response';

describe('ResponseCookiesViewer', () => {
  beforeEach(() => {
    // Reset store state
    useRequestStore.setState({
      response: null,
      error: null,
      isLoading: false,
    });
  });

  it('should render empty state when no response', () => {
    render(<ResponseCookiesViewer />);
    expect(screen.getByText(/no cookies to display/i)).toBeInTheDocument();
  });

  it('should render empty state when response has no cookies', () => {
    const response = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [{ name: 'content-type', value: 'application/json', enabled: true }],
      body: '{}',
      responseTime: 100,
      size: 2,
      timestamp: '2025-11-07T10:15:30.123Z',
    });

    useRequestStore.setState({ response });

    render(<ResponseCookiesViewer />);
    expect(screen.getByText(/no cookies to display/i)).toBeInTheDocument();
  });

  it('should render a table with cookies when present', () => {
    const response = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [
        { name: 'Set-Cookie', value: 'sessionId=abc123; Path=/; Secure; HttpOnly', enabled: true },
        { name: 'Set-Cookie', value: 'token=xyz789; Domain=example.com', enabled: true },
      ],
      body: '',
      responseTime: 100,
      size: 0,
      timestamp: '2025-11-07T10:15:30.123Z',
    });

    useRequestStore.setState({ response });

    render(<ResponseCookiesViewer />);

    // Check table headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Domain')).toBeInTheDocument();
    expect(screen.getByText('Path')).toBeInTheDocument();
    expect(screen.getByText('Expires')).toBeInTheDocument();
    expect(screen.getByText('Secure')).toBeInTheDocument();
    expect(screen.getByText('HttpOnly')).toBeInTheDocument();
    expect(screen.getByText('SameSite')).toBeInTheDocument();

    // Check cookie data
    expect(screen.getByText('sessionId')).toBeInTheDocument();
    expect(screen.getByText('abc123')).toBeInTheDocument();
    expect(screen.getByText('token')).toBeInTheDocument();
    expect(screen.getByText('xyz789')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
  });

  it('should highlight Secure cookies with green checkmark', () => {
    const response = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [
        { name: 'Set-Cookie', value: 'secure=cookie; Secure', enabled: true },
      ],
      body: '',
      responseTime: 100,
      size: 0,
      timestamp: '2025-11-07T10:15:30.123Z',
    });

    useRequestStore.setState({ response });

    render(<ResponseCookiesViewer />);

    const secureCells = screen.getAllByText('✓');
    expect(secureCells.length).toBeGreaterThan(0);
  });

  it('should highlight HttpOnly cookies with green checkmark', () => {
    const response = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [
        { name: 'Set-Cookie', value: 'httponly=cookie; HttpOnly', enabled: true },
      ],
      body: '',
      responseTime: 100,
      size: 0,
      timestamp: '2025-11-07T10:15:30.123Z',
    });

    useRequestStore.setState({ response });

    render(<ResponseCookiesViewer />);

    const httpOnlyCells = screen.getAllByText('✓');
    expect(httpOnlyCells.length).toBeGreaterThan(0);
  });

  it('should display dash for missing optional attributes', () => {
    const response = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [
        { name: 'Set-Cookie', value: 'simple=cookie', enabled: true },
      ],
      body: '',
      responseTime: 100,
      size: 0,
      timestamp: '2025-11-07T10:15:30.123Z',
    });

    useRequestStore.setState({ response });

    render(<ResponseCookiesViewer />);

    // Should have dashes for missing attributes
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThan(0);
  });

  it('should display all cookie attributes correctly', () => {
    const response = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [
        {
          name: 'Set-Cookie',
          value: 'full=cookie; Domain=example.com; Path=/api; Expires=Wed, 21 Oct 2025 07:28:00 GMT; Secure; HttpOnly; SameSite=Strict',
          enabled: true,
        },
      ],
      body: '',
      responseTime: 100,
      size: 0,
      timestamp: '2025-11-07T10:15:30.123Z',
    });

    useRequestStore.setState({ response });

    render(<ResponseCookiesViewer />);

    expect(screen.getByText('full')).toBeInTheDocument();
    expect(screen.getByText('cookie')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('/api')).toBeInTheDocument();
    expect(screen.getByText('Wed, 21 Oct 2025 07:28:00 GMT')).toBeInTheDocument();
    expect(screen.getByText('Strict')).toBeInTheDocument();
  });

  it('should display cookie count', () => {
    const response = new Response({
      statusCode: 200,
      statusText: 'OK',
      headers: [
        { name: 'Set-Cookie', value: 'cookie1=value1', enabled: true },
        { name: 'Set-Cookie', value: 'cookie2=value2', enabled: true },
        { name: 'Set-Cookie', value: 'cookie3=value3', enabled: true },
      ],
      body: '',
      responseTime: 100,
      size: 0,
      timestamp: '2025-11-07T10:15:30.123Z',
    });

    useRequestStore.setState({ response });

    render(<ResponseCookiesViewer />);

    expect(screen.getByText(/3 cookies/i)).toBeInTheDocument();
  });
});
