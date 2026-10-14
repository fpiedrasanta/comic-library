# TASK-API-0290 — Implementar WorkRatingService e integrar estadísticas en el detalle de Work

## Objetivo

Implementar el servicio de valoraciones de Works para crear y editar votos, obtener el listado paginado de valoraciones de una Work e incorporar el promedio y la cantidad total de votos al DTO de detalle del catálogo.

## Contexto obligatorio

Leer antes de implementar:

* `backend-agent.md`
* `project.md`
* `backend-architecture.md`
* `backend-stack-technology.md`
* `backend-coding-rules.md`
* `project/domain/domain.md`
* `project/repositories.md`
* `project/services.md`
* `project/services/services-catalog.md`

Revisar `WorkRatingRepository`, `WorkService`, los DTO existentes y la implementación actual de `MapCatalogDetail` para respetar las convenciones del proyecto.

## Alcance

### 1. Crear WorkRatingService

Implementar el servicio responsable de gestionar las valoraciones de Works, utilizando el repositorio de `WorkRating` y los mecanismos de persistencia existentes.

#### Crear o editar un voto

Implementar una operación que permita crear una valoración o editar la valoración existente del usuario para una Work.

Reglas:

* Cada usuario puede tener una única valoración por Work.
* Si no existe una valoración para la combinación usuario + Work, crearla.
* Si ya existe, actualizar el registro existente.
* Al editar, conservar `CreatedAt` y actualizar `UpdatedAt`.
* La identidad del usuario debe provenir del contexto autenticado que se establezca en el flujo de la aplicación; no confiar en un `UserId` proporcionado libremente por el cliente.
* La puntuación debe admitir valores de `0` a `5`.
* `Stars = 0` representa un voto válido sin puntuación positiva; no representa ausencia de voto.
* El comentario es opcional. No puede existir un comentario sin un voto.
* Un usuario puede votar sin escribir un comentario.

#### Actualización de acumuladores de Work

Al crear un voto:

* Incrementar `RatingCount`, incluso cuando `Stars = 0`.
* Actualizar `AverageRating` considerando todos los votos, incluidos los de cero estrellas.

Al editar un voto:

* No incrementar `RatingCount`.
* Si cambia `Stars`, actualizar `AverageRating` usando la puntuación anterior y la nueva.
* Si solo cambia el comentario, no modificar los acumuladores.

Mantener la coherencia entre la valoración y los acumuladores mediante los mecanismos transaccionales existentes.

### 2. Obtener listado paginado de WorkRating por Work

Implementar la operación de servicio que obtiene las valoraciones de una Work utilizando `WorkRatingRepository`.

Requisitos:

* Recibir el identificador de la Work y los parámetros de paginación, filtros y ordenamiento definidos por los contratos existentes.
* Permitir ordenar por `Stars` o `CreatedAt`, ascendente o descendente.
* Incluir los votos con `Stars = 0`.
* Respetar la paginación y el ordenamiento del repositorio.
* Devolver el resultado en los DTO o estructuras de paginación que utilice el proyecto.
* Preparar los datos necesarios para que el listado pueda mostrar la identidad del usuario, la fecha, la puntuación y el comentario cuando exista.

La definición de la presentación visual corresponde al Frontend y no debe incorporarse como lógica de negocio del servicio.

### 3. Modificar MapCatalogDetail

Modificar `MapCatalogDetail` para que el DTO de detalle de una Work incluya:

* `AverageRating`: promedio de las puntuaciones.
* `RatingCount`: cantidad total de votos.

Los valores deben obtenerse de los acumuladores de la entidad `Work`, sin calcular el promedio consultando todas las valoraciones en cada solicitud de detalle.

Reglas:

* Una Work sin votos debe devolver `RatingCount = 0` y `AverageRating = 0`.
* Los votos de cero estrellas cuentan para ambos acumuladores.
* Mantener el resto de los datos y comportamientos actuales del detalle de Work.

## Documentación

Actualizar:

* `project/services.md`
* El catálogo de servicios correspondiente a `WorkRating`.
* La documentación de contratos o DTO del detalle de Work, si el proyecto documenta estos campos allí.

