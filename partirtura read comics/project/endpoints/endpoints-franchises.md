# Endpoints

Controllers covered:
- FranchisesController — Public catalog filters, Public Web franchise detail
- AdminFranchisesController — Dashboard administration

Related:
- `GET /api/catalog/franchises` (CatalogController) is the card listing of the Public Web explore
  page. It is a separate endpoint from the filter list documented below. See
  `endpoints-catalog.md`.

## GET /api/franchises

Description:
Returns a paginated list of active franchises for the public catalog filters (autocomplete of `GET /api/works`). Never returns inactive franchises.

Controller:
FranchisesController

Authentication:
- Required. Bearer token in Authorization header.
- Does not require the Administrator role.

Request parameters:
- currentPage: integer (default 1)
- pageSize: integer (default 12, max 24)
- orderBy: string (optional, allowed: Name, PublisherName, PublisherCountry)
- orderDir: string (default ASC)
- search: string (optional, partial case-insensitive match on franchise name, publisher name, or country name)
- publisherId: long (optional, restricts the result to the franchises of that publisher; combines with `search` using AND)

Behavior of the optional filter:
- Without `publisherId` the endpoint lists every active franchise, as before.
- With `publisherId` it lists only the active franchises of that publisher.
- With a `publisherId` that does not exist the response is `200 OK` with an empty list and `totalCount: 0`. It is a filter, not a resource lookup, so it does not return `404`.
- `search` and `publisherId` combine with AND.

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "OK",
      "code": 200,
      "payload": {
          "currentPage": 1,
          "hasNextPage": false,
          "hasPriorPage": false,
          "totalPages": 1,
          "pageSize": 12,
          "nextPage": null,
          "priorPage": null,
          "totalCount": 4,
          "items": [
              {
                  "id": 3,
                  "name": "X-Men",
                  "color": "#FCD202",
                  "publisherId": 1,
                  "publisherName": "Marvel Comics"
              }
          ]
      }
  }
- 401 Unauthorized when the bearer token is missing or invalid.

DTO:
`Application/DTOs/CatalogFilterDtos.cs` — `FranchiseFilterDto` (Id, Name, Color, PublisherId, PublisherName). The publisher fields disambiguate franchises that share a name across publishers.

## GET /api/franchises/{id}

Description:
Returns the public detail of a single active franchise, used by the Public Web page `/franchises/{id}` to build its header. Never returns an inactive franchise.

Controller:
FranchisesController

Authentication:
- Required. Bearer token in Authorization header.
- Does not require the Administrator role.
- Not available to anonymous callers.

Request parameters:
- id: long, path, required. Must be greater than 0.

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "OK",
      "code": 200,
      "payload": {
          "id": 3,
          "name": "X-Men",
          "description": "Mutants with the X-gene and their conflicts.",
          "color": "#FCD202",
          "urlImage": "/images/57",
          "publisherId": 1,
          "publisherName": "Marvel Comics",
          "publisherColor": "#f51b00"
      }
  }
- 401 Unauthorized when the bearer token is missing or invalid.
- 404 Not Found when the franchise does not exist or is inactive. Both cases return the same message, so the existence of a deactivated id is not disclosed.
- 422 Unprocessable Entity when `id <= 0` (`ValidationException`).

DTO:
`Application/DTOs/PublicFranchiseDetailDto.cs` — `PublicFranchiseDetailDto` (Id, Name, Description, Color, UrlImage, PublisherId, PublisherName, PublisherColor).

Notes:
- `urlImage` is built with `ImageUrlBuilder.ToUrl` and served by the image endpoint, following the same convention as `PublisherFilterDto`, `FranchiseFilterDto` and `SeriesFilterDto`. It is `null` when the franchise has no image. `StoragePath` and `FileName` are never exposed.
- `description` and `color` are nullable; their absence does not produce an error and no placeholder is generated.
- `publisherId`, `publisherName` and `publisherColor` are resolved from the loaded `Publisher` navigation through the domain helpers `GetPublisherId()` and `GetPublisherName()`, plus `Publisher.Color`. They are consistent with the `publisherId` and `publisherName` returned by `GET /api/franchises`.
- The three publisher fields are typed nullable, but in practice they are always populated: `Franchise.PublisherId` is a required foreign key (`DeleteBehavior.Restrict`), so a franchise cannot exist without a publisher. The nullability is defensive and keeps the mapping symmetric with `FranchiseFilterDto`; it does not mean the field may be empty.
- `publisherColor` is included so Public Web can render the publisher pill and the hierarchy frame without a second request. It is not part of `FranchiseFilterDto`.
- The administrative contract is `FranchiseDetailDto` (`GET /api/admin-franchises/{franchiseId}`), which additionally exposes `PublisherCountryName`, `ImageId`, `IsFeatured`, `IsOngoing` and `IsActive`. None of those fields are public.

## GET /api/admin-franchises

Description:
Returns a paginated list of franchises for the Dashboard administrative view.

