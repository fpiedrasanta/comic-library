# TASK-API-0301 — Actualizar el dominio de lectura y valoraciones de listas

## Objetivo

Actualizar el dominio de Backend/API para soportar el seguimiento de lectura y las valoraciones de listas.

## Implementación

### 1. Actualizar `WorkList`

Agregar las propiedades:

- `RatingCount`: cantidad de valoraciones activas, inicializada en `0`.
- `AverageRating`: promedio de las puntuaciones de las valoraciones activas, inicializado en `0`.

Ambas métricas deben quedar preparadas para mantenerse consistentes cuando se implementen los servicios de valoración.

### 2. Crear `ListRating`

Implementar la entidad con:

- `Id`.
- `Stars`, obligatorio, con valores válidos entre `1` y `5`.
- `Review`, opcional.
- `CreatedAt`.
- `UpdatedAt`, opcional.
- `IsActive`, inicializado en `true`.
- Navegaciones a `User` y `WorkList`.

Configurar una relación con cada entidad y una restricción única para impedir más de una valoración por usuario y lista. Utilizar claves foráneas shadow si esa es la convención de las entidades existentes.

### 3. Crear `ListReadingProgress`

Implementar la entidad con:

- `Id`.
- Navegación a `User`.
- Navegación a `WorkList`.
- `CurrentWork`, opcional.
- `LastReadAt`, opcional.

Configurar las relaciones y una restricción única por usuario y lista.

No persistir el porcentaje de lectura ni el estado de la lista: deberán calcularse a partir de su composición y de los registros existentes en `WorkReadingProgress`.

`CurrentWork` debe pertenecer a la lista. Las reglas para actualizarlo cuando cambie la composición se implementarán en la capa de servicios.

### 4. Configurar persistencia y documentación

- Actualizar las configuraciones de Entity Framework Core correspondientes.
- Incorporar las restricciones e índices necesarios.
- Actualizar `domain.md` con las entidades, propiedades, relaciones y reglas implementadas.
- No modificar repositorios, servicios ni endpoints en esta task, salvo los cambios estrictamente necesarios para mantener la solución compilable.

## Fuera de alcance

- Implementación de repositorios, servicios y endpoints.
- Cálculo y actualización de métricas de valoración.
- Actualización del progreso de lectura.
- Pruebas específicas de las funcionalidades, que corresponden a las tasks posteriores.

## Criterios de aceptación

- `WorkList` contiene las métricas de valoración.
- `ListRating` permite una única valoración por usuario y lista.
- Las puntuaciones válidas están entre `1` y `5`, y la reseña es opcional.
- `ListReadingProgress` permite un único registro por usuario y lista.
- Las relaciones, restricciones e índices están configurados.
- `domain.md` refleja los cambios.
- La solución compila sin introducir regresiones detectables.

## Git y ejecución

1. `git checkout main` → `git pull`
2. `git branch --list "feature/us-0034-api-list-reading-and-ratings"`

   Si existe: `git switch feature/us-0034-api-list-reading-and-ratings` → `git merge main`.

   Si no existe: `git switch -c feature/us-0034-api-list-reading-and-ratings`.

3. Implementar los cambios de esta task.
4. Revisar los cambios con `git diff`.
5. Ejecutar las validaciones disponibles para comprobar que el dominio compila y que no se introdujeron regresiones detectables en esta etapa.
6. Crear uno o más commits y realizar el push de los cambios a la rama de trabajo.
7. Incorporar el resultado de ejecución en esta misma task mediante *append*, sin sobrescribir su contenido previo.
8. Mover el archivo según `communication.md` a `finished` si se cumplen los criterios, o a `blocked` si existe un bloqueo real, documentando la causa y el trabajo pendiente.

La integración final de la rama en `main` corresponde a la última task de la User Story.

---

## Resultado de ejecución

