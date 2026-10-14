# Pages

## Public Web

### Route groups and layouts

| Group | Routes | Layout |
|-------|--------|--------|
| Public | `/`, `/login`, `/register`, `/verify-email`, `/forgot-password`, `/verify-recovery-code`, `/reset-password` | Own full-screen layout per page (`AuthSplitLayout` / `AuthCenteredCard`). No global header, no dashboard navigation, no footer. |
| Protected | `/index`, `/profile`, `/settings`, `/catalog`, `/publishers`, `/publishers/:id`, `/franchises`, `/franchises/:id`, `/series`, `/series/:id`, `/lists`, `/lists/:id`, `/my-collection`, `/works/:id` | `AppLayout` only: one sticky `DashboardHeader`, page content through `Outlet`, `DashboardFooter`. Pages must not render their own header/footer. |

`publicRoutes` and `protectedRoutes` are exported separately from `app/router/routes.tsx`.

### Navegación del header

El header expone `Inicio` y un dropdown `Catálogo`. El dropdown contiene `Explorar
catálogo`, `Editoriales`, `Franquicias`, `Series`, `Listas` y, tras un separador,
`Mi colección` (que ya tiene ruta propia y navega a `/my-collection`) más dos
secciones sin ruta todavía (`Favoritos`, `Mis listas`), que se renderizan
deshabilitadas y no navegan.

Por debajo de `lg` la navegación se esconde y queda el botón hamburguesa
(`MobileNav`), que abre el mismo menú. Antes de TASK-PUBLIC-WEB-0069 el header
tenía `Mi Colección` y `Wishlist` como botones de primer nivel apuntando a rutas
inexistentes; se movieron al dropdown como secciones deshabilitadas.
TASK-PUBLIC-WEB-0080 le dio ruta a `Mi colección`. El enlace `Ver historial` de
`Continuar leyendo` (Index) navega a esa misma pantalla, que es la única
implementación.

### Pages

Los filtros de jerarquía viajan en la URL como `idPublisher`, `idFranchise` e `idSerie`. Los params que se envían al backend son `publisherId`, `franchiseId` y `seriesId`.

Las pills de Editorial, Franquicia y Serie de cada `WorkCard` no navegan: escriben la cadena completa en la URL de la página actual. En las páginas de contexto la ruta manda en los niveles que fija y las pills sólo refinan los niveles inferiores.

