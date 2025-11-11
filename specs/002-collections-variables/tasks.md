# Tasks: Collections & Environment Variables

**Input**: Design documents from `/specs/002-collections-variables/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/storage-schema.ts, quickstart.md

**Tests**: Following constitutional Principle I (Test-First Development), ALL tasks include TDD workflow - write tests FIRST, then implement.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

SwiftAPI uses single project structure: `src/`, `tests/` at repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for Collections & Environment Variables feature

- [ ] T001 Create directory structure for models in src/models/ (Environment.ts, Collection.ts, SavedRequest.ts)
- [ ] T002 Create directory structure for lib utilities in src/lib/ (variableResolver.ts)
- [ ] T003 [P] Create directory structure for services in src/renderer/services/ (environmentService.ts, collectionService.ts, importExportService.ts)
- [ ] T004 [P] Create directory structure for stores in src/renderer/store/ (environmentStore.ts, collectionStore.ts)
- [ ] T005 [P] Create directory structure for React components in src/renderer/components/ (EnvironmentSelector/, CollectionSidebar/, Dialogs/)
- [ ] T006 [P] Create test directory structure tests/unit/, tests/integration/, tests/performance/
- [ ] T007 Verify electron-store is installed and configured (already used in Feature 001)

---

## Phase 2: Foundational (Variable Resolution Engine)

**Purpose**: Core variable resolution engine that ALL user stories depend on. This MUST be complete before any user story can work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete. Variable resolution is the foundation for environments, collections, and all substitution features.

### Tests for Variable Resolver (TDD - Write FIRST)

> **RED**: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T008 [P] Create src/lib/variableResolver.test.ts with basic substitution tests (single variable, multiple variables, no variables)
- [ ] T009 [P] Add nested variable resolution tests to src/lib/variableResolver.test.ts (2-level nesting, 10-level deep)
- [ ] T010 [P] Add error handling tests to src/lib/variableResolver.test.ts (undefined variable, circular reference, max depth exceeded)
- [ ] T011 [P] Add performance test to src/lib/variableResolver.test.ts (100 variables in <50ms per constitutional requirement)
- [ ] T012 [P] Add utility function tests to src/lib/variableResolver.test.ts (extractVariables, hasVariables)

### Implementation for Variable Resolver

> **GREEN**: Implement minimal code to make tests pass

- [ ] T013 Create src/lib/variableResolver.ts with VariableResolutionError class
- [ ] T014 Implement resolveVariables function in src/lib/variableResolver.ts with basic string replacement
- [ ] T015 Add nested resolution logic to resolveVariables (loop until no more {{}} patterns, max depth 10)
- [ ] T016 Add circular reference detection to resolveVariables (track resolution path, throw on cycle)
- [ ] T017 Add undefined variable error handling to resolveVariables (throw VariableResolutionError with helpful message)
- [ ] T018 [P] Implement extractVariables utility function in src/lib/variableResolver.ts
- [ ] T019 [P] Implement hasVariables utility function in src/lib/variableResolver.ts
- [ ] T020 Run all variable resolver tests and verify 100% pass (npm test -- variableResolver.test.ts)
- [ ] T021 Verify performance: 100 variables resolve in <50ms (run performance test)

> **REFACTOR**: Optimize code without changing behavior

- [ ] T022 Add JSDoc comments to all variableResolver functions
- [ ] T023 Extract constants (MAX_DEPTH, VARIABLE_PATTERN) in variableResolver.ts
- [ ] T024 Optimize regex usage for performance in variableResolver.ts

**Checkpoint**: Variable resolution engine complete and tested. Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Use Environment Variables in Requests (Priority: P1) 🎯 MVP

**Goal**: Enable users to define variables in environments and use {{variable}} syntax in requests with automatic substitution

**Independent Test**: Create environment "Dev" with `baseUrl=https://api.dev.example.com`, enter `{{baseUrl}}/users` in URL field, verify resolved URL shows `https://api.dev.example.com/users` and HTTP request goes to resolved URL

**Delivers Value**: Users can test APIs across multiple environments without manually editing URLs/credentials

### Tests for User Story 1 - Models (TDD - Write FIRST)

> **RED**: Write tests, verify they FAIL

- [ ] T025 [P] [US1] Create src/models/Environment.test.ts with creation tests (valid data, empty variables)
- [ ] T026 [P] [US1] Add validation tests to src/models/Environment.test.ts (empty name, >100 chars, invalid chars, invalid variable names)
- [ ] T027 [P] [US1] Add update tests to src/models/Environment.test.ts (update name, update variables, validate on update)
- [ ] T028 [P] [US1] Add utility method tests to src/models/Environment.test.ts (getVariable, setVariable, deleteVariable)

### Implementation for User Story 1 - Models

> **GREEN**: Implement Environment model

- [ ] T029 [US1] Create src/models/Environment.ts with class definition and constructor
- [ ] T030 [US1] Implement Environment.create static method with UUID generation and timestamps
- [ ] T031 [US1] Implement Environment.update method returning new Environment instance
- [ ] T032 [US1] Add validation logic in private validate() method (name length, name pattern, variable name pattern)
- [ ] T033 [P] [US1] Implement getVariable method in src/models/Environment.ts
- [ ] T034 [P] [US1] Implement setVariable method in src/models/Environment.ts
- [ ] T035 [P] [US1] Implement deleteVariable method in src/models/Environment.ts
- [ ] T036 [US1] Run all Environment model tests and verify 100% pass (npm test -- Environment.test.ts)

### Tests for User Story 1 - Environment Service (TDD - Write FIRST)

> **RED**: Write service tests FIRST

- [ ] T037 [P] [US1] Create src/renderer/services/environmentService.test.ts with CRUD tests (create, getAll, getById, update, delete)
- [ ] T038 [P] [US1] Add active environment tests to environmentService.test.ts (setActive, getActive, clearActive)
- [ ] T039 [P] [US1] Add uniqueness validation tests to environmentService.test.ts (prevent duplicate names case-insensitive)
- [ ] T040 [P] [US1] Add persistence tests to environmentService.test.ts (verify electron-store read/write)

### Implementation for User Story 1 - Environment Service

> **GREEN**: Implement service layer

