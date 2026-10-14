# TASK-API-0206 — Implementar servicio de administración de Roles

## Ejecución

### Lo que se implementó

Se implementaron las operaciones faltantes del servicio de `Role` siguiendo el patrón de `CountryService`:

**IRoleService** (`Application/Interfaces/IRoleService.cs`):
- `GetPagedAsync` — existente
- `CreateRoleAsync` — existente
- `GetRoleByIdAsync` — nueva
- `UpdateRoleAsync` — nueva
- `DeactivateRoleAsync` — nueva
- `ActivateRoleAsync` — nueva

**RoleService** (`Application/Services/RoleService.cs`):
- `GetRoleByIdAsync` — obtiene Role por Id, lanza `BusinessNotFoundException` si no existe
- `UpdateRoleAsync` — modifica nombre con validación de unicidad (excluyendo el propio), lanza excepciones correspondientes
- `DeactivateRoleAsync` — baja lógica via `IsActive = false`, idempotente (no error si ya inactivo)
- `ActivateRoleAsync` — reactivación via `IsActive = true`, idempotente (no error si ya activo)

**UpdateRoleRequest** (`Application/DTOs/UpdateRoleRequest.cs`):
- DTO con propiedad `Name` para la actualización

### Lo que se cambió

| Archivo | Cambio |
|---------|--------|
| `Application/Interfaces/IRoleService.cs` | Agregados GetRoleByIdAsync, UpdateRoleAsync, DeactivateRoleAsync, ActivateRoleAsync |
| `Application/Services/RoleService.cs` | Implementados GetRoleByIdAsync, UpdateRoleAsync, DeactivateRoleAsync, ActivateRoleAsync |
| `Application/DTOs/UpdateRoleRequest.cs` | Nuevo DTO |
| `project/services/services-catalog.md` | Actualizado: operaciones y notas de RoleService |

### Decisiones relevantes

- Se sigue el patrón de CountryService para operaciones CRUD completas.
- Validaciones: `BusinessNotFoundException` (no existe), `BusinessConflictException` (duplicado), `ValidationException` (nombre vacío).
- Desactivación/activación son idempotentes (no lanzan error si ya están en el estado solicitado).
- Se reutiliza `Guard` y patrones existentes.
- No se modificaron relaciones con `PersonByRole`.

## Original

Implementar o adaptar el servicio de aplicación de Role para soportar su administración.

Debe soportar:

* Listar Roles.
* Buscar por nombre.
* Filtrar por `IsActive`.
* Ordenar.
* Paginar.
* Obtener un Role por `Id`.
* Crear un Role.
* Modificar el nombre.
* Desactivar un Role.
* Reactivar un Role.

Reglas:

* `Name` es obligatorio.
* No permitir nombres duplicados.
* `Id` no puede modificarse.
* Usar baja lógica mediante `IsActive`.
* No eliminar físicamente Roles.
* No modificar ni eliminar relaciones existentes con `PersonByRole`.
* Reutilizar servicios, validaciones o patrones existentes cuando corresponda.
* Mantener las reglas de negocio fuera del repositorio.

## Validación

Verificar que:

* El servicio compile.
* Utilice correctamente el repositorio y `UnitOfWork`.
* Las validaciones y reglas de negocio estén implementadas.
* Los errores utilicen las excepciones definidas por el proyecto.
* `project/services.md` refleje el servicio final.

No implementar endpoints ni Dashboard en esta task.
