# Endpoints

## POST /api/users/forgot-password

Description:
Initiates the password recovery flow by generating a 6-digit code and sending it to the user's email.

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
      "message": "Si el email existe, se ha enviado un código de recuperación.",
      "code": 200,
      "payload": {
          "expiresInMinutes": 15
      }
  }

Response Type:
ApiResponse<ForgotPasswordResponse>

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El email es obligatorio.",
      "code": 400,
      "payload": { "detail": "El email es obligatorio." }
  }

Notes:
- Does not reveal whether the email exists.
- Uses the same error response for non-existent and unvalidated emails.
- Invalidates previous active recovery codes for the user.
- The recovery code is sent via email.
- The response includes expiration minutes for the frontend timer.

---

## POST /api/users/resend-password-reset-code

Description:
Resends the password recovery code, invalidating any previous active code.

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
      "message": "Si el email existe, se ha enviado un código de recuperación.",
      "code": 200,
      "payload": {
          "expiresInMinutes": 15
      }
  }

Response Type:
ApiResponse<ResendPasswordResetCodeResponse>

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El email es obligatorio.",
      "code": 400,
      "payload": { "detail": "El email es obligatorio." }
  }

Notes:
- Does not reveal whether the email exists.
- Invalidates previous active recovery codes before generating a new one.
- The recovery code is sent via email.
- The response includes expiration minutes for the frontend timer.

---

## POST /api/users/validate-password-reset-code

Description:
Validates the 6-digit recovery code and returns a temporary authorization token for password change.

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
      "message": "Código validado correctamente.",
      "code": 200,
      "payload": {
          "authorizationToken": "string"
      }
  }

Response Type:
ApiResponse<ValidatePasswordResetCodeResponse>

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El email y el código son obligatorios.",
      "code": 400,
      "payload": { "detail": "El email y el código son obligatorios." }
  }
- 401 Unauthorized
  {
      "success": false,
      "message": "Código de recuperación inválido o vencido.",
      "code": 401,
      "payload": null
  }

Notes:
- The code must be exactly 6 digits.
- The code is validated against the stored hash.
- The code must not be expired or previously used.
- Returns a temporary authorization token for password change.
- The authorization token is not a JWT and cannot be used for general authentication.
- The recovery code is marked as used after successful validation.

---

## POST /api/users/reset-password

Description:
Changes the user's password using a valid temporary authorization token obtained after validating the recovery code.

Controller:
UsersController

Request:
- Content-Type: application/json
- Body:
  {
      "email": "string",
      "authorizationToken": "string",
      "newPassword": "string"
  }

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Contraseña cambiada correctamente.",
      "code": 200,
      "payload": {}
  }

Response Type:
ApiResponse<ResetPasswordResponse>

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El email, el token de autorización y la nueva contraseña son obligatorios.",
      "code": 400,
      "payload": { "detail": "El email, el token de autorización y la nueva contraseña son obligatorios." }
  }
- 401 Unauthorized
  {
      "success": false,
      "message": "Token de autorización inválido o vencido.",
      "code": 401,
      "payload": null
  }

Notes:
- Requires a valid temporary authorization token obtained from validate-password-reset-code.
- The authorization token must not be expired or previously used.
- The new password must meet security requirements (minimum 8 characters, at least one digit, one lowercase, one uppercase, one special character).
- The password is hashed before persistence.
- All active refresh tokens for the user are revoked after password change.
- No new session or tokens are generated automatically.
- The user must log in again with the new password.

---
