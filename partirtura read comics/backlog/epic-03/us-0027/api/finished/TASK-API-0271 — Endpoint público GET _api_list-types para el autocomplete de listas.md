# TASK-API-0271 — Endpoint público GET /api/list-types para el autocomplete de listas

## Objetivo

Exponer los tipos de lista activos en un endpoint público (`[Authorize]` sin rol `Administrator`) para que el autocomplete de `/lists` ofrezca los 85 tipos de la base paginado, filtrado y con order by, no solo los que aparecen en las listas cargadas.

Dependencia de `TASK-PUBLIC-WEB-0070` (bloqueada por esto).

## Precedente: `WorkTypesController`

* `GET /api/work-types` — público, autenticado, sin rol admin.
* Devuelve `WorkTypeFilterDto` (`Id`, `Name`).
* Usa `IWorkTypeService.GetPublicPagedAsync` que filtra `IsActive = true`.

## Cambios

### Nuevo DTO: `ListTypeFilterDto` (`Application/DTOs/CatalogFilterDtos.cs`)

```csharp
public record ListTypeFilterDto(
    long Id,
    string Name);
```

### Nuevo Service: `IListTypeService.GetPublicPagedAsync`

Añadir al interfaz y a la implementación (`ListTypeService`):

```csharp
Task<ListResponse<ListTypeFilterDto>> GetPublicPagedAsync(ListRequest request, CancellationToken cancellationToken = default);
```

Implementación: misma paginación que `GetPublicPagedAsync` de `WorkTypeService`, filtrando `isActive = true`, orden por `Name ASC`.

### Nuevo Controller: `ListTypesController` (`Api/Controllers/ListTypesController.cs`)

```csharp
[ApiController]
[Route("api/list-types")]
[Authorize]
public class ListTypesController : ControllerBase
{
    private readonly IListTypeService _listTypeService;

    public ListTypesController(IListTypeService listTypeService)
    {
        _listTypeService = listTypeService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] ListRequest request, CancellationToken cancellationToken)
    {
        var result = await _listTypeService.GetPublicPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<ListTypeFilterDto>>(true, "OK", StatusCodes.Status200OK, result));
    }
}
```

### Registro

* DI: el service ya existe (`ListTypeService`).
* Controller automático por convención.

### Documentación

Actualizar `project/endpoints/endpoints-list-types.md`:
* Endpoint público `GET /api/list-types` con parámetros de paginación/búsqueda.
* Response: `ListTypeFilterDto` array.
* Autenticación: requerido, sin rol admin.

## Tests

* Contrato: `ListTypesControllerContractTests` — status, auth, shape, paginación.
* Integración: `CatalogListsIntegrationTests` — llamada desde el Frontend, filtra activos, orden por nombre.

## Reglas

* Seguir `backend-coding-rules.md`.
* No crear lógica duplicada: reutilizar `GetPagedAsync` del repository.
* No exponer `IsActive` en el DTO público (el filtro ya garantiza activos).

## Frontend (cuando el endpoint exista)

En `lists-page.tsx`, `useEntityFilterOptions` ya tiene la infraestructura para consumirlo: solo cambiar `listTypeOptions` para que llame a `/api/list-types` en vez de cosechar de las cards, y el autocomplete dejará de depender de los datos cargados.

---

## Execution Result

**Completed:** 2026-10-06

**What was implemented:**

1. **Created `ListTypeFilterDto`** (`Application/DTOs/CatalogFilterDtos.cs`): Added `ListTypeFilterDto(Id, Name)` record for public response.

2. **Added `GetPublicPagedAsync` to `IListTypeService`** (`Application/Interfaces/IListTypeService.cs`): New method signature matching `WorkTypeService` pattern.

3. **Implemented `GetPublicPagedAsync` in `ListTypeService`** (`Application/Services/ListTypeService.cs`):
   - Same pagination as `WorkTypeService.GetPublicPagedAsync`
   - Filters `IsActive = true` (hardcoded)
   - Order by `Name ASC` (default)
   - Uses `PaginationGuard.CatalogFilterMaxPageSize` (24)

4. **Created `ListTypesController`** (`Api/Controllers/ListTypesController.cs`):
   - Route: `api/list-types`
   - `[Authorize]` without roles
   - `[HttpGet]` returns `ApiResponse<ListResponse<ListTypeFilterDto>>`

5. **Updated `CatalogFilterControllerContractTests`** (`tests/Infrastructure.Tests/Integration/CatalogFilterControllerContractTests.cs`):
   - Added `ListTypesController` to `Controllers` theory data
   - Added `ListTypesController` to `CatalogFilters_ExposeGetWithListRequest` theory data
   - Added `ListTypeFilterDto` to `FilterDtos_ExposeOnlyPublicCatalogFields`

6. **Created `ListTypesIntegrationTests`** (`tests/Infrastructure.Tests/Integration/ListTypesIntegrationTests.cs`): 6 integration tests covering:
   - Only active types returned
   - Order by name ascending
   - Search by name (partial, case-insensitive)
   - Pagination works correctly
   - Page size capped at `CatalogFilterMaxPageSize` (24)
   - Public DTO shape verification (no `IsActive`)

7. **Updated `project/endpoints/endpoints-list-types.md`**: Added public endpoint documentation for `GET /api/list-types`.

**Files changed:**
- `Application/DTOs/CatalogFilterDtos.cs` - Added `ListTypeFilterDto`
- `Application/Interfaces/IListTypeService.cs` - Added `GetPublicPagedAsync`
- `Application/Services/ListTypeService.cs` - Implemented `GetPublicPagedAsync`
- `Api/Controllers/ListTypesController.cs` - New controller
- `tests/Infrastructure.Tests/Integration/CatalogFilterControllerContractTests.cs` - Updated contract tests
- `tests/Infrastructure.Tests/Integration/ListTypesIntegrationTests.cs` - New integration tests
- `project/endpoints/endpoints-list-types.md` - Added public endpoint docs

**Results:**
- All 252 integration tests pass (244 original + 8 new)
- Build succeeds with 0 warnings, 0 errors
- Follows exact `WorkTypesController` precedent pattern