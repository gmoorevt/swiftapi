/**
 * Storage Schema Contracts for Collections & Environment Variables
 *
 * These TypeScript interfaces define the exact structure of data persisted
 * to electron-store (local JSON files). Used for:
 * - Contract tests (validate storage read/write)
 * - Type safety in services
 * - Documentation of storage format
 *
 * Storage Files:
 * - ~/.config/swiftapi/environments.json
 * - ~/.config/swiftapi/collections.json
 */

import { HttpMethod, BodyType, Header, QueryParam } from '../../src/types/request.types';
import { Auth as AuthConfig } from '../../src/types/auth.types';

// ============================================================================
// Environment Storage Schema
// ============================================================================

/**
 * Root structure for environments.json
 */
export interface EnvironmentsStorage {
  /** UUID of the currently active environment, or null if none selected */
  activeEnvironmentId: string | null;

  /** Map of environment ID → Environment */
  environments: Record<string, EnvironmentData>;
}

/**
 * Single environment with variable definitions
 */
export interface EnvironmentData {
  /** Unique identifier (UUID v4) */
  id: string;

  /** Display name (1-100 chars, alphanumeric + space/hyphen/underscore) */
  name: string;

  /** Variable definitions (key → value) */
  variables: Record<string, string>;

  /** ISO 8601 timestamp of creation */
  createdAt: string;

  /** ISO 8601 timestamp of last modification */
  updatedAt: string;
}

/**
 * Validation rules for EnvironmentData
 */
export const EnvironmentValidation = {
  name: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s_-]+$/,
    patternDescription: 'alphanumeric, spaces, hyphens, underscores only'
  },
  variableKey: {
    pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
    patternDescription: 'must start with letter/underscore, then alphanumeric/underscore'
  }
} as const;

// ============================================================================
// Collection Storage Schema
// ============================================================================

/**
 * Root structure for collections.json
 */
export interface CollectionsStorage {
  /** Map of collection ID → Collection with nested requests */
  collections: Record<string, CollectionData>;
}

/**
 * Single collection with saved requests
 */
export interface CollectionData {
  /** Unique identifier (UUID v4) */
  id: string;

  /** Display name (1-100 chars, alphanumeric + space/hyphen/underscore) */
  name: string;

  /** Display order in sidebar (0-based index, auto-managed) */
  order: number;

  /** ISO 8601 timestamp of creation */
  createdAt: string;

  /** ISO 8601 timestamp of last modification */
  updatedAt: string;

  /** Map of request ID → SavedRequest */
  requests: Record<string, SavedRequestData>;
}

/**
 * Single saved request within a collection
 */
export interface SavedRequestData {
  /** Unique identifier (UUID v4) */
  id: string;

  /** Parent collection ID (foreign key) */
  collectionId: string;

  /** Descriptive name (1-200 chars) */
  name: string;

  /** Request URL (may contain {{variables}}) */
  url: string;

  /** HTTP method */
  method: HttpMethod;

  /** Request headers (may contain {{variables}} in values) */
  headers: Header[];

  /** Query parameters (may contain {{variables}} in keys/values) */
  queryParams: QueryParam[];

  /** Request body content (may contain {{variables}}) */
  body: string;

  /** Body content type */
  bodyType: BodyType;

  /** Authentication configuration */
  auth: AuthConfig;

  /** Display order within collection (0-based index, auto-managed) */
  order: number;

  /** ISO 8601 timestamp of creation */
  createdAt: string;

  /** ISO 8601 timestamp of last modification */
  updatedAt: string;
}

/**
 * Validation rules for CollectionData
 */
export const CollectionValidation = {
  name: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s_-]+$/,
    patternDescription: 'alphanumeric, spaces, hyphens, underscores only'
  }
} as const;

/**
 * Validation rules for SavedRequestData
 */
export const SavedRequestValidation = {
  name: {
    minLength: 1,
    maxLength: 200
  }
} as const;

// ============================================================================
// Import/Export Formats
// ============================================================================

/**
 * Format for exporting a single collection (for sharing/backup)
 */
