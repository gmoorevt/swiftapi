# Quickstart: Basic HTTP Request Builder

**Feature**: Basic HTTP Request Builder
**For**: Developers implementing this feature
**Prerequisites**: Foundation setup complete (package.json, TypeScript, Vitest, Electron configured)

## Overview

This quickstart guide helps developers implement the basic HTTP request builder feature following Test-Driven Development (TDD) as required by the SwiftAPI Constitution.

**Development Time Estimate**: 16-24 hours for MVP
**Test Coverage Target**: 80% minimum

---

## Before You Start

### ✅ Constitution Compliance Checklist

- [ ] Read [spec.md](spec.md) - Understand user requirements
- [ ] Read [data-model.md](data-model.md) - Understand data structures
- [ ] Review [research.md](research.md) - Understand technology choices
- [ ] Confirm TDD workflow: Red → Green → Refactor

### 📦 Install Additional Dependencies

```bash
npm install axios @monaco-editor/react zustand electron-store qs
npm install --save-dev @types/qs
```

---

## TDD Workflow

**CRITICAL**: Follow this workflow for EVERY feature:

```
1. Write Test (RED)
   ↓
2. Run test - it MUST fail
   ↓
3. Write minimal code (GREEN)
   ↓
4. Run test - it MUST pass
   ↓
5. Refactor (keep tests green)
   ↓
6. Commit
```

**Example**:

```typescript
// Step 1: Write failing test
describe('validateUrl', () => {
  it('should prepend https:// to URLs without protocol', () => {
    const result = validateUrl('example.com');
    expect(result.valid).toBe(true);
    expect(result.url).toBe('https://example.com');
  });
});

// Step 2: Run `npm test` - watch it FAIL
// Error: validateUrl is not defined

// Step 3: Write minimal code
export function validateUrl(input: string): ValidationResult {
  const urlWithProtocol = /^https?:\/\//i.test(input)
    ? input
    : 'https://' + input;
  try {
    new URL(urlWithProtocol);
    return { valid: true, url: urlWithProtocol };
  } catch {
    return { valid: false, error: 'Invalid URL' };
  }
}

// Step 4: Run `npm test` - watch it PASS

// Step 5: Refactor if needed (extract constants, improve readability)

// Step 6: Commit
git add . && git commit -m "feat: add URL validation with auto-protocol"
```

---

## Implementation Order (By Priority)

Follow this order to deliver value incrementally:

### Phase 1: Core Infrastructure (P1 - Highest Priority)

**User Story**: Send Simple GET Request

**Tasks** (TDD for each):

1. **Validation Layer** (`src/lib/validation.ts`)
   - Test: URL validation
   - Test: JSON validation
   - Test: Header validation
   - Implement validators

2. **Data Models** (`src/models/`)
   - Test: Request model creation
   - Test: Response model parsing
   - Test: Header model
   - Implement models

3. **HTTP Service** (`src/renderer/services/httpService.ts`)
   - Test: Send GET request with mock axios
   - Test: Handle 200 response
   - Test: Handle network errors
   - Test: Handle timeout
   - Test: Cancel request
   - Implement HTTP service

4. **State Store** (`src/renderer/store/requestStore.ts`)
   - Test: Initial state
   - Test: setUrl action
   - Test: setMethod action
   - Test: setLoading action
   - Implement Zustand store

5. **UI Components** (`src/renderer/components/RequestBuilder/`)
   - Test: UrlInput renders
   - Test: UrlInput onChange updates store
   - Test: MethodSelector renders options
   - Test: SendButton disabled when loading
   - Implement components

6. **Response Viewer** (`src/renderer/components/ResponseViewer/`)
   - Test: StatusDisplay shows code with color
   - Test: HeadersList renders headers
   - Test: BodyViewer displays text
   - Implement viewer components

7. **Integration Test**
   - Test: Complete GET request flow end-to-end
   - Run: `npm run test:integration`

### Phase 2: POST Requests (P2)

**User Story**: Send POST Request with Body

**Tasks**:

1. **Body Editor Component**
   - Test: Textarea renders for POST
   - Test: Hidden for GET
   - Test: Body type selector
   - Implement BodyEditor

2. **Format Service** (`src/renderer/services/formatService.ts`)
   - Test: Pretty-print JSON
   - Test: Validate JSON syntax
   - Test: Detect content type
   - Implement formatters

3. **HTTP Service Extensions**
   - Test: Send POST with JSON body
   - Test: Set Content-Type header
   - Test: Send form-data
   - Extend HTTP service

4. **Integration Test**
   - Test: POST with JSON body end-to-end

### Phase 3: Custom Headers (P3)

**User Story**: Add Custom Headers

**Tasks**:

1. **Headers Editor Component**
   - Test: Add header button
   - Test: Header row renders
   - Test: Delete header
   - Test: Toggle header enabled/disabled
   - Implement HeadersEditor

2. **Store Extensions**
   - Test: addHeader action
   - Test: updateHeader action
   - Test: removeHeader action
   - Extend store

3. **Integration Test**
   - Test: Request with custom headers

### Phase 4: Response Formatting (P4)

**User Story**: View Formatted Response

**Tasks**:

1. **Monaco Editor Integration**
   - Test: Monaco lazy loads
   - Test: JSON syntax highlighting
   - Test: Collapse/expand nodes
   - Implement MonacoWrapper

2. **Format Service Extensions**
   - Test: Format large JSON (1MB)
   - Test: Performance < 500ms
   - Measure and optimize

3. **E2E Test**
   - Test: Complete workflow on all platforms

---

## File Structure Reference

