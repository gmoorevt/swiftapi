/**
 * Cookie Parser
 *
 * Utility for parsing Set-Cookie headers into structured cookie objects
 */

import type { Header } from '../types/request.types';

export interface Cookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: string;
  maxAge?: number;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * Parse boolean cookie attributes (Secure, HttpOnly)
 */
function parseBooleanAttribute(attrName: string, cookie: Cookie): void {
  if (attrName === 'secure') {
    cookie.secure = true;
  } else if (attrName === 'httponly') {
    cookie.httpOnly = true;
  }
}

/**
 * Parse key-value cookie attributes (Domain, Path, etc.)
 */
function parseKeyValueAttribute(
  attrName: string,
  attrValue: string,
  cookie: Cookie
): void {
  switch (attrName) {
    case 'domain':
      cookie.domain = attrValue;
      break;
    case 'path':
      cookie.path = attrValue;
      break;
    case 'expires':
      cookie.expires = attrValue;
      break;
    case 'max-age': {
      const maxAge = parseInt(attrValue, 10);
      if (!isNaN(maxAge)) {
        cookie.maxAge = maxAge;
      }
      break;
    }
    case 'samesite': {
      const normalized = attrValue.charAt(0).toUpperCase() + attrValue.slice(1).toLowerCase();
      if (normalized === 'Strict' || normalized === 'Lax' || normalized === 'None') {
        cookie.sameSite = normalized;
      }
      break;
    }
  }
}

/**
 * Parse a single Set-Cookie header value into a Cookie object
 *
 * @param cookieString - The Set-Cookie header value
 * @returns Parsed cookie object or null if invalid
 */
export function parseCookie(cookieString: string): Cookie | null {
  if (!cookieString || !cookieString.trim()) {
    return null;
  }

  const parts = cookieString.split(';').map((part) => part.trim());

  // First part should be name=value
  const nameValuePair = parts[0];
  if (!nameValuePair) {
    return null;
  }

  const equalsIndex = nameValuePair.indexOf('=');

  if (equalsIndex === -1) {
    return null;
  }

  const name = nameValuePair.substring(0, equalsIndex).trim();
  const value = nameValuePair.substring(equalsIndex + 1);

  const cookie: Cookie = { name, value };

  // Parse remaining attributes
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (!part) {
      continue;
    }

    const attrEqualsIndex = part.indexOf('=');

    if (attrEqualsIndex === -1) {
      // Boolean attribute (Secure, HttpOnly)
      const attrName = part.toLowerCase();
      parseBooleanAttribute(attrName, cookie);
    } else {
      // Key-value attribute
      const attrName = part.substring(0, attrEqualsIndex).trim().toLowerCase();
      const attrValue = part.substring(attrEqualsIndex + 1).trim();
      parseKeyValueAttribute(attrName, attrValue, cookie);
    }
  }

  return cookie;
}

/**
 * Parse all Set-Cookie headers from a headers array
 *
 * @param headers - Array of headers from response
 * @returns Array of parsed Cookie objects
 */
export function parseSetCookieHeaders(headers: Header[]): Cookie[] {
  const cookies: Cookie[] = [];

  for (const header of headers) {
    if (header.name.toLowerCase() === 'set-cookie') {
      const cookie = parseCookie(header.value);
      if (cookie) {
        cookies.push(cookie);
      }
    }
  }

  return cookies;
}
