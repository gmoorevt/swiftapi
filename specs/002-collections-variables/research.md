# Research: Collections & Environment Variables

**Feature**: 002-collections-variables
**Date**: 2025-01-11
**Phase**: Phase 0 - Research & Decision Making

## Research Questions

All technical decisions were informed by the spec's assumptions and existing codebase patterns from Feature 001.

### Q1: Variable Syntax - Why {{variable}} over other options?

**Decision**: Use double-brace `{{variable}}` syntax

**Rationale**:
- **Industry Standard**: Postman and Insomnia both use this syntax - users already familiar
- **Clear Delimiter**: Double braces are unambiguous, rarely appear in URLs/JSON naturally
- **Easy to Parse**: Simple regex pattern: `/\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g`
- **Visual Distinction**: Stands out clearly in text editors and UIs

**Alternatives Considered**:
1. **`${variable}`** (JavaScript template literal style)
   - ❌ Rejected: Conflicts with JavaScript string templates in code examples
   - ❌ Easy to confuse with actual JS code in pre-request scripts (future feature)

2. **`$variable`** (shell/PHP style)
   - ❌ Rejected: Less visual distinction, harder to spot in URLs
   - ❌ Could conflict with jQuery selectors in documentation

3. **`:variable`** (URL parameter style)
   - ❌ Rejected: Conflicts with actual URL path parameters
   - ❌ Ambiguous in URLs like `/users/:id` (is it a variable or a path param?)

### Q2: Variable Resolution Algorithm - Nested vs Flat?

**Decision**: Support nested variable resolution with circular dependency detection

**Rationale**:
- **User Expectation**: Users expect `{{baseUrl}}={{protocol}}://{{domain}}` to work
- **Flexibility**: Enables composable configurations (e.g., `apiUrl`, `authUrl` both use `{{domain}}`)
- **Spec Requirement**: FR-014 explicitly requires nested resolution

**Implementation Approach**:
```typescript
function resolveVariables(text: string, variables: Record<string, string>, maxDepth: number = 10): string {
  let resolved = text;
  let depth = 0;
  const seen = new Set<string>();

  while (/\{\{[a-zA-Z_][a-zA-Z0-9_]*\}\}/.test(resolved) && depth < maxDepth) {
    const varName = resolved.match(/\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/)?.[1];
    if (!varName) break;

    if (seen.has(varName)) {
      throw new Error(`Circular reference detected: ${Array.from(seen).join(' → ')} → ${varName}`);
    }

    seen.add(varName);
    resolved = resolved.replace(`{{${varName}}}`, variables[varName] || '');
    depth++;
  }

  if (depth >= maxDepth) {
    throw new Error(`Maximum nesting depth (${maxDepth}) exceeded`);
  }

  return resolved;
}
```

**Alternatives Considered**:
1. **Flat Resolution Only** (no nesting)
   - ❌ Rejected: Users would need to repeat common values (e.g., domain in every URL)
   - ❌ Less flexible for real-world scenarios

2. **Single Pass Resolution**
   - ❌ Rejected: Doesn't handle `{{a}}={{b}}` where `b={{c}}`
   - ❌ Confusing behavior when variables reference each other

### Q3: Storage Format - JSON vs SQLite vs Custom Binary?

**Decision**: Use JSON files via electron-store (already in use)

**Rationale**:
- **Already Established**: Feature 001 uses electron-store for history and settings
- **Human-Readable**: Users can inspect/edit JSON files if needed
- **Version Control Friendly**: JSON files work well with git for team sharing
- **Cross-Platform**: electron-store handles platform-specific paths automatically
- **Zero Setup**: No database migrations or schema management needed

**Storage Schema**:
```typescript
// ~/.config/swiftapi/collections.json
{
  "collections": {
    "[uuid]": {
      "id": "uuid",
      "name": "User Management APIs",
      "order": 0,
      "requests": {
        "[uuid]": {
          "id": "uuid",
          "name": "Create User",
          "url": "{{baseUrl}}/users",
          "method": "POST",
          "headers": [...],
          "body": "...",
          "bodyType": "json",
          "auth": {...}
        }
      }
    }
  }
}

// ~/.config/swiftapi/environments.json
{
  "environments": {
    "[uuid]": {
      "id": "uuid",
      "name": "Development",
      "variables": {
        "baseUrl": "https://api.dev.example.com",
        "apiKey": "dev_key_123"
      }
    }
  },
  "activeEnvironmentId": "uuid"
}
```