- [ ] T041 [US1] Create src/renderer/services/environmentService.ts with EnvironmentService class
- [ ] T042 [US1] Implement create method in EnvironmentService (validate uniqueness, save to electron-store)
- [ ] T043 [US1] Implement getAll method in EnvironmentService (read from electron-store)
- [ ] T044 [P] [US1] Implement getById method in EnvironmentService
- [ ] T045 [P] [US1] Implement update method in EnvironmentService (validate, save changes)
- [ ] T046 [P] [US1] Implement delete method in EnvironmentService (remove from storage)
- [ ] T047 [US1] Implement setActive method in EnvironmentService (update activeEnvironmentId)
- [ ] T048 [P] [US1] Implement getActive method in EnvironmentService
- [ ] T049 [US1] Implement uniqueness check helper in EnvironmentService (case-insensitive name comparison)
- [ ] T050 [US1] Run all EnvironmentService tests and verify 100% pass

### Tests for User Story 1 - Environment Store (TDD - Write FIRST)

> **RED**: Write Zustand store tests FIRST

- [ ] T051 [P] [US1] Create src/renderer/store/environmentStore.test.ts with state management tests (createEnvironment, updateEnvironment, deleteEnvironment)
- [ ] T052 [P] [US1] Add active environment tests to environmentStore.test.ts (setActiveEnvironment, getActiveEnvironment)
- [ ] T053 [P] [US1] Add variable resolution integration test to environmentStore.test.ts (resolveVariables using active environment)

### Implementation for User Story 1 - Environment Store

> **GREEN**: Implement Zustand store

- [ ] T054 [US1] Create src/renderer/store/environmentStore.ts with state interface (environments map, activeEnvironmentId)
- [ ] T055 [US1] Implement createEnvironment action in environmentStore (call service, update state)
- [ ] T056 [P] [US1] Implement updateEnvironment action in environmentStore
- [ ] T057 [P] [US1] Implement deleteEnvironment action in environmentStore
- [ ] T058 [US1] Implement setActiveEnvironment action in environmentStore
- [ ] T059 [US1] Implement getActiveEnvironment selector in environmentStore
- [ ] T060 [US1] Implement resolveVariables action in environmentStore (integrate variableResolver, use active environment)
- [ ] T061 [US1] Run all environmentStore tests and verify 100% pass

### Tests for User Story 1 - UI Components (TDD - Write FIRST)

> **RED**: Write component tests FIRST

- [ ] T062 [P] [US1] Create src/renderer/components/EnvironmentSelector/EnvironmentSelector.test.tsx with render tests (no environments, with active environment)
- [ ] T063 [P] [US1] Add interaction tests to EnvironmentSelector.test.tsx (switch environment, open manage dialog)
- [ ] T064 [P] [US1] Create src/renderer/components/Dialogs/EnvironmentDialog.test.tsx with form tests (create new, edit existing, validate input)
- [ ] T065 [P] [US1] Add variable management tests to EnvironmentDialog.test.tsx (add variable, edit variable, delete variable)

### Implementation for User Story 1 - UI Components

> **GREEN**: Implement React components

- [ ] T066 [US1] Create src/renderer/components/EnvironmentSelector/EnvironmentSelector.tsx with dropdown UI
- [ ] T067 [US1] Implement environment switching logic in EnvironmentSelector (connect to environmentStore)
- [ ] T068 [US1] Add "Manage Environments" button to EnvironmentSelector
- [ ] T069 [US1] Create src/renderer/components/Dialogs/EnvironmentDialog.tsx with form UI (name input, variables table)
- [ ] T070 [US1] Implement form submission logic in EnvironmentDialog (validate, create/update via store)
- [ ] T071 [US1] Implement variable table UI in EnvironmentDialog (add row, edit row, delete row)
- [ ] T072 [US1] Add validation feedback to EnvironmentDialog (show errors for invalid names/variable names)
- [ ] T073 [US1] Run all component tests and verify 100% pass

### Integration for User Story 1 - Request Builder Enhancement

> **Extend existing RequestBuilder to show resolved URLs**

- [ ] T074 [US1] Update src/renderer/components/RequestBuilder/UrlInput.tsx to use environmentStore.resolveVariables
- [ ] T075 [US1] Add resolved URL hint display below URL input field in UrlInput.tsx (show "→ resolved-url" when variables present)
- [ ] T076 [US1] Update requestStore sendRequest action in src/renderer/store/requestStore.ts to resolve variables before sending HTTP request
- [ ] T077 [US1] Add error handling in sendRequest for VariableResolutionError (show user-friendly message)
- [ ] T078 [US1] Add resolved URL display for headers in RequestBuilder (show hint for header values with variables)
- [ ] T079 [US1] Add resolved value display for query params in RequestBuilder
- [ ] T080 [US1] Add resolved value display for body content in RequestBuilder

### Integration Tests for User Story 1

> **End-to-end workflow validation**

- [ ] T081 [US1] Create tests/integration/variable-substitution-workflow.test.tsx for full workflow (create env → define variables → use in URL → send request → verify resolved)
- [ ] T082 [US1] Add test for nested variable resolution workflow in variable-substitution-workflow.test.tsx
- [ ] T083 [US1] Add test for undefined variable error workflow in variable-substitution-workflow.test.tsx
- [ ] T084 [US1] Add test for variables in headers, query params, body in variable-substitution-workflow.test.tsx
- [ ] T085 [US1] Run all US1 integration tests and verify 100% pass

**Checkpoint**: User Story 1 complete! Users can now create environments, define variables, and use {{variable}} syntax in requests. Feature is MVP-ready.

---

## Phase 4: User Story 2 - Switch Between Environments (Priority: P1) 🎯 MVP

**Goal**: Enable users to quickly switch active environment from dropdown, with all requests automatically using new environment's variables

**Independent Test**: Create two environments ("Dev" with `baseUrl=https://dev.api.com`, "Production" with `baseUrl=https://api.com`), switch between them, verify requests use correct baseUrl without manual editing

**Delivers Value**: One-click environment switching eliminates manual variable updates, core UX for multi-environment testing

**Note**: Most infrastructure already built in US1 (EnvironmentSelector dropdown). This story focuses on UX polish and validation.

### Tests for User Story 2 - Environment Switching (TDD - Write FIRST)

> **RED**: Write switching workflow tests FIRST

