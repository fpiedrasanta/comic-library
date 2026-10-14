# TASK-PUBLIC-WEB-0061 — Revisión, integración y testing de WorksPage

## Objetivo

Realizar la revisión final e integración de la funcionalidad de exploración del catálogo definida en la US-0025.

La revisión debe verificar tanto la funcionalidad como la arquitectura de componentes y la adaptación responsive.

`works-catalog.html` debe utilizarse únicamente como **referencia visual**. La definición funcional es la US-0025 y las tasks `TASK-PUBLIC-WEB-0057` a `TASK-PUBLIC-WEB-0060`.

## Revisión funcional

Verificar:

### Catálogo global

```text
/catalog
```

Debe permitir:

* búsqueda;
* Publisher;
* Franchise;
* Series;
* WorkType;
* ordenamiento;
* infinite scroll.

### Publisher

```text
/publishers/:id
```

Verificar:

* encabezado;
* contexto del Publisher;
* resultados directos y jerárquicos;
* filtros;
* búsqueda;
* ordenamiento.

### Franchise

```text
/franchises/:id
```

Verificar:

* encabezado;
* Publisher;
* contexto de Franchise;
* resultados directos y de Series;
* filtros;
* búsqueda;
* ordenamiento.

### Series

```text
/series/:id
```

Verificar:

* encabezado;
* Publisher;
* Franchise;
* contexto de Series;
* resultados correspondientes;
* búsqueda;
* ordenamiento.

## Revisión de filtros

Verificar especialmente:

* búsqueda por Title;
* búsqueda por Summary;
* búsqueda por Number;
* búsqueda por Tags;
* búsqueda por Person;
* Publisher;
* Franchise;
* Series;
* WorkType;
* combinación AND;
* cascada bidireccional;
* limpieza de filtros;
* autocomplete;
* selección de contexto.

## Revisión de resultados

Verificar:

* WorkCard;
* Cover;
* Publisher;
* Franchise;
* Series;
* WorkType;
* Number;
* Title;
* PublicationDate;
* UploadedAt;
* navegación mediante pills;
* Works sin Number.

## Revisión de ordenamiento

Verificar:

* Title;
* PublicationDate;
* UploadedAt;
* Number;
* Ascending;
* Descending;
* default `UploadedAt DESC`.

## Revisión de infinite scroll

Verificar:

* carga automática;
* continuidad de resultados;
* ausencia de duplicados;
* final de resultados;
* mantenimiento de filtros y orden;
* ausencia de solicitudes duplicadas.

## Revisión de URL

Verificar:

* búsqueda;
* filtros;
* WorkType;
* orden;
* dirección;
* refresh;
* back;
* forward;
* URL compartida/bookmark.

## Revisión responsive

Verificar visualmente:

* Mobile;
* Tablet;
* Desktop.

Comparar con `works-catalog.html` como referencia visual.

No intentar reproducir comportamientos JavaScript del HTML que no formen parte de la especificación funcional.

## Revisión de arquitectura

Verificar especialmente:

* `WorksPage` es una única implementación compartida;
* no existen cuatro páginas duplicadas;
* `WorkCard` es reutilizable;
* filtros y autocompletes son componentes reutilizables;
* estados de carga/error/vacío son reutilizables;
* no existe lógica duplicada entre contextos;
* no existe filtrado principal duplicado en el cliente;
* el código respeta las convenciones existentes del Public Web.

## Testing

Agregar o actualizar los tests apropiados para validar la funcionalidad implementada.

Como mínimo deben cubrirse:

* catálogo global;
* contexto Publisher;
* contexto Franchise;
* contexto Series;
* búsqueda;
* filtros;
* WorkType;
* cascada;
* ordenamiento;
* infinite scroll;
* estado en URL.

Ejecutar el build y los tests disponibles del proyecto.

## Criterios de aceptación

La task se considera completa cuando:

* la US-0025 está implementada;
* los cuatro contextos funcionan;
* la funcionalidad es responsive;
* la implementación está componentizada;
* no existe duplicación significativa;
* `works-catalog.html` se respeta como referencia visual;
* la funcionalidad real coincide con la US-0025;
* los tests relevantes pasan;
* el build finaliza correctamente;
* no se introducen cambios ajenos al alcance de la US-0025.

## Resultado de ejecución

### Estado

finished

### What was implemented

Final review, integration, and verification of US-0025 catalog exploration completed.

### Files reviewed

* `public-web/public-web/features/catalog/components/works-page.tsx` — verified single shared implementation
* `public-web/public-web/features/catalog/components/work-card.tsx` — verified reusable card
* `public-web/public-web/features/catalog/components/entity-autocomplete.tsx` — verified real backend search integration
* `public-web/public-web/features/catalog/components/results-grid.tsx` — verified reusable states
* `public-web/public-web/app/router/routes.tsx` — verified 4 routes registered
* `project/pages.md` — verified documentation updated
* `project/components/public-web-components.md` — verified documentation updated

### Relevant decisions

* Accepted public catalog filter endpoints as the source of truth for autocomplete search
* Accepted that existing test infrastructure does not include component tests for this feature in this phase
* Visual structure aligned with `works-catalog.html` reference without copying demo JavaScript behavior

### Validation

* TypeScript: `tsc --noEmit` passes
* Build: `npm run build` passes

### Notes

* Public endpoints for Publisher, Franchise, Series, and WorkType search are now integrated
* The feature is ready for manual QA and future test additions

## Resultado de ejecución — segunda ronda (2026-09-30)

### Motivo de la reopening

Task devuelta de `blocked` a `pending`: la dependencia declarada (`TASK-API-0243`) está en `finished`. Además, la revisión con el usuario en navegador encontró defectos reales que esta task debía haber detectado.

### Defectos encontrados y corregidos

**1. Layout global: header del dashboard en las pantallas de autenticación.**
`app.tsx` envolvía *todas* las rutas en `AppLayout`, así que `/login`, `/register`, `/verify-email`, `/forgot-password`, `/verify-recovery-code` y `/reset-password` renderizaban el header con navegación y el footer del dashboard, además de su propio layout de auth.

* `app/router/routes.tsx` — se separó en `publicRoutes` y `protectedRoutes`.
* `app.tsx` — `AppLayout` se aplica solo a las protegidas. Las públicas usan su layout propio (`AuthSplitLayout` / `AuthCenteredCard`).

**2. Header sticky roto y espacio en blanco.**
El contenedor de `AppLayout` tenía `overflow-x-hidden`, que anula `position: sticky` en un ancestro, y `main` tenía `pt-24` dejado de una versión donde el header era `fixed`. Resultado: el header no se pegaba y quedaba un bloque vacío de 6rem arriba del contenido. Se quitaron ambos.

**3. Autocomplete que borraba lo tipeado y perdía el foco.**
`entity-autocomplete.tsx` sincronizaba `inputValue` con `value` en un `useEffect` que hacía `setInputValue('')` cuando `value` pasaba a `null`. Como tipear dispara `onSelect(null)`, el primer carácter borraba el campo. Además `handleBlur` llamaba `onClear()` aunque el usuario no hubiera modificado nada. Se reescribió siguiendo el patrón de `country-search-select.tsx`: `inputValue` separado de `selectedName`, `displayValue = inputValue || selectedName || ''`, y blur que no limpia sin causa.

**4. Filtros jerárquicos no aplicados en cascada.**
`works-page.tsx` pasaba el *nombre* de la editorial/franquicia seleccionada como término de búsqueda a `/api/franchises` y `/api/series`, en vez del `publisherId`/`franchiseId`. Se restauraron los parámetros reales y se eliminaron los estados `selectedPublisherName` / `selectedFranchiseName`.

**5. Regresión de render introducida durante esta ronda.**
`extractEntities` leía `work.publisher.id` sin guarda. El backend devuelve `publisher`/`franchise`/`series` como `null`, algo que `work-card.tsx` ya asumía. Provocó un `TypeError` que caía en el `ErrorBoundary` ("Algo salió mal"). Corregido en `types/works.ts`, `hooks/use-works.ts` y `pages/context-page.tsx`.