**Alternatives Considered**:
1. **SQLite Database**
   - ❌ Rejected: Overkill for simple key-value storage
   - ❌ Requires native bindings, complicates cross-platform builds
   - ❌ Not human-readable, harder to debug

2. **IndexedDB** (browser storage)
   - ❌ Rejected: More complex API than needed
   - ❌ Harder to export/import for users
   - ❌ Not a standard choice for Electron apps

3. **Custom Binary Format**
   - ❌ Rejected: Complexity violates Principle III (Simplicity First)
   - ❌ Not human-readable, poor developer experience

### Q4: Collection Organization - Folders vs Flat vs Tags?

**Decision**: Flat collections (no folders) in v1, folders in v2 if needed

**Rationale**:
- **YAGNI Principle**: Spec assumption #5 states "flat collections in initial implementation"
- **Simplicity**: Users can create multiple collections instead of nested folders
- **Lower Complexity**: No tree traversal, drag-and-drop is simpler
- **Fast Iteration**: Can ship faster without folder complexity

**If folders are needed later** (v2):
- Add `parentId` field to Collection model
- Update UI to render tree structure
- Minimal breaking changes (just add optional field)

**Alternatives Considered**:
1. **Nested Folders** (like Postman)
   - ⏸️  Deferred: Good UX but adds complexity
   - ⏸️  Can be added in v2 without breaking changes

2. **Tags** (like GitHub labels)
   - ❌ Rejected: Less intuitive than folders for hierarchical organization
   - ❌ Harder to visualize relationships

### Q5: Environment Switching - UI Placement?

**Decision**: Prominent dropdown in application header (always visible)

**Rationale**:
- **High Frequency Action**: Users switch environments often during testing
- **Context Awareness**: Always visible so users know which environment is active
- **Industry Pattern**: Postman puts environment selector in header
- **Discoverability**: New users will immediately see the feature

