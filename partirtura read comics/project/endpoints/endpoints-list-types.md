# Endpoints

## GET /api/list-types

Description:
Returns the paginated list of active list types used to render the Public Web list type
autocomplete on `/lists`. Only list types with `IsActive = true` are returned. This endpoint
does not depend on which lists have been loaded; it returns the full catalog of 85 active list
types (or however many exist).

Controller:
ListTypesController

Authentication:
- Required. Bearer token in Authorization header.
- Any authenticated user. Does not require the Administrator role.
- Anonymous access is not allowed (`[Authorize]`, no `[AllowAnonymous]`).

Request parameters:
- currentPage: integer (default 1)
- pageSize: integer (default 12, max 24)
- search: string (optional, partial case-insensitive match on the list type name)
- orderBy: string (optional, `name` or `createdAt`; default `name`)
- orderDir: string (optional, `ASC` or `DESC`; default `ASC`)

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
          "totalPages": 5,
          "pageSize": 12,
          "nextPage": 2,
          "priorPage": null,
          "totalCount": 85,
          "items": [
              { "id": 1, "name": "Arco argumental" },
              { "id": 2, "name": "Saga" }
          ]
      }
  }
- 401 Unauthorized when the bearer token is missing or invalid.

Response Type:
`ApiResponse<ListResponse<ListTypeFilterDto>>`

DTO:
`Application/DTOs/CatalogFilterDtos.cs` — `ListTypeFilterDto` (Id, Name).

Notes:
- Only active list types are returned. `IsActive` is never exposed in the response.
- Default ordering is `Name ASC`.
- `pageSize` is capped at `PaginationGuard.CatalogFilterMaxPageSize` (24).
- Read-only. No side effects.

---

## GET /api/admin-list-types

Description:
Returns a paginated list of list types for administration. Supports search by name, filter by active status, ordering, and pagination.

Controller:
AdminListTypesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- currentPage: integer (default 1)
- pageSize: integer (default 12, max 50)
- orderBy: string (optional; sortable fields: `name`, `createdAt`, `isActive`)
- orderDir: string (default `ASC`, optional `DESC`)
- search: string (optional, partial case-insensitive match on Name)
- isActive: boolean (optional; filter by active/inactive status)

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
          "totalPages": 5,
          "pageSize": 12,
          "nextPage": 2,
          "priorPage": null,
          "totalCount": 60,
          "items": [
              { "id": 1, "name": "Arco argumental", "isActive": true },
              { "id": 2, "name": "Saga", "isActive": true }
          ]
      }
  }

Response Type:
ApiResponse<ListResponse<ListTypeListItemDto>>

Errors:
- 401 Unauthorized
- 403 Forbidden

Notes:
- Requires authentication.
- Requires Administrator role.
- search is a partial case-insensitive match on Name.
- Default ordering is Name ASC.
- The operation is read-only.

---

## POST /api/admin-list-types

Description:
Creates a new list type.

Controller:
AdminListTypesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: application/json
- Body:
  {
      "name": "Evento"
  }

Response:
- 201 Created
  Headers:
  Location: /api/admin-list-types?currentPage=1&pageSize=12&search=Evento
  Body:
  {
      "success": true,
      "message": "ListType created successfully.",
      "code": 201,
      "payload": {
          "id": 5,
          "name": "Evento",
          "isActive": true
      }
  }

Response Type:
ApiResponse<ListTypeListItemDto>

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El nombre es obligatorio.",
      "code": 400,
      "payload": { "detail": "El nombre es obligatorio." }
  }
- 409 Conflict
  {
      "success": false,
      "message": "Ya existe un tipo de lista con ese nombre.",
      "code": 409,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Name is required and must be unique at the database level.
- The new list type is created with IsActive = true.

---

## PUT /api/admin-list-types/{listTypeId}

Description:
Updates the name of an existing list type.

Controller:
AdminListTypesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- listTypeId: long (path)

Request:
- Content-Type: application/json
- Body:
  {
      "name": "Orden de lectura"
  }

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "ListType updated successfully.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

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
      "message": "El tipo de lista no existe.",
      "code": 404,
      "payload": null
  }
- 409 Conflict
  {
      "success": false,
      "message": "Ya existe un tipo de lista con ese nombre.",
      "code": 409,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Name is required and must be unique.
- The list type Id cannot be modified.

---

## POST /api/admin-list-types/{listTypeId}/deactivate

Description:
Deactivates a list type using logical deletion via `IsActive = false`. Existing lists that reference this type are preserved unchanged.

Controller:
AdminListTypesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- listTypeId: long (path)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "ListType deactivated successfully.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 404 Not Found
  {
      "success": false,
      "message": "El tipo de lista no existe.",
      "code": 404,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Deactivation is logical — no records are deleted.
- Existing relations with lists are preserved.
- Already-deactivated list types return 200 without error (idempotent).

---

## POST /api/admin-list-types/{listTypeId}/activate

Description:
Reactivates a previously deactivated list type by setting `IsActive = true`.

Controller:
AdminListTypesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- listTypeId: long (path)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "ListType activated successfully.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 404 Not Found
  {
      "success": false,
      "message": "El tipo de lista no existe.",
      "code": 404,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Already-active list types return 200 without error (idempotent).
