# TASK-API-0092 — Definir contratos para consulta paginada de Bans

## Task ID

TASK-API-0092

## Title

Definir contratos para consulta paginada de Bans

## Description

Definir los contratos de aplicación necesarios para consultar de forma paginada el historial de baneos desde el Dashboard administrativo.

La consulta debe permitir buscar, ordenar y filtrar los registros de Ban de acuerdo con la UX definida para `US-0011 — Administrar bloqueos/baneos de usuarios`.

La consulta debe trabajar con el historial de Bans y no debe eliminar ni ocultar físicamente registros que hayan sido anulados mediante `IsActive = false`.

## Request

Crear un DTO de consulta que contemple:

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

## Search

El parámetro `search` debe permitir buscar mediante OR por:

- Nombre.
- Apellido.
- Email.

La búsqueda debe ser parcial y case-insensitive según el comportamiento soportado por el proveedor de base de datos.

## Date filters

`startDate` y `endDate` son opcionales.

Ambos límites son inclusivos.

Cuando se consulte una única fecha, por ejemplo:

`01/01/2026` a `01/01/2026`

la consulta debe representar conceptualmente todo el día:

`01/01/2026 00:00:00` hasta antes de `02/01/2026 00:00:00`.

Las fechas recibidas desde el frontend representan hora local y deberán convertirse a UTC antes de ejecutar la consulta.

## Ordering

El contrato debe permitir ordenar por:

- `CreatedAt`.
- `FirstName`.
- `LastName`.
- `Email`.
- `StartDate`.
- `EndDate`.

Debe soportar:

- `ASC`.
- `DESC`.

## Response

Crear un DTO para cada elemento del listado que incluya como mínimo:

- Ban Id.
- User Id.
- FirstName.
- LastName.
- Email.
- AvatarUrl.
- CreatedAt.
- StartDate.
- EndDate.
- Reason.
- IsActive.
- Estado derivado del Ban.

El estado debe permitir distinguir al menos:

- Activo.
- Finalizado.
- Anulado.

## Acceptance Criteria

- [ ] Existe un request DTO para la consulta paginada.
- [ ] Existe un DTO para los elementos del listado.
- [ ] Se contemplan todos los filtros definidos.
- [ ] Se contemplan todos los criterios de ordenamiento definidos.
- [ ] Se contemplan `ASC` y `DESC`.
- [ ] Los valores por defecto son `currentPage = 1`, `pageSize = 48`, `orderBy = CreatedAt` y `orderDir = DESC`.
- [ ] Se documentan las reglas de conversión de fechas local/UTC.
- [ ] Los contratos no permiten operaciones de eliminación física.
- [ ] Los DTOs no exponen información sensible.

## Assigned to

Backend Agent

## Status

Planned

## Execution Result

### Status
Finished

### Completed Work
- DTO `GetBansRequest` creado en `Application/DTOs/GetBansRequest.cs` con filtros `Search`, `StartDate`, `EndDate` e `IsActive`.
- DTO `BanListItemDto` creado en `Application/DTOs/BanListItemDto.cs` con todos los campos requeridos para el listado.
- El estado derivado `Status` distingue: `Active`, `Finished`, `Revoked`.
- Valores por defecto: `currentPage = 1`, `pageSize = 48`, `orderBy = CreatedAt`, `orderDir = DESC`.
- Filtros de fecha inclusivos documentados en el DTO.

### Pending Work
Ninguna. Los contratos están definidos.

### Unblocked by
Ninguna. Esta task desbloquea TASK-API-0093.

### Assigned to
Backend Agent