# TASK-API-0296 — Agregar filtros jerárquicos opcionales a endpoints de catálogo

## Origen
Solicitud directa del usuario (extendiendo US-0026, endpoints de catálogo ya finalizados).

## Título
Agregar filtros jerárquicos opcionales `publisherId` y `franchiseId` a `GET /api/catalog/franchises` y `GET /api/catalog/series`.

## Descripción
- `GET /api/catalog/franchises` debe aceptar `publisherId` (long, opcional) y filtrar franquicias por ese publisher.
- `GET /api/catalog/series` debe aceptar `franchiseId` y/o `publisherId` (long, opcionales) y filtrar series por esa franquicia/publisher.
- Los filtros deben combinarse con `AND` junto con `search`, aplicarse en la base de datos antes de paginar, y afectar `totalCount`/`hasNextPage`.
- No exponer otros campos administrativos.
- Actualizar DTOs de request, servicios y repositorios correspondientes, y documentar en `endpoints-catalog.md`.

## Contexto relevante
- Controlador: `api/Api/Controllers/CatalogController.cs` (ya pasa el request al servicio; no requiere cambios de firma).
- DTOs: `api/Application/DTOs/CatalogCardDtos.cs` — `GetCatalogFranchisesRequest`, `GetCatalogSeriesRequest`.
- Servicios: `api/Application/Services/FranchiseService.cs` (`GetCatalogPagedAsync`), `api/Application/Services/SeriesService.cs` (`GetCatalogPagedAsync`).
- Interfaces de servicio: `IFranchiseService`, `ISeriesService` (firma sin cambios, reciben el request record).
- Interfaces de repositorio: `IFranchiseRepository`, `ISeriesRepository` (`GetCatalogPagedAsync` firma cambia).
- Repositorios EF Core: `api/Infrastructure/Repositories/FranchiseRepository.cs`, `api/Infrastructure/Repositories/SeriesRepository.cs` (`GetCatalogPagedAsync`).
- Documentación: `project/endpoints/endpoints-catalog.md`.
- Entidades de dominio: `Franchise` (publisher obligatorio), `Series` (franchise obligatorio, publisher vía franquicia).
- Patrón existente: `GetCatalogPagedAsync` ya filtra `IsActive` de la entidad y de padres activos, aplica `ApplyCatalogSearch` (OR), cuenta `totalCount` antes de paginar (`Skip`/`Take`). Los nuevos filtros se encadenan como `.Where()` adicionales (AND) sobre la misma `IQueryable` antes de `CountAsync` y paginación.
- No hay proyecto de tests en la solución; verificar con `dotnet build` de `api/Api/Api.csproj`.

## Dependencias
Ninguna. Los filtros reutilizan la infraestructura de paginación (`PaginationGuard`) y el patrón de búsqueda existente.

## Criterios de aceptación
1. `GetCatalogFranchisesRequest` expone `long? publisherId = null`.
2. `GetCatalogSeriesRequest` expone `long? franchiseId = null` y `long? publisherId = null`.
3. `IFranchiseRepository.GetCatalogPagedAsync` acepta `long? publisherId = null`; repositorio filtra `Franchise.Publisher.Id == publisherId` cuando tiene valor.
4. `ISeriesRepository.GetCatalogPagedAsync` acepta `long? franchiseId = null` y `long? publisherId = null`; repositorio filtra `Series.Franchise.Id == franchiseId` y `Series.Franchise.Publisher.Id == publisherId` cuando tienen valor.
5. Filtros se aplican en SQL (EF Core `IQueryable.Where`) antes de `CountAsync` y `Skip`/`Take`; `totalCount` y `hasNextPage` reflejan el conjunto filtrado.
6. `search` combina con `AND` con los filtros jerárquicos.
7. Servicios pasan los valores del request al repositorio; controlador sin cambios de firma.
8. DTOs de respuesta (`CatalogFranchiseCardDto`, `CatalogSeriesCardDto`) sin cambios (no se exponen campos administrativos).
9. `endpoints-catalog.md` documenta `publisherId` en `/franchises` y `franchiseId`/`publisherId` en `/series`, incluyendo comportamiento AND con search y efecto en paginación.
10. `dotnet build api/Api/Api.csproj` con 0 errores.

## Resultado de ejecución
Estado: finished.

### Qué se implementó
- `GET /api/catalog/franchises` acepta ahora `publisherId` (long, opcional) y filtra franquicias por ese publisher.
- `GET /api/catalog/series` acepta ahora `franchiseId` y/o `publisherId` (long, opcionales) y filtra series por franquicia y/o publisher.
- Los filtros se encadenan como `.Where()` adicionales (AND) sobre la misma `IQueryable` junto con `search`, se aplican en SQL antes de `CountAsync` y `Skip`/`Take`, y afectan `totalCount`, `totalPages` y `hasNextPage`.
- No se expusieron campos administrativos; los DTOs de respuesta (`CatalogFranchiseCardDto`, `CatalogSeriesCardDto`) no cambiaron.

### Qué se cambió (archivos)
1. `api/Application/DTOs/CatalogCardDtos.cs`: `GetCatalogFranchisesRequest` agrega `long? publisherId = null`; `GetCatalogSeriesRequest` agrega `long? franchiseId = null` y `long? publisherId = null`.
2. `api/Application/Interfaces/IFranchiseRepository.cs`: `GetCatalogPagedAsync` agrega parámetro `long? publisherId = null`.
3. `api/Application/Interfaces/ISeriesRepository.cs`: `GetCatalogPagedAsync` agrega parámetros `long? franchiseId = null, long? publisherId = null`.
4. `api/Infrastructure/Repositories/FranchiseRepository.cs`: `GetCatalogPagedAsync` filtra `Franchise.Publisher.Id == publisherId` cuando tiene valor (antes de conteo y paginación).
5. `api/Infrastructure/Repositories/SeriesRepository.cs`: `GetCatalogPagedAsync` filtra `Series.Franchise.Id == franchiseId` y `Series.Franchise.Publisher.Id == publisherId` cuando tienen valor (antes de conteo y paginación).
6. `api/Application/Services/FranchiseService.cs`: `GetCatalogPagedAsync` pasa `request.publisherId` al repositorio.
7. `api/Application/Services/SeriesService.cs`: `GetCatalogPagedAsync` pasa `request.franchiseId` y `request.publisherId` al repositorio.
8. `api/Api/Controllers/CatalogController.cs`: sin cambios de firma (ya pasa el request al servicio).
9. `project/endpoints/endpoints-catalog.md`: documenta `publisherId` en `/franchises` y `franchiseId`/`publisherId` en `/series`, comportamiento AND con `search` y efecto en paginación.

### Decisiones relevantes
- No se validó existencia del publisher/franchise id; un id sin coincidencia devuelve conjunto vacío (totalCount 0), consistente con el patrón de filtros existente del endpoint `lists`.
- Se conservó el filtro existente de obras activas (`Works.Any`) y de entidades/padres activos (`IsActive`).
- Los filtros usan las propiedades de navegación requeridas (`Publisher`, `Franchise`, `Publisher` vía franquicia) que el repositorio ya incluye/carga.

### Notas para el futuro
- No hay proyecto de tests en la solución; verificación mediante `dotnet build`.
- El controlador no requirió cambios porque la firma del servicio recibe el request record, que ya lleva los nuevos campos opcionales.

### Verificación
`dotnet build Api/Api/Api.csproj`: 0 errores (solo advertencias preexistentes de vulnerabilidades NuGet y nullable, ajenas al cambio).
