# Endpoints

## GET /api/admin-roles

Description:
Returns a paginated list of roles (e.g., Writer, Artist, Inker) for autocomplete and selection in the Dashboard.

Controller:
AdminRolesController

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
          "totalCount": 4,
          "items": [
              { "id": 1, "name": "Writer", "isActive": true },
              { "id": 2, "name": "Artist", "isActive": true },
              { "id": 3, "name": "Inker", "isActive": true },
              { "id": 4, "name": "Colorist", "isActive": true }
          ]
      }
  }

Response Type:
ApiResponse<ListResponse<RoleListItemDto>>

Errors:
- 401 Unauthorized
- 403 Forbidden

Notes:
- Requires authentication.
- Requires Administrator role.
- search is a partial case-insensitive match on Name.
- Default ordering is Name ASC.
- The operation is read-only.
- Roles are persistent, administrable entities, not rigid enums.

---

## POST /api/admin-roles

Description:
Creates a new role.

Controller:
AdminRolesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: application/json
- Body:
  {
      "name": "Colorist"
  }

Response:
- 201 Created
  Headers:
  - Location: /api/admin-roles?id={id}
  Body:
  {
      "success": true,
      "message": "Role created successfully.",
      "code": 201,
      "payload": {
          "id": 4,
          "name": "Colorist",
          "isActive": true
      }
  }

Response Type:
ApiResponse<RoleListItemDto>

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
      "message": "Ya existe un rol con ese nombre.",
      "code": 409,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Name is required and must be unique at the database level.
- Typically invoked from a "+ Role" modal opened from the Number editor.
- The new role becomes immediately available for assignment to a Person in a Number.

---

## PUT /api/admin-roles/{roleId}

Description:
Updates the name of an existing role.

Controller:
AdminRolesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- roleId: long (path)

Request:
- Content-Type: application/json
- Body:
  {
      "name": "Nuevo Nombre"
  }

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Role updated successfully.",
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
      "message": "El rol no existe.",
      "code": 404,
      "payload": null
  }
- 409 Conflict
  {
      "success": false,
      "message": "Ya existe un rol con el mismo nombre.",
      "code": 409,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Id cannot be modified.
- Name must be unique.

---

## POST /api/admin-roles/{roleId}/deactivate

Description:
Deactivates a role (logical deletion via IsActive).

Controller:
AdminRolesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- roleId: long (path)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Role deactivated successfully.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 404 Not Found
  {
      "success": false,
      "message": "El rol no existe.",
      "code": 404,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Uses logical deletion via IsActive = false.
- Does not modify existing PersonByRole relationships.
- Idempotent: no error if already deactivated.

---

## POST /api/admin-roles/{roleId}/activate

Description:
Reactivates a previously deactivated role.

Controller:
AdminRolesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- roleId: long (path)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Role activated successfully.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 404 Not Found
  {
      "success": false,
      "message": "El rol no existe.",
      "code": 404,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Uses IsActive = true.
- Does not modify existing PersonByRole relationships.
- Idempotent: no error if already active.
