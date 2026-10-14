# Endpoints

## POST /api/users/account-deletion/request

Description:
Requests an account deletion confirmation code to be sent to the authenticated user's email.

Controller:
UsersController

Authentication:
- Required. Bearer token in Authorization header.

Request:
- Content-Type: application/json
- Body: empty

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Account deletion code sent.",
      "code": 200,
      "payload": {
          "expiresInMinutes": 15
      }
  }

Response Type:
ApiResponse<RequestAccountDeletionResponse>

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

Notes:
- Requires authentication.
- The user is determined exclusively from the authentication context (JWT claims).
- Does not accept email or userId in the request body.
- Invalidates any previous active deletion codes for the user.
- The code is sent via email.

---

## POST /api/users/account-deletion/confirm

Description:
Confirms account deletion using a valid 6-digit code previously sent to the authenticated user's email.

Controller:
UsersController

Authentication:
- Required. Bearer token in Authorization header.

Request:
- Content-Type: application/json
- Body:
  {
      "code": "123456"
  }

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Cuenta eliminada correctamente.",
      "code": 200,
      "payload": {
          "message": "Cuenta eliminada correctamente."
      }
  }

Response Type:
ApiResponse<ConfirmAccountDeletionResponse>

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El código de eliminación es obligatorio.",
      "code": 400,
      "payload": { "detail": "El código de eliminación es obligatorio." }
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
- 409 Conflict
  {
      "success": false,
      "message": "El código de eliminación es inválido o ha vencido.",
      "code": 409,
      "payload": null
  }

Notes:
- Requires authentication.
- The user is determined exclusively from the authentication context (JWT claims).
- Does not accept email or userId in the request body.
- The code must be exactly 6 digits.
- The code must not be expired or previously used.
- Sets the user IsActive = false.
- Invalidates all active refresh tokens for the user.
- Does not perform physical deletion of the user or related data.

---
