# TASK-API-0124 — Implementar activación y desactivación de país

## Objetivo

Implementar la gestión del estado lógico de los países.

## Completed Work

Pendiente.

## Pending Work

- Agregar `DeactivateCountryAsync` a `ICountryService`.
- Agregar `ActivateCountryAsync` a `ICountryService`.
- La desactivación debe establecer `IsActive = false`.
- La activación debe establecer `IsActive = true`.
- No realizar DELETE físico.
- Las operaciones deben ser idempotentes.
- La desactivación de un país no debe modificar ni eliminar las referencias existentes de usuarios que tengan ese país asociado.
- Validar que el país exista.
- Persistir mediante `IUnitOfWork`.

## Unblocked by

TASK-API-0123

## Unblocks

TASK-API-0125

## Execution Result

### Status
Finished

### Completed Work
- Added `DeactivateCountryAsync` to `ICountryService` and implemented in `CountryService`.
- Added `ActivateCountryAsync` to `ICountryService` and implemented in `CountryService`.
- Deactivation sets `IsActive = false`.
- Activation sets `IsActive = true`.
- Operations are idempotent.
- No physical deletion.
- Does not modify user references to the country.
- Validates that the country exists.
- Persists using `IUnitOfWork.SaveChangesAsync`.

### Pending Work
Ninguna.

### Assigned to
Backend Agent
