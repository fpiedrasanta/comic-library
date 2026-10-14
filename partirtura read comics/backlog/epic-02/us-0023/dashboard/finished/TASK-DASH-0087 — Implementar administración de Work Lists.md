# TASK-DASH-0087 — Implementar administración de Work Lists

## Objetivo

Implementar la administración de Listas de Obras (WorkList) en el Dashboard utilizando la maqueta como referencia visual y respetando la arquitectura, componentización y enfoque orientado a objetos utilizados por el Dashboard.

## Referencia visual

Maqueta:

`C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\work-lists.html`

La maqueta define la referencia visual de la página.

Mantener la línea estética de las demás páginas del Dashboard.

La grilla debe contemplar:

* Cover;
* CreatedAt;
* Name;
* Type;
* IsActive.

## Documentación

Leer antes de implementar:

* `project/endpoints.md`
* `project/pages.md`
* `project/components.md`

Revisar también las páginas y componentes existentes de administración, especialmente Roles, Etiquetas y Tipos de Lista.

Actualizar al finalizar:

* `project/pages.md`
* `project/components.md`

## Arquitectura

Implementar la funcionalidad dentro de una feature propia de Work Lists.

No colocar todo el HTML de la maqueta dentro de `WorkListsPage`.

La Page debe encargarse de composición y estado de alto nivel.

Extraer a componentes las partes con responsabilidad propia, por ejemplo:

* toolbar;
* búsqueda;
* filtros;
* tabla;
* paginación;
* estados de loading, vacío y error;
* acciones de la fila;
* confirmaciones.

Reutilizar componentes existentes cuando corresponda.

No duplicar componentes que ya existan.

Mantener el enfoque orientado a objetos utilizado en la implementación anterior del Dashboard.

La comunicación con la API debe estar encapsulada en el servicio de la feature y no distribuida entre los componentes visuales.

La estructura debe respetar la organización por **features + components** utilizada por el Dashboard.

## Funcionalidad

Implementar:

* Ruta `/work-lists`.
* Entrada correspondiente en la navegación.
* Listado paginado de Work Lists oficiales.
* Búsqueda única por:
  * nombre de la lista;
  * título de una obra;
  * número de una obra.
* Filtro por `FranchiseId`.
* Filtro por `PublisherId`.
* Filtro por `ListTypeId`.
* Filtro por `IsActive`.
* Filtro `CreatedAtFrom`.
* Filtro `CreatedAtTo`.
* Ordenamiento por `Name`.
* Ordenamiento por `CreatedAt`.
* Orden ascendente y descendente.
* Navegación hacia creación.
* Navegación hacia edición.
* Desactivación.
* Reactivación.
* Estados de loading, vacío y error.
* Confirmación para desactivar/reactivar.

`OwnerType` y `Visibility` no deben aparecer como filtros del listado.

El listado debe representar exclusivamente listas oficiales del sistema.

## API

Utilizar los endpoints definidos por Backend para Work Lists.

Endpoints esperados en:

* `project/endpoints.md`
* `project/endpoints-work-lists.md`

Respetar los contratos existentes.

Centralizar la comunicación mediante el servicio correspondiente de la feature.

No implementar lógica de negocio en los componentes visuales.

## Filtros

Los filtros de:

* Franchise;
* Publisher;
* List Type

deben consumir las fuentes de datos existentes correspondientes para permitir seleccionar sus valores.

No implementar una lógica de filtrado local sobre los resultados.

Los filtros deben formar parte de la consulta enviada al backend.

## Reutilización

Revisar especialmente:

* componentes de Roles;
* componentes de Etiquetas;
* componentes de List Types;
* componentes de Personas;
* componentes genéricos existentes para tablas, modales, filtros, paginación y confirmaciones.

No crear una segunda implementación de un componente que ya pueda reutilizarse.

## Estructura esperada

Organizar la feature siguiendo el patrón existente:

```text
features/
└── work-lists/
    ├── components/
    ├── pages/
    ├── services/
    └── types/
```

La estructura concreta debe adaptarse a las convenciones actuales del proyecto.

No crear abstracciones compartidas prematuramente.

## Validación

Verificar:

* Compilación TypeScript.
* Build de Vite.
* Navegación a `/work-lists`.
* Listado.
* Paginación.
* Búsqueda por nombre de lista.
* Búsqueda por título de obra.
* Búsqueda por número.
* Filtro por Franchise.
* Filtro por Publisher.
* Filtro por List Type.
* Filtro por estado.
* Filtros por fecha.
* Orden por nombre.
* Orden por fecha.
* Ambos sentidos de orden.
* Navegación hacia creación.
* Navegación hacia edición.
* Desactivación.
* Reactivación.
* Manejo de errores.
* Integración con API.
* Consistencia visual con la maqueta.
* Consistencia visual con las demás páginas.
* Correcta separación Page / Feature / Components.
* Enfoque orientado a objetos consistente con la implementación anterior.
* Ausencia de HTML monolítico dentro de la Page.
* Ausencia de lógica de API dentro de componentes visuales.

