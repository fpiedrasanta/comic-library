# Components — Index

Public Web and Admin Dashboard are independent frontend applications with separate codebases. Shared components are listed in both files where they apply.

## File index

| File | Contents |
| --- | --- |
| `components/public-web-components.md` | Public Web components (user-facing catalog, reading, library, profile) |
| `components/dashboard-components.md` | Admin Dashboard components (catalog management, users, media, AI) |

## Shared components (appear in both applications)

| Component | Location | Used in |
|-----------|----------|---------|
| `Button` | `components/ui/button.tsx` | Public Web, Admin Dashboard |
| `PasswordInput` | `features/authentication/components/password-input.tsx` | Public Web, Admin Dashboard |
| `OtpInputs` | `features/authentication/components/otp-inputs.tsx` | Public Web, Admin Dashboard |
| `PersonSearchSelect` | `features/people/components/person-search-select.tsx` | Public Web (Number form), Admin Dashboard (WorkForm) |
| `RoleSearchSelect` | `features/numbers/components/role-search-select.tsx` | Public Web (Number form), Admin Dashboard (WorkForm) |
| `LanguageSearchSelect` | `features/numbers/components/language-search-select.tsx` | Public Web (Number form), Admin Dashboard (WorkForm) |
| `NumberSearchSelect` | `features/numbers/components/number-search-select.tsx` | Public Web (Number form), Admin Dashboard (NumberForm legacy) |
| `TagInput` | `features/numbers/components/tag-input.tsx` | Public Web (Number form), Admin Dashboard (WorkForm) |
| `ProtectedImage` | `components/protected-image.tsx` | Public Web, Admin Dashboard |
| `entityColor` | `features/catalog/utils/entity-color.ts` | Public Web — color helpers shared by every entity pill and by the contextual catalog headers |

## Public Web catalog components (TASK-PUBLIC-WEB-0069, updated TASK-PUBLIC-WEB-0083, TASK-PUBLIC-WEB-0080)

The three explore listings (`/publishers`, `/franchises`, `/series`) are one
component configured three ways, not three implementations. The entities differ
only in which parent pills a card carries, and that travels in the data.