- [ ] T086 [P] [US2] Add environment switching tests to src/renderer/store/environmentStore.test.ts (switch from Dev to Prod, verify active environment changes)
- [ ] T087 [P] [US2] Add validation tests for switching to environment with missing variables in environmentStore.test.ts
- [ ] T088 [P] [US2] Add test for switching when no environment selected (first activation) in environmentStore.test.ts

### Implementation for User Story 2 - Switching Logic

> **GREEN**: Enhance store with validation

- [ ] T089 [US2] Add validateVariablesForRequest method to environmentStore (check if all {{vars}} in request are defined)
- [ ] T090 [US2] Update setActiveEnvironment action to trigger validation warning if current request has undefined variables
- [ ] T091 [US2] Add getVariableDifferences selector to environmentStore (compare variable keys between two environments)

### Tests for User Story 2 - UI Enhancements (TDD - Write FIRST)

> **RED**: Write UI tests for switching UX

- [ ] T092 [P] [US2] Add environment switching UI tests to EnvironmentSelector.test.tsx (click dropdown, select different env, verify active changes)
- [ ] T093 [P] [US2] Add "no environment selected" state test to EnvironmentSelector.test.tsx (show prompt to create/select)
- [ ] T094 [P] [US2] Add missing variable warning test to EnvironmentSelector.test.tsx (switch to env missing variables, show validation warning)

### Implementation for User Story 2 - UI Polish

> **GREEN**: Enhance EnvironmentSelector component

- [ ] T095 [US2] Update EnvironmentSelector dropdown to highlight active environment
- [ ] T096 [US2] Add "No Environment" placeholder state to EnvironmentSelector when activeEnvironmentId is null
- [ ] T097 [US2] Add "Create Environment" quick action button to EnvironmentSelector when no environments exist
- [ ] T098 [US2] Implement missing variable warning banner in RequestBuilder (show when active env missing variables used in request)
- [ ] T099 [US2] Add environment name badge to resolved URL hint (show which environment resolved the URL)
- [ ] T100 [US2] Run all US2 component tests and verify 100% pass

### Integration Tests for User Story 2

> **End-to-end environment switching validation**

- [ ] T101 [US2] Create tests/integration/environment-switching-workflow.test.tsx for full workflow (create 2 envs with different baseUrls → switch between them → verify requests use correct values)
- [ ] T102 [US2] Add test for switching when request has undefined variables in environment-switching-workflow.test.tsx (verify warning shown)
- [ ] T103 [US2] Add test for first-time environment selection in environment-switching-workflow.test.tsx (no active env → select one → verify works)
- [ ] T104 [US2] Run all US2 integration tests and verify 100% pass

**Checkpoint**: User Story 2 complete! Users can seamlessly switch environments with visual feedback and validation warnings. Enhanced MVP ready.

---

## Phase 5: User Story 3 - Manage Environments (Priority: P2)

**Goal**: Provide full CRUD UI for environments (create, edit, rename, delete) with user-friendly management interface

**Independent Test**: Create environment "Staging", add variables, edit values, rename to "QA", delete it - all via UI dialogs

**Delivers Value**: Complete environment management without manually editing JSON files, essential for production use

**Note**: Basic create/edit already exists from US1 (EnvironmentDialog). This story adds rename, delete, and management polish.

### Tests for User Story 3 - Environment Management (TDD - Write FIRST)

> **RED**: Write management feature tests FIRST

- [ ] T105 [P] [US3] Add rename environment tests to src/renderer/store/environmentStore.test.ts (rename, verify references preserved)
- [ ] T106 [P] [US3] Add delete environment tests to environmentStore.test.ts (delete, verify removed from storage)
- [ ] T107 [P] [US3] Add delete active environment tests to environmentStore.test.ts (delete active env, verify activeEnvironmentId set to null, show prompt)
- [ ] T108 [P] [US3] Add variable CRUD tests to environmentStore.test.ts (add variable, update variable, delete variable)

### Implementation for User Story 3 - Store Enhancements

> **GREEN**: Add rename and delete actions

- [ ] T109 [US3] Implement renameEnvironment action in environmentStore (validate uniqueness, update name via service)
- [ ] T110 [US3] Implement deleteEnvironment action in environmentStore with active environment handling (if deleting active, clear activeEnvironmentId)
- [ ] T111 [P] [US3] Implement addVariable action in environmentStore
- [ ] T112 [P] [US3] Implement updateVariable action in environmentStore
- [ ] T113 [P] [US3] Implement deleteVariable action in environmentStore
- [ ] T114 [US3] Run all US3 store tests and verify 100% pass

### Tests for User Story 3 - Management UI (TDD - Write FIRST)

> **RED**: Write management UI tests FIRST

- [ ] T115 [P] [US3] Add rename environment tests to EnvironmentDialog.test.tsx (open dialog with existing env, change name, save)
- [ ] T116 [P] [US3] Add delete environment tests to EnvironmentDialog.test.tsx (delete button, confirmation dialog)
- [ ] T117 [P] [US3] Add delete active environment tests to EnvironmentDialog.test.tsx (deleting active env shows different confirmation)
- [ ] T118 [P] [US3] Add variable table interaction tests to EnvironmentDialog.test.tsx (inline editing, delete button)

### Implementation for User Story 3 - Management UI

> **GREEN**: Enhance EnvironmentDialog with full CRUD

- [ ] T119 [US3] Add rename functionality to EnvironmentDialog (edit mode shows current name, allows rename)
- [ ] T120 [US3] Add delete button to EnvironmentDialog with confirmation modal
- [ ] T121 [US3] Implement delete confirmation modal (warn if deleting active environment)
- [ ] T122 [US3] Add inline editing to variable table in EnvironmentDialog (click to edit key/value)
- [ ] T123 [US3] Add delete button to each variable row in EnvironmentDialog
- [ ] T124 [US3] Add "Add Variable" button with inline row insertion in EnvironmentDialog
- [ ] T125 [US3] Implement real-time validation in variable table (highlight invalid variable names)
- [ ] T126 [US3] Add "Duplicate Environment" feature to EnvironmentDialog (copy all variables to new environment)
- [ ] T127 [US3] Run all US3 component tests and verify 100% pass

### Integration Tests for User Story 3

> **End-to-end environment management validation**

