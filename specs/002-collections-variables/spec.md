# Feature Specification: Collections & Environment Variables

**Feature Branch**: `002-collections-variables`
**Created**: 2025-01-11
**Status**: Draft
**Input**: User description: "Create a feature specification for **Collections & Environment Variables** in SwiftAPI. Enable users to organize requests into collections and use environment variables with {{variable}} template syntax for dynamic values in URLs, headers, and request bodies. User stories: 1) Save request to collection, 2) Use variables like {{baseUrl}}/users, 3) Switch environments (Dev/Prod), 4) Manage collections. Must follow SwiftAPI Constitution (TDD, 80% coverage, local-first, electron-store, <50ms variable substitution overhead)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Use Environment Variables in Requests (Priority: P1)

As a user testing APIs across multiple environments (Dev, Staging, Production), I want to use {{variableName}} syntax in my request URLs, headers, query parameters, and body so that I can quickly switch between environments without manually editing every request.

**Why this priority**: Variable substitution is the foundational feature that enables environment management. Without it, users must manually update URLs and credentials for each environment, which is error-prone and time-consuming. This delivers immediate value even before collections are implemented.

**Independent Test**: Can be fully tested by defining a variable `{{baseUrl}}` with value `https://api.dev.example.com`, using it in a request URL `{{baseUrl}}/users`, and verifying the actual HTTP request goes to `https://api.dev.example.com/users`. Delivers value by enabling multi-environment testing workflow.

**Acceptance Scenarios**:

1. **Given** I have created an environment "Dev" with variable `baseUrl=https://api.dev.example.com`, **When** I enter `{{baseUrl}}/users` in the URL field, **Then** the UI shows the resolved URL `https://api.dev.example.com/users` as a hint
2. **Given** I have a request with `{{baseUrl}}/users`, **When** I click Send, **Then** the actual HTTP request is sent to the resolved URL `https://api.dev.example.com/users`
3. **Given** I have variables in URL, headers, query params, and body, **When** I send the request, **Then** all {{variable}} references are replaced with their values before sending
4. **Given** I use an undefined variable `{{apiKey}}`, **When** I try to send the request, **Then** I see a validation error listing the undefined variable
5. **Given** I have nested variables like `baseUrl=https://{{domain}}.com` and `domain=api.dev`, **When** I resolve `{{baseUrl}}`, **Then** it correctly resolves to `https://api.dev.com`

---

### User Story 2 - Switch Between Environments (Priority: P1)

As a user testing the same API across Dev and Production, I want to quickly switch my active environment from a dropdown so that all my requests automatically use the correct variables without manual changes.

**Why this priority**: Environment switching is the key user interaction that makes variables valuable. Without it, users would need to manually update every variable, defeating the purpose. This must be implemented alongside variable substitution to deliver the complete workflow.

**Independent Test**: Can be fully tested by creating two environments ("Dev" with `baseUrl=https://dev.api.com`, "Production" with `baseUrl=https://api.com`), switching between them, and verifying that requests use the correct baseUrl. Delivers value by enabling one-click environment switching.

**Acceptance Scenarios**:

1. **Given** I have two environments "Dev" and "Production" with different `baseUrl` values, **When** I switch from "Dev" to "Production" in the environment dropdown, **Then** all {{baseUrl}} references immediately resolve to the Production value
2. **Given** I am on the "Dev" environment, **When** I send a request with `{{baseUrl}}/users`, **Then** the request goes to the Dev baseUrl
3. **Given** I switch to "Production" environment, **When** I send the same request, **Then** the request goes to the Production baseUrl without me editing anything
4. **Given** no environment is selected, **When** I try to use {{variables}}, **Then** I see a prompt to create or select an environment first
5. **Given** I switch environments, **When** the new environment is missing a variable used in my request, **Then** I see a validation warning listing the missing variable

---

### User Story 3 - Manage Environments (Priority: P2)

As a user managing multiple API testing scenarios, I want to create, edit, rename, and delete environments with their variable definitions so that I can organize my testing configurations.

**Why this priority**: This enables users to set up and maintain their environment configurations. While P2 (can manually edit JSON files as workaround), it's essential for a complete user experience.

