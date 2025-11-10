# Tasks: Basic HTTP Request Builder

**Feature**: Basic HTTP Request Builder
**Branch**: `001-basic-request-builder`
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)
**Generated**: 2025-11-07

## Task Format

```
- [ ] [TaskID] [Priority] [UserStory] Description with file path
```

**Priority Levels**: P1 (highest), P2, P3, P4
**User Stories**: US1 (Send GET), US2 (POST with body), US3 (Custom headers), US4 (Formatted response)

---

## Task Summary

| Phase | Tasks | User Story | Priority |
|-------|-------|------------|----------|
| **Phase 0: Setup** | 1 | - | P1 |
| **Phase 1: Core Infrastructure** | 39 | US1 | P1 |
| **Phase 2: POST Requests** | 16 | US2 | P2 |
| **Phase 3: Custom Headers** | 12 | US3 | P3 |
| **Phase 4: Response Formatting** | 10 | US4 | P4 |
| **Phase 5: Polish & Validation** | 8 | All | P1 |
| **Total** | **86** | - | - |

---

## Phase 0: Setup (1 task)

### Dependencies Installation

- [ ] [T001] [P1] [Setup] Install additional dependencies: `npm install axios @monaco-editor/react zustand electron-store qs` and `npm install --save-dev @types/qs`

**Dependencies**: None
**Blocks**: All other tasks

---

## Phase 1: Core Infrastructure - User Story 1 (P1) (39 tasks)

**User Story**: Send Simple GET Request
**Goal**: Users can send a GET request and see the response

### 1.1 Validation Layer (8 tasks)

- [ ] [T002] [P1] [US1] Write test: validateUrl prepends https:// to URLs without protocol → `src/lib/validation.test.ts`
- [ ] [T003] [P1] [US1] Write test: validateUrl accepts valid URLs with http:// or https:// → `src/lib/validation.test.ts`
- [ ] [T004] [P1] [US1] Write test: validateUrl rejects empty strings → `src/lib/validation.test.ts`
- [ ] [T005] [P1] [US1] Write test: validateUrl rejects invalid URL formats → `src/lib/validation.test.ts`
- [ ] [T006] [P1] [US1] Implement validateUrl function → `src/lib/validation.ts`
- [ ] [T007] [P1] [US1] Write test: validateTimeout accepts values between 1000-300000ms → `src/lib/validation.test.ts`
- [ ] [T008] [P1] [US1] Write test: validateTimeout rejects values outside range → `src/lib/validation.test.ts`
- [ ] [T009] [P1] [US1] Implement validateTimeout function → `src/lib/validation.ts`

**Dependencies**: T001
**Blocks**: T010-T025, T034-T040
**Constitutional Requirement**: Test-First Development (TDD)

### 1.2 Data Models (9 tasks)

- [ ] [T010] [P1] [US1] Write test: Request model creates with all properties → `src/models/Request.test.ts`
- [ ] [T011] [P1] [US1] Write test: Request model validates URL on creation → `src/models/Request.test.ts`
- [ ] [T012] [P1] [US1] Write test: Request model defaults to GET method → `src/models/Request.test.ts`
- [ ] [T013] [P1] [US1] Implement Request model → `src/models/Request.ts`
- [ ] [T014] [P1] [US1] Write test: Response model parses status code and text → `src/models/Response.test.ts`
- [ ] [T015] [P1] [US1] Write test: Response model calculates response time → `src/models/Response.test.ts`
- [ ] [T016] [P1] [US1] Write test: Response model determines status category (2xx=success, 4xx=error, 5xx=error) → `src/models/Response.test.ts`
- [ ] [T017] [P1] [US1] Implement Response model → `src/models/Response.ts`
- [ ] [T018] [P1] [US1] Implement Header model → `src/models/Header.ts`

**Dependencies**: T002-T009
**Blocks**: T019-T033
**Constitutional Requirement**: Type safety (TypeScript strict mode)

### 1.3 HTTP Service (9 tasks)

- [ ] [T019] [P1] [US1] Write test: httpService.sendRequest sends GET request with correct URL → `src/renderer/services/httpService.test.ts`
- [ ] [T020] [P1] [US1] Write test: httpService.sendRequest returns 200 response with body → `src/renderer/services/httpService.test.ts`
- [ ] [T021] [P1] [US1] Write test: httpService.sendRequest handles network errors → `src/renderer/services/httpService.test.ts`
- [ ] [T022] [P1] [US1] Write test: httpService.sendRequest handles timeout after 30s → `src/renderer/services/httpService.test.ts`
- [ ] [T023] [P1] [US1] Write test: httpService.cancelRequest cancels in-flight request → `src/renderer/services/httpService.test.ts`
- [ ] [T024] [P1] [US1] Write test: httpService.sendRequest measures response time accurately → `src/renderer/services/httpService.test.ts`
- [ ] [T025] [P1] [US1] Implement HttpService class with sendRequest method → `src/renderer/services/httpService.ts`
- [ ] [T026] [P1] [US1] Implement HttpService cancelRequest method with axios cancel token → `src/renderer/services/httpService.ts`
- [ ] [T027] [P1] [US1] Implement HttpService error parsing (network, timeout, cancelled) → `src/renderer/services/httpService.ts`

