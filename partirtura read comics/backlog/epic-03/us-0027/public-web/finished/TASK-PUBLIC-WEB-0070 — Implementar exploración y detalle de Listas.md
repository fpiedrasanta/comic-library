# TASK-PUBLIC-WEB-0070 — Implementar exploración y detalle de Listas

## Objetivo

Implementar en Public Web la exploración de listas y el detalle de una lista, siguiendo la US-0027 y los templates UX/UI proporcionados.

La implementación debe integrarse a la navegación existente del catálogo:

```text
Catálogo
├── Obras
├── Editoriales
├── Franquicias
├── Series
└── Listas
```

Al seleccionar **Listas**, el usuario debe navegar a:

```text
/lists
```

Al seleccionar una lista, debe navegar a:

```text
/lists/{id}
```

---

# Referencias visuales

Los siguientes archivos son **únicamente referencias visuales**:

```text
C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\listar-listas.html

C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\detalle-de-lista.html
```

Los templates sirven para orientar:

* distribución visual;
* jerarquía;
* espaciados;
* tamaños;
* composición;
* apariencia de tarjetas;
* presentación de la portada;
* responsive.

**Los templates no definen comportamiento funcional.**

El comportamiento funcional debe implementarse exclusivamente según:

1. `US-0027.md`
2. esta task;
3. los contratos existentes del Public Web y Backend.

No copiar HTML literalmente si la arquitectura React existente requiere una implementación diferente.

---

# 1. Navegación desde Catálogo

Agregar **Listas** como opción dentro de la sección **Catálogo** existente.

Al hacer click:

```text
Catálogo → Listas
```

navegar a:

```text
/lists
```

Utilizar el mecanismo de routing existente del Public Web.

No crear un sistema de navegación paralelo.

---

# 2. Pantalla `/lists`

Implementar la pantalla de exploración de listas utilizando:

```http
GET /api/catalog/lists
```

Debe respetar el contrato definido en la US-0027.

## Búsqueda

Implementar búsqueda por:

* Nombre.
* Descripción.

Enviar la búsqueda al Backend mediante `Search`.

Utilizar el mecanismo de debounce existente o implementar uno reutilizable si todavía no existe.

## Filtros

Implementar:

* Editorial.
* Franquicia.
* Serie.
* Tipo de lista.

Reutilizar los componentes de selección/autocomplete existentes del catálogo cuando sean compatibles.

No duplicar componentes ya existentes.

Enviar al Backend:

```text
PublisherId
FranchiseId
SeriesId
ListTypeId
```

Los filtros de Editorial, Franquicia y Serie deben mantener el comportamiento de dependencia utilizado por la exploración del catálogo.

## Listado

Implementar infinite scroll utilizando la paginación del endpoint.

Debe:

* cargar la primera página;
* solicitar páginas posteriores al alcanzar el final;
* acumular resultados;
* evitar duplicados;
* evitar solicitudes concurrentes;
* detenerse al alcanzar el final;
* mostrar loading;
* mostrar empty;
* mostrar error.

El orden inicial será el definido por Backend:

```text
CreatedAt DESC
```

No duplicar lógica de ordenamiento en el cliente.

---

# 3. List Card

Crear un componente reutilizable para representar una lista.

Cada tarjeta debe mostrar:

* Imagen de portada.
* Tipo de lista.
* Nombre.
* Cantidad de obras.

**No mostrar la descripción.**

## Portada

La portada representa una portada vertical de comic.

Debe:

* utilizar `object-fit: cover`;
* ocupar completamente su área;
* no utilizar padding interno;
* tener bordes redondeados;
* poder utilizar el color distintivo de la lista como acento visual.

## Interacción

La tarjeta completa debe ser clickeable.

Al hacer click:

```text
/lists/{id}
```

Utilizar el router existente.

No utilizar `window.location`.

---

# 4. Pantalla `/lists/{id}`

Implementar el detalle de una lista utilizando:

```http
GET /api/catalog/lists/{id}
```

Debe mostrar:

* Portada.
* Tipo de lista.
* Nombre.
* Descripción.
* Color distintivo.
* Cantidad de obras.

Debajo debe mostrar las obras pertenecientes a la lista.

---

# 5. Obras de la lista

Utilizar **el mismo WorkCard existente en el catálogo**.

No crear una variante de WorkCard específica para listas.

Las obras deben mostrarse en el orden recibido desde Backend.

No implementar en esta pantalla:

* filtros de obras;
* búsqueda de obras;
* ordenamiento de obras;
* reordenamiento;
* filtros adicionales;
* criterios alternativos de orden.

La lista ya define el conjunto y el orden de las obras.

---

# 6. Componentización y reutilización

La implementación debe estar **orientada a la reutilización de componentes**.

No generar código duplicado entre las distintas pantallas o componentes.

Reutilizar componentes existentes del Public Web cuando correspondan, especialmente:

* navegación;
* búsqueda;
* filtros;
* autocomplete;
* loading;
* empty state;
* error state;
* imágenes;
* WorkCard;
* componentes de layout;
* componentes responsive.

Los componentes nuevos deben diseñarse para ser reutilizables cuando exista una responsabilidad común.

Por ejemplo, la tarjeta de lista debe ser un com

---

# Resultado de ejecución

## Estado: **completado y verificado**

Las dos pantallas están implementadas, ruteadas, verificadas y las dependencias de Backend resueltas.

## Qué se implementó

### `/lists`

* Búsqueda por nombre o descripción, con debounce y en la URL
  (`?search=`), sobre `CatalogSearch`.
* Filtros Editorial → Franquicia → Serie con la misma cascada y
  los mismos nombres de parámetros que `/catalog` (`idPublisher`,
  `idFranchise`, `idSerie`), sobre el `EntityAutocomplete`
  existente.
* Filtro Tipo de Lista consumiendo el endpoint público
  `GET /api/list-types` (73 tipos activos), con búsqueda,
  paginación y orden por nombre.
* Grilla infinita de cards: portada vertical (`aspect-[2/3]`,
  `object-cover`, sin padding), color de la lista como acento,
  pill de tipo, nombre y cantidad de obras. Sin descripción.
* Estados de carga, vacío (con "Limpiar filtros y búsqueda") y
  error (con reintento).

### `/lists/:id`

* `ListHeader` con portada vertical, pill de tipo, nombre,
  descripción, cantidad de obras y el color de la lista como
  acento; shells de carga, 404 y error.
* Las obras con el `WorkCard` existente, en el orden de la
  lista, sin búsqueda, filtros ni ordenamiento de obras.
* Las pills de cada obra navegan a la página de la entidad y
  muestran el color de la entidad (color resuelto por el Backend
  siguiendo la cadena Publisher → Franquicia → Serie).
* El número de la obra y la fecha de subida viajan en el payload
  y se renderizan en el card.
* El menú Catálogo habilitó `Listas` → `/lists` (desktop y
  móvil).

## Archivos

* Tipos: `types/lists.ts`. API: `api/lists-repository.ts`.
* Hooks: `hooks/use-catalog-lists.ts`, `use-list-detail.ts`,
  `use-listing-filters.ts`, `use-entity-filter-options.ts`
  (la cascada de autocompletes, extraída de `WorksPage` para
  no duplicarla), `hooks/use-list-types.ts`.
* Componentes: `components/list-card.tsx`, `list-card-skeleton.tsx`,
  `list-header.tsx`.
* Páginas: `pages/lists-page.tsx`, `list-detail-page.tsx`,
  `list-route-page.tsx`.
* Rutas en `app/router/routes.tsx`; menú en
  `components/dashboard/catalog-menu.tsx`.
* `ResultsGrid` ganó `emptyMessage` opcional (por defecto
  intacto).
* Documentación: `project/pages.md` y `project/components.md`.

## Verificación

* `npm run typecheck` → 0 errores. `npm run build` → OK.
* `qa-lists.mjs` (nueva, 53 checks): menú, listado, búsqueda
  con debounce, empty + limpiar, filtros Editorial y Tipo de
  Lista con sus params en la URL y en el request, detalle con
  sus 13 obras en orden, pills de obra navegables con colores de
  entidad, número y fecha de subida, ausencia de controles de
  obra, 404, scroll infinito con 3 páginas sintéticas (72 cards
  sin duplicados, páginas `[1,2,3]` una vez), responsive mobile
  y estado activo del menú.
* `qa-nav.mjs`, `qa-series.mjs`, `qa-entity-card.mjs`,
  `qa-entity-listings.mjs` → sin fallas (el refactor de
  `WorksPage` no regresa nada).

## Backend completado (bloqueo resuelto)

* `TASK-API-0270`: `CatalogListWorkDto` agregó `NumberValue` y
  `CreatedAt`; `WorkListService.ToCatalogWorkItemDto` puebla los
  tres colores resolviendo la cadena de padres y los dos campos
  nuevos. Tests de contrato e integración pasan.
* `TASK-API-0271`: Endpoint público `GET /api/list-types` con
  `ListTypeFilterDto`, paginación, búsqueda y orden por nombre,
  siguiendo el patrón de `WorkTypesController`. Tests de contrato
  e integración pasan.

## Decisiones

* `ListCard` envuelve todo en un `Link` (no hay pills anidadas
  dentro, a diferencia de `EntityCard`, que usa el link
  estirado).
* El filtro Tipo de Lista consume `GET /api/list-types` en vez de
  cosechar de las cards, ofreciendo todos los tipos activos de la
  base.
* El adaptador `toWork` en `list-detail-page.tsx` pasa
  `numberValue: work.numberValue ?? null` y
  `createdAt: work.createdAt ?? ''`; los colores vienen del
  payload y el `WorkCard` ya los renderiza sin cambios.
