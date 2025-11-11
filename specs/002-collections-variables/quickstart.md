# Developer Quick Start: Collections & Environment Variables

**Feature**: 002-collections-variables | **Date**: 2025-01-11
**Prerequisites**: Feature 001 (Basic Request Builder) complete

## Overview

This guide walks you through implementing Collections & Environment Variables using **Test-Driven Development (TDD)**. Follow the RED-GREEN-REFACTOR cycle for all code.

**Key Files Created** (from plan.md):
- Models: `Environment.ts`, `Collection.ts`, `SavedRequest.ts`, `Variable.ts`
- Services: `environmentService.ts`, `collectionService.ts`, `importExportService.ts`
- Stores: `environmentStore.ts`, `collectionStore.ts`
- Lib: `variableResolver.ts`
- Components: `EnvironmentSelector/`, `CollectionSidebar/`, `Dialogs/`

## TDD Workflow

**Constitutional Requirement**: Principle I (Test-First Development) is NON-NEGOTIABLE.

### RED-GREEN-REFACTOR Cycle

```text
1. 🔴 RED:   Write a failing test first
2. 🟢 GREEN: Write minimal code to make it pass
3. 🔵 REFACTOR: Improve code without changing behavior
4. ✅ COMMIT: Commit after each cycle
```

**Never write production code without a failing test first.**

## Phase-by-Phase Implementation

### Phase 1: Core Variable Resolution Engine

**Start here** - this is the foundation for everything else.

#### Step 1.1: Variable Resolver Tests (RED)

Create `src/lib/variableResolver.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { resolveVariables, VariableResolutionError } from './variableResolver';

describe('variableResolver', () => {
  describe('basic substitution', () => {
    it('should replace single variable', () => {
      const text = 'Hello {{name}}';
      const variables = { name: 'World' };
      expect(resolveVariables(text, variables)).toBe('Hello World');
    });

    it('should replace multiple variables', () => {
      const text = '{{protocol}}://{{domain}}/{{path}}';
      const variables = { protocol: 'https', domain: 'api.example.com', path: 'users' };
      expect(resolveVariables(text, variables)).toBe('https://api.example.com/users');
    });

    it('should handle text with no variables', () => {
      expect(resolveVariables('https://api.example.com', {})).toBe('https://api.example.com');
    });
  });

  describe('nested resolution', () => {
    it('should resolve nested variables', () => {
      const text = '{{baseUrl}}/users';
      const variables = {
        baseUrl: '{{protocol}}://{{domain}}',
        protocol: 'https',
        domain: 'api.dev.example.com'
      };
      expect(resolveVariables(text, variables)).toBe('https://api.dev.example.com/users');
    });

    it('should handle deeply nested variables (up to 10 levels)', () => {
      const variables = {
        a: '{{b}}',
        b: '{{c}}',
        c: '{{d}}',
        d: '{{e}}',
        e: '{{f}}',
        f: '{{g}}',
        g: '{{h}}',
        h: '{{i}}',
        i: '{{j}}',
        j: 'final'
      };
      expect(resolveVariables('{{a}}', variables)).toBe('final');
    });
  });

  describe('error handling', () => {
    it('should throw on undefined variable', () => {
      expect(() => resolveVariables('{{missing}}', {}))
        .toThrow(VariableResolutionError);
    });

    it('should throw on circular reference', () => {
      const variables = { a: '{{b}}', b: '{{a}}' };
      expect(() => resolveVariables('{{a}}', variables))
        .toThrow('Circular reference detected: a → b → a');
    });

    it('should throw on max depth exceeded', () => {
      const variables: Record<string, string> = {};
      for (let i = 0; i < 15; i++) {
        variables[`v${i}`] = `{{v${i + 1}}}`;
      }
      variables.v15 = 'end';

      expect(() => resolveVariables('{{v0}}', variables))
        .toThrow('Maximum nesting depth (10) exceeded');
    });
  });

  describe('performance', () => {
    it('should resolve 100 variables in under 50ms', () => {
      const variables: Record<string, string> = {};
      let text = '';

      for (let i = 0; i < 100; i++) {
        variables[`var${i}`] = `value${i}`;
        text += `{{var${i}}} `;
      }

      const start = performance.now();
      resolveVariables(text, variables);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50); // Constitutional requirement
    });
  });
});
```

