# ACA Alfresco Content Application - Project Summary

## Overview

**ACA (Alfresco Content Application)** is a file management application built using the **Alfresco Application Development Framework (ADF)** for Alfresco Content Services (ACS). It provides a streamlined user experience focused on file management within the Alfresco content repository.

## Project Information

| Property | Value |
|----------|-------|
| **Name** | alfresco-content-app |
| **Version** | 7.5.0 |
| **License** | LGPL-3.0 |
| **Repository** | https://github.com/Alfresco/alfresco-content-app.git |
| **Framework** | Angular 19.x |
| **Build Tool** | Nx Workspace |
| **CLI** | @alfresco/adf-cli 8.6.0 |

## Technology Stack

### Core Dependencies
- **Angular**: 19.2.x (Core framework)
- **ADF**: 8.6.0 (Alfresco Development Framework)
- **ACS**: 26.x (Alfresco Content Services)
- **Node.js**: 24.x
- **RxJS**: 7.8.2

### Key Libraries
- **@alfresco/adf-content-services**: 8.6.0
- **@alfresco/adf-core**: 8.6.0
- **@alfresco/adf-extensions**: 8.6.0
- **@alfresco/js-api**: 9.6.0
- **@angular/material**: 19.2.19 (Material Design UI)
- **@ngrx/store**: 19.2.1 (State Management)
- **ngx-markdown**: 19.1.1 (Markdown rendering)
- **pdfjs-dist**: 5.1.91 (PDF viewing)
- **mermaid**: 11.12.3 (Diagram rendering)
- **katex**: 0.16.21 (Math rendering)
- **prismjs**: 1.30.0 (Code highlighting)

### Dev Dependencies
- **Karma/Jasmine**: Unit testing
- **Playwright**: E2E testing
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Stylelint**: CSS linting
- **Husky**: Git hooks

## Features

The application provides comprehensive file management capabilities:

### Core Features
- **File/Folder Browsing**: Personal files, shared files, recent files, favorites
- **Trash Can**: Restore or permanently remove deleted items
- **Upload**: Drag-and-drop or New button uploads
- **Search**: Quick search with live results and full faceted search
- **Viewer**: Native browser viewing for supported formats
- **Metadata**: Properties aspects and EXIF information
- **Versioning**: Version management and upload of new versions
- **File Sharing**: Share with time-expiry externally generated URLs
- **Permissions**: Granular user permission management

### Advanced Features
- **Edit Offline**: Lock/unlock for editing with version control
- **Microsoft Office Integration**: Edit online with Alfresco Office Services (AOS)
- **Library Management**: Create, find, join, and favorite file libraries
- **Folder Rules**: Custom folder-based rules
- **Single Sign-On (SSO)**: Support for Alfresco Identity Service
- **Single Log Out**: Synchronized logout across applications
- **Localizations**: Multi-language support (English + 15+)
- **Accessibility**: WCAG compliant UI
- **Extensibility**: Safe extension points for custom components

## Project Structure

```
alfresco-content-app/
├── app/                    # Main application
│   ├── src/
│   │   ├── app/           # Application components
│   │   ├── assets/        # Static assets
│   │   ├── environments/  # Environment configs
│   │   └── main.ts
├── projects/              # Nx projects
│   ├── aca-content/      # Main content application
│   ├── aca-shared/       # Shared utilities
│   └── aca-playwright-shared/ # E2E test utilities
├── e2e/                  # E2E tests
├── docs/                 # Documentation
│   ├── features/        # Feature documentation
│   ├── configuration/   # Configuration guides
│   ├── extending/       # Extension guides
│   ├── getting-started/ # Setup guides
│   └── tutorials/       # Developer tutorials
├── scripts/              # Utility scripts
└── docker/               # Docker configuration
```

## Development Setup

### Requirements
- Node.js 18.x or 24.x (depending on version)
- npm 9.x

### Setup Commands
```bash
npm install
npm start        # Development server
npm run build    # Production build
npm test         # Run tests
npm run lint     # Lint code
```

### Configuration
The app requires an `.env` file:
```
BASE_URL="<ACS_URL>"
```

## Compatibility Matrix

| ACA Version | ADF Version | ACS Version | Node Version | Angular Version |
|-------------|-------------|-------------|--------------|-----------------|
| 7.5.x | 8.6.0 | 26.x | 24.x | 19.x |
| 7.4.x | 8.4.1 | 26.x | 24.x | 19.x |
| 7.3.x | 8.3.1 | 26.x | 24.x | 19.x |
| 7.2.x | 8.2.1 | 23.x, 25.x | 22.x | 19.x |
| 7.1.x | 8.1.1 | 25.2 | 22.x | 19.x |
| 7.0.x | 8.0.0 | 25.2 | 22.x | 19.x |

## Testing

- **Unit Tests**: Karma + Jasmine
- **E2E Tests**: Playwright
- **Code Coverage**: HTML reports in `./coverage/<project>`

## CI/CD Scripts

```bash
ci:lint        # Run linter
ci:test        # Run unit tests
ci:build       # Build application
ci:audit       # Security audit
ci:licenses    # License check
ci:changelog   # Generate changelog
ci:e2e         # Run E2E tests
```

## Contributing

- **Code of Conduct**: CODE_OF_CONDUCT.md
- **Contributing Guide**: CONTRIBUTING.md
- **Issues**: https://github.com/Alfresco/alfresco-content-app/issues
- **JIRA Project**: https://issues.alfresco.com/jira/projects/ACA

## Documentation

- **Main Docs**: https://alfresco-content-app.netlify.app/
- **ADF Docs**: https://www.alfresco.com/abn/adf/
- **Gitter Chat**: https://gitter.im/Alfresco/content-app
- **Community**: https://community.alfresco.com/

## License

LGPL-3.0 - See LICENSE file for details