| Component | Location | Role |
|-----------|----------|------|
| `EntityListingPage` | `features/catalog/components/entity-listing-page.tsx` | The whole listing: heading, search, count, grid, infinite scroll, loading/empty/error states. One component behind the three routes. |
| `EntityCard` | `features/catalog/components/entity-card.tsx` | One entity: square image area with its parents overlaid as pills, name below. A publisher arrives with no pills. |
| `EntityPillLink` | `features/catalog/components/entity-pill-link.tsx` | A parent as a colored pill that navigates to that entity's detail page. Used by the explore cards. Distinct from the header pills, which live inline in `EntityHeader`. |
| `EntityLogoFallback` | `features/catalog/components/entity-logo-fallback.tsx` | Missing-image placeholder: the entity initial on a tinted square. Shared by `EntityHeader` and `EntityCard` so both look the same. |
| `EntityCardSkeleton` / `EntityCardSkeletonGrid` | `features/catalog/components/entity-card-skeleton.tsx` | First-paint placeholders mirroring the real card structure. |
| `EntityListingState` | `features/catalog/components/entity-listing-state.tsx` | Empty and error states, same layout with two tones. |
| `WorkCard` | `features/catalog/components/work-card.tsx` | One Work: cover, hierarchy pills, work type pill, number, title, publication/upload dates. When `myReadingProgress` (`GET /api/works`) exists it also renders a reading scale over the cover via `ReadingProgressOverlay`: a badge with the percentage (or **✓ LEÍDO** when `Completed`, decided by the backend status) and a bottom bar whose width is the persisted percentage and whose color travels amber→orange while reading and emerald when completed. Without progress the card is unchanged and reserves no space. |
| `ReadingProgressOverlay` | `features/catalog/components/reading-progress-overlay.tsx` | Shared cover overlay that renders the reading-scale badge (`{percentage}%`, or **✓ LEÍDO** when completed) and the bottom progress bar. Takes a `ReadingProgressAppearance` (color, glow, clamped percentage) and an `isCompleted` flag from the caller, so `WorkCard` and `ListCard` render the same visual without duplicating the markup. |
| `readingProgressAppearance` | `features/catalog/utils/reading-progress-color.ts` | Color, glow and clamped percentage of the reading scale. The color is interpolated from the persisted percentage while reading, so no progress threshold is invented; the glow is derived from the same color instead of fixed Tailwind shadows. Reads the backend `status` to decide emerald (Completed) vs amber→orange (Reading). |
| `listReadingProgressAppearance` | `features/catalog/utils/reading-progress-color.ts` | Same color/glow/percentage model as `readingProgressAppearance` but for the list cards, which only expose a `readingProgressPercentage` (no `status`): emerald at `100%` (list fully read) and amber→orange between `1` and `99`. Reuses the shared colors so `WorkCard` and `ListCard` read identically. |
| `PublishersPage` / `FranchisesPage` / `SeriesPage` | `features/catalog/pages/{publishers,franchises,series}-page.tsx` | Per-entity configuration: endpoint, copy and card mapper. |
| `CatalogMenu` / `MobileNav` | `components/dashboard/catalog-menu.tsx` | The catalog dropdown of the desktop header and the mobile hamburger, sharing one item list. |
| `useEntityCards` | `features/catalog/hooks/use-entity-cards.ts` | `useInfiniteQuery` wrapper for the three `/api/catalog/*` listings, plus `flattenEntityCards` which accumulates pages and deduplicates by id. |
| `useListingSearch` | `features/catalog/hooks/use-listing-search.ts` | The listing search term, kept in the URL as `?search=` with `replace` so links are shareable without filling the history. |
| `WorksPage` | `features/catalog/components/works-page.tsx` | The shared works listing used by `/catalog` and by the Publisher/Franchise/Series contexts: URL state for search and the four filters, hierarchy autocompletes, sort controls, contextual header, and the results. It owns only the catalog concerns; paging lives in `useWorksPagination`. |
| `WorksResults` | `features/catalog/components/works-results.tsx` | Result count, `ResultsGrid` and infinite-scroll sentinel of a works listing. Shared by `WorksPage` and Mi colección so both report and paginate alike. |
| `useWorksPagination` | `features/catalog/hooks/use-works-pagination.ts` | First page plus infinite scroll of any works listing: accumulate, deduplicate by id, preload the next page and observe the sentinel. The catalog and the reading history are the same paginated shape, so the behavior is written once and each screen only supplies its `fetchPage`. |
| `MyCollectionPage` | `features/catalog/pages/my-collection-page.tsx` | Mi colección (`/my-collection`): the reading history of the authenticated user, on the catalog layout with the same `WorkCard` grid and progress bar. Only adds the `Leyendo` / `Leídas` state filter; no search, sort or hierarchy filters, because the backend orders by last activity. |
| `ReadingStateFilter` | `features/catalog/components/reading-state-filter.tsx` | The `Leyendo` / `Leídas` switch of Mi colección. The selected value is the history state sent to the backend, so what is shown and what is queried are the same value. |
| `useReadingHistory` | `features/catalog/hooks/use-reading-history.ts` | `useWorksPagination` over `GET /api/users/me/reading-history` with the selected state. `staleTime: 0` because the history mirrors live reading state. |
| `getReadingHistory` | `features/catalog/api/reading-history-repository.ts` | `GET /api/users/me/reading-history` (currentPage, pageSize, state). |
| `ContinueReadingSection` | `components/dashboard/continue-reading-section.tsx` | Continue reading section of the index: heading, `Ver historial` link to Mi colección, and the grid of works being read, most recent activity first. Loading and error are shown in place; with no works in reading it renders nothing, so it reserves no space on the index. |
| `ContinueReadingCard` | `components/dashboard/continue-reading-card.tsx` | One work in progress: cover on the left, publisher, title, progress bar, percentage and current/total page on the right. Different composition from `WorkCard` by design. Cover via `ProtectedImage`, progress from the API with the shared reading scale, and the whole card resumes reading at `/works/{id}/read`. |
| `useContinueReading` | `features/catalog/hooks/use-continue-reading.ts` | Reading history limited to `Reading` and capped to 12 for the index section. |
| `CatalogSection` | `components/dashboard/catalog-section.tsx` | Recommended works section of the index: heading, ordering selector, cover grid, and the loading/error states. With no eligible works it renders nothing, so it reserves no space. |
| `RecommendedWorkCard` | `features/catalog/components/recommended-work-card.tsx` | One recommended work: 2:3 cover with `object-cover` and a `★ X.X` badge when the work has ratings, plus publisher, title and the available editorial data (number and publication year) below it. Different composition from `WorkCard` on purpose: pure discovery, so no hierarchy pills, no work type and no reading scale. The average comes from `averageRating` in the listing contract; no score is ever invented. |
| `RecommendedSortControls` | `features/catalog/components/recommended-sort-controls.tsx` | The `Más populares` / `Agregados recientemente` / `Más votados` selector. Each option is the `sortBy` the backend expects, so what is selected is exactly what is queried. |
| `useRecommendedWorks` | `features/catalog/hooks/use-recommended-works.ts` | `useQuery` over `GET /api/works/recommended` with the selected criterion in the query key. `staleTime: 0` because the set changes as soon as the user starts reading a work. |
| `getRecommendedWorks` | `features/catalog/api/recommended-works-repository.ts` | `GET /api/works/recommended` (`sortBy`). |

