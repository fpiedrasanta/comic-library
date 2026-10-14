# TASK-API-0136 — Implementar repositorio de Editorial

## Objetivo

Implementar el repositorio necesario para consultar y persistir editoriales.

## Alcance

Crear:

- `IEditorialRepository`
- `EditorialRepository`

El repositorio debe soportar las operaciones necesarias para las funcionalidades administrativas de Editorial.

Como mínimo debe contemplar:

- Consulta paginada.
- Consulta por Id.
- Consulta por nombre.
- Alta.
- Actualización.
- Activación.
- Desactivación.

## Consulta paginada

La consulta administrativa debe permitir:

- Búsqueda por nombre.
- Filtro por `IsActive`.
- Ordenamiento.
- Paginación.

La consulta debe devolver la información necesaria para construir el listado administrativo.

Cuando corresponda, utilizar `AsNoTracking()` en consultas de solo lectura.

## Unicidad

El repositorio debe permitir verificar la existencia de otra editorial con el mismo nombre excluyendo el Id actual durante una edición.

## Relaciones

Las consultas que necesiten información relacionada deben utilizar las relaciones existentes con:

- Country.
- Image.

No deben producirse consultas N+1.

## Persistencia

El repositorio no debe llamar a `SaveChangesAsync`.

La persistencia debe respetar el patrón `UnitOfWork` existente.

## Documentación

Al finalizar la task actualizar:

- `repositories.md`

## Pending Work

Ninguna.

## Unblocked by

TASK-API-0135

## Unblocks

TASK-API-0137

## Assigned to

Backend Agent

## Execution Result

### Status
Finished

### Completed Work
- Creada `IPublisherRepository` en `Application/Interfaces/IPublisherRepository.cs` con operaciones: `GetByIdAsync`, `GetActiveAsync`, `GetPagedAsync`, `GetByNameAsync`, `AddAsync`, `UpdateAsync`, `DeactivateAsync`.
- Creado `PublisherRepository` en `Infrastructure/Repositories/PublisherRepository.cs` implementando todas las operaciones de la interfaz.
- `GetPagedAsync` implementa búsqueda por nombre y website, filtro por `IsActive`, ordenamiento por campos permitidos, paginación y `AsNoTracking()`.
- `GetByIdAsync` incluye `Include` de `Country` e `Image` para evitar N+1.
- `ApplyOrdering` permite ordenar por `Name`, `CountryId`, `FoundedYear`, `IsFeatured`, `IsActive`, `CreatedAt` (mapeado a `Id`).
- Actualizado `project/repositories.md` con la documentación de `PublisherRepository`.
- Verificada la solución compila correctamente.

### Issues Found
Ninguno.

### Pending Work
Ninguna.

### Unblocked by
TASK-API-0135

### Unblocks
TASK-API-0137

### Assigned to
Backend Agent