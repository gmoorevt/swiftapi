/**
 * Header Model Tests
 */

import { describe, it, expect } from 'vitest';
import { Header } from './Header';

describe('Header', () => {
  it('should create header with name and value', () => {
    const header = new Header('Content-Type', 'application/json');

    expect(header.name).toBe('Content-Type');
    expect(header.value).toBe('application/json');
    expect(header.enabled).toBe(true);
  });

  it('should create header with enabled=false', () => {
    const header = new Header('Authorization', 'Bearer token', false);

    expect(header.name).toBe('Authorization');
    expect(header.value).toBe('Bearer token');
    expect(header.enabled).toBe(false);
  });

  it('should default enabled to true', () => {
    const header = new Header('X-Custom', 'value');

    expect(header.enabled).toBe(true);
  });

  it('should convert to JSON', () => {
    const header = new Header('Accept', 'application/json', true);
    const json = header.toJSON();

    expect(json).toEqual({
      name: 'Accept',
      value: 'application/json',
      enabled: true,
    });
  });

  it('should create from JSON', () => {
    const json = {
      name: 'Authorization',
      value: 'Bearer token123',
      enabled: false,
    };

    const header = Header.fromJSON(json);

    expect(header.name).toBe('Authorization');
    expect(header.value).toBe('Bearer token123');
    expect(header.enabled).toBe(false);
  });

  it('should handle empty values', () => {
    const header = new Header('X-Empty', '');

    expect(header.name).toBe('X-Empty');
    expect(header.value).toBe('');
  });
});
