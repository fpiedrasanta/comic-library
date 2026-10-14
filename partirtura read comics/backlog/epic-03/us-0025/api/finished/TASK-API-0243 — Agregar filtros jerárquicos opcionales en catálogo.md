# TASK-API-0243 — Agregar filtros jerárquicos opcionales en endpoints públicos de catálogo

## Objetivo

Agregar parámetros de filtro jerárquico opcionales en los endpoints públicos de catálogo, para que los autocompletes del Public Web puedan mostrar solo opciones coherentes con la selección anterior sin traer catálogos completos.

## Contexto

El Public Web necesita autocompletes en cascada para Publisher → Franchise → Serie → WorkType. Actualmente los endpoints públicos solo soportan `search` textual. Eso fuerza al frontend a:

- traer listados completos paginados sin contexto jerárquico,
- o intentar filtrar en el cliente datasets que pueden tener 2500+ series.

Ambas opciones son inviables para una UX de autocomplete real.

## Origen

Task origin: `TASK-PUBLIC-WEB-0058` (Implementar búsqueda, filtros y autocomplete) en `backlog/epic-03/us-0025/public-web/`.

## Endpoints a modificar

- `GET /api/franchises`
- `GET /api/series`

## Cambios solicitados

### `GET /api/franchises`

Agregar parámetro opcional:

- `publisherId`: `long?`
  - Cuando se envía, filtra franchises activas pertenecientes a ese publisher.
  - Cuando no se envía, lista todas las franchises activas como hoy.

Comportamiento:
- Si `publisherId` se envía y existe → devuelve solo franchises de ese publisher.
- Si `publisherId` se envía y no existe → `404 BusinessNotFoundException` o lista vacía, según la convención del proyecto.
- Compatible con `search`: ambos filtros deben combinarse con AND.

### `GET /api/series`

Agregar parámetros opcionales:

- `franchiseId`: `long?`
  - Cuando se envía, filtra series activas pertenecientes a esa franchise.
- `publisherId`: `long?`
  - Cuando se envía sin `franchiseId`, filtra series activas pertenecientes a cualquier franchise de ese publisher.
  - Cuando se envía junto con `franchiseId`, debe coincidir con la franchise indicada.

Comportamiento:
- Si `franchiseId` se envía → devuelve solo series de esa franchise.
- Si solo `publisherId` se envía → devuelve series de cualquier franchise de ese publisher.
- Si ninguno se envía → lista todas las series activas como hoy.
- Compatible con `search`: todos los filtros se combinan con AND.

## Información necesaria

- Mantener respuesta `ApiResponse<ListResponse<...>>`.
- Mantener paginación, ordenamiento y defaults existentes.
- Mantener exclusión de registros inactivos.
- No exponer campos administrativos.
- Actualizar documentación en `project/endpoints/endpoints-franchises.md` y `endpoints-series.md`.

## Dependencias

- `GET /api/franchises` y `GET /api/series` ya existen y funcionan.
- Los repositorios ya soportan estos filtros; probablemente solo haga falta exponerlos en los controllers públicos.

## Acceptance Criteria

- `GET /api/franchises` acepta `publisherId` opcional.
- `GET /api/series` acepta `franchiseId` y `publisherId` opcionales.
- Los filtros se combinan con `search` mediante AND.
- La documentación se actualiza.
- El comportamiento sin filtros opcionales se mantiene igual.

---

# Resultado de ejecución

## Qué se implementó

Filtros jerárquicos opcionales en los endpoints públicos de catálogo, para que los autocompletes del Public Web funcionen en cascada Publisher → Franchise → Serie sin traer catálogos completos.

| Endpoint | Parámetro nuevo | Efecto |
| --- | --- | --- |
| `GET /api/franchises` | `publisherId` (long?) | franchises activas del publisher indicado |
| `GET /api/series` | `franchiseId` (long?) | series activas de la franchise indicada |
| `GET /api/series` | `publisherId` (long?) | series activas de cualquier franchise del publisher indicado |

Ambos filtros se combinan con `search` y entre sí mediante AND. En `/api/series`, si llegan `publisherId` y `franchiseId` juntos, la franchise debe pertenecer al publisher; si no coincide, el resultado es vacío.

## Archivos nuevos

Ninguno. Se reutilizó el archivo `Application/DTOs/CatalogFilterDtos.cs`, que ahora además declara los dos request públicos.

## Archivos modificados

