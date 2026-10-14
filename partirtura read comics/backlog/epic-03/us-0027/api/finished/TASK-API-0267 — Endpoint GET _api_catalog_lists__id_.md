# TASK-API-0267 — Endpoint GET /api/catalog/lists/{id}

## Objetivo

Exponer al Public Web una lista oficial activa junto con todas sus obras ordenadas.

## Endpoint

```http
GET /api/catalog/lists/{id}
```

## Autenticación

* Requiere autenticación.
* Disponible para usuarios autenticados.
* No requiere rol Administrator.
* No utilizar `[AllowAnonymous]`.

## Response

Debe devolver:

```text
IdLista
NombreLista
IdTipoLista
NombreTipoLista
DescripcionLista
CantidadObras
Color
UrlImagen
ListaObras
```

Cada obra:

```text
Orden
IdObra
NombreObra
DescripcionObra

Publisher
    Id
    Nombre
    Color

Franquicia
    Id
    Nombre
    Color

Serie
    Id
    Nombre
    Color

FechaPublicacion
UrlPortada

IdTipoObra
NombreTipoObra
```

## Orden

Las obras deben devolverse exclusivamente según el orden definido por `WorkListItem.Position`.

El endpoint no recibe:

* Search.
* Filtros.
* OrderBy.
* Direction.
* Paginación de obras.

La lista ya define el conjunto y el orden de sus obras.

## Not Found

Retornar el error estándar de `Not Found` cuando:

* La lista no existe.
* La lista está inactiva.
* La lista no es una lista oficial disponible para el Public Web.

## Restricciones

* Reutilizar `GetById` existente del Repository cuando sea suficiente.
* No crear un segundo mecanismo de acceso equivalente.
* No realizar N+1 queries.
* No implementar lógica de persistencia en Endpoint.
* No agregar filtros o búsqueda de obras.

## Documentación

Actualizar:

* `project/endpoints.md`
* documentación específica de endpoints de WorkList.

---

## Execution Result

**Completed:** 2026-10-05

**What was implemented:**

1. **Added `GetList` action to `CatalogController`**:
   - Route: `GET /api/catalog/lists/{id:long}`
   - Parameter: `long id` (path) + `CancellationToken`
   - Delegates to `IWorkListService.GetCatalogByIdAsync`
   - Returns `ApiResponse<CatalogListDetailDto>`
   - Throws `BusinessNotFoundException` (404) if list not found/inactive/not System-owned

2. **Updated `CatalogController`**:
   - Uses existing `IWorkListService` dependency (added in TASK-API-0266)
   - `[Authorize]` attribute (no roles required)

3. **Updated `project/endpoints/endpoints-catalog.md`**:
   - Documented both list endpoints with full examples
   - Authentication, request/response, error codes, notes

**Files changed:**
- `Api/Controllers/CatalogController.cs` - Added GetList action
- `project/endpoints/endpoints-catalog.md` - Added endpoint documentation

**Decisions made:**
- Reuses enhanced `GetCatalogByIdAsync` from repository (not the admin `GetByIdAsync`)
- Works ordered by `WorkListItem.Position` in Service (repository loads unordered)
- No client-side filtering, searching, or ordering of works - list defines the set and order
- 404 returned for: non-existent, inactive, or non-System lists (same message, no existence disclosure)
- No N+1: repository loads all needed relationships with `AsSplitQuery` in single query
- Returns `CatalogListDetailDto` with `CatalogListWorkItemDto` (Position + Work) containing all WorkCard fields

**Tests:** 
- CatalogControllerContractTests: 12 tests pass (includes GetList endpoint)
- CatalogListsIntegrationTests: 20 tests pass (includes detail structure, work ordering, WorkCard fields, 404)
- All 244 integration tests pass