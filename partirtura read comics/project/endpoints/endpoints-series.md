# Series Endpoints

Controllers covered:
- SeriesController — Public catalog filters (`/api/series`), Public Web series detail (`/api/series/{id}`)
- AdminSeriesController — Dashboard administration (`/api/admin-series`)

Related:
- `GET /api/catalog/series` (CatalogController) is the card listing of the Public Web explore
  page. It is a separate endpoint from the filter list documented below. See
  `endpoints-catalog.md`.

## GET /api/series

Paginated list of active series for the public catalog filters (autocomplete of `GET /api/works`). Never returns inactive series.

Controller: `SeriesController`
Auth: Bearer token required. Does **not** require the `Administrator` role.

### Query params

| Param | Type | Description |
| --- | --- | --- |
| currentPage | int | Page number (default 1) |
| pageSize | int | Items per page (default 12, max 24) |
| orderBy | string | Sort field: `Name`, `Franchise`, `Publisher`, `Country` (default `Name`) |
| orderDir | string | `ASC` or `DESC` (default ASC) |
| search | string | Partial case-insensitive match on series name, franchise name or publisher name |
| franchiseId | long? | Restricts the result to the series of that franchise |
| publisherId | long? | Restricts the result to the series of every franchise of that publisher |

### Comportamiento de los filtros jerárquicos

- Sin `franchiseId` ni `publisherId` el endpoint lista todas las series activas, como antes.
- Con `franchiseId` lista solo las series activas de esa franchise.
- Con solo `publisherId` lista las series activas de cualquier franchise de ese publisher.
- Con ambos, la franchise indicada debe pertenecer al publisher indicado; si no coincide, la respuesta es una lista vacía.
- Un id inexistente produce `200 OK` con lista vacía y `totalCount: 0`, no `404`: son filtros, no búsquedas de recurso.
- `search`, `franchiseId` y `publisherId` se combinan con AND.

