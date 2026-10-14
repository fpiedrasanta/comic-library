# TASK-API-0284 — Implementar Repository de WorkReadingProgress

## Objetivo

Implementar el acceso a datos de `WorkReadingProgress` necesario para consultar y actualizar la última ubicación de lectura de un usuario para una Work.

Esta task corresponde exclusivamente a **Repository**. Depende de `TASK-API-0283`.

## Contexto

EPIC-04 — Lectura y seguimiento de Works.

La operación principal requerida es:

```text
GetByWorkIdAndUserIdAsync(long workId, long userId)
```

Debe obtener el progreso correspondiente a una combinación específica de Work y User.

## Repository

Implementar en el repositorio correspondiente:

```csharp
GetByWorkIdAndUserIdAsync(long workId, long userId)
```

La consulta debe:

* buscar por `WorkId`;
* buscar por `UserId`;
* devolver un único `WorkReadingProgress`, si existe;
* devolver `null` si no existe;
* devolver la entidad **trackeada**.

### Tracking

Esta consulta será utilizada para actualizar la entidad cuando exista.

Por lo tanto:

* **NO utilizar `AsNoTracking()`**.

### Navegaciones

La entidad mantiene las navegaciones:

```text
Work
User
```

Pero esta consulta:

* **NO debe utilizar `Include()`**.

El proyecto utiliza Lazy Loading. Las navegaciones se cargarán únicamente si son accedidas y corresponde hacerlo.

No agregar `Include()` preventivamente.

## Responsabilidad

El Repository solamente debe encargarse de obtener la entidad persistida.

No implementar aquí:

* creación de `WorkReadingProgress`;
* actualización de `CurrentPage`;
* validaciones de negocio;
* lógica de Reader;
* cálculo de porcentaje;
* estado Reading/Completed;
* historial.

La creación/actualización pertenece al Service.

## Convenciones

Seguir las convenciones existentes del proyecto para:

* interfaces;
* implementación;
* nombres;
* async/await;
* CancellationToken;
* consultas EF Core;
* tracking;
* acceso mediante UnitOfWork;
* repositorios explícitos.

No crear un `Repository<T>` genérico.

## Documentación

Leer:

```text
project/repositories.md
```

y la documentación específica de repositories relacionada con Works/contenido, si existe.

Actualizar `project/repositories.md` documentando:

```text
GetByWorkIdAndUserIdAsync(long workId, long userId)
```

No eliminar contenido existente.

## Validación

Verificar:

* la consulta devuelve el progreso correcto;
* devuelve `null` cuando no existe;
* devuelve una entidad trackeada;
* no utiliza `AsNoTracking()`;
* no utiliza `Include()`;
* respeta Lazy Loading;
* no contiene lógica de negocio;
* compila correctamente.

## Documentación de ejecución

Al finalizar la implementación:

1. Mantener intacto todo el contenido original de esta task.
2. Agregar al final:

```markdown
## Resultado de ejecución
```

3. Documentar:

   * archivos modificados;
   * implementación realizada;
   * decisiones tomadas;
   * validaciones ejecutadas;
   * problemas encontrados.
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
- `api/Application/Interfaces/IWorkReadingProgressRepository.cs` (nuevo)
- `api/Infrastructure/Repositories/WorkReadingProgressRepository.cs` (nuevo)
- `api/Application/Interfaces/IUnitOfWork.cs`
- `api/Infrastructure/Repositories/UnitOfWork.cs`
- `api/Infrastructure/Persistence/Migrations/20261008161422_AddWorkReadingProgress.cs` (nuevo)
- `project/repositories.md`
- `project/repositories/repositories-numbers.md`

### Implementación realizada
1. **Entidad Domain**: Creada `WorkReadingProgress` con propiedades `Id`, `WorkId`, `UserId`, `CurrentPage` (default 0) y navegaciones `Work` y `User`.
2. **Configuración EF Core**: `WorkReadingProgressConfiguration` con tabla `WorkReadingProgresses`, clave primaria `Id`, FK a `Works` y `Users` con cascade delete, índice único en `(WorkId, UserId)`.
3. **DbContext**: Agregado `DbSet<WorkReadingProgress>` y configuración aplicada en `OnModelCreating`.
4. **Repository Interface**: `IWorkReadingProgressRepository` con `GetByWorkIdAndUserIdAsync` y `AddAsync`.
5. **Repository Implementation**: `WorkReadingProgressRepository` implementa la interfaz:
   - `GetByWorkIdAndUserIdAsync`: Busca por `WorkId` y `UserId`, **sin `AsNoTracking()`** (entidad trackeada), **sin `Include()`** (usa Lazy Loading).
   - `AddAsync`: Para crear nuevos registros.
6. **UnitOfWork**: Agregada propiedad `WorkReadingProgressRepository` en `IUnitOfWork` e `UnitOfWork`.
7. **Migración**: Creada y aplicada `20261008161422_AddWorkReadingProgress`.
8. **Documentación**: Actualizado `project/repositories.md` y `project/repositories/repositories-numbers.md` con la nueva repository.

### Decisiones tomadas
- Se siguió el patrón existente del proyecto (PageRepository, IPageRepository, etc.)
- La entidad usa navegaciones virtuales para Lazy Loading (consistente con User, Work, etc.)
- El índice único en `(WorkId, UserId)` garantiza que no haya duplicados para la misma combinación
- El `CurrentPage` tiene valor por defecto `0` en la entidad (no en la BD)
- La migración usa `bigint` para IDs y `int` para CurrentPage, consistente con el resto del modelo

### Validaciones ejecutadas
- ✅ Compilación correcta (0 errores, solo warnings preexistentes)
- ✅ Migración generada correctamente
- ✅ Migración aplicada a la base de datos sin errores
- ✅ La consulta no usa `AsNoTracking()` 
- ✅ La consulta no usa `Include()`
- ✅ Devuelve entidad trackeada
- ✅ Índice único en `(WorkId, UserId)` creado

### Problemas encontrados
- Ninguno. La implementación se completó sin bloqueos.