**Independent Test**: Can be fully tested by creating a new environment "Staging", adding variables, editing values, renaming to "QA", and deleting it. Delivers value by providing a user-friendly interface for environment management.

**Acceptance Scenarios**:

1. **Given** I click "New Environment", **When** I enter name "Staging" and add variable `baseUrl=https://staging.api.com`, **Then** the environment is created and available in the environment dropdown
2. **Given** I have an environment "Dev", **When** I edit it to change `baseUrl` from `https://dev.api.com` to `https://development.api.com`, **Then** all subsequent requests use the updated value
3. **Given** I have an environment "Development", **When** I rename it to "Dev Environment", **Then** it appears with the new name in the dropdown and all functionality continues working
4. **Given** I have multiple environments, **When** I delete "Old Staging", **Then** it is removed from the dropdown and if it was active, I'm prompted to select a different environment
5. **Given** I have variables in an environment, **When** I add/edit/delete a variable, **Then** changes take effect immediately for all requests using that environment

---

### User Story 4 - Save Requests to Collections (Priority: P2)

As a user working with a complex API, I want to save my current request (with URL, method, headers, body, and auth) to a named collection so that I can reuse it later without recreating everything.

**Why this priority**: Collections provide organization and reusability. While valuable, users can still test APIs without collections by manually creating requests each time. This is P2 because it's an optimization that builds on top of the working request builder.

**Independent Test**: Can be fully tested by configuring a POST request to `/api/users` with headers and body, saving it as "Create User" in collection "User Management", closing the app, reopening, and loading the request to verify all settings are preserved. Delivers value by enabling request reusability.

**Acceptance Scenarios**:

1. **Given** I have configured a POST request with URL, headers, and body, **When** I click "Save to Collection" and choose collection "API Tests" with name "Create User", **Then** the request is saved and appears in the collection sidebar
2. **Given** I have a saved request "Create User", **When** I click on it in the sidebar, **Then** all request details (URL, method, headers, body, auth) are loaded into the request builder
3. **Given** I have a saved request "Get Users", **When** I modify it and save again, **Then** the collection is updated with my changes
4. **Given** I am creating a new collection, **When** I enter the name "User Management" and save my first request to it, **Then** the collection is created and the request is saved in one action
5. **Given** I have requests using {{variables}}, **When** I save them to a collection, **Then** the variable references are preserved (not the resolved values), so they work with any environment

---

### User Story 5 - Organize Collections (Priority: P3)

As a user with many saved requests, I want to create, rename, delete, and reorder collections so that I can keep my workspace organized and find requests quickly.

**Why this priority**: This is P3 because basic collection functionality (creating via save, viewing, loading requests) is covered in User Story 4. This story adds organizational polish that improves the experience but isn't essential for initial release.

**Independent Test**: Can be fully tested by creating collections "Auth APIs", "User APIs", moving/reordering requests between them, renaming "Auth APIs" to "Authentication", and deleting empty collections. Delivers value by providing a complete organizational system.

**Acceptance Scenarios**:

1. **Given** I have no collections, **When** I click "New Collection" and enter name "User Management", **Then** an empty collection is created in the sidebar
2. **Given** I have a collection "User APIs", **When** I rename it to "User Management APIs", **Then** all requests remain intact with the new collection name
3. **Given** I have requests in "Old Collection", **When** I delete the collection, **Then** I'm warned that X requests will be deleted and must confirm before deletion proceeds
4. **Given** I have multiple collections, **When** I drag-and-drop to reorder them, **Then** the new order persists after restarting the app
5. **Given** I have multiple requests in a collection, **When** I drag-and-drop to reorder them or move them to another collection, **Then** the requests are reorganized as expected

---

### Edge Cases

