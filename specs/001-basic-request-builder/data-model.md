# Data Model: Basic HTTP Request Builder

**Date**: 2025-11-07
**Feature**: Basic HTTP Request Builder
**Phase**: 1 - Data Model Design

## Overview

This document defines the core data entities for the HTTP request builder feature. All models are designed for local-first architecture with no external dependencies.

---

## Entity Diagram

```
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       │ contains
       │
       ▼
┌─────────────┐
│   Header    │
└─────────────┘

┌─────────────┐
│   Request   │ ──sends──▶ ┌──────────────┐
└─────────────┘            │   Response   │
                           └──────┬───────┘
                                  │
                                  │ contains
                                  │
                                  ▼
                           ┌──────────────┐
                           │    Header    │
                           └──────────────┘
```

---

## 1. Request

Represents an HTTP request to be sent to an API endpoint.

### Properties

| Property | Type | Required | Description | Validation |
|----------|------|----------|-------------|------------|
| `url` | string | Yes | Target URL for the request | Must be valid URL format; auto-prepend https:// if missing protocol |
| `method` | HttpMethod | Yes | HTTP method | One of: GET, POST, PUT, DELETE |
| `headers` | Header[] | No | Custom request headers | Array of Header objects; defaults to empty array |
| `body` | string | No | Request body content | Only for POST, PUT, DELETE; defaults to empty string |
| `bodyType` | BodyType | No | Type of request body | One of: json, formdata, raw; defaults to 'json' |
| `timeout` | number | No | Request timeout in milliseconds | Defaults to 30000 (30 seconds); min 1000, max 300000 |

### Enums

```typescript
enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

enum BodyType {
  JSON = 'json',
  FORM_DATA = 'formdata',
  RAW = 'raw'
}
```

### Business Rules

1. **Body Visibility**: Request body is only editable when method is POST, PUT, or DELETE
2. **URL Protocol**: If URL doesn't start with http:// or https://, automatically prepend https://
3. **JSON Validation**: When bodyType is 'json', validate JSON syntax before sending
4. **Header Uniqueness**: Multiple headers with same name are allowed (per HTTP spec)
5. **Timeout Range**: Timeout must be between 1 second and 5 minutes

### State Transitions

```
[Initial] → [Editing] → [Validating] → [Ready]
                            ↓
                        [Invalid] → [Editing]

[Ready] → [Sending] → [Success] → [Response Received]
              ↓
          [Cancelled]
              ↓
          [Failed]
```

### Example

```json
{
  "url": "https://api.github.com/users/octocat",
  "method": "GET",
  "headers": [
    {
      "name": "Accept",
      "value": "application/json",
      "enabled": true
    }
  ],
  "body": "",
  "bodyType": "json",
  "timeout": 30000
}
```

---

## 2. Header

Represents an HTTP header (request or response).

### Properties

| Property | Type | Required | Description | Validation |
|----------|------|----------|-------------|------------|
| `name` | string | Yes | Header name | Non-empty string; case-insensitive per HTTP spec |
| `value` | string | Yes | Header value | Can be empty string; no CRLF injection |
| `enabled` | boolean | No | Whether header is active | Defaults to true; allows toggling without deleting |

### Business Rules

1. **Case Insensitivity**: Header names are case-insensitive (HTTP spec)
2. **Auto-Generated Headers**: System may add Content-Type based on bodyType
3. **Override Capability**: User-provided headers override auto-generated ones
4. **Security**: Prevent CRLF injection in header values

### Example

```json
{
  "name": "Authorization",
  "value": "Bearer eyJhbGc...",
  "enabled": true
}
```

---

## 3. Response

Represents an HTTP response received from an API endpoint.

### Properties

| Property | Type | Required | Description | Validation |
|----------|------|----------|-------------|------------|
| `statusCode` | number | Yes | HTTP status code | 100-599 |
| `statusText` | string | Yes | HTTP status message | e.g., "OK", "Not Found" |
| `headers` | Header[] | Yes | Response headers | Array of Header objects |
| `body` | string | Yes | Response body content | Can be empty; stored as string regardless of type |
| `responseTime` | number | Yes | Time taken for request in ms | Measured from send to receive |
| `size` | number | Yes | Response size in bytes | Calculated from body length |
| `contentType` | string | No | Response content-type | Extracted from headers; used for formatting |
| `timestamp` | string | Yes | ISO 8601 timestamp | When response was received |

### Business Rules

1. **Status Color Coding**:
   - 2xx: Green (success)
   - 4xx: Yellow (client error)
   - 5xx: Red (server error)

