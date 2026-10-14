# TASK-API-0216 — Implementar servicio de administración de Tipos de Lista

## Objetivo

Implementar el servicio de aplicación para administrar `ListType` según las reglas de US-0022 y las convenciones existentes.

## Leer antes de comenzar

* `project/services.md`

Revisar especialmente la implementación de `RoleService` y `TagService`.

## Implementar

Crear o adaptar el servicio de `ListType` con las siguientes operaciones:

* `GetPagedAsync`

  * Búsqueda por nombre.
  * Filtro por `IsActive`.
  * Ordenamiento por nombre.
  * Paginación.
* `GetByIdAsync`.
* `CreateAsync`.
* `UpdateAsync`.
* `DeactivateAsync`.
* `ActivateAsync`.

## Reglas

* `Name` es obligatorio.
* `Name` debe ser único.
* `Id` no puede modificarse.
* La eliminación es lógica mediante `IsActive`.
* No realizar eliminación física.
* Desactivar un `ListType` no debe eliminar ni modificar las listas que lo utilizan.
* Un `ListType` inactivo no puede seleccionarse al crear una nueva `WorkList`.
* La distinción entre listas `System` y `User` pertenece a `WorkList`, no a `ListType`.
* Las operaciones de desactivación y activación deben ser idempotentes siguiendo las convenciones existentes.
* Utilizar `IUnitOfWork` para confirmar las operaciones.

## Errores

Utilizar las excepciones y mecanismos de error existentes.

* `404` para recursos inexistentes.
* `400` para datos inválidos.
* `409` para nombres duplicados.

No crear un mecanismo paralelo de manejo de errores.

## Documentación

Actualizar `project/services.md` con:

* Servicio de `ListType`.
* Operaciones disponibles.
* Reglas de negocio aplicadas.

Mantener consistencia con `project/domain.md` y `project/repositories.md`.

## Restricciones

* No implementar endpoints.
* No agregar lógica de persistencia al servicio.
* No duplicar lógica existente.
* Respetar `backend-coding-rules.md`.
* Mantener métodos simples, de responsabilidad única y al mismo nivel de abstracción.

## Validación

* Compilación sin errores ni warnings nuevos.
* Ejecutar los tests existentes sin regresiones.

## Resultado de ejecución

### Qué se implementó

- **`Application/Interfaces/IListTypeService.cs`** — Nueva interfaz con 6 operaciones: `GetPagedAsync`, `GetByIdAsync`, `CreateAsync`, `UpdateAsync`, `DeactivateAsync`, `ActivateAsync`.
- **`Application/Services/ListTypeService.cs`** — Implementación completa siguiendo el patrón de `TagService`/`RoleService`: validación de nombre obligatorio, validación de unicidad, creación con `IsActive=true`, edición de nombre, desactivación/activación idempotente, uso de `IUnitOfWork` para persistencia.
- **`Application/DTOs/ListTypeDtos.cs`** — Nuevos DTOs: `ListTypeListItemDto` (Id, Name, IsActive), `CreateListTypeRequest` (Name), `UpdateListTypeRequest` (Name).
- **`Application/DTOs/GetListTypesRequest.cs`** — Nuevo request de paginación extendido con filtro `isActive`.

### Validación

- Compilación: 0 errores, 0 advertencias
- Tests ListType: 15/15 pasando
- Sin regresiones en tests existentes

### Notas

- Sin lógica de persistencia en el servicio (delega en repositorio).
- Sigue exactamente el patrón de `TagService`.
- No se implementaron endpoints en esta tarea.
