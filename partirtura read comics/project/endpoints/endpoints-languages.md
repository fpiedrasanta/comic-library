# Endpoints

## GET /api/admin-languages

Description:
Returns the full list of available languages. Languages are seeded data (not CRUD-managed), so this endpoint is read-only and returns the complete collection without pagination.

Controller:
AdminLanguagesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters: none.

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "OK",
      "code": 200,
      "payload": [
          { "id": 1, "name": "English", "code": "en" },
          { "id": 2, "name": "Español", "code": "es" }
      ]
  }

Response Type:
ApiResponse<IReadOnlyList<LanguageDto>>

Errors:
- 401 Unauthorized
- 403 Forbidden

Notes:
- Requires authentication.
- Requires Administrator role.
- Used by the Number editor to populate the Language dropdown.
- Languages are seeded and cannot be created, updated, or deactivated through the API.
- The list is ordered by Name ASC.
- The operation is read-only.
