# TASK-API-0087 — Implementar servicio de consulta de usuarios

## Objetivo

Implementar el servicio de aplicación encargado de consultar usuarios para el Dashboard.

## Trabajo a realizar

1. Crear la interfaz de servicio correspondiente.
2. Crear la implementación del servicio.
3. Recibir el request de consulta paginada.
4. Validar y normalizar los parámetros de paginación.
5. Validar los campos de ordenamiento permitidos.
6. Delegar la consulta al `UserRepository`.
7. Retornar el resultado paginado mediante el DTO correspondiente.

## Reglas

- El servicio es exclusivamente de consulta.
- No debe permitir editar usuarios.
- No debe permitir eliminar usuarios.
- No debe permitir modificar contraseñas.
- No debe permitir modificar email, nombre, apellido, nacionalidad o avatar.
- La identidad del usuario consultado no debe otorgar ningún permiso de modificación.

## Criterios de aceptación

- [ ] Existe un servicio específico para la consulta.
- [ ] El servicio utiliza DTOs.
- [ ] Los parámetros inválidos son rechazados correctamente.
- [ ] Los campos de ordenamiento están restringidos a los permitidos.
- [ ] El servicio no modifica datos.
- [ ] El resultado conserva la información de paginación.

## Execution Result

### Status
Finished

### Completed Work
- Interfaz `IUserQueryService` creada en `Application/Interfaces/IUserQueryService.cs`.
- Servicio `UserQueryService` implementado en `Application/Services/UserQueryService.cs`.
- Parámetros de paginación validados y normalizados.
- Campos de ordenamiento validados contra allowlist.
- Delegación a `UserRepository.GetPagedAsync`.
- Cálculo de `banCount` e `isBanned` mediante `IBanRepository`.
- Proyección a `UserListItemDto` mediante `UserMapper`.
- Retorno de `ListResponse<UserListItemDto>`.
- Servicio registrado en `Program.cs`.

### Pending Work
Ninguna.

### Unblocked by
TASK-API-0090 - Definir entidad Ban y repositorio base

### Assigned to
Backend Agent