- [ ] T128 [US3] Create tests/integration/environment-management-workflow.test.tsx for full workflow (create → edit → rename → delete)
- [ ] T129 [US3] Add test for deleting active environment in environment-management-workflow.test.tsx (verify prompt to select new environment)
- [ ] T130 [US3] Add test for variable CRUD in environment-management-workflow.test.tsx (add → edit → delete variables, verify changes persist)
- [ ] T131 [US3] Run all US3 integration tests and verify 100% pass

**Checkpoint**: User Story 3 complete! Full environment management UI functional. Users can manage environments without touching JSON files.

---

## Phase 6: User Story 4 - Save Requests to Collections (Priority: P2)

**Goal**: Enable users to save configured requests (URL, method, headers, body, auth) to named collections for reuse

**Independent Test**: Configure POST request to `/api/users` with headers and body, save as "Create User" in collection "User Management", close app, reopen, load request, verify all settings preserved

**Delivers Value**: Request reusability - users don't need to recreate complex requests every time

### Tests for User Story 4 - Models (TDD - Write FIRST)

> **RED**: Write model tests for Collection and SavedRequest FIRST

- [ ] T132 [P] [US4] Create src/models/Collection.test.ts with creation tests (valid data, default order)
- [ ] T133 [P] [US4] Add validation tests to Collection.test.ts (empty name, >100 chars, invalid chars)
- [ ] T134 [P] [US4] Add update tests to Collection.test.ts (rename, reorder)
- [ ] T135 [P] [US4] Create src/models/SavedRequest.test.ts with creation tests (fromRequest static method, all fields captured)
- [ ] T136 [P] [US4] Add validation tests to SavedRequest.test.ts (name length 1-200 chars)
- [ ] T137 [P] [US4] Add conversion tests to SavedRequest.test.ts (toRequest method preserves {{variables}})

### Implementation for User Story 4 - Models

> **GREEN**: Implement Collection and SavedRequest models

- [ ] T138 [US4] Create src/models/Collection.ts with class definition (id, name, order, timestamps)
- [ ] T139 [US4] Implement Collection.create static method with UUID and auto-order
- [ ] T140 [US4] Implement Collection.update method (rename, reorder)
- [ ] T141 [US4] Add validation logic in Collection private validate() method
- [ ] T142 [US4] Create src/models/SavedRequest.ts with class definition (all request fields + collectionId, order)
- [ ] T143 [US4] Implement SavedRequest.fromRequest static method (capture current request state)
- [ ] T144 [US4] Implement SavedRequest.toRequest method (convert back to Request object)
- [ ] T145 [US4] Add validation logic in SavedRequest private validate() method
- [ ] T146 [US4] Run all Collection and SavedRequest model tests and verify 100% pass

### Tests for User Story 4 - Collection Service (TDD - Write FIRST)

> **RED**: Write service tests FIRST

- [ ] T147 [P] [US4] Create src/renderer/services/collectionService.test.ts with CRUD tests (create, getAll, getById, update, delete)
- [ ] T148 [P] [US4] Add saved request management tests to collectionService.test.ts (addRequest, updateRequest, deleteRequest, getRequestsInCollection)
- [ ] T149 [P] [US4] Add uniqueness validation tests to collectionService.test.ts (prevent duplicate collection names)
- [ ] T150 [P] [US4] Add persistence tests to collectionService.test.ts (verify electron-store read/write with nested requests)
- [ ] T151 [P] [US4] Add reordering tests to collectionService.test.ts (reorder collections, reorder requests within collection)

### Implementation for User Story 4 - Collection Service

> **GREEN**: Implement service layer

- [ ] T152 [US4] Create src/renderer/services/collectionService.ts with CollectionService class
- [ ] T153 [US4] Implement create method in CollectionService (validate uniqueness, auto-assign order, save to electron-store)
- [ ] T154 [US4] Implement getAll method in CollectionService (read collections with nested requests from electron-store)
- [ ] T155 [P] [US4] Implement getById method in CollectionService
- [ ] T156 [P] [US4] Implement update method in CollectionService (rename, reorder)
- [ ] T157 [P] [US4] Implement delete method in CollectionService (cascade delete all requests)
- [ ] T158 [US4] Implement addRequest method in CollectionService (add SavedRequest to collection, auto-assign order)
- [ ] T159 [P] [US4] Implement updateRequest method in CollectionService (update existing saved request)
- [ ] T160 [P] [US4] Implement deleteRequest method in CollectionService
- [ ] T161 [US4] Implement getRequestsInCollection method in CollectionService (return SavedRequest array for collection)
- [ ] T162 [US4] Implement reorderCollections method in CollectionService (update order field for all collections)
- [ ] T163 [US4] Implement reorderRequests method in CollectionService (update order field for requests in collection)
- [ ] T164 [US4] Run all CollectionService tests and verify 100% pass

### Tests for User Story 4 - Collection Store (TDD - Write FIRST)

> **RED**: Write Zustand store tests FIRST

- [ ] T165 [P] [US4] Create src/renderer/store/collectionStore.test.ts with collection management tests (createCollection, renameCollection, deleteCollection)
- [ ] T166 [P] [US4] Add saved request management tests to collectionStore.test.ts (saveRequest, loadRequest, updateRequest, deleteRequest)
- [ ] T167 [P] [US4] Add reordering tests to collectionStore.test.ts (reorder collections, reorder requests)

### Implementation for User Story 4 - Collection Store

> **GREEN**: Implement Zustand store

- [ ] T168 [US4] Create src/renderer/store/collectionStore.ts with state interface (collections map with nested requests)
- [ ] T169 [US4] Implement createCollection action in collectionStore (call service, update state)
- [ ] T170 [P] [US4] Implement renameCollection action in collectionStore
- [ ] T171 [P] [US4] Implement deleteCollection action in collectionStore (with confirmation handling)
- [ ] T172 [US4] Implement saveRequest action in collectionStore (capture current request from requestStore, save to collection via service)
- [ ] T173 [US4] Implement loadRequest action in collectionStore (populate requestStore with saved request data)
- [ ] T174 [P] [US4] Implement updateRequest action in collectionStore (overwrite existing saved request)
- [ ] T175 [P] [US4] Implement deleteRequest action in collectionStore
- [ ] T176 [US4] Implement reorderCollections action in collectionStore
- [ ] T177 [US4] Implement reorderRequests action in collectionStore
- [ ] T178 [US4] Run all collectionStore tests and verify 100% pass

