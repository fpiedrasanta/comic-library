# Endpoints

## GET /api/users

Description:
Returns a paginated list of users for the Dashboard administrative view.

Controller:
UsersController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- currentPage: integer (default 1)
- pageSize: integer (default 12, max 50)
- orderBy: string (optional, allowed: LastName, Email, IsActive, IsBanned, BanCount, CreatedAt)
- orderDir: string (default DESC)
- search: string (optional, partial case-insensitive match on last name or email)
- isActive: boolean (optional)
- isBanned: boolean (optional)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Users retrieved successfully.",
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
                  "isActive": true,
                  "isBanned": false,
                  "banCount": 0,
                  "createdAt": "2026-01-01T00:00:00Z"
              }
          ]
      }
  }

Response Type:
ApiResponse<ListResponse<UserListItemDto>>

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
- The search parameter performs a partial case-insensitive match on last name and email.
- isActive filters by account status.
- isBanned filters by current ban status (a user is banned when there exists an active Ban whose validity covers the current moment).
- banCount represents the total historical number of bans for the user.
- The default ordering is CreatedAt DESC.
- The operation is read-only.
- The response does not expose passwords, refresh tokens, or other sensitive data.

---

## GET /api/users/active-for-ban

Description:
Returns a paginated list of active users without a current active ban, for the Dashboard ban creation user selection.

Controller:
UsersController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- currentPage: integer (default 1)
- pageSize: integer (default 48)
- orderBy: string (optional, allowed: CreatedAt, FirstName, LastName, Email)
- orderDir: string (default DESC)
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
          "pageSize": 48,
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
                  "isActive": true,
                  "isBanned": false,
                  "banCount": 0,
                  "createdAt": "2026-01-01T00:00:00Z"
              }
          ]
      }
  }

Response Type:
ApiResponse<ListResponse<UserListItemDto>>

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
- Returns only users with IsActive = true and no currently active ban.
- search performs a partial case-insensitive match on first name, last name, and email.
- banCount counts only active bans (IsActive = true). Inactive or revoked bans are not counted.
- The default ordering is CreatedAt DESC.
- The operation is read-only.
- The response does not expose passwords, refresh tokens, or other sensitive data.

---

## GET /api/users/{userId}

Description:
Returns the detail information of a specific user for the Dashboard administrative view.

Controller:
UsersController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- userId: long (user identifier)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "User detail retrieved successfully.",
      "code": 200,
      "payload": {
          "id": 123,
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "avatarUrl": "/images/456",
          "countryName": "Argentina"
      }
  }

Response Type:
ApiResponse<UserDetailDto>

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
- 404 Not Found
  {
      "success": false,
      "message": "El usuario no existe.",
      "code": 404,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- avatarUrl resolves as /images/{id} for local avatars, or the external AvatarUrl for Google users, or null.
- countryName is null when the user has no nationality.
- The operation is read-only.
- The response does not expose passwords, refresh tokens, or other sensitive data.
