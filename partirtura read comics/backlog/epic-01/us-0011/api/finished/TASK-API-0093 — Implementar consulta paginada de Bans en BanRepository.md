# TASK-API-0093 — Implementar consulta paginada de Bans en BanRepository

## Task ID

TASK-API-0093

## Title

Implementar consulta paginada de Bans en BanRepository

## Description

Implementar en `BanRepository` la consulta paginada definida por `TASK-API-0092`.

La consulta debe recuperar el historial de Bans y permitir aplicar búsqueda, filtros, ordenamiento y paginación.

El repository debe encargarse exclusivamente de construir y ejecutar la consulta de persistencia.

La decisión sobre trabajar con registros activos, inactivos o ambos debe provenir del servicio mediante el parámetro correspondiente.

## Search

Cuando `search` tenga valor, buscar mediante OR por:

- `User.FirstName`.
- `User.LastName`.
- `User.Email`.

## Filters

Implementar:

- Fecha desde.
- Fecha hasta.
- `IsActive`.

Las fechas deberán recibirse ya normalizadas a UTC por la capa de aplicación/servicio.

El filtro de fecha debe utilizar límites inclusivos de acuerdo con el contrato.

## Ordering

Implementar:

- `CreatedAt`.
- `FirstName`.
- `LastName`.
- `Email`.
- `StartDate`.
- `EndDate`.

Soportar `ASC` y `DESC`.

El orden por defecto será:

`CreatedAt DESC`.

## Pagination

Aplicar:

1. Filtros.
2. Ordenamiento.
3. Paginación.

La paginación deberá respetar:

- `currentPage`.
- `pageSize`.

No ejecutar consultas innecesarias ni producir consultas N+1.

## Active records

El repository no debe asumir que solamente los Bans activos son válidos.

Debe aceptar el criterio `isActive` definido por la capa de aplicación.

Los registros con `IsActive = false` deben permanecer disponibles para consultas históricas cuando el servicio así lo solicite.

## Acceptance Criteria

- [ ] `BanRepository` implementa la consulta paginada.
- [ ] Se soporta búsqueda por nombre, apellido y email mediante OR.
- [ ] Se soportan filtros de fechas.
- [ ] Se soporta filtro `IsActive`.
- [ ] Se soportan todos los criterios de ordenamiento.
- [ ] Se soportan ambas direcciones.
- [ ] Se aplica paginación después de filtros y ordenamiento.
- [ ] No existen consultas N+1.
- [ ] La consulta es de solo lectura.
- [ ] El repository no realiza eliminación física.
- [ ] El repository recibe el criterio `isActive` desde la capa superior.

## Assigned to

Backend Agent

## Status

Planned

## Dependencies

TASK-API-0092

## Execution Result

### Status
Finished

### Completed Work
- `IBanRepository` actualizado con el método `GetPagedAsync(GetBansRequest request, CancellationToken cancellationToken = default)`.
- `BanRepository.GetPagedAsync` implementado con:
  - Búsqueda por OR sobre `User.FirstName`, `User.LastName` y `User.Email`.
  - Filtros de fecha inclusivos (`StartDate` >=, `EndDate` <=).
  - Filtro `IsActive` aplicado solo cuando se especifica.
  - Ordenamiento por `CreatedAt`, `FirstName`, `LastName`, `Email`, `StartDate`, `EndDate`.
  - Paginación con `Skip`/`Take` sobre la query filtrada y ordenada.
  - Proyección directa a `BanListItemDto` para evitar cargar entidades innecesarias.
  - Cálculo de `Status` (`Active`, `Finished`, `Revoked`) en memoria después de la paginación.
  - Uso de `AsNoTracking` y carga explícita de `User` para evitar N+1.
- La compilación de Infrastructure compila sin errores ni warnings.

### Pending Work
Ninguna. La consulta paginada está implementada.

### Unblocked by
TASK-API-0092

### Unblocks
TASK-API-0094

### Assigned to
Backend Agent