### Tests for User Story 4 - UI Components (TDD - Write FIRST)

> **RED**: Write component tests FIRST

- [ ] T179 [P] [US4] Create src/renderer/components/CollectionSidebar/CollectionSidebar.test.tsx with render tests (empty state, with collections)
- [ ] T180 [P] [US4] Add interaction tests to CollectionSidebar.test.tsx (expand/collapse collection, click saved request)
- [ ] T181 [P] [US4] Create src/renderer/components/CollectionSidebar/CollectionItem.test.tsx with menu tests (rename, delete, reorder)
- [ ] T182 [P] [US4] Create src/renderer/components/CollectionSidebar/SavedRequestItem.test.tsx with interaction tests (click to load, right-click menu)
- [ ] T183 [P] [US4] Create src/renderer/components/Dialogs/SaveRequestDialog.test.tsx with form tests (select collection, enter request name, save)
- [ ] T184 [P] [US4] Add create new collection tests to SaveRequestDialog.test.tsx (inline collection creation)

### Implementation for User Story 4 - UI Components

> **GREEN**: Implement React components

- [ ] T185 [US4] Create src/renderer/components/CollectionSidebar/CollectionSidebar.tsx with sidebar layout (collapsible panel)
- [ ] T186 [US4] Add empty state to CollectionSidebar ("No collections yet, create one to get started")
- [ ] T187 [US4] Implement collection list rendering in CollectionSidebar (map over collections, render CollectionItem components)
- [ ] T188 [US4] Create src/renderer/components/CollectionSidebar/CollectionItem.tsx with expand/collapse functionality
- [ ] T189 [US4] Add context menu to CollectionItem (Rename, Delete, New Request)
- [ ] T190 [US4] Implement saved request list rendering in CollectionItem (render SavedRequestItem components)
- [ ] T191 [US4] Create src/renderer/components/CollectionSidebar/SavedRequestItem.tsx with click handler (load request into builder)
- [ ] T192 [US4] Add context menu to SavedRequestItem (Rename, Duplicate, Delete, Move to Collection)
- [ ] T193 [US4] Create src/renderer/components/Dialogs/SaveRequestDialog.tsx with form UI (collection dropdown, request name input)
- [ ] T194 [US4] Implement collection selection logic in SaveRequestDialog (populate dropdown from collectionStore)
- [ ] T195 [US4] Add "Create New Collection" option to SaveRequestDialog collection dropdown (inline creation)
- [ ] T196 [US4] Implement save button logic in SaveRequestDialog (validate, call collectionStore.saveRequest)
- [ ] T197 [US4] Add "Save Request" button to RequestBuilder toolbar (opens SaveRequestDialog)
- [ ] T198 [US4] Run all US4 component tests and verify 100% pass

### Integration for User Story 4 - Request Preservation

> **Ensure {{variables}} are saved, not resolved values**

- [ ] T199 [US4] Update SavedRequest.fromRequest to preserve {{variable}} syntax in URL, headers, query params, body (do NOT call resolveVariables)
- [ ] T200 [US4] Verify loadRequest action in collectionStore populates requestStore with {{variable}} syntax intact (not resolved values)
- [ ] T201 [US4] Add test to verify saved request works with different environments (save with {{baseUrl}}, load, switch env, verify resolved correctly)

### Integration Tests for User Story 4

> **End-to-end collection save/load validation**

- [ ] T202 [US4] Create tests/integration/collection-save-load-workflow.test.tsx for full workflow (configure request → save to new collection → close → reopen → load → verify all fields)
- [ ] T203 [US4] Add test for saving request with {{variables}} in collection-save-load-workflow.test.tsx (verify variables preserved, not resolved)
- [ ] T204 [US4] Add test for update saved request in collection-save-load-workflow.test.tsx (modify request, save again, verify updated)
- [ ] T205 [US4] Run all US4 integration tests and verify 100% pass

**Checkpoint**: User Story 4 complete! Users can save and load requests from collections. Request reusability functional.

---

## Phase 7: User Story 5 - Organize Collections (Priority: P3)

**Goal**: Provide full organizational features for collections (create empty collections, rename, delete with warnings, drag-and-drop reorder, move requests between collections)

**Independent Test**: Create collections "Auth APIs", "User APIs", move/reorder requests between them, rename "Auth APIs" to "Authentication", delete empty collections

**Delivers Value**: Complete organizational system for managing large numbers of saved requests

**Note**: Most infrastructure already exists from US4. This story adds organizational polish and drag-and-drop.

### Tests for User Story 5 - Organization Features (TDD - Write FIRST)

> **RED**: Write organization tests FIRST

- [ ] T206 [P] [US5] Add empty collection creation tests to collectionStore.test.ts (create collection without any requests)
- [ ] T207 [P] [US5] Add delete warning tests to collectionStore.test.ts (deleting non-empty collection requires confirmation)
- [ ] T208 [P] [US5] Add move request tests to collectionStore.test.ts (move request from one collection to another)
- [ ] T209 [P] [US5] Add drag-and-drop tests to CollectionSidebar.test.tsx (reorder collections, reorder requests, move requests)

### Implementation for User Story 5 - Organization Logic

> **GREEN**: Enhance store with organization features

- [ ] T210 [US5] Implement moveRequest action in collectionStore (update collectionId, adjust order fields)
- [ ] T211 [US5] Update deleteCollection action to check if collection is empty, return confirmation flag if not
- [ ] T212 [US5] Add getCollectionRequestCount selector to collectionStore (count requests in collection)
- [ ] T213 [US5] Run all US5 store tests and verify 100% pass

### Tests for User Story 5 - Organization UI (TDD - Write FIRST)

> **RED**: Write UI tests for organization features

- [ ] T214 [P] [US5] Add "New Collection" button tests to CollectionSidebar.test.tsx (create empty collection dialog)
- [ ] T215 [P] [US5] Add delete confirmation tests to CollectionItem.test.tsx (non-empty shows warning, empty deletes immediately)
- [ ] T216 [P] [US5] Add rename tests to CollectionItem.test.tsx (inline rename, Enter to save, Escape to cancel)
- [ ] T217 [P] [US5] Create src/renderer/components/Dialogs/CollectionDialog.test.tsx with form tests (create/edit collection)