**Run test** (should fail):
```bash
npm test -- variableResolver.test.ts
```

#### Step 1.2: Variable Resolver Implementation (GREEN)

Create `src/lib/variableResolver.ts`:

```typescript
export class VariableResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VariableResolutionError';
  }
}

const VARIABLE_PATTERN = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
const MAX_DEPTH = 10;

export function resolveVariables(
  text: string,
  variables: Record<string, string>
): string {
  let resolved = text;
  let depth = 0;
  const resolutionPath: string[] = [];

  while (VARIABLE_PATTERN.test(resolved) && depth < MAX_DEPTH) {
    VARIABLE_PATTERN.lastIndex = 0; // Reset regex state

    const match = VARIABLE_PATTERN.exec(resolved);
    if (!match) break;

    const varName = match[1];

    // Check for circular reference
    if (resolutionPath.includes(varName)) {
      const cycle = [...resolutionPath, varName].join(' → ');
      throw new VariableResolutionError(`Circular reference detected: ${cycle}`);
    }

    // Check if variable exists
    if (!(varName in variables)) {
      throw new VariableResolutionError(
        `Variable {{${varName}}} is not defined in current environment`
      );
    }

    resolutionPath.push(varName);
    resolved = resolved.replace(`{{${varName}}}`, variables[varName]);
    depth++;
    VARIABLE_PATTERN.lastIndex = 0; // Reset for next iteration
  }

  if (depth >= MAX_DEPTH) {
    throw new VariableResolutionError(`Maximum nesting depth (${MAX_DEPTH}) exceeded`);
  }

  return resolved;
}

/**
 * Extract all variable names from text
 */
export function extractVariables(text: string): string[] {
  const matches = text.matchAll(VARIABLE_PATTERN);
  return Array.from(matches, m => m[1]);
}

/**
 * Check if text contains any variables
 */
export function hasVariables(text: string): boolean {
  return VARIABLE_PATTERN.test(text);
}
```

**Run test** (should pass):
```bash
npm test -- variableResolver.test.ts
```

#### Step 1.3: Refactor (REFACTOR)

- Add JSDoc comments
- Extract constants
- Optimize regex usage

**Commit**:
```bash
git add src/lib/variableResolver.ts src/lib/variableResolver.test.ts
git commit -m "feat: add variable resolution engine with nested support

- Implement {{variable}} substitution with <50ms performance
- Support nested variables up to 10 levels deep
- Detect circular references with clear error messages
- Add performance tests (100 vars < 50ms)

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Phase 2: Domain Models

#### Step 2.1: Environment Model Tests (RED)

Create `src/models/Environment.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { Environment } from './Environment';

