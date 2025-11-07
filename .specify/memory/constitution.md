<!--
  SYNC IMPACT REPORT
  ==================

  Version Change: 1.0.0 → 1.1.0
  Date: 2025-11-07
  Change Type: MINOR (new principle added)

  Amendment Summary:
  - Added Principle VIII: Local-First Architecture
  - Enforces zero dependency on hosted services for core functionality
  - Application must run fully offline with all features accessible

  Principles Modified:
  - NEW: VIII. Local-First Architecture (requires offline-first design, no mandatory cloud dependencies)

  Rationale for Version Bump:
  - MINOR version increment: New principle section added
  - This materially expands governance by establishing local-first as architectural requirement
  - Does not remove or redefine existing principles (would be MAJOR)
  - Goes beyond clarification or wording fix (would be PATCH)

  Templates Requiring Updates:
  ✅ plan-template.md - Must add Principle VIII to Constitution Check gates
  ✅ spec-template.md - User scenarios align with UX and testing principles
  ✅ tasks-template.md - Testing requirements align with Testing Standards section
  ⚠️  checklist-template.md - Should be reviewed to ensure alignment (not modified yet)
  ⚠️  agent-file-template.md - Referenced in Governance section (not modified yet)

  Follow-up TODOs:
  - Update plan-template.md with new Principle VIII check
  - Review checklist-template.md for alignment with constitution principles
  - Review agent-file-template.md for runtime guidance consistency
  - Update any existing feature specs/plans to reference new constitution gates
  - Add constitution compliance checks to CI/CD pipeline
  - Validate architecture design ensures zero cloud dependencies for core features
-->

# SwiftAPI Constitution

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)

All new features MUST follow Test-Driven Development. Tests are written BEFORE implementation, and tests MUST fail initially before code is written to make them pass. This follows the Red-Green-Refactor cycle:

- **Red**: Write a failing test
- **Green**: Write minimal code to make the test pass
- **Refactor**: Improve the code while keeping tests green

**Requirements**:
- No pull request shall be merged without corresponding tests
- Test coverage MUST be at least 80% for new code
- Tests MUST be written before seeking code review
- Tests MUST be deterministic—no flaky tests allowed

**Rationale**: This ensures code reliability, prevents regressions, encourages better design, and provides executable documentation of expected behavior.

### II. Cross-Platform Consistency

The application MUST provide identical functionality and user experience across Windows, macOS, and Linux. Users switching between platforms should feel at home.

**Requirements**:
- UI components MUST render consistently across all three platforms
- Performance characteristics MUST be comparable (within 20% variance)
- All features MUST work on all supported platforms
- Platform-specific code MUST be justified, minimized, and documented
- CI/CD MUST test on all three platforms before merge
- Installation MUST be simple on all platforms (ideally single-click or single-command)

**Rationale**: SwiftAPI aims to replace Postman with a truly cross-platform experience. Inconsistencies harm user trust and adoption.

### III. Simplicity First

