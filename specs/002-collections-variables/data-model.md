# Data Model: Collections & Environment Variables

**Feature**: 002-collections-variables
**Date**: 2025-01-11
**Phase**: Phase 1 - Design

## Entity Relationship Diagram

```
┌─────────────────┐         ┌──────────────────┐
│   Environment   │         │    Collection    │
├─────────────────┤         ├──────────────────┤
│ id: string      │         │ id: string       │
│ name: string    │         │ name: string     │
│ variables: {}   │         │ order: number    │
│ createdAt: date │         │ createdAt: date  │
│ updatedAt: date │         │ updatedAt: date  │
└─────────────────┘         └────────┬─────────┘
                                     │
                                     │ 1:N
                                     │
                            ┌────────▼──────────┐
                            │  SavedRequest     │
                            ├───────────────────┤
                            │ id: string        │
                            │ collectionId: str │
                            │ name: string      │
                            │ url: string       │  (may contain {{var}})
                            │ method: HttpMethod│
                            │ headers: Header[] │  (may contain {{var}})
                            │ queryParams: []   │  (may contain {{var}})
                            │ body: string      │  (may contain {{var}})
                            │ bodyType: BodyType│
                            │ auth: Auth        │
                            │ order: number     │
                            │ createdAt: date   │
                            │ updatedAt: date   │
                            └───────────────────┘
```

## Entity Definitions

### Environment

**Purpose**: Named configuration context containing variable definitions

**Fields**:
- `id` (string, UUID): Unique identifier
- `name` (string, 1-100 chars): Display name (e.g., "Development", "Production")
- `variables` (Record<string, string>): Key-value pairs of variable definitions
- `createdAt` (ISO date string): Creation timestamp
- `updatedAt` (ISO date string): Last modification timestamp

**Validation Rules**:
- `name` must be unique (case-insensitive) across all environments
- `name` must match `/^[a-zA-Z0-9\s_-]+$/` (alphanumeric, spaces, hyphens, underscores)
- Variable keys must match `/^[a-zA-Z_][a-zA-Z0-9_]*$/` (valid identifier)
- Variable values can contain any string (including other `{{variables}}`)

**Example**:
```typescript
{
  id: "env-123-uuid",
  name: "Development",
  variables: {
    baseUrl: "https://api.dev.example.com",
    apiKey: "dev_key_abc123",
    timeout: "5000",
    domain: "dev.example.com",
    protocol: "https"
  },
  createdAt: "2025-01-11T10:00:00Z",
  updatedAt: "2025-01-11T12:30:00Z"
}
```

---

### Variable

**Purpose**: Single key-value pair within an environment

**Fields**:
- `key` (string): Variable name (identifier format)
- `value` (string): Variable value (any string, may reference other variables)

**Validation Rules**:
- Keys must start with letter or underscore
- Keys can only contain letters, numbers, underscores
- Values have no restrictions (can be empty string)
- Circular references detected at resolution time, not storage time

**Usage**: Variables are stored as a flat object within Environment, not as separate entities.

---

### Collection

**Purpose**: Named container for organizing related saved requests

**Fields**:
- `id` (string, UUID): Unique identifier
- `name` (string, 1-100 chars): Display name (e.g., "User Management APIs")
- `order` (number): Display order in sidebar (0-based index)
- `createdAt` (ISO date string): Creation timestamp
- `updatedAt` (ISO date string): Last modification timestamp

**Validation Rules**:
- `name` must be unique (case-insensitive) across all collections
- `name` must match `/^[a-zA-Z0-9\s_-]+$/`
- `order` is auto-managed (new collections appended to end)

**Relationships**:
- Has many `SavedRequest` (1:N relationship)

**Example**:
```typescript
{
  id: "col-456-uuid",
  name: "User Management APIs",
  order: 0,
  createdAt: "2025-01-11T09:00:00Z",
  updatedAt: "2025-01-11T11:00:00Z"
}
```

---

### SavedRequest

**Purpose**: Persisted snapshot of a request configuration

**Fields**:
- `id` (string, UUID): Unique identifier
- `collectionId` (string, UUID): Parent collection reference
- `name` (string, 1-200 chars): Descriptive name (e.g., "Create User", "Get All Products")
- `url` (string): Request URL (may contain `{{variables}}`)
- `method` (HttpMethod enum): GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- `headers` (Header[]): Request headers (name/value pairs, may contain `{{variables}}`)
- `queryParams` (QueryParam[]): Query parameters (key/value pairs, may contain `{{variables}}`)
- `body` (string): Request body content (may contain `{{variables}}`)
- `bodyType` (BodyType enum): json, form-data, raw, none
- `auth` (Auth): Authentication configuration
- `order` (number): Display order within collection (0-based index)
- `createdAt` (ISO date string): Creation timestamp
- `updatedAt` (ISO date string): Last modification timestamp

