# TASK-API-0211 — Implementar servicio de administración de Etiquetas

## Objetivo

Implementar o adaptar el servicio de aplicación de `Tag` para soportar su administración.

## Documentación

Leer antes de implementar:

* `project/services.md`

Actualizar:

* `project/services.md`

## Alcance

Implementar o adaptar `ITagService` y `TagService`.

Debe soportar:

* Listar etiquetas.
* Buscar por nombre.
* Filtrar por `IsActive`.
* Ordenar.
* Paginar.
* Obtener por `Id`.
* Crear.
* Modificar nombre.
* Desactivar.
* Reactivar.

## Reglas

* `Name` es obligatorio.
* No permitir nombres duplicados.
* `Id` no puede modificarse.
* Usar baja lógica mediante `IsActive`.
* No eliminar físicamente.
* No modificar ni eliminar relaciones existentes con `Work`.
* Reutilizar validaciones y patrones existentes.
* Las reglas de negocio deben permanecer en el servicio.

## Validación

Verificar que:

* El servicio compile.
* Utilice correctamente Repository y UnitOfWork.
* Los errores utilicen las excepciones definidas por el proyecto.
* La creación y modificación rechacen nombres duplicados.
* Desactivación y reactivación funcionen correctamente.
* `project/services.md` refleje el servicio final.

No implementar endpoints ni Dashboard.

## Resultado de ejecución

### Qué se implementó

- **`Application/Services/TagService.cs`** — Adaptado con 6 operaciones:
  - `GetPagedAsync` ✅ (con `isActive`, `orderBy`, `orderDir`)
  - `CreateTagAsync` ✅ (con `IsActive = true`)
  - `GetTagByIdAsync` ✅ (lanza `BusinessNotFoundException`)
  - `UpdateTagAsync` ✅ (validación nombre obligatorio, rechazo duplicados, `BusinessNotFoundException`)
  - `DeactivateTagAsync` ✅ (baja lógica, idempotente, `BusinessNotFoundException`)
  - `ActivateTagAsync` ✅ (reactivación, idempotente, `BusinessNotFoundException`)

- **`Application/Interfaces/ITagService.cs`** — Interfaz ampliada con las 6 operaciones.
- **`Application/DTOs/UpdateTagRequest.cs`** — Nuevo DTO para actualización de nombre.
- **`project/services/services-catalog.md`** — Sección TagService añadida.

### Patrones seguidos

- Igual que `RoleService`: misma estructura de métodos, mismas excepciones (`BusinessNotFoundException`, `BusinessConflictException`, `ValidationException`), mismos mensajes de error.
- `Deactivate`/`Activate` idempotentes: retornan sin error si ya están en el estado solicitado.
- Todas las operaciones persistan cambios vía `IUnitOfWork.SaveChangesAsync`.

### Notas

- La creación usa `IsActive = true` por defecto (anteriormente se creaban como inactivas — bug corregido).
- El `GetPagedAsync` ahora filtra por `isActive`, ordena por `orderBy`/`orderDir` (anteriormente ignorados — bug corregido).
