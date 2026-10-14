# Endpoints — Work Types

Controllers covered:
- WorkTypesController — Public catalog filters
- AdminWorkTypesController — WorkType catalog CRUD

## GET /api/work-types

Description:
Returns a paginated list of active work types for the public catalog filters (autocomplete of `GET /api/works`). Never returns inactive work types.

Controller:
WorkTypesController

Authentication:
- Required. Bearer token in Authorization header.
- Does not require the Administrator role.

Request parameters:
- currentPage: integer (default 1)
- pageSize: integer (default 12, max 24)
- orderBy: string (optional, allowed: Name, CreatedAt, IsActive)
- orderDir: string (default ASC)
- search: string (optional, partial case-insensitive match on work type name)

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
          "totalCount": 6,
          "items": [
              {
                  "id": 1,
                  "name": "Number"
              }
          ]
      }
  }
- 401 Unauthorized when the bearer token is missing or invalid.

DTO:
`Application/DTOs/CatalogFilterDtos.cs` — `WorkTypeFilterDto` (Id, Name).

## GET /api/admin-work-types

Description:
Returns a paginated list of work types. Supports filtering by name and active status. Default sort is by Name ASC.

Controller:
AdminWorkTypesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Query parameters:
  - `currentPage` (int, default: 1)
  - `pageSize` (int, default: 12)
  - `search` (string, optional) — filters by name using LIKE
  - `isActive` (bool, optional)
  - `orderBy` (string, optional) — supported: `name`, `createdAt`, `isActive`
  - `orderDir` (string, optional) — `ASC` or `DESC`, default: `ASC`

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "OK",
      "code": 200,
      "payload": {
          "items": [
              { "id": 1, "name": "Number", "isActive": true }
          ],
          "totalCount": 1,
          "currentPage": 1,
          "pageSize": 12,
          "totalPages": 1
      }
  }

Response Type:
ApiResponse<ListResponse<WorkTypeListItemDto>>

Errors:
- 401 Unauthorized
- 403 Forbidden

Notes:
- Requires authentication.
- Requires Administrator role.
- Default `pageSize` is 12.
- Default ordering is by `Name` ascending.
- `search` filters by name using `LIKE %term%`.

---

## POST /api/admin-work-types

Description:
Creates a new work type.

Controller:
AdminWorkTypesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: application/json
- Body:
  {
      "name": "Number"
  }

Response:
- 201 Created
  Body:
  {
      "success": true,
      "message": "Work type created successfully.",
      "code": 201,
      "payload": {
          "id": 1,
          "name": "Number",
          "isActive": true
      }
  }

Response Type:
ApiResponse<WorkTypeListItemDto>

Errors:
- 400 Bad Request — name is empty or whitespace
- 409 Conflict — a work type with the same name already exists
- 401 Unauthorized
- 403 Forbidden

Notes:
- Requires authentication.
- Requires Administrator role.
- Name uniqueness is enforced.
- `IsActive` defaults to `true`.

---

## GET /api/admin-work-types/{workTypeId}

Description:
Returns a work type by its ID.

Controller:
AdminWorkTypesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Route parameter: workTypeId (long)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "OK",
      "code": 200,
      "payload": {
          "id": 1,
          "name": "Number",
          "isActive": true,
          "createdAt": "2026-01-01T00:00:00Z"
      }
  }

Response Type:
ApiResponse<WorkType>

Errors:
- 404 Not Found — the work type does not exist
- 401 Unauthorized
- 403 Forbidden

Notes:
- Requires authentication.
- Requires Administrator role.

---

## PUT /api/admin-work-types/{workTypeId}

Description:
Updates a work type's name.

Controller:
AdminWorkTypesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: application/json
- Route parameter: workTypeId (long)
- Body:
  {
      "name": "Updated Name"
  }

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Work type updated successfully.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 400 Bad Request — name is empty or whitespace
- 404 Not Found — the work type does not exist
- 409 Conflict — another work type with the same name already exists
- 401 Unauthorized
- 403 Forbidden

Notes:
- Requires authentication.
- Requires Administrator role.
- Name uniqueness is enforced across all work types.

---

## POST /api/admin-work-types/{workTypeId}/deactivate

Description:
Logically deactivates a work type.

Controller:
AdminWorkTypesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Route parameter: workTypeId (long)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Work type deactivated successfully.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 404 Not Found — the work type does not exist
- 401 Unauthorized
- 403 Forbidden

Notes:
- Requires authentication.
- Requires Administrator role.
- Idempotent: if already deactivated, returns 200 without changes.

---

## POST /api/admin-work-types/{workTypeId}/activate

Description:
Logically activates a work type.

Controller:
AdminWorkTypesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Route parameter: workTypeId (long)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Work type activated successfully.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 404 Not Found — the work type does not exist
- 401 Unauthorized
- 403 Forbidden

Notes:
- Requires authentication.
- Requires Administrator role.
- Idempotent: if already activated, returns 200 without changes.
