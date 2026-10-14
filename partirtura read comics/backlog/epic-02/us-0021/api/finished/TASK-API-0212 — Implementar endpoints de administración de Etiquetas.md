# TASK-API-0212 — Implementar endpoints de administración de Etiquetas

## Objetivo

Implementar o adaptar los endpoints necesarios para administrar `Tag`.

## Documentación

Leer antes de implementar:

* `project/endpoints.md`

Actualizar:

* `project/endpoints.md`

## Endpoints

Implementar:

* `GET /api/admin-tags`
* `POST /api/admin-tags`
* `PUT /api/admin-tags/{id}`
* `POST /api/admin-tags/{id}/deactivate`
* `POST /api/admin-tags/{id}/activate`

## Reglas

* Requieren autenticación y rol `Administrator`.
* Utilizar `ApiResponse<T>`.
* Los listados paginados utilizan `ListResponse<TDto>`.
* La creación responde `201 Created` mediante `CreatedAtAction` e incluye `Location`.
* La actualización responde `200 OK`.
* Desactivación y reactivación siguen el patrón de las entidades administrativas existentes.
* Utilizar las excepciones y códigos HTTP definidos en el proyecto.
* No exponer eliminación física.
* No modificar relaciones existentes con `Work`.

## Implementación

* Reutilizar `TagService`.
* Reutilizar DTOs y patrones existentes cuando corresponda.
* Si ya existen endpoints de Tags, adaptarlos en lugar de duplicarlos.
* Mantener las convenciones de controllers y respuestas del proyecto.

## Validación

Verificar:

* Autenticación y autorización.
* Request/response contracts.
* Validaciones.
* Códigos HTTP.
* Búsqueda, filtro `IsActive`, ordenamiento y paginación.
* Creación, modificación, desactivación y reactivación.
* Integridad de las relaciones con `Work`.
* Documentación actualizada.

No implementar Dashboard.

## Resultado de ejecución

### Qué se implementó

- **`Api/Controllers/AdminTagsController.cs`** — Adaptado con 5 endpoints:
  - `GET /api/admin-tags` ✅ (ya existía)
  - `POST /api/admin-tags` ✅ (ya existía, corregido a 201 Created con `CreatedAtAction`)
  - `PUT /api/admin-tags/{tagId}` ✅ (nuevo)
  - `POST /api/admin-tags/{tagId}/deactivate` ✅ (nuevo)
  - `POST /api/admin-tags/{tagId}/activate` ✅ (nuevo)
- **`project/endpoints/endpoints-tags.md`** — Documentación actualizada con los 5 endpoints, contratos, errores y notas.

### Decisiones relevantes

- El POST de creación ahora retorna `201 Created` con `CreatedAtAction` y `Location` header, siguiendo la convención del proyecto y cerrando el punto pendiente de la auditoría 2026-09.
- Los endpoints de desactivación/reactivación siguen el patrón de `AdminRolesController` (POST con `{id}/deactivate` y `{id}/activate`).
- La actualización usa `PUT` con `UpdateTagRequest`, siguiendo el patrón de `AdminRolesController`.

### Notas

- Los endpoints usan `ITagService` (sin acceso directo al repositorio).
- Se reutilizan DTOs existentes: `TagListItemDto`, `CreateTagRequest`, `UpdateTagRequest`, `GetTagsRequest`.
- Todos los endpoints requieren autenticación y rol `Administrator`.

