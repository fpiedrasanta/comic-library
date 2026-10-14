# TASK-API-0205 — Implementar repositorio de Roles

## Ejecución

### Lo que se implementó

Se adaptó el repositorio `RoleRepository` para soportar todas las operaciones requeridas:

**`IRoleRepository`** (`Application/Interfaces/IRoleRepository.cs`):
- `GetPagedAsync` — ampliado con parámetros opcionales `orderBy`/`orderDir` para ordenamiento (Name, CreatedAt)
- `GetByIdAsync` — existente
- `GetByNameAsync` — existente
- `AddAsync` — existente
- `UpdateAsync` — nueva

**`RoleRepository`** (`Infrastructure/Repositories/RoleRepository.cs`):
- Implementación de `UpdateAsync` usando `DbSet.Update`
- `ApplyOrdering` privada para ordenamiento configurable en `GetPagedAsync`

**`RoleService`** (`Application/Services/RoleService.cs`):
- Ajuste en llamada a `GetPagedAsync` para pasar `cancellationToken` como parámetro nombrado (compatible con nuevos parámetros opcionales en la interfaz)

### Lo que se cambió

| Archivo | Cambio |
|---------|--------|
| `Application/Interfaces/IRoleRepository.cs` | Agregado `UpdateAsync`, ampliado `GetPagedAsync` con `orderBy`/`orderDir` opcionales |
| `Infrastructure/Repositories/RoleRepository.cs` | Implementado `UpdateAsync`, agregado `ApplyOrdering`, `GetPagedAsync` con soporte de ordenamiento |
| `Application/Services/RoleService.cs` | Ajuste en llamada a `GetPagedAsync` (named parameter para `cancellationToken`) |
| `project/repositories/repositories-catalog.md` | Actualizado: operaciones y notas de RoleRepository |

### Decisiones relevantes

- `orderBy`/`orderDir` se agregaron como parámetros opcionales en la interfaz para no romper la llamada existente del servicio.
- Se usa `SortDirection.ASC`/`SortDirection.DESC` (constantes existentes) en lugar de strings mágicos.
- `UpdateAsync` usa `DbSet.Update(entity)` siguiendo el patrón de `CountryRepository`.

## Original

Implementar o adaptar el repositorio de Role para soportar la administración de Roles.

Debe soportar las operaciones necesarias para:

* Listar Roles.
* Buscar por nombre.
* Filtrar por `IsActive`.
* Ordenar.
* Paginar.
* Obtener un Role por `Id`.
* Crear un Role.
* Actualizar un Role.
* Persistir cambios de estado (`IsActive`).

Reglas:

* Reutilizar infraestructura existente si ya existe un repositorio de Role.
* No crear `Repository<T>` genérico.
* Respetar el patrón Repository + UnitOfWork definido por el proyecto.
* No implementar reglas de negocio propias del servicio.
* No eliminar físicamente Roles.
* Las consultas deben respetar el estado lógico cuando corresponda.
* Mantener intactas las relaciones existentes con `PersonByRole`.

## Validación

Verificar que:

* El repositorio compile.
* Se integre correctamente con `UnitOfWork`.
* Las operaciones requeridas por la administración de Roles estén disponibles.
* Las relaciones existentes continúen funcionando.
* `project/repositories.md` refleje la implementación final.

No implementar servicios, endpoints ni Dashboard en esta task.
