# TASK-API-0117 — Definir contratos para consulta de países

## Objetivo

Definir los contratos necesarios para consultar los países administrados por el sistema.

La consulta debe permitir obtener los países disponibles para ser utilizados durante el registro de usuarios y para la administración desde el Dashboard.

## Completed Work

Pendiente.

## Pending Work

- Crear `GetCountriesRequest`.
- Crear `CountryListItemDto`.
- Definir los campos necesarios para el listado:
  - `Id`
  - `Code`
  - `Name`
  - `IsActive`
- Mantener compatibilidad con `ListRequest` y `ListResponse<T>`.
- Definir los criterios de búsqueda, ordenamiento y paginación que utilizará el listado administrativo.

## Unblocks

TASK-API-0118

## Execution Result

### Status
Finished

### Completed Work
- Created `GetCountriesRequest` extending `ListRequest` with `IsActive` filter.
- Reused `CountryDto` as the list item DTO (Id, Code, Name, IsActive).
- Defined search, ordering, and pagination criteria compatible with `ListRequest` and `ListResponse<T>`.

### Pending Work
Ninguna.

### Assigned to
Backend Agent
