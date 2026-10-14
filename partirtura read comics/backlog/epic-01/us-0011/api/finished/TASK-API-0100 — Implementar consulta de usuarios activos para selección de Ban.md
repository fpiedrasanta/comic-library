# TASK-API-0100 — Implementar consulta de usuarios activos para selección de Ban

## Task ID

TASK-API-0100

## Title

Implementar consulta de usuarios activos para selección de Ban

## Description

Implementar la consulta utilizada por el Dashboard para seleccionar el usuario al que se aplicará un nuevo Ban.

Esta consulta es diferente de la consulta general de usuarios porque solamente debe permitir seleccionar cuentas activas.

## Filters

La consulta debe devolver exclusivamente:

`User.IsActive = true`

Debe incluir información suficiente para reutilizar las mismas cards visuales utilizadas por `Consultar usuarios`.

## Search

Permitir búsqueda mediante OR por:

- Nombre.
- Apellido.
- Email.

## Ordering

Permitir ordenar por:

- Fecha de registro.
- Nombre.
- Apellido.
- Email.

Soportar:

- ASC.
- DESC.

## Ban status

Cada usuario debe informar si actualmente posee un Ban vigente.

La respuesta debe permitir al Dashboard:

- Habilitar `Seleccionar` cuando no exista Ban vigente.
- Deshabilitar `Seleccionar` cuando exista Ban vigente.

## BanCount

`BanCount` debe contar únicamente los Bans que correspondan según la regla de actividad definida.

Los registros de Ban con `IsActive = false` no deben contabilizarse.

## Pagination

La consulta debe soportar paginación.

Valores por defecto:

- `currentPage = 1`.
- `pageSize = 48`.
- `orderBy = CreatedAt`.
- `orderDir = DESC`.

## Acceptance Criteria

- [ ] Solamente devuelve usuarios activos.
- [ ] Permite búsqueda por nombre, apellido y email.
- [ ] Permite ordenar por fecha, nombre, apellido y email.
- [ ] Soporta ASC y DESC.
- [ ] Informa `IsBanned`.
- [ ] Informa `BanCount`.
- [ ] Los Bans inactivos no se cuentan.
- [ ] Soporta paginación.
- [ ] No permite seleccionar desde backend un usuario que tenga un Ban vigente.
- [ ] No existen consultas N+1.

## Assigned to

Backend Agent

## Status

Planned

## Dependencies

TASK-API-0098

## Execution Result

### Status
Finished

### Completed Work
- DTO `GetUsersForBanSelectionRequest` creado en `Application/DTOs/GetUsersForBanSelectionRequest.cs`.
- `IUserRepository` extendido con `GetActiveForBanSelectionAsync`.
- `UserRepository.GetActiveForBanSelectionAsync` implementado con:
  - Filtro `IsActive = true`.
  - Exclusión de usuarios con Ban vigente.
  - Búsqueda OR por `FirstName`, `LastName` y `Email`.
  - Ordenamiento por `CreatedAt`, `FirstName`, `LastName`, `Email`.
  - Paginación.
  - Cálculo de `BanCount` solo para Bans activos (`IsActive = true`).
  - Cálculo de `IsBanned`.
  - Uso de `AsNoTracking` y carga explícita de `Nationality` y `Avatar` para evitar N+1.
- `IUserQueryService` extendido con `GetActiveForBanSelectionAsync`.
- `UserQueryService.GetActiveForBanSelectionAsync` implementado para normalizar parámetros y construir `ListResponse<UserListItemDto>`.
- Endpoint `GET /api/users/active-for-ban` agregado a `UsersController` con autorización `Administrator`.
- `project/endpoints.md` actualizado con el nuevo endpoint.
- Como parte de esta implementación, se corrigió `BanCount` en `UserRepository.GetPagedAsync` para contar solo Bans activos, alineándolo con la regla de negocio.
- Compilación completa sin errores.

### Pending Work
Ninguna. La consulta de selección de usuarios está implementada.

### Unblocked by
TASK-API-0098

### Unblocks
Ninguna. Esta es la última task de la secuencia de backend.

### Assigned to
Backend Agent