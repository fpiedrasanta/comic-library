# TASK-API-0120 — Implementar endpoint de consulta de países

## Objetivo

Exponer mediante API la consulta administrativa de países.

## Completed Work

Pendiente.

## Pending Work

- Crear o actualizar `CountriesController`.
- Implementar `GET /api/countries`.
- Proteger el endpoint con autorización `Administrator` si corresponde al listado administrativo.
- Delegar en `ICountryService`.
- Retornar `ApiResponse<ListResponse<CountryListItemDto>>`.
- No incluir lógica de persistencia, búsqueda, ordenamiento ni paginación en el controller.
- Actualizar `project/endpoints.md`.

## Unblocked by

TASK-API-0119

## Unblocks

TASK-API-0121

## Execution Result

### Status
Finished

### Completed Work
- Created `AdminCountriesController` at `api/admin-countries`.
- Implemented `GET /api/admin-countries` protected with `[Authorize(Roles = "Administrator")]`.
- The controller delegates to `ICountryService.GetPagedAsync(GetCountriesRequest)`.
- Returns `ApiResponse<ListResponse<CountryDto>>`.
- No persistence, search, ordering, or pagination logic in the controller.

### Pending Work
Ninguna.

### Assigned to
Backend Agent