En los listados de exploración (`/publishers`, `/franchises`, `/series`) la card y
sus pills sí navegan: la card a su propio detalle, la pill al detalle de la
entidad que nombra. La búsqueda de esos listados vive en la URL como `?search=`.

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Root redirect. Authenticated -> `/index`; unauthenticated -> `/login`. Shows loading while restoring session. |
| Login | `/login` | User login |
| Register | `/register` | New user registration |
| Verify Email | `/verify-email` | Email validation with 6-digit code. Receives email and expiresInMinutes via router state |
| Forgot Password | `/forgot-password` | Password recovery request. Receives email via router state (optional) |
| Verify Recovery Code | `/verify-recovery-code` | Recovery code verification. Receives email and expiresInMinutes via router state |
| Reset Password | `/reset-password` | New password setup. Receives email and authorizationToken via router state |
| Index | `/index` | Authenticated home. Protected by `ProtectedRoute`. Greeting, continue reading, recommendations, user menu. The **Continuar leyendo** section lists the works the user is reading (history with `Reading`, max 12, most recent activity first): cover on the left and publisher/title/progress/current page on the right, each card resuming at `/works/{id}/read`. It disappears completely when there is nothing in reading, and shows loading and error states in place. The **Recomendados del catálogo** section lists up to 12 works the user has not started (`GET /api/works/recommended`) in a 2:3 cover grid of `RecommendedWorkCard`s, with an ordering selector (`Más populares` by default, `Agregados recientamente`, `Más votados`) that re-queries on change. The cards show publisher, title, the available editorial data and a `★ X.X` badge with the real average when the work has ratings. It also disappears completely when there are no eligible works. |
| Profile | `/profile` | Authenticated user profile edit. Protected by `ProtectedRoute`. Name, surname, nationality, avatar |
| Settings | `/settings` | Account settings. Protected by `ProtectedRoute`. Password change and account deletion with OTP confirmation |
| Catalog | `/catalog` | Authenticated catalog exploration. Protected by `ProtectedRoute`. Shared `WorksPage` with search, Publisher/Franchise/Series/WorkType filters, cascade autocomplete, sorting, infinite scroll, URL state. No contextual header. Cards show a reading progress bar over the cover when the work has progress for the authenticated user (`myReadingProgress` from `GET /api/works`). |
| Publishers | `/publishers` | Authenticated publisher listing. Protected by `ProtectedRoute`. Shared `EntityListingPage` over `GET /api/catalog/publishers` with search (`?search=`), infinite scroll, and cards with no pills (a publisher has no level above it). |
| Franchises | `/franchises` | Authenticated franchise listing. Protected by `ProtectedRoute`. Same `EntityListingPage` over `GET /api/catalog/franchises`, same component with one pill less: the publisher. Search matches franchise name or publisher name. |
| Series | `/series` | Authenticated series listing. Protected by `ProtectedRoute`. Same `EntityListingPage` over `GET /api/catalog/series`, the complete case: publisher and franchise pills. Search matches series, franchise or publisher name. |
| Publisher | `/publishers/:id` | Authenticated publisher context. Protected by `ProtectedRoute`. Shared `WorksPage` with a `PublisherHeader` built from `GET /api/publishers/{id}` (logo, country, founded year, website, description, collapsible history; optional fields are omitted when null), Publisher filter hidden/preselected, search, remaining filters, sorting, infinite scroll. The WorkCards hide the Publisher pill because the page already is that publisher. |
| Franchise | `/franchises/:id` | Authenticated franchise context. Protected by `ProtectedRoute`. Shared `WorksPage` with a `FranchiseHeader` built from `GET /api/franchises/{id}` (logo, description, and a clickable `Editorial` pill from the publisher the same payload carries; omitted when null), Publisher and Franchise filters hidden/preselected, search, remaining filters, sorting, infinite scroll. The WorkCards hide the Publisher and Franchise pills because the page already is that franchise. |
| Series | `/series/:id` | Authenticated series context. Protected by `ProtectedRoute`. Shared `WorksPage` with contextual header, Publisher/Franchise/Series filters hidden/preselected, search, WorkType filter, sorting, infinite scroll. |
| Lists | `/lists` | Authenticated listing of the official reading lists. Protected by `ProtectedRoute`. Search over name and description (`?search=`), filters Editorial/Franquicia/Serie (same cascade as `/catalog`, same URL param names) and Tipo de Lista, infinite scroll of vertical-cover cards (type pill, name, work count), all in the URL. The list-type autocomplete consumes the public `GET /api/list-types` endpoint, so all active types are available regardless of which lists are loaded. |
| List | `/lists/:id` | Authenticated list detail. Protected by `ProtectedRoute`. `ListHeader` (vertical cover, type pill, name, description, work count, accent color) built from `GET /api/catalog/lists/{id}`, then its works with the existing `WorkCard` in list order. No work search, filter or sorting: the list already fixed the set and the order. The work-card pills navigate to the entity pages. The cards of a list carry no reading progress (the list endpoint does not expose it), so they render without the bar. |
| Mi colección | `/my-collection` | Authenticated reading history of the user. Protected by `ProtectedRoute`. Reuses the catalog layout, `WorkCard` grid, progress bar, loading/empty/error states and infinite scroll over `GET /api/users/me/reading-history`. A single state filter switches `Leyendo` / `Leídas`; changing it re-queries and restarts pagination at page 1. No search, sort or hierarchy filters: the backend orders by most recent activity and only returns works with progress for the authenticated user. Accessed from the catalog menu (`Mi colección`) and from the `Ver historial` link of `Continuar leyendo` on the Index; both use this single route and implementation. |
| Work | `/works/:id` | Authenticated work detail. Protected by `ProtectedRoute`. `WorkHeader` (cover, title, number, description, **average rating with stars and vote count**, metadata) from `GET /api/works/{id}`, editorial context cards (Publisher/Franchise/Series with covers and colors, navigable), sequence navigation (Previous/Next works), person-role assignments, tags, **paginated ratings list with sorting (best/worst/newest/oldest) and load more**. All data from the single endpoint, no extra queries. **Reading progress of the authenticated user (`myReadingProgress`) under the cover: hidden without progress (action **Leer**), progress card + **Continuar** for `Reading`, progress card at 100% + **Recomenzar** for `Completed`; both navigate to the existing Reader without resetting progress.** |
| Work Reader | `/works/:id/read` | Authenticated work reader. Protected by `ProtectedRoute`. Page-by-page reading with navigation, zoom, immersive mode, fullscreen, sound, keyboard, touch gestures, and preloading. The page counter always uses `totalPages = comic pages + 1`, because the rating page counts as a page for the user; previous/next work navigation replaces the counter at the first page (when `PreviousWork` exists) and at the final position (when `NextWork` exists). **At final position (TotalPages + 1): rating form for creating/editing user's rating (0-5 stars, optional review).** |

