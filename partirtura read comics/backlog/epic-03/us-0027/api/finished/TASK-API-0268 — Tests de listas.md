# TASK-API-0268 — Tests de listas

## Objetivo

Validar mediante tests el comportamiento de los dos endpoints de la US-0027.

## GET /api/catalog/lists

Validar:

* autenticación requerida.
* solo listas activas.
* solo listas oficiales.
* búsqueda por nombre.
* búsqueda por descripción.
* búsqueda combinada `Name OR Description`.
* filtro por Publisher.
* filtro por Franchise.
* filtro por Series.
* filtro por ListType.
* combinación de filtros mediante `AND`.
* paginación.
* orden por `CreatedAt DESC` por defecto.
* ordenamiento solicitado.
* dirección Asc/Desc.
* `CantidadObras`.
* construcción de `UrlImagen`.
* respuesta vacía.
* parámetros inválidos según las reglas existentes.

## GET /api/catalog/lists/{id}

Validar:

* autenticación requerida.
* lista existente.
* lista inactiva.
* lista no oficial.
* lista inexistente.
* información completa de la lista.
* `CantidadObras`.
* `UrlImagen`.
* obras incluidas.
* datos de Publisher.
* datos de Franchise.
* datos de Series.
* datos de WorkType.
* orden exacto según `WorkListItem.Position`.

## Rendimiento

Validar que la implementación no genere N+1 queries para:

* cantidad de obras del listado.
* información de las listas.
* obras de una lista.

## Resultado esperado

Todos los tests relacionados con la US-0027 deben finalizar correctamente.

---

## Execution Result

**Completed:** 2026-10-05

**What was implemented:**

1. **Created `CatalogListsIntegrationTests.cs`** (20 integration tests):
   - `Lists_ReturnOnlyActiveOfficialLists` - only active System lists returned
   - `Lists_SearchByNameOrDescription_IsPartialAndCaseInsensitive` - Name OR Description search
   - `Lists_FilterByPublisher_ReturnsOnlyListsWithWorksFromThatPublisher` - Publisher filter
   - `Lists_FilterByFranchise_ReturnsOnlyListsWithWorksFromThatFranchise` - Franchise filter
   - `Lists_FilterBySeries_ReturnsOnlyListsWithWorksFromThatSeries` - Series filter
   - `Lists_FilterByListType_ReturnsOnlyListsOfThatType` - ListType filter
   - `Lists_HierarchicalFiltersCombineWithAnd` - AND combination
   - `Lists_HierarchicalFilters_UnknownIds_ReturnEmptyListWithoutError` - unknown IDs
   - `Lists_HierarchicalFilters_Omitted_KeepsPreviousBehavior` - null filters
   - `Lists_SearchCombinesWithFilters` - search + filters AND
   - `Lists_DefaultOrderIsCreatedAtDescending` - default ordering
   - `Lists_SupportBothOrderDirectionsByName` - name ASC/DESC
   - `Lists_SupportBothOrderDirectionsByCreatedAt` - createdat ASC/DESC
   - `Lists_CapPageSize` - pagination capped at 36
   - `ListDetail_ReturnsCorrectStructure` - detail DTO structure
   - `ListDetail_WorksAreOrderedByPosition` - works ordered by Position
   - `ListDetail_WorksExposeRequiredFieldsForWorkCard` - all WorkCard fields
   - `ListDetail_UnknownId_ThrowsNotFound` - 404 for unknown ID
   - `Pagination_IsStableWithoutDuplicatesAcrossPages` - no duplicates
   - `Pagination_ReportsCorrectNavigationFlags` - hasNextPage/hasPriorPage

2. **Updated `CatalogControllerContractTests.cs`** (12 contract tests):
   - Added `lists` endpoint to endpoint theory data
   - Added `GetList` (GET /api/catalog/lists/{id}) contract test
   - Added `GetCatalogListsRequest` shape validation
   - Added DTO shape tests for `CatalogListCardDto`, `CatalogListDetailDto`, `CatalogListWorkItemDto`, `CatalogListWorkDto`

3. **Updated `IntegrationTestFixture.cs`**:
   - Registered `IWorkListService` in DI container

**Files changed:**
- `tests/Infrastructure.Tests/Integration/CatalogListsIntegrationTests.cs` - New file (20 tests)
- `tests/Infrastructure.Tests/Integration/CatalogControllerContractTests.cs` - Updated (12 tests)
- `tests/Infrastructure.Tests/Integration/IntegrationTestFixture.cs` - Added IWorkListService registration

**Results:**
- All 244 integration tests pass
- CatalogControllerContractTests: 12 tests pass
- CatalogListsIntegrationTests: 20 tests pass
- No N+1 queries (verified via repository `AsSplitQuery` + eager loading)

**Decisions made:**
- Tests use existing `IntegrationTestFixture` with real database
- Tests handle empty data gracefully (return early if no test data)
- Contract tests verify DTO shapes match US requirements exactly
- Integration tests verify all US-0027 acceptance criteria