### Implementation for User Story 5 - Organization UI

> **GREEN**: Add organizational UI features

- [ ] T218 [US5] Add "New Collection" button to CollectionSidebar header (opens CollectionDialog)
- [ ] T219 [US5] Create src/renderer/components/Dialogs/CollectionDialog.tsx with form UI (collection name input)
- [ ] T220 [US5] Implement CollectionDialog save logic (create or rename via collectionStore)
- [ ] T221 [US5] Update CollectionItem delete button to show confirmation modal when collection has requests ("Delete X requests?")
- [ ] T222 [US5] Implement inline rename in CollectionItem (double-click name to edit, Enter to save, Escape to cancel)
- [ ] T223 [US5] Add drag handle to CollectionItem for reordering
- [ ] T224 [US5] Implement drag-and-drop reordering for collections in CollectionSidebar (update order on drop)
- [ ] T225 [US5] Add drag handle to SavedRequestItem for reordering/moving
- [ ] T226 [US5] Implement drag-and-drop reordering for requests within collection (update order on drop)
- [ ] T227 [US5] Implement drag-and-drop move request between collections (update collectionId on drop)
- [ ] T228 [US5] Add visual feedback for drag-and-drop (highlight drop zones, show drag preview)
- [ ] T229 [US5] Run all US5 component tests and verify 100% pass

### Integration Tests for User Story 5

> **End-to-end organization validation**

- [ ] T230 [US5] Create tests/integration/collection-organization-workflow.test.tsx for full workflow (create empty collections → add requests → reorder → move → rename → delete)
- [ ] T231 [US5] Add test for deleting non-empty collection in collection-organization-workflow.test.tsx (verify warning shown, X requests count)
- [ ] T232 [US5] Add test for drag-and-drop move request in collection-organization-workflow.test.tsx (drag from Collection A to Collection B, verify moved)
- [ ] T233 [US5] Run all US5 integration tests and verify 100% pass

**Checkpoint**: User Story 5 complete! Full collection organization system functional. Users can manage large workspaces efficiently.

---

## Phase 8: Data Portability (Import/Export) - Completes FR-032 to FR-036

**Goal**: Enable users to export/import collections and environments as JSON files for backup, sharing, and team collaboration

**Independent Test**: Export collection "User APIs" to JSON file, delete collection, import JSON file, verify all requests restored with {{variables}} intact

**Delivers Value**: Data portability, backup, and team sharing capabilities (critical for collaborative workflows)

### Tests for Import/Export Service (TDD - Write FIRST)

> **RED**: Write import/export tests FIRST

- [ ] T234 [P] Create src/renderer/services/importExportService.test.ts with collection export tests (single collection, multiple collections)
- [ ] T235 [P] Add environment export tests to importExportService.test.ts (single environment, multiple environments)
- [ ] T236 [P] Add collection import tests to importExportService.test.ts (valid JSON, duplicate handling, variable reference validation)
- [ ] T237 [P] Add environment import tests to importExportService.test.ts (valid JSON, duplicate handling, merge options)
- [ ] T238 [P] Add validation tests to importExportService.test.ts (invalid JSON, schema version mismatch, missing fields)

### Implementation for Import/Export Service

> **GREEN**: Implement import/export logic

- [ ] T239 Create src/renderer/services/importExportService.ts with ImportExportService class
- [ ] T240 Implement exportCollection method (serialize collection + requests to CollectionExport format, add version + timestamp)
- [ ] T241 Implement exportCollections method (serialize multiple collections to CollectionBulkExport format)
- [ ] T242 Implement exportEnvironment method (serialize environment to EnvironmentExport format)
- [ ] T243 Implement exportEnvironments method (serialize multiple environments to EnvironmentBulkExport format)
- [ ] T244 Implement importCollection method (parse JSON, validate schema, handle duplicates, return import summary)
- [ ] T245 Implement importEnvironment method (parse JSON, validate schema, handle duplicates, return import summary)
- [ ] T246 Add schema validation helper (check version compatibility, validate structure against storage-schema.ts)
- [ ] T247 Add duplicate resolution helper (prompt user: rename, overwrite, skip)
- [ ] T248 Add variable reference validator (check if imported collection references undefined variables, return warning list)
- [ ] T249 Run all ImportExportService tests and verify 100% pass

### Tests for Import/Export UI (TDD - Write FIRST)

> **RED**: Write UI tests for import/export features

- [ ] T250 [P] Add export tests to CollectionItem.test.tsx (right-click menu "Export", save JSON file)
- [ ] T251 [P] Add import tests to CollectionSidebar.test.tsx ("Import Collection" button, select JSON file, handle duplicates)
- [ ] T252 [P] Add export tests to EnvironmentDialog.test.tsx ("Export" button, save JSON file)
- [ ] T253 [P] Add import tests to EnvironmentSelector.test.tsx ("Import Environment", select JSON file, handle duplicates)

### Implementation for Import/Export UI

> **GREEN**: Add import/export buttons and dialogs

- [ ] T254 Add "Export" option to CollectionItem context menu (opens file save dialog)
- [ ] T255 Implement export handler in CollectionItem (call importExportService.exportCollection, save to user-selected path)
- [ ] T256 Add "Import Collection" button to CollectionSidebar header (opens file picker dialog)
- [ ] T257 Implement import handler in CollectionSidebar (read JSON file, call importExportService.importCollection, show import summary)
- [ ] T258 Add duplicate resolution dialog (show when importing collection with duplicate name: "Rename", "Overwrite", "Skip" buttons)
- [ ] T259 Add variable reference warning dialog (show when imported collection uses undefined variables, list missing variables)
- [ ] T260 Add "Export" button to EnvironmentDialog (save environment JSON)
- [ ] T261 Add "Import Environment" button to EnvironmentSelector menu (opens file picker)
- [ ] T262 Implement environment import handler (read JSON, call importExportService.importEnvironment, show summary)
- [ ] T263 Add "Export All" to CollectionSidebar menu (export all collections to single JSON file)
- [ ] T264 Add "Export All" to EnvironmentSelector menu (export all environments to single JSON file)
- [ ] T265 Run all import/export UI tests and verify 100% pass

