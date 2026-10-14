# Endpoints

## GET /api/users/google-client-id

Description:
Returns the Google Client ID needed by the Public Web to initialize Google Identity Services.

Controller:
UsersController

Request parameters:
- None

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Google Client ID retrieved successfully.",
      "code": 200,
      "payload": {
          "clientId": "string"
      }
  }

Errors:
- 500 Internal Server Error
  {
      "success": false,
      "message": "Error interno del servidor.",
      "code": 500,
      "payload": null
  }

Notes:
- Does not require authentication.
- The value is read from configuration (Google:ClientId).
- Never returns the Google Client Secret.
- Used by the Public Web to initialize Google login before authentication.

---

## GET /api/users/me

Description:
Returns the profile information of the currently authenticated user.

Controller:
UsersController

Request parameters:
- None

Authentication:
- Required. Bearer token in Authorization header.

Response:
- 200 OK
  Body:
  {
      "success": true,
       "message": "Profile retrieved successfully.",
       "code": 200,
       "payload": {
           "id": 123,
           "firstName": "John",
           "lastName": "Doe",
           "email": "john@example.com",
           "avatarUrl": "/images/123",
           "countryId": 1,
           "countryName": "Argentina",
           "role": "PublicUser"
       }
  }

Errors:
- 401 Unauthorized
  {
      "success": false,
      "message": "Se generó un error durante el proceso de autenticación.",
      "code": 401,
      "payload": null
  }
- 404 Not Found
  {
      "success": false,
      "message": "El usuario no existe.",
      "code": 404,
      "payload": null
  }
- 500 Internal Server Error
  {
      "success": false,
      "message": "Error interno del servidor.",
      "code": 500,
      "payload": null
  }

Notes:
- Requires authentication.
- The user is determined exclusively from the authentication context (JWT claims).
- avatarUrl is resolved as: local Image (/images/{id}) > external AvatarUrl > null.
- CountryName is null when the user has no nationality.
- Does not expose sensitive data such as PasswordHash, RefreshTokens, or validation tokens.
- The `role` field exposes the authenticated user's persisted role (`PublicUser` or `Administrator`).

---

## PUT /api/users/me

Description:
Updates the profile information of the currently authenticated user, including optional avatar management.

Controller:
UsersController

Authentication:
- Required. Bearer token in Authorization header.

Request:
- Content-Type: multipart/form-data
- Body:
  - firstName: string
  - lastName: string
  - countryId: long (optional)
  - imageId: long (optional)
  - avatar: IFormFile (optional, binary image file)

Response:
- 200 OK
  Body:
  {
      "success": true,
       "message": "Profile updated successfully.",
       "code": 200,
       "payload": {
           "id": 123,
           "firstName": "John",
           "lastName": "Doe",
           "email": "john@example.com",
           "avatarUrl": "/images/123",
           "countryId": 1,
           "countryName": "Argentina",
           "role": "PublicUser"
       }
  }

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El email y la contraseña son obligatorios.",
      "code": 400,
      "payload": { "detail": "..." }
  }
- 401 Unauthorized
  {
      "success": false,
      "message": "Se generó un error durante el proceso de autenticación.",
      "code": 401,
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
      "message": "El país no existe.",
      "code": 404,
      "payload": null
  }
- 500 Internal Server Error
  {
      "success": false,
      "message": "Error interno del servidor.",
      "code": 500,
      "payload": null
  }

Notes:
- Requires authentication.
- The user is determined exclusively from the authentication context (JWT claims).
- Does not accept a userId parameter.
- Email cannot be modified through this endpoint.
- PasswordHash, RefreshTokens, validation tokens, and recovery tokens cannot be modified.
- countryId null removes the nationality association.
- countryId must reference an existing active country.
- Works for users registered via email/password or Google.
- Avatar management is integrated into this endpoint using multipart/form-data.
- imageId = existingId + avatar = null → conservar imagen actual.
- imageId = 0 + avatar = archivo → reemplazar imagen actual.
- imageId = 0 + avatar = null → eliminar imagen actual.
- No existen endpoints independientes de avatar para este flujo.

---
