# TASK-PUBLIC-WEB-0057 — Implementar WorksPage compartida

## Objetivo

Implementar la página compartida `WorksPage` para la exploración del catálogo de Works.

La implementación debe ser **orientada a componentes**, evitando duplicación de código y permitiendo reutilizar la misma página para todos los contextos definidos por la US-0025.

El archivo `works-catalog.html` debe utilizarse únicamente como **referencia visual**. No debe interpretarse su comportamiento JavaScript como definición funcional. La funcionalidad válida es la definida en la US-0025 y en esta task.

## Contextos

La misma `WorksPage` debe utilizarse para:

* `/catalog`
* `/publishers/:id`
* `/franchises/:id`
* `/series/:id`

No implementar cuatro páginas independientes.

El contexto debe determinar:

* encabezado mostrado;
* filtros preseleccionados;
* filtros ocultos cuando corresponda;
* alcance de los resultados.

## `/catalog`

Debe mostrar:

* encabezado general del catálogo;
* Publisher;
* Franchise;
* Series;
* WorkType;
* búsqueda;
* resultados.

Todos los filtros estructurales deben estar disponibles.

## `/publishers/:id`

Debe mostrar:

* imagen del Publisher;
* nombre del Publisher;
* filtro Publisher preseleccionado y oculto;
* filtros Franchise y Series;
* WorkType;
* búsqueda;
* resultados.

Los resultados deben incluir Works:

* pertenecientes directamente al Publisher;
* pertenecientes a sus Franchises;
* pertenecientes a Series dentro de esas Franchises.

## `/franchises/:id`

Debe mostrar:

* imagen de la Franchise;
* nombre de la Franchise;
* Publisher;
* filtros Publisher y Franchise preseleccionados y ocultos;
* Series;
* WorkType;
* búsqueda;
* resultados.

Los resultados deben incluir:

* Works directamente pertenecientes a la Franchise;
* Works pertenecientes a sus Series.

## `/series/:id`

Debe mostrar:

* imagen de la Series;
* nombre de la Series;
* Publisher;
* Franchise;
* filtros estructurales preseleccionados y ocultos;
* WorkType;
* búsqueda;
* resultados.

Los resultados deben corresponder únicamente a la Series.

## Componentización

La implementación debe separar responsabilidades mediante componentes reutilizables.

Como mínimo, identificar componentes para:

* encabezado contextual;
* filtros;
* búsqueda;
* selector/autocomplete;
* lista de resultados;
* WorkCard;
* estados de carga;
* estado sin resultados.

No duplicar markup ni lógica entre los cuatro contextos.

## Responsive

Implementar correctamente:

* Mobile;
* Tablet;
* Desktop/PC.

La adaptación debe preservar la jerarquía visual definida por `works-catalog.html`.

## Fuente funcional

La implementación debe seguir:

1. US-0025.
2. Esta task.
3. Contratos existentes del proyecto.

`works-catalog.html` solamente define referencia visual.

Si existe alguna diferencia entre el HTML y esta especificación funcional, prevalece esta especificación.

## Fuera de alcance

No implementar:

* lector de Comics;
* historial;
* progreso de lectura;
* favoritos;
* listas;
* ratings;
* comentarios;
* recomendaciones;
* funcionalidades sociales.

## Criterios de aceptación

* Existe una única `WorksPage` reutilizable.
* Los cuatro contextos utilizan la misma implementación.
* No existen páginas duplicadas para cada contexto.
* La estructura visual corresponde a `works-catalog.html`.
* La implementación es responsive.
* La componentización evita duplicación de código.
* Los contextos determinan correctamente encabezado, filtros y alcance de resultados.
* No se implementa funcionalidad fuera de la US-0025.

## Resultado de ejecución

### Estado

finished

### What was implemented

Shared `WorksPage` implemented as a single reusable component for all four contexts: `/catalog`, `/publishers/:id`, `/franchises/:id`, `/series/:id`.

### Files changed

