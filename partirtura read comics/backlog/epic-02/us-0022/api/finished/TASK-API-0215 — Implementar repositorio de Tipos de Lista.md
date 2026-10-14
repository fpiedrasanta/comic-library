# TASK-API-0215 — Implementar repositorio de Tipos de Lista

## Objetivo

Implementar el repositorio de `ListType` siguiendo las convenciones existentes y el patrón utilizado por `Role` y `Tag`.

## Leer antes de comenzar y actualizar al finalizar

* `project/repositories.md`

## Implementar

* `IListTypeRepository`
* Implementación EF Core correspondiente.
* Listado paginado.
* Búsqueda por `Name`.
* Filtro por `IsActive`.
* Ordenamiento por `Name`.
* Obtención por `Id`.
* `AddAsync`.
* `UpdateAsync`.
* Integración con el `UnitOfWork` existente.

## Criterios

* Seguir el patrón de `IRoleRepository` / `RoleRepository` y `ITagRepository` / implementación EF existente.
* No crear `Repository<T>` genérico.
* No incorporar lógica de negocio al repositorio.
* Mantener los nombres descriptivos y las reglas de `backend-coding-rules.md`.
* No implementar endpoints ni lógica de servicio en esta tarea.

## Documentación

Actualizar `project/repositories.md` con:

* Repositorio de `ListType`.
* Operaciones disponibles.
* Integración con `UnitOfWork`.

Mantener consistencia con `project/domain.md`.

## Validación

* Compilación sin errores ni warnings nuevos.
* Tests existentes sin regresiones.
* Verificar que el repositorio pueda ser resuelto mediante el `UnitOfWork` existente.

## Resultado de ejecución

### Qué se implementó

- **`Application/Interfaces/IListTypeRepository.cs`** — Nueva interfaz con 5 operaciones: `GetPagedAsync`, `GetByIdAsync`, `GetByNameAsync`, `AddAsync`, `UpdateAsync`.
- **`Infrastructure/Repositories/ListTypeRepository.cs`** — Implementación EF Core siguiendo el patrón de `TagRepository`/`RoleRepository`: `AsNoTracking`, búsqueda por nombre (`EF.Functions.Like`), filtro por `isActive`, ordering por `orderBy`/`orderDir` (name, createdAt, isactive), paginación.
- **`Application/Interfaces/IUnitOfWork.cs`** — Añadido `IListTypeRepository ListTypeRepository { get; }`.
- **`Infrastructure/Repositories/UnitOfWork.cs`** — Añadido `IListTypeRepository` con lazy-init.

### Validación

- Compilación: 0 errores, 0 advertencias
- Tests: 65/65 pasando
- Repositorio resuelto correctamente mediante UnitOfWork

### Notas

- Sin lógica de negocio en el repositorio (solo acceso a datos).
- Sigue exactamente el patrón de `TagRepository`.
- No se implementaron endpoints ni servicios en esta tarea.
