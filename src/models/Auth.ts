/**
 * Auth Model
 *
 * Handles authentication configuration and application to requests
 */

import type { Header } from '../types/request.types';
import {
  AuthType,
  type Auth as AuthConfig,
  type ApiKeyConfig,
  type BearerConfig,
  type BasicAuthConfig,
} from '../types/auth.types';

export class Auth {
  readonly type: AuthType;
  readonly config: AuthConfig;

  constructor(config: AuthConfig) {
    this.type = config.type;
    this.config = config;
  }

  /**
   * Apply authentication to headers
   * Returns a new array with auth headers added
   */
  applyToHeaders(headers: Header[]): Header[] {
    // Clone headers array to avoid mutation
    const result = [...headers];

    switch (this.type) {
      case AuthType.NONE:
        // No authentication - return headers unchanged
        break;

      case AuthType.API_KEY: {
        const config = this.config as ApiKeyConfig;
        result.push({
          name: config.headerName,
          value: config.value,
          enabled: true,
        });
        break;
      }

      case AuthType.BEARER: {
        const config = this.config as BearerConfig;
        result.push({
          name: 'Authorization',
          value: `Bearer ${config.token}`,
          enabled: true,
        });
        break;
      }

      case AuthType.BASIC: {
        const config = this.config as BasicAuthConfig;
        const credentials = `${config.username}:${config.password}`;
        const encoded = Buffer.from(credentials).toString('base64');
        result.push({
          name: 'Authorization',
          value: `Basic ${encoded}`,
          enabled: true,
        });
        break;
      }
    }

    return result;
  }

  /**
   * Serialize to JSON
   */
  toJSON(): AuthConfig {
    return this.config;
  }

  /**
   * Deserialize from JSON
   */
  static fromJSON(json: AuthConfig): Auth {
    return new Auth(json);
  }

  /**
   * Create default (no auth)
   */
  static createDefault(): Auth {
    return new Auth({ type: AuthType.NONE });
  }
}
