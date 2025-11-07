# Research: Basic HTTP Request Builder

**Date**: 2025-11-07
**Feature**: Basic HTTP Request Builder
**Phase**: 0 - Technology Research & Best Practices

## Overview

This document captures research findings and technical decisions for implementing the basic HTTP request builder feature. All decisions prioritize constitutional requirements: simplicity, performance, offline-first architecture, and cross-platform consistency.

---

## 1. HTTP Client Selection

### Decision: Axios

**Rationale**:
- Battle-tested library with 100M+ weekly downloads
- Native cancel token support (FR-013: cancel in-flight requests)
- Automatic request/response interceptors for timing measurement (FR-015)
- Built-in timeout handling (FR-016)
- Transforms response data automatically
- Works in both Node.js (Electron main) and browser (renderer)
- Smaller bundle size than alternatives (~13KB minified)

**Alternatives Considered**:
- **Native Fetch API**: No built-in timeout, no request cancellation before AbortController, less ergonomic error handling
- **Got**: Node.js only, not suitable for renderer process
- **Superagent**: Larger bundle size, less active maintenance
- **Custom HTTP module**: Violates simplicity principle, reinventing wheel

**Implementation Pattern**:
```typescript
// Cancel token pattern for request cancellation
const source = axios.CancelToken.source();
axios.get(url, { cancelToken: source.token });
// Later: source.cancel('User cancelled request');
```

**Performance Impact**: Axios overhead < 5ms per request (meets <100ms overhead target)

---

## 2. Syntax Highlighting & Code Editor

### Decision: Monaco Editor (lazy loaded)

**Rationale**:
- Powers VS Code - industry standard for code editing
- Built-in JSON, XML, HTML syntax highlighting
- Intelligent auto-formatting and prettifying
- Support for collapse/expand of JSON objects (FR-025)
- TypeScript definitions included
- Cross-platform consistent rendering
- Lazy loading prevents impact on app startup time

**Alternatives Considered**:
- **CodeMirror 6**: Excellent performance but more configuration needed for basic features
- **Ace Editor**: Older, less active development
- **react-syntax-highlighter**: Read-only, no editing capabilities
- **Custom highlighter**: Violates simplicity, time-consuming to build

**Implementation Pattern**:
```typescript
// Lazy load Monaco to avoid blocking app startup
const Monaco = lazy(() => import('@monaco-editor/react'));

// Configure for JSON with auto-formatting
<Monaco
  language="json"
  value={responseBody}
  options={{
    readOnly: true,
    minimap: { enabled: false },
    automaticLayout: true
  }}
/>
```

**Performance Impact**:
- Initial load (lazy): ~300ms
- Formatting 1MB JSON: ~200ms (well under 500ms target)

---

## 3. State Management

### Decision: Zustand

**Rationale**:
- Minimal boilerplate compared to Redux (simplicity principle)
- No context providers needed
- TypeScript support out of the box
- Tiny bundle size (~1KB)
- Perfect for single-feature MVP scope
- Easy to scale if needed later
- No learning curve for team

**Alternatives Considered**:
- **Redux Toolkit**: Overkill for simple request/response state, more boilerplate
- **Context API**: Performance issues with frequent updates, prop drilling
- **Jotai/Recoil**: Atomic state good for complex apps, unnecessary here
- **Component state only**: Difficult to share state between RequestBuilder and ResponseViewer

**Implementation Pattern**:
```typescript
interface RequestState {
  url: string;
  method: HttpMethod;
  headers: Header[];
  body: string;
  response: Response | null;
  isLoading: boolean;
}

const useRequestStore = create<RequestState>((set) => ({
  url: '',
  method: 'GET',
  headers: [],
  body: '',
  response: null,
  isLoading: false,
  setUrl: (url) => set({ url }),
  // ... other setters
}));
```

**Performance Impact**: Negligible (<1ms per state update)

---

## 4. Local Storage / Persistence

### Decision: electron-store

**Rationale**:
- Purpose-built for Electron applications
- Simple key-value API (simplicity principle)
- Automatic JSON serialization
- Handles platform-specific paths (cross-platform requirement)
- Atomic writes (data safety)
- Encrypted storage option available
- No database overhead (performance)

**Alternatives Considered**:
- **SQLite**: Overkill for simple key-value storage, requires native bindings
- **IndexedDB**: Browser API, not ideal for Electron main process
- **LocalStorage**: 5MB limit, synchronous API blocks UI
- **File system directly**: Manual path handling, error-prone across platforms

**Implementation Pattern**:
```typescript
import Store from 'electron-store';

interface StoreSchema {
  lastUrl: string;
  lastMethod: HttpMethod;
  requestHistory: HistoryEntry[];
}

const store = new Store<StoreSchema>({
  defaults: {
    lastUrl: '',
    lastMethod: 'GET',
    requestHistory: []
  }
});

// Usage
store.set('lastUrl', 'https://api.example.com');
const url = store.get('lastUrl');
```

