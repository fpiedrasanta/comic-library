# TASK-API-0266 — Endpoint GET /api/catalog/lists

## Objetivo

Exponer al Public Web el listado paginado de listas oficiales activas.

## Endpoint

```http
GET /api/catalog/lists
```

## Autenticación

* Requiere autenticación.
* Disponible para usuarios autenticados.
* No requiere rol Administrator.
* No utilizar `[AllowAnonymous]`.

## Query Parameters

```text
CurrentPage
PageSize
Search
PublisherId
FranchiseId
SeriesId
ListTypeId
OrderBy
Direction
```

Todos los filtros son opcionales.

Valores por defecto:

```text
CurrentPage = 1
PageSize = valor por defecto definido por el proyecto
OrderBy = CreatedAt
Direction = Desc
```

## Response

Utilizar la respuesta paginada estándar del proyecto.

Cada elemento debe contener:

```text
IdLista
NombreLista
IdTipoLista
NombreTipoLista
Color
UrlImagen
CantidadObras
```

## Comportamiento

El endpoint delega la lógica al Service.

No implementar consultas ni reglas de negocio directamente en el Controller/Endpoint.

## Restricciones

* Solo listas activas.
* Solo listas oficiales del sistema.
* Search por `Nombre OR Descripción`.
* Filtros combinados con `AND`.
* Paginación realizada por Repository.
* Sin N+1 queries.

## Documentación

Actualizar:

* `project/endpoints.md`
* documentación específica de endpoints de WorkList.

Documentar request, query parameters, response, autenticación y errores.

---

## Execution Result

**Completed:** 2026-10-05

**What was implemented:**

1. **Added `GetLists` action to `CatalogController`**:
   - Route: `GET /api/catalog/lists`
   - Parameters: `GetCatalogListsRequest` (CurrentPage, PageSize, Search, PublisherId, FranchiseId, SeriesId, ListTypeId, OrderBy, OrderDir)
   - Delegates to `IWorkListService.GetCatalogPagedAsync`
   - Returns `ApiResponse<ListResponse<CatalogListCardDto>>`

2. **Updated `CatalogController`**:
   - Added `IWorkListService` dependency injection
   - `[Authorize]` attribute (no roles required)
   - Route prefix: `api/catalog`

3. **Updated `project/endpoints/endpoints-catalog.md`**:
   - Documented both list endpoints (GET /api/catalog/lists and GET /api/catalog/lists/{id})
   - Full request/response documentation with examples
   - Authentication, query parameters, response types, notes

**Files changed:**
- `Api/Controllers/CatalogController.cs` - Added GetLists action
- `project/endpoints/endpoints-catalog.md` - Added endpoint documentation for lists

**Decisions made:**
- Reused existing `CatalogController` (not a new controller) for catalog endpoints
- `[Authorize]` without roles - any authenticated user can access
- Delegates all logic to `IWorkListService` - thin controller
- Uses `GetCatalogListsRequest` DTO for model binding
- Returns standard `ApiResponse<ListResponse<T>>` wrapper

**Tests:** 
- CatalogControllerContractTests: 12 tests pass (includes list endpoints)
- CatalogListsIntegrationTests: 20 tests pass (includes list pagination, filters, search, ordering)
- All 244 integration tests pass