describe('Environment', () => {
  describe('creation', () => {
    it('should create environment with valid data', () => {
      const env = Environment.create('Development', { baseUrl: 'http://localhost' });

      expect(env.id).toBeDefined();
      expect(env.name).toBe('Development');
      expect(env.variables).toEqual({ baseUrl: 'http://localhost' });
      expect(env.createdAt).toBeDefined();
      expect(env.updatedAt).toBe(env.createdAt);
    });

    it('should create environment with empty variables', () => {
      const env = Environment.create('Empty');
      expect(env.variables).toEqual({});
    });
  });

  describe('validation', () => {
    it('should reject empty name', () => {
      expect(() => Environment.create('')).toThrow('Environment name must be 1-100 characters');
    });

    it('should reject name over 100 characters', () => {
      const longName = 'a'.repeat(101);
      expect(() => Environment.create(longName))
        .toThrow('Environment name must be 1-100 characters');
    });

    it('should reject name with invalid characters', () => {
      expect(() => Environment.create('Dev@2025'))
        .toThrow('Environment name contains invalid characters');
    });

    it('should accept valid characters in name', () => {
      expect(() => Environment.create('Dev_Env-2025')).not.toThrow();
      expect(() => Environment.create('Development 2025')).not.toThrow();
    });

    it('should reject invalid variable names', () => {
      expect(() => Environment.create('Dev', { '123invalid': 'value' }))
        .toThrow('Invalid variable name: 123invalid');

      expect(() => Environment.create('Dev', { 'invalid-name': 'value' }))
        .toThrow('Invalid variable name: invalid-name');
    });

    it('should accept valid variable names', () => {
      expect(() => Environment.create('Dev', {
        baseUrl: 'http://localhost',
        _privateVar: 'value',
        API_KEY: 'key123'
      })).not.toThrow();
    });
  });

  describe('updates', () => {
    it('should update name', () => {
      const env = Environment.create('Dev');
      const updated = env.update({ name: 'Development' });

      expect(updated.name).toBe('Development');
      expect(updated.id).toBe(env.id);
      expect(updated.createdAt).toBe(env.createdAt);
      expect(updated.updatedAt).not.toBe(env.createdAt);
    });

    it('should update variables', () => {
      const env = Environment.create('Dev', { old: 'value' });
      const updated = env.update({ variables: { new: 'value' } });

      expect(updated.variables).toEqual({ new: 'value' });
    });

    it('should validate on update', () => {
      const env = Environment.create('Dev');
      expect(() => env.update({ name: '' }))
        .toThrow('Environment name must be 1-100 characters');
    });
  });
});
```

#### Step 2.2: Environment Model Implementation (GREEN)

Create `src/models/Environment.ts`:

```typescript
import { randomUUID } from 'crypto';

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
    const now = new Date().toISOString();
    return new Environment(
      randomUUID(),
      name,
      variables,
      now,
      now
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
    // Name validation
    if (!this.name || this.name.length === 0 || this.name.length > 100) {
      throw new Error('Environment name must be 1-100 characters');
    }

    const namePattern = /^[a-zA-Z0-9\s_-]+$/;
    if (!namePattern.test(this.name)) {
      throw new Error('Environment name contains invalid characters');
    }

    // Variable name validation
    const varPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    for (const key of Object.keys(this.variables)) {
      if (!varPattern.test(key)) {
        throw new Error(`Invalid variable name: ${key}`);
      }
    }
  }

  /**
   * Get variable value by key
   */
  getVariable(key: string): string | undefined {
    return this.variables[key];
  }

  /**
   * Set variable value (returns new Environment)
   */
  setVariable(key: string, value: string): Environment {
    return this.update({
      variables: { ...this.variables, [key]: value }
    });
  }

  /**
   * Delete variable (returns new Environment)
   */
  deleteVariable(key: string): Environment {
    const { [key]: _, ...rest } = this.variables;
    return this.update({ variables: rest });
  }
}
```

**Run tests and commit** following same pattern.

---

### Phase 3: Services & Storage

#### Step 3.1: Environment Service Tests (RED)

Create `src/renderer/services/environmentService.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnvironmentService } from './environmentService';
import { Environment } from '../../models/Environment';

vi.mock('electron-store');

describe('EnvironmentService', () => {
  let service: EnvironmentService;

  beforeEach(() => {
    service = new EnvironmentService();
    service.clearAll(); // Reset for each test
  });

  describe('CRUD operations', () => {
    it('should create environment', () => {
      const env = service.create('Development', { baseUrl: 'http://localhost' });

      expect(env.name).toBe('Development');
      expect(service.getById(env.id)).toEqual(env);
    });

    it('should get all environments', () => {
      service.create('Dev');
      service.create('Prod');

      const all = service.getAll();
      expect(all).toHaveLength(2);
    });

    it('should update environment', () => {
      const env = service.create('Dev');
      const updated = service.update(env.id, { name: 'Development' });

      expect(updated?.name).toBe('Development');
      expect(service.getById(env.id)?.name).toBe('Development');
    });

    it('should delete environment', () => {
      const env = service.create('Dev');
      service.delete(env.id);

      expect(service.getById(env.id)).toBeUndefined();
    });
  });

  describe('active environment', () => {
    it('should set active environment', () => {
      const env = service.create('Dev');
      service.setActive(env.id);

      expect(service.getActive()).toEqual(env);
    });

    it('should clear active environment', () => {
      const env = service.create('Dev');
      service.setActive(env.id);
      service.setActive(null);

      expect(service.getActive()).toBeNull();
    });
  });

  describe('uniqueness', () => {
    it('should enforce unique names (case-insensitive)', () => {
      service.create('Development');

      expect(() => service.create('Development'))
        .toThrow('Environment with name "Development" already exists');

      expect(() => service.create('development'))
        .toThrow('Environment with name "development" already exists');
    });
  });
});
```

**Follow same RED-GREEN-REFACTOR pattern for**:
- `collectionService.ts` / `collectionService.test.ts`
- `importExportService.ts` / `importExportService.test.ts`

---

### Phase 4: Zustand State Management

#### Step 4.1: Environment Store Tests (RED)

Create `src/renderer/store/environmentStore.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEnvironmentStore } from './environmentStore';