- **Circular variable references**: What happens when `var1={{var2}}` and `var2={{var1}}`? System must detect and show error "Circular variable reference detected: var1 → var2 → var1"
- **Special characters in variables**: How does system handle variables with values containing `{{` or `}}`? System should support escaping with double braces: `{{{{` renders as literal `{{`
- **Large variable values**: What happens when a variable contains 1MB of JSON data? System must handle without performance degradation (<50ms substitution time per constitutional requirement)
- **Duplicate collection names**: How does system handle two collections with the same name? System prevents creation, shows error "Collection 'API Tests' already exists"
- **Deleting active environment**: What happens when user deletes the currently selected environment? System prompts to select a different environment and warns that requests with variables will fail until an environment is selected
- **Concurrent edits**: How does system handle two requests saved to same collection name simultaneously? Last write wins, with automatic save ensuring no data loss
- **Invalid variable names**: What happens with `{{my variable}}` (spaces) or `{{123}}` (starting with number)? System shows validation error "Variable names must start with letter and contain only letters, numbers, and underscores"
- **Environment export/import**: What happens to references when importing collection that uses variables not defined in current environment? System warns about missing variables and allows user to map or create them
- **Unicode in variables**: How does system handle emoji or non-ASCII characters in variable names/values? System fully supports Unicode per modern web standards

## Requirements *(mandatory)*

### Functional Requirements

#### Environment Management

- **FR-001**: System MUST allow users to create named environments (e.g., "Dev", "Staging", "Production")
- **FR-002**: System MUST allow users to define key-value pairs as variables within each environment
- **FR-003**: System MUST allow users to edit, rename, and delete environments
- **FR-004**: System MUST allow users to select one active environment at a time
- **FR-005**: System MUST persist all environment configurations locally using electron-store (no cloud dependencies per constitution)
- **FR-006**: System MUST validate that variable names start with a letter and contain only letters, numbers, and underscores
- **FR-007**: System MUST prevent duplicate environment names (case-insensitive)

#### Variable Substitution

- **FR-008**: System MUST support {{variableName}} syntax in request URLs
- **FR-009**: System MUST support {{variableName}} syntax in request headers (both names and values)
- **FR-010**: System MUST support {{variableName}} syntax in query parameters (both keys and values)
- **FR-011**: System MUST support {{variableName}} syntax in request body content
- **FR-012**: System MUST resolve all {{variable}} references with values from the active environment before sending HTTP request
- **FR-013**: System MUST complete variable substitution in under 50ms (constitutional performance requirement)
- **FR-014**: System MUST support nested variable resolution (e.g., `{{baseUrl}}` = `https://{{domain}}.com` where `{{domain}}` = `api.dev`)
- **FR-015**: System MUST detect and report circular variable references with clear error message
- **FR-016**: System MUST show validation error when request contains undefined variables
- **FR-017**: System MUST display resolved URL as a hint/preview in the UI while preserving the {{variable}} syntax in the editable field
- **FR-018**: System MUST preserve {{variable}} syntax when saving requests (not resolved values), enabling reuse across environments

#### Collection Management

- **FR-019**: System MUST allow users to create named collections to organize requests
- **FR-020**: System MUST allow users to save current request (URL, method, headers, query params, body, body type, auth settings) to a collection with a descriptive name
- **FR-021**: System MUST allow users to load saved requests from collections back into the request builder
- **FR-022**: System MUST allow users to update/overwrite saved requests with current request state
- **FR-023**: System MUST allow users to rename and delete collections
- **FR-024**: System MUST allow users to delete individual requests from collections
- **FR-025**: System MUST allow users to reorder collections in the sidebar
- **FR-026**: System MUST allow users to reorder requests within a collection
- **FR-027**: System MUST allow users to move requests between collections
- **FR-028**: System MUST persist all collections and saved requests locally using electron-store
- **FR-029**: System MUST warn users when deleting a collection that contains requests, requiring confirmation
- **FR-030**: System MUST prevent duplicate collection names (case-insensitive)
- **FR-031**: System MUST auto-save collection changes immediately to prevent data loss (constitutional requirement: local-first with no data loss on crash)

#### Data Portability

- **FR-032**: System MUST allow users to export collections as JSON files for backup/sharing
- **FR-033**: System MUST allow users to import collections from JSON files
- **FR-034**: System MUST allow users to export environments as JSON files for backup/sharing
- **FR-035**: System MUST allow users to import environments from JSON files
- **FR-036**: System MUST warn users when importing collections that reference variables not defined in current active environment

### Key Entities

- **Environment**: Represents a named configuration context (e.g., "Dev", "Production") containing a set of variable key-value pairs. Only one environment can be active at a time. All {{variable}} references in requests resolve against the active environment's variables.