**Dependencies**: T010-T018
**Blocks**: T034-T040
**Constitutional Requirement**: Performance (<100ms overhead)

### 1.4 State Store (8 tasks)

- [ ] [T028] [P1] [US1] Write test: requestStore initializes with default state (empty URL, GET method) → `src/renderer/store/requestStore.test.ts`
- [ ] [T029] [P1] [US1] Write test: requestStore.setUrl updates URL in state → `src/renderer/store/requestStore.test.ts`
- [ ] [T030] [P1] [US1] Write test: requestStore.setMethod updates method in state → `src/renderer/store/requestStore.test.ts`
- [ ] [T031] [P1] [US1] Write test: requestStore.setLoading updates isLoading flag → `src/renderer/store/requestStore.test.ts`
- [ ] [T032] [P1] [US1] Write test: requestStore.sendRequest calls httpService and updates response → `src/renderer/store/requestStore.test.ts`
- [ ] [T033] [P1] [US1] Implement Zustand store with initial state and actions → `src/renderer/store/requestStore.ts`
- [ ] [T034] [P1] [US1] Implement store.sendRequest action with httpService integration → `src/renderer/store/requestStore.ts`
- [ ] [T035] [P1] [US1] Implement store.cancelRequest action → `src/renderer/store/requestStore.ts`

**Dependencies**: T019-T027
**Blocks**: T036-T040
**Constitutional Requirement**: Simplicity (Zustand over Redux)

### 1.5 UI Components - Request Builder (9 tasks)

- [ ] [T036] [P1] [US1] Write test: UrlInput renders with placeholder text → `src/renderer/components/RequestBuilder/UrlInput.test.tsx`
- [ ] [T037] [P1] [US1] Write test: UrlInput onChange updates store URL → `src/renderer/components/RequestBuilder/UrlInput.test.tsx`
- [ ] [T038] [P1] [US1] Write test: UrlInput shows validation error for invalid URL → `src/renderer/components/RequestBuilder/UrlInput.test.tsx`
- [ ] [T039] [P1] [US1] Implement UrlInput component with store integration → `src/renderer/components/RequestBuilder/UrlInput.tsx`
- [ ] [T040] [P1] [US1] Write test: MethodSelector renders GET, POST, PUT, DELETE options → `src/renderer/components/RequestBuilder/MethodSelector.test.tsx`
- [ ] [T041] [P1] [US1] Write test: MethodSelector onChange updates store method → `src/renderer/components/RequestBuilder/MethodSelector.test.tsx`
- [ ] [T042] [P1] [US1] Implement MethodSelector component → `src/renderer/components/RequestBuilder/MethodSelector.tsx`
- [ ] [T043] [P1] [US1] Write test: SendButton disables when isLoading is true → `src/renderer/components/RequestBuilder/SendButton.test.tsx`
- [ ] [T044] [P1] [US1] Implement SendButton component with loading state → `src/renderer/components/RequestBuilder/SendButton.tsx`

**Dependencies**: T028-T035
**Blocks**: T045-T050, T051
**Constitutional Requirement**: Cross-platform consistency

### 1.6 UI Components - Response Viewer (6 tasks)

- [ ] [T045] [P1] [US1] Write test: StatusDisplay shows status code with correct color (2xx=green, 4xx=yellow, 5xx=red) → `src/renderer/components/ResponseViewer/StatusDisplay.test.tsx`
- [ ] [T046] [P1] [US1] Write test: StatusDisplay shows response time and size → `src/renderer/components/ResponseViewer/StatusDisplay.test.tsx`
- [ ] [T047] [P1] [US1] Implement StatusDisplay component → `src/renderer/components/ResponseViewer/StatusDisplay.tsx`
- [ ] [T048] [P1] [US1] Write test: BodyViewer displays plain text response → `src/renderer/components/ResponseViewer/BodyViewer.test.tsx`
- [ ] [T049] [P1] [US1] Write test: BodyViewer shows empty state when no response → `src/renderer/components/ResponseViewer/BodyViewer.test.tsx`
- [ ] [T050] [P1] [US1] Implement BodyViewer component (plain text only for now) → `src/renderer/components/ResponseViewer/BodyViewer.tsx`