describe('environmentStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useEnvironmentStore());
    act(() => {
      result.current.reset();
    });
  });

  it('should create environment', () => {
    const { result } = renderHook(() => useEnvironmentStore());

    act(() => {
      result.current.createEnvironment('Dev', { baseUrl: 'http://localhost' });
    });

    const environments = result.current.environments;
    expect(Object.values(environments)).toHaveLength(1);
    expect(Object.values(environments)[0].name).toBe('Dev');
  });

  it('should set active environment', () => {
    const { result } = renderHook(() => useEnvironmentStore());

    let envId: string;
    act(() => {
      envId = result.current.createEnvironment('Dev', {}).id;
      result.current.setActiveEnvironment(envId);
    });

    expect(result.current.activeEnvironmentId).toBe(envId);
  });

  it('should resolve variables from active environment', () => {
    const { result } = renderHook(() => useEnvironmentStore());

    act(() => {
      const env = result.current.createEnvironment('Dev', {
        baseUrl: 'http://localhost',
        port: '3000'
      });
      result.current.setActiveEnvironment(env.id);
    });

    const resolved = result.current.resolveVariables('{{baseUrl}}:{{port}}/api');
    expect(resolved).toBe('http://localhost:3000/api');
  });
});
```

**Pattern**: Zustand stores integrate models + services + variable resolution.

---

### Phase 5: React Components

#### Step 5.1: Environment Selector Tests (RED)

Create `src/renderer/components/EnvironmentSelector/EnvironmentSelector.test.tsx`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EnvironmentSelector } from './EnvironmentSelector';
import { useEnvironmentStore } from '../../store/environmentStore';

describe('EnvironmentSelector', () => {
  beforeEach(() => {
    useEnvironmentStore.getState().reset();
  });

  it('should render with no environments', () => {
    render(<EnvironmentSelector />);
    expect(screen.getByText('No Environment')).toBeInTheDocument();
  });

  it('should display active environment', () => {
    const store = useEnvironmentStore.getState();
    const env = store.createEnvironment('Development', {});
    store.setActiveEnvironment(env.id);

    render(<EnvironmentSelector />);
    expect(screen.getByText('Development')).toBeInTheDocument();
  });

  it('should switch environment on selection', () => {
    const store = useEnvironmentStore.getState();
    const dev = store.createEnvironment('Dev', {});
    const prod = store.createEnvironment('Prod', {});
    store.setActiveEnvironment(dev.id);

    render(<EnvironmentSelector />);

    fireEvent.click(screen.getByText('Dev'));
    fireEvent.click(screen.getByText('Prod'));

    expect(store.activeEnvironmentId).toBe(prod.id);
  });
});
```

**Follow component testing patterns from Feature 001**.

---

## Integration Testing

**Constitutional Requirement**: At least one integration test per user story.

### Example: Variable Substitution Workflow (US1)

Create `tests/integration/variable-substitution-workflow.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../../src/renderer/App';

describe('US1: Variable Substitution Workflow', () => {
  it('should substitute variables in request URL', async () => {
    render(<App />);

    // 1. Create environment
    fireEvent.click(screen.getByLabelText('Manage Environments'));
    fireEvent.click(screen.getByText('New Environment'));
    fireEvent.change(screen.getByPlaceholderText('Environment name'), {
      target: { value: 'Dev' }
    });
    fireEvent.click(screen.getByText('Add Variable'));
    fireEvent.change(screen.getByPlaceholderText('Variable name'), {
      target: { value: 'baseUrl' }
    });
    fireEvent.change(screen.getByPlaceholderText('Variable value'), {
      target: { value: 'https://api.dev.example.com' }
    });
    fireEvent.click(screen.getByText('Save'));

    // 2. Enter URL with variable
    const urlInput = screen.getByPlaceholderText('Enter request URL');
    fireEvent.change(urlInput, { target: { value: '{{baseUrl}}/users' } });

    // 3. Verify resolved URL hint appears
    await waitFor(() => {
      expect(screen.getByText('→ https://api.dev.example.com/users')).toBeInTheDocument();
    });
  });
});
```