### Integration Tests for Import/Export

> **End-to-end data portability validation**

- [ ] T266 Create tests/integration/import-export-workflow.test.tsx for full workflow (export collection → delete → import → verify restored)
- [ ] T267 Add test for exporting collection with {{variables}} (verify variables preserved in JSON, not resolved)
- [ ] T268 Add test for importing collection with missing variables (verify warning shown with list of undefined variables)
- [ ] T269 Add test for duplicate handling during import (rename, overwrite, skip scenarios)
- [ ] T270 Add test for environment import/export (export → modify source → import → verify changes)
- [ ] T271 Run all import/export integration tests and verify 100% pass

**Checkpoint**: Import/export complete! Users can backup, share, and restore collections/environments. Data portability functional.

---

## Phase 9: Performance Optimization & Polish

**Purpose**: Ensure constitutional performance requirements met, optimize UX, add final polish

**Constitutional Requirements**:
- Variable substitution: <50ms for 100+ variables (FR-013)
- Collection load: <500ms for 500+ requests
- Environment switch: <100ms UI response
- Memory: <200MB total app usage

### Performance Tests (Create FIRST)

> **Measure performance against constitutional requirements**

- [ ] T272 [P] Create tests/performance/variable-resolution.perf.test.ts (100 variables <50ms, 1000 variables benchmark)
- [ ] T273 [P] Create tests/performance/collection-load.perf.test.ts (500 requests <500ms load time)
- [ ] T274 [P] Create tests/performance/environment-switch.perf.test.ts (UI response <100ms when switching)
- [ ] T275 [P] Create tests/performance/memory-usage.perf.test.ts (app memory <200MB with 50 collections, 100 environments)

### Performance Optimization

> **Optimize based on performance test results**

- [ ] T276 Add memoization to variableResolver (cache resolved strings per environment, invalidate on environment change)
- [ ] T277 Implement lazy loading for CollectionSidebar (virtualize list, only render visible items)
- [ ] T278 Optimize electron-store reads (batch reads, cache in memory with electron-store watch for changes)
- [ ] T279 Add debouncing to resolved URL hint display (avoid re-resolving on every keystroke)
- [ ] T280 Optimize SavedRequest serialization (use JSON.stringify efficiently, compress large bodies)
- [ ] T281 Run all performance tests and verify constitutional requirements met

### UX Polish

> **Final user experience improvements**

- [ ] T282 [P] Add keyboard shortcuts (Ctrl+S to save request, Ctrl+E to open environment dialog, Ctrl+K for collection search)
- [ ] T283 [P] Add search/filter to CollectionSidebar (filter by request name, highlight matches)
- [ ] T284 [P] Add recent requests quick access (show last 5 loaded requests at top of sidebar)
- [ ] T285 [P] Add tooltips to all buttons and icons (improve discoverability per constitutional requirement)
- [ ] T286 [P] Add loading states to all async operations (spinners, skeleton screens)
- [ ] T287 [P] Add success/error toast notifications (environment created, collection exported, import failed)
- [ ] T288 [P] Add confirmation dialogs for destructive actions (delete environment, delete non-empty collection)
- [ ] T289 [P] Improve error messages (convert technical errors to user-friendly messages with actionable suggestions)

### Cross-Platform Testing

> **Verify identical behavior on Windows, macOS, Linux per constitutional requirement**

- [ ] T290 Run all integration tests on Windows (verify 100% pass)
- [ ] T291 Run all integration tests on macOS (verify 100% pass)
- [ ] T292 Run all integration tests on Linux (verify 100% pass)
- [ ] T293 Manual E2E test on Windows (create env → use variables → save collection → export → import)
- [ ] T294 Manual E2E test on macOS (same workflow as T293)
- [ ] T295 Manual E2E test on Linux (same workflow as T293)
- [ ] T296 Verify electron-store paths work correctly on all platforms (check ~/.config/swiftapi/ on macOS/Linux, AppData on Windows)

### Documentation & Discoverability

> **Ensure feature is discoverable per constitutional Principle VI**

- [ ] T297 [P] Add inline help text to EnvironmentDialog (explain variable syntax, show examples)
- [ ] T298 [P] Add placeholder text to all input fields (e.g., "Enter environment name (e.g., Development)")
- [ ] T299 [P] Add empty state illustrations (friendly graphics for "No environments", "No collections")
- [ ] T300 [P] Add onboarding tooltip sequence (first-time user: "Create environment" → "Use {{variables}}" → "Save to collection")
- [ ] T301 [P] Update main README with Collections & Environment Variables feature section
- [ ] T302 [P] Create feature demo GIF showing variable substitution workflow

### Code Quality & Coverage

> **Ensure constitutional Principle V requirements met**

- [ ] T303 Run ESLint on all new code and fix warnings (complexity <10, no `any` types)
- [ ] T304 Run TypeScript compiler in strict mode and fix all errors
- [ ] T305 Run full test suite and verify 80%+ coverage (npm run coverage)
- [ ] T306 Review code for security issues (XSS in variable values, injection attacks)
- [ ] T307 Add JSDoc comments to all public APIs (models, services, stores)
- [ ] T308 Refactor any code with cyclomatic complexity >10 per ESLint rules

**Checkpoint**: Phase 9 complete! Feature is performant, polished, cross-platform, and ready for production.

---

## Phase 10: E2E Testing & Release Preparation

**Purpose**: Final end-to-end validation and release readiness

### E2E Tests

> **Comprehensive end-to-end workflows**

- [ ] T309 Create tests/e2e/collections-variables.e2e.test.ts with full user journey test (install app → create environment → define variables → use in request → save to collection → switch environment → verify different values)
- [ ] T310 Add test for import/export workflow in collections-variables.e2e.test.ts (export → delete → import → verify restored)
- [ ] T311 Add test for all edge cases in collections-variables.e2e.test.ts (circular variables, undefined variables, duplicate names, delete active env)
- [ ] T312 Run E2E tests on all platforms (Windows, macOS, Linux) and verify 100% pass

### Release Validation

> **Final checks before release**

