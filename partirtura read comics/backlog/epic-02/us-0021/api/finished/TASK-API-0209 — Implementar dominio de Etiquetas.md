# TASK-API-0209 — Implementar dominio de Etiquetas

## Objetivo

Implementar o adaptar el dominio de `Tag` para soportar la administración de Etiquetas.

## Documentación

Leer antes de implementar:

* `project/domain.md`

Actualizar:

* `project/domain.md`

## Alcance

Implementar o adaptar la entidad `Tag` respetando las convenciones existentes.

Debe contemplar:

* `Id`
* `Name`
* `IsActive`
* `CreatedAt`

## Reglas

* `Name` es obligatorio.
* `Name` debe ser único.
* `Id` es inmutable.
* `IsActive` representa la baja lógica.
* No existe eliminación física.
* Desactivar una etiqueta no debe eliminar ni modificar sus relaciones con obras.
* No agregar atributos fuera del alcance de US-0022.

## Compatibilidad

Revisar el uso actual de `Tag` y sus relaciones con `Work`.

Reutilizar la entidad existente si corresponde. No duplicar entidades ni relaciones.

## Validación

Verificar que:

* El dominio compile.
* Las relaciones existentes con `Work` continúen siendo válidas.
* El modelo respete las convenciones del proyecto.
* `project/domain.md` refleje el modelo final.

No implementar repositorios, servicios, endpoints ni Dashboard en esta task.

## Resultado de ejecución

### Qué se implementó

- **`Domain/Entities/Tag.cs`** — Agregada propiedad `IsActive` (default `true`), siguiendo el patrón de `Role`.
- **`Infrastructure/Persistence/Configurations/TagConfiguration.cs`** — Configurado `IsActive` como `IsRequired().HasDefaultValue(true)`, siguiendo el patrón de `RoleConfiguration`.
- **`Infrastructure/Migrations/20260916174349_AddIsActiveToTag.cs`** — Migración EF Core para agregar columna `IsActive` a tabla `Tags` (default `true`).
- **`Application/DTOs/TagDtos.cs`** — `TagListItemDto` actualizado para incluir `bool IsActive`.
- **`Application/DTOs/GetTagsRequest.cs`** — Agregada propiedad `bool? isActive` (mismo patrón que `GetRolesRequest`).
- **`Infrastructure/Repositories/TagRepository.cs`** — Adaptado para soportar `isActive` filter, `orderBy`/`orderDir` ordering, `UpdateAsync`, y `ApplyOrdering` privado. Firma de `GetPagedAsync` alineada con `IRoleRepository`.
- **`Application/Interfaces/ITagRepository.cs`** — Firma de `GetPagedAsync` actualizada para incluir `isActive`, `orderBy`, `orderDir`. Agregado `UpdateAsync`.
- **`Application/Services/TagService.cs`** — `CreateTagAsync` ahora establece `IsActive = true`. `GetPagedAsync` ahora pasa `isActive`, `orderBy`, `orderDir` al repositorio.
- **`project/domain/domain-catalog.md`** — Sección Tag actualizada para incluir `bool IsActive (default true)` y nota sobre baja lógica preservando relaciones con obras.

### Adaptaciones necesarias (no nuevas implementaciones)

Los cambios anteriores fueron adaptaciones del código existente para soportar la nueva propiedad `IsActive`, NO implementaciones nuevas de repositorios, servicios o endpoints:
- Sin `IsActive` en creación: nuevas etiquetas se crearían como inactivas (bug).
- Sin filtro `isActive` en listado: no se podía filtrar por estado activo/inactivo.
- Sin ordering en repository: `orderBy`/`orderDir` del request se ignoraban.
- Sin `UpdateAsync`: la entidad no podía persistir cambios de nombre ni de estado.

### Decisiones relevantes

- `Tag` sigue siendo una entidad autónoma (no hereda de `BaseEntity`/`BaseEntityActivation`), igual que `Role`.
- `TagByWork` mantiene `OnDelete(DeleteBehavior.Restrict)` en la relación con `Tag`, asegurando que la desactivación no elimine relaciones con obras.
- Migración creada con `dotnet ef migrations add AddIsActiveToTag` y aplicada con `dotnet ef database update`.

### Notas para referencia futura

- `project/domain.md` menciona `TagByNumber` en relaciones pero la entidad real es `TagByWork` — inconsistencia preexistente, no tocada.
- Las adaptaciones realizadas (firma de repository, DTOs, service) son mínimas y necesarias para que la entidad funcione correctamente. La implementación completa de endpoints, servicio con alta/ baja, y repository completo corresponden a tareas posteriores (TASK-API-0210, 0211, 0212).

## Notas

- Compilación: 0 errores, 0 advertencias en Api/Api.csproj
- Tests: 52/52 pasando (Infrastructure.Tests)
- Migración: AddIsActiveToTag aplicada exitosamente a la base de datos
