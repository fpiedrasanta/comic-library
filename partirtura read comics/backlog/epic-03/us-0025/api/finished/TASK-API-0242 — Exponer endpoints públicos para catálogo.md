# TASK-API-0242 — Exponer endpoints públicos para catálogo

## Objetivo

Crear endpoints públicos autenticados para buscar Publishers, Franchises, Series y WorkTypes, necesarios para los autocompletes del catálogo público de Works (`US-0025` / Public Web).

## Contexto

El catálogo público consume `GET /api/works` para mostrar resultados. Los filtros estructurales (Publisher, Franchise, Series) y el filtro WorkType deben poderse buscar desde la UI sin filtrar por texto de obra.

Actualmente no existen endpoints públicos para estas entidades. Todos los endpoints documentados en `project/endpoints/` son `/api/admin-*` y requieren rol `Administrator`, por lo que no pueden usarse desde Public Web.

## Origen

Task origin: `TASK-PUBLIC-WEB-0058` (Implementar búsqueda, filtros y autocomplete) en `backlog/epic-03/us-0025/public-web/`.

## Trabajo solicitado

Agregar en `WorksController` o en controladores públicos específicos los siguientes endpoints:

- `GET /api/publishers` — búsqueda pública de publishers
- `GET /api/franchises` — búsqueda pública de franchises
- `GET /api/series` — búsqueda pública de series
- `GET /api/work-types` — búsqueda pública de work types

Cada endpoint debe soportar:
- `search`: string, coincidencia parcial case-insensitive sobre el nombre
- `pageSize`: integer, paginación
- `currentPage`: integer, paginación
- `orderBy` / `orderDir`: ordenamiento básico por nombre
- Autenticación Bearer requerida
- Rol lector autenticado; NO requiere `Administrator`

### Comportamiento esperado

- Cuando el usuario escribe en el autocomplete de Publisher, se llama a `GET /api/publishers?search=Mar`
- El backend devuelve publishers que coinciden con `Mar` (`LIKE '%Mar%'`)
- El frontend muestra las opciones; la selección aplica el filtro `publisherId` en `GET /api/works`
- Igual para Franchise, Series y WorkType

## Información necesaria

- Los endpoints deben devolver únicamente datos públicos: `id`, `name`, `color`, y contexto mínimo necesario para el autocomplete
- No exponer datos administrativos sensibles
- La respuesta debe seguir el estándar `ApiResponse<ListResponse<...>>`
- Paginación recomendada: default `pageSize=12`, max `24`

## Dependencias

- `GET /api/works` ya existe y funciona
- Las entidades Publisher, Franchise, Series, WorkType ya existen en el dominio

## Acceptance Criteria

- Existe `GET /api/publishers` público autenticado
- Existe `GET /api/franchises` público autenticado
- Existe `GET /api/series` público autenticado
- Existe `GET /api/work-types` público autenticado
- Cada endpoint soporta búsqueda parcial case-insensitive por nombre
- Cada endpoint soporta paginación
- No requieren rol `Administrator`
- La respuesta incluye campos mínimos públicos necesarios para el catálogo
- La documentación de endpoints se actualiza en `project/endpoints/`

---

# Resultado de ejecución

## Qué se implementó

Cuatro endpoints públicos autenticados para los autocompletes del catálogo de Works, con un Service público por entidad y DTOs de contrato mínimos.

| Endpoint | Controller | Service | DTO |
| --- | --- | --- | --- |
| `GET /api/publishers` | `PublishersController` | `IPublisherService.GetPublicPagedAsync` | `PublisherFilterDto` (Id, Name, Color) |
| `GET /api/franchises` | `FranchisesController` | `IFranchiseService.GetPublicPagedAsync` | `FranchiseFilterDto` (Id, Name, Color, PublisherId, PublisherName) |
| `GET /api/series` | `SeriesController` | `ISeriesService.GetPublicPagedAsync` | `SeriesFilterDto` (Id, Name, Color, FranchiseId, FranchiseName) |
| `GET /api/work-types` | `WorkTypesController` | `IWorkTypeService.GetPublicPagedAsync` | `WorkTypeFilterDto` (Id, Name) |

## Archivos nuevos

- `api/Application/DTOs/CatalogFilterDtos.cs` — los cuatro DTOs públicos.
- `api/Api/Controllers/PublishersController.cs`
- `api/Api/Controllers/FranchisesController.cs`
- `api/Api/Controllers/SeriesController.cs`
- `api/Api/Controllers/WorkTypesController.cs`
- `tests/Infrastructure.Tests/Integration/CatalogFilterEndpointsIntegrationTests.cs` (14 tests)
- `tests/Infrastructure.Tests/Integration/CatalogFilterControllerContractTests.cs` (5 tests)

## Archivos modificados

- `api/Application/DTOs/PaginationGuard.cs` — nueva constante `CatalogFilterMaxPageSize = 24`.
- `api/Application/Interfaces/IPublisherService.cs`, `IFranchiseService.cs`, `ISeriesService.cs`, `IWorkTypeService.cs` — nueva operación `GetPublicPagedAsync`.
- `api/Application/Services/PublisherService.cs`, `FranchiseService.cs`, `SeriesService.cs`, `WorkTypeService.cs` — implementación.
- `api/Infrastructure/Repositories/PublisherRepository.cs`, `FranchiseRepository.cs`, `SeriesRepository.cs`, `WorkTypeRepository.cs` — desempate estable por `Id` en el ordenamiento.
- `tests/Infrastructure.Tests/Integration/IntegrationTestFixture.cs` — se registró `IWorkTypeService`, que faltaba en el host de pruebas (la API sí lo registraba en `Program.cs`).
- `project/endpoints.md` — los cuatro prefijos públicos en el índice.
- `project/endpoints/endpoints-publishers.md`, `endpoints-franchises.md`, `endpoints-series.md`, `endpoints-work-types.md` — sección pública con parámetros, respuesta y DTO.
- `project/services/services-catalog.md` y `project/services.md` — operación pública en los cuatro servicios; se agregó la sección faltante de `WorkTypeService` y se la incluyó en el índice.
- `project/repositories/repositories-catalog.md` — nota del desempate por `Id` en los cuatro repositorios.

