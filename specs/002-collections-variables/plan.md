# Implementation Plan: Collections & Environment Variables

**Branch**: `002-collections-variables` | **Date**: 2025-01-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-collections-variables/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature adds **Collections** and **Environment Variables** to SwiftAPI, enabling users to:
1. Organize requests into reusable collections
2. Define environment-specific variables (Dev, Staging, Production) using {{variable}} syntax
3. Switch between environments with one click for dynamic request configuration
4. Export/import collections and environments for backup and sharing

**Technical Approach**:
- Variable substitution engine for {{template}} syntax with nested resolution and circular dependency detection
- Zustand store extension for collections and environments state management
- Electron-store persistence for local-first data storage (collections and environments as JSON)
- React UI components for sidebar, environment switcher, and management dialogs
- Performance-optimized resolver (<50ms for 100+ variables per constitutional requirement)

## Technical Context

**Language/Version**: TypeScript 5.3+ (strict mode)
**Primary Dependencies**:
- React 18+ (existing UI framework)
- Zustand (existing state management)
- electron-store (existing persistence layer)
- Vite (existing build tool)

**Storage**: Electron-store (local JSON files) - 100% offline, no cloud dependencies
**Testing**: Vitest (unit/integration), Playwright (E2E cross-platform)
**Target Platform**: Electron desktop app (Windows, macOS, Linux)
**Project Type**: Desktop application (single Electron project)
**Performance Goals**:
- Variable substitution: <50ms for 100+ variables with nesting (constitutional requirement)
- Collection load: <500ms for 500+ saved requests
- Environment switch: <100ms UI response (constitutional requirement)
- Memory: <200MB total app usage including collections (constitutional requirement)

**Constraints**:
- Must work 100% offline (constitutional Principle VIII: Local-First)
- Cross-platform identical behavior (constitutional Principle II)
- 80%+ test coverage (constitutional Principle V)
- Zero cloud dependencies (constitutional Principle VIII)

**Scale/Scope**:
- Support 100+ environments with 100+ variables each
- Support 50+ collections with 500+ requests total
- Handle 10MB variable values without performance degradation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify alignment with SwiftAPI Constitution (`.specify/memory/constitution.md`):

- [x] **I. Test-First Development**: Tests will be written before implementation (TDD mandatory)
  - ✅ All models, services, and components will have tests written FIRST
  - ✅ Variable resolver, collection manager, environment manager all test-driven

- [x] **II. Cross-Platform Consistency**: Feature works identically on Windows, macOS, and Linux
  - ✅ electron-store works identically on all platforms
  - ✅ React UI components render consistently
  - ✅ E2E tests will run on all three platforms in CI

- [x] **III. Simplicity First**: Feature justifies its complexity; simpler alternatives considered
  - ✅ Simple {{variable}} syntax (industry standard, familiar to users)
  - ✅ Flat collection structure (no nested folders in v1 - YAGNI)
  - ✅ Single active environment at a time (simpler UX than "merged environments")
  - ✅ Direct string replacement for variables (no complex templating engine)

- [x] **IV. Performance & Resource Efficiency**: Feature meets performance targets (<3s load, <200MB memory, <100ms overhead)
  - ✅ Variable substitution: <50ms for 100+ variables (measured in performance tests)
  - ✅ Lazy loading collections (load on demand, not all at startup)
  - ✅ Efficient storage format (JSON, not heavy database)
  - ✅ No memory leaks (proper cleanup in React components)

- [x] **V. Code Quality Standards**: Will use TypeScript strict mode, ESLint, 80%+ coverage
  - ✅ TypeScript strict mode enabled (existing project standard)
  - ✅ All new code will be linted
  - ✅ Target 85%+ coverage for this feature (exceeds 80% requirement)

- [x] **VI. Documentation & Discoverability**: Feature includes user docs and is discoverable in UI
  - ✅ Inline hints show resolved URLs (e.g., `{{baseUrl}}/users` → `https://api.dev.example.com/users`)
  - ✅ Clear UI for environment switcher (prominent in header)
  - ✅ Tooltips and placeholder text guide users
  - ✅ Error messages are actionable (e.g., "Variable {{apiKey}} is not defined in environment Dev")

- [x] **VII. Open-Source & Community First**: No user tracking without opt-in; respects privacy
  - ✅ No telemetry for this feature
  - ✅ All data stored locally
  - ✅ Export/import allows users full control of their data

- [x] **VIII. Local-First Architecture**: Feature works fully offline with no hosted service dependencies
  - ✅ 100% offline - electron-store for local persistence
  - ✅ No network calls for collections or environments
  - ✅ Import/export uses local filesystem only
  - ✅ Zero cloud dependencies

**Testing Requirements** (from Testing Standards):
- [x] Unit tests planned (80% coverage minimum)
  - Variable resolver (nested resolution, circular detection, escaping)
  - Collection manager (CRUD operations)
  - Environment manager (CRUD operations)
  - Storage services (read/write/delete)

- [x] Integration tests planned (at least one per user story)
  - US1: Variable substitution workflow (5 tests)
  - US2: Environment switching workflow (5 tests)
  - US3: Environment management workflow (5 tests)
  - US4: Collection save/load workflow (5 tests)
  - US5: Collection organization workflow (5 tests)

- [x] Contract tests planned (for all API interactions)
  - N/A - this feature has no external API calls (local-first)
  - Storage contract tests for electron-store schema validation

