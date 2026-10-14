# Frontend Coding Rules

Mandatory coding rules for Public Web and Dashboard. Same general conventions; architectural differences are in their respective architecture docs.

## Language

All code in English. User-facing text is exempt.

## Naming

- Meaningful names. No abbreviations, single letters, numbered variables, generic names.
- camelCase: variables, functions, constants.
- PascalCase: types, interfaces, components.
- No magic numbers or strings. Use named constants, enums, or backend-provided values.

## Components

- Single responsibility. No data fetching, complex transformations, business rules, or multiple conceptual screens in one component.
- Small: no rigid line limit, but split when multiple responsibilities, effects, or handlers accumulate.

## Functions

- Single responsibility. Explicit names. One level of abstraction. No hidden behavior.

## State management

- Server state (comics, series, users, lists, stats, progress, ratings, reviews): TanStack Query.
- UI/client state (sidebar, reader settings, preferences, modals): Zustand or React state.
- Local state (component-specific): React state. Not everything needs Zustand.
- No copying server state to client state unnecessarily.

## Data access

- No direct fetch/axios from components. Centralized API Client.
- Repository per feature: Component -> Hook/Feature -> Repository -> API Client -> Backend.
- Components and hooks must not know endpoints, HTTP params, or response structures.

## API Client

- Centralized. Injects `Authorization: Bearer` when needed. Uses env var for base URL.
- Parses JSON. Checks `success`. Returns `payload`.
- Throws/propagates errors with `message` and `code`.
- Frontend must not interpret HTTP codes manually per component.

## Hooks

- Clear responsibility. No `useComicEverything()`.
- Custom hooks for reusable state/behavior/API integration/complex UI.
- No `useEffect` as general mechanism. Prefer render, event handlers, state, TanStack Query, memoization.
- No derived state in `useState`. Calculate during render.

## Props

- Only needed props. Avoid giant objects when component needs few values. Accept full object when component conceptually uses whole entity.

## Immutability

- No mutation of React/Zustand/TanStack Query state.
- Declarative array operations (`map`, `filter`, `find`, `some`, `every`, `reduce` when clear).

## TypeScript

- Strict mode. No `any` except justified.
- No casts to hide type problems. Explicit types.

## UI/UX

- Presentational components receive data via props.
- Reusable components free of domain knowledge (Button, Dialog, Pagination, Input, LoadingState, EmptyState, ErrorState).
- Use UI library components when available.
- Accessibility: keyboard navigation, focus, labels, semantic HTML, ARIA. No div-as-button.

## Forms

- React Hook Form + Zod for complex forms.
- Frontend validation improves UX. Backend is authority.

## States

- Loading, Success, Error, Empty, Validation, Unauthorized, Forbidden, Not Found, Conflict, Retry.
- Empty is not an error. Error is not empty.

## Lists

- Stable keys. No array index for lists whose order may change.

## JSX

- Presentation-focused. No complex logic, HTTP requests, localStorage, URL manipulation, business rules.

## Dates

- Backend UTC. Frontend converts to user timezone for display.
- Send dates to backend in UTC.

## Query keys

- Consistent TanStack Query keys representing the resource.

## Cache

- No manual cache when TanStack Query solves it.

## Storage

- `localStorage`/`sessionStorage` only for appropriate local info.
- Never store passwords, refresh tokens (unless architecture allows), secrets.
- All frontend env vars are public. No secrets in `.env`.

## Images

- Protected backend images: API Client with auth -> Blob -> Object URL -> `<img src>`. Revoke Object URL when unused.
- External HTTP/HTTPS URLs and data URLs shown directly.
- Fallback visual when image unavailable. No request for null/undefined.
- Lazy loading, known dimensions, optimized formats, responsive, placeholders.
- Comic reader: avoid downloading unnecessary pages.

## Performance

- Optimization guided by real problems. No premature `useMemo`/`useCallback`/memoization/lazy/virtualization.

## Code splitting

- Lazy load large features: Reader, Dashboard sections, Admin tools, AI tools.

## Testing

- Testable code. Vitest, React Testing Library, Playwright.
- Focus on observable behavior. No implementation detail tests.

## Dead code

- No dead code. Remove unused components, hooks, functions, types, imports, commented code. Git history recovers old code.

## Duplication

- No unnecessary duplication. No premature abstractions.

## Dependencies

- No new library when existing tools solve it. No duplicate responsibilities.

## Imports/Exports

- Clean imports. Explicit exports. Barrel files only when they help. No circular dependencies.

## Feature architecture

- Organize by feature folders. Within features: `components/`, `hooks/`, `api/`, `types/`, `utils/`.
- Public Web and Dashboard are independent. No imports between them. Shared code via explicit shared library.

## Comments

- Clear code. Comments for non-obvious decisions, external constraints, workarounds, architectural reasons.

## Agent rules

- Read rules, architecture, tech stack. Respect conventions. No new dependencies. No duplication. No unnecessary code movement. Run tests. Fix own errors. Minimal changes. No API contract changes.

## API Response format

- Simple: `ApiResponse<T>` with `payload`.
- Paginated: `ListResponse<T>` with `items`, `currentPage`, `totalPages`, `pageSize`, `totalCount`, etc.
- Frontend consumes `payload` (or `payload.items` for lists).

## Protected images

- Request via API Client with auth. Get Blob. Convert to Object URL. Assign to `<img>`. Revoke Object URL when unused.
- External URLs and data URLs shown directly.
- Fallback visual when unavailable. No request for null/undefined.

## Code quality

Clarity, consistency, single responsibility, explicit naming, strong typing, predictable behavior, separation of concerns, minimal coupling, high cohesion, no hidden behavior, no unnecessary abstractions, no business logic in UI.
