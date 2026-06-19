# NgRx State Management Usage in Alfresco Content App

This document describes the state management architecture and implementation details of **NgRx** (Reactive Store for Angular) within the **Alfresco Content Application (ACA)**. It serves as a developer guide for understanding the global state structure, core building blocks, and standard implementation patterns.

---

## 1. Overview & Architecture

The Alfresco Content App utilizes **NgRx** to manage global application state, handle routing interactions, and coordinate asynchronous side effects (like API requests, file uploads, dialog displays, and content reloads) in a centralized, predictable manner.

The NgRx structure is divided across two main libraries in the Nx workspace:
*   **Store Interfaces, Actions, & Selectors**: Defined in the shared infrastructure library under `projects/aca-shared/store` ([aca-shared/store](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/store/src/public-api.ts)).
*   **Reducers, Effects, & Store Registration**: Defined in the feature domain library under `projects/aca-content/src/lib/store` ([aca-content/store](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/store/app-store.module.ts)).

---

## 2. Global State: The `AppStore`

The global state is represented by the `AppStore` interface, which wraps a single root state slice named `app` of type `AppState`.

The state definitions and its initial properties are located in [app.state.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/store/src/states/app.state.ts).

### State Structure & Interfaces

```typescript
// projects/aca-shared/store/src/states/app.state.ts

import { SelectionState, ProfileState, NavigationState } from '@alfresco/adf-extensions';
import { RepositoryInfo, VersionEntry } from '@alfresco/js-api';

export interface AppState {
  currentNodeVersion: VersionEntry;
  selection: SelectionState;
  user: ProfileState;
  navigation: NavigationState;
  infoDrawerOpened: boolean;
  infoDrawerPreview: boolean;
  infoDrawerMetadataAspect: string;
  repository: RepositoryInfo;
  fileUploadingDialog: boolean;
  showLoader: boolean;
  searchItemsTotalCount: number;
}

export interface AppStore {
  app: AppState;
}
```

### Initial State Configuration

The state is initialized using `INITIAL_APP_STATE`:

```typescript
export const INITIAL_APP_STATE: AppState = {
  user: {
    isAdmin: null,
    id: null,
    firstName: '',
    lastName: ''
  },
  selection: {
    nodes: [],
    libraries: [],
    isEmpty: true,
    count: 0
  },
  navigation: {
    currentFolder: null
  },
  currentNodeVersion: null,
  infoDrawerOpened: false,
  infoDrawerPreview: false,
  infoDrawerMetadataAspect: '',
  fileUploadingDialog: true,
  showLoader: false,
  repository: {
    status: {
      isQuickShareEnabled: true
    }
  } as any,
  searchItemsTotalCount: null
};
```

### Core Sub-States Explained

*   **`selection` (`SelectionState`)**: Manages the list of currently selected nodes (files/folders/libraries) in the document list. Tracks details like count, empty state, and specific element types (e.g., if exactly one file or one folder is selected).
*   **`user` (`ProfileState`)**: Caches information about the currently logged-in user profile, including whether the user has administrative privileges (`isAdmin`).
*   **`navigation` (`NavigationState`)**: Keeps track of the current folder node in the directory hierarchy and the current browser URL path.
*   **`currentNodeVersion` (`VersionEntry`)**: Tracks the selected version entry of a node when managing document version history.
*   **`infoDrawerOpened` & `infoDrawerPreview` (`boolean`)**: Controls whether the Info/Metadata Drawer side-panel is open and whether it is in preview mode.
*   **`repository` (`RepositoryInfo`)**: Stores ACS metadata, active modules (e.g. `alfresco-hxinsight-connector-prediction-applier-extension`), and feature capability flags (e.g., if Quick Share is enabled).
*   **`fileUploadingDialog` (`boolean`)**: Manages the open/close state visibility of the file uploading modal.
*   **`searchItemsTotalCount` (`number`)**: Holds the count of search results returned from query execution.

---

## 3. Core NgRx Building Blocks in ACA

### A. Actions
Actions represent unique events dispatched from components, services, or extension definitions. They are classified into domain actions, defined inside `projects/aca-shared/store/src/actions/`:

| Domain | Action File | Description |
|---|---|---|
| **App** | [app.actions.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/store/src/actions/app.actions.ts) | Controls core app layout, drawer toggling, repository info, and user profiles. |
| **Node** | [node.actions.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/store/src/actions/node.actions.ts) | Manages files/folders operations (Selection, Delete, Create, Copy, Move, Favoriting, ASPECTS). |
| **Router** | [router.actions.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/store/src/actions/router.actions.ts) | Dispatches navigation actions (Navigate URL, Navigate Folder, Back navigation). |
| **Search** | [search.actions.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/store/src/actions/search.actions.ts) | Triggers simple search or faceted search queries. |
| **Upload** | [upload.actions.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/store/src/actions/upload.actions.ts) | Starts file/folder uploading flows and version updates. |
| **Viewer** | [viewer.actions.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/store/src/actions/viewer.actions.ts) | Controls the document viewing viewer actions and routes. |
| **Library** | [library.actions.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/store/src/actions/library.actions.ts) | Triggers Site / Library creation, membership management, and deletion. |

#### Implementation Example (Action Class)
```typescript
import { Action } from '@ngrx/store';
import { Node } from '@alfresco/js-api';
import { AppActionTypes } from './app-action-types';

export class SetCurrentFolderAction implements Action {
  readonly type = AppActionTypes.SetCurrentFolder;
  constructor(public payload: Node) {}
}
```

> [!NOTE]
> Many application actions automatically fall back to the currently selected nodes in the store if no payload is provided. This simplifies integration with declarative JSON extension files.

---

### B. Reducers
The `appReducer` defined in [app.reducer.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/store/reducers/app.reducer.ts) updates the `AppState` in response to dispatched actions. It uses pure functions to return a new state object without mutating the existing state directly.

#### Selected Node Reducer Logic
When `NodeActionTypes.SetSelection` is dispatched, the reducer calculates auxiliary fields (like `first`, `last`, `file`, `folder`, `library` flags) to optimize downstream selectors:

```typescript
function updateSelectedNodes(state: AppState, action: SetSelectedNodesAction): AppState {
  const newState = { ...state };
  const nodes = [...action.payload];
  const count = nodes.length;
  const isEmpty = nodes.length === 0;

  let first = null;
  let last = null;
  let file = null;
  let folder = null;
  let library = null;

  if (nodes.length > 0) {
    first = nodes[0];
    last = nodes[nodes.length - 1];

    if (nodes.length === 1) {
      file = nodes.find(
        (entity: any) =>
          !!(entity.entry.isFile || entity.entry.nodeId || entity.entry.sharedByUser)
      );
      folder = nodes.find((entity: any) => entity.entry.isFolder);
    }
  }

  const libraries: any[] = [...action.payload].filter((node: any) => node.isLibrary);
  if (libraries.length === 1) {
    library = libraries[0];
  }

  if (isEmpty) {
    newState.infoDrawerOpened = false;
  }

  newState.selection = {
    count,
    nodes,
    isEmpty,
    first,
    last,
    file,
    folder,
    libraries,
    library
  };
  return newState;
}
```

---

### C. Selectors
Selectors retrieve specific properties or computed state slices from the store. They are defined using NgRx's `createSelector` in [app.selectors.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/store/src/selectors/app.selectors.ts). Selectors are memorized for performance optimization.

```typescript
import { AppStore } from '../states/app.state';
import { createSelector } from '@ngrx/store';

// Select root state slice
export const selectApp = (state: AppStore) => state.app;

// Compose child selectors
export const getCurrentFolder = createSelector(selectApp, (state) => state.navigation.currentFolder);
export const getAppSelection = createSelector(selectApp, (state) => state.selection);
export const isInfoDrawerOpened = createSelector(selectApp, (state) => state.infoDrawerOpened);
export const getRepositoryStatus = createSelector(selectApp, (state) => state.repository);

// Complex composed selector
export const getSideNavState = createSelector(
  getAppSelection, 
  getNavigationState, 
  (selection, navigation) => ({
    selection,
    navigation
  })
);
```

---

### D. Effects
Effects handle asynchronous operations and side effects outside of components. They listen for actions, invoke Angular services (such as Hyland ADF core services or the custom `ContentManagementService`), and optionally dispatch new actions.

The application contains specialized effects classes inside `projects/aca-content/src/lib/store/effects/` including [AppEffects](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/store/effects/app.effects.ts), [NodeEffects](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/store/effects/node.effects.ts), and [RouterEffects](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/store/src/effects/router.effects.ts).