- **Variable**: A key-value pair defined within an environment. Keys must be valid identifiers (start with letter, contain only alphanumeric and underscore). Values are strings that can contain any content, including references to other variables using {{syntax}}.

- **Collection**: A named container for organizing related saved requests (e.g., "User Management APIs", "Authentication Flows"). Collections provide hierarchical organization in the sidebar.

- **SavedRequest**: A complete snapshot of a request configuration including URL, HTTP method, headers, query parameters, body content, body type, authentication settings, and a user-provided descriptive name. SavedRequests preserve {{variable}} references (not resolved values) to enable reuse across different environments.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create an environment and define variables in under 30 seconds
- **SC-002**: Users can switch between environments with a single click, and all variable references update instantly
- **SC-003**: Variable substitution completes in under 50ms even with 100+ variables and nested references (constitutional performance requirement)
- **SC-004**: Users can save a configured request to a collection in under 5 seconds
- **SC-005**: 95% of users successfully use {{variables}} in their first request without reading documentation (discoverability requirement)
- **SC-006**: Users can export and import collections/environments without data loss (100% fidelity)
- **SC-007**: Application handles 500+ saved requests across 50+ collections without performance degradation (load time <3s per constitutional requirement)
- **SC-008**: Zero data loss when application closes or crashes (constitutional requirement: auto-save)
- **SC-009**: Feature achieves 80%+ test coverage with integration tests for all user stories (constitutional requirement)
- **SC-010**: Feature works identically on Windows, macOS, and Linux (constitutional requirement: cross-platform consistency)

## Assumptions *(mandatory)*

1. **Storage Format**: Collections and environments will be stored in JSON format using electron-store, following the existing pattern from the history/settings implementation
2. **Variable Syntax**: Using double-brace `{{variable}}` syntax matches industry standards (Postman, Insomnia) for familiarity
3. **No Cloud Sync**: Per constitution's local-first architecture, there is no cloud synchronization - users must manually export/import to share configurations
4. **Nested Variable Depth**: Reasonable maximum nesting depth of 10 levels to prevent infinite recursion attacks
5. **Collection Hierarchy**: Initial implementation uses flat collections (no folders within collections) - folders can be added in Phase 2 if needed
6. **Variable Scope**: Variables are environment-scoped only (no global variables, no collection-level variables in initial version)
7. **Authentication**: Saved requests include auth settings, but sensitive values (passwords, tokens) should ideally be stored as variables for security
8. **Request Deduplication**: System allows multiple requests with the same name in different collections (uniqueness enforced per-collection, not globally)
9. **Conflict Resolution**: When importing collections/environments with duplicate names, user is prompted to rename or overwrite
10. **Performance Baseline**: "Large" variable values assumed to be under 10MB (reasonable for API testing scenarios); larger values may require streaming

## Dependencies & Constraints *(optional)*

### Dependencies

- **Builds on Feature 001**: Requires existing request builder (URL, method, headers, query params, body, auth) as foundation
- **Electron Store**: Requires `electron-store` library for local persistence (already used in Feature 001 for history)
- **UI Framework**: Requires React components for sidebar, dropdown, modal dialogs (existing UI stack)
- **Variable Resolution Library**: May leverage existing JavaScript string templating or implement custom lightweight resolver (<50ms requirement)

### Constraints

- **Constitutional Requirements**: Must follow SwiftAPI Constitution (TDD, 80%+ coverage, local-first, cross-platform, <50ms overhead)
- **Performance**: Variable substitution must add <50ms overhead to request sending (measured in integration tests)
- **Memory**: Must handle 100+ variables, 500+ saved requests, 50+ collections within constitutional memory limit (<200MB total app usage)
- **No External Dependencies**: Cannot use cloud APIs, telemetry, or external services (local-first architecture)
- **Backward Compatibility**: Must not break existing Feature 001 functionality (request builder, history, authentication)

## Open Questions *(optional)*

None - all key decisions have reasonable defaults documented in Assumptions section. Critical questions (variable syntax, storage mechanism, environment switching UX) align with industry standards and constitutional requirements.
