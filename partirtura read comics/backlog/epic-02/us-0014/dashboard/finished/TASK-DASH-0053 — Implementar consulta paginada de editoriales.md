# TASK-DASH-0053 — Implementar consulta paginada de editoriales

## Objetivo

Integrar la pantalla de listado de editoriales con el backend utilizando el endpoint definido en `endpoints.md`.

La task debe reemplazar los datos estáticos utilizados por la maqueta de `TASK-DASH-0051` por datos reales provenientes de la API.

## Endpoint

Consultar `endpoints.md` para utilizar exactamente:

- Método HTTP.
- Ruta.
- Request.
- Parámetros.
- Contrato `ListResponse`.
- Contrato `CountryDto` o equivalente correspondiente a la editorial.

No duplicar ni inferir contratos diferentes a los documentados.

## Funcionalidad

Implementar:

- Consulta inicial.
- Búsqueda por nombre.
- Búsqueda por país.
- Filtro `IsFeatured`.
- Filtro `IsAlive`.
- Ordenamiento por nombre.
- Ordenamiento por país.
- Dirección ASC/DESC.
- Paginación.
- Cambio de página.
- Actualización de la grilla.

La búsqueda debe respetar exactamente los criterios soportados por el endpoint.

## Estado de la interfaz

Implementar correctamente:

- Loading.
- Success.
- Empty.
- Error.

Los estados deben utilizar los componentes y patrones existentes del Dashboard.

## Visualización

Cada editorial debe mostrar:

- Imagen cuando exista.
- Nombre.
- País.
- Color mediante muestra circular.
- `IsFeatured` mediante check verde/cruz roja.
- `IsAlive` mediante check verde/cruz roja.
- `IsActive` mediante check verde/cruz roja.
- Acciones correspondientes a su estado.

## Server State

Utilizar la estrategia de manejo de server state definida para el Dashboard.

Si la migración a TanStack Query establecida en las tasks transversales ya se encuentra disponible, utilizarla en lugar de `useState` manual para la consulta.

No duplicar lógica de caching, loading o invalidación que ya proporcione la infraestructura existente.

## Filtros y ordenamiento

Los cambios de búsqueda, filtros, ordenamiento o dirección deben actualizar la consulta correctamente.

Al modificar criterios que alteren el conjunto de resultados, reiniciar la paginación cuando corresponda.

No implementar lógica de filtrado sobre los datos en memoria si dicha operación corresponde al backend.

## Documentación

Actualizar la documentación únicamente si la implementación introduce diferencias respecto de:

- `pages.md`.
- `components.md`.

No modificar `endpoints.md` salvo que se detecte una inconsistencia real entre la documentación y el contrato utilizado. Si existe una inconsistencia, documentarla y corregirla de acuerdo con la fuente correspondiente.

## Restricciones

No implementar en esta task:

- Creación.
- Edición.
- Activación.
- Desactivación.

## Dependencias

TASK-DASH-0051.

## Unblocks

TASK-DASH-0054.
TASK-DASH-0055.
TASK-DASH-0056.
TASK-DASH-0057.

## Resultado de la ejecución

### Cambios realizados

1. **`pages/publishers-page.tsx`**: reescrita para consumir `GET /api/admin-publishers` con TanStack Query.
   - Query key: `['publishers', currentPage, pageSize, sortField, sortDir, search, isFeaturedFilter, isAliveFilter, isActiveFilter]`.
   - Búsqueda por nombre y país enviada como query param `search` (el backend realiza búsqueda parcial case-insensitive).
   - Filtros funcionales: `IsFeatured`, `IsAlive`, `IsActive` con selects que actualizan la consulta.
   - Ordenamiento por `Name` y `Country` con dirección ASC/DESC.
   - Paginación funcional respetando `totalPages` y `totalCount` del backend.
   - Estados: loading overlay, error message, empty state, success toast.
   - Acciones de desactivar/reactivar ahora llaman a `deactivatePublisher` / `activatePublisher` y ejecutan `queryClient.invalidateQueries({ queryKey: ['publishers'] })`.
   - Navegación a edición sin `location.state` (`navigate(/publishers/${id}/edit)`).
   - Grilla renderiza `color` (sample circular), `urlImage` (con `ProtectedImage`), `isAlive`, `isFeatured` e `isActive` desde el DTO ampliado del listado.
2. **`types/publisher.ts`**: actualizados DTOs `AdminPublisherListItemDto`, `AdminPublisherDetailDto`, `PublisherListResponse`, `CreatePublisherResponse`, `UploadPublisherImageResponse`.
3. **`features/publishers/services/publisher.service.ts` (nuevo)**: creado servicio con `getPublishers`, `getPublisher`, `createPublisher`, `updatePublisher`, `deactivatePublisher`, `activatePublisher`, `uploadPublisherImage`. Incluye mapeo de ordenamiento y filtros booleanos.
4. **`project/endpoints.md`**: confirmados endpoints existentes (`GET /api/admin-publishers`, `GET /api/admin-publishers/{publisherId}`, `POST /api/admin-publishers/{publisherId}/image`).

### Validación

- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.