#### Route Navigation Effect Example
From [router.effects.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/store/src/effects/router.effects.ts):

```typescript
@Injectable()
export class RouterEffects {
  private readonly actions$ = inject(Actions);
  private readonly router = inject(Router);

  navigateUrl$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<NavigateUrlAction>(RouterActionTypes.NavigateUrl),
        map((action) => {
          if (action.payload) {
            this.router.navigateByUrl(action.payload);
          }
        })
      ),
    { dispatch: false } // No further action is dispatched
  );
}
```

---

## 4. Configuration & Store Wiring

The store is configured dynamically using Angular's modern functional providers via [AppStoreModule](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/store/app-store.module.ts).

```typescript
// projects/aca-content/src/lib/store/app-store.module.ts

import { NgModule } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { appReducer } from './reducers/app.reducer';
import { FullRouterStateSerializer, provideRouterStore } from '@ngrx/router-store';
import { provideEffects } from '@ngrx/effects';
import { RouterEffects } from '@alfresco/aca-shared/store';
import { AppEffects, NodeEffects, DownloadEffects, FavoriteEffects, LibraryEffects, UploadEffects, ViewerEffects } from './effects';

@NgModule({
  providers: [
    // Registers AppReducer with 'app' key
    provideStore(
      { app: appReducer },
      {
        runtimeChecks: {
          strictStateImmutability: false,
          strictActionImmutability: false
        }
      }
    ),
    // Integrates Router State
    provideRouterStore({ stateKey: 'router', serializer: FullRouterStateSerializer }),
    // Registers Side-Effect Listeners
    provideEffects([
      AppEffects,
      NodeEffects,
      DownloadEffects,
      ViewerEffects,
      SearchEffects,
      LibraryEffects,
      UploadEffects,
      FavoriteEffects,
      RouterEffects
    ])
  ]
})
export class AppStoreModule {}
```

The `AppStoreModule` is imported directly by the root feature module [AcaContentModule](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/aca-content.module.ts#L75).

---

## 5. Developer Usage Recipes

### Dispatching Actions in Components

To trigger an application behavior, inject the `Store<AppStore>` and dispatch the action.

```typescript
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppStore, ViewNodeAction } from '@alfresco/aca-shared/store';
import { Router } from '@angular/router';

@Component({
  selector: 'custom-view-button',
  standalone: true,
  template: `<button (click)="viewNode('node-id-123')">View Node</button>`
})
export class CustomViewButtonComponent {
  private readonly store = inject(Store<AppStore>);
  private readonly router = inject(Router);

  viewNode(nodeId: string) {
    // Opens file viewer relative to the current route
    this.store.dispatch(new ViewNodeAction(nodeId, { location: this.router.url }));
  }
}
```

### Selecting State reactively in Components

Components subscribe to slice streams to reactively update templates:

```typescript
import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppStore, getSideNavState } from '@alfresco/aca-shared/store';

@Component({
  selector: 'custom-sidenav',
  template: `<div *ngIf="selectionCount > 0">Selected Items: {{ selectionCount }}</div>`
})
export class CustomSidenavComponent implements OnInit {
  private readonly store = inject(Store<AppStore>);
  private readonly destroyRef = inject(DestroyRef);
  
  selectionCount = 0;

  ngOnInit() {
    this.store
      .select(getSideNavState)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        this.selectionCount = state.selection.count;
      });
  }
}
```

---

## 6. Integration with ADF JSON Extension Configurations

The Hyland Application Development Framework (ADF) Extension engine allows invoking NgRx actions directly from JSON definitions by referencing their uppercase action type string. 

For example, when creating a toolbar menu action inside a JSON extension schema file:

```json
{
  "id": "my-plugin.actions.create-folder",
  "type": "default",
  "icon": "create_new_folder",
  "title": "Create Folder",
  "actions": {
    "click": "CREATE_FOLDER"
  }
}
```

When a user clicks the button, the extension runner intercepts `"CREATE_FOLDER"`, looks up the string mapping, and automatically dispatches the `CREATE_FOLDER` action type (which is mapped to `CreateFolderAction` in NgRx). This triggers the dialog-opening logic in `TemplateEffects` or `NodeEffects` without writing manual component code.