## Admin Dashboard

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Dashboard admin login. Email and password only. No registration. No Google. |
| Forgot Password | `/forgot-password` | Dashboard password recovery request |
| Verify Recovery Code | `/verify-recovery-code` | Dashboard 6-digit recovery code verification |
| Reset Password | `/reset-password` | Dashboard new password setup |
| Settings | `/settings` | Account settings. Protected by `ProtectedRoute`. Password change and account deletion with OTP confirmation |
| Users | `/users` | User query page. Protected by `ProtectedRoute`. Filters, search, sort, pagination, detail modal. Read-only. |
| Persons | `/persons` | Person listing page. Protected by `ProtectedRoute`. Search, filter by status, sort by name, pagination, create/edit modals, deactivation and reactivation. Backend integration. |
| Roles | `/roles` | Role listing page. Protected by `ProtectedRoute`. Search by name, filter by status, sort by name A-Z/Z-A, pagination, create/edit modals, deactivation/reactivation with confirmation. Backend integration via `GET/POST/PUT /api/admin-roles` and `/{id}/deactivate`, `/{id}/activate`. |
| Tags | `/tags` | Tag listing page. Protected by `ProtectedRoute`. Search by name, filter by status, sort by name A-Z/Z-A, pagination, create/edit modals, deactivation/reactivation with confirmation. Backend integration via `GET/POST/PUT /api/admin-tags` and `/{id}/deactivate`, `/{id}/activate`. |
| List Types | `/list-types` | List Type listing page. Protected by `ProtectedRoute`. Search by name, filter by status, sort by name A-Z/Z-A, pagination, create/edit modals, deactivation/reactivation with confirmation. Backend integration via `GET/POST/PUT /api/admin-list-types` and `/{id}/deactivate`, `/{id}/activate`. |
| Work Lists | `/work-lists` | Work List listing page. Protected by `ProtectedRoute`. Search by list name/work title/work number, filters (franchise, publisher, list type, status, creation date range), sort by name/creation date with both directions, pagination, navigation to create/edit, deactivation/reactivation with confirmation. System-owned official lists only. Backend integration via `GET /api/admin-work-lists`. |
| Work List Form | `/work-lists/create` and `/work-lists/:id/edit` | Work List creation and editing page. Protected by `ProtectedRoute`. React Hook Form + Zod for validation, list info section (name, description, cover image with preview, color picker, list type select, visibility select), works management section with drag & drop reordering, work search selector for adding works, status toggle for deactivate/reactivate (edit mode), loading/error states, save confirmation. Backend integration via `GET/POST/PUT /api/admin-work-lists`, `DELETE /api/admin-work-lists/{id}`, `POST /api/admin-work-lists/{id}/activate`, `GET /api/admin-works`. |
| Dashboard Layout | `/` | Main admin layout. Protected by `ProtectedRoute` with `Administrator` role. Sidebar, topbar, user footer. |
| Dashboard Home | `/dashboard` | Admin home with metrics and catalog table. Requires `Administrator` role. |
| Bans | `/bans` | Ban listing page. Protected by `ProtectedRoute`. Search, filters, sort, pagination, visual actions. Read-only. |
| Select User for Ban | `/bans/select-user` | User selection for new ban. Protected by `ProtectedRoute`. Cards with selectable/non-selectable state. |
| Ban Form | `/bans/create` | Ban creation page. Protected by `ProtectedRoute`. Selected user display and ban form. |
| Ban Form Edit | `/bans/:id/edit` | Ban edit page. Protected by `ProtectedRoute`. Associated user display and editable form. |
| Administrators | `/admins` | Admin listing page. Protected by `ProtectedRoute`. Search, sort, pagination, account status, deactivation/reactivation. Backend integration. |
| Admin Form | `/admins/create` | Admin creation page. Protected by `ProtectedRoute`. React Hook Form + Zod, searchable country select, avatar upload with preview, password complexity validation, confirmation modal, success toast. Backend integration. |
| Admin Form Edit | `/admins/:id/edit` | Admin edit page. Protected by `ProtectedRoute`. Preloaded form via `GET /api/admin-users/{id}`, searchable country select, avatar handling with preview/replacement/deletion, confirmation modal, success toast. Backend integration. |
| Countries | `/countries` | Country listing page. Protected by `ProtectedRoute`. Search, sort, pagination, creation/editing modals, activation/deactivation. |
| Publishers | `/publishers` | Publisher listing page. Protected by `ProtectedRoute`. TanStack Query, name/country search, featured/alive/active filters, name/country sort, pagination, confirmation modals, deactivation/reactivation, and contextual Works management action. |
| Publisher Form | `/publishers/create` | Publisher creation page. Protected by `ProtectedRoute`. React Hook Form + Zod, dynamic country loading, image preview, hex color selector, switches, confirmation modal, success toast. Backend integration. |
| Publisher Form Edit | `/publishers/:id/edit` | Publisher edit page. Protected by `ProtectedRoute`. Preloaded form, image handling, hex color selector, switches, confirmation modal, success toast. Backend integration. |
| Franchises | `/franchises` | Franchise listing page. Protected by `ProtectedRoute`. Search, filters, sort, pagination, confirmation modals, deactivation/reactivation, and contextual Works management action. |
| Franchise Select Publisher | `/franchises/select-publisher` | Publisher selection page for new franchise. Protected by `ProtectedRoute`. Search, filters, sort, selection-only flow. Mock data. |
| Franchise Form | `/franchises/create` | Franchise creation page. Protected by `ProtectedRoute`. React Hook Form + Zod, publisher context, image handling, hex color selector, switches, confirmation modal, success toast. Mock data. |
| Franchise Form Edit | `/franchises/:id/edit` | Franchise edit page. Protected by `ProtectedRoute`. Preloaded form, image handling, publisher change flow, hex color selector, switches, confirmation modal, success toast. Mock data. |
| Works (per-Franchise) | `/franchises/:franchiseId/works` | Contextual Work listing for a Franchise. Protected by `ProtectedRoute`. Preserves `franchiseId`, loads Franchise context, shows back navigation, search, filters (active, content status, IA request, IA response status, publication date range), sort, pagination, edit/deactivate/activate/retry actions, IA status polling. Backend integration via `GET /api/admin-works/franchise/{franchiseId}`. |
| Works (per-Series) | `/series/:seriesId/works` | Contextual Work listing for a Series. Protected by `ProtectedRoute`. Preserves `seriesId`, loads Series context, shows back navigation, search, filters (active, content status, IA request, IA response status, publication date range), sort, pagination, edit/deactivate/activate/retry actions, IA status polling. Backend integration via `GET /api/admin-works/series/{seriesId}`. |
| Works (per-Publisher) | `/publishers/:publisherId/works` | Contextual Work listing for a Publisher. Protected by `ProtectedRoute`. Preserves `publisherId`, loads Publisher context, shows back navigation, search, filters (active, content status, IA request, IA response status, publication date range), sort, pagination, edit/deactivate/activate/retry actions, IA status polling. Backend integration via `GET /api/admin-works/publisher/{publisherId}`. |
| Series | `/series` | Series listing page. Protected by `ProtectedRoute`. Search, filters, sort, pagination, confirmation modals, deactivation/reactivation, and contextual Works management action. |
| Series Select Franchise | `/series/select-franchise` | Franchise selection page for new series. Protected by `ProtectedRoute`. Search, selection-only flow. |
| Series Form | `/series/create` | Series creation page. Protected by `ProtectedRoute`. React Hook Form + Zod, franchise context, image handling, hex color selector, switches, confirmation modal, success toast. |
| Series Form Edit | `/series/:id/edit` | Series edit page. Protected by `ProtectedRoute`. Preloaded form, image handling, franchise change flow, hex color selector, switches, confirmation modal, success toast. |
| Works | `/works` | Global Work listing page. Protected by `ProtectedRoute`. Search, filters (work type, active, content status, IA request, IA response status, publication date range), sort (title, publication date, upload date, language, number), pagination, confirmation modal, deactivate/reactivate/retry actions, IA status polling. Backend integration via `GET /api/admin-works`. |
| Work Form | `/works/create` and `/works/:id/edit` | Unified Work creation and editing page. Protected by `ProtectedRoute`. React Hook Form + Zod, work type selection (from `GET /api/admin-work-types`), basic info section (title, language, description, publication date), number value, previous/next continuity, person+role pairs with in-page create modals, tag input, CBR/CBZ upload with content processing, images gallery with cover selection, multi-image selection for AI analysis, AI analysis enqueued asynchronously via `POST /api/admin-works/{id}/ai-analysis` (200 OK accepted immediately, navigates back to Works grid), AI result loaded and displayed when `IAStatus = Success` on form load (pending/processing/error states do not attempt to display results), separated recommended tags/characters, content retry/delete, context display (Series/Franchise/Publisher received via router state for create or from Backend for edit), status toggle for deactivate/reactivate (edit mode), confirmation modal, success toast. Backend integration via `GET/PUT /api/admin-works`, `GET /api/admin-works/{id}`, `POST /api/admin-works/with-content`, `PUT /api/admin-works/{id}/with-content`, `GET /api/admin-work-types`. Replaces the previous Number and Graphic Novel forms. |
| Unauthorized | `/unauthorized` | Access denied for authenticated users without `Administrator` role. |
