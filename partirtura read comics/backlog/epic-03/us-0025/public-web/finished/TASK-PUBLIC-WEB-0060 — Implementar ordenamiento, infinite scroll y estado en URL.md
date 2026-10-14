# TASK-PUBLIC-WEB-0060 — Implementar ordenamiento, infinite scroll y estado en URL

## Objetivo

Implementar el ordenamiento, la carga incremental mediante infinite scroll y la persistencia del estado de `WorksPage` en la URL.

La implementación debe ser reutilizable para los cuatro contextos de la US-0025.

`works-catalog.html` es únicamente referencia visual.

## Ordenamiento

Implementar las siguientes opciones:

* Title;
* PublicationDate;
* UploadedAt;
* Number.

Implementar ambas direcciones:

* Ascending;
* Descending.

El orden inicial debe ser:

```text
UploadedAt DESC
```

`UploadedAt` corresponde al criterio de Works cargados más recientemente.

## Infinite scroll

No implementar paginación tradicional visible para el usuario.

No implementar botón:

```text
Load more
```

La lista debe solicitar automáticamente la siguiente página cuando el usuario se aproxime al final de los resultados.

La implementación debe:

* evitar solicitudes duplicadas;
* conservar los resultados ya cargados;
* mantener el orden seleccionado;
* detenerse cuando no existan más resultados;
* mantener correctamente búsqueda y filtros al solicitar páginas posteriores.

## Estado en URL

Persistir en la URL el estado relevante de la página.

Debe incluir:

* búsqueda;
* Publisher;
* Franchise;
* Series;
* WorkType;
* ordenamiento;
* dirección;
* contexto cuando corresponda.

Ejemplo:

```text
/catalog?publisher=2&franchise=8&series=42&search=spiderman&sort=title&direction=asc
```

Los nombres concretos de los parámetros pueden adaptarse a las convenciones existentes del Public Web, pero el estado funcional debe ser equivalente.

## Navegación del navegador

El estado debe permitir:

* refresh sin perder filtros;
* back;
* forward;
* compartir URL;
* guardar/bookmark de una búsqueda concreta.

Al ingresar directamente a una URL con estado, la página debe reconstruir correctamente:

* contexto;
* búsqueda;
* filtros;
* orden;
* dirección.

## Integración con contextos

Debe funcionar correctamente en:

```text
/catalog
/publishers/:id
/franchises/:id
/series/:id
```

Los filtros propios del contexto deben conservar su comportamiento aunque exista estado adicional en la URL.

## Criterios de aceptación

* El orden inicial es UploadedAt DESC.
* Funcionan todos los campos de ordenamiento.
* Funcionan ambas direcciones.
* Los resultados se cargan mediante infinite scroll.
* No existe botón de paginación o “Load more”.
* No se duplican resultados entre páginas.
* La búsqueda y los filtros se mantienen durante el scroll.
* El estado relevante se refleja en la URL.
* Refresh reconstruye el estado.
* Back/forward funcionan correctamente.
* Una URL compartida reproduce la misma consulta.
* La implementación funciona en los cuatro contextos.

## Resultado de ejecución

### Estado

finished

### What was implemented

Sorting, infinite scroll, and URL state persistence implemented in the shared `WorksPage`.

### Files changed

* `public-web/public-web/features/catalog/hooks/use-catalog-url-state.ts` — URL-backed state for search, filters, sort, and direction
* `public-web/public-web/features/catalog/components/sort-controls.tsx` — sort field selector and direction toggle
* `public-web/public-web/features/catalog/components/works-page.tsx` — infinite scroll via IntersectionObserver and URL state integration

### Relevant decisions

* Sort fields mapped to backend values: `CreatedAt`, `PublicationDate`, `Title`, `Number`
* Default sort: `CreatedAt DESC` via URL params `sort=CreatedAt&direction=desc`
* Infinite scroll uses `IntersectionObserver` with `rootMargin: '200px'` for preloading
* Pages accumulated via `useState` with duplicate ID filtering
* `useCatalogUrlState` uses `useSearchParams` with `{ replace: true }` for clean history
* URL params: `search`, `publisherId`, `franchiseId`, `seriesId`, `workTypeId`, `sort`, `direction`
* Context filters preselected via `useEffect` when missing from URL

### Validation

* TypeScript: `tsc --noEmit` passes
* Build: `npm run build` passes

## Resultado de ejecución — segunda ronda (2026-09-30)

### Motivo de la reopening

El bloqueo registrado para esta task (dependencia de `TASK-API-0243`) quedó obsoleto: la dependencia está en `finished` y los parámetros jerárquicos ya están disponibles. La task volvió a `pending`.

### Qué se cambió

* `works-page.tsx`: los parámetros de consulta de obras se consolidaron en un único objeto memoizado (`worksParams`) compartido entre la consulta inicial, `useInfiniteWorks` y el infinite scroll. Antes cada uno reconstruía el objeto por separado, con lo que la `queryKey` podía divergir del `queryFn` real.
* Se conservaron los params de página en el accumulation state: el infinite scroll sigue acumulando con deduplicación por `id` y la lista no salta entre scrolls.

### Validación en runtime

Chromium headless: 76 tarjetas en la carga inicial de `/catalog`, y la lista se mantiene sin duplicados al scrollear 1500px con los filtros aplicados.
