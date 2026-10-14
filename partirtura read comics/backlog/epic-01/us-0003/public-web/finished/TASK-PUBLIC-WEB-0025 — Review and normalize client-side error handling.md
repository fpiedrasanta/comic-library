Task ID: TASK-PUBLIC-WEB-0025
Title: Review and normalize client-side error handling
Description:
Review the error handling logic across the public-web frontend to ensure it correctly interprets the standardized API error responses. Align error messages and HTTP status handling with the backend's normalized error format.

## Standardized Error Response Format

All error responses from the backend follow this structure:

```json
{
    "success": false,
    "message": "string",
    "code": 400,
    "payload": { "detail": "string" } | null
}
```

### Rules

- `success`: always `false` for errors.
- `message`: user-facing error message in Spanish. This is the message the frontend should display to the user.
- `code`: HTTP status code.
- `payload`: additional technical details or `null`.

### Status Codes

- `400 Bad Request`: Validation errors. Message is a clear Spanish description.
- `401 Unauthorized`: Authentication failures. Message is a clear Spanish description.
- `403 Forbidden`: Authorization failures. Message is a clear Spanish description.
- `404 Not Found`: Resource not found. Message is a clear Spanish description.
- `409 Conflict`: Business conflicts. Message is a clear Spanish description.
- `429 Too Many Requests`: Rate limit exceeded. Message is a clear Spanish description.
- `500 Internal Server Error`: Unexpected errors. Message is a generic Spanish fallback ("Error interno del servidor.") or the exception message.

Expected result:
1. The login page correctly displays an error message when the backend returns 401 Unauthorized.
2. All API error responses are handled consistently using the standardized { success, message, code, payload } format.
3. Error messages from the backend are displayed to the user without exposing internal details.
4. HTTP error status codes are properly interpreted (400, 401, 403, 404, 409, 500).
5. The frontend does not rely on the message text alone to determine the type of error; it uses the status code and standardized structure.
Relevant context:
- Backend is normalizing all error responses to a standard ApiResponse format.
- The frontend must not display raw backend error details.
- The frontend must gracefully handle network errors and unexpected server errors.
- All user-facing error messages are in Spanish.
Dependencies:
- Backend task TASK-API-0037 must be completed first (error response normalization).
Acceptance criteria:
- Invalid login shows a user-friendly error message in Spanish.
- All forms display validation errors returned by the backend in Spanish.
- Not found, conflict, and server errors display appropriate generic messages in Spanish.
- No backend stack traces or internal details are shown to the user.

---
Result:
Completed.

Completed work:
- Fixed `normalizeApiError` in `infrastructure/api/client/api-client.ts` to correctly parse the standardized `{ success, message, code, payload }` error response format from the backend.
- Updated error handling in `pages/login-page.tsx` to use `apiError.message` for 401 responses instead of hardcoded text and unnecessary `payload.detail` checks.
- Updated error handling in `pages/register-page.tsx` to use `apiError.message` for 409 and 404 responses.
- Updated error handling in `pages/forgot-password-page.tsx` to use `apiError.message` directly.
- Updated error handling in `pages/verify-email-page.tsx` to use `apiError.message` for 404 responses and prioritize `payload.errors` over `payload.detail` for 400 validation errors.
- Updated error handling in `pages/verify-recovery-code-page.tsx` to use `apiError.message` for 401 responses and prioritize `payload.errors` over `payload.detail` for 400 validation errors.
- Updated error handling in `pages/reset-password-page.tsx` to use `apiError.message` for 401 responses and prioritize `payload.errors` over `payload.detail`.

Validation:
- TypeScript compilation passes with `npm run typecheck`.
- All pages now consistently rely on the standardized API error structure (`success`, `message`, `code`, `payload`) and use status codes (`apiError.status`) to determine error type rather than relying solely on message text.
- User-facing error messages are displayed in Spanish as returned by the backend, without exposing internal details.

Notes:
- No new pages or components were added, so `pages.md` and `components.md` were not modified.