**Validation Rules**:
- `name` must be unique within its collection (not globally unique)
- All fields preserve `{{variable}}` syntax as-is (no resolution on save)
- `url` validated only when resolved (may be invalid template until variables applied)
- `headers`, `queryParams`, `body` can all contain `{{variables}}`

**Relationships**:
- Belongs to one `Collection` (N:1 relationship)

**Example**:
```typescript
{
  id: "req-789-uuid",
  collectionId: "col-456-uuid",
  name: "Create User",
  url: "{{baseUrl}}/api/v1/users",
  method: "POST",
  headers: [
    { name: "Authorization", value: "Bearer {{apiKey}}", enabled: true },
    { name: "Content-Type", value: "application/json", enabled: true }
  ],
  queryParams: [],
  body: JSON.stringify({ name: "{{userName}}", email: "{{userEmail}}" }, null, 2),
  bodyType: "json",
  auth: {
    type: "bearer",
    token: "{{apiKey}}"
  },
  order: 0,
  createdAt: "2025-01-11T09:15:00Z",
  updatedAt: "2025-01-11T10:30:00Z"
}
```

---

## State Transitions

### Environment Lifecycle

```
[Created] → (user edits) → [Updated] → (user deletes) → [Deleted]
    ↓
[Activated] ← (user switches) → [Deactivated]
```

**Rules**:
- Only one environment can be `active` at a time
- Deleting active environment prompts user to select another
- Cannot delete if it's the only environment (must have ≥1)

### Collection Lifecycle

```
[Created Empty] → (user adds requests) → [Contains Requests] → (user deletes) → [Deleted with warning]
```

**Rules**:
- Deleting non-empty collection requires confirmation
- Deleting collection cascades to delete all contained SavedRequests
- Reordering collections updates `order` field for all affected collections

### SavedRequest Lifecycle

```
[Saved from Builder] → (user loads) → [Loaded into Builder] → (user modifies & saves) → [Updated]
    ↓
(user deletes from sidebar) → [Deleted]
```

**Rules**:
- Loading a request overwrites current request builder state
- Saving over existing request (same ID) performs update, not create
- Moving to different collection updates `collectionId` field

---

## Storage Schema

### File: `~/.config/swiftapi/environments.json`

```typescript
interface EnvironmentsStorage {
  activeEnvironmentId: string | null;  // UUID of currently active environment
  environments: Record<string, Environment>;  // Map of id → Environment
}
```

**Example**:
```json
{
  "activeEnvironmentId": "env-123-uuid",
  "environments": {
    "env-123-uuid": {
      "id": "env-123-uuid",
      "name": "Development",
      "variables": {
        "baseUrl": "https://api.dev.example.com",
        "apiKey": "dev_key_123"
      },
      "createdAt": "2025-01-11T10:00:00Z",
      "updatedAt": "2025-01-11T12:00:00Z"
    },
    "env-456-uuid": {
      "id": "env-456-uuid",
      "name": "Production",
      "variables": {
        "baseUrl": "https://api.example.com",
        "apiKey": "prod_key_xyz"
      },
      "createdAt": "2025-01-11T10:05:00Z",
      "updatedAt": "2025-01-11T10:05:00Z"
    }
  }
}
```

### File: `~/.config/swiftapi/collections.json`

```typescript
interface CollectionsStorage {
  collections: Record<string, CollectionWithRequests>;  // Map of id → Collection + Requests
}

interface CollectionWithRequests extends Collection {
  requests: Record<string, SavedRequest>;  // Map of id → SavedRequest
}
```

**Example**:
```json
{
  "collections": {
    "col-123-uuid": {
      "id": "col-123-uuid",
      "name": "User Management",
      "order": 0,
      "createdAt": "2025-01-11T09:00:00Z",
      "updatedAt": "2025-01-11T11:00:00Z",
      "requests": {
        "req-789-uuid": {
          "id": "req-789-uuid",
          "collectionId": "col-123-uuid",
          "name": "Create User",
          "url": "{{baseUrl}}/users",
          "method": "POST",
          "headers": [],
          "queryParams": [],
          "body": "{\"name\": \"{{userName}}\"}",
          "bodyType": "json",
          "auth": { "type": "none" },
          "order": 0,
          "createdAt": "2025-01-11T09:15:00Z",
          "updatedAt": "2025-01-11T10:00:00Z"
        }
      }
    }
  }
}
```

---

## Model Classes

### TypeScript Class Structure

