/**
 * Authentication Types
 *
 * Defines supported authentication methods and their configurations
 */

export enum AuthType {
  NONE = 'none',
  API_KEY = 'api_key',
  BEARER = 'bearer',
  BASIC = 'basic',
}

/**
 * Base auth configuration
 */
export interface AuthConfig {
  type: AuthType;
}

/**
 * No authentication
 */
export interface NoAuthConfig extends AuthConfig {
  type: AuthType.NONE;
}

/**
 * API Key authentication (custom header)
 */
export interface ApiKeyConfig extends AuthConfig {
  type: AuthType.API_KEY;
  headerName: string;
  value: string;
}

/**
 * Bearer token authentication
 */
export interface BearerConfig extends AuthConfig {
  type: AuthType.BEARER;
  token: string;
}

/**
 * Basic authentication (username/password)
 */
export interface BasicAuthConfig extends AuthConfig {
  type: AuthType.BASIC;
  username: string;
  password: string;
}

/**
 * Union type of all auth configs
 */
export type Auth = NoAuthConfig | ApiKeyConfig | BearerConfig | BasicAuthConfig;
