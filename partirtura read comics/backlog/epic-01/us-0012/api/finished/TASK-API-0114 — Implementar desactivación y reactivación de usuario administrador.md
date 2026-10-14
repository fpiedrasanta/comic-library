# TASK-API-0114 — Implementar desactivación y reactivación de usuario administrador

## Task ID

TASK-API-0114

## Title

Implementar desactivación y reactivación de usuario administrador

## Description

Implementar las operaciones necesarias para desactivar y reactivar lógicamente usuarios con rol `Administrator`.

## Requirements

La desactivación debe:

- Establecer `User.IsActive = false`.
- No eliminar físicamente el usuario.
- Impedir nuevas autenticaciones.
- Conservar la información histórica.

La reactivación debe:

- Establecer `User.IsActive = true`.
- No modificar el rol.
- Permitir nuevamente la autenticación, siempre que no exista otra condición que la impida.

## Security

Debe existir una regla para evitar que una operación administrativa deje accidentalmente al sistema sin ningún administrador activo.

La implementación debe determinar cómo proteger esta condición de acuerdo con el modelo existente.

## Acceptance Criteria

- [ ] Se puede desactivar un administrador.
- [ ] La desactivación es lógica.
- [ ] El usuario no se elimina físicamente.
- [ ] Un administrador inactivo no puede iniciar sesión.
- [ ] Se puede reactivar un administrador.
- [ ] La reactivación conserva el rol.
- [ ] Se valida la existencia del usuario.
- [ ] Se valida que el usuario sea administrador.
- [ ] Se protege la existencia de al menos un administrador activo cuando corresponda.

## Dependencies

TASK-API-0113

## Assigned to

Backend Agent

## Execution Result

### Status
Finished

### Completed Work
- Agregados métodos `DeactivateAdminUserAsync` y `ActivateAdminUserAsync` en `IAdminUserService`.
- Implementados métodos en `AdminUserService` con validaciones de existencia, rol `Administrator` y protección del último administrador activo.
- `DeactivateAdminUserAsync` establece `IsActive = false` mediante `IUserRepository.DeactivateAsync` y persiste cambios.
- `ActivateAdminUserAsync` establece `IsActive = true`, actualiza `UpdatedAt` y persiste cambios.
- La desactivación es lógica; no se elimina físicamente el usuario.
- Un administrador inactivo no puede autenticarse (bloqueado por `AuthService`).

### Pending Work
Ninguna.

### Unblocked by
TASK-API-0113

### Unblocks
TASK-API-0115

### Assigned to
Backend Agent