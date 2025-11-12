# SwiftAPI

> A fast, lightweight, and privacy-focused API testing client - the open-source alternative to Postman

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](tsconfig.json)
[![Constitution](https://img.shields.io/badge/Governance-Constitution-green)](.specify/memory/constitution.md)

## Why SwiftAPI?

SwiftAPI is an open-source API testing client designed to replace Postman with a focus on:

- **🚀 Performance** - Loads in <3 seconds, uses <200MB memory
- **💻 Cross-Platform** - Identical experience on Windows, macOS, and Linux
- **🔒 Privacy-First** - No telemetry, no cloud lock-in, works 100% offline
- **⚡ Simplicity** - First API call in under 2 minutes, zero configuration
- **🧪 Quality** - 80%+ test coverage, strict TypeScript, comprehensive testing
- **🌐 Local-First** - Zero dependency on hosted services, full offline functionality

## Key Features

### ✅ Core Functionality (v0.1.0-alpha)
- **HTTP Methods**: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
- **Request Builder**: URL input, headers, query parameters, body (JSON, XML, Text)
- **Collections**: Organize and save requests with folders
- **Environments**: Manage multiple environments (Dev, Staging, Production)
- **Variables**: Template syntax `{{variable}}` with nested resolution
- **Request History**: Auto-save and replay previous requests
- **Response Viewer**: Syntax highlighting, formatted JSON/XML
- **Authentication**: Basic, Bearer Token, API Key

### 🎨 User Experience
- **Tabbed Interface**: Organized tabs for Query Params, Headers, Body, Authentication
- **Keyboard Shortcuts**:
  - `Ctrl/Cmd+Enter` - Send request
  - `Ctrl/Cmd+S` - Save request
- **Visual Feedback**: Loading spinners, status indicators, tooltips
- **Confirmation Dialogs**: Protect against accidental deletions
- **Collections Sidebar**: Tree view with context menus for rename, delete, duplicate

### 🚀 Performance (Exceeds Targets)
- Variable resolution: **< 1ms** (100-700x faster than 50ms target)
- Collection loading: **< 10ms** for 500 requests (50x faster)
- Environment switching: **< 1ms** (100x faster)
- Test coverage: **96.42%** (exceeds 80% requirement)

### 🔜 Coming Soon
- ⏳ Pre-request and post-response scripts
- ⏳ Collection runner for automated testing
- ⏳ CLI for CI/CD integration
- ⏳ Import/Export (Postman, OpenAPI, cURL)
- ⏳ GraphQL support
- ⏳ WebSocket testing

## Installation

### Build from Source (Recommended for Now)

SwiftAPI is currently in active development. Pre-built binaries will be available soon.

For now, you can run SwiftAPI from source:

```bash
# Clone the repository
git clone https://github.com/gmoorevt/swiftapi.git
cd swiftapi

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

### Pre-built Binaries (Coming Soon)

Once SwiftAPI reaches v1.0, pre-built binaries will be available from [GitHub Releases](https://github.com/gmoorevt/swiftapi/releases):

- **macOS**: `.dmg` installer
- **Windows**: `.exe` installer and portable `.zip`
- **Linux**: AppImage, `.deb`, and `.rpm` packages

### Package Managers (Future)

```bash
# macOS (Homebrew)
brew install swiftapi

# Windows (Chocolatey)
choco install swiftapi

# Linux (snap)
snap install swiftapi
```

## Documentation

For comprehensive usage instructions, see the [User Guide](docs/USER_GUIDE.md), which covers:
- Making your first API request
- Working with collections and environments
- Request configuration (headers, body, authentication)
- Viewing and analyzing responses
- Keyboard shortcuts and productivity tips
- Troubleshooting common issues

## Quick Start

### Your First API Request (< 2 minutes)

1. **Launch SwiftAPI**
   ```bash
   npm run dev
   ```

2. **Make a Request**
   - Enter a URL: `https://api.github.com/users/octocat`
   - Select method: `GET`
   - Click **Send** (or press `Ctrl/Cmd+Enter`)
   - View the response with syntax highlighting

3. **Save to Collection**
   - Click **Save** (or press `Ctrl/Cmd+S`)
   - Create a new collection or select existing
   - Name your request

### Using Variables and Environments

1. **Create an Environment**
   - Click the environment dropdown (top right)
   - Click **Manage Environments**
   - Create "Development" environment
   - Add variable: `base_url` = `https://api.dev.example.com`

2. **Use Variables in Requests**
   - URL: `{{base_url}}/users`
   - Headers: `Authorization: Bearer {{api_token}}`
   - Body: `{"userId": "{{user_id}}"}`

3. **Switch Environments**
   - Select "Development", "Staging", or "Production" from dropdown
   - All variables automatically resolve to the active environment

### Keyboard Shortcuts

- `Ctrl/Cmd+Enter` - Send request
- `Ctrl/Cmd+S` - Save request
- Right-click on collections/requests for more options

## Development

SwiftAPI follows a strict [Constitution](.specify/memory/constitution.md) that governs development practices.

### Tech Stack

- **Desktop**: Electron
- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS or Chakra UI
- **Code Editor**: Monaco Editor or CodeMirror
- **Testing**: Vitest (unit), Playwright (E2E)
- **Build**: Vite + Electron Builder

### Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/swiftapi.git
cd swiftapi

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Project Structure

```
swiftapi/
├── .specify/           # Speckit feature specs and constitution
├── src/                # Application source code
│   ├── main/          # Electron main process
│   ├── renderer/      # React frontend
│   ├── models/        # Data models
│   ├── services/      # Business logic
│   └── lib/           # Shared utilities
├── tests/             # Test suites
│   ├── unit/          # Unit tests
│   ├── integration/   # Integration tests
│   ├── contract/      # API contract tests
│   ├── e2e/           # End-to-end tests
│   └── performance/   # Performance tests
└── docs/              # Documentation
```

### Constitutional Requirements

All contributions must comply with the [SwiftAPI Constitution](.specify/memory/constitution.md):

1. **Test-First Development** (NON-NEGOTIABLE) - TDD is mandatory
2. **Cross-Platform Consistency** - Works identically on all platforms
3. **Simplicity First** - YAGNI principle, justify complexity
4. **Performance & Resource Efficiency** - Meet performance targets
5. **Code Quality Standards** - TypeScript strict, 80%+ coverage
6. **Documentation & Discoverability** - Every feature documented
7. **Open-Source & Community First** - Privacy-focused, transparent
8. **Local-First Architecture** - Zero cloud dependencies, works offline

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our development process and how to submit pull requests.

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch: `git checkout -b [###-feature-name]`
3. Write tests first (TDD required)
4. Implement your feature
5. Ensure all tests pass and coverage is 80%+
6. Submit a pull request

## Roadmap

- [x] **Foundation**: Constitution v1.1.0 and project setup
- [x] **Phase 1**: Basic Request Builder - HTTP methods, request/response, history
- [x] **Phase 2**: Environment Management - Variables, environments, template resolution
- [x] **Phase 6**: Collections & Organization - Save requests, organize in collections
- [x] **Phase 9**: Performance & UX Polish - Tabs, keyboard shortcuts, loading states
- [ ] **Phase 3**: Testing & Validation - Scripts, collection runner, assertions
- [ ] **Phase 4**: CLI & Automation - Command-line interface, CI/CD integration
- [ ] **Phase 5**: Import/Export - Postman collections, OpenAPI, cURL
- [ ] **Phase 7**: Advanced Features - WebSocket, gRPC, mock servers

**Current Status**: v0.1.0-alpha - Core features complete, ready for testing and feedback!

## Community

- **Issues**: [GitHub Issues](https://github.com/yourusername/swiftapi/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/swiftapi/discussions)
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)

## Performance Targets

SwiftAPI commits to these measurable performance goals:

- Application load time: **< 3 seconds**
- Memory usage (20 requests, 3 envs): **< 200MB**
- Request execution overhead: **< 100ms**
- UI interaction response: **< 100ms**
- Tab switching: **< 100ms**
- Search (1000 requests): **< 500ms**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

SwiftAPI is inspired by the need for a fast, privacy-focused, and truly open-source API testing tool. We believe developers deserve tools they can trust and control.

---

**Status**: 🚧 In Development | **Version**: 0.1.0-alpha | **Constitution**: v1.1.0
