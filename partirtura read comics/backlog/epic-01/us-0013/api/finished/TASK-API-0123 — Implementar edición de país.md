# TASK-API-0123 — Implementar edición de país

## Objetivo

Implementar la modificación de los datos de un país existente.

## Completed Work

Pendiente.

## Pending Work

- Agregar `UpdateCountryAsync` a `ICountryService`.
- Obtener el país mediante el identificador de la ruta.
- Validar que el país exista.
- Validar `Code`.
- Validar `Name`.
- Validar unicidad de `Code`.
- Validar unicidad de `Name` si corresponde.
- Modificar únicamente los datos propios del país.
- No modificar `IsActive` desde esta operación.
- Persistir mediante `IUnitOfWork`.
- No eliminar físicamente el registro.

## Unblocked by

TASK-API-0122

## Unblocks

TASK-API-0124

## Execution Result

### Status
Finished

### Completed Work
- Added `UpdateCountryAsync` to `ICountryService` and implemented in `CountryService`.
- Retrieves the country by route identifier.
- Validates that the country exists.
- Validates `Code` and `Name` are not empty.
- Validates uniqueness of `Code` excluding the current country.
- Validates uniqueness of `Name` excluding the current country.
- Does not modify `IsActive`.
- Persists using `IUnitOfWork.SaveChangesAsync`.

### Pending Work
Ninguna.

### Assigned to
Backend Agent
