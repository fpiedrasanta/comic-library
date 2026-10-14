# TASK-API-0113 — Implementar edición de usuario administrador

## Task ID

TASK-API-0113

## Title

Implementar edición de usuario administrador

## Description

Implementar la modificación de los datos permitidos de un usuario con rol `Administrator`.

## Requirements

El backend debe:

- Obtener el usuario mediante el identificador de la ruta.
- Validar que exista.
- Validar que posea rol `Administrator`.
- Modificar únicamente los campos permitidos.
- Validar país.
- Validar unicidad del email cuando corresponda.
- No modificar el rol mediante este endpoint.

## Security

El endpoint no debe permitir convertir un usuario administrador en usuario público mediante una operación de edición común.

La modificación del rol queda fuera del alcance de esta operación.

## Acceptance Criteria

- [ ] Se puede editar un administrador existente.
- [ ] Solo se pueden editar usuarios con rol `Administrator`.
- [ ] Se valida existencia.
- [ ] Se valida país.
- [ ] Se valida email.
- [ ] El rol permanece `Administrator`.
- [ ] No se puede modificar el rol mediante el request.
- [ ] Los errores utilizan el mecanismo existente.

## Dependencies

TASK-API-0112

## Assigned to

Backend Agent

## Execution Result

### Status
Finished

### Completed Work
- Agregado método `UpdateAdminUserAsync` en `IAdminUserService`.
- Implementado método en `AdminUserService` con validaciones de existencia, rol `Administrator`, país y unicidad de email.
- Modifica únicamente `FirstName`, `LastName`, `Email`, `CountryId` y `UpdatedAt`.
- No modifica el rol.
- Persiste mediante `IUserRepository.UpdateAsync` y `IUnitOfWork.SaveChangesAsync`.

### Pending Work
Ninguna.

### Unblocked by
TASK-API-0112

### Unblocks
TASK-API-0114

### Assigned to
Backend Agent