Controller:
AdminFranchisesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- currentPage: integer (default 1)
- pageSize: integer (default 12, max 50)
- orderBy: string (optional, allowed: Name, PublisherCountry, PublisherName)
- orderDir: string (default ASC)
- search: string (optional, partial case-insensitive match on franchise name, publisher name, or country name)
- isActive: boolean (optional)
- isFeatured: boolean (optional)
- isOngoing: boolean (optional)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "OK",
      "code": 200,
      "payload": {
          "currentPage": 1,
          "hasNextPage": true,
          "hasPriorPage": false,
          "totalPages": 10,
          "pageSize": 12,
          "nextPage": 2,
          "priorPage": null,
          "totalCount": 120,
          "items": [
              {
                  "id": 1,
                  "name": "Marvel Universe",
                  "publisherName": "Marvel Comics",
                  "publisherCountryName": "United States",
                  "imageId": 123,
                  "color": "#ED1C24",
                  "isFeatured": true,
                  "isOngoing": true,
                  "isActive": true
              }
          ]
      }
  }

Response Type:
ApiResponse<ListResponse<FranchiseListItemDto>>

Errors:
- 401 Unauthorized
- 403 Forbidden

Notes:
- Requires authentication.
- Requires Administrator role.
- Search performs partial case-insensitive match on franchise name, publisher name, and country name.
- Filters: isActive, isFeatured, isOngoing (null returns all).
- Ordering by country uses Publisher.Country.Name.
- Ordering by publisher uses Publisher.Name.

---

## GET /api/admin-franchises/{franchiseId}

Description:
Returns the detail of a specific franchise by its ID.

Controller:
AdminFranchisesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Route parameter: franchiseId (long)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Franchise detail retrieved successfully.",
      "code": 200,
      "payload": {
          "id": 1,
          "name": "Marvel Universe",
          "description": "The Marvel Universe is a fictional shared universe...",
          "publisherId": 1,
          "publisherName": "Marvel Comics",
          "publisherCountryName": "United States",
          "imageId": 123,
          "color": "#ED1C24",
          "isFeatured": true,
          "isOngoing": true,
          "isActive": true
      }
  }

Response Type:
ApiResponse<FranchiseDetailDto>

Errors:
- 404 Not Found
  {
      "success": false,
      "message": "La franquicia no existe.",
      "code": 404,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Used by the Dashboard to load franchise data for editing.

---

## POST /api/admin-franchises

Description:
Creates a new franchise.

Controller:
AdminFranchisesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: multipart/form-data
- Fields:
  - name: string
  - description: string (optional)
  - publisherId: long
  - color: string (optional, hex format #RRGGBB)
  - isFeatured: boolean
  - isOngoing: boolean
  - avatar: file (optional, image file)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Franchise created successfully.",
      "code": 200,
      "payload": {
          "id": 1,
          "name": "Marvel Universe",
          "description": "Description...",
          "publisherId": 1,
          "publisherName": "Marvel Comics",
          "publisherCountryName": "United States",
          "imageId": 123,
          "color": "#ED1C24",
          "isFeatured": true,
          "isOngoing": true,
          "isActive": true
      }
  }

Response Type:
ApiResponse<FranchiseDetailDto>

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El nombre es obligatorio.",
      "code": 400,
      "payload": { "detail": "El nombre es obligatorio." }
  }
- 404 Not Found
  {
      "success": false,
      "message": "La editorial no existe o no está activa.",
      "code": 404,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Name is required.
- Publisher must exist and be active.
- Color is optional, must be valid hex #RRGGBB when provided.
- Image is optional.
- Franchise is created with IsActive = true.

---

## PUT /api/admin-franchises/{franchiseId}

Description:
Updates an existing franchise.

Controller:
AdminFranchisesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: multipart/form-data
- Fields:
  - name: string
  - description: string (optional)
  - publisherId: long
  - imageId: long (optional, existing image ID to keep)
  - color: string (optional, hex format #RRGGBB)
  - isFeatured: boolean
  - isOngoing: boolean
  - avatar: file (optional, image file)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Franchise updated successfully.",
      "code": 200,
      "payload": {
          "id": 1,
          "name": "Marvel Universe",
          "description": "Updated description...",
          "publisherId": 1,
          "publisherName": "Marvel Comics",
          "publisherCountryName": "United States",
          "imageId": 123,
          "color": "#ED1C24",
          "isFeatured": true,
          "isOngoing": true,
          "isActive": true
      }
  }

Response Type:
ApiResponse<FranchiseDetailDto>

Errors:
- 400 Bad Request
- 404 Not Found

Notes:
- Requires authentication.
- Requires Administrator role.
- imageId = existingId + avatar = null → keep current image.
- imageId = 0 + avatar = file → replace image.
- imageId = 0 + avatar = null → delete image.
- Publisher can be changed (must exist and be active).
- IsActive cannot be modified through this endpoint.

---

## PATCH /api/admin-franchises/{franchiseId}/deactivate

Description:
Logically deactivates a franchise by setting IsActive = false.

Controller:
AdminFranchisesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Body: empty

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Franchise deactivated successfully.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 404 Not Found
  {
      "success": false,
      "message": "La franquicia no existe.",
      "code": 404,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Logical deactivation (no physical delete).
- Idempotent operation.

---

## PATCH /api/admin-franchises/{franchiseId}/activate

Description:
Logically activates a franchise by setting IsActive = true.

Controller:
AdminFranchisesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Body: empty

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Franchise activated successfully.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 404 Not Found
  {
      "success": false,
      "message": "La franquicia no existe.",
      "code": 404,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Logical activation.
- Idempotent operation.
