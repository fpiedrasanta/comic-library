# TASK-API-0111 — Definir contratos para creación y edición de usuarios administradores

## Task ID

TASK-API-0111

## Title

Definir contratos para creación y edición de usuarios administradores

## Description

Definir los contratos necesarios para crear y modificar usuarios con rol `Administrator`.

## Create

El contrato de creación debe permitir definir la información necesaria para crear una cuenta administrativa.

Como mínimo:

- FirstName.
- LastName.
- Email.
- CountryId.
- Password.

El rol `Administrator` debe ser asignado por el backend y no debe recibirse desde el cliente.

## Update

El contrato de edición debe permitir modificar la información permitida del administrador.

El identificador del usuario debe provenir de la ruta y no del body.

El contrato no debe permitir modificar directamente el rol.

## Business Rules

- El cliente nunca determina el rol.
- La creación mediante este endpoint siempre crea un `Administrator`.
- La contraseña debe cumplir las reglas de seguridad existentes.
- El email debe respetar las reglas de unicidad existentes.

## Acceptance Criteria

- [ ] Existe `CreateAdminUserRequest`.
- [ ] Existe `UpdateAdminUserRequest`.
- [ ] El rol no forma parte de los contratos.
- [ ] `UserId` no forma parte del body de actualización.
- [ ] Los contratos respetan las reglas de identidad existentes.

## Dependencies

TASK-API-0110

## Assigned to

Backend Agent

## Execution Result

### Status
Finished

### Completed Work
- Creado `CreateAdminUserRequest` en `Application/DTOs/CreateAdminUserRequest.cs` con `FirstName`, `LastName`, `Email`, `CountryId`, `Password`.
- Creado `UpdateAdminUserRequest` en `Application/DTOs/UpdateAdminUserRequest.cs` con `FirstName`, `LastName`, `Email`, `CountryId`.
- El rol no forma parte de los contratos.
- `UserId` no forma parte del body de actualización; se toma de la ruta.
- Los contratos respetan las reglas de identidad existentes.

### Pending Work
Ninguna.

### Unblocked by
TASK-API-0110

### Unblocks
TASK-API-0112

### Assigned to
Backend Agent