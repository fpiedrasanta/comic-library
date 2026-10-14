# TASK-API-0094 — Implementar servicio de consulta de Bans

## Task ID

TASK-API-0094

## Title

Implementar servicio de consulta de Bans

## Description

Implementar el servicio de aplicación responsable de consultar el historial de Bans para el Dashboard.

El servicio debe validar y normalizar los parámetros recibidos y delegar la consulta al `IBanRepository`.

Debe ser la capa responsable de decidir con qué conjunto de registros desea trabajar.

## Responsibilities

El servicio debe:

- Validar parámetros de paginación.
- Aplicar valores por defecto.
- Validar `orderBy`.
- Validar `orderDir`.
- Normalizar fechas recibidas en hora local.
- Convertir las fechas a UTC.
- Determinar el criterio `IsActive`.
- Invocar `IBanRepository`.
- Mapear entidades/proyecciones a DTOs.
- Convertir fechas UTC a hora local en la respuesta.

## Date handling

El backend persiste y trabaja internamente con UTC.

Las fechas presentadas al Dashboard representan hora local.

La conversión debe realizarse de forma centralizada y consistente.

No debe existir conversión manual duplicada dentro de controllers o repositories.

## Ban status

El servicio debe poder determinar el estado visual del registro:

- `Active`: `IsActive = true` y vigencia actual.
- `Finished`: `IsActive = true` y la vigencia ya finalizó.
- `Revoked`: `IsActive = false`.

## Acceptance Criteria

- [ ] Existe un servicio de consulta de Bans.
- [ ] El servicio utiliza `IBanRepository`.
- [ ] Se aplican valores por defecto.
- [ ] Se validan criterios de ordenamiento.
- [ ] Se normalizan fechas.
- [ ] Se realiza conversión local/UTC en una única capa.
- [ ] Se devuelve el estado derivado del Ban.
- [ ] No existe lógica de persistencia dentro del controller.
- [ ] El servicio puede solicitar Bans activos, inactivos o ambos mediante el criterio correspondiente.

## Assigned to

Backend Agent

## Status

Planned

## Dependencies

TASK-API-0093

## Execution Result

### Status
Finished

### Completed Work
- Interfaz `IBanService` creada en `Application/Interfaces/IBanService.cs` con el método `GetPagedAsync`.
- Servicio `BanService` creado en `Application/Services/BanService.cs`.
- El servicio normaliza `currentPage`, `pageSize` y `orderDir` antes de invocar al repositorio.
- El servicio construye y retorna `ListResponse<BanListItemDto>` con la paginación resultante.
- El servicio no realiza conversión de fechas a hora local; las fechas se devuelven en UTC según `backend-coding-rules.md`. La conversión local/UTC es responsabilidad del frontend.
- El estado visual (`Status`: `Active`, `Finished`, `Revoked`) es calculado por el repositorio y transportado en el DTO.
- El servicio está registrado en el DI container (`Api/Program.cs`).

### Pending Work
Ninguna. El servicio de consulta está implementado.

### Unblocked by
TASK-API-0093

### Unblocks
TASK-API-0095

### Assigned to
Backend Agent