### Response

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
    "pageSize": 12,
    "nextPage": 2,
    "priorPage": null,
    "totalCount": 40,
    "items": [
      {
        "id": 7,
        "name": "Uncanny X-Men",
        "color": "#FCD202",
        "franchiseId": 3,
        "franchiseName": "X-Men",
        "publisherId": 1,
        "publisherName": "Marvel Comics"
      }
    ]
  }
}
```

DTO: `Application/DTOs/CatalogFilterDtos.cs` — `SeriesFilterDto` (Id, Name, Color, FranchiseId, FranchiseName, PublisherId, PublisherName). Los campos de franchise desambiguan series que comparten nombre, y los de publisher permiten completar la cascada hacia Editorial. `PublisherId` y `PublisherName` se resuelven a través de `Series.Franchise.Publisher`, por lo que son `null` cuando la serie no tiene franquicia.

Status codes: `200 OK`, `401 Unauthorized` when the bearer token is missing or invalid.

## GET /api/series/{id}

Detalle público de una serie activa, para la página `/series/{id}` del Public Web. Nunca devuelve una serie inactiva.

Controller: `SeriesController`
Auth: Bearer token required. Does **not** require the `Administrator` role. No accesible para anónimos.

### Path params

| Param | Type | Description |
| --- | --- | --- |
| id | long | Series identifier. Debe ser mayor que 0 |

### Response

```json
{
  "success": true,
  "message": "OK",
  "code": 200,
  "payload": {
    "id": 5,
    "name": "The Amazing Spider-Man v1",
    "description": "Peter Parker teenage years, with the classic rogues gallery.",
    "color": "#FF0000",
    "urlImage": "/images/12",
    "franchise": {
      "id": 4,
      "name": "Fly",
      "color": "#7209B7"
    },
    "publisher": {
      "id": 4,
      "name": "Zenescope",
      "color": "#231f20"
    }
  }
}
```

DTO: `Application/DTOs/PublicSeriesDetailDto.cs` — `PublicSeriesDetailDto` (Id, Name, Description, Color, UrlImage, Franchise, Publisher) y `PublicSeriesNodeDto` (Id, Name, Color) para los nodos anidados.

### Status codes

| Status | Motivo |
| --- | --- |
| 200 | Serie activa encontrada |
| 401 | Bearer token ausente o inválido |
| 404 | La serie no existe o está inactiva. Ambos casos devuelven el mismo mensaje, para no revelar la existencia de un id desactivado |
| 422 | `id <= 0` (`ValidationException`) |

### Notas

- `urlImage` se construye con `ImageUrlBuilder.ToUrl` y se sirve desde el endpoint de imágenes, igual que en `PublisherFilterDto`, `FranchiseFilterDto` y `SeriesFilterDto`. Es `null` cuando la serie no tiene imagen. Nunca se expone `StoragePath` ni `FileName`.
- `description`, `color` y `urlImage` son opcionales: su ausencia no produce error y no se generan placeholders.
- Los nodos `franchise` y `publisher` exponen `Id`, `Name` y `Color`. El `color` de los nodos se agregó en 2026-10: la página renderiza tres pills (Serie, Franquicia, Editorial) y cada una toma su color de la entidad correspondiente, así que el frontend lo necesita en la respuesta en lugar de inventar un fallback o resolverlo con una segunda request. `Color` es nullable: ninguna entidad garantiza que esté seteado, y su ausencia produce el tratamiento de fallback del frontend, no un error. El nodo sigue sin exponer el resto del grafo (`ImageId`, `PublisherCountryName`, `CreatedAt`, flags de estado).
- Los nodos se construyen con acceso null-safe, así que una relación ausente produce `null` en lugar de una excepción. En la práctica `Series.FranchiseId` y `Franchise.PublisherId` son ambas claves foráneas obligatorias, así que siempre vienen poblados.
- Los valores de `franchise` y `publisher` son consistentes con `franchiseId`, `franchiseName`, `publisherId` y `publisherName` que devuelve `GET /api/series`. Ojo: `SeriesFilterDto` **no** expone `franchiseColor` ni `publisherColor`, así que los colores del detalle no se pueden contrastar contra el listado. Si el autocomplete de Public Web necesita pintar esas pills, falta ese campo en el listado y conviene una task aparte.
- El contrato administrativo sigue siendo `SeriesDetailDto`, en `GET /api/admin-series/{seriesId}`. No se modificó.

# Admin Series Endpoints

Controller: `AdminSeriesController`
Base route: `/api/admin-series`
Auth: All endpoints require Bearer token + `Administrator` role.

## GET /api/admin-series

Paginated list of series with search, filters, and sorting.

### Query params

| Param | Type | Description |
| --- | --- | --- |
| currentPage | int | Page number (default 1) |
| pageSize | int | Items per page (default 12, max 50) |
| orderBy | string | Sort field: `name`, `franchise`, `publisher`, `country` |
| orderDir | string | `ASC` or `DESC` (default ASC) |
| search | string | Search by series name, franchise name, or publisher name |
| publisherId | long? | Filter by publisher |
| franchiseId | long? | Filter by franchise |
| isActive | bool? | Filter by active status (null = all) |
| isFeatured | bool? | Filter by featured status (null = all) |
| isOngoing | bool? | Filter by ongoing status (null = all) |

### Response

```json
{
  "success": true,
  "message": "OK",
  "code": 200,
  "payload": {
    "currentPage": 1,
    "hasNext": false,
    "hasPrevious": false,
    "totalPages": 1,
    "pageSize": 12,
    "nextPage": null,
    "previousPage": null,
    "totalCount": 0,
    "items": [
      {
        "id": 1,
        "name": "The Amazing Spider-Man v1",
        "franchiseName": "Spider-Man",
        "publisherName": "Marvel",
        "publisherCountryName": "United States",
        "imageId": 5,
        "urlImage": "/images/5",
        "color": "#FF0000",
        "isFeatured": true,
        "isOngoing": false,
        "isActive": true,
        "createdAt": "2026-08-31T12:00:00Z"
      }
    ]
  }
}
```

## GET /api/admin-series/{seriesId}

Get full detail of a series including franchise info for editing.

### Path params

| Param | Type | Description |
| --- | --- | --- |
| seriesId | long | Series identifier |

### Response

```json
{
  "success": true,
  "message": "Series detail retrieved successfully.",
  "code": 200,
"payload": {
      "id": 1,
      "name": "The Amazing Spider-Man v1",
      "description": "Peter Parker teenage years, with the classic rogues gallery.",
      "franchiseId": 1,
      "franchiseName": "Spider-Man",
      "franchiseImageId": 3,
      "franchiseUrlImage": "/images/3",
      "franchiseColor": "#FF0000",
      "franchiseIsFeatured": true,
      "franchiseIsOngoing": true,
      "franchiseIsActive": true,
      "publisherId": 1,
      "publisherName": "Marvel",
      "publisherCountryName": "United States",
      "imageId": 5,
      "urlImage": "/images/5",
      "color": "#00FF00",
      "isFeatured": false,
      "isOngoing": false,
      "isActive": true
    }
}
```

### Errors

| Status | Message |
| --- | --- |
| 404 | La serie no existe. |

### Notes

- The detail response includes `publisherId`, `publisherName` and `publisherCountryName` so the Dashboard can render the editorial context (Editorial / Franquicia / Serie) in headers and forms without a second call.
- `publisherName` and `publisherCountryName` are consistent with the values returned by `GET /api/admin-series` (`SeriesListItemDto`) for the same series.
- `description` was added in 2026-10. It is nullable, so it is `null` for series created before the column existed, and `null` is a valid value rather than an error.

## POST /api/admin-series

Create a new series with optional image.

### Content-Type

`multipart/form-data`

### Form fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| name | string | Yes | Series name |
| description | string | No | Series description. Nullable; omit it or send an empty value to store `null` |
| franchiseId | long | Yes | Franchise identifier |
| color | string | No | Hex color `#RRGGBB` |
| isFeatured | bool | No | Featured flag |
| isOngoing | bool | No | Ongoing flag |
| avatar | file | No | Series image |