## Public Web lists components (TASK-PUBLIC-WEB-0070, updated TASK-PUBLIC-WEB-0088, TASK-PUBLIC-WEB-0089)

`/lists` and `/lists/:id` reuse the catalog pieces that apply
(autocomplete, search, states) and add the list-specific ones. The
`WorkCard` grid of the detail was replaced by rows: a list row is a
reading position, not a catalog card.

| Component | Location | Role |
|-----------|----------|------|
| `ListsPage` | `features/catalog/pages/lists-page.tsx` | The `/lists` exploration: heading, search, the four filters, count, card grid, infinite scroll and the loading/empty/error states. |
| `ListDetailPage` / `ListRoutePage` | `features/catalog/pages/{list-detail,list-route}-page.tsx` | The `/lists/:id` detail: `ListHeader` plus the works of the list as rows, in the order the backend delivers (`WorkListItem.Position`). No work filter, search, sorting or reordering. The route page resolves the `:id`. |
| `ListWorkRow` | `features/catalog/components/list-work-row.tsx` | One work of a list as a row: order number, cover thumbnail, title, publisher and number, its reading progress (bar and percentage, only when the API returns one) and the reading action of that work. The row does not navigate and cannot be reordered. |
| `ListCard` | `features/catalog/components/list-card.tsx` | One list: vertical cover (`aspect-[2/3]`, `object-cover`, no padding) with the list color as top accent, type pill, name, work count and rating. When the API returns a `readingProgressPercentage` it renders the shared `ReadingProgressOverlay` over the cover bottom (badge with the percentage, or **✓ LEÍDO** at `100%`, amber→orange otherwise; `null` reserves no space). The whole card links to the detail. |
| `ListHeader` | `features/catalog/components/list-header.tsx` | The detail header: vertical cover, type pill, name, description, work count, accent bar and glow in the list color. It renders the list-level reading progress (only when the API returns a percentage) and the reading-action button, which resumes the list at `/lists/{id}/work/{currentWorkId}` and is disabled when `currentWorkId` is `null`. It also shows the rating (only when the average is a valid score). Loading, not-found and error shells. |
| `ListWorkRow` | `features/catalog/components/list-work-row.tsx` | One work of a list, as a row: order number, cover, title, publisher and number. Shows the individual reading progress (bar + percentage, amber at `0`–`99`, emerald at `100%`) and a reading-action link to `/lists/{listId}/work/{workId}`. The row itself does not navigate or reorder: the order belongs to the list. |
| `listMetrics` | `features/catalog/utils/list-metrics.ts` | `hasVisibleRating` (average inside the valid star range) and `hasVisibleProgress` (`null` progress is not `0`), so the list card, the header and the rows all tell the two cases apart the same way. |
| `ListCardSkeleton` / `ListCardSkeletonGrid` | `features/catalog/components/list-card-skeleton.tsx` | First-paint placeholders mirroring the real card structure. |
| `useCatalogLists` | `features/catalog/hooks/use-catalog-lists.ts` | `useInfiniteQuery` for `GET /api/catalog/lists`; every filter is part of the query key, so a filter change restarts at page 1. |
| `useCatalogListDetail` | `features/catalog/hooks/use-list-detail.ts` | `useEntityDetail` for `GET /api/catalog/lists/{id}`; a 404 is reported apart from a real error. |
| `useListingFilters` | `features/catalog/hooks/use-listing-filters.ts` | Search plus the four filters in the URL (`search`, `idPublisher`, `idFranchise`, `idSerie`, `listTypeId`), with `replace`. |
| `useEntityFilterOptions` | `features/catalog/hooks/use-entity-filter-options.ts` | The Editorial → Franquicia → Serie autocomplete queries shared by `WorksPage` and `ListsPage`, extracted so the cascade is written once. |
| `getCatalogLists` / `getCatalogListDetail` / `getListTypes` | `features/catalog/api/lists-repository.ts` | The two list endpoints plus the public list-types endpoint for the autocomplete. |