Prioritize simplicity and clarity over feature richness. Every feature addition MUST justify its complexity cost. Follow YAGNI (You Aren't Gonna Need It).

**Requirements**:
- Time to first successful API call MUST be under 2 minutes for new users
- Default configuration MUST work out-of-the-box without setup
- Complex features MUST be opt-in, not forced on users
- UI MUST be discoverable—users should not need external documentation for basic tasks
- Prefer fewer abstractions over architectural complexity
- Installation MUST require minimal steps (target: single command or installer)

**Rationale**: Postman became bloated. SwiftAPI wins by being fast, lean, and focused. Simplicity is a competitive advantage.

### IV. Performance & Resource Efficiency

The application MUST be fast and lightweight. These are measurable, non-negotiable performance targets:

**Hard Limits**:
- Application load time: < 3 seconds
- Memory usage for typical workload (20 requests, 3 environments): < 200MB
- Request execution overhead: < 100ms
- UI interaction response time: < 100ms
- Tab switching: < 100ms
- Search results for 1000 requests: < 500ms
- Large collections (1000+ requests) MUST remain responsive

**Requirements**:
- Performance tests MUST validate these metrics before each release
- Performance regressions MUST be caught in code review
- Memory leaks MUST be profiled and fixed
- Large payloads (>10MB) MUST not freeze the UI (use worker threads)

**Rationale**: Users are frustrated with slow, resource-intensive API clients. Speed and efficiency are core differentiators.

### V. Code Quality Standards

All code MUST meet high quality standards. Quality gates are automated and enforced in CI/CD.

**Requirements**:
- TypeScript strict mode MUST be enabled and pass
- ESLint MUST pass with no warnings
- Prettier formatting MUST be applied automatically
- Code coverage MUST be at least 80% for new features
- Cyclomatic complexity MUST be under 10 per function (exceptions require justification)
- Functions over 50 lines MUST be justified or refactored
- All public APIs MUST have JSDoc comments
- Code reviews are mandatory for ALL changes

**Rationale**: High code quality reduces bugs, improves maintainability, and enables confident refactoring.

### VI. Documentation & Discoverability

Every feature MUST be documented and discoverable. Users should succeed without external help.

**Requirements**:
- Every feature MUST have user-facing documentation
- Complex code MUST have inline comments explaining the "why"
- API contracts MUST be documented
- Installation instructions MUST be clear, tested, and up-to-date
- User should complete primary tasks without reading docs (discoverability via UI)
- Keyboard shortcuts MUST be listed in-app (Cmd/Ctrl+?)
- Error messages MUST be actionable and clear

**Rationale**: Poor documentation frustrates users and blocks adoption. Good docs build trust and reduce support burden.

### VII. Open-Source & Community First

SwiftAPI is open-source and community-driven. We prioritize transparency, user privacy, and community health.

**Requirements**:
- Code is open-source under permissive license
- Contributions MUST follow this constitution
- Issues MUST be triaged within 48 hours
- Security vulnerabilities MUST be patched within 7 days
- Breaking changes require MAJOR version bump and migration guide
- No telemetry or data collection without explicit user opt-in
- User data stays local by default (cloud sync is opt-in)
- Community contributions are welcomed and credited

**Rationale**: Open-source builds trust and community. User privacy is paramount in a world of vendor lock-in and data harvesting.

### VIII. Local-First Architecture

The application MUST run completely offline without any dependency on hosted services. Full functionality MUST be available locally.

**Requirements**:
- Application MUST NOT require internet connectivity to function
- All core features MUST work without any hosted backend or cloud service
- Application MUST NOT have mandatory dependencies on external APIs or services
- Data storage MUST be local-first (SQLite, IndexedDB, filesystem)
- Cloud sync features are OPTIONAL and must be explicitly opt-in
- Application MUST function in air-gapped or offline environments
- No feature gate-keeping behind cloud accounts or services
- Installation MUST NOT require downloading additional dependencies from remote servers (bundle everything)

**Rationale**: Users need control over their data and tools. Reliance on hosted services creates vendor lock-in, privacy concerns, and availability risks. SwiftAPI must work reliably regardless of internet connectivity or third-party service availability.

## Testing Standards

SwiftAPI follows a comprehensive testing strategy. Tests are NOT optional—they are the foundation of quality.

### Test Types

**Unit Tests**:
- Test individual functions/components in isolation
- MUST achieve 80% coverage minimum for new code
- Run fast (entire suite < 30 seconds)
- Use mocks for external dependencies
- Located in `tests/unit/` or co-located with source

**Integration Tests**:
- Test feature workflows end-to-end
- Every user story MUST have at least one integration test
- Test realistic scenarios with real dependencies where feasible
- Located in `tests/integration/`

**Contract Tests**:
- Test API request/response formats
- All HTTP interactions MUST have contract tests
- Validate request structure, response codes, response schemas
- Located in `tests/contract/`

**End-to-End Tests**:
- Test critical user journeys across the full application
- Run on all three platforms (Windows, macOS, Linux) in CI
- Use Playwright or similar E2E framework
- Focus on smoke tests and critical paths (keep suite under 10 minutes)
- Located in `tests/e2e/`

**Performance Tests**:
- Validate response times and resource usage metrics
- Run before every release
- Catch performance regressions
- Located in `tests/performance/`

### Testing Discipline

- Tests MUST be written BEFORE implementation (TDD)
- Tests MUST be deterministic—flaky tests are bugs
- Tests MUST run in CI/CD for every commit
- Tests MUST pass before PR merge
- Skipped tests (`test.skip`) require a tracked issue and must be fixed within one sprint

## Development Workflow

### Branching Strategy

- **Main Branch**: `main` - always deployable
- **Feature Branches**: `[###-feature-name]` - follow Specify format
- Branch from `main`, merge back to `main` via PR
- No direct commits to `main`

### Commit Standards

- Use Conventional Commits format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`
- Commits MUST be atomic (one logical change)
- Commit messages MUST be clear and descriptive

### Pull Request Requirements

- All changes MUST go through pull request review
- Required approvals: **1** (increase to 2 for releases)
- Required status checks MUST pass:
  - All tests (unit, integration, contract, E2E on all platforms)
  - Linting (ESLint, Prettier)
  - Type checking (TypeScript strict mode)
  - Code coverage (80% minimum)
- PR description MUST reference related issue or specification
- Breaking changes MUST be flagged and documented

### Code Review Focus

Reviewers MUST evaluate:
1. **Correctness**: Does it work? Are edge cases handled?
2. **Tests**: Are tests present, comprehensive, and do they follow TDD?
3. **Simplicity**: Is this the simplest solution? (Principle III)
4. **Performance**: Are there performance implications? (Principle IV)
5. **User Experience**: Does this align with UX principles? (Principle III, VI)
6. **Cross-Platform**: Does it work on all platforms? (Principle II)
7. **Constitution Compliance**: Does it violate any constitutional principle?

### CI/CD Pipeline

- **Continuous Integration**: Run on every push
  - Unit tests
  - Integration tests
  - Linting and type checking
  - Build verification on all three platforms
- **Continuous Deployment**: Automated builds for releases
  - E2E tests on all platforms
  - Performance regression tests
  - Sign and package installers
  - Publish to GitHub releases

### Release Cadence

- **Regular releases**: Bi-weekly or monthly cadence
- **Hotfixes**: For critical bugs or security issues (released immediately)
- **Versioning**: Follow Semantic Versioning (MAJOR.MINOR.PATCH)
- **Changelog**: MUST be updated for every release

## Governance

This constitution supersedes all other development practices and coding conventions.

**Compliance Requirements**:
- All pull requests MUST comply with constitutional principles
- Constitutional violations MUST be justified in writing before merge
- Unjustified violations result in PR rejection
- For runtime development guidance, refer to `.specify/templates/agent-file-template.md` (if present)

**Amendment Process**:

To amend this constitution:
1. Submit a written proposal explaining:
   - What is being changed and why
   - Impact analysis on existing code and practices
   - Migration plan (if applicable)
2. Community discussion period (minimum 7 days)
3. Approval from project maintainers (majority vote)
4. Update dependent templates and documentation
5. Communicate changes to all contributors

**Compliance Reviews**:
- Constitution compliance is checked during code review
- Quarterly reviews to identify systematic violations
- Constitution is living document—feedback is welcomed

**Enforcement**:
- Maintainers enforce constitutional principles
- Repeated violations may result in loss of commit access
- Security violations are handled according to security policy

---

**Version**: 1.1.0 | **Ratified**: 2025-11-07 | **Last Amended**: 2025-11-07
