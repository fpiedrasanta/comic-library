# TASK-API-0108 — Implementar consulta paginada de usuarios administradores

## Task ID

TASK-API-0108

## Title

Implementar consulta paginada de usuarios administradores

## Description

Implementar en el repositorio de usuarios la consulta paginada de usuarios que poseen el rol `Administrator`.

## Requirements

La consulta debe:

- Incluir únicamente usuarios con rol `Administrator`.
- Permitir búsqueda por nombre, apellido y email.
- Utilizar OR entre los campos de búsqueda.
- Permitir ordenar por los campos definidos en el contrato.
- Permitir dirección ASC/DESC.
- Aplicar paginación después de filtros y ordenamiento.
- Utilizar `AsNoTracking()` cuando corresponda.
- Evitar consultas N+1.
- Utilizar proyección cuando resulte apropiado.

## User Status

`User.IsActive` debe representar exclusivamente el estado lógico de la cuenta.

No debe utilizarse para determinar si un usuario posee el rol `Administrator`.

## Acceptance Criteria

- [ ] Solo se devuelven usuarios con rol `Administrator`.
- [ ] Usuarios públicos no aparecen.
- [ ] Usuarios inactivos pueden ser identificados correctamente.
- [ ] La búsqueda funciona por nombre, apellido y email.
- [ ] El ordenamiento funciona.
- [ ] La paginación funciona.
- [ ] No existen consultas N+1.
- [ ] La consulta compila correctamente.

## Dependencies

TASK-API-0107

## Assigned to

Backend Agent

## Execution Result

### Status
Finished

### Completed Work
- Agregado método `GetAdminUsersPagedAsync` en `IUserRepository`.
- Implementado método en `UserRepository` con:
  - Filtro por `Role == UserRole.Administrator`.
  - Búsqueda por `FirstName`, `LastName` y `Email` con OR.
  - Ordenamiento por `FirstName`, `LastName`, `Email`, `CreatedAt` con ASC/DESC.
  - Paginación mediante `Skip`/`Take`.
  - `AsNoTracking()` para lectura.
  - Proyección directa a `AdminUserListItemDto`.
  - `Include` de `Nationality` y `Avatar` para resolver `CountryName` y `AvatarUrl`.
- No existen consultas N+1.
- La consulta compila correctamente.

### Pending Work
Ninguna.

### Unblocked by
TASK-API-0107

### Unblocks
TASK-API-0109

### Assigned to
Backend Agent