- [ ] T313 Verify all 36 functional requirements (FR-001 to FR-036) are implemented and tested
- [ ] T314 Verify all 10 success criteria (SC-001 to SC-010) are met
- [ ] T315 Verify all 8 constitutional principles are followed (run constitution checklist)
- [ ] T316 Run full CI/CD pipeline and verify all checks pass (tests, linting, build, E2E)
- [ ] T317 Verify backward compatibility with Feature 001 (existing request builder still works, history preserved)
- [ ] T318 Test upgrade path (existing users can upgrade without data loss)
- [ ] T319 Perform manual smoke test on all platforms (install, use feature, verify works)
- [ ] T320 Review and merge any outstanding PRs or fixes

**Checkpoint**: Feature 002 complete and production-ready! 🎉

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories (variable resolver is foundation)
- **User Story 1 (Phase 3)**: Depends on Foundational - MVP core feature
- **User Story 2 (Phase 4)**: Depends on US1 (uses EnvironmentSelector from US1)
- **User Story 3 (Phase 5)**: Depends on US1 (enhances environment management from US1)
- **User Story 4 (Phase 6)**: Depends on Foundational only (independent of environments)
- **User Story 5 (Phase 7)**: Depends on US4 (enhances collection organization from US4)
- **Import/Export (Phase 8)**: Depends on US1 + US4 (needs environments and collections)
- **Polish (Phase 9)**: Depends on all user stories being complete
- **E2E (Phase 10)**: Depends on Polish (final validation)

### User Story Dependencies Graph

```
Setup (Phase 1)
       ↓
Foundational (Phase 2) ← Variable Resolver
       ↓
       ├→ US1 (Phase 3) 🎯 MVP ← Environment Variables
       │      ↓
       │      ├→ US2 (Phase 4) ← Environment Switching
       │      │
       │      └→ US3 (Phase 5) ← Environment Management
       │
       └→ US4 (Phase 6) ← Collections
              ↓
              └→ US5 (Phase 7) ← Collection Organization
                     ↓
Import/Export (Phase 8) ← Data Portability
       ↓
Polish (Phase 9) ← Performance & UX
       ↓
E2E Testing (Phase 10) ← Release
```

### Parallel Opportunities

Within each phase, tasks marked **[P]** can run in parallel:

**Phase 2 (Foundational)**: Tests T008-T012 can all be written in parallel

**Phase 3 (US1)**:
- Tests T025-T028 (Environment model tests) parallel
- Tests T037-T040 (Environment service tests) parallel
- Tests T051-T053 (Environment store tests) parallel
- Tests T062-T065 (UI component tests) parallel

**Phase 6 (US4)**:
- Tests T132-T137 (Collection/SavedRequest model tests) parallel
- Tests T147-T151 (Collection service tests) parallel
- Tests T179-T184 (UI component tests) parallel

**Phase 9 (Polish)**:
- All performance tests T272-T275 parallel
- All UX polish tasks T282-T289 parallel
- All documentation tasks T297-T302 parallel

---

## Implementation Strategy

### MVP First (Phases 1-4 Only)

**Goal**: Ship working environment variables feature ASAP

1. Complete Phase 1: Setup (~1-2 hours)
2. Complete Phase 2: Foundational Variable Resolver (~4-6 hours, TDD)
3. Complete Phase 3: User Story 1 (~8-12 hours, TDD)
4. Complete Phase 4: User Story 2 (~4-6 hours, TDD)
5. **STOP and VALIDATE**: Test environment variables independently
6. Deploy MVP (users can create environments, define variables, use {{syntax}} in requests, switch environments)

**MVP Scope**: 4 phases, ~80 tasks, ~20-26 hours

### Incremental Delivery

**Post-MVP Releases**:

1. **MVP Release** (US1 + US2): Environment variables working ✅
2. **Release 1.1** (US3): Add environment management UI
3. **Release 1.2** (US4 + US5): Add collections
4. **Release 1.3** (Import/Export): Add data portability
5. **Release 1.4** (Polish + E2E): Production-ready

Each release adds value without breaking previous features.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (~6-8 hours)
2. Once Foundational done:
   - **Developer A**: User Story 1 + 2 (environment variables)
   - **Developer B**: User Story 4 + 5 (collections)
   - **Developer C**: Import/Export (Phase 8)
3. Merge independently, then do Polish + E2E together

---

## Parallel Example: User Story 1

```bash
# Launch all Environment model tests together:
Task: "Create src/models/Environment.test.ts with creation tests"
Task: "Add validation tests to src/models/Environment.test.ts"
Task: "Add update tests to src/models/Environment.test.ts"
Task: "Add utility method tests to src/models/Environment.test.ts"

# Launch all Environment service tests together:
Task: "Create src/renderer/services/environmentService.test.ts with CRUD tests"
Task: "Add active environment tests to environmentService.test.ts"
Task: "Add uniqueness validation tests to environmentService.test.ts"
Task: "Add persistence tests to environmentService.test.ts"
```

---

## Notes

- **[P]** tasks = different files, no dependencies, can run in parallel
- **[Story]** label maps task to specific user story for traceability (US1, US2, US3, US4, US5)
- Each user story is independently completable and testable
- **TDD is mandatory** per constitutional Principle I: Write tests FIRST (RED), then implement (GREEN), then refactor (REFACTOR)
- Verify tests fail before implementing (RED phase)
- Commit after each logical group of tasks
- Stop at any checkpoint to validate story independently
- Run `npm test` frequently to ensure no regressions
- Run `npm run coverage` to verify 80%+ coverage requirement
- All tasks follow existing patterns from Feature 001 (check quickstart.md for examples)

---

## Task Count Summary

- **Phase 1 (Setup)**: 7 tasks
- **Phase 2 (Foundational)**: 17 tasks
- **Phase 3 (US1)**: 61 tasks
- **Phase 4 (US2)**: 19 tasks
- **Phase 5 (US3)**: 27 tasks
- **Phase 6 (US4)**: 74 tasks
- **Phase 7 (US5)**: 28 tasks
- **Phase 8 (Import/Export)**: 38 tasks
- **Phase 9 (Polish)**: 37 tasks
- **Phase 10 (E2E)**: 12 tasks

**Total**: 320 tasks

**MVP Scope** (Phases 1-4): 104 tasks (~20-26 hours with TDD)

**Parallel Opportunities**: ~40% of tasks marked [P] can run concurrently, reducing wall-clock time significantly with multiple developers.
