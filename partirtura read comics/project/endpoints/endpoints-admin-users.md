# Endpoints

## GET /api/admin-users

Description:
Returns a paginated list of users with role `Administrator` for the Dashboard administrative view.

Controller:
AdminUsersController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- currentPage: integer (default 1)
- pageSize: integer (default 12, max 50)
- orderBy: string (optional, allowed: FirstName, LastName, Email, CreatedAt)
- orderDir: string (default ASC)
- search: string (optional, partial case-insensitive match on first name, last name, or email)

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
                  "id": 123,
                  "firstName": "John",
                  "lastName": "Doe",
                  "email": "john@example.com",
                  "avatarUrl": "/images/456",
                  "countryName": "Argentina",
                  "createdAt": "2026-01-01T00:00:00Z",
                  "isActive": true
              }
          ]
      }
  }

Response Type:
ApiResponse<ListResponse<AdminUserListItemDto>>

Errors:
- 401 Unauthorized
  {
      "success": false,
      "message": "Se generó un error durante el proceso de autenticación.",
      "code": 401,
      "payload": null
  }
- 403 Forbidden
  {
      "success": false,
      "message": "Se generó un error durante el proceso de autorización.",
      "code": 403,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Returns only users with role `Administrator`.
- search performs a partial case-insensitive match on first name, last name, and email.
- The default ordering is CreatedAt DESC.
- The operation is read-only.
- The response does not expose passwords, refresh tokens, or other sensitive data.

---

## GET /api/admin-users/{userId}

Description:
Returns the details of a specific user with role `Administrator` for the Dashboard administrative view.

Controller:
AdminUsersController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- userId: long (route parameter)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "OK",
      "code": 200,
      "payload": {
          "id": 123,
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "countryId": 1,
          "countryName": "Argentina",
          "avatarUrl": "/images/456",
          "isActive": true
      }
  }

Response Type:
ApiResponse<AdminUserDetailDto>

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El usuario es obligatorio.",
      "code": 400,
      "payload": { "detail": "El usuario es obligatorio." }
  }
- 401 Unauthorized
  {
      "success": false,
      "message": "Se generó un error durante el proceso de autenticación.",
      "code": 401,
      "payload": null
  }
- 403 Forbidden
  {
      "success": false,
      "message": "Se generó un error durante el proceso de autorización.",
      "code": 403,
      "payload": null
  }
- 404 Not Found
  {
      "success": false,
      "message": "El usuario no existe.",
      "code": 404,
      "payload": null
  }
- 404 Not Found
  {
      "success": false,
      "message": "El usuario no es un administrador.",
      "code": 404,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Returns only users with role `Administrator`.
- The response does not expose passwords, refresh tokens, or other sensitive data.
- The operation is read-only.

---

## POST /api/admin-users

Description:
Creates a new user with role `Administrator`.

Controller:
AdminUsersController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: multipart/form-data
- Fields:
  - firstName: string
  - lastName: string
  - email: string
  - countryId: long (optional)
  - password: string
  - avatar: file (optional, image file)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Administrator created successfully.",
      "code": 200,
      "payload": {
          "id": 123
      }
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
      "message": "El país no existe o no está activo.",
      "code": 404,
      "payload": null
  }
- 409 Conflict
  {
      "success": false,
      "message": "El email ya está registrado.",
      "code": 409,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- The role `Administrator` is assigned exclusively by the backend; the client cannot specify it.
- The password must meet the system's security requirements.
- The email must respect existing uniqueness rules.
- The created user has `IsActive = true` and `IsEmailValidated = true`.
- The avatar image is optional.

---

## PUT /api/admin-users/{userId}

Description:
Updates an existing user with role `Administrator`.

Controller:
AdminUsersController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: multipart/form-data
- Fields:
  - firstName: string
  - lastName: string
  - email: string
  - countryId: long (optional)
  - imageId: long (optional, existing image ID to keep)
  - avatar: file (optional, image file)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Administrator updated successfully.",
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
      "message": "El usuario no existe.",
      "code": 404,
      "payload": null
  }
- 404 Not Found
  {
      "success": false,
      "message": "El usuario no es un administrador.",
      "code": 404,
      "payload": null
  }
- 404 Not Found
  {
      "success": false,
      "message": "El país no existe o no está activo.",
      "code": 404,
      "payload": null
  }
- 409 Conflict
  {
      "success": false,
      "message": "El email ya está registrado.",
      "code": 409,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- The user identifier comes from the route, not from the request body.
- The role cannot be modified through this endpoint.
- Only the specified fields are updated.
- Image management: `imageId = existingId + avatar = null` keeps current image; `imageId = 0 + avatar = file` replaces image; `imageId = 0 + avatar = null` deletes image.

---

## PATCH /api/admin-users/{userId}/deactivate

Description:
Logically deactivates a user with role `Administrator` by setting `IsActive = false`.

Controller:
AdminUsersController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: application/json
- Body: empty

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Administrator deactivated successfully.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El usuario es obligatorio.",
      "code": 400,
      "payload": { "detail": "El usuario es obligatorio." }
  }
- 404 Not Found
  {
      "success": false,
      "message": "El usuario no existe.",
      "code": 404,
      "payload": null
  }
- 404 Not Found
  {
      "success": false,
      "message": "El usuario no es un administrador.",
      "code": 404,
      "payload": null
  }
- 409 Conflict
  {
      "success": false,
      "message": "No se puede desactivar el último administrador activo.",
      "code": 409,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- This operation does not physically delete the user record.
- If the user is already inactive, the operation completes successfully without changes.
- The user record remains in the database for audit and historical purposes.
- Deactivated administrators cannot authenticate.
- The operation protects the existence of at least one active administrator.

---

## PATCH /api/admin-users/{userId}/activate

Description:
Logically reactivates a user with role `Administrator` by setting `IsActive = true`.

Controller:
AdminUsersController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: application/json
- Body: empty

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Administrator activated successfully.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El usuario es obligatorio.",
      "code": 400,
      "payload": { "detail": "El usuario es obligatorio." }
  }
- 404 Not Found
  {
      "success": false,
      "message": "El usuario no existe.",
      "code": 404,
      "payload": null
  }
- 404 Not Found
  {
      "success": false,
      "message": "El usuario no es un administrador.",
      "code": 404,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- If the user is already active, the operation completes successfully without changes.
- The role is not modified by this operation.
- The user can authenticate again after reactivation, provided no other condition blocks access.
