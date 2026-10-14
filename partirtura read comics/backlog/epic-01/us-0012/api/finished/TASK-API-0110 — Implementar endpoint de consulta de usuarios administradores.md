# TASK-API-0110 — Implementar endpoint de consulta de usuarios administradores

## Task ID

TASK-API-0110

## Title

Implementar endpoint de consulta de usuarios administradores

## Description

Exponer el listado de usuarios administradores mediante la API.

## Endpoint

`GET /api/admin-users`

## Authorization

El endpoint debe requerir autenticación y autorización administrativa.

## Requirements

- Recibir parámetros mediante query string.
- Delegar en el servicio.
- Retornar el contrato estándar `ApiResponse`.
- No contener lógica de persistencia.
- No contener lógica de búsqueda.
- No contener lógica de ordenamiento.
- No contener lógica de paginación.

## Acceptance Criteria

- [ ] El endpoint requiere autenticación.
- [ ] El endpoint requiere rol `Administrator`.
- [ ] Retorna usuarios administradores paginados.
- [ ] Respeta búsqueda, ordenamiento y paginación.
- [ ] Utiliza el contrato estándar de respuesta.
- [ ] `project/endpoints.md` queda actualizado.

## Dependencies

TASK-API-0109

## Assigned to

Backend Agent

## Execution Result

### Status
Finished

### Completed Work
- Creado `AdminUsersController` en `Api/Controllers/AdminUsersController.cs`.
- Endpoint `GET /api/admin-users` con autorización `[Authorize(Roles = "Administrator")]`.
- Delega en `IAdminUserService.GetPagedAsync`.
- Retorna `ApiResponse<ListResponse<AdminUserListItemDto>>`.
- No contiene lógica de negocio, persistencia, búsqueda, ordenamiento ni paginación.

### Pending Work
Ninguna.

### Unblocked by
TASK-API-0109

### Unblocks
TASK-API-0111

### Assigned to
Backend Agent