## Decisiones

- No se crearon operaciones nuevas de Repository. Los cuatro repositorios ya soportaban búsqueda parcial por nombre, ordenamiento y paginación, y devuelven entidades. La capa pública reutiliza esas consultas con `IsActive = true` y proyecta a un DTO mínimo. Se respetó la regla de que el Repository nunca devuelve DTOs y el Service es quien mapea.
- Cada entidad expone su listado público desde su Service existente (`GetPublicPagedAsync`), en lugar de crear Services públicos paralelos: evita duplicar consultas y mantiene una sola fuente de verdad por entidad.
- Las entidades inactivas quedan siempre excluidas. El filtro se fija en el Service público y no se expone como parámetro, de modo que un cliente no puede listar contenido desactivado.
- El DTO público no incluye `IsActive`, `IsFeatured`, `IsOngoing`, `IsAlive` ni `CreatedAt`. Para Franchise y Series se agregó el nombre del padre (Publisher/Franchise) porque hay nombres repetidos entre publishers y franchises distintos y el autocomplete sería ambiguo sin ese contexto.
- `pageSize` máximo 24 y default 12, como recomienda la Task. El máximo vive en la constante `PaginationGuard.CatalogFilterMaxPageSize`; el máximo global de 50 no cambia para los endpoints administrativos.
- Los cuatro controllers usan `[Authorize]` sin roles: cualquier usuario autenticado, sin exigir `Administrator`. Sin `AllowAnonymous`.
- Controllers separados por recurso, siguiendo la convención de `api/countries` y del `WorksController` ya creado, en vez de un controller único de catálogo.
- Se reutilizó `ListRequest` como tipo de query, ya que contiene exactamente `search`, `currentPage`, `pageSize`, `orderBy` y `orderDir`. No se creó una clase vacía derivada.
- **Desempate por `Id` en los cuatro repositorios**: sin él, ordenar solo por nombre deja empates cuyo orden es indefinido y la paginación del autocomplete puede repetir o omitir elementos entre páginas. El cambio es de una línea por repositorio y no altera el criterio de orden, solo lo hace determinista. Beneficia también a los listados administrativos.
- No se expusieron filtros jerárquicos (`publisherId`, `franchiseId`) en `GET /api/series`: la Task no los pide y el repositorio ya los soporta si en el futuro se requieren.

## Tests

`CatalogFilterEndpointsIntegrationTests` (14, sobre la base de desarrollo real, sin seed ni operaciones destructivas):

| Test | Cubre |
| --- | --- |
| `Publishers/Franchises/Series/WorkTypes_ReturnOnlyActiveOnes` (4) | solo entidades activas en el listado público |
| `Publishers/Franchises/Series/WorkTypes_SearchByName_IsPartialAndCaseInsensitive` (4) | búsqueda parcial por nombre, case-insensitive |
| `Series_SearchAlsoMatchesFranchiseName` | la búsqueda de series también cubre el nombre de la franchise |
| `Pagination_IsStableWithoutDuplicatesAcrossPages` | paginación completa sin ids duplicados y orden estable |
| `Pagination_ReportsCorrectNavigationFlags` | `hasNextPage`, `hasPriorPage`, página fuera de rango y `totalCount` estable |
| `WorkTypes_SupportBothOrderDirectionsByName` | `orderBy=Name` en ASC y DESC |
| `Franchises_DefaultOrderIsNameAscending` | orden por defecto |
| `PublicLists_CapPageSizeForAutocomplete` | `pageSize` acotado a 24 |

`CatalogFilterControllerContractTests` (5): los cuatro controllers exigen `[Authorize]`, no tienen `AllowAnonymous`, no declaran rol, exponen su ruta, ligan `ListRequest` + `CancellationToken` y devuelven `Task<IActionResult>`; y los cuatro DTOs exponen exactamente los campos públicos esperados.

## Verificación

- Build: `dotnet build api/ComicLibrary.sln` → **0 errores**. Solo los 2 warnings preexistentes (`Application/Services/ComicAnalysisParser.cs` CS8603 e `Infrastructure/Persistence/DesignTimeDbContextFactory.cs` CS8604), ninguno introducido por esta Task.
- Tests nuevos: **19/19 en verde** (14 de comportamiento + 5 de contrato).
- Suite completa: **122/122 en verde** con el output por defecto.

## Notas para referencia

- La suite debe ejecutarse siempre con el output por defecto. Los tests de workflow resuelven sus assets con rutas relativas a `AppContext.BaseDirectory` (`tests/Infrastructure.Tests/bin/Debug/net10.0/` + 4 niveles). Compilar con `-p:OutDir` a otro directorio desplaza la base y esos tests fallan con `FileNotFoundException` aunque los archivos existan en `tests/`.
- La seguridad se valida por contrato de atributos, no por llamada HTTP. El proyecto de tests no monta la API con `WebApplicationFactory`; la verificación HTTP queda para prueba manual, según el criterio vigente.

## Criterios de finalización

Todos los criterios quedan cumplidos: los cuatro endpoints públicos autenticados existen, soportan búsqueda parcial case-insensitive por nombre, soportan paginación, no requieren rol `Administrator`, devuelven únicamente campos públicos mínimos y la documentación de endpoints está actualizada en `project/endpoints/`.