---

## Performance Testing

**Constitutional Requirement**: Validate <50ms, <100ms, <500ms targets.

Create `tests/performance/variable-resolution.perf.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { resolveVariables } from '../../src/lib/variableResolver';

describe('Variable Resolution Performance', () => {
  it('should resolve 100 variables in under 50ms', () => {
    const variables: Record<string, string> = {};
    let text = '';

    for (let i = 0; i < 100; i++) {
      variables[`var${i}`] = `value${i}`;
      text += `{{var${i}}} `;
    }

    const iterations = 100;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      resolveVariables(text, variables);
    }

    const duration = (performance.now() - start) / iterations;

    console.log(`Average resolution time: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(50);
  });
});
```

---

## Common Patterns from Feature 001

### 1. Service Pattern

```typescript
// services/baseService.ts pattern
export abstract class BaseService<T> {
  protected abstract storageKey: string;

  protected get store() {
    return new Store({ name: 'swiftapi' });
  }

  getAll(): T[] {
    return this.store.get(this.storageKey, []);
  }

  getById(id: string): T | undefined {
    return this.getAll().find(item => item.id === id);
  }
}
```

### 2. Zustand Store Pattern

```typescript
// store/baseStore.ts pattern
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface State {
  items: Record<string, Item>;
}

interface Actions {
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
}

export const useItemStore = create<State & Actions>()(
  immer((set) => ({
    items: {},

    addItem: (item) => set((state) => {
      state.items[item.id] = item;
    }),

    removeItem: (id) => set((state) => {
      delete state.items[id];
    })
  }))
);
```

### 3. React Component Pattern

```typescript
// Functional component with hooks
export const MyComponent: React.FC = () => {
  const { items, addItem } = useItemStore();
  const [localState, setLocalState] = useState('');

  const handleSubmit = () => {
    addItem({ id: randomUUID(), name: localState });
    setLocalState('');
  };

  return (
    <div>
      <input value={localState} onChange={(e) => setLocalState(e.target.value)} />
      <button onClick={handleSubmit}>Add</button>
      {Object.values(items).map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};
```

---

## Testing Checklist

Before marking any task as complete:

- [ ] Unit tests written FIRST (RED)
- [ ] Implementation passes tests (GREEN)
- [ ] Code refactored for clarity (REFACTOR)
- [ ] Coverage ≥ 80% for new code
- [ ] ESLint passes (no warnings)
- [ ] TypeScript strict mode (no `any` types)
- [ ] Integration test for user story
- [ ] Performance test for critical path
- [ ] Manual E2E test on all 3 platforms
- [ ] Git commit with constitutional footer

---

## Troubleshooting

### Common Issues

**Issue**: Tests failing with "Cannot find module 'electron'"
**Fix**: Add to `vitest.config.ts`:
```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts']
  }
});
```

**Issue**: Variable resolution too slow
**Fix**: Use memoization in Zustand store:
```typescript
const resolvedUrl = useMemo(
  () => resolveVariables(url, activeEnv?.variables || {}),
  [url, activeEnv]
);
```

**Issue**: Circular dependency between stores
**Fix**: Use `getState()` instead of hooks in store actions:
```typescript
sendRequest: () => {
  const envStore = useEnvironmentStore.getState();
  const activeEnv = envStore.environments[envStore.activeEnvironmentId];
  // ...
}
```

---

## Next Steps

After completing implementation:

1. **Generate tasks.md**: Run `/speckit.tasks` to break down into specific tasks
2. **Run E2E tests**: `npm run test:e2e` on Windows, macOS, Linux
3. **Check coverage**: `npm run coverage` (must be ≥ 80%)
4. **Update CLAUDE.md**: Add new patterns and technologies
5. **Create PR**: Follow constitutional git workflow

**Ready to start?** Begin with Phase 1 (Variable Resolver) and follow TDD religiously.
