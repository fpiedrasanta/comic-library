# TASK-API-0262 — Exponer listado público de Series

## Objetivo

Exponer el endpoint necesario para `/series` según US-0026.

## Endpoint

Debe recibir únicamente:

* parámetros de paginación;
* `search` opcional.

`search` debe aplicarse contra:

```text
Series.Name
OR
Franchise.Name
OR
Publisher.Name
```

No debe recibir información de ordenamiento.

El backend debe aplicar siempre:

```text
Series.Active = true
OrderBy Series.Name ASC
```

## Seguridad

* Autenticación: requerida.
* Administrator: no requerido.
* Usuario anónimo: rechazado.
* No utilizar `[AllowAnonymous]`.

## Resultado

Cada elemento debe devolver:

```text
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

## Instrucciones

El Controller debe delegar al Service.

No implementar lógica EF ni filtrado en Controller.

Actualizar la documentación de endpoints.

## Validación

Verificar:

* autenticación;
* paginación;
* búsqueda por Series;
* búsqueda por Franchise;
* búsqueda por Publisher;
* OR entre los tres;
* exclusión de inactivos;
* orden `Name ASC`;
* contrato de respuesta.

---

# Resultado de ejecución

## Endpoint implementado

```http
GET /api/catalog/series
```

En `CatalogController` (`[Route("api/catalog")]`, `[Authorize]`), junto a los otros dos listados de US-0026.

```csharp
[HttpGet("series")]
public async Task<IActionResult> GetSeries([FromQuery] GetCatalogSeriesRequest request, CancellationToken cancellationToken)
{
    var result = await _seriesService.GetCatalogPagedAsync(request, cancellationToken);
    return Ok(new ApiResponse<ListResponse<CatalogSeriesCardDto>>(true, "OK", StatusCodes.Status200OK, result));
}
```

## Respuesta

```json
{
  "success": true,
  "message": "OK",
  "code": 200,
  "payload": {
    "currentPage": 1,
    "hasNextPage": true,
    "hasPriorPage": false,
    "totalPages": 4,
    "pageSize": 24,
    "nextPage": 2,
    "priorPage": null,
    "totalCount": 84,
    "items": [
      {
        "id": 11,
        "name": "Uncanny X-Men",
        "color": "#1B3A6B",
        "urlImage": "/images/140",
        "franchise": { "id": 4, "name": "X-Men", "color": "#F5C518" },
        "publisher": { "id": 2, "name": "Marvel Comics", "color": "#EC1D24" }
      }
    ]
  }
}
```

## Seguridad

- `[Authorize]` sin `Roles`: cualquier usuario autenticado, sin exigir `Administrator`.
- Sin `[AllowAnonymous]`: el anónimo recibe 401.
- Validación por atributos, igual que el resto del proyecto; la comprobación HTTP queda para prueba manual.

## Contrato de entrada

`GetCatalogSeriesRequest` expone solo `currentPage`, `pageSize` y `search`. Sin `orderBy` ni `orderDir`: el orden `Series.Name ASC` lo aplica el Repository. Sin filtros `franchiseId` ni `publisherId`, a diferencia de `GET /api/series` que sí los expone para la cadena de filtros.

## Búsqueda

`Series.Name LIKE %search% OR Franchise.Name LIKE %search% OR Publisher.Name LIKE %search%`, parcial e insensible a mayúsculas por collation de columna, resuelta en SQL. Sin coincidencia devuelve lista vacía con `totalCount = 0`.

## Decisión: se exige toda la cadena activa

Por decisión humana, la US pedía excluir solo las Series inactivas, pero se extendió a toda la cadena: la Series, su Franchise y el Publisher de esa Franchise deben estar activas. Sin eso, una card podría mostrar pills de entidades que `GET /api/series/{id}`, `GET /api/franchises/{id}` y `GET /api/publishers/{id}` responden 404.

Como `Series.FranchiseId` y `Franchise.PublisherId` son FKs requeridas, ambos filtros se traducen a inner joins y las navegaciones nunca llegan nulas. Por eso `franchise` y `publisher` se declaran no-nullables en el DTO.

`Description` existe en la entidad (TASK-API-0248) pero no se expone: la card no la necesita y sigue disponible en el detalle.

## Archivos nuevos

- `api/Api/Controllers/CatalogController.cs` — los tres endpoints de US-0026.
- `project/endpoints/endpoints-catalog.md` — documentación de los tres endpoints.

## Archivos modificados

- `project/endpoints.md` — índice de endpoints por controller.
- `project/endpoints/endpoints-series.md` — referencia cruzada al nuevo endpoint.

## Tests

Contrato (`CatalogControllerContractTests`): `[Authorize]` sin roles ni `[AllowAnonymous]`, ruta `api/catalog`, `HttpGet("series")` con `GetCatalogSeriesRequest` y retorno `Task<IActionResult>`, request sin parámetros de ordenamiento, y forma exacta de `CatalogSeriesCardDto` (`Id`, `Name`, `Color`, `UrlImage`, `Franchise`, `Publisher`).

Integración (`CatalogListingIntegrationTests`):

| Test | Cubre |
| --- | --- |
| `Series_ReturnOnlyActiveOnesWhoseFranchiseAndPublisherAreActive` | exclusión de Series inactivas y de Franchise/Publisher inactivos |
| `Series_AreOrderedByNameAscending` | orden fijo `Name ASC` con desempate por `Id` |
| `Series_SearchMatchesSeriesFranchiseOrPublisherName` | búsqueda por los tres nombres, con `OR` entre los tres |
| `SeriesCards_ExposeFranchiseAndPublisherNodesForThePills` | ambos nodos con `Id` y `Name` válidos en todos los elementos |
| `Cards_ExposeImageUrlOnlyWhenAnImageExists` | `urlImage` = `/images/{id}` o `null`, coincidente con la entidad |
| `Pagination_IsStableWithoutDuplicatesAcrossPages` / `Pagination_ReportsCorrectNavigationFlags` | scroll infinito sin repetidos ni huecos |
| `SearchWithNoMatches_ReturnsEmptyListWithoutError` | búsqueda sin resultados |

## Verificación

- `dotnet build api/ComicLibrary.sln` → 0 errores.
- Tests nuevos: **23/23 en verde** (compartidos con los otros dos listados).
- Suite completa: **219/219 en verde**.

## Verificación pendiente de ejecución manual

1. Usuario anónimo a `GET /api/catalog/series` → 401.
2. Usuario autenticado sin rol Administrator → 200.
3. Usuario autenticado con rol Administrator → 200.

## Criterios de aceptación

Endpoint: existe `GET /api/catalog/series`, requiere autenticación, no requiere `Administrator`, no admite anónimos, y acepta solo paginación y `search`.

Búsqueda: `search` cubre `Series.Name OR Franchise.Name OR Publisher.Name`, con `OR` real y ejecución en base de datos.

Contrato: devuelve `Id`, `Name`, `Color`, `UrlImage` y los nodos `Franchise` y `Publisher` con `Id`, `Name` y `Color`.

Arquitectura: el Controller delega en el Service, sin lógica EF ni filtrado. Documentación y pruebas actualizadas.