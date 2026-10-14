# TASK-API-0109 — Implementar servicio de consulta de usuarios administradores

## Task ID

TASK-API-0109

## Title

Implementar servicio de consulta de usuarios administradores

## Description

Crear el servicio de aplicación responsable de consultar usuarios administradores y retornar el resultado paginado.

El servicio debe delegar la consulta al repositorio y normalizar los parámetros de entrada siguiendo las reglas existentes del backend.

## Requirements

- Crear o extender la interfaz correspondiente.
- Implementar el servicio.
- Normalizar página.
- Normalizar tamaño de página.
- Normalizar dirección de ordenamiento.
- Delegar la consulta al repositorio.
- Retornar `ListResponse` utilizando el contrato existente.
- No incluir lógica de persistencia.
- No incluir lógica específica de presentación.

## Acceptance Criteria

- [ ] Existe interfaz de servicio.
- [ ] Existe implementación.
- [ ] Los parámetros son normalizados.
- [ ] El servicio utiliza el repositorio.
- [ ] La respuesta utiliza el contrato paginado existente.
- [ ] El servicio está registrado en DI.

## Dependencies

TASK-API-0108

## Assigned to

Backend Agent

## Execution Result

### Status
Finished

### Completed Work
- Creada interfaz `IAdminUserService` en `Application/Interfaces/IAdminUserService.cs`.
- Creado servicio `AdminUserService` en `Application/Services/AdminUserService.cs`.
- El servicio normaliza parámetros de paginación (`currentPage >= 1`, `pageSize` entre 1 y 50, `orderDir` default `ASC`).
- Delega la consulta a `IUserRepository.GetAdminUsersPagedAsync`.
- Retorna `ListResponse<AdminUserListItemDto>` utilizando el contrato existente.
- No incluye lógica de persistencia ni de presentación.
- Registrado en DI en `Api/Program.cs`.

### Pending Work
Ninguna.

### Unblocked by
TASK-API-0108

### Unblocks
TASK-API-0110

### Assigned to
Backend Agent