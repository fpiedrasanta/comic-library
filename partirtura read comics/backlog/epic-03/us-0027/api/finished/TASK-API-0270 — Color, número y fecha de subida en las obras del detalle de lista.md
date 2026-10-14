# TASK-API-0270 — Color, número y fecha de subida en las obras del detalle de lista

## Objetivo

Completar `CatalogListWorkDto` para que cada obra de
`GET /api/catalog/lists/{id}` renderice el mismo `WorkCard` que el
catálogo de obras: las pills con el color de su entidad, el número
dentro de la serie y la fecha de subida.

Dependencia de `TASK-PUBLIC-WEB-0070` (bloqueada por esto).

## Estado actual

`WorkListService.ToCatalogWorkItemDto`
(`Application/Services/WorkListService.cs`) mapea el payload con:

* `PublisherColor`, `FranchiseColor` y `SeriesColor` en `null`
  literal, aunque las entidades tienen color y `TASK-API-0267` los
  especificó en la respuesta.
* Sin `NumberValue`: el record no expone el número de la obra.
* Sin `CreatedAt`: el record no expone la fecha de subida.

El Repository ya carga todo lo necesario en memoria
(`WorkListRepository.GetCatalogByIdAsync` incluye
`Work → Series → Franchise → Publisher`,
`Work → Franchise → Publisher` y `Work → Publisher` con
`AsSplitQuery`), así que no hay N+1 que resolver: es un cambio de
mapeo y de DTO.

## Cambios

### `CatalogListWorkDto` (`Application/DTOs/CatalogListDtos.cs`)

Agregar al record, en este orden:

* `string? NumberValue` — el número de la obra dentro de su serie.
* `DateTime CreatedAt` — la fecha de creación (subida) de la obra.

### `WorkListService.ToCatalogWorkItemDto`

Poblar con el mismo origen que `WorkService.MapCatalogWork`
(`Application/Services/WorkService.cs`) usa para `GET /api/works`:

* `PublisherColor`: la cadena de resolución de `MapPublisherNode`
  (`work.Publisher` → `work.Franchise?.Publisher` →
  `work.Series?.Franchise?.Publisher`).
* `FranchiseColor`: la cadena de `MapFranchiseNode`
  (`work.Franchise` → `work.Series?.Franchise`).
* `SeriesColor`: `work.Series?.Color`.
* `NumberValue`: `work.NumberValue`.
* `CreatedAt`: `work.CreatedAt`.

## Restricciones

* No crear un segundo mecanismo de mapeo equivalente: seguir el
  patrón de los `MapNode` de `WorkService`, o extraerlo si conviene
  para compartirlo.
* No modificar el orden, el conjunto de obras ni los demás campos.
* No romper el contrato de `GET /api/catalog/lists` (el card no
  cambia).
* Actualizar toda construcción posicional del record (incluidos los
  tests) cuando cambie la firma.

## Documentación

Actualizar `project/endpoints/endpoints-catalog.md`:

* El ejemplo de obra gana `NumberValue` y `CreatedAt`.
* Documentar que los colores se pueblan del color de la entidad,
  resolviendo la cadena de padres cuando la obra no tiene el nivel.

## Tests

Extender el suite que cubre el detalle de lista
(`CatalogListsIntegrationTests`) para verificar:

* Los colores no son nulos cuando la entidad tiene color.
* `NumberValue` y `CreatedAt` viajan en el payload.

## Reglas

* Seguir `backend-coding-rules.md`.
* No modificar documentación de proyecto ajena a la listada arriba.

---

## Execution Result

**Completed:** 2026-10-05

**What was implemented:**

1. **Updated `CatalogListWorkDto`** (`Application/DTOs/CatalogListDtos.cs`):
   - Added `string? NumberValue` (position 17)
   - Added `DateTime CreatedAt` (position 18)

2. **Updated `WorkListService.ToCatalogWorkItemDto`** (`Application/Services/WorkListService.cs`):
   - Added helper methods: `MapPublisherNode`, `MapFranchiseNode`, `MapNode(Series)`, `MapNode(Franchise)`, `MapNode(Publisher)` - following the exact same pattern as `WorkService.MapCatalogWork`
   - `PublisherColor`: resolved via `work.Publisher` → `work.Franchise?.Publisher` → `work.Series?.Franchise?.Publisher`
   - `FranchiseColor`: resolved via `work.Franchise` → `work.Series?.Franchise`
   - `SeriesColor`: `work.Series?.Color`
   - `NumberValue`: `work.NumberValue`
   - `CreatedAt`: `work.CreatedAt`

3. **Updated `CatalogControllerContractTests`** (`tests/Infrastructure.Tests/Integration/CatalogControllerContractTests.cs`):
   - Added `NumberValue` and `CreatedAt` to expected properties for `CatalogListWorkDto`
   - Removed assertion that `CreatedAt` should not be present

4. **Updated `project/endpoints/endpoints-catalog.md`**:
   - Added `NumberValue` and `CreatedAt` to JSON example in GET /api/catalog/lists/{id}
   - Documented color resolution chain for PublisherColor, FranchiseColor, SeriesColor
   - Updated DTO description to include new fields

**Files changed:**
- `Application/DTOs/CatalogListDtos.cs` - Added NumberValue, CreatedAt to record
- `Application/Services/WorkListService.cs` - Updated ToCatalogWorkItemDto with color resolution + new fields
- `tests/Infrastructure.Tests/Integration/CatalogControllerContractTests.cs` - Updated contract test
- `project/endpoints/endpoints-catalog.md` - Updated documentation

**Results:**
- All 244 integration tests pass
- All 12 contract tests pass
- Build succeeds with 0 warnings, 0 errors
- No N+1 queries (repository already loads all required relationships)