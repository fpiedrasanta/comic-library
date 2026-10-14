# Endpoints

## GET /api/countries

Description:
Returns a paginated list of active countries.

Controller:
CountriesController

Request parameters:
- currentPage: integer (default 1)
- pageSize: integer (default 12, max 50)
- orderBy: string (optional)
- orderDir: string (default ASC)
- search: string (optional, partial case-insensitive match on country name)

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
              { "id": 1, "code": "AR", "name": "Argentina", "isActive": true }
          ]
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
- Used by the Public Web registration form to populate the country search select.
- Returns only active countries.
- Response is paginated.
- `search` performs a partial, case-insensitive match on the country name, reducing the result set server-side.

---

## GET /api/admin-countries

Description:
Returns a paginated list of countries for the Dashboard administrative view.

Controller:
AdminCountriesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- currentPage: integer (default 1)
- pageSize: integer (default 12, max 50)
- orderBy: string (optional, allowed: Code, Name, IsActive)
- orderDir: string (default ASC)
- search: string (optional, partial case-insensitive match on country code or name)
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
          "pageSize": 12,
          "nextPage": 2,
          "priorPage": null,
          "totalCount": 120,
          "items": [
              { "id": 1, "code": "AR", "name": "Argentina", "isActive": true }
          ]
      }
  }

Response Type:
ApiResponse<ListResponse<CountryDto>>

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
- search performs a partial case-insensitive match on country code and name.
- isActive filters by country status. When null, returns all countries.
- The default ordering is Name ASC.
- The operation is read-only.

---

## POST /api/admin-countries

Description:
Creates a new country.

Controller:
AdminCountriesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: application/json
- Body:
  {
      "code": "AR",
      "name": "Argentina"
  }

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Country created successfully.",
      "code": 200,
      "payload": {
          "id": 1
      }
  }

Response Type:
ApiResponse<object>

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El código es obligatorio.",
      "code": 400,
      "payload": { "detail": "El código es obligatorio." }
  }
- 409 Conflict
  {
      "success": false,
      "message": "Ya existe un país con el mismo código.",
      "code": 409,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Code and name are mandatory.
- Code and name must be unique.
- The new country is created with IsActive = true.

---

## PUT /api/admin-countries/{countryId}

Description:
Updates an existing country.

Controller:
AdminCountriesController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: application/json
- Body:
  {
      "code": "AR",
      "name": "Argentina"
  }

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Country updated successfully.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El código es obligatorio.",
      "code": 400,
      "payload": { "detail": "El código es obligatorio." }
  }
- 404 Not Found
  {
      "success": false,
      "message": "El país no existe.",
      "code": 404,
      "payload": null
  }
- 409 Conflict
  {
      "success": false,
      "message": "Ya existe un país con el mismo código.",
      "code": 409,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- The country identifier comes from the route.
- Code and name must be unique across other countries.
- IsActive cannot be modified through this endpoint.

---

## PATCH /api/admin-countries/{countryId}/deactivate

Description:
Logically deactivates a country by setting IsActive = false.

Controller:
AdminCountriesController

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
      "message": "Country deactivated successfully.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 404 Not Found
  {
      "success": false,
      "message": "El país no existe.",
      "code": 404,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- This operation does not physically delete the country record.
- If the country is already inactive, the operation completes successfully without changes.
- The country record remains in the database for audit and historical purposes.
- Deactivated countries cannot be selected during user registration or profile update.

---

## PATCH /api/admin-countries/{countryId}/activate

Description:
Logically activates a country by setting IsActive = true.

Controller:
AdminCountriesController

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
      "message": "Country activated successfully.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 404 Not Found
  {
      "success": false,
      "message": "El país no existe.",
      "code": 404,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- If the country is already active, the operation completes successfully without changes.
- Reactivated countries become available for selection during user registration and profile update.
