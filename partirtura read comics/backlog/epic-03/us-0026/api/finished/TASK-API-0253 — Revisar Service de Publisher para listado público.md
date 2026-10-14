# TASK-API-0253 — Revisar Service de Publisher para listado público

## Objetivo

Implementar o adaptar el Service necesario para obtener el listado público de Publishers definido en US-0026.

## Resultado requerido

El Service debe devolver únicamente la información necesaria para las cards:

```text
Id
Name
Color
UrlImage
```

La operación debe:

* devolver únicamente Publishers activos;
* soportar paginación;
* soportar búsqueda por nombre;
* ordenar por `Name ASC`;
* devolver un DTO específico para el listado público si el proyecto utiliza DTOs diferenciados por caso de uso.

El orden `Name ASC` es una regla del caso de uso y no debe depender de información enviada por el frontend.

## Instrucciones

Revisar primero los Services y DTOs existentes.

Evitar reutilizar DTOs administrativos si contienen información que no corresponde al Public Web.

No realizar filtrado principal en memoria.

No implementar Endpoint.

## Validación

Verificar que el resultado contiene exclusivamente la información necesaria para US-0026 y respeta paginación, búsqueda, activos y ordenamiento.

---

# Resultado de ejecución

## Qué se implementó

`PublisherService.GetCatalogPagedAsync(GetCatalogPublishersRequest request, CancellationToken)`, que devuelve `ListResponse<CatalogPublisherCardDto>`.

```csharp
public async Task<ListResponse<CatalogPublisherCardDto>> GetCatalogPagedAsync(
    GetCatalogPublishersRequest request,
    CancellationToken cancellationToken = default)
{
    var currentPage = request.currentPage;
    var pageSize = request.pageSize;
    PaginationGuard.Normalize(PaginationGuard.CatalogCardDefaultPageSize, PaginationGuard.CatalogCardMaxPageSize, ref currentPage, ref pageSize);

    var (publishers, totalCount) = await _unitOfWork.PublisherRepository.GetCatalogPagedAsync(currentPage, pageSize, request.search, cancellationToken);

    var items = publishers.Select(p => new CatalogPublisherCardDto(
        p.Id,
        p.Name,
        p.Color,
        ImageUrlBuilder.ToUrl(p.Image))).ToList();

    return PaginationGuard.Build(currentPage, pageSize, totalCount, items);
}
```

## DTO nuevo: `CatalogPublisherCardDto`

```csharp
public record CatalogPublisherCardDto(long Id, string Name, string? Color, string? UrlImage);
```

Expose exactamente los cuatro campos de la card. No incluye `isActive`, `isFeatured`, `isAlive`, `createdAt`, `countryName` ni `imageId`.

## Decisiones

### No se reutilizó `PublisherFilterDto`

`PublisherFilterDto` (Id, Name, Color) es el contrato del autocomplete de filtros del catálogo de Works y **no** incluye la URL del logo. Ampliarlo habría mezclado dos casos de uso con necesidades distintas y, además, el usuario decidió no modificar los endpoints de filtros porque no se conoce su uso exacto en el frontend. La card necesita `UrlImage`, así que se creó un DTO específico.

### Paginación

Se reutilizan los helpers del proyecto: `PaginationGuard.Normalize` corrige valores fuera de rango (`currentPage < 1` → 1, `pageSize < 1` → 24, `pageSize > 36` → 36) y `PaginationGuard.Build` arma el `ListResponse` con los flags de navegación que necesita el scroll infinito. Se agregaron las constantes `CatalogCardDefaultPageSize = 24` y `CatalogCardMaxPageSize = 36` a `PaginationGuard`, ambas múltiplos de 12 para que la grilla de cards se complete.

El orden no se resuelve en el Service: vive en el Repository, como regla del caso de uso.

### Sin filtrado en memoria

El Service no filtra ni ordena. Solo proyecta entidades ya paginateadas y filtradas en base de datos a `CatalogPublisherCardDto`. La única transformación en memoria es el mapeo de la página, igual que en el resto de los servicios del proyecto.

### `UrlImage`

Se construye con el helper existente `ImageUrlBuilder.ToUrl`, que devuelve `/images/{id}` o `null`. No se expone `StoragePath` ni `FileName`.

## Archivos nuevos

- `api/Application/DTOs/CatalogCardDtos.cs` — `CatalogPublisherCardDto` y las requests de los tres listados.

## Archivos modificados

- `api/Application/Interfaces/IPublisherService.cs` — nueva operación en el contrato.
- `api/Application/Services/PublisherService.cs` — implementación.
- `api/Application/DTOs/PaginationGuard.cs` — constantes `CatalogCardDefaultPageSize` y `CatalogCardMaxPageSize`.

## Verificación

- `dotnet build api/ComicLibrary.sln` → 0 errores.
- Tests: el resultado solo trae los cuatro campos de la card, `urlImage` coincide con la imagen de la entidad o es `null`, el orden es `Name ASC`, la búsqueda es parcial e insensible a mayúsculas, `pageSize` se normaliza y se acota, y no expone campos administrativos.
- Suite completa: **219/219 en verde** tras completar las 12 tasks de US-0026.

## Criterios de aceptación

El resultado expone exclusivamente `Id`, `Name`, `Color` y `UrlImage`; devuelve solo Publishers activos; respeta paginación, búsqueda y orden `Name ASC`; y no realiza filtrado principal en memoria. No se implementó Endpoint en esta task.