# TASK-API-0257 — Revisar Service de Franchise para listado público

## Objetivo

Implementar o adaptar el Service necesario para obtener el listado público de Franchises definido en US-0026.

## Resultado requerido

Cada elemento debe contener:

```text
Franchise:
    Id
    Name
    Color
    UrlImage

Publisher:
    Id
    Name
    Color
```

El resultado debe:

* incluir únicamente Franchises activas;
* estar paginado;
* permitir búsqueda por nombre de Franchise o Publisher;
* utilizar OR entre ambos criterios;
* estar ordenado por `Franchise.Name ASC`.

El orden es una regla del caso de uso y no debe ser enviado por el frontend.

## Instrucciones

Revisar DTOs existentes antes de crear nuevos.

No exponer entidades de persistencia.

No utilizar DTOs administrativos si contienen información innecesaria.

No implementar Endpoint.

## Validación

Verificar que cada resultado contiene toda la información necesaria para construir la card de Franchise y navegar al Publisher asociado sin requests adicionales por card.

---

# Resultado de ejecución

## Qué se implementó

`FranchiseService.GetCatalogPagedAsync(GetCatalogFranchisesRequest request, CancellationToken)`, que devuelve `ListResponse<CatalogFranchiseCardDto>`.

```csharp
public async Task<ListResponse<CatalogFranchiseCardDto>> GetCatalogPagedAsync(
    GetCatalogFranchisesRequest request,
    CancellationToken cancellationToken = default)
{
    var currentPage = request.currentPage;
    var pageSize = request.pageSize;
    PaginationGuard.Normalize(PaginationGuard.CatalogCardDefaultPageSize, PaginationGuard.CatalogCardMaxPageSize, ref currentPage, ref pageSize);

    var (franchises, totalCount) = await _unitOfWork.FranchiseRepository.GetCatalogPagedAsync(currentPage, pageSize, request.search, cancellationToken);

    var items = franchises.Select(f => new CatalogFranchiseCardDto(
        f.Id,
        f.Name,
        f.Color,
        ImageUrlBuilder.ToUrl(f.Image),
        new CatalogNodeDto(f.Publisher.Id, f.Publisher.Name, f.Publisher.Color))).ToList();

    return PaginationGuard.Build(currentPage, pageSize, totalCount, items);
}
```

## DTOs nuevos

```csharp
public record CatalogNodeDto(long Id, string Name, string? Color);

public record CatalogFranchiseCardDto(
    long Id,
    string Name,
    string? Color,
    string? UrlImage,
    CatalogNodeDto Publisher);
```

`CatalogNodeDto` es el nodo anidado de `Id`, `Name` y `Color` que usan tanto la card de Franchise como la de Series para sus pills. Se creó en lugar de reutilizar `WorkCatalogNodeDto` o los ids planos de `FranchiseFilterDto` para que el contrato de la card sea explícito y no dependa del DTO de otro caso de uso.

## Decisiones

### El nodo `Publisher` es no-nullable

Por decisión humana, el listado exige que toda la cadena esté activa. `Franchise.PublisherId` es una FK requerida, así que el filtro `f.Publisher.IsActive` del Repository se traduce a un inner join y `f.Publisher` nunca llega nula. Declarar el nodo como no-nullable es entonces correcto y evita que el frontend debamanejar un caso imposible.

### No se reutilizó `FranchiseFilterDto`

`FranchiseFilterDto` expone `Id`, `Name`, `Color`, `PublisherId` y `PublisherName`: sirve al autocomplete de filtros, no a la card. La card necesita `UrlImage` y el **color** del Publisher para la pill. El usuario decidió no tocar los endpoints de filtros, así que se creó un contrato nuevo.

### Sin filtrado en memoria

El Service solo proyecta. Filtros, búsqueda, orden y paginación ocurren en base de datos; el Service mapea la página ya resuelta y arma el `ListResponse` con `PaginationGuard.Build`. El orden `Franchise.Name ASC` vive en el Repository.

### `UrlImage`

Con `ImageUrlBuilder.ToUrl`, que devuelve `/images/{id}` o `null`. Nunca se expone `StoragePath` ni `FileName`.

## Archivos

- `api/Application/DTOs/CatalogCardDtos.cs` — `CatalogNodeDto`, `CatalogFranchiseCardDto` y `GetCatalogFranchisesRequest`.
- `api/Application/Interfaces/IFranchiseService.cs` — nueva operación.
- `api/Application/Services/FranchiseService.cs` — implementación.

## Verificación

- `dotnet build api/ComicLibrary.sln` → 0 errores.
- Tests: cada elemento trae el nodo `Publisher` con `Id` y `Name` válidos; `urlImage` coincide con la imagen de la entidad o es `null`; orden `Name ASC`; búsqueda por nombre de Franchise y por nombre de Publisher, con `OR` entre ambos; `pageSize` acotado; búsqueda sin resultados devuelve lista vacía con `totalCount = 0`.
- Suite completa: **219/219 en verde** tras completar las 12 tasks de US-0026.

## Criterios de aceptación

Cada elemento contiene `Id`, `Name`, `Color`, `UrlImage` y el nodo `Publisher` con `Id`, `Name` y `Color`, de modo que la card se construye y navega al Publisher sin requests adicionales. Solo Franchises activas con editorial activa; paginado; búsqueda por Franchise o Publisher con `OR`; orden `Franchise.Name ASC`; sin entidades de persistencia ni DTOs administrativos expuestos. No se implementó Endpoint en esta task.