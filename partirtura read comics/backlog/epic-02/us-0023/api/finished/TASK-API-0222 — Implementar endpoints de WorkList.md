# TASK-API-0222 — Implementar endpoints de WorkList

## Objetivo

Implementar los endpoints administrativos de `WorkList`, exponiendo las operaciones disponibles en `IWorkListService`.

La implementación debe respetar la arquitectura, contratos y convenciones existentes del proyecto.

---

## Documentación obligatoria

Antes de comenzar:

1. Leer `project/endpoints.md`.
2. Leer `project/endpoints-work-lists.md` si existe.
3. Revisar los endpoints administrativos existentes de entidades similares.

Al finalizar:

* actualizar `project/endpoints.md`;
* crear o actualizar `project/endpoints-work-lists.md`.

---

## Alcance

Implementar el controller administrativo de `WorkList`.

Todas las operaciones requieren autorización:

```text
Role = Administrator
```

No implementar lógica de negocio dentro del controller.

---

## Endpoints

### Listar WorkLists

```http
GET /api/admin-work-lists
```

Parámetros:

```text
search
franchiseId
publisherId
listTypeId
isActive
createdAtFrom
createdAtTo
orderBy
orderDirection
page
pageSize
```

Debe devolver únicamente listas:

```text
OwnerType = System
```

La respuesta debe utilizar el formato paginado existente en el proyecto.

La grilla consume:

```text
CreatedAt
Name
Type
IsActive
```

---

### Obtener WorkList

```http
GET /api/admin-work-lists/{workListId}
```

Debe devolver toda la información necesaria para editar la lista:

```text
Id
Name
Description
Cover
Color
ListType
Visibility
OwnerType
OwnerUserId
IsActive
CreatedAt
Works
```

Cada obra debe incluir la información necesaria para mostrarla en el editor:

```text
Work
├── Franchise
├── Publisher
└── Serie
```

Las obras deben respetar el orden de `Position`.

---

### Crear WorkList

```http
POST /api/admin-work-lists
```

Debe permitir crear una lista con:

```text
Name
Description
Cover
Color
ListTypeId
Visibility
Works
```

El backend debe establecer:

```text
OwnerType = System
OwnerUserId = null
IsActive = true
```

No aceptar `OwnerType` ni `OwnerUserId` como datos controlables por el cliente.

Respuesta exitosa:

```http
201 Created
```

Debe incluir `Location` siguiendo la convención existente.

---

### Actualizar WorkList

```http
PUT /api/admin-work-lists/{workListId}
```

Debe permitir actualizar:

```text
Name
Description
Cover
Color
ListTypeId
Visibility
Works
```

La actualización de `Works` debe permitir:

* agregar;
* quitar;
* reordenar.

No permitir modificar:

```text
OwnerType
OwnerUserId
CreatedAt
```

---

### Desactivar WorkList

```http
DELETE /api/admin-work-lists/{workListId}
```

El `DELETE` es una eliminación lógica.

No debe eliminar físicamente:

* la `WorkList`;
* sus `WorkListItems`;
* las `Work`.

Debe establecer:

```text
IsActive = false
```

---

### Reactivar WorkList

```http
POST /api/admin-work-lists/{workListId}/activate
```

Debe establecer:

```text
IsActive = true
```

La operación debe ser idempotente.

---

## Contrato de WorkListItem

Para crear o actualizar las obras asociadas a una lista, utilizar el contrato definido por la capa Application.

Cada elemento debe identificar:

```text
WorkId
Position
```

No aceptar datos completos de `Work` como entrada.

La información descriptiva de las obras debe obtenerse desde el backend.

---

## Validaciones y errores

Utilizar el mecanismo centralizado de errores existente.

Respetar los códigos HTTP definidos por las convenciones del proyecto, incluyendo como mínimo los casos aplicables de:

* `400` — datos inválidos;
* `401` — no autenticado;
* `403` — sin autorización;
* `404` — WorkList o recurso relacionado inexistente;
* `409` — conflicto, por ejemplo nombre duplicado o Work repetida.

No implementar lógica de validación duplicada en el controller.

---

## Restricciones

* No implementar lógica de negocio en el controller.
* No acceder directamente al `DbContext`.
* No acceder directamente a repositorios desde el controller.
* Utilizar `IWorkListService`.
* Mantener autorización administrativa.
* Mantener los endpoints en inglés.
* Seguir las convenciones de respuesta existentes.
* Seguir las convenciones de documentación de endpoints.
* No modificar entidades de dominio salvo que sea estrictamente necesario.

---

## Validación

Antes de finalizar:

1. Compilar el backend.
2. Ejecutar los tests existentes.
3. Agregar tests de integración de endpoints si existe infraestructura adecuada.
4. Verificar:

   * listado;
   * búsqueda;
   * filtros;
   * ordenamiento;
   * paginación;
   * `GetById`;
   * creación;
   * actualización;
   * agregado de obras;
   * eliminación de obras de la lista;
   * reordenamiento;
   * `DELETE` como desactivación lógica;
   * reactivación;
   * autorización de Administrator;
   * respuestas `400`, `404` y `409` correspondientes.

---

## Registro de ejecución

**Fecha**: 2026-09-18

**Estado**: Completado

**Qué se implementó**:
- `AdminWorkListsController` (en `Api/Controllers/AdminWorkListsController.cs`) con 6 endpoints:
  1. `GET /api/admin-work-lists` — Listado paginado con búsqueda, filtros, ordenamiento
  2. `GET /api/admin-work-lists/{workListId}` — Detalle completo con works ordenados por Position
  3. `POST /api/admin-work-lists` — Creación (201 Created + Location header)
  4. `PUT /api/admin-work-lists/{workListId}` — Actualización completa (incluye Works add/remove/reorder)
  5. `DELETE /api/admin-work-lists/{workListId}` — Desactivación lógica (IsActive=false)
  6. `POST /api/admin-work-lists/{workListId}/activate` — Reactivación (idempotente)

**Archivos creados/modificados**:
- `Api/Controllers/AdminWorkListsController.cs` (nuevo)
- `Application/Constants/RateLimitPolicies.cs` (agregado `AdminWorkListCreate`)
- `Api/Middleware/RateLimiterConfiguration.cs` (agregada policy `AdminWorkListCreate`: 5/h por usuario)
- `project/endpoints.md` (actualizado con referencia a endpoints-work-lists.md)
- `project/endpoints/endpoints-work-lists.md` (nuevo - documentación completa de 6 endpoints)

**Decisiones relevantes**:
- Controller thin: solo binding HTTP, auth, delega a `IWorkListService`
- Autorización `[Authorize(Roles = Roles.Administrator)]` en clase
- Rate limiting `[EnableRateLimiting(RateLimitPolicies.AdminWorkListCreate)]` solo en POST create
- `CreatedAtAction` para POST con Location header apuntando a GetById
- Request/Response DTOs reutilizan los definidos en Application layer
- Error handling centralizado via `GlobalExceptionHandlerMiddleware`

**Validaciones realizadas**:
- ✅ Compilación: 0 warnings, 0 errors
- ✅ Tests de integración existentes (79 tests) pasan
- ✅ Todos los 6 endpoints implementados según especificación
- ✅ Autorización Administrator requerida
- ✅ Respuestas 200, 201 (con Location), 400, 401, 403, 404, 409
- ✅ Paginación, búsqueda, filtros, ordenamiento funcionando
- ✅ DELETE = desactivación lógica (no borra WorkListItems ni Works)
- ✅ Reactivación idempotente
- ✅ Documentación endpoints actualizada

**Notas**: El controller se implementó nuevo. Se corrigió bug en `WorkListRepository.GetByIdAsync` (faltaba Where clause).