## Public Web work detail components (TASK-PUBLIC-WEB-0071)

`/works/:id` reuses catalog pieces (cover, context cards, navigation,
assignments, tags, states) and adds the work-specific ones.

| Component | Location | Role |
|-----------|----------|------|
| `WorkDetailPage` / `WorkRoutePage` | `features/catalog/pages/{work-detail,work-route}-page.tsx` | The `/works/:id` detail: `WorkHeader` plus editorial context, sequence navigation, person assignments, and tags. The route page resolves the `:id`. |
| `WorkHeader` | `features/catalog/components/work-header.tsx` | The header: cover (`object-cover`, no padding), title, optional number, description, language/workType/publicationDate pills, and the reading progress block under the cover. Loading, not-found, error shells. |

| `WorkReadingProgress` | `features/catalog/components/work-reading-progress.tsx` | Reading progress of the authenticated user under the cover: without progress (**`myReadingProgress` null**) shows only the **Leer** action; with progress shows the progress card (percentage, bar, current page / total) plus **Continuar** (`Reading`) or **Recomenzar** (`Completed`). All actions navigate to `/works/{id}/read`; it never resets or persists progress. |
| `WorkContext` | `features/catalog/components/work-context.tsx` | One editorial context (Publisher/Franchise/Series): cover card with name and colored label pill, navigable to the entity page. |
| `WorkNavigation` | `features/catalog/components/work-navigation.tsx` | Previous/Next work cards: cover, optional number, title, directional label, linking to `/works/:id`. |
| `PersonAssignments` | `features/catalog/components/person-assignments.tsx` | List of person-role assignments; same person can appear multiple times with different roles. |
| `Tags` | `features/catalog/components/tags.tsx` | Tags as styled pills. |
| `StarRatingDisplay` | `features/catalog/components/star-rating-display.tsx` | Display-only star rating for average rating (full/half/empty stars). |
| `StarRatingInput` | `features/catalog/components/star-rating-input.tsx` | Interactive star rating input (0-5 stars, keyboard accessible). |
| `RatingList` | `features/catalog/components/rating-list.tsx` | Paginated list of user ratings with sorting, avatar, stars, review, load more. |
| `useWorkDetail` | `features/catalog/hooks/use-work-detail.ts` | `useEntityDetail` for `GET /api/works/{id}`; a 404 is reported apart from a real error. |
| `getWorkDetail` / `getCatalogWorks` | `features/catalog/api/works-repository.ts` / `features/catalog/api/works-catalog-repository.ts` | The detail endpoint and the catalog listing endpoint. |
| `useMyRating` / `useVoteWork` / `useUpdateWorkRating` / `useWorkRatings` | `features/catalog/hooks/use-ratings.ts` | TanStack Query hooks for user's own rating and paginated ratings list. |
| `getMyRating` / `voteWork` / `updateWorkRating` / `getWorkRatings` | `features/catalog/api/ratings-repository.ts` | API calls for ratings (GET my rating, POST/PUT vote, GET paginated list). |

