# TASK-API-0261 — Revisar Service de Series para listado público

## Objetivo

Implementar o adaptar el Service necesario para obtener el listado público de Series definido en US-0026.

## Resultado requerido

Cada elemento debe contener:

```text
Series:
    Id
    Name
    Color
    UrlImage

Publisher:
    Id
    Name
    Color

Franchise:
    Id
    Name
    Color
```

El resultado debe:

* incluir únicamente Series activas;
* estar paginado;
* permitir búsqueda por nombre de Series, Franchise o Publisher;
* utilizar OR entre los tres criterios;
* estar ordenado por `Series.Name ASC`.

El orden es una regla del caso de uso y no debe ser enviado por el frontend.

## Instrucciones

Revisar DTOs existentes antes de crear nuevos.

No exponer entidades de persistencia.

No utilizar DTOs administrativos si contienen información innecesaria.

No implementar Endpoint.

## Validación

Verificar que cada resultado contiene toda la información necesaria para:

* construir la card de Series;
* mostrar las pills de Publisher y Franchise;
* navegar directamente a Publisher y Franchise;
* evitar requests adicionales por card.

---

# Resultado de ejecución

## Qué se implementó

`SeriesService.GetCatalogPagedAsync(GetCatalogSeriesRequest request, CancellationToken)`, que devuelve `ListResponse<CatalogSeriesCardDto>`.

```csharp
public async Task<ListResponse<CatalogSeriesCardDto>> GetCatalogPagedAsync(
    GetCatalogSeriesRequest request,
    CancellationToken cancellationToken = default)
{
    var currentPage = request.currentPage;
    var pageSize = request.pageSize;
    PaginationGuard.Normalize(PaginationGuard.CatalogCardDefaultPageSize, PaginationGuard.CatalogCardMaxPageSize, ref currentPage, ref pageSize);

    var (series, totalCount) = await _unitOfWork.SeriesRepository.GetCatalogPagedAsync(currentPage, pageSize, request.search, cancellationToken);

    var items = series.Select(s => new CatalogSeriesCardDto(
        s.Id,
        s.Name,
        s.Color,
        ImageUrlBuilder.ToUrl(s.Image),
        new CatalogNodeDto(s.Franchise.Id, s.Franchise.Name, s.Franchise.Color),
        new CatalogNodeDto(s.Franchise.Publisher.Id, s.Franchise.Publisher.Name, s.Franchise.Publisher.Color))).ToList();

    return PaginationGuard.Build(currentPage, pageSize, totalCount, items);
}
```

## DTO nuevo

```csharp
public record CatalogSeriesCardDto(
    long Id,
    string Name,
    string? Color,
    string? UrlImage,
    CatalogNodeDto Franchise,
    CatalogNodeDto Publisher);
```

Reutiliza `CatalogNodeDto` (Id, Name, Color) para ambas pills, el mismo nodo que usa la card de Franchise.

## Decisiones

### Los dos nodos son no-nullables

Por decisión humana, el listado exige que toda la cadena esté activa. `Series.FranchiseId` y `Franchise.PublisherId` son FKs requeridas, así que los filtros `s.Franchise.IsActive` y `s.Franchise.Publisher.IsActive` del Repository se traducen a inner joins y ambas navegaciones llegan pobladas. El Service accede directamente a `s.Franchise` y `s.Franchise.Publisher`.

No se usaron los helpers `GetPublisherId()` / `GetPublisherName()` porque recorren además `Country`, que la card no expone.

### No se reutilizó `SeriesFilterDto`

`SeriesFilterDto` expone ids y nombres planos del Franchise y del Publisher, sin `UrlImage` ni colores de los padres. Sirve al autocomplete de filtros del catálogo de Works, no a la card, que necesita los colores para las pills. El usuario decidió no modificar los endpoints de filtros, así que se creó un contrato nuevo.

### `Description` no se expone

La entidad tiene `Description` nullable (agregado en TASK-API-0248), pero la card de listado no la necesita. Se mantiene disponible en `GET /api/series/{id}`.

### Sin filtrado en memoria

Filtros, búsqueda, orden y paginación ocurren en base de datos. El Service solo proyecta la página resuelta y arma el `ListResponse` con `PaginationGuard.Build`. El orden `Series.Name ASC` vive en el Repository.

## Archivos

- `api/Application/DTOs/CatalogCardDtos.cs` — `CatalogSeriesCardDto` y `GetCatalogSeriesRequest`.
- `api/Application/Interfaces/ISeriesService.cs` — nueva operación.
- `api/Application/Services/SeriesService.cs` — implementación.

## Verificación

- `dotnet build api/ComicLibrary.sln` → 0 errores.
- Tests: ambos nodos con `Id` y `Name` válidos en todos los elementos; `urlImage` coincide con la imagen de la entidad o es `null`; orden `Name ASC`; búsqueda por nombre de Series, de Franchise y de Publisher con `OR` entre los tres; `pageSize` acotado; paginación estable sin duplicados; búsqueda sin resultados devuelve lista vacía con `totalCount = 0`.
- Suite completa: **219/219 en verde** tras completar las 12 tasks de US-0026.

## Criterios de aceptación

Cada elemento contiene `Id`, `Name`, `Color`, `UrlImage` y los nodos `Franchise` y `Publisher` con `Id`, `Name` y `Color`, de modo que la card, ambas pills y la navegación funcionan sin requests adicionales. Solo Series activas con Franchise y Publisher activos; paginado; búsqueda por los tres nombres con `OR`; orden `Series.Name ASC`; sin entidades de persistencia ni DTOs administrativos expuestos. No se implementó Endpoint en esta task.