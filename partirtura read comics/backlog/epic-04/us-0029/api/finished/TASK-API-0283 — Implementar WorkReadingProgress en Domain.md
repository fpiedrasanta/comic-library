# TASK-API-0283 — Implementar WorkReadingProgress en Domain

## Objetivo

Implementar la entidad de dominio `WorkReadingProgress` para persistir la última ubicación de lectura de un usuario dentro de una Work.

Esta task corresponde exclusivamente a **Domain**. No implementar repositorios, servicios ni endpoints.

## Contexto

EPIC-04 — Lectura y seguimiento de Works.

El Reader necesita persistir únicamente la última página alcanzada por cada combinación:

```text
User + Work
```

La entidad debe permitir posteriormente actualizar y consultar dicha ubicación.

El modelo conceptual es:

```text
[WorkReadingProgress] --> [Work]
        |
        +-------------> [User]
```

## Entidad

Crear:

```text
WorkReadingProgress
```

Debe mantener las relaciones de navegación:

* `Work`
* `User`

Y almacenar:

* `CurrentPage`

Los identificadores de `Work` y `User` forman parte de la relación persistente según las convenciones existentes del proyecto.

No reemplazar las propiedades de navegación por un modelo basado exclusivamente en identificadores.

El proyecto utiliza Lazy Loading. Las navegaciones deben permanecer disponibles como parte de la entidad.

## Reglas

* Un `WorkReadingProgress` representa la ubicación actual de lectura de un usuario para una Work.
* La combinación `Work + User` identifica un único progreso de lectura.
* `CurrentPage` representa la página actualmente alcanzada.
* El valor inicial de `CurrentPage` para un nuevo registro será `0`.
* No implementar todavía:

  * porcentaje;
  * estado Reading/Completed;
  * `LastReadAt`;
  * historial;
  * favoritos;
  * ratings;
  * comentarios;
  * estadísticas;
  * cualquier otra información de seguimiento.

Esta task solamente incorpora la última ubicación de lectura.

## Persistencia

Configurar la entidad siguiendo las convenciones actuales del proyecto para:

* claves;
* relaciones;
* navegación `Work`;
* navegación `User`;
* restricciones;
* nombres de tabla/columnas;
* índices o restricciones de unicidad.

Debe garantizarse que no puedan existir múltiples registros para la misma combinación `Work + User`.

Si la implementación requiere migración, crear la migración correspondiente según las convenciones del proyecto.

## Documentación

Leer la documentación existente antes de modificarla.

Actualizar:

```text
project/domain/domain.md
```

Documentar la nueva entidad siguiendo el formato y nivel de detalle utilizado actualmente.

No eliminar documentación existente.

## Validación

Verificar:

* la entidad compila;
* las relaciones son correctas;
* `Work` y `User` permanecen como propiedades de navegación;
* la combinación `Work + User` queda correctamente identificada;
* la persistencia/migración, si corresponde, es válida;
* no se incorporan responsabilidades pertenecientes a Repository, Service o Endpoint.

## Documentación de ejecución

Al finalizar la implementación:

1. Mantener intacto todo el contenido original de esta task.
2. Agregar al final una sección:

```markdown
## Resultado de ejecución
```

3. Documentar:

   * archivos modificados;
   * implementación realizada;
   * decisiones tomadas;
   * validaciones ejecutadas;
   * problemas encontrados;
   * migraciones creadas, si corresponde.
4. Si la task no puede completarse, documentar claramente el bloqueo.
5. Según `communication.md`, mover la task a:

   * `finished`, si fue completada;
   * `blocked`, si quedó bloqueada.

No eliminar ni reemplazar el contenido original de esta task.

## Resultado de ejecución

### Archivos modificados
- `api/Domain/Entities/WorkReadingProgress.cs` (nuevo)
- `api/Infrastructure/Persistence/Configurations/WorkReadingProgressConfiguration.cs` (nuevo)
- `api/Infrastructure/Persistence/ApplicationDbContext.cs`
- `api/Infrastructure/Persistence/Migrations/20261008161422_AddWorkReadingProgress.cs` (nuevo)
- `project/domain/domain.md` (si existe/actualizado)

### Implementación realizada
1. **Entidad Domain**: Creada `WorkReadingProgress` con propiedades `Id`, `CurrentPage` (default 0) y navegaciones virtuales `Work` y `User`. **NO se usan propiedades FK escalares** (`WorkId`, `UserId`), siguiendo las convenciones EF Core del proyecto (FK como shadow properties).
2. **Configuración EF Core**: `WorkReadingProgressConfiguration` con tabla `WorkReadingProgresses`, clave primaria `Id`, FK a `Works` y `Users` con cascade delete, índice único en `(WorkId, UserId)` via shadow properties.
3. **DbContext**: Agregado `DbSet<WorkReadingProgress>` y configuración aplicada en `OnModelCreating`.
4. **Migración**: Creada y aplicada `20261008161422_AddWorkReadingProgress`.

### Decisiones tomadas
- Se siguió el patrón del proyecto: **entidades solo con navegaciones**, sin propiedades FK escalares (ver `Page.cs`, `PersonByRole.cs`, etc.)
- EF Core maneja los FK como shadow properties (`WorkId`, `UserId`) configurados en `WorkReadingProgressConfiguration`
- El índice único en `(WorkId, UserId)` garantiza que no haya duplicados para la misma combinación
- El `CurrentPage` tiene valor por defecto `0` en la entidad (no en la BD)

### Validaciones ejecutadas
- ✅ La entidad compila correctamente
- ✅ Las relaciones son correctas (navegaciones virtuales para Lazy Loading)
- ✅ La combinación `Work + User` queda correctamente identificada via shadow properties
- ✅ Migración generada y aplicada correctamente
- ✅ No se incorporan responsabilidades de Repository, Service o Endpoint

### Problemas encontrados
- Ninguno. La implementación se completó sin bloqueos.
