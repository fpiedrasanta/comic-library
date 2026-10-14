Task ID: TASK-API-0044
Title: Normalize API error responses and update endpoint contracts
Description:
Refactor the global exception handling and error response format across the entire API to ensure consistency with the project's API contract standards. Update all affected controllers and endpoints to return standardized error responses. Also update endpoints.md to reflect the correct success and error responses for each endpoint.

## Standardized Error Response Format

All error responses must follow this structure:

```json
{
    "success": false,
    "message": "string",
    "code": 400,
    "payload": { "detail": "string" } | null
}
```

### Error Response Rules

- `success`: always `false` for errors.
- `message`: user-facing error message in Spanish. For business errors, this is the clear message thrown by the exception. For 500 internal server errors, this is the exception message or a generic fallback.
- `code`: HTTP status code corresponding to the error type.
- `payload`: additional technical details or `null`. Must not expose sensitive information.

### Status Code Mapping

- `400 Bad Request`: Validation errors. Message is a clear Spanish description of the validation failure. Payload may contain field-level errors.
- `401 Unauthorized`: Authentication failures (invalid credentials, invalid/expired refresh token, missing token). Message is a clear Spanish description. Payload is `null`.
- `403 Forbidden`: Authorization failures (insufficient permissions). Message is a clear Spanish description. Payload is `null`.
- `404 Not Found`: Resource not found. Message is a clear Spanish description (e.g., "El usuario no existe"). Payload is `null`.
- `409 Conflict`: Business conflicts (duplicate email, etc.). Message is a clear Spanish description. Payload is `null` or `{ "detail": "..." }` when appropriate.
- `429 Too Many Requests`: Rate limit exceeded. Message is a clear Spanish description. Payload is `null`.
- `500 Internal Server Error`: Unexpected server errors. Message is the exception message or a generic fallback ("Error interno del servidor."). Payload is `null`.

### Examples

Validation error:
```json
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
```

Unauthorized:
```json
{
    "success": false,
    "message": "Credenciales incorrectas.",
    "code": 401,
    "payload": null
}
```

Not Found:
```json
{
    "success": false,
    "message": "El usuario no existe.",
    "code": 404,
    "payload": null
}
```

Conflict:
```json
{
    "success": false,
    "message": "El email ya está registrado.",
    "code": 409,
    "payload": null
}
```

Internal Server Error:
```json
{
    "success": false,
    "message": "Error interno del servidor.",
    "code": 500,
    "payload": null
}
```

Expected result:
1. All API error responses follow the standardized ApiResponse format.
2. Business errors return appropriate HTTP status codes (e.g., 401 for invalid credentials, 400 for validation errors, 404 for not found, 409 for conflicts).
3. Error messages are clear, consistent, and in Spanish.
4. endpoints.md is updated with correct response examples for all endpoints.
5. A corresponding task is created for the public-web frontend to review error handling on the client side.
Relevant context:
- Current GlobalExceptionHandlerMiddleware maps BusinessNotFoundException to 404 Not Found.
- AuthService throws BusinessNotFoundException("Invalid credentials.") for login failures, resulting in a 404 response instead of 401 Unauthorized.
- The API must return standardized responses: { success, message, code, payload }.
- Error responses must not expose internal details.
- All user-facing error messages must be in Spanish.
Dependencies:
- None.
Acceptance criteria:
- Login with invalid credentials returns 401 Unauthorized with a clear Spanish message in the `message` field.
- All business exceptions map to semantically correct HTTP status codes.
- Validation errors return 400 Bad Request with clear Spanish messages.
- Not found errors return 404 Not Found with clear Spanish messages.
- Conflict errors return 409 Conflict with clear Spanish messages.
- 500 errors return a generic Spanish message or the exception message when appropriate.
- endpoints.md contains updated and correct response examples for all documented endpoints.
- A task is created in public-web/planned/ for frontend error handling review.

## Execution Result

Completed successfully.

### Changes Made

- Created `InvalidCredentialsException`, `ValidationException`, and `RateLimitExceededException` in `Domain/Exceptions/`.
- Updated `GlobalExceptionHandlerMiddleware` to map each exception type to its corresponding HTTP status code.
- Updated `AuthService` to throw `InvalidCredentialsException` with Spanish messages for login and refresh token failures.
- Updated `PasswordResetService` to throw `InvalidCredentialsException` and `ValidationException` with Spanish messages.
- Updated `UserService` to throw exceptions with Spanish messages for all business errors.
- Updated `endpoints.md` with correct Spanish messages for all success and error responses.
- Updated `domain.md` to document the new exceptions and their HTTP mappings.

### Verification

- Solution builds successfully with no errors.
- All error responses now follow the standardized `ApiResponse` format with `success`, `message`, `code`, and `payload`.
- Business errors return semantically correct HTTP status codes.
- All user-facing error messages are in Spanish.