```
src/
├── lib/
│   ├── validation.ts           # URL, JSON, header validation
│   └── validation.test.ts      # Unit tests
├── models/
│   ├── Request.ts              # Request model
│   ├── Response.ts             # Response model
│   ├── Header.ts               # Header model
│   └── *.test.ts               # Model tests
├── renderer/
│   ├── services/
│   │   ├── httpService.ts      # HTTP client (axios wrapper)
│   │   ├── httpService.test.ts # Service tests
│   │   ├── storageService.ts   # Local storage (electron-store)
│   │   ├── formatService.ts    # Response formatting
│   │   └── *.test.ts
│   ├── store/
│   │   ├── requestStore.ts     # Zustand state management
│   │   └── requestStore.test.ts
│   ├── components/
│   │   ├── RequestBuilder/
│   │   │   ├── UrlInput.tsx
│   │   │   ├── UrlInput.test.tsx
│   │   │   ├── MethodSelector.tsx
│   │   │   ├── HeadersEditor.tsx
│   │   │   ├── BodyEditor.tsx
│   │   │   └── SendButton.tsx
│   │   └── ResponseViewer/
│   │       ├── StatusDisplay.tsx
│   │       ├── HeadersList.tsx
│   │       └── BodyViewer.tsx
│   └── App.tsx                 # Main app component
└── main/
    └── index.ts                # Electron main process (minimal changes)
```

---

## Testing Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run coverage

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests (on all platforms in CI)
npm run test:e2e

# Watch mode for TDD
npm run test:watch
```

---

## Performance Validation

**Required before PR**:

```bash
# Run performance tests
npm run test:performance

# Expected results:
# ✅ App load time: < 3 seconds
# ✅ Request overhead: < 100ms
# ✅ Format 1MB JSON: < 500ms
# ✅ Memory usage: < 150MB
```

---

## Code Quality Gates

**Required before PR**:

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Coverage report
npm run coverage
# Must show ≥ 80% coverage
```

---

## Common Patterns

### 1. Creating a Service

```typescript
// src/renderer/services/httpService.ts
import axios, { CancelTokenSource } from 'axios';
import type { Request, Response, HttpResult } from '@/types';

export class HttpService implements IHttpService {
  private cancelTokenSource: CancelTokenSource | null = null;

  async sendRequest(request: Request): Promise<HttpResult> {
    this.cancelTokenSource = axios.CancelToken.source();
    const startTime = Date.now();

    try {
      const response = await axios({
        url: request.url,
        method: request.method,
        headers: this.buildHeaders(request),
        data: this.buildBody(request),
        timeout: request.timeout,
        cancelToken: this.cancelTokenSource.token,
      });

      return {
        success: true,
        response: {
          statusCode: response.status,
          statusText: response.statusText,
          headers: this.parseHeaders(response.headers),
          body: JSON.stringify(response.data),
          responseTime: Date.now() - startTime,
          size: JSON.stringify(response.data).length,
          contentType: response.headers['content-type'] || null,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  cancelRequest(): void {
    this.cancelTokenSource?.cancel('User cancelled request');
  }
}
```

### 2. Creating a Component with Store

```typescript
// src/renderer/components/RequestBuilder/UrlInput.tsx
import { useRequestStore } from '@/store/requestStore';

export function UrlInput(): React.ReactElement {
  const url = useRequestStore((state) => state.url);
  const setUrl = useRequestStore((state) => state.actions.setUrl);

  return (
    <input
      type="text"
      value={url}
      onChange={(e) => setUrl(e.target.value)}
      placeholder="https://api.example.com"
      className="url-input"
    />
  );
}
```

### 3. Writing a Test

```typescript
// src/renderer/components/RequestBuilder/UrlInput.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UrlInput } from './UrlInput';

describe('UrlInput', () => {
  it('renders input field', () => {
    render(<UrlInput />);
    const input = screen.getByPlaceholderText(/api.example.com/i);
    expect(input).toBeInTheDocument();
  });

  it('updates store when value changes', () => {
    render(<UrlInput />);
    const input = screen.getByPlaceholderText(/api.example.com/i);

    fireEvent.change(input, { target: { value: 'https://test.com' } });

    expect(input).toHaveValue('https://test.com');
  });
});
```

---

## Troubleshooting

### Monaco Editor Not Loading

```typescript
// Wrap in React.Suspense
import { Suspense, lazy } from 'react';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

<Suspense fallback={<div>Loading editor...</div>}>
  <MonacoEditor {...props} />
</Suspense>
```

### Axios CORS Issues in Electron

```typescript
// Electron main process - disable web security for development
const win = new BrowserWindow({
  webPreferences: {
    webSecurity: false,  // Only for development!
  },
});
```

### TypeScript Strict Mode Errors

```typescript
// Use type guards
function isResponse(value: unknown): value is Response {
  return typeof value === 'object' && value !== null && 'statusCode' in value;
}
```

---

## Next Steps

After completing implementation:

1. Run full test suite: `npm test`
2. Check coverage: `npm run coverage` (must be ≥ 80%)
3. Run linting: `npm run lint`
4. Run type check: `npm run type-check`
5. Test on all platforms manually
6. Create PR referencing [spec.md](spec.md)

**Ready to implement?** Start with Phase 1, Task 1 (Validation Layer) and follow TDD workflow!

---

## Getting Help

- **Spec Questions**: Review [spec.md](spec.md)
- **Architecture Questions**: Review [data-model.md](data-model.md) and [research.md](research.md)
- **Type Definitions**: Check [contracts/](contracts/)
- **Constitution Questions**: Read [.specify/memory/constitution.md](../../.specify/memory/constitution.md)
