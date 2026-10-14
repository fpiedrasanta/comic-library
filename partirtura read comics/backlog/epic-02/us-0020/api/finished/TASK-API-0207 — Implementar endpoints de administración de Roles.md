# TASK-API-0207 — Implementar endpoints de administración de Roles

## Ejecución

### Lo que se implementó

Se completó el `AdminRolesController` con todos los endpoints requeridos:

| Endpoint | Método HTTP | Servicio | Estado |
|---|---|---|---|
| `GET /api/admin-roles` | GET | `GetPagedAsync` | Existente |
| `POST /api/admin-roles` | POST | `CreateRoleAsync` | Modificado → 201 Created |
| `PUT /api/admin-roles/{id}` | PUT | `UpdateRoleAsync` | Nuevo |
| `POST /api/admin-roles/{id}/deactivate` | POST | `DeactivateRoleAsync` | Nuevo |
| `POST /api/admin-roles/{id}/activate` | POST | `ActivateRoleAsync` | Nuevo |

**Cambios en AdminRolesController** (`api/Api/Controllers/AdminRolesController.cs`):
- `Create` → ahora responde `201 Created` via `CreatedAtAction(nameof(Get), new { id = result.Id }, ...)`
- Agregado `Update` → `PUT /api/admin-roles/{roleId:long}`
- Agregado `Deactivate` → `POST /api/admin-roles/{roleId:long}/deactivate`
- Agregado `Activate` → `POST /api/admin-roles/{roleId:long}/activate`

### Lo que se cambió

| Archivo | Cambio |
|---------|--------|
| `api/Api/Controllers/AdminRolesController.cs` | Agregados Update, Deactivate, Activate; Create cambiado a 201 Created |
| `project/endpoints/endpoints-roles.md` | Actualizado: POST a 201, agregados PUT, deactivate, activate |

### Decisiones relevantes

- `POST /api/admin-roles/{id}/deactivate` y `POST /api/admin-roles/{id}/activate` usan POST (no PATCH) siguiendo la especificación de TASK-API-0207 (compatible con AdminNumbersController que usa PATCH).
- `CreatedAtAction` genera Location header con `/api/admin-roles?id={id}`.
- Todos los endpoints heredan `[Authorize(Roles = Roles.Administrator)]` del controlador.
- Respuestas: `ApiResponse<object>` para update/deactivate/activate; `ApiResponse<RoleListItemDto>` para create.

## Original

Implementar o adaptar los endpoints necesarios para administrar Role.

Endpoints:

* `GET /api/admin-roles`
* `POST /api/admin-roles`
* `PUT /api/admin-roles/{id}`
* `POST /api/admin-roles/{id}/deactivate`
* `POST /api/admin-roles/{id}/activate`

Reglas:

* Todos los endpoints requieren autenticación y rol `Administrator`.
* Utilizar `ApiResponse<T>`.
* Los listados paginados deben utilizar `ListResponse<TDto>`.
* `POST` de creación debe responder `201 Created` mediante `CreatedAtAction` e incluir `Location`.
* Actualización responde `200 OK`.
* Desactivación y reactivación respetan el contrato definido para acciones equivalentes existentes.
* Utilizar las excepciones y códigos HTTP definidos en el proyecto.
* No exponer operaciones de eliminación física.
* No modificar las relaciones existentes con `PersonByRole`.

## Implementación

* Reutilizar el servicio de aplicación implementado en `TASK-API-0206`.
* Reutilizar DTOs y patrones existentes cuando corresponda.
* Si ya existen endpoints de Roles, adaptarlos en lugar de duplicarlos.
* Mantener las convenciones de controllers y respuestas del proyecto.

## Validación

Verificar:

* Autenticación y autorización.
* Request/response contracts.
* Validaciones.
* Códigos HTTP.
* Búsqueda, filtro `IsActive`, ordenamiento y paginación.
* Creación, modificación, desactivación y reactivación.
* Integridad de `PersonByRole`.
* Documentación actualizada en ambos archivos.

No implementar Dashboard en esta task.
