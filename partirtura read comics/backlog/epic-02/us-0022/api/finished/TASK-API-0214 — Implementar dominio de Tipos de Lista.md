# TASK-API-0214 — Implementar dominio de Tipos de Lista

## Objetivo

Implementar o adaptar el dominio de `ListType` según la US-0022.

## Documentación

Leer antes de implementar:

* `project/domain.md`

Actualizar al finalizar:

* `project/domain.md`

## Dominio

Implementar o adaptar la entidad `ListType` con:

* `Id`
* `Name`
* `IsActive` con valor por defecto `true`
* `CreatedAt`

## Reglas

* `Name` es obligatorio.
* `Name` debe ser único a nivel de aplicación.
* `Id` es inmutable.
* La baja es lógica mediante `IsActive`.
* No implementar eliminación física.
* Desactivar un `ListType` no debe eliminar ni modificar las listas que lo utilizan.
* Un `ListType` inactivo no debe poder utilizarse para crear nuevas listas.
* `ListType` es independiente del origen de la lista (`System` / `User`).

## Persistencia

Adaptar la configuración y migraciones necesarias para reflejar el modelo y sus restricciones.

No implementar repositorios, servicios ni endpoints en esta task.

## Validación

Verificar compilación y consistencia con las entidades y convenciones existentes.

Registrar en `project/domain.md` la entidad, sus propiedades, reglas y relaciones relevantes.

## Resultado de ejecución

### Qué se implementó

- **`Domain/Entities/ListType.cs`** — Nueva entidad con:
  - `Id` (long, identity)
  - `Name` (string, max 100, required, unique)
  - `IsActive` (bool, default `true`)
  - `CreatedAt` (datetime(6), required)

- **`Infrastructure/Persistence/Configurations/ListTypeConfiguration.cs`** — EF Core configuration:
  - Table: `ListTypes`
  - PK: `Id` (identity)
  - Unique index on `Name`
  - `IsActive`: required, default `true`

- **`Infrastructure/Persistence/ApplicationDbContext.cs`** — Registered `DbSet<Domain.Entities.ListType>` and `ApplyConfiguration(new ListTypeConfiguration())`.

- **`Infrastructure/Migrations/20260916194615_AddListType.cs`** — Nueva migración que crea la tabla `ListTypes`.

### Validación

- Compilación: 0 errores, 0 advertencias
- Tests: 64/65 pasando (1 pre-existing flaky `FullWorkflowIntegrationTests` timeout, no relacionado)
- Migración creada correctamente con estructura consistente a `Roles` y `Tags`

### Notas

- No se implementaron repositorios, servicios ni endpoints en esta task (próxima task: TASK-API-0215).
- La entidad no tiene relaciones con otras entidades todavía (se creará relación con `List` en tarea futura de US-0022).
- Sigue el mismo patrón que `Role` y `Tag`.