Actualizar `pages.md` y `components.md` con la estructura final.

## Resultado de ejecución

### Implementado

1. **Feature Work Lists creada** en `dashboard/dashboard/features/work-lists/`:
   - `types/work-list.ts` — Tipos TypeScript para WorkListItemDto, WorkListListResponse, WorkListDetailDto, CreateWorkListRequest, WorkListWorkDto, WorkVisibility.
   - `services/work-list.service.ts` — Servicio con funciones getWorkLists, getWorkListById, createWorkList, updateWorkList, deactivateWorkList, activateWorkList que consumen `/api/admin-work-lists`.
   - `pages/work-lists-page.tsx` — Página de listado con TanStack Query, búsqueda, filtros (franchise, publisher, list type, estado, rango de fechas), ordenamiento por nombre/fecha con ambos sentidos, paginación, navegación a creación/edición, y modales de confirmación para desactivar/reactivar.
   - `components/work-lists-toolbar.tsx` — Toolbar con búsqueda unificada y todos los filtros.
   - `components/work-lists-table.tsx` — Tabla con columnas Cover, Fecha creación, Nombre, Tipo, Estado, Acciones.
   - `components/work-lists-pagination.tsx` — Controles de paginación.
   - `components/work-list-state-modal.tsx` — Modal de confirmación para desactivar/reactivar.

2. **Routes registradas** en `dashboard/dashboard/app/router/routes.tsx`:
   - `/work-lists` → WorkListsPage

3. **Navegación agregada** en `dashboard/dashboard/pages/dashboard-layout.tsx`:
   - "Listas de Obras" con icono Layers de lucide-react.

4. **Documentación actualizada**:
   - `project/pages.md` — Agregada entrada `/work-lists`.
   - `project/components/dashboard-components.md` — Agregados todos los componentes de la feature.

### Decisiones tomadas

- La página de listado navega a `/work-lists/:id/edit` para edición. La ruta `/work-lists/create` está registrada pero pendiente de TASK-DASH-0088.
- El listado muestra exclusivamente listas oficiales del sistema (OwnerType = System).
- Se reutilizan los servicios existentes de franchises, publishers y list-types para los filtros desplegables.

### Validación

- TypeScript: compilación sin errores
- Vite build: exitoso (1754 módulos transformados)
- La navegación a /work-lists, listado, paginación, búsqueda, filtros y ordenamiento están implementados en el frontend
- Desactivación/reactivación con confirmación: implementada
- Correcta separación Page / Components
- Sin lógica de API en componentes visuales
- Sin HTML monolítico en la Page

### Nota

- La ruta `/work-lists/create` está registrada y navega a WorkListFormPage implementado en TASK-DASH-0088.
- El contrato de API está documentado en `project/endpoints/endpoints-work-lists.md`. El frontend implementa los servicios contra los endpoints definidos: `GET /api/admin-work-lists`, `GET /api/admin-work-lists/{id}`, `POST /api/admin-work-lists`, `PUT /api/admin-work-lists/{id}`, `DELETE /api/admin-work-lists/{id}`, `POST /api/admin-work-lists/{id}/activate`.
- **Dependencia resuelta**: TASK-API-0220 (repositorio), TASK-API-0221 (servicio), TASK-API-0222 (endpoints controller), TASK-API-0223 (validación) están finalizados. El backend está implementado y verificado (compilación sin errores, 79 tests pasando).

### Correcciones de contrato

- **Query param `page`**: El servicio `getWorkLists` envía `page` (no `currentPage`) según el contrato documentado en `endpoints-work-lists.md`. El parámetro `orderDirection` y los valores `orderBy` (Name, CreatedAt) también coinciden con el contrato.
- El servicio `searchWorks` usa `currentPage` según el contrato de `endpoints-works.md` (endpoint diferente, convención diferente).
- **Stale data on navigation**: Se agregó `refetchOnMount: true` y `gcTime: 0` a las queries del listing page para forzar fetch fresco al retornar después de navegar a otras secciones.
- **Searchable filter selects**: Los combos de Franchise, Editorial y Tipo de lista en el toolbar fueron reemplazados por componentes de búsqueda con paginación (`FranchiseSearchSelect`, `PublisherSearchSelect`, `ListTypeSearchSelect`), permitiendo buscar items en páginas posteriores.