**Dependencies**: T036-T044
**Blocks**: T051
**Constitutional Requirement**: Documentation & Discoverability

### 1.7 Integration Test (1 task)

- [ ] [T051] [P1] [US1] Write integration test: Complete GET request workflow (enter URL → select GET → click Send → verify response displays) → `tests/integration/get-request-workflow.test.ts`

**Dependencies**: T036-T050
**Blocks**: Phase 2
**Constitutional Requirement**: Integration test per user story

---

## Phase 2: POST Requests - User Story 2 (P2) (16 tasks)

**User Story**: Send POST Request with Body
**Goal**: Users can send POST requests with JSON, form-data, or raw text body

### 2.1 Body Editor Component (6 tasks)

- [ ] [T052] [P2] [US2] Write test: BodyEditor renders textarea for POST method → `src/renderer/components/RequestBuilder/BodyEditor.test.tsx`
- [ ] [T053] [P2] [US2] Write test: BodyEditor hidden when method is GET → `src/renderer/components/RequestBuilder/BodyEditor.test.tsx`
- [ ] [T054] [P2] [US2] Write test: BodyEditor shows body type selector (JSON, form-data, raw) → `src/renderer/components/RequestBuilder/BodyEditor.test.tsx`
- [ ] [T055] [P2] [US2] Write test: BodyEditor validates JSON syntax when type is JSON → `src/renderer/components/RequestBuilder/BodyEditor.test.tsx`
- [ ] [T056] [P2] [US2] Write test: BodyEditor shows validation error for malformed JSON → `src/renderer/components/RequestBuilder/BodyEditor.test.tsx`
- [ ] [T057] [P2] [US2] Implement BodyEditor component with validation → `src/renderer/components/RequestBuilder/BodyEditor.tsx`

**Dependencies**: T051
**Blocks**: T058-T067
**Constitutional Requirement**: Test-First Development

### 2.2 JSON Validation (3 tasks)

- [ ] [T058] [P2] [US2] Write test: validateJson accepts valid JSON → `src/lib/validation.test.ts`
- [ ] [T059] [P2] [US2] Write test: validateJson rejects malformed JSON with error message → `src/lib/validation.test.ts`
- [ ] [T060] [P2] [US2] Implement validateJson function → `src/lib/validation.ts`

**Dependencies**: T052-T057
**Blocks**: T061-T067
**Constitutional Requirement**: Simplicity (native JSON.parse)

### 2.3 HTTP Service Extensions (4 tasks)

- [ ] [T061] [P2] [US2] Write test: httpService.sendRequest sends POST with JSON body → `src/renderer/services/httpService.test.ts`
- [ ] [T062] [P2] [US2] Write test: httpService sets Content-Type header based on bodyType → `src/renderer/services/httpService.test.ts`
- [ ] [T063] [P2] [US2] Write test: httpService sends form-data with proper encoding → `src/renderer/services/httpService.test.ts`
- [ ] [T064] [P2] [US2] Implement POST/PUT/DELETE support in httpService.sendRequest → `src/renderer/services/httpService.ts`

**Dependencies**: T058-T060
**Blocks**: T065-T067
**Constitutional Requirement**: Performance (<100ms overhead)

### 2.4 Store Extensions (2 tasks)

- [ ] [T065] [P2] [US2] Write test: requestStore.setBody updates body in state → `src/renderer/store/requestStore.test.ts`
- [ ] [T066] [P2] [US2] Implement store.setBody and store.setBodyType actions → `src/renderer/store/requestStore.ts`

**Dependencies**: T061-T064
**Blocks**: T067
**Constitutional Requirement**: Type safety

### 2.5 Integration Test (1 task)

- [ ] [T067] [P2] [US2] Write integration test: POST request with JSON body workflow (select POST → enter JSON → send → verify response) → `tests/integration/post-request-workflow.test.ts`

**Dependencies**: T065-T066
**Blocks**: Phase 3
**Constitutional Requirement**: Integration test per user story

---

## Phase 3: Custom Headers - User Story 3 (P3) (12 tasks)

**User Story**: Add Custom Headers
**Goal**: Users can add, edit, remove, and toggle custom request headers

### 3.1 Headers Editor Component (6 tasks)