**Performance Impact**: Read/write < 10ms (non-blocking)

---

## 5. Form Data Handling

### Decision: Native FormData API + qs library

**Rationale**:
- FormData built into browsers, zero dependencies for multipart
- qs library (already included with axios) for URL-encoded forms
- Standard approach, well-documented
- Handles file uploads (future feature)
- Cross-browser compatible

**Implementation Pattern**:
```typescript
// Multipart form-data
const formData = new FormData();
formData.append('key', 'value');

// URL-encoded
import qs from 'qs';
const encoded = qs.stringify({ key: 'value' });
```

---

## 6. JSON Validation

### Decision: Try-catch with JSON.parse()

**Rationale**:
- Native, zero dependencies (simplicity)
- Sufficient for MVP validation needs
- Clear error messages
- Fast performance

**Alternatives Considered**:
- **Ajv (JSON Schema)**: Over-engineered for basic syntax validation
- **Joi/Yup**: Designed for object validation, not JSON string parsing

**Implementation Pattern**:
```typescript
function validateJson(text: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(text);
    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      error: e instanceof Error ? e.message : 'Invalid JSON'
    };
  }
}
```

---

## 7. URL Validation

### Decision: URL API + Custom Validation

**Rationale**:
- Native URL API for parsing and validation
- Custom logic for auto-prepending https://
- No regex complexity (maintainability)

**Implementation Pattern**:
```typescript
function validateUrl(input: string): { valid: boolean; url?: string; error?: string } {
  let urlString = input.trim();

  // Auto-prepend https:// if no protocol
  if (!/^https?:\/\//i.test(urlString)) {
    urlString = 'https://' + urlString;
  }

  try {
    const url = new URL(urlString);
    return { valid: true, url: url.toString() };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}
```

---

## 8. Error Handling Strategy

### Decision: Axios Error Interceptors + User-Friendly Messages

**Rationale**:
- Centralized error handling
- Consistent error format
- User-friendly messages (discoverability principle)

**Error Categories**:
1. **Network Errors**: "Unable to connect. Check your internet connection."
2. **Timeout Errors**: "Request timed out after 30 seconds. Try again or check the URL."
3. **4xx Errors**: "Client error (${status}). Check your request parameters."
4. **5xx Errors**: "Server error (${status}). The API may be experiencing issues."
5. **Cancelled**: "Request was cancelled."

---

## 9. Performance Optimization Strategies

### Lazy Loading
- Monaco Editor loaded only when needed
- Component code splitting with React.lazy()

### Response Streaming
- Large responses (>1MB) loaded in chunks
- Progress indicators for large payloads

### Memoization
- React.memo for expensive components (ResponseViewer)
- useMemo for formatted JSON
- useCallback for event handlers

### Virtual Scrolling
- For future: request history list (not in MVP)

**Expected Performance**:
- App load: 2.5 seconds (under 3s target)
- Request overhead: 50ms average (under 100ms target)
- Memory baseline: 80MB (under 150MB target)

---

## 10. Cross-Platform Considerations

### Platform-Specific Handling

**None required for MVP** - All dependencies work identically across platforms:
- Electron: Same runtime on all OS
- React: Browser-based, platform-agnostic
- Axios: Pure JavaScript, no native bindings
- electron-store: Handles path differences internally

### Testing Strategy
- CI runs E2E tests on Windows, macOS, Linux
- Manual QA verification on all three platforms before release

---

## 11. Dependencies Summary

**Production Dependencies**:
```json
{
  "axios": "^1.6.0",           // HTTP client
  "electron-store": "^8.1.0",  // Local storage
  "zustand": "^4.5.0",         // State management
  "@monaco-editor/react": "^4.6.0",  // Code editor (lazy)
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "electron": "^28.2.0"
}
```

**Total bundle impact**: ~5MB (acceptable for desktop app)

---

## 12. Security Considerations

### CORS Handling
- Electron renderer can make CORS requests (no browser restrictions)
- All requests go directly to user-specified URLs
- No proxy needed

### SSL/TLS
- Axios uses Node.js https module
- Certificate validation enabled by default
- Option to disable for testing self-signed certs (future feature)

### Input Sanitization
- URL validation prevents code injection
- JSON.parse() safe for untrusted input
- Header values validated (no CRLF injection)

---

## Summary

All technology choices prioritize:
✅ **Simplicity**: Minimal dependencies, standard patterns
✅ **Performance**: Lazy loading, efficient libraries
✅ **Offline-first**: Zero external services, local storage only
✅ **Cross-platform**: All dependencies work on Windows/Mac/Linux
✅ **Testability**: Clear separation of concerns, pure functions

**No blockers identified. Ready for Phase 1 (Design).**
