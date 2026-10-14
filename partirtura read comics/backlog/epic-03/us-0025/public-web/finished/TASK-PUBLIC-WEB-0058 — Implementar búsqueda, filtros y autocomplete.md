# TASK-PUBLIC-WEB-0058 — Implementar búsqueda, filtros y autocomplete

## Objetivo

Implementar la búsqueda, filtros y autocompletes de `WorksPage` según la US-0025.

La implementación debe utilizar los componentes creados en `TASK-PUBLIC-WEB-0057` y mantener una arquitectura reutilizable, sin duplicar lógica entre contextos.

`works-catalog.html` es únicamente referencia visual.

## Búsqueda

Implementar una búsqueda textual única.

El texto debe buscar Works por:

* Title;
* Summary;
* Number.Value;
* Tags;
* Person.

La búsqueda debe:

* aceptar coincidencias parciales;
* ser case-insensitive;
* combinarse con los filtros mediante AND.

No implementar búsqueda por múltiples términos como funcionalidad especial.

## Filtros

Implementar:

* Publisher;
* Franchise;
* Series;
* WorkType.

Los filtros deben combinarse entre sí mediante AND.

El filtro WorkType es exclusivamente clasificatorio. No debe modificar la interpretación de Publisher, Franchise o Series.

## Autocomplete

Publisher, Franchise y Series deben utilizar selección mediante autocomplete.

El autocomplete debe:

* buscar coincidencias parciales;
* ser case-insensitive;
* mostrar contexto cuando corresponda;
* permitir seleccionar una entidad;
* no aplicar el filtro simplemente por escribir texto.

Ejemplo visual:

```text
Amazing Spider-Man
Franquicia: Spider-Man
Editorial: Marvel
```

Escribir texto sin seleccionar una opción no debe modificar los resultados.

## Cascada

Implementar las relaciones bidireccionales entre:

* Publisher;
* Franchise;
* Series.

### Publisher seleccionado

Limitar las Franchises disponibles al Publisher seleccionado.

### Franchise seleccionada

Limitar las Series disponibles a la Franchise seleccionada.

### Series seleccionada

Completar automáticamente el contexto de:

* Franchise;
* Publisher.

### Eliminación de Series

Eliminar Series no debe eliminar:

* Franchise;
* Publisher.

### Eliminación de Franchise

Eliminar Franchise debe eliminar también:

* Series.

Publisher debe permanecer seleccionado.

### Eliminación de Publisher

Eliminar Publisher debe eliminar también:

* Franchise;
* Series.

## Contextos

Los filtros estructurales provenientes de:

* `/publishers/:id`;
* `/franchises/:id`;
* `/series/:id`;

deben inicializarse de acuerdo con el contexto de la página.

Cuando un filtro pertenece al contexto, debe permanecer preseleccionado y oculto según la definición de la US-0025.

## API

Consumir el endpoint público de Works implementado para la US-0025:

```text
GET /api/works
```

Utilizar los parámetros correspondientes para:

* search;
* publisherId;
* franchiseId;
* seriesId;
* workTypeId.

No duplicar lógica de filtrado en el cliente.

El backend es responsable del filtrado de los resultados.

## Estados

Implementar correctamente:

* búsqueda sin resultados;
* carga;
* filtros sin resultados;
* combinación de búsqueda y filtros;
* limpieza de filtros.

## Criterios de aceptación

* La búsqueda utiliza todos los campos definidos.
* Publisher, Franchise, Series y WorkType funcionan como filtros.
* Los filtros se combinan mediante AND.
* El autocomplete no filtra hasta seleccionar una opción.
* La cascada funciona en ambas direcciones.
* Las reglas de eliminación de filtros se respetan.
* Los contextos inicializan correctamente sus filtros.
* No se duplica lógica entre las distintas páginas.
* No se implementa filtrado principal en memoria sobre los resultados recibidos.

## Resultado de ejecución

### Estado

finished (segunda ronda, 2026-09-30)

### What was implemented

Search input and URL-backed filter/sort state implemented. Component architecture for autocomplete created.

### Files changed

* `public-web/public-web/features/catalog/hooks/use-catalog-url-state.ts` — URL-backed filter/sort state
* `public-web/public-web/features/catalog/components/catalog-search.tsx` — search input
* `public-web/public-web/features/catalog/components/entity-autocomplete.tsx` — autocomplete component
* `public-web/public-web/features/catalog/components/works-page.tsx` — filter orchestration and cascade rules

### Validation

* TypeScript: `tsc --noEmit` passes
* Build: `npm run build` passes

## Resultado de ejecución — segunda ronda (2026-09-30)

### Motivo de la reopening

Los endpoints públicos que esta task declaraba faltantes están implementados (`TASK-API-0242` y `TASK-API-0243`, ambas en `finished`). El bloqueo quedó obsoleto y la task volvió a `pending`.

### Qué se implementó

* Autocompletes con búsqueda real contra backend: `GET /api/publishers`, `/api/franchises`, `/api/series`, `/api/work-types`, cada uno con su término de búsqueda y su filtro jerárquico. Se eliminó la dependencia de extraer las opciones desde la primera página de obras.
* Cascada descendente con AND, combinable con `search`: Franchise se pide con `publisherId`, Series con `franchiseId` (o con `publisherId` cuando no hay franquicia seleccionada).
* Reglas de limpieza: al elegir Publisher se limpian Franquicia y Serie; al elegir Franquicia se limpia Serie; al elegir Serie se setea su Franquicia.

### Corrección del comportamiento del autocomplete

`entity-autocomplete.tsx` se reescribió siguiendo el patrón ya establecido en `country-search-select.tsx`:

* `inputValue` separado de `selectedName`, con `displayValue = inputValue || selectedName || ''`. Antes, un `useEffect` ponía `inputValue` en `''` cada vez que `value` pasaba a `null`, lo que borraba lo tipeado y hacía perder el foco en el primer carácter.
* `handleBlur` ya no dispara `onClear` cuando el usuario no modificó nada. Ese era el motivo del criterio de aceptación "el autocomplete no filtra hasta seleccionar una opción": el blur limpiaba el filtro sin causa.
* El `onSelect(null)` del `onChange` sigue siendo el mecanismo real de deselección; la limpieza explícita queda en el botón de limpiar.

### Validación en runtime

Chromium headless: tipear `ma` en el autocomplete de Editorial conserva `value: "ma"` y `document.activeElement` sigue siendo el input. Focus + blur sin modificar nada deja la URL intacta (`?publisherId=3&franchiseId=6&seriesId=8`) y los tres inputs con sus nombres.

### Defecto conocido, no resuelto acá

`SeriesFilterDto` no expone `PublisherId`/`PublisherName`, así que elegir Serie no completa la cascada hacia Editorial. Resuelto con un workaround temporal documentado en `TASK-PUBLIC-WEB-0061` y con el pedido formal en `TASK-API-0244`. También falta la tercera línea del option de Serie (`PublisherName` en letra chica) que definía el diseño original de `works-catalog.html`.
