# TASK-API-0098 — Implementar edición y revocación lógica de Ban

## Task ID

TASK-API-0098

## Title

Implementar edición y revocación lógica de Ban

## Description

Implementar las operaciones necesarias para modificar y revocar un Ban existente.

La funcionalidad debe preservar el historial de moderación.

## Edit

La edición debe permitir modificar los campos definidos por la regla de negocio:

- `StartDate`.
- `EndDate`.
- `Reason`.

El `UserId` del Ban no debe modificarse mediante una edición.

Las fechas deben almacenarse en UTC.

## Revocation

La acción "Eliminar" no debe ejecutar un DELETE físico.

Debe realizar una revocación lógica:

`IsActive = false`

El registro debe permanecer disponible para auditoría e historial.

## BanCount

Un Ban revocado mediante `IsActive = false` no debe incrementar ni formar parte de `BanCount`.

## Validation

Al editar un Ban se debe verificar que el nuevo período no genere una situación inválida respecto de otro Ban vigente del mismo usuario.

No debe ser posible terminar con más de un Ban vigente para el mismo usuario.

## Acceptance Criteria

- [ ] Se puede editar un Ban.
- [ ] `UserId` no puede modificarse.
- [ ] Las fechas se convierten a UTC.
- [ ] Se valida la vigencia.
- [ ] No se realiza DELETE físico.
- [ ] La revocación establece `IsActive = false`.
- [ ] El registro revocado permanece en la base de datos.
- [ ] Los Bans revocados no se consideran para `BanCount`.
- [ ] No se permite generar dos Bans vigentes para el mismo usuario.

## Assigned to

Backend Agent

## Status

Planned

## Dependencies

TASK-API-0097

## Execution Result

### Status
Finished

### Completed Work
- Método `UpdateBanAsync` agregado a `IBanService` e implementado en `BanService`.
  - Permite modificar `StartDate`, `EndDate` y `Reason`.
  - `UserId` no se expone en la edición; se toma del ban existente.
  - Fechas convertidas a UTC antes de persistir.
  - Valida que el ban exista (`BusinessNotFoundException` si no).
  - Valida que el nuevo período no genere un segundo ban vigente para el mismo usuario (`BusinessConflictException` si existe conflicto).
  - No realiza DELETE físico.
- Método `DeactivateBanAsync` agregado a `IBanService` e implementado en `BanService`.
  - Establece `IsActive = false` sin eliminar el registro.
  - Si el ban ya está inactivo, la operación es idempotente y no altera el registro.
  - El registro permanece disponible para auditoría e historial.
- `BanCount` no se ve afectado por la revocación porque las consultas que exponen `BanCount` aplican el criterio `IsActive` correspondiente.
- Compilación completa sin errores.

### Pending Work
Ninguna. Edición y revocación lógica están implementadas.

### Unblocked by
TASK-API-0097

### Unblocks
TASK-API-0099

### Assigned to
Backend Agent