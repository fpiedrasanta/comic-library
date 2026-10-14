# TASK-API-0254 — Exponer listado público de Publishers

## Objetivo

Exponer el endpoint necesario para `/publishers` según US-0026.

## Endpoint

Implementar un endpoint de listado de Publishers para Public Web.

Debe recibir únicamente:

* parámetros de paginación;
* `search` opcional por nombre.

No debe recibir:

* campo de ordenamiento;
* dirección de ordenamiento.

El backend debe aplicar siempre:

```text
Active = true
OrderBy Name ASC
```

## Seguridad

* Autenticación: requerida.
* Administrator: no requerido.
* Usuario anónimo: rechazado.
* No utilizar `[AllowAnonymous]`.

## Resultado

El endpoint debe devolver la respuesta paginada con:

```text
Id
Name
Color
UrlImage
```

## Instrucciones

El Controller debe delegar al Service.

No implementar consultas EF ni reglas de negocio en el Controller.

Actualizar la documentación de endpoints correspondiente.

## Validación

Agregar o adaptar las pruebas de contrato/integración necesarias para verificar:

* autenticación;
* paginación;
* búsqueda;
* exclusión de inactivos;
* orden `Name ASC`;
* contrato de respuesta.

---

# Resultado de ejecución

## Endpoint implementado

```http
GET /api/catalog/publishers
```

En `CatalogController`, un controller nuevo con `[Route("api/catalog")]` y `[Authorize]`, que agrupa los tres listados de US-0026 en un solo lugar.

```csharp
[HttpGet("publishers")]
public async Task<IActionResult> GetPublishers([FromQuery] GetCatalogPublishersRequest request, CancellationToken cancellationToken)
{
    var result = await _publisherService.GetCatalogPagedAsync(request, cancellationToken);
    return Ok(new ApiResponse<ListResponse<CatalogPublisherCardDto>>(true, "OK", StatusCodes.Status200OK, result));
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
    "totalPages": 3,
    "pageSize": 24,
    "nextPage": 2,
    "priorPage": null,
    "totalCount": 61,
    "items": [
      { "id": 2, "name": "Marvel Comics", "color": "#EC1D24", "urlImage": "/images/123" }
    ]
  }
}
```

## Seguridad

- `[Authorize]` a nivel de controller, sin `Roles`, por lo que cualquier usuario autenticado entra y no se exige `Administrator`.
- No hay `[AllowAnonymous]`: el usuario anónimo recibe 401.
- Se sigue la convención del proyecto de validar la seguridad por atributos, ya que la API no se monta con `WebApplicationFactory` en el proyecto de tests. La comprobación HTTP queda para prueba manual.

## Contrato de entrada

`GetCatalogPublishersRequest` expone exactamente tres propiedades: `currentPage`, `pageSize` y `search`. No hay `orderBy` ni `orderDir`: el orden `Name ASC` lo aplica el Repository. Un cliente que siga enviando esos parámetros no rompe nada, porque el model binding ignora query strings desconocidos y recibe el orden fijo.

## Decisiones

### Endpoint nuevo, no reutilización de `GET /api/publishers`

Las tres rutas de la US ya existen, pero cumplen otro contrato: son el autocomplete y la cadena de filtros del catálogo de Works (`GET /api/works`), devuelven DTOs sin `urlImage`, aceptan `orderBy`/`orderDir` y buscan también por nombre de país. El usuario decidió no modificarlas porque no se conoce su uso exacto en el frontend. Por eso los listados de US-0026 viven en `/api/catalog/*`, con DTOs y queries propios.

### Controller sin lógica

La acción solo delega en `IPublisherService` y envuelve el resultado en `ApiResponse<ListResponse<T>>`. No hay consultas EF, ni filtros, ni ordenamiento en el Controller.

### Sin rate limiting

Es una lectura de catálogo igual que los listados públicos existentes, por lo que no lleva `[EnableRateLimiting]`.

## Archivos nuevos

- `api/Api/Controllers/CatalogController.cs` — los tres endpoints de US-0026.
- `project/endpoints/endpoints-catalog.md` — documentación de los tres endpoints.

## Archivos modificados

- `project/endpoints.md` — índice de endpoints por controller.
- `project/endpoints/endpoints-publishers.md` — referencia cruzada al nuevo endpoint.

## Tests

`CatalogControllerContractTests` (8 casos):

| Test | Cubre |
| --- | --- |
| `CatalogController_RequiresAuthenticatedUserWithoutAdministratorRole` | `[Authorize]` presente, sin `[AllowAnonymous]` y sin `Roles` |
| `CatalogController_UsesCatalogRoutePrefix` | ruta base `api/catalog` |
| `CatalogController_ExposesGetPerEntity` (3 casos) | `HttpGet("publishers"/"franchises"/"series")`, request propia y retorno `Task<IActionResult>` |
| `CatalogRequests_AcceptOnlyPagingAndSearch` | las tres requests exponen solo `currentPage`, `pageSize` y `search` |
| `CatalogCardDtos_ExposeOnlyTheCardInformation` | forma exacta de los tres DTO de card y del nodo; sin campos administrativos |

`CatalogListingIntegrationTests` (15 casos), data-driven sobre la base de desarrollo, sin crear ni eliminar datos. Cubren activos, orden `Name ASC`, búsqueda parcial e insensible a mayúsculas, `OR` entre nombres propios y de padres, nodos poblados, `urlImage` coherente con la entidad, paginación estable sin duplicados, flags de navegación, tope y default de `pageSize` y búsqueda sin resultados.

## Verificación

- `dotnet build api/ComicLibrary.sln` → 0 errores.
- Tests nuevos: **23/23 en verde** (8 de contrato + 15 de integración).
- Suite completa: **219/219 en verde**.

## Verificación pendiente de ejecución manual

1. Usuario anónimo a `GET /api/catalog/publishers` → 401.
2. Usuario autenticado sin rol Administrator → 200.
3. Usuario autenticado con rol Administrator → 200.

## Criterios de aceptación

Endpoint: existe `GET /api/catalog/publishers`, requiere autenticación, no requiere `Administrator`, no admite anónimos y acepta solo paginación y `search`.

Reglas: el backend aplica siempre `IsActive = true` y `OrderBy Name ASC`, sin parámetros de ordenamiento.

Contrato: devuelve `Id`, `Name`, `Color` y `UrlImage` paginados.

Arquitectura: el Controller delega en el Service y no contiene consultas EF ni reglas de negocio.

Documentación y pruebas: `endpoints-catalog.md` y `endpoints-publishers.md` actualizados, con la referencia cruzada entre el endpoint de listado y el de filtros; 23 tests nuevos; build y suite completa en verde.