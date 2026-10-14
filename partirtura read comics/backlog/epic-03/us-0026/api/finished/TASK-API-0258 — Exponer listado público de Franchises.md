# TASK-API-0258 — Exponer listado público de Franchises

## Objetivo

Exponer el endpoint necesario para `/franchises` según US-0026.

## Endpoint

Debe recibir únicamente:

* parámetros de paginación;
* `search` opcional.

`search` debe aplicarse contra:

```text
Franchise.Name
OR
Publisher.Name
```

No debe recibir información de ordenamiento.

El backend debe aplicar siempre:

```text
Franchise.Active = true
OrderBy Franchise.Name ASC
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
```

## Instrucciones

El Controller debe delegar al Service.

No implementar lógica EF ni filtrado en Controller.

Actualizar la documentación de endpoints.

## Validación

Verificar:

* autenticación;
* paginación;
* búsqueda por Franchise;
* búsqueda por Publisher;
* OR entre ambos;
* exclusión de inactivos;
* orden `Name ASC`;
* contrato de respuesta.

---

# Resultado de ejecución

## Endpoint implementado

```http
GET /api/catalog/franchises
```

En `CatalogController` (`[Route("api/catalog")]`, `[Authorize]`), junto a los otros dos listados de US-0026.

```csharp
[HttpGet("franchises")]
public async Task<IActionResult> GetFranchises([FromQuery] GetCatalogFranchisesRequest request, CancellationToken cancellationToken)
{
    var result = await _franchiseService.GetCatalogPagedAsync(request, cancellationToken);
    return Ok(new ApiResponse<ListResponse<CatalogFranchiseCardDto>>(true, "OK", StatusCodes.Status200OK, result));
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
    "totalPages": 2,
    "pageSize": 24,
    "nextPage": 2,
    "priorPage": null,
    "totalCount": 37,
    "items": [
      {
        "id": 7,
        "name": "Deadpool",
        "color": "#C8102E",
        "urlImage": "/images/130",
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

`GetCatalogFranchisesRequest` expone solo `currentPage`, `pageSize` y `search`. Sin `orderBy` ni `orderDir`: el orden `Franchise.Name ASC` lo aplica el Repository. Sin filtros jerárquicos, a diferencia de `GET /api/franchises` que sí acepta `publisherId` para la cadena de filtros.

## Búsqueda

`Franchise.Name LIKE %search% OR Publisher.Name LIKE %search%`, parcial e insensible a mayúsculas por collation de columna, resuelta en SQL. Sin coincidencia devuelve lista vacía con `totalCount = 0`, no un 404.

## Decisión: se exige también el Publisher activo

Por decisión humana, la US pedía excluir solo las Franchises inactivas, pero se extenderó a toda la cadena: una Franchise con editorial desactivada tampoco se lista. Sin eso, la card mostraría el pill de una editorial que `GET /api/publishers/{id}` responde 404, una incoherencia visible para el usuario.

Como `Franchise.PublisherId` es FK requerida, el filtro se traduce a inner join y `publisher` siempre viene poblado. Por eso el nodo se declara no-nullable en el DTO, en lugar de dejarlo en `null` como el `FranchiseFilterDto` de filtros.

## Archivos nuevos

- `api/Api/Controllers/CatalogController.cs` — los tres endpoints de US-0026.
- `project/endpoints/endpoints-catalog.md` — documentación de los tres endpoints.

## Archivos modificados

- `project/endpoints.md` — índice de endpoints por controller.
- `project/endpoints/endpoints-franchises.md` — referencia cruzada al nuevo endpoint.

## Tests

Contrato (`CatalogControllerContractTests`): `[Authorize]` sin roles ni `[AllowAnonymous]`, ruta `api/catalog`, `HttpGet("franchises")` con `GetCatalogFranchisesRequest` y retorno `Task<IActionResult>`, request sin parámetros de ordenamiento, y forma exacta de `CatalogFranchiseCardDto` (`Id`, `Name`, `Color`, `UrlImage`, `Publisher`) y de `CatalogNodeDto`.

Integración (`CatalogListingIntegrationTests`):

| Test | Cubre |
| --- | --- |
| `Franchises_ReturnOnlyActiveOnesWhosePublisherIsActive` | exclusión de Franchises inactivas **y** de editoriales inactivas |
| `Franchises_AreOrderedByNameAscending` | orden fijo `Name ASC` con desempate por `Id` |
| `Franchises_SearchMatchesFranchiseNameOrPublisherName` | búsqueda por nombre propio y por nombre del Publisher, combinadas con `OR` |
| `FranchiseCards_ExposePublisherNodeForThePill` | nodo `Publisher` con `Id` y `Name` válidos en todos los elementos |
| `Cards_ExposeImageUrlOnlyWhenAnImageExists` | `urlImage` = `/images/{id}` o `null`, coincidente con la entidad |
| `Pagination_IsStableWithoutDuplicatesAcrossPages` / `Pagination_ReportsCorrectNavigationFlags` | scroll infinito sin repetidos ni huecos |
| `PageSize_IsCappedAndDefaultsToTwentyFour` / `SearchWithNoMatches_ReturnsEmptyListWithoutError` | paginación y búsqueda sin resultados |

## Verificación

- `dotnet build api/ComicLibrary.sln` → 0 errores.
- Tests nuevos: **23/23 en verde** (compartidos con los otros dos listados).
- Suite completa: **219/219 en verde**.

## Verificación pendiente de ejecución manual

1. Usuario anónimo a `GET /api/catalog/franchises` → 401.
2. Usuario autenticado sin rol Administrator → 200.
3. Usuario autenticado con rol Administrator → 200.

## Criterios de aceptación

Endpoint: existe `GET /api/catalog/franchises`, requiere autenticación, no requiere `Administrator`, no admite anónimos, y acepta solo paginación y `search`.

Búsqueda: `search` cubre `Franchise.Name OR Publisher.Name`, con `OR` real y ejecución en base de datos.

Contrato: devuelve `Id`, `Name`, `Color`, `UrlImage` y el nodo `Publisher` con `Id`, `Name` y `Color`.

Arquitectura: el Controller delega en el Service, sin lógica EF ni filtrado. Documentación y pruebas actualizadas.