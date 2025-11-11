/**
 * Auth Model Tests
 */

import { describe, it, expect } from 'vitest';
import { Auth } from './Auth';
import { AuthType } from '../types/auth.types';
import type {
  NoAuthConfig,
  ApiKeyConfig,
  BearerConfig,
  BasicAuthConfig,
} from '../types/auth.types';
import type { Header } from '../types/request.types';

describe('Auth', () => {
  describe('constructor', () => {
    it('should create auth with NONE type', () => {
      const auth = new Auth({ type: AuthType.NONE });
      expect(auth.type).toBe(AuthType.NONE);
    });

    it('should create auth with API_KEY type', () => {
      const auth = new Auth({
        type: AuthType.API_KEY,
        headerName: 'X-API-Key',
        value: 'secret123',
      });
      expect(auth.type).toBe(AuthType.API_KEY);
      expect(auth.config).toEqual({
        type: AuthType.API_KEY,
        headerName: 'X-API-Key',
        value: 'secret123',
      });
    });

    it('should create auth with BEARER type', () => {
      const auth = new Auth({
        type: AuthType.BEARER,
        token: 'abc123token',
      });
      expect(auth.type).toBe(AuthType.BEARER);
      expect(auth.config).toEqual({
        type: AuthType.BEARER,
        token: 'abc123token',
      });
    });

    it('should create auth with BASIC type', () => {
      const auth = new Auth({
        type: AuthType.BASIC,
        username: 'user',
        password: 'pass',
      });
      expect(auth.type).toBe(AuthType.BASIC);
      expect(auth.config).toEqual({
        type: AuthType.BASIC,
        username: 'user',
        password: 'pass',
      });
    });
  });

  describe('applyToHeaders', () => {
    it('should not add headers for NONE type', () => {
      const auth = new Auth({ type: AuthType.NONE });
      const headers: Header[] = [
        { name: 'Content-Type', value: 'application/json', enabled: true },
      ];
      const result = auth.applyToHeaders(headers);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ name: 'Content-Type', value: 'application/json', enabled: true });
    });

    it('should add custom header for API_KEY type', () => {
      const auth = new Auth({
        type: AuthType.API_KEY,
        headerName: 'X-API-Key',
        value: 'secret123',
      });
      const headers: Header[] = [];
      const result = auth.applyToHeaders(headers);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'X-API-Key',
        value: 'secret123',
        enabled: true,
      });
    });

    it('should add Authorization header for BEARER type', () => {
      const auth = new Auth({
        type: AuthType.BEARER,
        token: 'abc123token',
      });
      const headers: Header[] = [];
      const result = auth.applyToHeaders(headers);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Authorization',
        value: 'Bearer abc123token',
        enabled: true,
      });
    });

    it('should add Authorization header for BASIC type', () => {
      const auth = new Auth({
        type: AuthType.BASIC,
        username: 'user',
        password: 'pass',
      });
      const headers: Header[] = [];
      const result = auth.applyToHeaders(headers);

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Authorization');
      expect(result[0]?.value).toMatch(/^Basic /);
      expect(result[0]?.enabled).toBe(true);

      // Verify base64 encoding
      const encodedPart = result[0]!.value.replace('Basic ', '');
      const decoded = Buffer.from(encodedPart, 'base64').toString('utf-8');
      expect(decoded).toBe('user:pass');
    });

    it('should preserve existing headers', () => {
      const auth = new Auth({
        type: AuthType.BEARER,
        token: 'abc123',
      });
      const headers: Header[] = [
        { name: 'Content-Type', value: 'application/json', enabled: true },
        { name: 'X-Custom', value: 'test', enabled: true },
      ];
      const result = auth.applyToHeaders(headers);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ name: 'Content-Type', value: 'application/json', enabled: true });
      expect(result[1]).toEqual({ name: 'X-Custom', value: 'test', enabled: true });
      expect(result[2]?.name).toBe('Authorization');
    });

    it('should not modify existing headers array', () => {
      const auth = new Auth({
        type: AuthType.BEARER,
        token: 'abc123',
      });
      const headers: Header[] = [];
      const result = auth.applyToHeaders(headers);

      expect(headers).toHaveLength(0);
      expect(result).toHaveLength(1);
    });
  });

  describe('toJSON', () => {
    it('should serialize NONE auth', () => {
      const auth = new Auth({ type: AuthType.NONE });
      expect(auth.toJSON()).toEqual({ type: AuthType.NONE });
    });

    it('should serialize API_KEY auth', () => {
      const auth = new Auth({
        type: AuthType.API_KEY,
        headerName: 'X-API-Key',
        value: 'secret',
      });
      expect(auth.toJSON()).toEqual({
        type: AuthType.API_KEY,
        headerName: 'X-API-Key',
        value: 'secret',
      });
    });

    it('should serialize BEARER auth', () => {
      const auth = new Auth({
        type: AuthType.BEARER,
        token: 'token123',
      });
      expect(auth.toJSON()).toEqual({
        type: AuthType.BEARER,
        token: 'token123',
      });
    });

    it('should serialize BASIC auth', () => {
      const auth = new Auth({
        type: AuthType.BASIC,
        username: 'user',
        password: 'pass',
      });
      expect(auth.toJSON()).toEqual({
        type: AuthType.BASIC,
        username: 'user',
        password: 'pass',
      });
    });
  });

  describe('fromJSON', () => {
    it('should deserialize NONE auth', () => {
      const json: NoAuthConfig = { type: AuthType.NONE };
      const auth = Auth.fromJSON(json);

      expect(auth).toBeInstanceOf(Auth);
      expect(auth.type).toBe(AuthType.NONE);
    });

    it('should deserialize API_KEY auth', () => {
      const json: ApiKeyConfig = {
        type: AuthType.API_KEY,
        headerName: 'X-API-Key',
        value: 'secret',
      };
      const auth = Auth.fromJSON(json);

      expect(auth).toBeInstanceOf(Auth);
      expect(auth.type).toBe(AuthType.API_KEY);
      expect(auth.config).toEqual(json);
    });

    it('should deserialize BEARER auth', () => {
      const json: BearerConfig = {
        type: AuthType.BEARER,
        token: 'token123',
      };
      const auth = Auth.fromJSON(json);

      expect(auth).toBeInstanceOf(Auth);
      expect(auth.type).toBe(AuthType.BEARER);
    });

    it('should deserialize BASIC auth', () => {
      const json: BasicAuthConfig = {
        type: AuthType.BASIC,
        username: 'user',
        password: 'pass',
      };
      const auth = Auth.fromJSON(json);

      expect(auth).toBeInstanceOf(Auth);
      expect(auth.type).toBe(AuthType.BASIC);
    });
  });
});
