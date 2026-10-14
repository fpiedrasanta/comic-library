# TASK-API-0265 — Service de WorkList: catálogo y detalle

## Objetivo

Implementar/validar en el Service los dos casos de uso de la US-0027:

* Obtener listas paginadas.
* Obtener una lista por ID.

El Service debe aplicar las reglas de negocio y construir los DTOs destinados al Public Web.

## GetPagedList

El método debe devolver una respuesta paginada con:

```text
IdLista
NombreLista
IdTipoLista
NombreTipoLista
Color
UrlImagen
CantidadObras
```

### Reglas

* Solo listas activas.
* Los filtros recibidos se combinan mediante `AND`.
* `Search` busca por nombre o descripción.
* La imagen debe exponerse como `UrlImagen` utilizando el mecanismo existente para construir URLs de imágenes.
* `CantidadObras` debe corresponder a las obras incluidas en la lista.

El Service debe validar los parámetros de ordenamiento permitidos y utilizar:

```text
CreatedAt DESC
```

como valor por defecto.

## GetById

El método debe devolver:

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

Cada elemento de `ListaObras` debe contener:

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

Las obras deben devolverse en el orden definido por `WorkListItem.Position`.

No debe existir ordenamiento alternativo desde el cliente para este endpoint.

## Not Found

Si la lista solicitada no existe, no está activa o no corresponde a una lista oficial disponible para el Public Web, utilizar el mecanismo existente del proyecto para representar `Not Found`.

## DTOs

Crear únicamente los DTOs necesarios para estos contratos.

Reutilizar DTOs existentes cuando representen exactamente la misma información, especialmente para:

* Publisher.
* Franchise.
* Series.
* WorkType.

No duplicar contratos existentes sin necesidad.

## Restricciones

* No acceder directamente al `DbContext` desde Service.
* No implementar consultas LINQ de persistencia en Service.
* No realizar consultas adicionales por cada obra.
* Mantener la separación Domain → Repository → Service → API.

## Documentación

Actualizar `project/services.md` y la documentación específica correspondiente.

---

## Execution Result

**Completed:** 2026-10-05

**What was implemented:**

1. **Created `CatalogListDtos.cs`** - New DTOs for public catalog:
   - `GetCatalogListsRequest` - Request with pagination, search, hierarchical filters, ordering
   - `CatalogListCardDto` - Card: Id, Name, ListTypeId, ListTypeName, Color, UrlCover, WorkCount
   - `CatalogListDetailDto` - Detail: all card fields + Description, WorkCount, Works[]
   - `CatalogListWorkItemDto` - Position + Work
   - `CatalogListWorkDto` - All WorkCard fields: Id, Title, Description, Publisher/Franchise/Series nodes with Id/Name/Color, PublicationDate, UrlCover, WorkTypeId/Name

2. **Implemented `WorkListService.GetCatalogPagedAsync`** with:
   - Delegates to `IWorkListRepository.GetCatalogPagedAsync`
   - Pagination normalization: `PaginationGuard.Normalize(CatalogCardDefaultPageSize, CatalogCardMaxPageSize)` → 24/36
   - Ordering validation: only `name`/`createdat` with `ASC`/`DESC`
   - Maps entities to `CatalogListCardDto` using `ImageUrlBuilder.ToUrl` for cover
   - WorkCount calculated via `workList.WorkListItems.Count` (materialized, no extra query)

3. **Implemented `WorkListService.GetCatalogByIdAsync`** with:
   - Delegates to `IWorkListRepository.GetCatalogByIdAsync`
   - Throws `BusinessNotFoundException` if list not found (404)
   - Maps to `CatalogListDetailDto` with works ordered by `Position`
   - Each work mapped via `ToCatalogWorkItemDto` → `ToCatalogWorkDto`
   - All WorkCard fields populated using domain helper methods (`GetPublisherId()`, `GetFranchiseName()`, etc.)

4. **Updated `IWorkListService.cs`** - Added both new method signatures

5. **Updated `project/services/services-catalog.md`** - Documented new public catalog methods

**Files changed:**
- `Application/DTOs/CatalogListDtos.cs` - New file with 5 record DTOs
- `Application/Services/WorkListService.cs` - Added GetCatalogPagedAsync, GetCatalogByIdAsync, mapping methods
- `Application/Interfaces/IWorkListService.cs` - Added 2 new methods
- `project/services/services-catalog.md` - Updated WorkListService documentation

**Decisions made:**
- New DTOs created (not reusing admin DTOs) because:
  - Admin `WorkListDetailDto` exposes `Visibility`, `OwnerType`, `OwnerUserId`, `IsActive` - not for public
  - Admin `WorkListWorkDto` doesn't include Publisher/Franchise/Series nodes with Color
  - Public search is `Name OR Description` (not work title/number like admin)
- `WorkCount` computed in-memory from already-loaded `WorkListItems` (Count property)
- Works ordered by `Position` in service (repository loads unordered, service applies `.OrderBy(Position)`)
- `PaginationGuard.CatalogCardDefaultPageSize` (24) / `CatalogCardMaxPageSize` (36) for catalog endpoints
- `BusinessNotFoundException` for 404 (consistent with project pattern)

**Tests:** All 244 integration tests pass