```typescript
// src/models/Environment.ts
export class Environment {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly variables: Record<string, string>,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {
    this.validate();
  }

  static create(name: string, variables: Record<string, string> = {}): Environment {
    return new Environment(
      generateUUID(),
      name,
      variables,
      new Date().toISOString(),
      new Date().toISOString()
    );
  }

  update(changes: Partial<Pick<Environment, 'name' | 'variables'>>): Environment {
    return new Environment(
      this.id,
      changes.name ?? this.name,
      changes.variables ?? this.variables,
      this.createdAt,
      new Date().toISOString()
    );
  }

  private validate(): void {
    if (!this.name || this.name.length === 0 || this.name.length > 100) {
      throw new Error('Environment name must be 1-100 characters');
    }
    if (!/^[a-zA-Z0-9\s_-]+$/.test(this.name)) {
      throw new Error('Environment name contains invalid characters');
    }
    for (const key of Object.keys(this.variables)) {
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
        throw new Error(`Invalid variable name: ${key}`);
      }
    }
  }
}

// src/models/Collection.ts
export class Collection {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly order: number,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {
    this.validate();
  }

  static create(name: string, order: number = 0): Collection {
    return new Collection(
      generateUUID(),
      name,
      order,
      new Date().toISOString(),
      new Date().toISOString()
    );
  }

  update(changes: Partial<Pick<Collection, 'name' | 'order'>>): Collection {
    return new Collection(
      this.id,
      changes.name ?? this.name,
      changes.order ?? this.order,
      this.createdAt,
      new Date().toISOString()
    );
  }

  private validate(): void {
    if (!this.name || this.name.length === 0 || this.name.length > 100) {
      throw new Error('Collection name must be 1-100 characters');
    }
    if (!/^[a-zA-Z0-9\s_-]+$/.test(this.name)) {
      throw new Error('Collection name contains invalid characters');
    }
  }
}

// src/models/SavedRequest.ts
export class SavedRequest {
  constructor(
    public readonly id: string,
    public readonly collectionId: string,
    public readonly name: string,
    public readonly url: string,
    public readonly method: HttpMethod,
    public readonly headers: Header[],
    public readonly queryParams: QueryParam[],
    public readonly body: string,
    public readonly bodyType: BodyType,
    public readonly auth: Auth,
    public readonly order: number,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {
    this.validate();
  }

  static fromRequest(
    collectionId: string,
    name: string,
    request: Request,
    order: number = 0
  ): SavedRequest {
    return new SavedRequest(
      generateUUID(),
      collectionId,
      name,
      request.url,
      request.method,
      request.headers,
      request.queryParams || [],
      request.body,
      request.bodyType,
      request.auth || Auth.createDefault(),
      order,
      new Date().toISOString(),
      new Date().toISOString()
    );
  }

  toRequest(): Request {
    return new Request({
      url: this.url,
      method: this.method,
      headers: this.headers,
      body: this.body,
      bodyType: this.bodyType
    });
  }

  private validate(): void {
    if (!this.name || this.name.length === 0 || this.name.length > 200) {
      throw new Error('Request name must be 1-200 characters');
    }
  }
}
```

---

## Variable Resolution

### Resolution Algorithm

**Function**: `resolveVariables(text: string, variables: Record<string, string>): string`

**Logic**:
1. Scan text for all `{{variableName}}` patterns
2. For each match:
   - Extract variable name
   - Look up value in variables map
   - If not found, throw error listing undefined variable
   - Replace `{{name}}` with value
   - If value contains `{{...}}`, recursively resolve (up to max depth 10)
   - Track seen variables to detect circular references
3. Return fully resolved text

**Edge Cases**:
- **Undefined Variable**: Throw error before sending request
- **Circular Reference**: Throw error with cycle path (e.g., "a → b → c → a")
- **Max Depth Exceeded**: Throw error (prevents infinite loops)
- **Escaped Braces**: `{{{{` renders as literal `{{` (not implemented in v1)

---

## Validation Summary

| Entity | Field | Validation Rule |
|--------|-------|----------------|
| Environment | name | 1-100 chars, alphanumeric + space/hyphen/underscore, unique case-insensitive |
| Environment | variables[key] | Must match `/^[a-zA-Z_][a-zA-Z0-9_]*$/` |
| Collection | name | 1-100 chars, alphanumeric + space/hyphen/underscore, unique case-insensitive |
| SavedRequest | name | 1-200 chars, unique within collection |
| SavedRequest | url | Validated after variable resolution (may contain `{{var}}`) |
| Variable | resolution | Detect circular refs, max depth 10 |

---

**Phase 1 Design Complete** ✅
Next: Generate contracts and quickstart guide
