# TASK-API-0125 — Implementar endpoints de gestión de países

## Objetivo

Exponer mediante API las operaciones de administración de países.

## Completed Work

Pendiente.

## Pending Work

Implementar los siguientes endpoints:

- `GET /api/countries`
- `POST /api/countries`
- `PUT /api/countries/{countryId}`
- `PATCH /api/countries/{countryId}/deactivate`
- `PATCH /api/countries/{countryId}/activate`

Todos los endpoints administrativos deben requerir autenticación y rol `Administrator`.

El controller debe delegar las operaciones en `ICountryService`.

No debe contener lógica de negocio ni persistencia.

Actualizar `project/endpoints.md`.

## Unblocked by

TASK-API-0124

## Unblocks

TASK-API-0126

## Execution Result

### Status
Finished

### Completed Work
- Created `AdminCountriesController` with the following endpoints:
  - `GET /api/admin-countries` — paginated admin list with search, ordering, and isActive filter.
  - `POST /api/admin-countries` — creates a new country.
  - `PUT /api/admin-countries/{countryId}` — updates an existing country.
  - `PATCH /api/admin-countries/{countryId}/deactivate` — logically deactivates a country.
  - `PATCH /api/admin-countries/{countryId}/activate` — logically activates a country.
- All administrative endpoints require authentication and `Administrator` role.
- The controller delegates all operations to `ICountryService`.
- No business logic or persistence logic in the controller.
- Updated `project/endpoints.md` with all new endpoints.

### Pending Work
Ninguna.

### Assigned to
Backend Agent
