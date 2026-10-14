# Endpoints

## GET /api/bans

Description:
Returns a paginated list of bans for the Dashboard administrative view.

Controller:
BansController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- currentPage: integer (default 1)
- pageSize: integer (default 48)
- orderBy: string (optional, allowed: CreatedAt, FirstName, LastName, Email, StartDate, EndDate)
- orderDir: string (default DESC)
- search: string (optional, partial case-insensitive match on user first name, last name, or email)
- startDate: date (optional, inclusive lower bound in UTC)
- endDate: date (optional, inclusive upper bound in UTC)
- isActive: boolean (optional)

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
          "pageSize": 48,
          "nextPage": 2,
          "priorPage": null,
          "totalCount": 120,
          "items": [
              {
                  "id": 1,
                  "userId": 123,
                  "firstName": "John",
                  "lastName": "Doe",
                  "email": "john@example.com",
                  "avatarUrl": "/images/456",
                  "createdAt": "2026-01-01T00:00:00Z",
                  "startDate": "2026-01-01T00:00:00Z",
                  "endDate": null,
                  "reason": "Spam",
                  "isActive": true,
                  "status": "Active"
              }
          ]
      }
  }

Response Type:
ApiResponse<ListResponse<BanListItemDto>>

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
- The search parameter performs a partial case-insensitive match on first name, last name, and email.
- startDate and endDate are inclusive bounds. The frontend should send dates already converted to UTC.
- isActive filters by ban record status.
- The default ordering is CreatedAt DESC.
- The operation is read-only.
- The response does not expose sensitive user data beyond what is needed for moderation.
- `status` is a derived field: `Active`, `Finished`, or `Revoked`.

---

## GET /api/bans/{banId}

Description:
Returns the detail of a specific ban by its ID.

Controller:
BansController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Route parameter: banId (long)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Ban detail retrieved successfully.",
      "code": 200,
      "payload": {
          "id": 1,
          "userId": 123,
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "avatarUrl": "/images/456",
          "startDate": "2026-01-01T00:00:00Z",
          "endDate": null,
          "reason": "Spam",
          "isActive": true,
          "createdAt": "2026-01-01T00:00:00Z"
      }
  }

Response Type:
ApiResponse<BanDetailDto>

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El identificador del ban es obligatorio.",
      "code": 400,
      "payload": { "detail": "El identificador del ban es obligatorio." }
  }
- 404 Not Found
  {
      "success": false,
      "message": "El ban no existe.",
      "code": 404,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- The operation is read-only.
- Used by the Dashboard to load ban data for editing.

Description:
Creates a new ban for a user.

Controller:
BansController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: application/json
- Body:
  {
      "userId": 123,
      "startDate": "2026-01-01T00:00:00Z",
      "endDate": null,
      "reason": "Spam"
  }

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Ban created successfully.",
      "code": 200,
      "payload": {
          "id": 1
      }
  }

Response Type:
ApiResponse<CreateBanResponse>

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
      "message": "El usuario no existe o no está activo.",
      "code": 404,
      "payload": null
  }
- 409 Conflict
  {
      "success": false,
      "message": "El usuario ya tiene un ban vigente.",
      "code": 409,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Dates are expected in UTC. The frontend should convert local dates to UTC before sending.
- startDate is mandatory. endDate is optional. reason is mandatory.
- A user cannot have more than one active ban at the same time.
- The operation creates a new Ban record with IsActive = true.
- The operation does not expose internal persistence details.

---

## PUT /api/bans/{banId}

Description:
Updates an existing ban.

Controller:
BansController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: application/json
- Body:
  {
      "startDate": "2026-01-01T00:00:00Z",
      "endDate": null,
      "reason": "Updated reason"
  }

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Ban updated successfully.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "La fecha de inicio es obligatoria.",
      "code": 400,
      "payload": { "detail": "La fecha de inicio es obligatoria." }
  }
- 404 Not Found
  {
      "success": false,
      "message": "El ban no existe.",
      "code": 404,
      "payload": null
  }
- 409 Conflict
  {
      "success": false,
      "message": "El usuario ya tiene otro ban vigente.",
      "code": 409,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Dates are expected in UTC.
- The ban identity cannot be changed; userId is taken from the existing ban.
- The operation validates that the updated period does not create a second active ban for the same user.
- The operation does not perform physical deletion.

---

## PATCH /api/bans/{banId}/deactivate

Description:
Revokes a ban logically by setting IsActive = false.

Controller:
BansController

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
      "message": "Ban deactivated successfully.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 404 Not Found
  {
      "success": false,
      "message": "El ban no existe.",
      "code": 404,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- This operation does not physically delete the ban record.
- If the ban is already inactive, the operation completes successfully without changes.
- The ban record remains in the database for audit and historical purposes.
- Deactivated bans do not contribute to BanCount.
