# TASK-API-0095 — Implementar endpoint de consulta de Bans

## Task ID

TASK-API-0095

## Title

Implementar endpoint de consulta de Bans

## Description

Implementar el endpoint administrativo para consultar el historial de Bans desde el Dashboard.

## Endpoint

`GET /api/bans`

## Authentication

- Requiere autenticación.
- Requiere rol `Administrator`.

## Query parameters

Aceptar:

- `currentPage`.
- `pageSize`.
- `orderBy`.
- `orderDir`.
- `search`.
- `startDate`.
- `endDate`.
- `isActive`.

Valores por defecto:

- `currentPage = 1`.
- `pageSize = 48`.
- `orderBy = CreatedAt`.
- `orderDir = DESC`.

## Response

Retornar:

`ApiResponse<ListResponse<BanListItemDto>>`

## Behavior

El controller debe delegar la operación al servicio correspondiente.

No debe contener:

- Consultas EF Core.
- Conversión manual de fechas.
- Lógica de búsqueda.
- Lógica de ordenamiento.
- Lógica de negocio sobre Bans.

## Acceptance Criteria

- [ ] Existe `GET /api/bans`.
- [ ] Requiere autenticación.
- [ ] Requiere rol `Administrator`.
- [ ] Acepta todos los parámetros definidos.
- [ ] Retorna respuesta paginada.
- [ ] Respeta los valores por defecto.
- [ ] Documentado en `project/endpoints.md`.
- [ ] Devuelve errores mediante el mecanismo centralizado existente.

## Assigned to

Backend Agent

## Status

Planned

## Dependencies

TASK-API-0094

## Execution Result

### Status
Finished

### Completed Work
- `BansController` creado en `Api/Controllers/BansController.cs`.
- Endpoint `GET /api/bans` implementado con autorización `Administrator`.
- El controller recibe `GetBansRequest` desde query y delega en `IBanService`.
- La respuesta retorna `ApiResponse<ListResponse<BanListItemDto>>`.
- No contiene lógica de persistencia, búsqueda, ordenamiento ni conversión de fechas.
- `project/endpoints.md` actualizado con el contrato del endpoint.

### Pending Work
Ninguna. El endpoint de consulta está implementado.

### Unblocked by
TASK-API-0094

### Unblocks
TASK-API-0096

### Assigned to
Backend Agent