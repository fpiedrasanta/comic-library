# Endpoints

## GET /api/admin-persons

Description:
Returns a paginated list of persons for administrative management.

Controller:
AdminPersonsController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- currentPage: integer (default 1)
- pageSize: integer (default 12, max 50)
- orderBy: string (optional, allowed: Name, CreatedAt)
- orderDir: string (default ASC)
- search: string (optional, partial case-insensitive match on Name)
- isActive: boolean (optional, filters by active/inactive status)

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
          "totalCount": 3,
          "items": [
              {
                  "id": 1,
                  "name": "Alan Moore",
                  "isActive": true
              }
          ]
      }
  }

Response Type:
ApiResponse<ListResponse<PersonListItemDto>>

Errors:
- 401 Unauthorized
- 403 Forbidden

Notes:
- Requires authentication.
- Requires Administrator role.
- search is a partial case-insensitive match on Name.
- Default ordering is Name ASC.
- The operation is read-only.
- Includes both active and inactive persons.

---

## POST /api/admin-persons

Description:
Creates a new person.

Controller:
AdminPersonsController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: application/json
- Body:
  {
      "name": "Alan Moore"
  }

Response:
- 201 Created
  Body:
  {
      "success": true,
      "message": "Person created successfully.",
      "code": 201,
      "payload": {
          "id": 1,
          "name": "Alan Moore",
          "isActive": true
      }
  }

Response Type:
ApiResponse<PersonListItemDto>

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
      "message": "Ya existe una persona con el mismo nombre.",
      "code": 409,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Name is required and must not be blank.
- Name is not required to be unique at the domain level; the backend checks for duplicates and returns 409 if found.
- The new person is created with IsActive = true.
- Returns 201 Created with Location header.

---

## PUT /api/admin-persons/{id}

Description:
Updates an existing person.

Controller:
AdminPersonsController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: application/json
- Body:
  {
      "name": "Alan W. Moore"
  }

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Person updated successfully.",
      "code": 200,
      "payload": {
          "id": 1,
          "name": "Alan W. Moore",
          "isActive": true
      }
  }

Response Type:
ApiResponse<PersonListItemDto>

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El identificador de la persona es obligatorio.",
      "code": 400,
      "payload": { "detail": "El identificador de la persona es obligatorio." }
  }
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
      "message": "La persona no existe.",
      "code": 404,
      "payload": null
  }
- 409 Conflict
  {
      "success": false,
      "message": "Ya existe una persona con el mismo nombre.",
      "code": 409,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- The identifier is taken from the route and cannot be overridden by the body.
- Only Name is updatable.
- IsActive is not modified through this endpoint.

---

## POST /api/admin-persons/{id}/deactivate

Description:
Deactivates a person logically.

Controller:
AdminPersonsController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Response:
- 204 No Content

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El identificador de la persona es obligatorio.",
      "code": 400,
      "payload": { "detail": "El identificador de la persona es obligatorio." }
  }
- 404 Not Found
  {
      "success": false,
      "message": "La persona no existe.",
      "code": 404,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Sets IsActive = false without physical deletion.
- Existing PersonByRole relationships are preserved.
- Idempotent: if the person is already inactive, returns 204 without changes.

---

## POST /api/admin-persons/{id}/activate

Description:
Reactivates a deactivated person.

Controller:
AdminPersonsController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Response:
- 204 No Content

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El identificador de la persona es obligatorio.",
      "code": 400,
      "payload": { "detail": "El identificador de la persona es obligatorio." }
  }
- 404 Not Found
  {
      "success": false,
      "message": "La persona no existe.",
      "code": 404,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Sets IsActive = true.
- Existing PersonByRole relationships are preserved.
- Idempotent: if the person is already active, returns 204 without changes.