- [ ] [T068] [P3] [US3] Write test: HeadersEditor renders "Add Header" button → `src/renderer/components/RequestBuilder/HeadersEditor.test.tsx`
- [ ] [T069] [P3] [US3] Write test: HeadersEditor adds new header row when button clicked → `src/renderer/components/RequestBuilder/HeadersEditor.test.tsx`
- [ ] [T070] [P3] [US3] Write test: HeadersEditor renders header name and value inputs → `src/renderer/components/RequestBuilder/HeadersEditor.test.tsx`
- [ ] [T071] [P3] [US3] Write test: HeadersEditor removes header when delete button clicked → `src/renderer/components/RequestBuilder/HeadersEditor.test.tsx`
- [ ] [T072] [P3] [US3] Write test: HeadersEditor toggles header enabled/disabled → `src/renderer/components/RequestBuilder/HeadersEditor.test.tsx`
- [ ] [T073] [P3] [US3] Implement HeadersEditor component → `src/renderer/components/RequestBuilder/HeadersEditor.tsx`

**Dependencies**: T067
**Blocks**: T074-T083
**Constitutional Requirement**: Discoverability (clear UI for headers)

### 3.2 Header Validation (3 tasks)

- [ ] [T074] [P3] [US3] Write test: validateHeader rejects empty header names → `src/lib/validation.test.ts`
- [ ] [T075] [P3] [US3] Write test: validateHeader rejects headers with CRLF injection → `src/lib/validation.test.ts`
- [ ] [T076] [P3] [US3] Implement validateHeader function → `src/lib/validation.ts`

**Dependencies**: T068-T073
**Blocks**: T077-T083
**Constitutional Requirement**: Security (prevent CRLF injection)

### 3.3 Store Extensions (2 tasks)

- [ ] [T077] [P3] [US3] Write test: requestStore.addHeader, updateHeader, removeHeader, toggleHeader actions → `src/renderer/store/requestStore.test.ts`
- [ ] [T078] [P3] [US3] Implement header management actions in store → `src/renderer/store/requestStore.ts`

**Dependencies**: T074-T076
**Blocks**: T079
**Constitutional Requirement**: Type safety

### 3.4 Integration Test (1 task)

- [ ] [T079] [P3] [US3] Write integration test: Request with custom headers workflow (add Authorization header → send → verify header in request) → `tests/integration/custom-headers-workflow.test.ts`

**Dependencies**: T077-T078
**Blocks**: Phase 4
**Constitutional Requirement**: Integration test per user story

---

## Phase 4: Response Formatting - User Story 4 (P4) (10 tasks)

**User Story**: View Formatted Response
**Goal**: Users see JSON responses with syntax highlighting and collapsible nodes

### 4.1 Format Service (5 tasks)

- [ ] [T080] [P4] [US4] Write test: formatService.formatJson pretty-prints JSON with 2-space indent → `src/renderer/services/formatService.test.ts`
- [ ] [T081] [P4] [US4] Write test: formatService.isValidJson detects valid/invalid JSON → `src/renderer/services/formatService.test.ts`
- [ ] [T082] [P4] [US4] Write test: formatService.detectContentType identifies JSON, XML, HTML, plain text → `src/renderer/services/formatService.test.ts`
- [ ] [T083] [P4] [US4] Write test: formatService.formatResponse handles large JSON (1MB) in <500ms → `src/renderer/services/formatService.test.ts`
- [ ] [T084] [P4] [US4] Implement FormatService class → `src/renderer/services/formatService.ts`

**Dependencies**: T079
**Blocks**: T085-T089
**Constitutional Requirement**: Performance (<500ms for 1MB JSON)

### 4.2 Monaco Editor Integration (3 tasks)

- [ ] [T085] [P4] [US4] Write test: MonacoWrapper lazy loads editor component → `src/renderer/components/ResponseViewer/MonacoWrapper.test.tsx`
- [ ] [T086] [P4] [US4] Write test: MonacoWrapper displays JSON with syntax highlighting → `src/renderer/components/ResponseViewer/MonacoWrapper.test.tsx`
- [ ] [T087] [P4] [US4] Implement MonacoWrapper component with React.lazy → `src/renderer/components/ResponseViewer/MonacoWrapper.tsx`

**Dependencies**: T080-T084
**Blocks**: T088-T089
**Constitutional Requirement**: Performance (lazy loading)

### 4.3 BodyViewer Update (1 task)

- [ ] [T088] [P4] [US4] Update BodyViewer to use MonacoWrapper for JSON responses → `src/renderer/components/ResponseViewer/BodyViewer.tsx`

**Dependencies**: T085-T087
**Blocks**: T089
**Constitutional Requirement**: Simplicity (reuse existing component)

### 4.4 E2E Test (1 task)

- [ ] [T089] [P4] [US4] Write E2E test: Complete workflow on all platforms (Windows, macOS, Linux) → `tests/e2e/request-builder.e2e.test.ts`

