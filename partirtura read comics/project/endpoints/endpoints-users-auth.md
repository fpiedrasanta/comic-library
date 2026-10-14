# Endpoints

## POST /api/users/register

Description:
Registers a new user.

Controller:
UsersController

Request:
- Content-Type: multipart/form-data
- Fields:
  - firstName: string
  - lastName: string
  - email: string
  - password: string
  - nationalityId: long (optional)
  - avatar: IFormFile (optional)

Response:
- 201 Created
  Body:
  {
      "success": true,
      "message": "Usuario registrado correctamente.",
      "code": 201,
      "payload": {
          "userId": 123,
          "expiresInMinutes": 1
      }
  }

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El email y la contraseña son obligatorios.",
      "code": 400,
      "payload": {
          "errors": [
              { "field": "Email", "message": "El email es obligatorio." }
          ]
      }
  }
- 409 Conflict
  {
      "success": false,
      "message": "El email ya está registrado.",
      "code": 409,
      "payload": null
  }
- 404 Not Found
  {
      "success": false,
      "message": "El país no existe.",
      "code": 404,
      "payload": null
  }

Notes:
- The password is hashed before persistence.
- The email is stored as not validated.
- An email validation token is generated and dispatched via the email service.
- The response includes `expiresInMinutes` so the frontend can show a countdown timer.
- The response does not expose sensitive information.
- The transaction includes user persistence and email dispatch. If email dispatch fails, the user is not persisted.
- If the email already exists with a validated account, the registration is rejected.
- If the email exists with a pending validation and the code is still valid, the registration is rejected.
- If the email exists with a pending validation and the code has expired, the pending user is replaced and a new registration is created.

---

## POST /api/users/validate-email

Description:
Validates the email validation code and returns a JWT access token.

Controller:
UsersController

Request:
- Content-Type: application/json
- Body:
  {
      "email": "string",
      "code": "string (6 digits)"
  }

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Email validado correctamente.",
      "code": 200,
      "payload": {
          "token": "string",
          "user": {
              "userId": 123,
              "email": "user@example.com",
              "fullName": "John Doe"
          },
          "role": "PublicUser"
      }
  }

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El email y el código son obligatorios.",
      "code": 400,
      "payload": { "detail": "El email y el código son obligatorios." }
  }
- 404 Not Found
  {
      "success": false,
      "message": "El usuario no existe.",
      "code": 404,
      "payload": null
  }

Notes:
- The code must be exactly 6 numeric digits.
- The code is validated against the stored EmailValidationToken.
- The token must not be expired.
- After validation, the email is marked as validated and the token is cleared.
- A JWT access token is generated and returned.

---

## POST /api/users/resend-validation-email

Description:
Resends the email validation code when the original code was not received or has expired.

Controller:
UsersController

Request:
- Content-Type: application/json
- Body:
  {
      "email": "string"
  }

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Email de validación enviado.",
      "code": 200,
      "payload": {
          "expiresInMinutes": 60
      }
  }

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El email es obligatorio.",
      "code": 400,
      "payload": { "detail": "El email es obligatorio." }
  }
- 404 Not Found
  {
      "success": false,
      "message": "El usuario no existe.",
      "code": 404,
      "payload": null
  }
- 429 Too Many Requests
  {
      "success": false,
      "message": "Demasiados intentos de reenvío. Por favor, intente más tarde.",
      "code": 429,
      "payload": null
  }

Notes:
- Rate limited to 5 attempts per email per hour.
- Generates a new validation token and dispatches a new email.

---

## POST /api/users/google-login

Description:
Authenticates a user with Google, returning Access Token and setting Refresh Token in an HttpOnly cookie.

Controller:
UsersController

Request:
- Content-Type: application/json
- Body:
  {
      "idToken": "string"
  }

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Inicio de sesión con Google exitoso.",
      "code": 200,
      "payload": {
          "accessToken": "string",
          "userId": 123,
          "email": "user@example.com",
          "fullName": "John Doe",
          "role": "PublicUser"
      }
  }

Response Type:
ApiResponse<AuthResponse>

Cookies:
- Name: comic_library_refresh_token
- HttpOnly: true
- Secure: true (false in Development)
- SameSite: None (Lax in Development)
- Expires: RefreshToken:ExpirationDays

Errors:
- 401 Unauthorized
  {
      "success": false,
      "message": "Credenciales incorrectas.",
      "code": 401,
      "payload": null
  }

Notes:
- Validates the Google ID token server-side.
- If the user exists, authenticates the existing user.
- If the user does not exist, creates a new user with email validated and empty password.
- Does not reveal whether the email exists.
- Does not store Google tokens or credentials.
- Refresh Token is not returned in the JSON response body.
- Refresh Token is transported via HttpOnly cookie.
- JavaScript cannot access the Refresh Token.