export interface CollectionExport {
  /** File format version for migration support */
  version: string;

  /** Export timestamp */
  exportedAt: string;

  /** Collection data with all nested requests */
  collection: CollectionData;
}

/**
 * Format for exporting a single environment (for sharing/backup)
 */
export interface EnvironmentExport {
  /** File format version for migration support */
  version: string;

  /** Export timestamp */
  exportedAt: string;

  /** Environment data */
  environment: EnvironmentData;
}

/**
 * Format for exporting multiple collections at once
 */
export interface CollectionBulkExport {
  version: string;
  exportedAt: string;
  collections: CollectionData[];
}

/**
 * Format for exporting multiple environments at once
 */
export interface EnvironmentBulkExport {
  version: string;
  exportedAt: string;
  environments: EnvironmentData[];
}

// ============================================================================
// Storage Schema Versions
// ============================================================================

/**
 * Current schema version for environments.json
 * Increment when making breaking changes to EnvironmentsStorage structure
 */
export const ENVIRONMENTS_SCHEMA_VERSION = '1.0.0';

/**
 * Current schema version for collections.json
 * Increment when making breaking changes to CollectionsStorage structure
 */
export const COLLECTIONS_SCHEMA_VERSION = '1.0.0';

/**
 * Current export format version
 * Increment when making breaking changes to export file structures
 */
export const EXPORT_FORMAT_VERSION = '1.0.0';

// ============================================================================
// Storage Paths (platform-specific, managed by electron-store)
// ============================================================================

/**
 * Storage keys used in electron-store
 */
export const StorageKeys = {
  ENVIRONMENTS: 'environments',
  COLLECTIONS: 'collections'
} as const;

/**
 * Default storage values (used on first run)
 */
export const DefaultStorage = {
  environments: {
    activeEnvironmentId: null,
    environments: {}
  } as EnvironmentsStorage,

  collections: {
    collections: {}
  } as CollectionsStorage
} as const;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for EnvironmentData
 */
export function isValidEnvironment(obj: unknown): obj is EnvironmentData {
  if (typeof obj !== 'object' || obj === null) return false;
  const env = obj as Partial<EnvironmentData>;

  return (
    typeof env.id === 'string' &&
    typeof env.name === 'string' &&
    env.name.length >= 1 &&
    env.name.length <= 100 &&
    EnvironmentValidation.name.pattern.test(env.name) &&
    typeof env.variables === 'object' &&
    env.variables !== null &&
    typeof env.createdAt === 'string' &&
    typeof env.updatedAt === 'string'
  );
}

/**
 * Type guard for CollectionData
 */
export function isValidCollection(obj: unknown): obj is CollectionData {
  if (typeof obj !== 'object' || obj === null) return false;
  const col = obj as Partial<CollectionData>;

  return (
    typeof col.id === 'string' &&
    typeof col.name === 'string' &&
    col.name.length >= 1 &&
    col.name.length <= 100 &&
    CollectionValidation.name.pattern.test(col.name) &&
    typeof col.order === 'number' &&
    typeof col.createdAt === 'string' &&
    typeof col.updatedAt === 'string' &&
    typeof col.requests === 'object' &&
    col.requests !== null
  );
}

/**
 * Type guard for SavedRequestData
 */
export function isValidSavedRequest(obj: unknown): obj is SavedRequestData {
  if (typeof obj !== 'object' || obj === null) return false;
  const req = obj as Partial<SavedRequestData>;

  return (
    typeof req.id === 'string' &&
    typeof req.collectionId === 'string' &&
    typeof req.name === 'string' &&
    req.name.length >= 1 &&
    req.name.length <= 200 &&
    typeof req.url === 'string' &&
    typeof req.method === 'string' &&
    Array.isArray(req.headers) &&
    Array.isArray(req.queryParams) &&
    typeof req.body === 'string' &&
    typeof req.bodyType === 'string' &&
    typeof req.auth === 'object' &&
    typeof req.order === 'number' &&
    typeof req.createdAt === 'string' &&
    typeof req.updatedAt === 'string'
  );
}
