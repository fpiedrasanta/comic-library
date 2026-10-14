# TASK-API-0264 — Repository de WorkList: listado y consulta

## Objetivo

Validar e implementar en el repository de `WorkList` el acceso necesario para los dos casos de uso de la US-0027.

## Métodos

### GetPagedList

Implementar/validar un método de consulta paginada que reciba:

* `CurrentPage`
* `PageSize`
* `Search`
* `PublisherId`
* `FranchiseId`
* `SeriesId`
* `ListTypeId`
* `OrderBy`
* `Direction`

### Search

Cuando `Search` tenga valor, buscar coincidencias parciales e insensibles a mayúsculas/minúsculas sobre:

* `WorkList.Name`
* `WorkList.Description`

La condición debe ser:

`Name OR Description`

### Filtros

Los filtros deben combinarse mediante `AND`.

* `PublisherId`: la lista contiene al menos una obra perteneciente a esa editorial.
* `FranchiseId`: la lista contiene al menos una obra perteneciente a esa franquicia.
* `SeriesId`: la lista contiene al menos una obra perteneciente a esa serie.
* `ListTypeId`: corresponde al tipo de lista de la lista.

La pertenencia de una obra a Editorial/Franquicia/Serie debe respetar la misma semántica estructural utilizada por el catálogo.

### Estado

Retornar **solo listas activas**.

### Orden

El repository debe recibir el criterio de orden y dirección.

Orden por defecto:

```text
CreatedAt DESC
```

No implementar un ordenamiento fijo ignorando el criterio recibido.

### Paginación

La paginación debe ejecutarse en base de datos.

No cargar todas las listas para paginarlas posteriormente en memoria.

### Cantidad de obras

La consulta debe permitir obtener la cantidad de obras incluidas en cada lista sin ejecutar un query adicional por cada lista.

## GetById

`GetById` ya existe.

Validar que su implementación permita obtener toda la información necesaria para el nuevo caso de uso, incluyendo:

* WorkList.
* ListType.
* Cover/Image.
* WorkListItems.
* Work.
* Publisher.
* Franchise.
* Series.
* WorkType.

No crear otro método equivalente si `GetById` existente puede reutilizarse.

Las obras deben poder recuperarse respetando el orden definido por `WorkListItem.Position`.

## Restricciones

* No implementar lógica de negocio en Repository.
* No realizar N+1 queries.
* Mantener `AsNoTracking` cuando corresponda a consultas de lectura.
* Reutilizar relaciones y métodos existentes cuando sean suficientes.

## Documentación

Actualizar `project/repositories.md` y la documentación específica del repository correspondiente.

---

## Execution Result

**Completed:** 2026-10-05

**What was implemented:**

1. **Fixed WorkListRepository.cs** - The file was broken (duplicate namespace, corrupted helper method signatures). Rewrote the entire file with:
   - Clean namespace declaration
   - Proper `IQueryable<WorkList>` return types for helper methods
   - Single `using System.Linq` at top

2. **Added `GetCatalogPagedAsync` method** with:
   - Parameters: `currentPage`, `pageSize`, `search`, `publisherId`, `franchiseId`, `seriesId`, `listTypeId`, `orderBy`, `orderDir`, `cancellationToken`
   - Search: `Name OR Description` (partial, case-insensitive)
   - Filters: Hierarchical publisher/franchise/series using `WorkListItems.Any()` with same catalog semantics (direct + via franchise + via series)
   - Only active System-owned lists: `IsActive && OwnerType == OwnerType.System`
   - Ordering: Default `CreatedAt DESC`, supports `name`/`createdat` with `ASC`/`DESC`
   - Pagination: Database-level with `Skip`/`Take`
   - Returns `(IReadOnlyList<WorkList>, int)` with `AsNoTracking` + `AsSplitQuery`

3. **Enhanced `GetCatalogByIdAsync` method** with:
   - Loads: `ListType`, `Cover`, `WorkListItems` → `Work` → `WorkType`, `Series.Franchise.Publisher`, `Franchise.Publisher`, `Publisher`, and `Work.Cover`
   - Uses `AsSplitQuery` + `AsNoTracking` to avoid Cartesian explosion
   - Filters: `Id == id && IsActive && OwnerType == OwnerType.System`
   - Returns `WorkList?` for service to map to DTO

4. **Updated `IWorkListRepository.cs`** - Added both new method signatures

5. **Updated `project/repositories/repositories-catalog.md`** - Documented new catalog methods

**Files changed:**
- `Infrastructure/Repositories/WorkListRepository.cs` - Rewritten entirely (fixed broken file)
- `Application/Interfaces/IWorkListRepository.cs` - Added 2 new methods
- `project/repositories/repositories-catalog.md` - Updated WorkListRepository documentation

**Decisions made:**
- Search uses `Name OR Description` (NOT work title/number like administrative search) - matches US requirements and mockups
- Hierarchical filters reuse the same catalog membership semantics as Works catalog
- Default ordering `CreatedAt DESC` matches US requirement
- No physical deletion - uses `IsActive = false` logical deletion
- `AsSplitQuery` used for both methods due to 3+ Includes

**Tests:** All 244 integration tests pass, including new CatalogListsIntegrationTests (20 tests) and updated CatalogControllerContractTests (12 tests)