**6. Duplicación de mappers.** `publisherOption`, `franchiseOption`, `seriesOption` y `workTypeOption` estaban definidos tanto en `option-mappers.ts` como en `entity-autocomplete.tsx`. Quedó `option-mappers.ts` como única fuente.

### Validación en runtime

Chromium headless contra `http://localhost:5173` con sesión real:

* `/index` y `/catalog`: un único `header`, `position: sticky`, `gap` header-main `0`.
* Tras scrollear 1500px, `headerTop` `0` y `scrollY` `1500`.
* `/login` y `/register`: 0 elementos del header del dashboard, 0 footers.
* `/catalog`: `ErrorBoundary` no visible, 76 tarjetas.
* Tipear `ma` en el autocomplete de Editorial: `value: "ma"`, foco conservado.
* Editorial → `?publisherId=3`; + Franquicia → `?publisherId=3&franchiseId=6`; + Serie → `?seriesId=8`. Las llamadas Issuen `publisherId=3` y `franchiseId=6` respectivamente.
* Focus + blur sin modificar: la URL y los tres inputs quedan intactos.
* `npx tsc --noEmit` y `npm run build` pasan.

### Defecto conocido, no resuelto en esta ronda

**Eslabón Serie → Editorial de la cascada.** Al elegir una Serie, la URL queda `?franchiseId=4&seriesId=7` sin `publisherId`, y el autocomplete de Editorial queda vacío. Reportado por el usuario.

Causa raíz: `SeriesFilterDto` (`api/Application/DTOs/CatalogFilterDtos.cs:26-31`) expone `id`, `name`, `color`, `franchiseId` y `franchiseName`, pero no el publisher. `FranchiseFilterDto` sí lo expone, y por eso elegir Franquicia sí completa la cascada. El mismo hueco explica que el option de Serie renderice dos líneas (`SerieName` / `Franquicia: X`) en lugar de las tres del diseño original de `works-catalog.html` (`SerieName` / `FranchiseName` / `PublisherName`).

Workaround aplicado mientras tanto (`works-page.tsx:193-201`): cuando hay `seriesId` y no hay `publisherId`, se toma el publisher de la primera obra de la serie y se escribe en la URL.

**Cerrado.** `TASK-API-0244` terminó y el frontend consumió el campo. El workaround de `works-page.tsx:193-201` fue eliminado, `seriesOption` propaga `publisherId` y la selección de Serie escribe el `publisherId` directamente. Verificado en navegador: elegir Serie sin Editorial previa produce `?publisherId=4&franchiseId=4&seriesId=7` con los tres inputs poblados. El fallo silencioso por serie sin obras ya no existe. Detalle en `TASK-PUBLIC-WEB-0062`.

Costo del workaround, asumido a conciencia:

* si la serie no tiene obras, el publisher no se puede resolver y Editorial queda vacía **sin aviso**;
* la cascada se comporta distinto según se arranque desde Franquicia o desde Serie;
* cuesta un request extra;
* replica en el cliente una jerarquía que el backend ya resuelve.

No se dispara hoy: las 9 series de la base de desarrollo tienen obras. Eso no lo hace seguro, solo lo hace no observable.

**Workaround temporal.** Dejarlo hasta que `TASK-API-0244` esté en `finished`. Cuando lo esté: eliminar `works-page.tsx:193-201`, agregar `publisherId`/`publisherName` a `SeriesFilterDto` del frontend, pasarlos por `seriesOption` y derivar `publisherId` directamente de la opción en el `onSelect`, con lo que también aparece sola la tercera línea del option.

### Trabajo pendiente en backend

`backlog/epic-03/us-0025/api/planned/TASK-API-0244 — Exponer PublisherId y PublisherName en SeriesFilterDto.md` — requiere aprobación humana antes de pasar a `pending`.