- `api/Application/DTOs/CatalogFilterDtos.cs` — `GetPublicFranchisesRequest` (ListRequest + `PublisherId`) y `GetPublicSeriesRequest` (ListRequest + `PublisherId` + `FranchiseId`).
- `api/Application/Interfaces/IFranchiseRepository.cs` — `GetPagedAsync` acepta el nuevo filtro `publisherId`.
- `api/Infrastructure/Repositories/FranchiseRepository.cs` — filtro implementado en base de datos.
- `api/Application/Services/FranchiseService.cs` — el listado público reenvía `PublisherId`; el administrativo pasa `null`.
- `api/Application/Services/SeriesService.cs` — el listado público reenvía `PublisherId` y `FranchiseId` en lugar de `null`.
- `api/Application/Interfaces/IFranchiseService.cs`, `ISeriesService.cs` — firma pública ajustada al nuevo request.
- `api/Api/Controllers/FranchisesController.cs`, `SeriesController.cs` — ligan el request público correspondiente.
- `tests/Infrastructure.Tests/Integration/CatalogFilterEndpointsIntegrationTests.cs` — 8 tests nuevos y actualización de los existentes.
- `tests/Infrastructure.Tests/Integration/CatalogFilterControllerContractTests.cs` — el test de binding ahora declara el tipo de request esperado por controller.
- `project/endpoints/endpoints-franchises.md`, `endpoints-series.md` — parámetros y comportamiento de los filtros.
- `project/services/services-catalog.md` — operaciones y notas de los dos servicios.
- `project/repositories/repositories-catalog.md` — nuevo parámetro de `FranchiseRepository`.

## Decisiones

- `SeriesRepository` ya soportaba `publisherId` y `franchiseId`, así que `/api/series` solo necesitaba exponerlos. `FranchiseRepository` no los tenía: se le agregó `publisherId` como parámetro opcional de su `GetPagedAsync` existente, en la misma posición que usa `SeriesRepository`, en lugar de duplicar la consulta con un método nuevo. El call site administrativo pasa `null` explícito.
- Se cambió la firma de `GetPublicPagedAsync` para usar tipos de request por caso de uso (`GetPublicFranchisesRequest`, `GetPublicSeriesRequest`) en lugar del `ListRequest` genérico. Es lo que pide la regla de contratos diseñados por caso de uso, y evita que `publisherId` aparezca en endpoints que no lo soportan. No hay consumidores externos afectados: los endpoints son nuevos de la US anterior.
- Un id inexistente devuelve `200 OK` con lista vacía y `totalCount: 0`, no `404`. Son filtros, no búsquedas de recurso: es la convención que ya usa `GET /api/works?publisherId=X`. La Task dejaba la decisión abierta y se documentó explícitamente en los dos endpoints.
- El filtro se aplica en base de datos, junto al resto de las restricciones y antes de `Count`, sin materializar el conjunto.
- Se mantuvo `IsActive = true` forzado en la capa pública y no se exponen nuevos campos: los DTO públicos no cambian.
- Se respetó el criterio de la Task de no agregar filtros a `/api/publishers` ni `/api/work-types`: no tienen nivel jerárquico superior.

## Tests

8 tests nuevos en `CatalogFilterEndpointsIntegrationTests` (31 en total el archivo, 36 de catálogo):

| Test | Cubre |
| --- | --- |
| `Franchises_FilterByPublisher_ReturnsOnlyThatPublishersFranchises` | para cada publisher presente, el conjunto filtrado es exactamente el esperado y ningún elemento pertenece a otro |
| `Franchises_FilterByPublisherCombinesWithSearch` | `publisherId` + `search` con AND |
| `Series_FilterByFranchise_ReturnsOnlyThatFranchisesSeries` | igualdad de conjuntos con las series de esa franchise |
| `Series_FilterByPublisher_ReturnsSeriesOfEveryFranchiseOfThatPublisher` | incluye las series de todas las franchises del publisher |
| `Series_FilterByPublisherAndFranchise_RequiresBothToMatch` | combinación coincidente devuelve resultados; franchise de otro publisher devuelve vacío |
| `Series_HierarchicalFiltersCombineWithSearch` | `franchiseId` + `search` con AND |
| `HierarchicalFilters_UnknownIds_ReturnEmptyListWithoutError` | ids inexistentes devuelven lista vacía y `totalCount: 0`, sin excepción |
| `HierarchicalFilters_Omitted_KeepsPreviousBehavior` | sin filtros y con filtros en `null` devuelven la misma secuencia, confirmando que no hubo regresión |

Los tests son data-driven: descubren publishers, franchises y series reales y validan invariantes de conjunto, sin crear ni eliminar datos.

## Verificación

- Build: `dotnet build api/ComicLibrary.sln` → **0 errores**. Solo los 2 warnings preexistentes (`ComicAnalysisParser.cs` CS8603 y `DesignTimeDbContextFactory.cs` CS8604), ninguno introducido.
- Tests de catálogo: **31/31 en verde**.
- Suite completa: **130/130 en verde** con el output por defecto.

## Criterios de finalización

Todos los criterios quedan cumplidos: `/api/franchises` acepta `publisherId`; `/api/series` acepta `franchiseId` y `publisherId`; los filtros se combinan con `search` mediante AND; la documentación está actualizada en `project/endpoints/endpoints-franchises.md` y `endpoints-series.md`; y el comportamiento sin filtros opcionales se mantiene idéntico, verificado por test.
