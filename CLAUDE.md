# CLAUDE.md

# Project Overview

This project is a custom enterprise ECM/PLM-style frontend application built using:

* Angular
* Alfresco Application Development Framework (ADF)
* Alfresco Content Application (ACA) as the base
* Alfresco Content Services (ACS) as backend

The application should follow enterprise-grade architecture principles:

* Extension over modification
* Modular architecture
* Reusable components
* Maintainable code
* Upgrade-safe customizations
* API-first design

IMPORTANT:

* Never modify ADF framework internals.
* Never modify node_modules.
* Minimize direct modifications to Alfresco Content App core files.
* Prefer wrappers, plugins, extension points, services, and custom modules.

---

# Primary Objective

Build a modern enterprise document management / engineering document portal using Alfresco ADF.

The application should support:

* Authentication
* Folder browsing
* Document upload/download
* Metadata management
* Search
* Preview/viewer
* Workflow integration
* Dashboard pages
* Role-based UI
* Custom engineering document workflows

---

# Technology Stack

## Frontend

* Angular
* TypeScript
* RxJS
* Angular Material
* NgRx (optional but preferred)
* Alfresco ADF

## Backend

* Alfresco Content Services (ACS)
* Alfresco REST APIs
* Keycloak / OIDC integration (future)

## Deployment

* Docker
* Docker Compose
* Kubernetes (future)

---

# Source Code Base

Base application:

