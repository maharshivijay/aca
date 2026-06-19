# 🏢 ACA Enterprise Content & Document Management Application

[![Version](https://img.shields.io/badge/version-7.5.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-LGPL--3.0-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/alfresco/alfresco-content-app/ci.yml)](https://github.com/Alfresco/alfresco-content-app/actions)
[![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen.svg)](coverage/index.html)
[![Angular](https://img.shields.io/badge/Angular-19.x-000000.svg)](https://angular.io)
[![ADF](https://img.shields.io/badge/ADF-8.6.0-007ACC.svg)](https://www.alfresco.com/abn/adf/)
[![Nx](https://img.shields.io/badge/Nx-19.x-142855.svg)](https://nx.dev)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](docker/)

---

## 📖 Project Description

A modern, enterprise-grade ECM/PLM-style frontend application built on **Angular 19** and the **Alfresco Application Development Framework (ADF)**. Designed with a modular, upgrade-safe architecture, this platform extends the Alfresco Content Application (ACA) to deliver advanced document management, engineering workflows, and role-based enterprise portals **without modifying core framework internals**.

The application follows strict enterprise architecture principles: **extension over modification**, **composition over inheritance**, and **configuration-driven design**. It serves as a scalable foundation for enterprise content management, engineering document control, and workflow-driven collaboration.

---

## ✨ Key Features

### 🔹 Core File Management
- 📁 Personal, Shared, Recent & Favorites browsing
- 📤 Drag-and-drop & multi-file upload with progress tracking
- 🗑️ Trash management (restore / permanent delete)
- 🔄 Version control & version upload
- 🔗 Secure file sharing with time-expired URLs

### 🔹 Advanced Discovery & Viewing
- 🔍 Quick search with live streaming results
- 🧭 Faceted full-text search & advanced filters
- 👁️ Native browser viewer for PDF, images, code, markdown, diagrams (Mermaid/KaTeX)
- 🏷️ Metadata & EXIF property editing

### 🔹 Enterprise & PLM Capabilities
- 🛡️ Role-based UI & granular permission management
- 🔄 Workflow integration & approval panels
- 📊 Engineering review, document control, BOM & quality management plugins
- 📈 Audit dashboards & reporting modules
- 🔐 SSO/OIDC ready (Keycloak integration planned)

---

## 🏗️ Architecture Overview

### 📂 Directory Structure
```text
src/app/
├── core/              # Auth, app init, singletons, interceptors, guards
├── shared/            # Reusable UI components, directives, pipes, utilities
├── services/          # Business logic, API orchestration, workflow handlers
├── models/            # TypeScript interfaces & DTOs
├── plugins/           # Isolated enterprise feature modules (e.g., engineering-review, bom-management)
├── custom-components/ # Wrapper components around ADF primitives
├── pages/             # Top-level route pages (dashboard, workspace, inbox)
├── guards/            # Route & data guards
├── interceptors/      # HTTP interceptors (auth, error handling, logging)
├── extensions/        # ACA extension point registrations
└── config/            # Configuration files, feature flags, environment overrides
```

### 🧠 Core Design Philosophies
| Principle | Description |
|-----------|-------------|
| **Extension Over Modification** | Never edit ADF internals or `node_modules`. Use wrappers, plugins, and extension points. |
| **Wrapper Pattern** | Wrap ADF components (`adf-document-list`, `adf-viewer`) to inject custom logic while preserving upgrade safety. |
| **Configuration-Driven** | API endpoints, feature flags, permissions, and viewer settings are externalized to config files. |
| **Separation of Concerns** | UI components handle rendering only. Business logic, API calls, and state live in services. |
| **Modular Plugins** | Enterprise features are isolated in `plugins/` with independent routes, state, and dependencies. |

---

## 🛠️ Installation & Setup

### ✅ Prerequisites
- **Node.js**: `18.x` or `24.x`
- **npm**: `9.x` or higher
- **Nx CLI**: `19.x` (managed via workspace)
- **Backend**: Alfresco Content Services (ACS) `26.x` or compatible identity service

### 📦 Quick Start
```bash
# 1. Clone & navigate
git clone https://github.com/Alfresco/alfresco-content-app.git
cd alfresco-content-app

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your ACS/Identity service URLs
```

### 🚀 Run Commands
```bash
npm start          # Launch dev server (localhost:4200)
npm run build      # Production build
npm run lint       # ESLint + Stylelint checks
npm run format     # Prettier formatting
```

---

## 💻 Usage & Development Workflow

### 🔁 Recommended Development Flow
1. **Analyze Requirement** → Identify feature scope & plugin boundaries
2. **Create Isolated Module** → `nx generate @alfresco/adf-schematics:plugin <name>`
3. **Build Service Layer** → Encapsulate API calls & business rules
4. **Create Wrapper Components** → Compose ADF primitives with custom logic
5. **Register Extension Points** → Toolbar, sidebar, routes, or menu actions
6. **Add Routing & Guards** → Lazy-load modules, enforce permissions
7. **Configure Behavior** → Externalize flags, endpoints, and UI states
8. **Test Incrementally** → Unit → Component → E2E validation

### 📌 Usage Example: Custom Engineering Document List
```html
<!-- custom-engineering-list.component.html -->
<app-engineering-document-list [context]="engineeringContext">
  <adf-document-list
    [node]="currentFolder"
    [showHidden]="false"
    [showSelect]="true"
    (selectionChange)="onSelectionChange($event)">
  </adf-document-list>
</app-engineering-document-list>
```
*The wrapper handles permission checks, custom metadata columns, and workflow actions while delegating rendering to ADF.*

---

## ⚙️ Configuration

### 🌍 Environment Variables
Create or update `.env` in the project root:
```env
BASE_URL=https://your-acs-instance.com
AUTH_URL=https://your-keycloak-or-alfresco-idm.com
API_CONTEXT=/api
FEATURE_FLAGS={"enablePLM": true, "enableOfflineEdit": false}
```

### 🔌 ACA Extension Points
Register custom UI elements without touching core templates:
```typescript
// extensions/toolbar.actions.ts
export const ENGINEERING_TOOLBAR_ACTIONS = [
  {
    id: 'engineering-review',
    title: 'Start Review',
    icon: 'review',
    action: 'startEngineeringReview',
    permission: 'canReview'
  }
];
```
Extensions are merged at runtime via `@alfresco/adf-extensions` configuration.

### 📐 Configuration-Driven Design
- Use `config/` for feature toggles, viewer settings, and route visibility
- Avoid hardcoded values in components or services
- Leverage Angular's `APP_INITIALIZER` for async config loading

---

## 📏 Coding Standards & Guidelines

### 📘 TypeScript & Angular
| Rule | Guideline |
|------|-----------|
| **Typing** | Strict mode enabled. Avoid `any`. Define interfaces for all API responses. |
| **Components** | Small, focused on UI. Use `OnPush` change detection. No heavy business logic. |
| **Services** | Reusable, stateless where possible. Handle API orchestration & transformations. |
| **RxJS** | Prefer `async` pipe, `switchMap`, `combineLatest`. Avoid nested subscriptions. |
| **State** | Service-based initially. Migrate to NgRx for complex cross-plugin state. |

### 🏷️ Naming Conventions
- **Components**: `PascalCase` → `EngineeringDashboardComponent`
- **Services**: `PascalCase` + `Service` suffix → `DocumentControlService`
- **Models**: `PascalCase` → `EngineeringDocument`
- **Files**: `kebab-case` → `engineering-document.service.ts`
- **Styles**: CSS/SCSS scoped. No inline styles. Use Angular Material tokens.

### 🚫 Anti-Patterns to Avoid
- ❌ Modifying `node_modules` or ADF source code
- ❌ Placing business logic in components
- ❌ Hardcoding API endpoints or feature flags
- ❌ Tightly coupling plugins or pages
- ❌ Excessive `console.log` in production

---

## 🧪 Testing & CI/CD

### 🧫 Testing Strategy
| Type | Tool | Coverage Target |
|------|------|-----------------|
| Unit Tests | Karma + Jasmine | Services & Utilities |
| Component Tests | Karma + TestBed | UI Wrappers & Pages |
| E2E Tests | Playwright | Critical user flows |
| Visual/Regression | Storybook (future) | UI consistency |

```bash
npm test          # Run unit tests
npm run e2e       # Launch Playwright E2E suite
npm run coverage  # Generate HTML coverage report
```

### 🤖 CI/CD Pipeline
| Script | Description |
|--------|-------------|
| `ci:lint` | ESLint + Stylelint + Prettier check |
| `ci:test` | Unit test execution with coverage threshold |
| `ci:build` | Production build & bundle analysis |
| `ci:audit` | Dependency security & license compliance |
| `ci:e2e` | Headless browser E2E validation |
| `ci:changelog` | Auto-generate release notes |

---

## 🗺️ Development Roadmap

| Phase | Focus | Deliverables |
|-------|-------|--------------|
| **Phase 1** | Foundation | Login, folder browsing, upload/download, viewer, search |
| **Phase 2** | Enterprise Core | Metadata editor, workflow inbox, dashboard, role-based actions |
| **Phase 3** | PLM & Automation | Engineering workflows, BOM management, audit dashboards, reporting |

---

## 🤝 Support & Contributing

- 📖 **Official Documentation**: https://alfresco-content-app.netlify.app/
- 📘 **ADF Framework Docs**: https://www.alfresco.com/abn/adf/
- 🐛 **Issue Tracker**: https://github.com/Alfresco/alfresco-content-app/issues
- 💬 **Community**: https://community.alfresco.com/
- 📜 **License**: LGPL-3.0 (See `LICENSE` for details)

---

> 💡 **Pro Tip**: Always start with extension points and wrapper components. If you find yourself editing framework files, pause and redesign using the plugin/wrapper pattern. Upgrade safety is a first-class citizen.
