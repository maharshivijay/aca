# Codebase Updates: Document Details View & Actions

This document details the updates made to introduce the new **Document Details** feature in the Alfresco Content App, including rules, actions/effects, modules, extensions, routing, and the new user interface components.

---

## Table of Contents
1. [Rule Definition for Permissions](#1-rule-definition-for-permissions)
2. [Actions & Effects Definition](#2-actions--effects-definition)
3. [Rule Mapping Registration](#3-rule-mapping-registration)
4. [Context Menu Extension Registration](#4-context-menu-extension-registration)
5. [Route Mapping](#5-route-mapping)
6. [New Document Details Component](#6-new-document-details-component)

---

## 1. Rule Definition for Permissions

**File**: [projects/aca-shared/rules/src/app.rules.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/rules/src/app.rules.ts)

A utility rule function has been defined to verify permissions on the selected items:
- **Function**: `canReadSelectedNode(context: RuleContext): boolean`
- **Purpose**: Checks if the first selected node has the read permission by running:
  ```typescript
  context.permissions.check(node, ['read'])
  ```

---

## 2. Actions & Effects Definition

### Actions Definition
**File**: [projects/aca-shared/store/src/actions/node.actions.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/store/src/actions/node.actions.ts)
- Added `ViewDocumentDetails` enum item under `NodeActionTypes`.
- Declared and exported the `ViewDocumentDetailsAction` action class.

### Effects Handling
**File**: [projects/aca-content/src/lib/store/effects/node.effects.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/store/effects/node.effects.ts)
- Imported `ViewDocumentDetailsAction`.
- Added the `viewDocumentDetails$` NgRx effect which intercepts the `ViewDocumentDetailsAction`. It evaluates `action.payload` and dispatches `NavigateUrlAction`. If `action.payload` is undefined (e.g., when run from context menu clicks via `runActionById`), it falls back to selecting the node ID from the global store selection (`getAppSelection`).

---

## 3. Rule Mapping Registration

**File**: [projects/aca-content/src/lib/aca-content.module.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/aca-content.module.ts)
- Mapped the rule selector string `'app.selection.first.canRead'` to `rules.canReadSelectedNode` inside the global rules registration block.

---

## 4. Context Menu Extension Registration

**File**: [projects/aca-content/assets/app.extensions.json](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/assets/app.extensions.json)
- Added a new context menu action definition `app.context.menu.document.details` under the `features.contextMenu` property.
- **Attributes**:
  - **Title**: `APP.ACTIONS.DETAILS`
  - **Action Link**: Binds to `VIEW_DOCUMENT_DETAILS` click action handler.
  - **Visibility Rules**:
    - `app.selection.file` (must be a file selection)
    - `!app.navigation.isTrashcan` (must not be inside the Trashcan)
    - `app.selection.first.canRead` (the file must have read permission)

---

## 5. Route Mapping

**File**: [projects/aca-content/src/lib/aca-content.routes.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/aca-content.routes.ts)
- Imported `DocumentDetailsComponent` and `PreviewComponent`.
- Registered the dynamic route `'document-details/:nodeId'` mapping to `DocumentDetailsComponent` under standard content layout children.
- Registered the new standalone route `'preview-embed/:nodeId'` mapping directly to `PreviewComponent` at the root-level (without the shell layout wrapper) to render a clean, isolated document preview.

---

## 6. New Document Details Component

**Folder**: `projects/aca-content/src/lib/components/document-details/`

A dedicated component suite designed to present a comprehensive, user-friendly details view of any document.

### 6.1 Component TS Logic
**File**: [document-details.component.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/document-details/document-details.component.ts)
- Injects `ActivatedRoute`, Store, standard `Location` service, Content URL service, Notifications service, Content Management service, and `DomSanitizer`.
- Implements lifecycle hooks to resolve document node details using the `nodeId` parameter.
- Computes `iframeUrl` by passing `/#/preview-embed/<nodeId>?embed=true` to `DomSanitizer.bypassSecurityTrustResourceUrl` to render the preview safely.
- Exposes action handlers for downloading, viewing inline, offline editing, toggling property grids, editing metadata, managing permissions, and copying/moving/deleting the node.

### 6.2 Component View Template
**File**: [document-details.component.html](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/document-details/document-details.component.html)
- Implements a modern two-column dashboard layout (70/30 split).
- **Left Column (70%)**:
  - Breadcrumbs display for path navigation context.
  - Document header with rating indicators and action buttons.
  - `<iframe>` block pointing to `iframeUrl` for full interactive file rendering, isolating the viewer completely.
  - `<app-comments-tab>` for displaying, viewing, and writing comments.
- **Right Column (30%)**:
  - List of primary Document Actions.
  - Tag management list (`<adf-tag-node-list>`).
  - Read-only Share link input field.
  - Properties sidebar (`<app-metadata-tab>`).
  - Version history sidebar (`<app-versions-tab>`).

### 6.3 Styling
**File**: [document-details.component.scss](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/document-details/document-details.component.scss)
- Modern layout styles utilizing clean flexboxes and relative sizing.
- Custom styling for header panels, action buttons, borders, subtle shadows, and visual divisions between workspace columns.
- Styles the `.preview-iframe` element inside `.embedded-viewer-container` to fill the container perfectly with no borders.

---

## 7. Embedded Preview Component Customizations

### 7.1 Component TS Logic
**File**: [preview.component.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/viewer/src/lib/components/preview/preview.component.ts)
- Subscribes to `queryParams` to read the `embed` parameter and sets the `isEmbedded` boolean property.
- Configures dynamic host class binding to append `aca-preview-embedded` when `isEmbedded` is true.

### 7.2 Styling Overrides
**File**: [preview.component.scss](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/viewer/src/lib/components/preview/preview.component.scss)
- Added `.aca-preview-embedded` host rules:
  - Hides the close button (`.adf-viewer-close-button`) and the right sidebar (`.adf-viewer__sidebar__right`) when embedded inside the details page iframe to prevent duplicate sidebars and inactive controls.

### 7.3 Tests Definition
**File**: [document-details.component.spec.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/document-details/document-details.component.spec.ts)
- Standard specs asserting component lifecycle hooks, route parameter reading, and toggle functions.
- Cleaned up unused imports (`By` and `Location`) and the unused `store` declaration/assignment.
