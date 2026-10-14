# TASK-API-0099 — Implementar endpoints de creación, edición y revocación de Ban

## Task ID

TASK-API-0099

## Title

Implementar endpoints de gestión de Ban

## Description

Exponer mediante API las operaciones necesarias para crear, editar y revocar Bans desde el Dashboard.

Todas las operaciones requieren autenticación y rol `Administrator`.

## Endpoints

### Crear

`POST /api/bans`

### Editar

`PUT /api/bans/{banId}`

### Revocar

`PATCH /api/bans/{banId}/deactivate`

La operación de revocación no debe implementarse como DELETE físico.

## Authentication

Todos los endpoints requieren:

- Bearer Token.
- Rol `Administrator`.

## Date handling

Las fechas recibidas desde el Dashboard representan hora local.

El backend debe convertirlas a UTC antes de persistir.

Las respuestas deben utilizar el mecanismo centralizado de conversión de fechas.

## Business errors

El API debe informar correctamente situaciones como:

- Usuario inexistente.
- Usuario inactivo.
- Usuario actualmente baneado.
- Ban inexistente.
- Fechas inválidas.
- Motivo faltante.
- Conflicto con otro Ban vigente.

No exponer detalles internos de persistencia.

## Documentation

Actualizar:

`project/endpoints.md`

## Acceptance Criteria

- [ ] Existe endpoint POST.
- [ ] Existe endpoint PUT.
- [ ] Existe endpoint de revocación.
- [ ] Todos requieren Administrator.
- [ ] No existe DELETE físico.
- [ ] La revocación conserva el historial.
- [ ] Las fechas se procesan correctamente entre local y UTC.
- [ ] Los errores utilizan el formato estándar de la API.
- [ ] Los endpoints están documentados.

## Assigned to

Backend Agent

## Status

Planned

## Dependencies

TASK-API-0097

TASK-API-0098

## Execution Result

### Status
Finished

### Completed Work
- `BansController` actualizado con tres endpoints:
  - `POST /api/bans` crea un ban (`CreateBanAsync`).
  - `PUT /api/bans/{banId}` edita un ban (`UpdateBanAsync`).
  - `PATCH /api/bans/{banId}/deactivate` revoca un ban (`DeactivateBanAsync`).
- Todos los endpoints requieren autenticación y rol `Administrator`.
- Las fechas se convierten a UTC en la capa de servicio antes de persistir.
- Los errores de negocio utilizan el mecanismo centralizado existente (`ValidationException`, `BusinessNotFoundException`, `BusinessConflictException`).
- No existe DELETE físico; la revocación establece `IsActive = false`.
- `project/endpoints.md` actualizado con los contratos de los tres endpoints.
- Compilación completa sin errores.

### Pending Work
Ninguna. Los endpoints de gestión de Ban están implementados.

### Unblocked by
TASK-API-0097, TASK-API-0098

### Unblocks
TASK-API-0100

### Assigned to
Backend Agent