# TASK-API-0107 — Definir contratos para consulta de usuarios administradores

## Task ID

TASK-API-0107

## Title

Definir contratos para consulta de usuarios administradores

## Description

Crear los contratos necesarios para consultar usuarios con rol `Administrator` desde el Dashboard.

La consulta debe soportar búsqueda, ordenamiento y paginación.

## Request

El contrato debe permitir como mínimo:

- `Search`.
- `CurrentPage`.
- `PageSize`.
- `OrderBy`.
- `OrderDir`.

La búsqueda deberá permitir consultar por:

- Nombre.
- Apellido.
- Email.

## Response

El resultado debe utilizar el mecanismo de respuesta paginada existente en el backend.

Cada elemento debe contener la información necesaria para representar un administrador en el Dashboard.

Como mínimo:

- Id.
- Nombre.
- Apellido.
- Email.
- País.
- Avatar.
- Fecha de registro.
- Estado de la cuenta.

El rol no debe ser enviado como información editable desde el frontend.

## Acceptance Criteria

- [ ] Existe request DTO.
- [ ] Existe DTO para los elementos del listado.
- [ ] Existe soporte para paginación.
- [ ] Existe soporte para ordenamiento.
- [ ] Existe soporte para búsqueda.
- [ ] El contrato utiliza las estructuras de respuesta existentes.
- [ ] El contrato no permite modificar el rol desde el listado.

## Dependencies

TASK-API-0106

## Assigned to

Backend Agent

## Execution Result

### Status
Finished

### Completed Work
- Creado `GetAdminUsersRequest` en `Application/DTOs/GetAdminUsersRequest.cs`, heredando de `ListRequest`.
- Creado `AdminUserListItemDto` en `Application/DTOs/AdminUserListItemDto.cs` con los campos requeridos: Id, FirstName, LastName, Email, AvatarUrl, CountryName, CreatedAt, IsActive.
- El rol no se incluye en el DTO de listado porque el endpoint es exclusivo de administradores.
- Los contratos respetan las estructuras de respuesta existentes (`ListRequest`, `ListResponse<T>`).

### Pending Work
Ninguna.

### Unblocked by
TASK-API-0106

### Unblocks
TASK-API-0108

### Assigned to
Backend Agent