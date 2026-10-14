# TASK-API-0085 — Definir consulta paginada de usuarios

## Objetivo

Definir los contratos de aplicación necesarios para consultar usuarios desde el Dashboard, soportando paginación, búsqueda, filtros y ordenamiento.

La operación es exclusivamente de consulta. No debe existir ninguna operación de modificación de usuarios asociada a este flujo.

## Alcance

La consulta debe soportar los siguientes parámetros opcionales:

- `currentPage`
- `pageSize`
- `orderBy`
- `orderDir`
- `search`
- `isActive`
- `isBanned`

### Búsqueda

El parámetro `search` debe buscar por:

- Apellido.
- Email.

No debe utilizarse para modificar ni identificar al usuario para una operación posterior.

### Filtros

`isActive`:

- `true`: usuarios activos.
- `false`: usuarios inactivos.
- `null`: todos.

`isBanned`:

- `true`: usuarios con un baneo vigente.
- `false`: usuarios sin un baneo vigente.
- `null`: todos.

### Ordenamiento

Debe permitirse ordenar únicamente por campos explícitamente definidos por la API.

Como mínimo:

- Apellido.
- Fecha de registro.
- Cantidad de baneos.

La combinación por defecto debe ser:

- `orderBy = CreatedAt`
- `orderDir = DESC`

## Response

Cada registro debe contener como mínimo:

- `id`
- `firstName`
- `lastName`
- `email`
- `avatar`
- `nationality`
- `isActive`
- `isBanned`
- `banCount`
- `createdAt`

La respuesta debe incluir además la información necesaria para la paginación:

- cantidad total de registros.
- página actual.
- tamaño de página.
- cantidad total de páginas.

## Criterios de aceptación

- [ ] Existe un request específico para la consulta paginada.
- [ ] Los parámetros de búsqueda, filtros y ordenamiento son opcionales.
- [ ] El ordenamiento solo acepta campos permitidos.
- [ ] El ordenamiento por defecto es `CreatedAt DESC`.
- [ ] `banCount` representa la cantidad histórica de baneos del usuario.
- [ ] `isBanned` representa únicamente si existe un baneo vigente.
- [ ] La consulta no permite modificar usuarios.
- [ ] El contrato contempla el avatar requerido por la grilla.
- [ ] El contrato contempla todos los datos necesarios para el listado.
- [ ] La respuesta permite construir el paginador del Dashboard.

## Execution Result

### Status
Finished

### Completed Work
- DTO `GetUsersRequest` creado en `Application/DTOs/GetUsersRequest.cs` con filtros `IsActive` e `IsBanned`.
- DTO `UserListItemDto` creado en `Application/DTOs/UserListItemDto` con todos los campos requeridos para la grilla.
- Los parámetros de paginación, búsqueda y ordenamiento son opcionales.
- El contrato contempla avatar, nacionalidad, estado de baneo y cantidad de baneos.

### Pending Work
Ninguna. La definición de contratos está completa.

### Unblocked by
TASK-API-0090 - Definir entidad Ban y repositorio base

### Assigned to
Backend Agent