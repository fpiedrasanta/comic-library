# TASK-API-0106 — Validar modelo y reglas para administración de usuarios administradores

## Task ID

TASK-API-0106

## Title

Validar modelo y reglas para administración de usuarios administradores

## Description

Revisar la implementación actual de usuarios, roles, autenticación e identidad para determinar si el modelo existente soporta completamente la administración de usuarios con rol `Administrator`.

La funcionalidad debe utilizar la identidad existente y no crear una entidad independiente para representar administradores.

## Scope

Verificar:

- Entidad `User`.
- Roles existentes.
- Relación entre usuarios y roles.
- `User.IsActive`.
- Repositorios existentes.
- Servicios existentes.
- Mecanismo de autenticación.
- Autorización mediante rol `Administrator`.
- Seed del administrador inicial.
- Reglas de integridad necesarias para administrar administradores.

## Business Rules

- Un administrador es un `User` cuyo rol es `Administrator`.
- No debe existir una entidad `Administrator` independiente.
- `User.IsActive` representa exclusivamente el estado lógico de la cuenta.
- La desactivación de un administrador debe utilizar `User.IsActive = false`.
- Un usuario inactivo no puede autenticarse.
- Un usuario sin rol `Administrator` no debe formar parte del listado de administradores.
- La administración de administradores debe estar protegida mediante autorización administrativa.

## Deliverables

- Validación del modelo actual.
- Identificación de cambios necesarios.
- Identificación de código reutilizable.
- Documentación de cualquier inconsistencia encontrada.

## Acceptance Criteria

- [ ] Se confirma si el modelo actual soporta la funcionalidad.
- [ ] No se crea una entidad `Administrator` innecesaria.
- [ ] Se confirma la semántica de `User.IsActive`.
- [ ] Se confirma el mecanismo utilizado para determinar el rol `Administrator`.
- [ ] Se identifican las modificaciones necesarias antes de implementar las operaciones CRUD.

## Assigned to

Backend Agent

## Execution Result

### Status
Finished

### Completed Work
- Validado el modelo actual de `User`, `UserRole` e `IsActive`.
- Confirmado que no existe entidad `Administrator` independiente; el rol se representa mediante `UserRole.Administrator`.
- Confirmado que `User.IsActive` representa exclusivamente el estado lógico de la cuenta y se utiliza para baja lógica.
- Verificado que `UserRepository` ya dispone de operaciones básicas (`GetByEmailAsync`, `GetByIdAsync`, `AddAsync`, `UpdateAsync`, `DeactivateAsync`, `GetPagedAsync`).
- Verificado que `AuthService` bloquea autenticación de usuarios inactivos y requiere email validado.
- Verificado que `InitialAdminSeeder` crea usuarios con `Role = UserRole.Administrator` e `IsActive = true`.
- Verificado que la autorización por rol `Administrator` ya está soportada por la infraestructura de autenticación de ASP.NET Core Identity.
- Identificado que no se requieren cambios en `domain.md` ni en las entidades existentes.
- Identificado que se necesitan nuevos DTOs, métodos de repository, services y controllers específicos para la administración de usuarios administradores.

### Pending Work
Ninguna. El modelo base está validado.

### Unblocked by
Ninguna.

### Unblocks
TASK-API-0107, TASK-API-0108, TASK-API-0109, TASK-API-0110, TASK-API-0111, TASK-API-0112, TASK-API-0113, TASK-API-0114, TASK-API-0115, TASK-API-0116

### Assigned to
Backend Agent