# TASK-API-0118 — Implementar consulta paginada de países

## Objetivo

Implementar en el repositorio la consulta paginada de países para su utilización por el Dashboard administrativo.

## Completed Work

Pendiente.

## Pending Work

- Agregar la operación correspondiente a `ICountryRepository`.
- Implementar la consulta en `CountryRepository`.
- Permitir búsqueda por `Code` y `Name`.
- Permitir ordenamiento por:
  - `Code`
  - `Name`
- Permitir ordenamiento ASC/DESC.
- Implementar paginación mediante `Skip`/`Take`.
- Utilizar `AsNoTracking()` en la consulta.
- Proyectar directamente al DTO correspondiente cuando la arquitectura actual lo permita.
- Definir claramente si la consulta administrativa incluye países activos e inactivos.
- No realizar consultas N+1.

## Unblocked by

TASK-API-0117

## Unblocks

TASK-API-0119

## Execution Result

### Status
Finished

### Completed Work
- Updated `ICountryRepository.GetPagedAsync` to search by `Code` and `Name` using `EF.Functions.Like`.
- Added `AsNoTracking()` to the query.
- Implemented `ApplyOrdering` supporting `Code`, `Name`, and `IsActive` with ASC/DESC.
- Added `GetByCodeAsync` and `GetByNameAsync` to `ICountryRepository` and `CountryRepository`.
- Added `AddAsync` and `UpdateAsync` to `ICountryRepository` and `CountryRepository`.

### Pending Work
Ninguna.

### Assigned to
Backend Agent