### Image behavior

| Scenario | Fields |
| --- | --- |
| No image | No avatar file |
| New image | avatar file provided |

### Response

```json
{
  "success": true,
  "message": "Series created successfully.",
  "code": 200,
  "payload": { ... }
}
```

### Errors

| Status | Message |
| --- | --- |
| 400 | El nombre es obligatorio. |
| 404 | La franquicia no existe o no está activa. |
| 400 | El color debe ser un valor hexadecimal válido en formato #RRGGBB. |

## PUT /api/admin-series/{seriesId}

Update an existing series with optional image.

### Content-Type

`multipart/form-data`

### Path params

| Param | Type | Description |
| --- | --- | --- |
| seriesId | long | Series identifier |

### Form fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| name | string | Yes | Series name |
| description | string | No | Series description. Send an empty value or omit it to clear the stored description |
| franchiseId | long | Yes | Franchise identifier |
| imageId | long? | No | Current image ID (0 to remove) |
| color | string | No | Hex color `#RRGGBB` |
| isFeatured | bool | No | Featured flag |
| isOngoing | bool | No | Ongoing flag |
| avatar | file | No | New series image |

### Image behavior

| Scenario | Fields |
| --- | --- |
| Keep image | imageId = existingId, no avatar |
| Replace image | imageId = 0, avatar file provided |
| Remove image | imageId = 0, no avatar |

### Response

```json
{
  "success": true,
  "message": "Series updated successfully.",
  "code": 200,
  "payload": { ... }
}
```

### Errors

| Status | Message |
| --- | --- |
| 400 | El identificador de la serie es obligatorio. |
| 404 | La serie no existe. |
| 400 | El nombre es obligatorio. |
| 404 | La franquicia no existe o no está activa. |
| 400 | El color debe ser un valor hexadecimal válido en formato #RRGGBB. |

## PATCH /api/admin-series/{seriesId}/deactivate

Deactivate a series (logical deactivation, idempotent).

### Path params

| Param | Type | Description |
| --- | --- | --- |
| seriesId | long | Series identifier |

### Response

```json
{
  "success": true,
  "message": "Series deactivated successfully.",
  "code": 200,
  "payload": null
}
```

### Errors

| Status | Message |
| --- | --- |
| 400 | El identificador de la serie es obligatorio. |
| 404 | La serie no existe. |

## PATCH /api/admin-series/{seriesId}/activate

Activate a series (logical activation, idempotent).

### Path params

| Param | Type | Description |
| --- | --- | --- |
| seriesId | long | Series identifier |

### Response

```json
{
  "success": true,
  "message": "Series activated successfully.",
  "code": 200,
  "payload": null
}
```

### Errors

| Status | Message |
| --- | --- |
| 400 | El identificador de la serie es obligatorio. |
| 404 | La serie no existe. |