**Dependencies**: T088
**Blocks**: Phase 5
**Constitutional Requirement**: Cross-platform consistency, E2E test for critical paths

---

## Phase 5: Polish & Validation (8 tasks)

**Goal**: Ensure all constitutional requirements met before release

### 5.1 Storage Service (3 tasks)

- [ ] [T090] [P1] [Polish] Write test: storageService persists lastUrl and lastMethod → `src/renderer/services/storageService.test.ts`
- [ ] [T091] [P1] [Polish] Write test: storageService restores settings on app launch → `src/renderer/services/storageService.test.ts`
- [ ] [T092] [P1] [Polish] Implement StorageService with electron-store → `src/renderer/services/storageService.ts`

**Dependencies**: T089
**Blocks**: T096
**Constitutional Requirement**: Local-First Architecture

### 5.2 Performance Validation (2 tasks)

- [ ] [T093] [P1] [Polish] Write performance test: App load time <3 seconds → `tests/performance/benchmarks.test.ts`
- [ ] [T094] [P1] [Polish] Write performance test: Request overhead <100ms, Format 1MB JSON <500ms, Memory <150MB → `tests/performance/benchmarks.test.ts`

**Dependencies**: T090-T092
**Blocks**: T096
**Constitutional Requirement**: Performance targets

### 5.3 Code Quality Gates (2 tasks)

- [ ] [T095] [P1] [Polish] Run full test suite: `npm test` → ensure all tests pass
- [ ] [T096] [P1] [Polish] Run coverage check: `npm run coverage` → ensure ≥80% coverage

**Dependencies**: T093-T094
**Blocks**: None
**Constitutional Requirement**: 80% test coverage

### 5.4 Final Validation (1 task)

- [ ] [T097] [P1] [Polish] Manual QA: Test all 4 user stories on Windows, macOS, and Linux

**Dependencies**: T095-T096
**Blocks**: None
**Constitutional Requirement**: Cross-platform consistency

---

## Dependency Graph

```
T001 (Install deps)
  ↓
T002-T009 (Validation tests + impl)
  ↓
T010-T018 (Models tests + impl)
  ↓
T019-T027 (HTTP Service tests + impl)
  ↓
T028-T035 (Store tests + impl)
  ↓
T036-T050 (UI Components tests + impl)
  ↓
T051 (Integration test US1)
  ↓
T052-T067 (POST body support) → Phase 2
  ↓
T068-T079 (Custom headers) → Phase 3
  ↓
T080-T089 (Response formatting + E2E) → Phase 4
  ↓
T090-T097 (Polish & validation) → Phase 5
```

---

## Parallel Execution Opportunities

**Tests can run in parallel** (after dependencies implemented):
- Validation tests (T002-T009)
- Model tests (T010-T018)
- HTTP Service tests (T019-T027)
- Store tests (T028-T035)
- Component tests (T036-T050)

**Components can be built in parallel** (after store ready):
- UrlInput (T039)
- MethodSelector (T042)
- SendButton (T044)
- StatusDisplay (T047)
- BodyViewer (T050)

---

## Success Criteria Mapping

| Success Criteria | Tasks |
|-----------------|-------|
| **SC-001**: First request in 30s | T036-T051 (UI simplicity) |
| **SC-002**: Overhead <100ms | T019-T027, T094 |
| **SC-003**: Load <3s | T093 |
| **SC-004**: Response displays <1s | T045-T050 |
| **SC-005**: Format 1MB <500ms | T080-T084, T094 |
| **SC-006**: 95% success rate | T036-T051 (intuitive UI) |
| **SC-007**: UI feedback <200ms | T028-T035 (state management) |
| **SC-008**: Memory <150MB | T093-T094 |

---

## Notes

- **TDD Mandatory**: Write tests (RED) before implementation (GREEN) for all tasks
- **Constitution Check**: All 8 principles verified in plan.md
- **Test Coverage**: Target 80% minimum (T096 validates)
- **Cross-Platform**: E2E test (T089) validates Windows, macOS, Linux
- **Local-First**: Zero cloud dependencies (T090-T092 uses electron-store)
- **Performance**: Validated in T093-T094 before release

---

## Getting Started

1. Complete T001 (install dependencies)
2. Start with validation layer (T002-T009) following TDD workflow
3. Work through phases sequentially (P1 → P2 → P3 → P4 → Polish)
4. Run tests after each task: `npm run test:watch`
5. Check progress: mark tasks complete as you go

**Ready to begin Phase 1!** 🚀

See [quickstart.md](quickstart.md) for detailed TDD workflow and code patterns.
