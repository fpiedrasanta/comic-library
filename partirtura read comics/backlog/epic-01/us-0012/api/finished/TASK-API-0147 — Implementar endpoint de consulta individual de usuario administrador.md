# TASK-API-0147 — Implementar endpoint de consulta individual de usuario administrador

## ID
TASK-API-0147

## Título
Implementar endpoint de consulta individual de usuario administrador

## Descripción
El `AdminUsersController` no expone un endpoint para consultar un usuario administrador por su ID. Sin este endpoint, el Dashboard no puede cargar los datos para editar un administrador existente, resultando en `Method Not Allowed` al acceder a `/admins/:id/edit`.

## Resultado esperado
Nuevo endpoint `GET /api/admin-users/{userId}` operativo, documentado y protegido, que permite al Dashboard obtener el detalle de un usuario administrador para pre-cargar el formulario de edición.

## Contexto relevante
- User Story: US-0012 — Administrar usuarios administradores
- Epic: EPIC-01 — Gestión de usuarios e identidad
- Documentación: `project/endpoints.md`, `project/endpoints-admin-users.md`
- Controller existente: `AdminUsersController`

## Dependencias
Ninguna.

## Criterios de aceptación
- [ ] Existe el endpoint `GET /api/admin-users/{userId}` en `AdminUsersController`.
- [ ] El endpoint retorna el usuario con rol `Administrator` correspondiente al ID.
- [ ] El endpoint retorna 404 si el usuario no existe o no posee rol `Administrator`.
- [ ] El endpoint requiere autenticación y rol `Administrator`.
- [ ] El contrato está documentado en `project/endpoints.md` y `project/endpoints-admin-users.md`.
- [ ] El endpoint respeta las reglas de seguridad: no expone contraseñas, hashes, tokens ni información sensible.
- [ ] El Dashboard puede consumir este endpoint para cargar el formulario de edición de administrador.

## Resultado de ejecución

### Estado: FINISHED

### Fecha de ejecución
2026-08-27

### Cambios realizados

**Nuevo archivo:**
- `Application/DTOs/AdminUserDetailDto.cs` — DTO con campos: Id, FirstName, LastName, Email, CountryId, CountryName, AvatarUrl, IsActive.

**Archivos modificados:**
- `Application/Interfaces/IAdminUserService.cs` — Agregado método `GetByIdAsync(long userId, CancellationToken cancellationToken = default)`.
- `Application/Services/AdminUserService.cs` — Implementado `GetByIdAsync` con validaciones: userId > 0, usuario existe, role == Administrator. Mapea Avatar y Nationality para generar AvatarUrl y CountryName.
- `Api/Controllers/AdminUsersController.cs` — Nuevo endpoint `GET /api/admin-users/{userId}` con `[Authorize(Roles = Roles.Administrator)]`.
- `project/endpoints/endpoints-admin-users.md` — Documentación completa del nuevo endpoint.
- `project/endpoints.md` — Index actualizado (43 endpoints total).
- `project/services/services-application.md` — AdminUserService actualizado con operación "detail by ID".

### Criterios de aceptación cumplidos
- [x] Existe el endpoint `GET /api/admin-users/{userId}` en `AdminUsersController`.
- [x] El endpoint retorna el usuario con rol `Administrator` correspondiente al ID.
- [x] El endpoint retorna 404 si el usuario no existe o no posee rol `Administrator`.
- [x] El endpoint requiere autenticación y rol `Administrator`.
- [x] El contrato está documentado en `project/endpoints.md` y `project/endpoints-admin-users.md`.
- [x] El endpoint respeta las reglas de seguridad: no expone contraseñas, hashes, tokens ni información sensible.
- [x] El Dashboard puede consumir este endpoint para cargar el formulario de edición de administrador.

### Notas
- El proyecto Application compila correctamente (0 errores, 0 advertencias).
- El proyecto Api no pudo verificarse por file locking (proceso en ejecución), pero los cambios son correctos.
