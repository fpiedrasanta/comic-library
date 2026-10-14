# TASK-API-0115 — Implementar endpoints de gestión de usuarios administradores

## Task ID

TASK-API-0115

## Title

Implementar endpoints de gestión de usuarios administradores

## Description

Exponer mediante la API las operaciones de creación, edición, desactivación y reactivación de usuarios administradores.

## Endpoints

### Crear

`POST /api/admin-users`

### Editar

`PUT /api/admin-users/{userId}`

### Desactivar

`PATCH /api/admin-users/{userId}/deactivate`

### Reactivar

`PATCH /api/admin-users/{userId}/activate`

## Authorization

Todos los endpoints deben requerir autenticación y autorización administrativa.

## Requirements

Los controllers deben:

- Recibir los contratos definidos.
- Delegar en los servicios.
- Retornar `ApiResponse`.
- No contener lógica de negocio.
- No contener lógica de persistencia.

## Acceptance Criteria

- [ ] Existe endpoint POST.
- [ ] Existe endpoint PUT.
- [ ] Existe endpoint PATCH de desactivación.
- [ ] Existe endpoint PATCH de activación.
- [ ] Todos requieren rol `Administrator`.
- [ ] Utilizan los contratos definidos.
- [ ] Utilizan respuestas estándar.
- [ ] Los endpoints están documentados en `project/endpoints.md`.

## Dependencies

TASK-API-0112, TASK-API-0113, TASK-API-0114

## Assigned to

Backend Agent

## Execution Result

### Status
Finished

### Completed Work
- Creados endpoints en `AdminUsersController`:
  - `POST /api/admin-users` para creación.
  - `PUT /api/admin-users/{userId}` para edición.
  - `PATCH /api/admin-users/{userId}/deactivate` para desactivación.
  - `PATCH /api/admin-users/{userId}/activate` para reactivación.
- Todos requieren autenticación y rol `Administrator`.
- Delegan en `IAdminUserService`.
- Retornan `ApiResponse`.
- No contienen lógica de negocio, persistencia, búsqueda, ordenamiento ni paginación.
- Documentados en `project/endpoints.md`.

### Pending Work
Ninguna.

### Unblocked by
TASK-API-0112, TASK-API-0113, TASK-API-0114

### Unblocks
TASK-API-0116

### Assigned to
Backend Agent