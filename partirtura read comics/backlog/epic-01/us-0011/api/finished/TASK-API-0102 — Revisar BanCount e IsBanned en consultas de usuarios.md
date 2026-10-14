# TASK-API-0102 — Revisar BanCount e IsBanned en consultas de usuarios

## Task ID

TASK-API-0102

## Title

Revisar y corregir BanCount e IsBanned en consultas de usuarios

## Description

Revisar las consultas existentes de usuarios para garantizar que `BanCount` e `IsBanned` respeten las reglas definitivas de negocio para los Bans.

Esta revisión debe incluir como mínimo:

- `UserRepository.GetPagedAsync`.
- Consulta utilizada por la selección de usuarios para crear un Ban.
- Cualquier otra consulta existente que exponga `BanCount` o `IsBanned`.

## BanCount

`BanCount` debe representar la cantidad histórica de Bans válidos según la regla de actividad definida.

Los registros con:

`IsActive = false`

no deben contabilizarse.

No se deben contar registros anulados/revocados.

## IsBanned

`IsBanned` debe representar exclusivamente si existe actualmente un Ban vigente.

La condición debe ser:

- `IsActive = true`.
- `StartDate <= now`.
- `EndDate` es `null` o `EndDate > now`.

Un Ban histórico finalizado no convierte al usuario en `IsBanned = true`.

Un Ban revocado tampoco.

## Existing user query

Revisar específicamente la implementación de `TASK-API-0091`.

La consulta actualmente utiliza:

- `_context.Bans.Count(...)`
- `_context.Bans.Any(...)`

El cálculo de `BanCount` debe corregirse para respetar `IsActive`.

## Selection query

La consulta de usuarios activos para crear un nuevo Ban debe utilizar exactamente las mismas reglas.

No debe existir una definición diferente de `BanCount` o `IsBanned` entre endpoints.

## Acceptance Criteria

- [ ] `BanCount` no cuenta Bans con `IsActive = false`.
- [ ] `IsBanned` solamente representa un Ban vigente.
- [ ] Bans finalizados no producen `IsBanned = true`.
- [ ] Bans revocados no producen `IsBanned = true`.
- [ ] `UserRepository.GetPagedAsync` fue revisado y corregido.
- [ ] La consulta de selección de usuarios utiliza las mismas reglas.
- [ ] No existen definiciones inconsistentes de `BanCount`.
- [ ] No existen definiciones inconsistentes de `IsBanned`.
- [ ] No se generan consultas N+1.
- [ ] Se actualiza la documentación correspondiente si cambia el contrato.

## Assigned to

Backend Agent

## Status

Planned

## Dependencies

TASK-API-0090

TASK-API-0091

## Execution Result

### Status
Finished

### Completed Work
- `UserRepository.GetPagedAsync` revisado y corregido:
  - `BanCount` ahora cuenta solo Bans con `IsActive = true` (`g.Count(b => b.IsActive)`).
  - `IsBanned` ya representaba correctamente un ban vigente.
  - El `OrderBy` por `BanCount` ahora cuenta solo Bans activos.
- `UserRepository.GetActiveForBanSelectionAsync` implementado en TASK-API-0100 con las mismas reglas:
  - `BanCount` cuenta solo Bans activos.
  - `IsBanned` representa un ban vigente.
  - Excluye usuarios con ban vigente.
- No se encontraron otras consultas con definiciones inconsistentes de `BanCount` o `IsBanned`.
- No se generan consultas N+1 en ninguna de las consultas revisadas.
- Las correcciones fueron realizadas previamente como parte de TASK-API-0100.

### Pending Work
Ninguna. La revisión y corrección de BanCount e IsBanned está completa.

### Unblocked by
TASK-API-0090, TASK-API-0091 (trabajo previo ya incorporado)

### Unblocks
Ninguna. Esta es la última task de la secuencia de backend.

### Assigned to
Backend Agent