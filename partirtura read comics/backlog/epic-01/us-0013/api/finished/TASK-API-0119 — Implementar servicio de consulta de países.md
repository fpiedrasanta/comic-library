# TASK-API-0119 — Implementar servicio de consulta de países

## Objetivo

Implementar el servicio de aplicación responsable de consultar los países administrados por el sistema.

## Completed Work

Pendiente.

## Pending Work

- Crear `ICountryService`.
- Crear `CountryService`.
- Implementar `GetPagedAsync`.
- Normalizar los parámetros de paginación.
- Normalizar el campo y dirección de ordenamiento.
- Delegar la consulta en `ICountryRepository`.
- Retornar `ListResponse<CountryListItemDto>`.
- No incluir lógica de persistencia ni lógica específica de presentación.
- Registrar el servicio en el contenedor de DI.

## Unblocked by

TASK-API-0118

## Unblocks

TASK-API-0120

## Execution Result

### Status
Finished

### Completed Work
- Added `GetPagedAsync(GetCountriesRequest request)` to `ICountryService`.
- Implemented the admin query in `CountryService`, normalizing pagination and ordering.
- The admin query delegates to `ICountryRepository.GetPagedAsync` with the nullable `isActive` filter from the request.
- Returned `ListResponse<CountryDto>`.
- Registered service in DI (already registered via `ICountryService`).

### Pending Work
Ninguna.

### Assigned to
Backend Agent
