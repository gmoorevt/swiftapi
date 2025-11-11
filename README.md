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

### Core Functionality
- ✅ HTTP request builder (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS)
- ✅ Collections and environments for organizing requests
- ✅ Variables with {{template}} syntax
- ✅ Request history and auto-save
- ✅ Response viewer with syntax highlighting

### Testing & Automation
- ✅ Pre-request and post-response scripts (JavaScript)
- ✅ Test assertions and validations
- ✅ Collection runner for automated testing
- ✅ CLI for CI/CD integration
- ✅ Multiple report formats (JSON, JUnit, HTML)

### Developer Experience
- ✅ Dark mode support
- ✅ Keyboard shortcuts for everything
- ✅ Quick switcher (Cmd/Ctrl+K)
- ✅ Multiple tabs
- ✅ Import/Export (Postman, OpenAPI, cURL)

### Advanced Features
- ✅ Authentication (Basic, Bearer, OAuth 2.0, API Key)
- ✅ GraphQL support with schema introspection
- ✅ WebSocket testing
- ✅ File uploads and multipart forms
- ✅ Mock servers for local development

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

## Quick Start

> Coming soon - First API call in under 2 minutes!

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

- [x] **Foundation**: Constitution and project setup
- [ ] **Phase 1**: MVP - Basic request engine, collections, variables (Weeks 1-4)
- [ ] **Phase 2**: Enhanced UX - Folders, authentication, keyboard shortcuts (Weeks 5-8)
- [ ] **Phase 3**: Testing & Validation - Scripts, collection runner, assertions (Weeks 9-12)
- [ ] **Phase 4**: CLI & Automation - Command-line interface, CI/CD integration (Weeks 13-16)
- [ ] **Phase 5**: Documentation & Sharing - Auto-docs, import/export (Weeks 17-20)
- [ ] **Phase 6**: Advanced - WebSocket, gRPC, mock servers (Weeks 21-28)

See the full [Product Specification](api-client-specification.md) for detailed features.

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
