# TASK-API-0122 — Implementar creación de país

## Objetivo

Implementar la creación de países administrados por el sistema.

## Completed Work

Pendiente.

## Pending Work

- Agregar `CreateCountryAsync` a `ICountryService`.
- Validar que `Code` sea obligatorio.
- Validar que `Name` sea obligatorio.
- Normalizar los valores según las reglas definidas para el dominio.
- Validar que no exista otro país con el mismo `Code`.
- Validar que no exista otro país con el mismo `Name` si la regla de negocio establece unicidad.
- Crear el país con `IsActive = true`.
- Persistir mediante `IUnitOfWork`.
- No permitir que el request determine `IsActive`.
- Utilizar las excepciones de negocio existentes.
- No realizar eliminación física.

## Unblocked by

TASK-API-0121

## Unblocks

TASK-API-0123

## Execution Result

### Status
Finished

### Completed Work
- Added `CreateCountryAsync` to `ICountryService` and implemented in `CountryService`.
- Validates that `Code` is mandatory.
- Validates that `Name` is mandatory.
- Validates uniqueness of `Code` via `ICountryRepository.GetByCodeAsync`.
- Validates uniqueness of `Name` via `ICountryRepository.GetByNameAsync`.
- Creates the country with `IsActive = true`.
- Persists using `IUnitOfWork.SaveChangesAsync`.
- Throws `ValidationException` for missing fields.
- Throws `BusinessConflictException` for duplicate code or name.

### Pending Work
Ninguna.

### Assigned to
Backend Agent