## Public Web reader components (TASK-PUBLIC-WEB-0070, updated TASK-PUBLIC-WEB-0073, TASK-PUBLIC-WEB-0077, TASK-PUBLIC-WEB-0078, TASK-PUBLIC-WEB-0084)

`/works/:id/read` is a self-contained reader feature.

| Component | Location | Role |
|-----------|----------|------|
| `ReaderPageRoute` | `features/reader/components/reader-page.tsx` | Resolves `:id` from the route and renders `Reader`. |
| `Reader` | `features/reader/components/reader.tsx` | Main reader: fetches pages, manages navigation, zoom, pan, gestures, preloading, and view states. The final synthetic page (position `N + 1`) is the rating position; "Ir al último" lands there. Handles previous/next work navigation. |
| `ReaderHeader` | `features/reader/components/reader-header.tsx` | Top bar: back to detail, zoom controls, fullscreen button, menu button. |
| `ReaderFooter` | `features/reader/components/reader-footer.tsx` | Bottom bar: first/prev/next/last; delegates the middle slot to `ReaderPageIndicator`. Receives `totalPages` and `isLastPosition` (rating position). |
| `ReaderPageIndicator` | `features/reader/components/reader-page-indicator.tsx` | Contextual indicator: shows `Página X de totalPages` where `totalPages = comic pages + 1` (the rating page counts as a page for the user) at every position; shows the previous-work action at the first page (when `PreviousWork` exists) and the next-work action at the rating position (when `NextWork` exists). |
| `ReaderMenu` | `features/reader/components/reader-menu.tsx` | Settings overlay: zoom, fullscreen. |
| `ReaderLoading` / `ReaderError` / `ReaderEnd` | `features/reader/components/reader-states.tsx` | Loading spinner, error with retry, and last-page completion states. |
| `RatingForm` | `features/reader/components/rating-form.tsx` | Form shown at final position (TotalPages + 1) for creating/editing user's rating. Submitting requires selecting 1–5 stars; the review is optional. Stars render at 48px, centered. On save it stays on the rating page and shows the saved vote instead of navigating away. The Reader does not show created/updated dates (the pages endpoint only returns stars/review). |
| `ListReaderPageRoute` | `features/reader/components/list-reader-page.tsx` | Route page for `/lists/:listId/work/:workId`; resolves params and renders `ListReader`. |
| `ListReader` | `features/reader/components/list-reader.tsx` | Contextual reader: reuses `Reader` logic but loads the list reader context (`GET /api/reading/lists/{listId}/work/{workId}`), navigates between works by `WorkListItem.Position`, persists the current work (`PUT /api/reading/lists/{listId}/current-work`), and back to `/lists/{listId}`. The work rating form and the list rating form (on the last work) are rendered at the final position. |
| `ListRatingForm` | `features/reader/components/list-rating-form.tsx` | Form shown at the final position of the **last** work of a list: rates the list (1–5 stars, optional review) reusing `StarRatingInput`. Message: "Valora esta lista, que fue hecha con mucho amor para vos." (creator name is not exposed by the API, so it is not shown). |
| `ReaderWorkListItem` | `features/reader/components/reader-work-list-item.tsx` | A row of the work selector inside `ReaderMenu`: shows title, progress ring color (amber→orange by percentage, green at 100%, red/no-progress otherwise) and a "Current" badge on the active work. |
| `ReaderHeader` | `features/reader/components/reader-header.tsx` | Top bar: back button (navigates to `returnPath`, defaulting to `/works/{workId}`), zoom controls, fullscreen button, menu button. |
| `ReaderMenu` | `features/reader/components/reader-menu.tsx` | Settings overlay: zoom, fullscreen. When `listContext` is provided, also renders the contextual work selector (list context only). |
| `useWorkPages` | `features/reader/hooks/use-work-pages.ts` | TanStack Query loader for `GET /api/works/{id}/pages`. |
| `useReaderStore` | `features/reader/stores/reader-store.ts` | Zustand store for menu UI state. |
| `getWorkPages` | `features/reader/api/reader-repository.ts` | `GET /api/works/{id}/pages`. |