Documentar las operaciones del servicio y la inclusión de `AverageRating` y `RatingCount` en el detalle del catálogo.

## Restricciones

* No implementar ni modificar endpoints o controladores en esta task.
* No modificar `WorkRepository`.
* No implementar componentes del Frontend.
* No duplicar lógica de persistencia que corresponda al repositorio.
* No calcular las estadísticas del detalle mediante una consulta de todas las valoraciones.
* No tratar `Stars = 0` como ausencia de voto.
* No alterar el estado ni el progreso de lectura de una Work como consecuencia de una valoración.

## Validación

* Compilar el Backend/API.
* Verificar creación de votos con puntuaciones de `0` a `5`.
* Verificar que una segunda operación del mismo usuario sobre la misma Work edite el voto existente.
* Verificar que editar conserve `CreatedAt` y actualice `UpdatedAt`.
* Verificar que crear un voto incremente `RatingCount`, incluso con `Stars = 0`.
* Verificar que editar no incremente `RatingCount`.
* Verificar que cambiar las estrellas actualice correctamente `AverageRating`.
* Verificar que cambiar únicamente el comentario no altere los acumuladores.
* Verificar listado paginado, filtros, ordenamiento y presencia de votos de cero estrellas.
* Verificar que `MapCatalogDetail` devuelva el promedio y la cantidad total de votos sin consultas adicionales para recalcularlos.

## Resultado de ejecución

Al finalizar, agregar a esta task un resumen de los archivos modificados, las decisiones tomadas, las validaciones ejecutadas y sus resultados, sin eliminar el contenido original.

Mover la task a `finished` o `blocked`, según corresponda, siguiendo `communication.md`.

---

## Resultado de ejecución

### Archivos modificados
- `api/Application/DTOs/WorkRatingDtos.cs` (nuevo) — `WorkRatingVoteRequest` (Stars `int?`, Review), `GetWorkRatingsRequest` (currentPage, pageSize, orderBy, orderDir), `WorkRatingDto`, `WorkRatingListItemDto`.
- `api/Application/Interfaces/IWorkRatingService.cs` (nuevo) — `CreateOrUpdateAsync` y `GetPagedByWorkIdAsync`.
- `api/Application/Services/WorkRatingService.cs` (nuevo) — servicio completo.
- `api/Application/DTOs/WorkCatalogDtos.cs` — `CatalogWorkDetailDto` gana `AverageRating` y `RatingCount`.
- `api/Application/DTOs/WorkContentDtos.cs` — `ReaderMyRatingDto` (Stars, Review) y `MyRating` en `ReaderWorkPagesDto`.
- `api/Application/Services/WorkService.cs` — `MapCatalogDetail` asigna `AverageRating`/`RatingCount` desde los acumuladores; `GetReaderPagesAsync` devuelve `MyRating` del usuario autenticado.
- `api/Api/Program.cs` — registro de `IWorkRatingService`.
- `tests/Infrastructure.Tests/Integration/IntegrationTestFixture.cs` — registro de `IWorkRatingService` para los tests.
- `project/services.md` y `project/services/services-catalog.md` — documentación de `WorkRatingService`, del mapeo del detalle y de `GET /api/works/{id}/pages`.

