# TASK-API-0089 — Implementar consulta de detalle de usuario

## Objetivo

Exponer la información necesaria para mostrar el "carnet" de un usuario desde el Dashboard.

La consulta es exclusivamente de lectura.

## Endpoint

`GET /api/users/{userId}`

## Información

Debe devolver como mínimo:

- `id`
- `firstName`
- `lastName`
- `email`
- `avatar`
- `nationality`

## Seguridad

- El endpoint requiere autenticación.
- Solo usuarios con permisos de administrador pueden acceder.
- El administrador únicamente puede consultar la información.
- No debe existir ninguna operación de modificación asociada a esta consulta.

## Criterios de aceptación

- [ ] Existe un endpoint para consultar el detalle de un usuario.
- [ ] Requiere autenticación.
- [ ] Requiere permisos de administrador.
- [ ] Devuelve la foto/avatar del usuario.
- [ ] Devuelve nombre.
- [ ] Devuelve apellido.
- [ ] Devuelve email.
- [ ] Devuelve nacionalidad.
- [ ] No permite modificar ninguno de estos datos.
- [ ] El endpoint queda documentado en `project/endpoints.md`.

## Execution Result

### Status
Finished

### Completed Work
- DTO `UserDetailDto` creado en `Application/DTOs/UserDetailDto.cs`.
- Endpoint `GET /api/users/{userId}` implementado en `UsersController`.
- Requiere autenticación y rol `Administrator`.
- Retorna `ApiResponse<UserDetailDto>` con id, nombre, apellido, email, avatar y nacionalidad.
- Usa `UserRepository.GetByIdAsync` para obtener el usuario con sus relaciones.
- Documentado en `project/endpoints.md`.

### Pending Work
Ninguna.

### Unblocked by
TASK-API-0090 - Definir entidad Ban y repositorio base

### Assigned to
Backend Agent