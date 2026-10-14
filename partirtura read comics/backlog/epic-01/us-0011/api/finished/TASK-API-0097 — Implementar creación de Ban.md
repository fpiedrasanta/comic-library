# TASK-API-0097 — Implementar creación de Ban

## Task ID

TASK-API-0097

## Title

Implementar creación de Ban

## Description

Implementar la operación de aplicación para crear un nuevo Ban.

## Business rules

Antes de crear el registro:

1. El usuario debe existir.
2. El usuario debe estar activo.
3. El usuario no debe tener actualmente otro Ban vigente.
4. `startDate` debe ser válida.
5. `endDate`, cuando exista, debe ser posterior a `startDate`.
6. Debe existir un motivo.
7. Las fechas deben almacenarse en UTC.

## Active Ban

Un usuario posee un Ban vigente cuando existe un registro que:

- `IsActive = true`.
- `StartDate <= now`.
- `EndDate` es `null` o `EndDate > now`.

No se debe permitir la creación de un segundo Ban vigente.

## Persistence

Crear un nuevo registro de Ban.

No reutilizar un registro histórico existente.

No modificar ni eliminar Bans históricos para crear el nuevo Ban.

## Acceptance Criteria

- [ ] Se valida existencia del usuario.
- [ ] Se valida que el usuario esté activo.
- [ ] Se valida que no exista otro Ban vigente.
- [ ] Se validan las fechas.
- [ ] Se valida el motivo.
- [ ] Las fechas se almacenan en UTC.
- [ ] Se crea un nuevo registro.
- [ ] No se elimina historial.
- [ ] Los errores de negocio utilizan el mecanismo existente.

## Assigned to

Backend Agent

## Status

Planned

## Dependencies

TASK-API-0096

## Execution Result

### Status
Finished

### Completed Work
- Método `CreateBanAsync` agregado a `IBanService` e implementado en `BanService`.
- Validaciones aplicadas:
  - `UserId` debe ser mayor a 0.
  - `StartDate` no puede ser `default`.
  - `EndDate`, si existe, debe ser posterior a `StartDate`.
  - `Reason` no puede ser nulo o vacío.
  - El usuario debe existir y estar activo (`BusinessNotFoundException` si no).
  - No debe existir otro Ban vigente para el usuario (`BusinessConflictException` si existe).
- Las fechas se convierten a UTC antes de persistir (`ToUniversalTime()`).
- Se crea un nuevo registro de `Ban` con `IsActive = true`.
- Se utiliza `IUnitOfWork.SaveChangesAsync` para persistir.
- No se elimina historial ni se reutilizan registros existentes.
- Errores de negocio utilizan las excepciones existentes (`ValidationException`, `BusinessNotFoundException`, `BusinessConflictException`).
- Compilación completa sin errores.

### Pending Work
Ninguna. La creación de Ban está implementada.

### Unblocked by
TASK-API-0096

### Unblocks
TASK-API-0098

### Assigned to
Backend Agent