- [x] E2E tests planned (for critical paths, all platforms)
  - Create environment → define variables → use in request → send
  - Switch environments → verify variables update → send request
  - Save request to collection → reload → verify preservation
  - Import/export collections and environments

- [x] Performance tests planned (validate metrics before release)
  - Variable substitution <50ms (100+ variables, nested, 10 levels deep)
  - Collection load <500ms (500+ requests)
  - Environment switch <100ms UI response

- [x] Offline functionality tested (no network required)
  - All tests run without network access
  - Electron app works in airplane mode

## Project Structure

### Documentation (this feature)

```text
specs/002-collections-variables/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── storage-schema.ts  # electron-store schema for collections/environments
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**Structure Decision**: SwiftAPI uses a single Electron project structure (Option 1). All new code follows the existing pattern established in Feature 001.

```text
src/
├── models/                    # Domain models
│   ├── Collection.ts          # NEW: Collection model
│   ├── Collection.test.ts     # NEW: Collection tests
│   ├── Environment.ts         # NEW: Environment model
│   ├── Environment.test.ts    # NEW: Environment tests
│   ├── Variable.ts            # NEW: Variable model
│   ├── Variable.test.ts       # NEW: Variable tests
│   ├── SavedRequest.ts        # NEW: SavedRequest model (extends Request)
│   ├── SavedRequest.test.ts   # NEW: SavedRequest tests
│   ├── Request.ts             # EXISTING: Base request model
│   ├── Response.ts            # EXISTING
│   └── ...

├── lib/                       # Utilities
│   ├── variableResolver.ts    # NEW: {{variable}} substitution engine
│   ├── variableResolver.test.ts  # NEW: Resolver tests
│   ├── validation.ts          # EXISTING: Extend with variable name validation
│   └── ...

├── renderer/
│   ├── components/
│   │   ├── CollectionSidebar/      # NEW: Collection sidebar
│   │   │   ├── CollectionSidebar.tsx
│   │   │   ├── CollectionSidebar.test.tsx
│   │   │   ├── CollectionItem.tsx
│   │   │   ├── CollectionItem.test.tsx
│   │   │   ├── SavedRequestItem.tsx
│   │   │   └── SavedRequestItem.test.tsx
│   │   │
│   │   ├── EnvironmentSelector/    # NEW: Environment switcher
│   │   │   ├── EnvironmentSelector.tsx
│   │   │   ├── EnvironmentSelector.test.tsx
│   │   │   ├── EnvironmentDropdown.tsx
│   │   │   └── EnvironmentDropdown.test.tsx
│   │   │
│   │   ├── Dialogs/                 # NEW: Management dialogs
│   │   │   ├── EnvironmentDialog.tsx
│   │   │   ├── EnvironmentDialog.test.tsx
│   │   │   ├── CollectionDialog.tsx
│   │   │   ├── CollectionDialog.test.tsx
│   │   │   ├── SaveRequestDialog.tsx
│   │   │   └── SaveRequestDialog.test.tsx
│   │   │
│   │   ├── RequestBuilder/          # EXISTING: Extend for variable hints
│   │   │   ├── UrlInput.tsx         # MODIFY: Show resolved URL hint
│   │   │   └── ...
│   │   │
│   │   └── ...
│   │
│   ├── services/
│   │   ├── collectionService.ts     # NEW: Collection CRUD operations
│   │   ├── collectionService.test.ts
│   │   ├── environmentService.ts    # NEW: Environment CRUD operations
│   │   ├── environmentService.test.ts
│   │   ├── importExportService.ts   # NEW: Import/export collections/envs
│   │   ├── importExportService.test.ts
│   │   ├── storageService.ts        # EXISTING: Extend for new data types
│   │   └── ...
│   │
│   └── store/
│       ├── collectionStore.ts       # NEW: Collections state (Zustand)
│       ├── collectionStore.test.ts
│       ├── environmentStore.ts      # NEW: Environments state (Zustand)
│       ├── environmentStore.test.ts
│       ├── requestStore.ts          # EXISTING: Extend for variable resolution
│       └── ...

tests/
├── integration/
│   ├── variable-substitution-workflow.test.tsx    # NEW: US1
│   ├── environment-switching-workflow.test.tsx    # NEW: US2
│   ├── environment-management-workflow.test.tsx   # NEW: US3
│   ├── collection-save-load-workflow.test.tsx     # NEW: US4
│   ├── collection-organization-workflow.test.tsx  # NEW: US5
│   └── ...
│
├── e2e/
│   ├── collections-variables.e2e.test.ts    # NEW: End-to-end tests
│   └── ...
│
└── performance/
    ├── variable-resolution.perf.test.ts     # NEW: <50ms for 100+ vars
    ├── collection-load.perf.test.ts         # NEW: <500ms for 500+ requests
    └── ...
```

**Key Design Patterns** (from Feature 001):
- **Models**: Immutable data classes with validation
- **Services**: Business logic layer (pure functions where possible)
- **Stores**: Zustand for reactive state management
- **Components**: Functional React components with hooks
- **Storage**: electron-store for local persistence (JSON)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations** - all constitutional checks passed. This feature follows SwiftAPI's simplicity-first approach:

- Uses existing patterns from Feature 001 (Zustand, electron-store, React functional components)
- No new frameworks or libraries required
- Flat collection structure (no nested folders) keeps implementation simple
- Single active environment simplifies UX (no "environment merging" complexity)
- Direct string replacement for variables (no complex templating DSL)