* `public-web/public-web/features/catalog/types/works.ts` — created catalog types
* `public-web/public-web/features/catalog/api/works-repository.ts` — created `GET /api/works` repository
* `public-web/public-web/features/catalog/api/catalog-repository.ts` — created public catalog filter endpoints repository
* `public-web/public-web/features/catalog/hooks/use-catalog-url-state.ts` — created URL-backed filter/sort hook
* `public-web/public-web/features/catalog/hooks/use-works.ts` — created works hooks
* `public-web/public-web/features/catalog/components/works-page.tsx` — created shared WorksPage
* `public-web/public-web/features/catalog/components/catalog-search.tsx` — created search component
* `public-web/public-web/features/catalog/components/entity-autocomplete.tsx` — created autocomplete component
* `public-web/public-web/features/catalog/components/sort-controls.tsx` — created sort controls
* `public-web/public-web/features/catalog/components/results-grid.tsx` — created results grid with states
* `public-web/public-web/features/catalog/components/contextual-header.tsx` — created contextual header
* `public-web/public-web/features/catalog/pages/catalog-page.tsx` — created catalog page
* `public-web/public-web/features/catalog/pages/context-page.tsx` — created context page
* `public-web/public-web/features/catalog/pages/*-route-page.tsx` — created route pages
* `public-web/public-web/app/router/routes.tsx` — registered new routes
* `project/pages.md` — updated pages documentation
* `project/components/public-web-components.md` — updated components documentation

### Relevant decisions

* Single shared `WorksPage` with props for `contextType`, `contextEntity`, `hiddenFilters`, and `prefillFilters`
* Contextual header shown only for Publisher/Franchise/Series contexts, hidden for `/catalog`
* Entity metadata derived from API results to avoid additional requests
* Responsive layout using Tailwind grid and spacing utilities
* Public catalog filter endpoints integrated for real autocomplete search

### Validation

* TypeScript: `tsc --noEmit` passes
* Build: `npm run build` passes

## Resultado de ejecución — segunda ronda (2026-09-30)

### Motivo de la reopening

El estado `blocked` registrado para esta task (dependencia de `TASK-API-0243`) quedó obsoleto: esa dependencia está en `finished` y `GetFranchisesParams`/`GetSeriesParams` ya aceptan `publisherId`/`franchiseId`. La task volvió a `pending` y se ejecutó esta ronda.

### Qué se implementó

* `works-page.tsx`: se restauraron los parámetros reales `publisherId` y `franchiseId` contra `/api/franchises` y `/api/series`, y se eliminaron los estados workaround `selectedPublisherName` y `selectedFranchiseName`. La cascada descendente (`/series?franchiseId=`, `/franchises?publisherId=`) quedó aplicada con AND, combinable con `search`.
* `works-page.tsx`: los parámetros de `getWorks` se extrajeron a un único objeto memoizado (`worksParams`) reutilizado por la consulta inicial, por `useInfiniteWorks` y por el infinite scroll, eliminando la triplicación.
* `works-page.tsx`: la selección de un Publisher limpia Franquicia y Serie; la de una Franquicia limpia Serie; la de una Serie setea su Franquicia.
* Se agregaron constantes con nombre (`FILTER_PAGE_SIZE`, `FILTER_SORT_FIELD`, `FILTER_SORT_DIRECTION`, `ALL_WORK_TYPES`) en lugar de números y strings mágicos.
* `option-mappers.ts`: quedó como única fuente de los mappers `publisherOption`, `franchiseOption`, `seriesOption`, `workTypeOption`. Los duplicados que estaban en `entity-autocomplete.tsx` se eliminaron.

### Corrección de una regresión

`extractEntities` (en `use-works.ts`) se pasó a invocar sobre las obras de la respuesta para resolver el nombre de la selección activa. Esa función leía `work.publisher.id` sin guarda y el backend devuelve esos nodos como `null`, lo que provocaba un `TypeError` en render y activaba el `ErrorBoundary` del catálogo ("Algo salió mal"). Se corrigió en tres archivos:

* `types/works.ts` — `series`, `franchise` y `publisher` de `WorkCatalogItemDto` pasan a `WorkCatalogNodeDto | null`.
* `hooks/use-works.ts` — `extractEntities` con guardas por nodo.
* `pages/context-page.tsx` — null-checks en la construcción del contexto.

### Validación en runtime

Chromium headless contra `http://localhost:5173` con sesión real: un único `header` en `/index` y `/catalog`, `position: sticky`, `gap` header-main `0`, `headerTop` `0` tras scrollear 1500px, `ErrorBoundary` no visible, 76 tarjetas renderizadas, y la URL reflejando la cascada.