**Wireframe**:
```
┌─────────────────────────────────────────────────────────┐
│ SwiftAPI    [Environment: Dev ▼]  [☰ Collections]      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [GET ▼] https://{{baseUrl}}/users        [Send]       │
│         └─ Resolved: https://api.dev.example.com/users  │
│                                                         │
│  [Headers] [Body] [Auth] [Query Params]                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Alternatives Considered**:
1. **Settings Panel** (hidden by default)
   - ❌ Rejected: Too many clicks to access frequently-used feature
   - ❌ Users might not discover it

2. **Context Menu** (right-click)
   - ❌ Rejected: Not discoverable, power-user feature only

### Q6: Performance - How to achieve <50ms variable substitution?

**Decision**: Use memoized resolver with simple string replacement (no regex per variable)

**Rationale**:
- **Spec Requirement**: FR-013 mandates <50ms for constitutional compliance
- **Simple Algorithm**: Direct string replacement is O(n*m) but fast for realistic sizes
- **Memoization**: Cache resolved variables per environment to avoid re-computation

**Performance Strategy**:
1. **Pre-compile variable regex once**: `/\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g`
2. **Single pass extraction**: Find all `{{var}}` references in one scan
3. **Batch resolution**: Resolve all variables in one operation
4. **Memoization**: Cache resolved values per environment
5. **Lazy evaluation**: Only resolve when request is sent, not on every keystroke

**Measured Performance** (target):
- 10 variables: <5ms
- 100 variables: <50ms (constitutional limit)
- 1000 variables: <200ms (warn user, suggest cleanup)

**Alternatives Considered**:
1. **Complex Template Engine** (Handlebars, Mustache)
   - ❌ Rejected: Overkill, adds dependency, slower
   - ❌ Users only need simple substitution, not conditionals/loops

2. **AST Parsing**
   - ❌ Rejected: Over-engineering for simple string replacement
   - ❌ Violates Principle III (Simplicity First)

## Best Practices Research

### Electron Store Best Practices

**From electron-store documentation and Feature 001 implementation**:

1. **Schema Validation**: Define schema for type safety
   ```typescript
   const schema = {
     collections: { type: 'object' },
     environments: { type: 'object' }
   };
   ```

2. **Migrations**: Support schema version upgrades
   ```typescript
   const store = new Store({
     migrations: {
       '1.0.0': store => {
         // Migration logic if storage format changes
       }
     }
   });
   ```

3. **Atomicity**: Use store.set() for atomic writes
   - electron-store handles file locking automatically
   - Safe for concurrent access

### Zustand State Management Best Practices

**From Feature 001 patterns**:

1. **Store Slicing**: Separate concerns into focused stores
   - `collectionStore` - collection CRUD
   - `environmentStore` - environment CRUD
   - `requestStore` - integrate variable resolution

2. **Immer Integration**: Use immer for immutable updates
   ```typescript
   set(produce((state) => {
     state.collections[id] = newCollection;
   }))
   ```

3. **Selectors**: Use selectors for derived state
   ```typescript
   const activeEnvironment = useEnvironmentStore(state =>
     state.environments[state.activeId]
   );
   ```

### React Component Patterns

**From Feature 001 components**:

1. **Controlled Components**: Form inputs controlled by Zustand state
2. **Custom Hooks**: Extract reusable logic (e.g., `useVariableResolver`)
3. **Error Boundaries**: Wrap complex components for graceful degradation
4. **Lazy Loading**: Use React.lazy() for dialogs (not always visible)

## Integration Patterns

### Extending Request Store for Variables

**Approach**: Inject variable resolution into `sendRequest` action

```typescript
// In requestStore.ts
sendRequest: async () => {
  const state = get();
  const envStore = useEnvironmentStore.getState();
  const activeEnv = envStore.environments[envStore.activeId];

  // Resolve variables before creating request
  const resolvedUrl = resolveVariables(state.url, activeEnv?.variables || {});
  const resolvedHeaders = state.headers.map(h => ({
    ...h,
    value: resolveVariables(h.value, activeEnv?.variables || {})
  }));
  const resolvedBody = resolveVariables(state.body, activeEnv?.variables || {});

  const request = new Request({
    url: resolvedUrl,
    method: state.method,
    headers: resolvedHeaders,
    body: resolvedBody,
    ...
  });

  // Send request with resolved values
  const result = await httpService.sendRequest(request);
  ...
}
```

### URL Input Component Enhancement

**Approach**: Show resolved URL as hint below input

```typescript
// In UrlInput.tsx
const url = useRequestStore(state => state.url);
const activeEnv = useEnvironmentStore(state => state.getActiveEnvironment());
const resolvedUrl = useMemo(() =>
  resolveVariables(url, activeEnv?.variables || {}),
  [url, activeEnv]
);

return (
  <div>
    <input value={url} onChange={...} />
    {hasVariables(url) && (
      <div className="text-sm text-gray-500">
        → {resolvedUrl}
      </div>
    )}
  </div>
);
```

## Security Considerations

### Variable Injection Prevention

**Risk**: Malicious variables could inject code/URLs

**Mitigation**:
1. **Validation**: Variable names must match `/^[a-zA-Z_][a-zA-Z0-9_]*$/`
2. **No Eval**: Never use `eval()` or `Function()` constructor
3. **URL Validation**: Validate resolved URLs before sending (already exists in validation.ts)
4. **Sanitization**: HTML-escape variable values in UI display

### Sensitive Data Storage

**Risk**: API keys stored in environment variables

**Recommendation** (documented in quickstart.md):
- Use OS environment variables for production secrets
- SwiftAPI stores locally only (not synced to cloud)
- Users should export environments without secrets when sharing

## Conclusion

All research questions resolved. Key decisions:
1. ✅ `{{variable}}` syntax (industry standard)
2. ✅ Nested resolution with circular detection
3. ✅ JSON storage via electron-store
4. ✅ Flat collections in v1
5. ✅ Header placement for environment switcher
6. ✅ Memoized string replacement for <50ms performance

**No NEEDS CLARIFICATION markers remain**. Ready to proceed to Phase 1 (Design & Contracts).
