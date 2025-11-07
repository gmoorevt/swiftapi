# Contributing to SwiftAPI

Thank you for your interest in contributing to SwiftAPI! We welcome contributions from the community and are grateful for your support.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Constitutional Requirements](#constitutional-requirements)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Submitting Contributions](#submitting-contributions)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

SwiftAPI is committed to fostering an inclusive and respectful community. We expect all contributors to:

- Be respectful and constructive in discussions
- Welcome newcomers and help them get started
- Focus on what is best for the project and community
- Show empathy towards other community members

## Constitutional Requirements

**IMPORTANT**: All contributions must comply with the [SwiftAPI Constitution](.specify/memory/constitution.md).

### Eight Core Principles

1. **Test-First Development (NON-NEGOTIABLE)** - Tests MUST be written before implementation
2. **Cross-Platform Consistency** - Code must work identically on Windows, macOS, and Linux
3. **Simplicity First** - Prefer simple solutions, follow YAGNI
4. **Performance & Resource Efficiency** - Meet performance targets (<3s load, <200MB memory)
5. **Code Quality Standards** - TypeScript strict mode, 80%+ test coverage, ESLint compliant
6. **Documentation & Discoverability** - Document all features, write clear error messages
7. **Open-Source & Community First** - Privacy-focused, no tracking, transparent
8. **Local-First Architecture** - No cloud dependencies, works 100% offline

**Violations of constitutional principles will result in PR rejection.**

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Git
- A code editor (VS Code recommended)

### Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/swiftapi.git
cd swiftapi

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/swiftapi.git
```

### Install Dependencies

```bash
npm install
```

### Run Development Environment

```bash
# Start dev server
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Type check
npm run type-check
```

## Development Workflow

### Branching Strategy

- **Main Branch**: `main` - always deployable, protected
- **Feature Branches**: `[###-feature-name]` - follow Speckit format
- **Hotfix Branches**: `hotfix-[description]` - for urgent fixes

```bash
# Create a feature branch
git checkout -b 001-add-request-builder

# Work on your feature...

# Keep your branch up to date
git fetch upstream
git rebase upstream/main
```

### Commit Standards

We use **Conventional Commits** format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

**Examples:**

```bash
git commit -m "feat(request): add support for GraphQL queries"
git commit -m "fix(auth): resolve OAuth token refresh issue"
git commit -m "docs: update installation instructions"
git commit -m "test(collections): add integration tests for folder structure"
```

### Test-Driven Development (MANDATORY)

SwiftAPI follows strict TDD practices:

1. **Red**: Write a failing test first
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Improve the code while keeping tests green

**Example TDD Workflow:**

```typescript
// 1. RED - Write failing test first
describe('RequestBuilder', () => {
  it('should create a GET request with URL', () => {
    const builder = new RequestBuilder();
    const request = builder.method('GET').url('https://api.example.com').build();

    expect(request.method).toBe('GET');
    expect(request.url).toBe('https://api.example.com');
  });
});

// Run test - it should FAIL
// npm test

// 2. GREEN - Implement minimal code to pass
export class RequestBuilder {
  private request: Request = { method: 'GET', url: '' };

  method(method: string): this {
    this.request.method = method;
    return this;
  }

  url(url: string): this {
    this.request.url = url;
    return this;
  }

  build(): Request {
    return this.request;
  }
}

// Run test - it should PASS
// npm test

// 3. REFACTOR - Improve code quality
// (Add validation, type safety, etc.)
```

## Submitting Contributions

### Before You Submit

- [ ] Tests written FIRST (TDD)
- [ ] All tests pass: `npm test`
- [ ] Code coverage ≥ 80%: `npm run coverage`
- [ ] Linting passes: `npm run lint`
- [ ] Type checking passes: `npm run type-check`
- [ ] Feature works on all platforms (Windows, macOS, Linux)
- [ ] Documentation updated
- [ ] No cloud dependencies introduced

### Creating a Pull Request

1. **Push your branch**:
   ```bash
   git push origin [###-feature-name]
   ```

2. **Create PR on GitHub**:
   - Use a clear, descriptive title
   - Reference related issues: `Fixes #123` or `Relates to #456`
   - Describe what changed and why
   - Include screenshots for UI changes
   - List any breaking changes

3. **PR Template**:

```markdown
## Description
Brief description of what this PR does.

## Related Issue
Fixes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Constitutional Compliance
- [ ] I. Test-First Development - Tests written first
- [ ] II. Cross-Platform Consistency - Tested on all platforms
- [ ] III. Simplicity First - Simplest solution chosen
- [ ] IV. Performance - No performance regressions
- [ ] V. Code Quality - 80%+ coverage, strict TypeScript
- [ ] VI. Documentation - Features documented
- [ ] VII. Open-Source - No tracking added
- [ ] VIII. Local-First - No cloud dependencies

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated (if applicable)
- [ ] All tests pass

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

## Coding Standards

### TypeScript

- **Strict Mode**: Always enabled, no `any` types
- **Naming**:
  - Classes: `PascalCase`
  - Functions/Variables: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Interfaces: `IPascalCase` or `PascalCase`
  - Types: `PascalCase`
- **File Structure**: One export per file (main component/class)

### Code Quality

- **Function Length**: Keep under 50 lines (exceptions require justification)
- **Cyclomatic Complexity**: Keep under 10 per function
- **Comments**: Explain "why", not "what"
- **JSDoc**: Required for all public APIs

```typescript
/**
 * Builds an HTTP request with specified parameters.
 * @param method - HTTP method (GET, POST, etc.)
 * @param url - Target URL
 * @returns Configured Request object
 * @throws {ValidationError} If URL is invalid
 */
export function buildRequest(method: HttpMethod, url: string): Request {
  // Implementation
}
```

### Formatting

- **ESLint**: Must pass with zero warnings
- **Prettier**: Auto-formatted (configured in project)
- **Line Length**: 100 characters max
- **Indentation**: 2 spaces
- **Semicolons**: Required
- **Quotes**: Single quotes for strings

## Testing Requirements

### Test Types

1. **Unit Tests** (Required for all new code)
   - Location: `tests/unit/`
   - Coverage: Minimum 80%
   - Speed: Entire suite < 30 seconds

2. **Integration Tests** (Required for user stories)
   - Location: `tests/integration/`
   - At least one per user story

3. **Contract Tests** (Required for API interactions)
   - Location: `tests/contract/`
   - Validate all HTTP request/response formats

4. **E2E Tests** (Required for critical paths)
   - Location: `tests/e2e/`
   - Must run on all three platforms

5. **Performance Tests** (Required before releases)
   - Location: `tests/performance/`
   - Validate constitutional performance targets

### Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run coverage

# Watch mode
npm run test:watch
```

## Pull Request Process

### Review Criteria

Reviewers will evaluate:

1. **Correctness** - Does it work? Edge cases handled?
2. **Tests** - TDD followed? Comprehensive coverage?
3. **Simplicity** - Simplest solution? Complexity justified?
4. **Performance** - No regressions? Meets targets?
5. **User Experience** - Discoverable? Well documented?
6. **Cross-Platform** - Works on all platforms?
7. **Constitution Compliance** - All principles followed?

### Approval Requirements

- **1 approval required** (2 for releases)
- **All status checks must pass**:
  - Unit tests
  - Integration tests
  - E2E tests (all platforms)
  - Linting
  - Type checking
  - Code coverage (80%+)

### After Approval

Once approved and merged:
- Your branch will be deleted
- Changes will be included in the next release
- You'll be credited in release notes

## Need Help?

- **Questions**: Open a [Discussion](https://github.com/OWNER/swiftapi/discussions)
- **Bugs**: Open an [Issue](https://github.com/OWNER/swiftapi/issues)
- **Feature Requests**: Open an [Issue](https://github.com/OWNER/swiftapi/issues) with `enhancement` label

## License

By contributing, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers this project.

---

Thank you for contributing to SwiftAPI! Your efforts help build a better, more open API testing tool for everyone.