2. **Size Formatting**:
   - < 1KB: Display in bytes
   - < 1MB: Display in KB
   - ≥ 1MB: Display in MB

3. **Large Response Handling**:
   - Responses > 10MB show warning
   - Option to view first 1MB or download full response

4. **Content-Type Detection**:
   - If no content-type header, treat as plain text
   - Auto-detect JSON by attempting parse
   - Support for: JSON, XML, HTML, plain text

### Computed Properties

```typescript
interface Response {
  // ... base properties

  // Computed
  statusCategory: 'success' | 'error' | 'redirect' | 'info';
  formattedSize: string;  // "1.5 MB", "234 KB", "89 bytes"
  isJson: boolean;
  isXml: boolean;
  isHtml: boolean;
}
```

### Example

```json
{
  "statusCode": 200,
  "statusText": "OK",
  "headers": [
    {
      "name": "content-type",
      "value": "application/json; charset=utf-8",
      "enabled": true
    }
  ],
  "body": "{\"login\":\"octocat\",\"id\":1}",
  "responseTime": 245,
  "size": 1024,
  "contentType": "application/json",
  "timestamp": "2025-11-07T10:15:30.123Z"
}
```

---

## 4. RequestState (UI State)

Represents the current state of the request builder UI.

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `currentRequest` | Request | Yes | The request being built |
| `lastResponse` | Response \| null | Yes | Most recent response (null if none) |
| `isLoading` | boolean | Yes | Whether request is in progress |
| `error` | string \| null | Yes | Error message if request failed |
| `cancelToken` | CancelTokenSource \| null | Yes | Axios cancel token for in-flight request |

### Business Rules

1. **Loading State**: isLoading=true disables Send button, shows spinner
2. **Error Display**: Errors shown for 5 seconds then auto-clear
3. **Response Persistence**: Last response persists until new request sent
4. **Cancel Capability**: Cancel token only exists when isLoading=true

---

## 5. StoredSettings (Persistence)

Represents settings persisted to local storage.

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `lastUrl` | string | No | Last URL entered by user |
| `lastMethod` | HttpMethod | No | Last HTTP method selected |
| `theme` | 'light' \| 'dark' \| 'system' | No | UI theme preference |

### Business Rules

1. **Auto-Restore**: Last URL and method restored on app launch
2. **Privacy**: Request bodies and headers NOT persisted (security)
3. **Theme Sync**: Theme changes apply immediately

---

## Validation Rules Summary

### URL Validation
```typescript
function validateUrl(url: string): ValidationResult {
  if (!url.trim()) {
    return { valid: false, error: 'URL cannot be empty' };
  }

  const urlWithProtocol = /^https?:\/\//i.test(url)
    ? url
    : 'https://' + url;

  try {
    new URL(urlWithProtocol);
    return { valid: true, value: urlWithProtocol };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}
```

### JSON Validation
```typescript
function validateJson(text: string): ValidationResult {
  if (!text.trim()) {
    return { valid: true };  // Empty is valid
  }

  try {
    JSON.parse(text);
    return { valid: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid JSON';
    return { valid: false, error: message };
  }
}
```

### Header Validation
```typescript
function validateHeader(name: string, value: string): ValidationResult {
  if (!name.trim()) {
    return { valid: false, error: 'Header name cannot be empty' };
  }

  // Check for CRLF injection
  if (/[\r\n]/.test(name) || /[\r\n]/.test(value)) {
    return { valid: false, error: 'Headers cannot contain newlines' };
  }

  return { valid: true };
}
```

---

## Storage Schema

### electron-store Schema

```typescript
interface StoreSchema {
  settings: {
    lastUrl: string;
    lastMethod: HttpMethod;
    theme: 'light' | 'dark' | 'system';
  };
}

// Example stored data
{
  "settings": {
    "lastUrl": "https://api.github.com/users/octocat",
    "lastMethod": "GET",
    "theme": "system"
  }
}
```

**Storage Location**:
- Windows: `%APPDATA%\swiftapi\config.json`
- macOS: `~/Library/Application Support/swiftapi/config.json`
- Linux: `~/.config/swiftapi/config.json`

---

## Summary

**Core Entities**: 3 (Request, Header, Response)
**Support Entities**: 2 (RequestState, StoredSettings)
**Validation Functions**: 3 (URL, JSON, Header)

All entities designed for:
✅ Local-first architecture (no server communication)
✅ Type safety (TypeScript strict mode)
✅ Validation at boundaries
✅ Clear state transitions
✅ Performance (minimal data structures)

**Next Steps**: Implement TypeScript interfaces in `contracts/`
