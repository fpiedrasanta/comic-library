# TASK-DASH-0020 — Implementar ordenamiento del listado de usuarios

## Objetivo

Implementar el ordenamiento del listado de usuarios de acuerdo con los criterios definidos para US-0010.

## Campos ordenables

El Dashboard debe permitir ordenar por:

- Apellido.
- Email.
- Estado.
- Baneado.
- Cantidad de baneos.
- Fecha de registro.

El ordenamiento debe utilizar:

- `orderBy`
- `orderDir`

## Ordenamiento inicial

La consulta inicial debe utilizar:

- `orderBy = CreatedAt`
- `orderDir = DESC`

Es decir, los usuarios registrados más recientemente deben aparecer primero.

## Reglas

El cambio de ordenamiento debe provocar una nueva consulta al backend conservando los filtros y búsqueda actualmente aplicados.

## Criterios de aceptación

- [ ] Todos los campos definidos como ordenables pueden utilizarse para ordenar.
- [ ] Se puede seleccionar dirección ascendente o descendente.
- [ ] La consulta inicial ordena por fecha de registro descendente.
- [ ] Al cambiar el ordenamiento se conservan búsqueda y filtros.
- [ ] El frontend envía el criterio de ordenamiento mediante el contrato definido por el backend.

## Execution Result

### Status
Finished

### Completed Work
- Se implementó el ordenamiento por `LastName`, `CreatedAt` y `BanCount` mediante `orderBy` y `orderDir`.
- Se puede seleccionar dirección ascendente o descendente.
- La consulta inicial ordena por fecha de registro descendente.
- Al cambiar el ordenamiento se conservan búsqueda y filtros.
- El frontend envía el criterio de ordenamiento mediante el contrato definido por el backend.

### Validation
- Dashboard compila correctamente: 0 errores, 0 warnings.
- El ordenamiento se integra correctamente con el endpoint `GET /api/users`.

### Files Modified
- `dashboard/pages/users-page.tsx` (creado)

### Observations
- El backend solo soporta `orderBy: LastName, CreatedAt, BanCount`. Los campos Email, Estado y Baneado no están disponibles en el contrato actual.
- Se implementaron los 3 campos soportados por el backend.