---

## POST /api/users/login

Description:
Authenticates a user with email and password, returning Access Token and setting Refresh Token in an HttpOnly cookie.

Controller:
UsersController

Request:
- Content-Type: application/json
- Body:
  {
      "email": "string",
      "password": "string"
  }

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Inicio de sesión exitoso.",
      "code": 200,
      "payload": {
          "accessToken": "string",
          "userId": 123,
          "email": "user@example.com",
          "fullName": "John Doe",
          "role": "PublicUser"
      }
  }

Response Type:
ApiResponse<AuthResponse>

Cookies:
- Name: comic_library_refresh_token
- HttpOnly: true
- Secure: true (false in Development)
- SameSite: None (Lax in Development)
- Expires: RefreshToken:ExpirationDays

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El email y la contraseña son obligatorios.",
      "code": 400,
      "payload": { "detail": "El email y la contraseña son obligatorios." }
  }
- 401 Unauthorized
  {
      "success": false,
      "message": "Credenciales incorrectas.",
      "code": 401,
      "payload": null
  }

Notes:
- Does not reveal whether the email exists.
- Returns the same error for non-existent email and incorrect password.
- Requires email validation to be completed.
- Refresh Token is not returned in the JSON response body.
- Refresh Token is transported via HttpOnly cookie.
- JavaScript cannot access the Refresh Token.

---

## POST /api/users/refresh-token

Description:
Renews the session using a valid Refresh Token from HttpOnly cookie, returning a new Access Token and setting a new Refresh Token cookie.

Controller:
UsersController

Request:
- Content-Type: application/json
- Body: empty
- Cookies:
  - comic_library_refresh_token: string (Refresh Token value)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Token actualizado correctamente.",
      "code": 200,
      "payload": {
          "accessToken": "string",
          "userId": 123,
          "email": "user@example.com",
          "fullName": "John Doe",
          "role": "PublicUser"
      }
  }

Response Type:
ApiResponse<AuthResponse>

Cookies:
- Name: comic_library_refresh_token
- HttpOnly: true
- Secure: true (false in Development)
- SameSite: None (Lax in Development)
- Expires: RefreshToken:ExpirationDays

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El token de actualización es obligatorio.",
      "code": 400,
      "payload": { "detail": "El token de actualización es obligatorio." }
  }
- 401 Unauthorized
  {
      "success": false,
      "message": "Token de actualización inválido.",
      "code": 401,
      "payload": null
  }

Notes:
- Implements Refresh Token Rotation (the old token is invalidated).
- Rejects expired, revoked, or previously used Refresh Tokens.
- Returns the same error for any invalid Refresh Token state.
- The Refresh Token is read from the HttpOnly cookie, not from the request body.
- The new Refresh Token is set in a new HttpOnly cookie.
- The Refresh Token is not returned in the JSON response body.

---

## POST /api/users/logout

Description:
Closes the user session by revoking the Refresh Token and deleting the HttpOnly cookie.

Controller:
UsersController

Request:
- Content-Type: application/json
- Body: empty
- Cookies:
  - comic_library_refresh_token: string (Refresh Token value, sent automatically by the browser)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "OK",
      "code": 200,
      "payload": null
  }

Errors:
- 401 Unauthorized
  {
      "success": false,
      "message": "Token de actualización inválido.",
      "code": 401,
      "payload": null
  }

Notes:
- The Refresh Token is obtained from the HttpOnly cookie.
- The Refresh Token is revoked in the backend.
- The HttpOnly cookie is deleted/expired.
- The frontend does not need to send the Refresh Token in the request body.
- The endpoint does not return the Refresh Token in the response body.

---

## POST /api/users/logout-all

Description:
Invalidates all active sessions of the currently authenticated user by revoking all active Refresh Tokens and deleting the HttpOnly cookie.

Controller:
UsersController

Request:
- Content-Type: application/json
- Body: empty
- Cookies:
  - comic_library_refresh_token: string (Refresh Token value, sent automatically by the browser)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "OK",
      "code": 200,
      "payload": null
  }

Errors:
- 401 Unauthorized
  {
      "success": false,
      "message": "Token de actualización inválido.",
      "code": 401,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires a valid Refresh Token in the HttpOnly cookie.
- Invalidates all active Refresh Tokens associated with the authenticated user.
- The current session is also invalidated.
- The HttpOnly cookie is deleted/expired.
- The frontend should clear authentication state and redirect to login.
- Public Web and Dashboard sessions are independent but both are invalidated by this operation.

---
