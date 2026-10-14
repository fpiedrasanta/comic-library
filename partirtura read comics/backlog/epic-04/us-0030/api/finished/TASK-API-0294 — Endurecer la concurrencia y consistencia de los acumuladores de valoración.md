# TASK-API-0294 — Endurecer la concurrencia y consistencia de los acumuladores de valoración

## Objetivo

Corregir el defecto de concurrencia detectado en la revisión de US-0030 (TASK-API-0293): dos usuarios que votan simultáneamente sobre la misma Work pueden perder actualizaciones de `Work.RatingCount` y `Work.AverageRating`, porque el servicio lee los acumuladores, los recalcula en memoria y guarda (último escritor gana).

Además debe quedar documentada la semántica de `IsActive` para `WorkRating` y la estrategia de mantenimiento de los acumuladores.

## Contexto obligatorio

Leer antes de implementar:

* `backend-agent.md`
* `project.md`
* `backend-architecture.md`
* `backend-stack-technology.md`
* `backend-coding-rules.md`
* `communication.md`
* `project/domain/domain.md`
* `project/repositories.md`
* `project/services.md`
* `project/endpoints.md`

Revisar `WorkRatingService`, `WorkRatingRepository`, `UnitOfWork`, la configuración de `Works` y los tests de `WorkRating`.

## Alcance

### 1. Mantenimiento atómico de acumuladores

La actualización de `Work.RatingCount` y `Work.AverageRating` debe ejecutarse en el servidor de base de datos sobre los valores actuales, de forma que operaciones concurrentes no se pierdan:

* Al crear un voto: `RatingCount = RatingCount + 1` y `AverageRating = (RatingCount * AverageRating + stars) / (RatingCount + 1)`, evaluados con los valores vigentes en la base.
* Al editar un voto cambiando las estrellas: `AverageRating = (RatingCount * AverageRating - previousStars + newStars) / RatingCount`, sin modificar `RatingCount`.
* No debe leerse el valor previo de los acumuladores en memoria para calcular el nuevo.
* El orden de evaluación de las expresiones `SET` debe ser sobre los valores previos a la sentencia.

La operación debe mantener las fórmulas documentadas en TASK-API-0290/0293; solo cambia el mecanismo de persistencia para hacerlo atómico.

### 2. Atomicidad entre la valoración y los acumuladores

La escritura de la fila `WorkRating` y la actualización de los acumuladores deben ocurrir dentro de la misma transacción, de modo que una falla entre ambas no deje datos inconsistentes.

Reutilizar los mecanismos transaccionales existentes del proyecto. Si `IUnitOfWork` no permite revertir una transacción, completar esa capacidad sin romper su contrato actual.

### 3. Carrera de doble primer voto

Dos peticiones simultáneas del mismo usuario sobre la misma Work pueden no encontrar valoración existente y ambas intentar insertar. El índice único `(WorkId, UserId)` rechaza una de ellas.

* La petición rechazada debe recuperarse: buscar la valoración existente y completar la operación como edición, en lugar de propagar un error.
* Si el rechazo no corresponde a la restricción de unicidad, propagar la excepción original.
* No debe crearse nunca una segunda fila para el mismo usuario y Work.

### 4. Tests de concurrencia

Verificar con datos reales de la base de desarrollo:

* Varios usuarios votando simultáneamente sobre la misma Work: `RatingCount` y `AverageRating` finales correctos según las fórmulas.
* Varias peticiones simultáneas del mismo usuario sobre la misma Work: una sola fila, `RatingCount = 1`, sin excepciones.
* Los tests deben limpiar las filas creadas y restaurar los acumuladores, sin dejar residuos.

### 5. Semántica de IsActive en WorkRating

Documentar y hacer coherente:

* `IsActive` excluye la valoración de los listados.
* Ningún flujo de US-0030 desactiva valoraciones (no hay eliminación ni moderación en esta US).
* La edición reactiva la fila porque el índice único impide crear otra; la reactivación no altera los acumuladores por sí sola.
* Si en el futuro una valoración se desactiva sin ajustar acumuladores, `RatingCount` contaría un voto invisible: documentar el requisito para el flujo que lo haga.

### 6. Documentación

Actualizar:

* `project/services.md` y `project/services/services-catalog.md`: fórmulas, atomicidad, mecanismo de actualización, semántica de `IsActive`, comportamiento ante concurrencia.
* El resultado de ejecución de las tasks afectadas (TASK-API-0290 y TASK-API-0293) con la corrección aplicada, sin eliminar su contenido original.
* Esta task con su resultado de ejecución.

## Restricciones

* No cambiar las fórmulas de negocio documentadas en US-0030.
* No calcular el promedio consultando todas las valoraciones en cada solicitud de detalle.
* No introducir bloqueos pesimeros en las lecturas del catálogo.
* No modificar endpoints ni contratos HTTP.
* No eliminar tests existentes.
* No usar datos de prueba artificiales: la base de desarrollo es la fuente de datos.

## Validación

* Compilar el Backend/API.
* Tests nuevos de concurrencia en verde.
* Suite completa sin fallos.
* Verificar en base que los acumuladores resultantes coinciden con las valoraciones activas tras votos concurrentes.
* Verificar que la base de desarrollo queda sin residuos.

## Resultado de ejecución

Al finalizar, agregar a esta task un resumen de los archivos modificados, las decisiones tomadas, las validaciones ejecutadas y sus resultados, sin eliminar el contenido original.

Mover la task a `finished` o `blocked`, según corresponda, siguiendo `communication.md`.

---

