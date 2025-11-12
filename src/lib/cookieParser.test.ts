/**
 * Cookie Parser Tests
 *
 * Tests for parsing Set-Cookie headers into structured data
 */

import { describe, it, expect } from 'vitest';
import { parseCookie, parseSetCookieHeaders, type Cookie } from './cookieParser';

describe('parseCookie', () => {
  it('should parse a simple cookie with name and value', () => {
    const cookie = parseCookie('sessionId=abc123');
    expect(cookie).toEqual({
      name: 'sessionId',
      value: 'abc123',
    });
  });

  it('should parse a cookie with all attributes', () => {
    const cookie = parseCookie(
      'sessionId=abc123; Domain=example.com; Path=/; Expires=Wed, 21 Oct 2025 07:28:00 GMT; Secure; HttpOnly; SameSite=Strict'
    );
    expect(cookie).toEqual({
      name: 'sessionId',
      value: 'abc123',
      domain: 'example.com',
      path: '/',
      expires: 'Wed, 21 Oct 2025 07:28:00 GMT',
      secure: true,
      httpOnly: true,
      sameSite: 'Strict',
    });
  });

  it('should parse a cookie with Max-Age', () => {
    const cookie = parseCookie('token=xyz789; Max-Age=3600');
    expect(cookie).toEqual({
      name: 'token',
      value: 'xyz789',
      maxAge: 3600,
    });
  });

  it('should parse SameSite=Lax', () => {
    const cookie = parseCookie('tracking=enabled; SameSite=Lax');
    expect(cookie).toEqual({
      name: 'tracking',
      value: 'enabled',
      sameSite: 'Lax',
    });
  });

  it('should parse SameSite=None', () => {
    const cookie = parseCookie('crossSite=value; SameSite=None; Secure');
    expect(cookie).toEqual({
      name: 'crossSite',
      value: 'value',
      sameSite: 'None',
      secure: true,
    });
  });

  it('should handle cookie values with special characters', () => {
    const cookie = parseCookie('data=value%20with%20spaces');
    expect(cookie).toEqual({
      name: 'data',
      value: 'value%20with%20spaces',
    });
  });

  it('should handle cookie values with equals signs', () => {
    const cookie = parseCookie('base64=abc=def==; Path=/');
    expect(cookie).toEqual({
      name: 'base64',
      value: 'abc=def==',
      path: '/',
    });
  });

  it('should handle empty cookie value', () => {
    const cookie = parseCookie('emptyValue=; Path=/');
    expect(cookie).toEqual({
      name: 'emptyValue',
      value: '',
      path: '/',
    });
  });

  it('should handle case-insensitive attributes', () => {
    const cookie = parseCookie('test=123; path=/; secure; httponly; samesite=strict');
    expect(cookie).toEqual({
      name: 'test',
      value: '123',
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
    });
  });

  it('should handle whitespace around attributes', () => {
    const cookie = parseCookie('id=abc;  Domain = example.com ;  Path = / ');
    expect(cookie).toEqual({
      name: 'id',
      value: 'abc',
      domain: 'example.com',
      path: '/',
    });
  });

  it('should ignore invalid attributes', () => {
    const cookie = parseCookie('session=xyz; ValidAttr=Value; InvalidFlag; Domain=test.com');
    expect(cookie).toEqual({
      name: 'session',
      value: 'xyz',
      domain: 'test.com',
    });
  });

  it('should return null for invalid cookie string', () => {
    const cookie = parseCookie('');
    expect(cookie).toBeNull();
  });

  it('should return null for cookie string without equals sign', () => {
    const cookie = parseCookie('invalidcookie');
    expect(cookie).toBeNull();
  });
});

describe('parseSetCookieHeaders', () => {
  it('should parse multiple Set-Cookie headers', () => {
    const headers = [
      { name: 'Set-Cookie', value: 'session=abc123; Path=/; Secure', enabled: true },
      { name: 'Set-Cookie', value: 'token=xyz789; HttpOnly', enabled: true },
    ];

    const cookies = parseSetCookieHeaders(headers);
    expect(cookies).toHaveLength(2);
    expect(cookies[0]).toEqual({
      name: 'session',
      value: 'abc123',
      path: '/',
      secure: true,
    });
    expect(cookies[1]).toEqual({
      name: 'token',
      value: 'xyz789',
      httpOnly: true,
    });
  });

  it('should handle mixed case Set-Cookie header names', () => {
    const headers = [
      { name: 'set-cookie', value: 'test1=value1', enabled: true },
      { name: 'SET-COOKIE', value: 'test2=value2', enabled: true },
      { name: 'Set-Cookie', value: 'test3=value3', enabled: true },
    ];

    const cookies = parseSetCookieHeaders(headers);
    expect(cookies).toHaveLength(3);
    expect(cookies[0].name).toBe('test1');
    expect(cookies[1].name).toBe('test2');
    expect(cookies[2].name).toBe('test3');
  });

  it('should ignore non Set-Cookie headers', () => {
    const headers = [
      { name: 'Content-Type', value: 'application/json', enabled: true },
      { name: 'Set-Cookie', value: 'session=abc', enabled: true },
      { name: 'Cache-Control', value: 'no-cache', enabled: true },
    ];

    const cookies = parseSetCookieHeaders(headers);
    expect(cookies).toHaveLength(1);
    expect(cookies[0].name).toBe('session');
  });

  it('should return empty array when no Set-Cookie headers present', () => {
    const headers = [
      { name: 'Content-Type', value: 'application/json', enabled: true },
      { name: 'Cache-Control', value: 'no-cache', enabled: true },
    ];

    const cookies = parseSetCookieHeaders(headers);
    expect(cookies).toEqual([]);
  });

  it('should skip invalid cookies', () => {
    const headers = [
      { name: 'Set-Cookie', value: 'valid=cookie', enabled: true },
      { name: 'Set-Cookie', value: 'invalidcookie', enabled: true },
      { name: 'Set-Cookie', value: '', enabled: true },
      { name: 'Set-Cookie', value: 'another=valid', enabled: true },
    ];

    const cookies = parseSetCookieHeaders(headers);
    expect(cookies).toHaveLength(2);
    expect(cookies[0].name).toBe('valid');
    expect(cookies[1].name).toBe('another');
  });

  it('should return empty array for empty headers array', () => {
    const cookies = parseSetCookieHeaders([]);
    expect(cookies).toEqual([]);
  });
});

describe('Cookie type', () => {
  it('should have correct TypeScript type for Cookie interface', () => {
    const cookie: Cookie = {
      name: 'test',
      value: 'value',
      domain: 'example.com',
      path: '/',
      expires: 'Wed, 21 Oct 2025 07:28:00 GMT',
      maxAge: 3600,
      secure: true,
      httpOnly: true,
      sameSite: 'Strict',
    };

    expect(cookie.name).toBe('test');
    expect(cookie.sameSite).toBe('Strict');
  });

  it('should allow optional fields to be undefined', () => {
    const cookie: Cookie = {
      name: 'test',
      value: 'value',
    };

    expect(cookie.domain).toBeUndefined();
    expect(cookie.secure).toBeUndefined();
  });
});
