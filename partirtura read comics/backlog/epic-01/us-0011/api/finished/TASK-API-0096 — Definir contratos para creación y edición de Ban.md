# TASK-API-0096 — Definir contratos para creación y edición de Ban

## Task ID

TASK-API-0096

## Title

Definir contratos para creación y edición de Ban

## Description

Definir los contratos necesarios para crear y modificar un Ban desde el Dashboard.

La operación debe mantener el historial de moderación.

No debe existir eliminación física de registros.

## Create Ban

El request debe contemplar:

- `userId`.
- `startDate`.
- `endDate`.
- `reason`.

`startDate` es obligatorio.

`endDate` es opcional.

`reason` es obligatorio para documentar el motivo de la moderación.

## Default values

El frontend podrá enviar `startDate` con la fecha/hora seleccionada.

La interfaz utilizará como valor inicial la fecha/hora actual.

El backend debe validar que la fecha recibida sea válida.

## Edit Ban

La edición debe permitir modificar los datos permitidos del Ban manteniendo su identidad e historial.

No debe crearse un nuevo registro para representar una edición.

## Revocation

La operación denominada "Eliminar" en la interfaz no debe representar un DELETE físico.

Debe conceptualmente representar la revocación/anulación del Ban mediante:

`IsActive = false`

El registro debe permanecer en la base de datos.

## Validation rules

No debe permitirse crear un nuevo Ban para un usuario que actualmente tenga otro Ban vigente.

## Acceptance Criteria

- [ ] Existe request DTO para crear Ban.
- [ ] Existe request DTO para editar Ban.
- [ ] Se contempla `userId`.
- [ ] Se contempla `startDate`.
- [ ] Se contempla `endDate`.
- [ ] Se contempla `reason`.
- [ ] Se define explícitamente la revocación mediante `IsActive = false`.
- [ ] No existe contrato para DELETE físico.
- [ ] Se documenta la regla de un único Ban vigente por usuario.

## Assigned to

Backend Agent

## Status

Planned

## Execution Result

### Status
Finished

### Completed Work
- DTO `CreateBanRequest` creado en `Application/DTOs/CreateBanRequest.cs` con campos `UserId`, `StartDate`, `EndDate` y `Reason`.
- DTO `UpdateBanRequest` creado en `Application/DTOs/UpdateBanRequest.cs` con campos `StartDate`, `EndDate` y `Reason`.
- `UserId` se incluye solo en creación; en edición el identificador del Ban se toma de la ruta, no del cuerpo.
- La revocación se define explícitamente como `IsActive = false` sin eliminación física.
- Regla de negocio documentada: un usuario no puede tener más de un Ban vigente (`IsActive = true` y vigencia actual).

### Pending Work
Ninguna. Los contratos de creación y edición están definidos.

### Unblocked by
TASK-API-0095

### Unblocks
TASK-API-0097

### Assigned to
Backend Agent