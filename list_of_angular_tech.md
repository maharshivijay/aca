# Angular Technologies & Design Patterns in Alfresco Content App

This document outlines the core Angular concepts, frameworks, and architecture patterns used in the Alfresco Content Application (ACA). It provides a reference for developers trying to reverse-engineer or contribute to the project.

---

## 1. Core Angular Technology Stack

The application is built on top of a modern, production-grade frontend stack:
*   **Frontend Framework**: **Angular 19.2**
*   **State Management**: **NgRx 19.2** (Store, Effects, Router Store, Store DevTools)
*   **UI Component Libraries**: **Angular Material 19.2** & **Angular CDK 19.2**
*   **Reactive Extensions**: **RxJS 7.8**
*   **Internationalization**: **ngx-translate 17.0**
*   **Build & Monorepo Tooling**: **Nx Workspace 22.5** and **ng-packagr 19.2**
*   **Testing Frameworks**: **Karma/Jasmine** (Unit/Integration) and **Playwright** (E2E)

---

## 2. Key Architecture & Design Patterns

### 📁 Nx Monorepo Library Structure
Rather than housing all logic inside a single application module, the workspace utilizes **Nx Workspace** to enforce a clean separation of concerns:
*   **App Bootstrapper ([app/](file:///home/vkpatel/aca/alfresco-content-app/app))**: Serves as the configuration and routing entry point. It has minimal business logic and wires libraries together.
*   **Shared Infrastructure ([projects/aca-shared/](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared))**: Holds the global NgRx store, shared services, and global rule evaluators.
*   **Feature Domains ([projects/aca-content/](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content))**: Modular features such as MS Office AOS integrations, viewer templates, folder execution rules, and search pages.

---

## 3. Core Angular Topics & Implementation Examples

### 1. Standalone Components
In line with modern Angular standards, components in this repository use the **standalone** pattern. Standalone components import their dependencies directly in the `@Component` decorator, eliminating the need for complex `NgModules`:
*   **Root Bootstrap Component**: [app.components.ts](file:///home/vkpatel/aca/alfresco-content-app/app/src/app/app.components.ts#L30-L37) - Declares `standalone: true` and imports `RouterOutlet` directly.
*   **Feature Component**: [SidenavComponent](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/sidenav/sidenav.component.ts#L40-L47) - Uses default standalone behavior, importing `CommonModule`, child components, and `TranslatePipe` directly in its metadata.

### 2. Functional Provider APIs & Configuration
The codebase is refactored from legacy `@NgModule` declarations to functional provider APIs, which configure router, translation, animations, and feature-flag extensions:
*   **Root Config**: [app.config.ts](file:///home/vkpatel/aca/alfresco-content-app/app/src/app/app.config.ts#L72-L105) - Sets up global injection tokens using `ApplicationConfig` alongside modern helpers like `provideRouter`, `provideAnimations`, `provideNoopAnimations`, and `importProvidersFrom`.
*   **Extension Providers**: [extensions.module.ts](file:///home/vkpatel/aca/alfresco-content-app/app/src/app/extensions.module.ts#L32-L39) - Houses `provideApplicationExtensions()` which aggregates environmental providers into an array.

### 3. Advanced Dependency Injection (DI) & `inject()` Function
The codebase heavily leverages Angular's `inject()` API for dependency injection directly in properties, reducing boilerplate constructor code:
*   **Inject in Class Properties**: In [app.service.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/src/lib/services/app.service.ts#L61-L80), services such as `Store`, `Router`, and custom API clients are injected via `inject(...)`.
*   **Optional Dependencies**: In [document-base-page.component.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/src/lib/components/document-base-page/document-base-page.component.ts#L94), the `autoDownloadService` is injected optionally using the `{ optional: true }` configuration parameter.
*   **Token Overriding**: In [ContentServiceExtensionModule](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/aca-content.module.ts#L78-L79), standard classes are swapped dynamically in providers (`{ provide: ContentVersionService, useClass: ContentUrlService }`).

### 4. Global State Management with NgRx
ACA utilizes **NgRx** to coordinate state, routing changes, and API effects globally:
*   **App State Definition**: [app.state.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/store/src/states/app.state.ts#L58-L74) - Structures states like `selection`, `user`, and `navigation` into interfaces.
*   **Dispatching Actions**: Actions are dispatched inside services and components (e.g. in [app.service.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/src/lib/services/app.service.ts#L156-L162)).
*   **Reading State (Selectors)**: Component templates and lifecycles bind to state changes using Selectors (e.g. `isInfoDrawerOpened` and `getAppSelection` in [document-base-page.component.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/src/lib/components/document-base-page/document-base-page.component.ts#L115-L123)).

### 5. RxJS Stream Management & Auto-Unsubscribe
To prevent memory leaks without storing arrays of subscriptions, the project utilizes the `takeUntilDestroyed` operator coupled with `DestroyRef`:
*   **Component Subscription Lifecycles**: [SidenavComponent](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/sidenav/sidenav.component.ts#L62-L80) injects `DestroyRef` and applies `takeUntilDestroyed(this.destroyRef)` on observables.
*   **Directive Stream Processing**: [ContextActionsDirective](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/src/lib/directives/contextmenu/contextmenu.directive.ts#L64-L73) applies `debounceTime(300)` and `takeUntilDestroyed(this.destroyRef)` inside `ngOnInit`.

### 6. Component Inheritance & Abstract Directives
Base page behavior (like selection counting, toolbar configurations, and loading states) is consolidated into an abstract base component using the `@Directive()` decorator (required by Ivy for abstract classes using lifecycle hooks or DI):
*   **Base Class**: [PageComponent](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/src/lib/components/document-base-page/document-base-page.component.ts#L58-L262) - Extends standard lifecycle hooks (`ngOnInit`, `ngOnChanges`, `ngOnDestroy`) and defines base injectors.
*   **Inherited Component**: [SearchResultsComponent](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/search/search-results/search-results.component.ts#L134) - Inherits properties, injects local providers, and overrides specific behaviors like double-click navigations.

### 7. Custom Directives & Host Binding
Directives are used to attach dynamic behavior to DOM elements:
*   **Event Interception (`@HostListener`)**: [ContextActionsDirective](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/src/lib/directives/contextmenu/contextmenu.directive.ts#L33-L60) listens to standard `'contextmenu'` events, intercepts default behavior via `event.preventDefault()`, and triggers NgRx actions.

### 8. Reactive Forms & Custom Async Validators
User input and dialogue prompts are captured via Angular Reactive Forms:
*   **Reactive Form Group**: [SaveSearchDialogComponent](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/search/search-save/dialog/save-search-dialog.component.ts#L74-L86) creates control groups with required synchronous checks.
*   **Async Validation**: [UniqueSearchNameValidator](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/search/search-save/dialog/unique-search-name-validator.ts#L30-L44) implements `AsyncValidator`, calling backend storage, checking duplicates asynchronously, and mapping outcomes to `ValidationErrors`.

### 9. Custom & Async Pipes
Data is formatted and filtered reactive-style inside templates using pipes:
*   **Custom Pipe**: [IsFeatureSupportedInCurrentAcsPipe](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/pipes/is-feature-supported.pipe.ts#L31-L44) implements `PipeTransform` and transforms a feature string ID into an `Observable<boolean>` by querying the store. This pipe is resolved inside templates using the async pipe (e.g. `(evaluatorId | isFeatureSupportedInCurrentAcs | async)`).

### 10. Extensibility & Dynamic Component Loading
The Alfresco Content Services core features are highly customizable via an extensibility framework (`@alfresco/adf-extensions`):
*   **Dynamic Components**: Sidenav components evaluate links dynamically and render child elements using `<adf-dynamic-component>` configurations loaded from local manifest files (see [sidenav.component.html](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/sidenav/sidenav.component.html#L14-L16)).
*   **Extension Module Rules**: [ContentServiceExtensionModule](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/aca-content.module.ts#L89-L174) configures and registers dynamic component mappings, routing guards, and client-side rule evaluators (e.g. `canDeleteSelection`, `isLibraryManager`).

### 11. Responsive Layouts via CDK BreakpointObserver
To ensure proper viewing layouts across mobile, tablet, and desktop devices:
*   **Observer Integration**: [PageComponent](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/src/lib/components/document-base-page/document-base-page.component.ts#L153-L158) queries media queries using `@angular/cdk/layout`'s `BreakpointObserver` and dynamically adjusts layout values.

---

## 4. Testing Conventions & Configurations

### Karma & Jasmine Unit Tests
The workspace features modular unit specs for components, directives, and services using Angular's testing utilities:
*   **Service Testing**: [aca-mobile-app-switcher.service.spec.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-shared/src/lib/services/aca-mobile-app-switcher.service.spec.ts#L41-L52) configures `TestBed.configureTestingModule` with testing modules, mocks the store state using `provideMockStore`, and instantiates the service under test.
*   **Component Testing**: [sidenav.component.spec.ts](file:///home/vkpatel/aca/alfresco-content-app/projects/aca-content/src/lib/components/sidenav/sidenav.component.spec.ts#L63-L88) showcases component fixtures, element selection testing, and standard Jasmine spy objects (`jasmine.createSpyObj`) to isolate services.
