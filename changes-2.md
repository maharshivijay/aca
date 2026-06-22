# Summary of Changes: New Angular Route "myhome"

This document summarizes the changes made to add the new Angular route `"myhome"` to the Alfresco Content App, which displays folders and documents from the user's Home directory using the ADF Document List.

## 1. Components
- **Files**:
  - [my-home.component.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/my-home/my-home.component.ts)
  - [my-home.component.html](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/my-home/my-home.component.html)
- **Changes**:
  - Created a new standalone [MyHomeComponent](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/my-home/my-home.component.ts) wrapper that imports and embeds `FilesComponent`.
  - Configured the template [my-home.component.html](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/my-home/my-home.component.html) to render `<aca-files [navigationPath]="'/myhome'" />` to override and handle sub-navigation relative to the `/myhome` route path.

## 2. Route Configuration
- **File**: [aca-content.routes.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/aca-content.routes.ts)
- **Changes**:
  - Imported [MyHomeComponent](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/my-home/my-home.component.ts).
  - Added new routes under `CONTENT_LAYOUT_ROUTES` to match the application shell layout:
    - `/myhome`: renders `MyHomeComponent`, sets `defaultNodeId` to `'-my-'` to display the user's home folder, and sets the page title to `'APP.BROWSE.MY_HOME.TITLE'`.
    - `/myhome/:folderId`: renders `MyHomeComponent` to load folders dynamically when navigating inside the root folder.
  - Bound sub-routes using `...createViewRoutes('myhome')` to ensure document viewer sub-navigation works correctly when opening files inside the My Home view.

## 3. Sidebar/Navbar Extensions Configuration
- **File**: [app.extensions.json](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/assets/app.extensions.json)
- **Changes**:
  - Registered a new navbar element `"app.navbar.myHome"` in the navbar children array.
  - Linked it to the `"myhome"` route with tooltip and label settings to render "My Home" in the sidebar layout.

## 4. Localization/Translations
- **File**: [en.json](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/assets/i18n/en.json)
- **Changes**:
  - Added translation key-value mappings under the `BROWSE` object for `MY_HOME`:
    ```json
    "MY_HOME": {
        "TITLE": "My Home",
        "SIDENAV_LINK": {
            "LABEL": "My Home",
            "TOOLTIP": "View your My Home"
        }
    }
    ```
  - This configures the breadcrumb component to dynamically load the "My Home" root label and updates navigation trails properly.

## 5. Unit Testing
- **File**: [my-home.component.spec.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/my-home/my-home.component.spec.ts)
- **Changes**:
  - Created a unit test suite to verify that `MyHomeComponent` instantiates correctly and renders `FilesComponent` with `navigationPath` set to `'/myhome'`.
- **File**: [engineering-approval.service.spec.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/src/lib/services/engineering-approval.service.spec.ts)
  - Fixed pre-existing TypeScript build compiler warnings in the mock node entry variable by adding an `as any` type-assertion check.

## 6. Breadcrumbs Layout & Styling Fixes
- **Files**:
  - [files.component.html](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/files/files.component.html)
  - [files.component.scss](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/files/files.component.scss)
  - [page-layout.component.scss](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/src/lib/components/page-layout/page-layout.component.scss)
- **Changes**:
  - Added `class="aca-breadcrumb"` to the `<adf-breadcrumb>` component in the files listing template to make it styleable.
  - Implemented `.aca-breadcrumb { flex: 1; min-width: 0; }` in `files.component.scss` to allow the breadcrumbs trail to expand/shrink responsively.
  - Configured global styling rule `adf-breadcrumb { flex: 1; min-width: 0; }` within the projected `.aca-page-layout-header` block in the shared layout styles. This ensures the breadcrumbs fill the available space and align the toolbar to the far right across all layout pages.
  - Custom-styled the `.adf-breadcrumb-item-chevron` element inside the shared layout header styles to hide the default material icon and render the custom `>` character separator cleanly via `::before` pseudo-element.

## 7. Navbar Sidenav Folder Tree Component
- **Files**:
  - [sidenav-tree.component.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/sidenav/components/sidenav-tree.component.ts)
  - [sidenav-tree.component.html](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/sidenav/components/sidenav-tree.component.html)
  - [sidenav-tree.component.scss](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/sidenav/components/sidenav-tree.component.scss)
  - [sidenav-tree.component.spec.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/sidenav/components/sidenav-tree.component.spec.ts)
  - [expand-menu.component.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/sidenav/components/expand-menu.component.ts)
  - [expand-menu.component.html](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/sidenav/components/expand-menu.component.html)
- **Changes**:
  - Created [SidenavTreeComponent](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/sidenav/components/sidenav-tree.component.ts) to render a dynamic tree structure of the folder hierarchy.
  - Implemented lazy folder loading (loading children via `ContentApiService.getNodeChildren()` only when expanded) to preserve network and backend performance.
  - Injected `ChangeDetectorRef` and triggered `cdr.detectChanges()` to force Angular to update the view recursively when asynchronous folder loading callbacks resolve.
  - Added robust folder validation checks (`entry.isFolder || nodeType === 'cm:folder' || nodeType === 'app:folderlink'`) to properly include all child folders while excluding documents from the tree structure.
  - Linked folder selection to Angular routing, triggering navigation to `/libraries/folderId` which automatically updates the right-side data table component, and configured selecting a node to auto-expand it.
  - Listened to routing events (`NavigationEnd`) to dynamically highlight the active tree node if the folder is navigated through breadcrumbs or double clicks on the data table.
  - Integrated [SidenavTreeComponent](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/sidenav/components/sidenav-tree.component.ts) in [expand-menu.component.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/sidenav/components/expand-menu.component.ts) imports, and embedded it beneath the `"My Library"` navbar button in [expand-menu.component.html](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/sidenav/components/expand-menu.component.html).
  - Created a unit test suite [sidenav-tree.component.spec.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/sidenav/components/sidenav-tree.component.spec.ts) to verify library listing, child folder lazy-loading, and route navigation.