### Archivos modificados
- `api/Domain/Entities/WorkList.cs` — agrega `RatingCount` (`int`, default `0`) y `AverageRating` (`double`, default `0`).
- `api/Domain/Entities/ListRating.cs` (nuevo) — entidad de valoración de listas.
- `api/Domain/Entities/ListReadingProgress.cs` (nuevo) — entidad de progreso de lectura de listas.
- `api/Infrastructure/Persistence/Configurations/ListRatingConfiguration.cs` (nuevo).
- `api/Infrastructure/Persistence/Configurations/ListReadingProgressConfiguration.cs` (nuevo).
- `api/Infrastructure/Persistence/ApplicationDbContext.cs` — `DbSet<ListRating>`, `DbSet<ListReadingProgress>` y `ApplyConfiguration` de ambas.
- `api/Infrastructure/Persistence/Migrations/20261014200625_AddListRatingAndListReadingProgress.cs` (nuevo) + snapshot actualizado.
- `project/domain.md`, `project/domain/domain-content.md`, `project/domain/domain-catalog.md` — documentación de dominio.

### Implementación realizada
1. **`WorkList`**: nuevas propiedades `RatingCount` y `AverageRating` con los mismos valores iniciales y semántica que los acumuladores de `Work`; quedan preparadas para que el servicio de valoraciones las mantenga (no se implementa cálculo en esta task).
2. **`ListRating`**: `Id`, `int Stars` (obligatorio; valores válidos 1 a 5, validación a cargo del servicio en su task), `string? Review` (opcional), `CreatedAt`, `DateTime? UpdatedAt`, `bool IsActive` (default `true`), navegaciones `User` y `WorkList`. Sin propiedades FK escalares: `UserId` y `WorkListId` son shadow properties.
3. **`ListReadingProgress`**: `Id`, navegaciones `User` y `WorkList` (obligatorias), `Work? CurrentWork` (opcional, debe pertenecer a la lista) y `DateTimeOffset? LastReadAt` (opcional). Sin propiedades FK escalares (`UserId`, `WorkListId`, `CurrentWorkId` shadow). **No persiste porcentaje ni estado**: se derivan de la composición de la lista y de `WorkReadingProgress` (obras completadas / total, y `Reading` si alguna obra de la lista está en ese estado).
4. **Persistencia**: tablas `ListRatings` y `ListReadingProgresses` con índice único `(WorkListId, UserId)` en ambas (una valoración y un progreso por usuario y lista), FKs con `ON DELETE CASCADE` a `Users` y `WorkLists`, y `CurrentWorkId` opcional con `ON DELETE SET NULL` (si la obra desaparece, el trabajo actual vuelve a null). Migración creada y aplicada a `comiclibrary_dev`.

### Decisiones tomadas
- `Stars` no-nulleable (`int`) con rango válido 1–5 según la task (a diferencia de `WorkRating.Stars`, que admite 0); la validación vive en el servicio cuando se implemente.
- `CurrentWork` con `DeleteBehavior.ClientSetNull` en lugar de cascade: un progreso de lista no debe desaparecer si una obra se elimina físicamente, solo pierde la obra actual.
- `ListRating` comparte las convenciones de `WorkRating` (shadow FKs, índice único par, `datetime(6)`).
- Los acumuladores de `WorkList` se documentan junto a los de `Work` para que la semántica sea idéntica.

### Validaciones ejecutadas
- ✅ Compilación de la solución: 0 errores.
- ✅ Suite completa: **358/358** (sin tests nuevos en esta task, según su alcance). Se hizo una corrida adicional por un fallo espurio aislado de `EditExistingNumberWorkflowIntegrationTests` que no reproduce ni está relacionado con estos cambios (verificado: pasa aislado y en dos corridas completas posteriores).
- ✅ Estructura verificada con `SHOW CREATE TABLE`: `Stars` NOT NULL, `Review` y `UpdatedAt` NULLable, `CurrentWorkId` y `LastReadAt` NULLable, UNIQUE `(WorkListId, UserId)` en ambas tablas, FKs e índices creados.
- ✅ Migración aplicada a la BD de desarrollo (`20261014200625_AddListRatingAndListReadingProgress`).

### Git
- Rama de trabajo creada: `feature/us-0034-api-list-reading-and-ratings` (no existía; `main` estaba actualizado).
- `git diff` revisado: solo cambios de esta task. La eliminación de `backlog/epic-04/us-0033/api/pending/301.md` presente en el working tree es previa y ajena a esta task: se dejó fuera del commit.
- Commit y push realizados en la rama de trabajo.