[https://github.com/Alfresco/alfresco-content-app](https://github.com/Alfresco/alfresco-content-app)

ADF libraries:

[https://github.com/Alfresco/alfresco-ng2-components](https://github.com/Alfresco/alfresco-ng2-components)

---

# Development Philosophy

## EXTENSION OVER MODIFICATION

Always prefer:

* Wrapper components
* Extension points
* Plugins
* Custom services
* Composition
* Configuration-driven behavior

Avoid:

* Editing ADF internals
* Editing node_modules
* Hardcoding logic in framework components
* Tight coupling

---

# Recommended Architecture

src/app/
│
├── core/
├── shared/
├── services/
├── models/
├── plugins/
├── custom-components/
├── pages/
├── guards/
├── interceptors/
├── extensions/
└── config/

---

# Folder Responsibilities

## core/

Contains:

* authentication
* app initialization
* singleton services
* global configuration
* interceptors
* guards

Rules:

* Keep minimal
* No business-specific UI logic

---

## shared/

Reusable:

* UI components
* directives
* pipes
* utility helpers
* common dialogs

Examples:

* loading spinner
* confirmation dialog
* reusable metadata card

---

## services/

Business logic layer.

Services should:

* handle REST API calls
* encapsulate business rules
* transform API responses
* manage reusable workflows

Components should NOT directly implement complex business logic.

Example:

GOOD:

component -> service -> API

BAD:

component -> API directly everywhere

---

## plugins/

Main enterprise feature modules.

Examples:

plugins/
├── engineering-review/
├── document-control/
├── workflow-dashboard/
├── bom-management/
└── quality-management/

Each plugin may contain:

* routes
* components
* services
* actions
* dialogs
* models
* state management

Plugins should remain isolated and reusable.

---

## custom-components/

Wrapper or reusable ADF-based components.

Examples:

* engineering-document-list
* custom-viewer
* metadata-editor
* approval-panel

IMPORTANT:

Prefer wrapping ADF components instead of modifying them.

Example:

GOOD:

<app-engineering-document-list>
    <adf-document-list>
</app-engineering-document-list>

BAD:

Modify adf-document-list source code.

---

## pages/

Top-level route pages.

Examples:

* dashboard
* engineering workspace
* workflow inbox
* search page

Pages orchestrate components.

---

# Angular Development Rules

## Components

Components should:

* remain small
* focus on UI
* avoid heavy business logic
* use services
* use observables properly

---

## Services

Services should:

* be reusable
* encapsulate backend communication
* manage workflows
* contain business logic

---

## RxJS

Prefer:

* observables
* async pipe
* reactive programming

Avoid:

* nested subscriptions
* callback-style coding

---

## State Management

Use:

* service-based state initially
* NgRx later for complex state

Do NOT create tightly coupled component communication.

---

# ADF Development Rules

## Use ADF Components

Prefer existing ADF components whenever possible:

* adf-document-list
* adf-viewer
* adf-search
* adf-upload-button
* adf-breadcrumb
* adf-content-node-selector

Reuse before reinventing.

---

## Wrapper Pattern

Always prefer wrapper components.

Example:

app-custom-document-list
-> internally uses adf-document-list

This enables:

* upgrade safety
* custom logic
* maintainability

---

## Extension Points

Use ACA extension points for:

* toolbar actions
* menus
* routes
* sidebar actions
* custom buttons

Avoid direct toolbar modifications.

---

## Configuration Driven Design

Use configuration files whenever possible.

Avoid hardcoded values.

Examples:

* API endpoints
* feature flags
* permissions
* viewer settings
* route visibility

---

# Coding Standards

## TypeScript

Always:

* use strong typing
* avoid any
* define interfaces/models
* use enums for constants

---

## Naming Conventions

### Components

Example:

EngineeringDashboardComponent

### Services

Example:

EngineeringDocumentService

### Models

Example:

EngineeringDocument

### Files

Use kebab-case.

Example:

engineering-document.service.ts

---

# UI/UX Guidelines

Use:

* Angular Material
* clean layouts
* responsive design
* enterprise dashboard style

Avoid:

* cluttered UI
* inline styles
* duplicated UI patterns

---

# Authentication

Current:

* Alfresco login

Future:

* Keycloak
* OpenID Connect
* SSO

Authentication should remain modular.

---

# API Integration

Use:

* Alfresco JS API
* Angular HttpClient
* typed API services

Never hardcode API logic inside components.

---

# Error Handling

Always:

* handle API failures
* show meaningful UI messages
* log errors properly
* avoid silent failures

---

# Logging

Use centralized logging.

Avoid excessive console.log in production code.

---

# Testing Expectations

Generate:

* unit tests for services
* component tests where possible
* mock services

Focus first on architecture correctness before heavy testing.

---

# Performance Guidelines

Prefer:

* lazy loaded modules
* reusable services
* OnPush change detection where applicable
* virtual scrolling for large lists

Avoid:

* large monolithic components
* duplicate API calls
* unnecessary rerenders

---

# Security Guidelines

Never:

* expose secrets
* hardcode credentials
* bypass authentication
* trust frontend-only authorization

Always:

* validate permissions
* sanitize user input
* use environment configuration

---

# Recommended Initial Features

## Phase 1

* Login
* Folder browsing
* Upload/download
* Viewer
* Search

## Phase 2

* Metadata editor
* Workflow integration
* Dashboard
* Role-based actions

## Phase 3

* Engineering workflows
* PLM-like modules
* Audit dashboards
* Reporting

---

# Important Enterprise Principles

## Composition Over Inheritance

Prefer:

* wrappers
* reusable composition

Avoid deep inheritance chains.

---

## Separation of Concerns

UI should not contain:

* heavy business rules
* backend orchestration
* complex state logic

---

## Scalability

Assume application will grow.

Design modules to remain:

* isolated
* reusable
* maintainable

---

# Things Claude Code Should Avoid

Do NOT:

* modify ADF internal source code
* modify node_modules
* generate giant monolithic components
* place all logic in app.module.ts
* tightly couple components
* duplicate business logic
* create hardcoded APIs
* use inline styles excessively

---

# Preferred Development Flow

1. Understand feature requirement
2. Create isolated module/plugin
3. Create service layer
4. Create wrapper components
5. Integrate ADF components
6. Add routing
7. Add configuration
8. Test incrementally

---

# Recommended Learning Areas

Claude Code should help generate code aligned with:

* Angular best practices
* Enterprise architecture
* ADF extension patterns
* Reactive programming
* Clean component design
* Modular frontend engineering

---

# Long-Term Vision

The project should evolve into:

* enterprise ECM portal
* engineering document management system
* PLM-style platform
* workflow-driven enterprise application

with maintainable, scalable architecture.