## Resultado de ejecución

### Archivos modificados
- `api/Application/Interfaces/IUnitOfWork.cs` — agregado `RollbackAsync` (completa la API transaccional existente).
- `api/Infrastructure/Repositories/UnitOfWork.cs` — implementación de `RollbackAsync`.
- `api/Application/Interfaces/IWorkRatingRepository.cs` — `Detach`, `ApplyNewVoteToWorkAccumulatorsAsync`, `ApplyScoreChangeToWorkAccumulatorsAsync`.
- `api/Infrastructure/Repositories/WorkRatingRepository.cs` — actualización atómica de acumuladores con `ExecuteSqlRawAsync` parametrizado y `Detach`.
- `api/Application/Services/WorkRatingService.cs` — crear/editar dentro de transacción; acumuladores atómicos; recuperación de la carrera de doble primer voto; se eliminaron los helpers que calculaban acumuladores en memoria.
- `tests/Infrastructure.Tests/Integration/WorkRatingConcurrencyIntegrationTests.cs` (nuevo) — 3 tests de concurrencia.
- `project/services/services-catalog.md` — atomicidad, orden de locks, semántica de `IsActive`, comportamiento bajo concurrencia.
- `project/repositories/repositories-catalog.md` y `project/repositories.md` — operaciones atómicas del repositorio.
- Resultados de ejecución de TASK-API-0290 y TASK-API-0293 — corrección documentada.

### Implementación realizada
1. **Acumuladores atómicos**: `UPDATE Works SET AverageRating = (RatingCount * AverageRating + {0}) / (RatingCount + 1), RatingCount = RatingCount + 1 WHERE Id = {1}` al crear, y `UPDATE Works SET AverageRating = (RatingCount * AverageRating - {0} + {1}) / RatingCount WHERE Id = {2} AND RatingCount > 0` al editar (con rama de primer voto si `RatingCount = 0`). Sentencias parametrizadas vía `ExecuteSqlRawAsync` (sin concatenación de datos de usuario). `AverageRating` se asigna antes que `RatingCount` porque MySQL evalúa las asignaciones `SET` de izquierda a derecha.
2. **Transacción**: la fila `WorkRating` y los acumuladores se escriben en la misma transacción; ante cualquier falla se revierte (`RollbackAsync`). Si el trabajo dejó de existir, la actualización atómica no afecta filas y se lanza `BusinessNotFoundException`.
3. **Orden de locks**: la actualización de acumuladores es la primera escritura de la transacción, evitando el deadlock entre el lock compartido que el INSERT toma por la FK a `Works` y el lock exclusivo del UPDATE de la misma fila.
4. **Carrera de doble primer voto**: si el INSERT es rechazado por el índice único `(WorkId, UserId)`, se revierte, se suelta la entidad del change tracker (`Detach`), se relee la valoración existente y se completa como edición; si no existe (fallo real), se relanza la excepción original. No se captura la cancelación.
5. **Sin tipos de EF en Application**: la recuperación no atrapa `DbUpdateException` (Application no referencia EF Core); decide por la existencia de la valoración del par.

### Decisiones tomadas
- Fórmulas de negocio sin cambios (TASK-API-0290/0293); solo cambió el mecanismo para hacerlas atómicas.
- SQL parametrizado explícito en lugar de `ExecuteUpdate` con expresiones: control determinista del orden de asignación y de los casos borde, y SQL verificable.
- La reactivación de una valoración desactivada al editar se mantiene: es la única forma de no violar el índice único, y no altera los acumuladores por sí sola.
- `IsActive` no tiene flujo de desactivación en US-0030; cualquier flujo futuro que desactive sin reactivar debe descontar el voto de los acumuladores (documentado en el catálogo de servicios).

### Validaciones ejecutadas
- ✅ Compilación de la solución y de los tests: 0 errores.
- ✅ Tests nuevos de concurrencia: **3/3 en verde**, ejecutados 3 veces seguidas sin intermitencia.
  - 5 usuarios votando simultáneamente: `RatingCount = 5`, `AverageRating = 2.8` (fórmula `(n*a+s)/(n+1)`), listado con 5 elementos.
  - 5 peticiones simultáneas del mismo usuario (primer voto): una sola fila, `RatingCount = 1`, sin excepciones.
  - 3 votos simultáneos de usuarios distintos: `RatingCount = 3`, `AverageRating = 2.0`.
- ✅ Suite completa: **309/309 en verde** (273 previas + 36 de WorkRating).
- ✅ Base de desarrollo verificada sin residuos tras las corridas (0 filas en `WorkRatings`, acumuladores en 0). Residuos de corridas fallidas previas al fix fueron eliminados y verificados.
- ✅ Aritmética verificada además en SQL directo y con un test temporal (5,4,0 → promedio 3.0; edición 5→0 → (9-5)/3).

### Problemas encontrados y correcciones
- **Deadlock real** con la primera versión atómica: el INSERT toma lock compartido por la FK a `Works` y el UPDATE posterior quiere lock exclusivo → ciclo entre transacciones. Corregido invirtiendo el orden (acumuladores primero).
- **MySQL evalúa `SET` de izquierda a derecha**: con `RatingCount` primero, el promedio usaba el contador ya incrementado. Corregido asignando `AverageRating` primero (verificado en MySQL).
- Actualizar acumuladores en memoria (código previo): perdía actualizaciones bajo concurrencia. Reemplazado por la sentencia atómica.
- Quedó creada TASK-API-0295 (`planned/`) para el mecanismo de reconciliación de acumuladores, que no existe hoy.
