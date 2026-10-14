# TASK-API-0088 — Implementar endpoint de consulta de usuarios

## Objetivo

Exponer mediante la API la consulta paginada de usuarios para el Dashboard.

## Endpoint

`GET /api/users`

## Parámetros

La API debe aceptar como mínimo:

- `currentPage`
- `pageSize`
- `orderBy`
- `orderDir`
- `search`
- `isActive`
- `isBanned`

Ejemplo conceptual:

`GET /api/users?currentPage=1&pageSize=12&orderBy=LastName&orderDir=ASC&search=Piedra&isBanned=true&isActive=true`

Todos los parámetros, excepto los valores por defecto de paginación, deben ser opcionales.

## Seguridad

- El endpoint requiere autenticación.
- Solo usuarios con permisos de administrador pueden acceder.
- La operación es exclusivamente de consulta.
- Ser administrador no otorga ningún permiso para modificar los usuarios consultados.

## Response

Debe utilizar el wrapper estándar `ApiResponse<T>` y devolver el resultado paginado definido en las tasks anteriores.

## Criterios de aceptación

- [ ] Existe el endpoint `GET /api/users`.
- [ ] Requiere autenticación.
- [ ] Requiere permisos de administrador.
- [ ] Soporta búsqueda por apellido/email.
- [ ] Soporta filtros `isActive` e `isBanned`.
- [ ] Soporta ordenamiento.
- [ ] Soporta paginación.
- [ ] Devuelve avatar.
- [ ] Devuelve estado activo/inactivo.
- [ ] Devuelve estado de baneo vigente.
- [ ] Devuelve cantidad histórica de baneos.
- [ ] Devuelve fecha de registro.
- [ ] Devuelve únicamente información de consulta.
- [ ] No existe ningún mecanismo de edición o eliminación asociado al endpoint.
- [ ] El contrato queda documentado en `project/endpoints.md`.

## Execution Result

### Status
Finished

### Completed Work
- Endpoint `GET /api/users` implementado en `UsersController`.
- Requiere autenticación y rol `Administrator`.
- Acepta parámetros de query `currentPage`, `pageSize`, `orderBy`, `orderDir`, `search`, `isActive`, `isBanned`.
- Delega en `UserQueryService.GetPagedAsync`.
- Retorna `ApiResponse<ListResponse<UserListItemDto>>`.
- Documentado en `project/endpoints.md`.

### Pending Work
Ninguna.

### Unblocked by
TASK-API-0090 - Definir entidad Ban y repositorio base

### Assigned to
Backend Agent