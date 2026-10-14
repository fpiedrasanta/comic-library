# TASK-API-0217 — Implementar endpoints de administración de Tipos de Lista

## Objetivo

Implementar los endpoints administrativos de `ListType` para completar el backend de US-0022.

## Leer antes de comenzar

* `project/endpoints.md`

Revisar especialmente los endpoints existentes de `Role` y `Tag`.

## Implementar

Crear o adaptar el controlador administrativo de `ListType`.

Endpoints:

* `GET /api/admin-list-types`

  * Listado paginado.
  * Búsqueda por `Name`.
  * Filtro por `IsActive`.
  * Ordenamiento.
* `GET /api/admin-list-types/{listTypeId}`

  * Obtener por Id.
* `POST /api/admin-list-types`

  * Crear.
  * Responder `201 Created`.
* `PUT /api/admin-list-types/{listTypeId}`

  * Modificar `Name`.
* `POST /api/admin-list-types/{listTypeId}/deactivate`

  * Desactivar.
* `POST /api/admin-list-types/{listTypeId}/activate`

  * Activar.

## Autorización

Todos los endpoints administrativos requieren usuario autenticado con rol `Administrator`.

Reutilizar el mecanismo de autorización existente.

No implementar lógica de autorización basada en emails ni crear un mecanismo RBAC paralelo.

## Contratos

* Respetar los DTOs y modelos de request/response existentes.
* Mantener las convenciones actuales de paginación.
* Mantener los códigos HTTP y formato de errores existentes.
* `POST` de creación debe devolver `201 Created` y `Location` mediante `CreatedAtAction` o la convención equivalente del proyecto.
* `PUT` no debe modificar el `Id`.

## Documentación

Actualizar:

* `project/endpoints.md`
* `project/endpoints-list-types.md`

Documentar:

* Rutas.
* Métodos HTTP.
* Autorización.
* Requests.
* Responses.
* Códigos HTTP.
* Parámetros de búsqueda, filtro, ordenamiento y paginación.

## Restricciones

* No incorporar lógica de negocio al controlador.
* Utilizar el servicio de `ListType`.
* No duplicar validaciones existentes en el servicio.
* Respetar `backend-coding-rules.md`.
* Mantener las convenciones de los controladores administrativos existentes.

## Validación

* Compilación sin errores ni warnings nuevos.
* Ejecutar los tests existentes sin regresiones.

## Resultado de ejecución

### Qué se implementó

- **`Api/Controllers/AdminListTypesController.cs`** — Nuevo controlador administrativo con 5 endpoints: `GetAll` (GET, paginado), `GetById` (GET by id), `Create` (POST, 201 Created), `Update` (PUT), `Deactivate` (POST deactivate), `Activate` (POST activate). Autorización `Administrator` en todos los endpoints.
- **`project/endpoints/endpoints-list-types.md`** — Documentación completa de endpoints: rutas, métodos HTTP, autorización, requests, responses, códigos HTTP, parámetros de búsqueda/filtro/ordenamiento/paginación.
- **`project/endpoints.md`** — Actualizado: entrada en índice de endpoints y matriz de rate limits.

### Validación

- Compilación: 0 errores, 0 advertencias
- Tests ListType: 15/15 pasando
- Sin regresiones en tests existentes

### Notas

- Sin lógica de negocio en el controlador (delega en servicio).
- Sigue exactamente el patrón de `AdminTagController`/`AdminRoleController`.