### Implementación realizada
1. **`CreateOrUpdateAsync(workId, userId, stars, review)`**: valida identificadores, normaliza `stars` (`null` → 0) y exige rango 0–5, trimea el review (blanco → `null`), valida Work existente y activa (`Guard.RequireActive`) y usuario existente (`Guard.Require`). Upsert: si no existe valoración para usuario+Work la crea (`CreatedAt` = UtcNow, `UpdatedAt` = null) e incrementa `RatingCount`; si existe, edita el mismo registro preservando `CreatedAt`, seteando `UpdatedAt` = UtcNow y sin tocar `RatingCount`. Rating y acumuladores se guardan en el mismo `SaveChangesAsync` (mismo `DbContext`/unit of work).
2. **Acumuladores**: crear → `newCount = RatingCount + 1`, `newAverage = (RatingCount * AverageRating + score) / newCount`. Editar → solo si cambia `Stars`: `newAverage = (RatingCount * AverageRating - previousStars + score) / RatingCount`. Comentario solo → acumuladores intactos. Reutilización de fila: como el par (User, Work) es único en base, la edición reactiva la fila si estuviera desactivada (`IsActive = true`); nunca se inserta un duplicado.
3. **`GetPagedByWorkIdAsync`**: normaliza paginación con `PaginationGuard` (default 12, máx 50), default `CreatedAt DESC`, exige Work existente y activa, delega la consulta al repositorio, mapea a `WorkRatingListItemDto` (Id, UserId, UserName, UrlAvatar, Stars, Review, CreatedAt) y construye `ListResponse` con `PaginationGuard.Build`.
4. **`MapCatalogDetail`**: `AverageRating` y `RatingCount` salen de los acumuladores de `Work`, sin consultar valoraciones. Sin votos: 0 y 0.
5. **Reader**: `GET /api/works/{id}/pages` ahora incluye `myRating` (stars + review) del usuario autenticado, para el formulario final; `null` si no votó o la petición es anónima. Decordada con el usuario: reemplaza la necesidad de un endpoint propio de "mi valoración" (pendiente 0291).

### Decisiones tomadas
- La nulidad de `Stars` existe solo en el contrato de entrada; en Dominio y persistencia siempre es `int` (0 = voto sin estrellas).
- Promedio sin redondear (precisión `double` completa); el redondeo de presentación es del Frontend.
- Review se trimea y se guarda como `null` cuando queda vacío; nunca se persiste una review sin voto (toda fila es un voto).
- Listado de valoraciones sobre Work inexistente o inactiva → `BusinessNotFoundException` (404), no lista vacía.
- La edición reactiva una fila desactivada: es la única forma de no violar el índice único (User, Work).

### Validaciones ejecutadas
- ✅ Compilación de la solución: 0 errores.
- ✅ Suite completa: 306/306 tests en verde (33 nuevos de WorkRating).
- ✅ Verificado por tests: creación con estrellas 0–5; segundo guardado edita el mismo registro conservando `CreatedAt` y seteando `UpdatedAt`; `RatingCount` se incrementa al crear (incluido `Stars = 0`) y no cambia al editar; promedio correcto al cambiar estrellas (5 → 2.5 → 0 → 1.5); comentario solo no altera acumuladores; listado paginado/ordenado/filtrado; `MapCatalogDetail` con y sin votos.
- ✅ Smoke test HTTP real (documentado en TASK-API-0291): crear → detalle (avg 5, count 1) → editar → segundo voto 0 estrellas (avg 2.5, count 2).
- ✅ `WorkReadingProgress` intacto: ninguna operación de valoración lo modifica.

### Problemas encontrados
- Ninguno en la lógica final. Durante el desarrollo se detectó que una valoración desactivada debía reactivarse al editar (corregido y documentado).

---

## Corrección posterior a la validación (revisión de US-0030)

Durante la revisión de la implementación completa se detectó un defecto de concurrencia: `CreateRatingAsync` leía los acumuladores de la Work en memoria, los recalculaba y guardaba, por lo que dos votos simultáneos sobre la misma obra podían perder actualizaciones de `RatingCount`/`AverageRating`. Además, la valoración y los acumuladores no se escribían en la misma transacción.

Corregido en TASK-API-0294:

* los acumuladores se actualizan con una única sentencia `UPDATE Works` parametrizada que evalúa las fórmulas sobre los valores almacenados (sin lectura previa en memoria);
* la valoración y los acumuladores se escriben dentro de la misma transacción (`BeginTransAsync`/`CommitAsync`, con `RollbackAsync` nuevo en `IUnitOfWork`);
* la actualización de acumuladores es la primera escritura de la transacción para evitar el deadlock entre el lock compartido de la FK del insert y el lock exclusivo de la fila de `Works`;
* una petición rechazada por el índice único `(WorkId, UserId)` se recupera releyendo la valoración existente y completándola como edición;
* la corrección se verificó con tests de concurrencia nuevos (3 tests) y con la suite completa (309/309). Ver TASK-API-0294 para el detalle.
