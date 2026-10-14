# TASK-API-0116 — Validar seguridad e integridad de la administración de usuarios administradores

## Task ID

TASK-API-0116

## Title

Validar seguridad e integridad de la administración de usuarios administradores

## Description

Realizar una revisión transversal de la implementación de `US-0012` para detectar posibles vulnerabilidades o inconsistencias en la administración de cuentas con rol `Administrator`.

## Validations

Verificar como mínimo:

- Autorización de todos los endpoints.
- Asignación del rol exclusivamente en backend.
- Imposibilidad de escalar privilegios mediante requests manipulados.
- Imposibilidad de modificar el rol mediante edición común.
- Comportamiento de `User.IsActive`.
- Imposibilidad de autenticación de usuarios inactivos.
- Protección contra la eliminación accidental de todos los administradores activos.
- Validación de email duplicado.
- Validación de país.
- Reglas de contraseña.
- Ausencia de almacenamiento de contraseñas en texto plano.
- Ausencia de DELETE físico.
- Consistencia con `AuthService`.
- Consistencia con `UserRepository`.
- Ausencia de consultas N+1.
- Uso correcto de `AsNoTracking()` donde corresponda.

## Acceptance Criteria

- [ ] Todas las operaciones están correctamente protegidas.
- [ ] No existe escalamiento de privilegios.
- [ ] `User.IsActive` mantiene su semántica.
- [ ] Los usuarios inactivos no pueden autenticarse.
- [ ] El rol `Administrator` no puede ser manipulado desde requests de edición.
- [ ] No existe eliminación física.
- [ ] La implementación es consistente con las reglas de identidad existentes.
- [ ] La compilación completa es correcta.
- [ ] La documentación refleja la implementación real.

## Dependencies

TASK-API-0115

## Assigned to

Backend Agent

## Execution Result

### Status
Finished

### Completed Work
- Todos los endpoints están protegidos con `[Authorize(Roles = "Administrator")]`.
- El rol `Administrator` se asigna exclusivamente en backend; los contratos de request no lo incluyen.
- Imposibilidad de escalar privilegios: `UpdateAdminUserAsync` no modifica el rol.
- `User.IsActive` mantiene su semántica: desactivación lógica, reactivación lógica.
- Usuarios inactivos no pueden autenticarse (validado por `AuthService`).
- Protección contra eliminación accidental de todos los administradores: `DeactivateAdminUserAsync` verifica que no sea el último administrador activo.
- Validación de email duplicado en creación y edición.
- Validación de país activo en creación y edición.
- Reglas de contraseña aplicadas mediante `IPasswordValidator` en creación.
- No se almacenan contraseñas en texto plano; se usa `IPasswordHasher`.
- No existe DELETE físico.
- Consistencia con `AuthService` y `UserRepository`.
- Ausencia de consultas N+1 en `GetAdminUsersPagedAsync`.
- Uso correcto de `AsNoTracking()` en `GetAdminUsersPagedAsync`.
- La solución compila correctamente sin errores ni warnings.
- La documentación (`endpoints.md`) fue actualizada con los nuevos endpoints.

### Pending Work
Ninguna.

### Unblocked by
TASK-API-0115

### Unblocks
Ninguna.

### Assigned to
Backend Agent