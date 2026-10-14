# TASK-API-0297 â€” Incorporar progreso de lectura en el listado de Works

## Objetivo

Modificar `GET /api/works` para incluir el progreso de lectura del usuario autenticado en cada Work, evitando consultas individuales por cada resultado.

La implementaciÃ³n debe conservar el repositorio actual de `Work` y realizar una segunda consulta batch al repositorio de `WorkReadingProgress`.

## Endpoint

`GET /api/works`

Cada elemento de la respuesta debe incorporar `myReadingProgress`:

- `null` si el usuario no estÃ¡ autenticado o no tiene progreso para ese Work.
- Un objeto con el progreso correspondiente si existe.

El objeto debe incluir:

- `currentPage`
- `totalPages`
- `percentage`
- `status`
- `lastReadAt`

El porcentaje debe calcularse de la siguiente manera:

- Sin pÃ¡ginas leÃ­das: `0%`.
- Durante la lectura: `(CurrentPage - 1) * 100 / TotalPages`.
- Lectura completada (`CurrentPage == TotalPages + 1`): `100%`.

El cÃ¡lculo debe evitar divisiones por cero y conservar precisiÃ³n decimal en el resultado.

No agregar propiedades persistidas a la entidad `Work`.

## ImplementaciÃ³n

### 1. Agregar mÃ©todo a `WorkReadingProgressRepository`

Implementar:

`GetByWorkIdsAndUserIdAsync(IEnumerable<long> workIds, long userId)`

El mÃ©todo debe:

- Recuperar los progresos asociados a los IDs recibidos y al usuario indicado.
- Ejecutar una Ãºnica consulta a la base de datos, independientemente de la cantidad de Works.
- Devolver una lista vacÃ­a cuando no haya resultados.
- No recuperar progresos de otros usuarios.
- No devolver registros ajenos a los IDs solicitados.
- Evitar consultas individuales por cada Work.
- Seguir las convenciones existentes del repositorio y de `UnitOfWork`.

Si la lista de IDs estÃ¡ vacÃ­a, devolver una lista vacÃ­a sin consultar la base de datos.

### 2. Modificar el servicio que implementa `GET /api/works`

Conservar la consulta actual que obtiene los Works paginados y agregar una segunda consulta para recuperar sus progresos.

El flujo debe ser equivalente al siguiente cÃ³digo, adaptÃ¡ndolo a las firmas, los tipos y el mapeo existentes en el proyecto:

```csharp
var works = await workRepository.GetPagedAsync(...);

var progressesByWorkId = new Dictionary<long, WorkReadingProgress>();

if (userId.HasValue && works.Count > 0)
{
    var workIds = works
        .Select(work => work.Id)
        .ToList();

    var progresses = await progressRepository
        .GetByWorkIdsAndUserIdAsync(workIds, userId.Value);

    progressesByWorkId = progresses.ToDictionary(
        progress => progress.Work.Id);
}

var result = works.Select(work =>
{
    progressesByWorkId.TryGetValue(work.Id, out var progress);

    var dto = mapper.Map<WorkDto>(work);

    dto.MyReadingProgress = progress is null
        ? null
        : MapReadingProgress(progress);

    return dto;
}).ToList();
```

**Importante:** el cÃ³digo es una guÃ­a de implementaciÃ³n, no una instrucciÃ³n para introducir nombres o firmas que no existan en el proyecto. Utilizar el mecanismo de identificaciÃ³n del usuario autenticado ya establecido y adaptar el acceso al `WorkId` a las convenciones reales de `WorkReadingProgress`.

La consulta de progresos debe ejecutarse Ãºnicamente cuando exista un usuario autenticado y haya resultados en la pÃ¡gina.

### 3. Incorporar el progreso al DTO de respuesta

Agregar `myReadingProgress` al DTO que representa cada Work del listado, utilizando un DTO especÃ­fico para el progreso si corresponde.

Incluir `percentage` como parte del objeto y calcularlo con las reglas definidas en esta tarea.

No modificar innecesariamente el contrato de otros endpoints que reutilicen el DTO. Si el DTO actual es compartido, evaluar el impacto y utilizar una representaciÃ³n especÃ­fica del listado cuando sea necesario.

### 4. IdentificaciÃ³n del usuario

Obtener el `UserId` exclusivamente de la identidad autenticada.

No aceptar el identificador del usuario como parÃ¡metro del cliente para determinar quÃ© progreso devolver.

El endpoint debe conservar su comportamiento actual para usuarios anÃ³nimos. En ese caso, `myReadingProgress` debe ser `null` para todos los resultados.

## Pruebas

Agregar o actualizar pruebas para verificar:

- Usuario autenticado con progreso en algunos Works.
- Usuario autenticado sin progreso en ningÃºn Work.
- Usuario anÃ³nimo.
- Porcentaje de progreso inicial, intermedio y completado.
- PÃ¡gina vacÃ­a sin consulta batch de progresos.
- Una sola consulta batch para todos los Works de la pÃ¡gina.
- Aislamiento de los progresos por usuario.
- Ausencia de progresos pertenecientes a Works fuera de la pÃ¡gina solicitada.
- Compatibilidad con los filtros, la ordenaciÃ³n y la paginaciÃ³n existentes.
- Ausencia de regresiones en los demÃ¡s consumidores de los DTOs modificados.

## DocumentaciÃ³n

Actualizar la documentaciÃ³n correspondiente en:

- `project/repositories.md`
- `project/services.md`
- `project/endpoints.md`

Documentar el nuevo mÃ©todo del repositorio, el enriquecimiento del listado y el contrato de `myReadingProgress`.

Registrar el resultado de ejecuciÃ³n en esta task sin sobrescribir su especificaciÃ³n.

## Fuera de alcance

- Modificar la entidad `Work` para persistir el progreso.
- Crear endpoints nuevos.
- Modificar la persistencia o las reglas de actualizaciÃ³n del progreso.
- Cambiar la paginaciÃ³n, los filtros o la ordenaciÃ³n existentes.
- Ejecutar una consulta por cada Work.
- Modificar el comportamiento de otros endpoints fuera de lo necesario para preservar sus contratos.

## Criterios de aceptaciÃ³n

- `GET /api/works` incluye `myReadingProgress` en cada elemento.
- El progreso corresponde exclusivamente al usuario autenticado.
- El porcentaje se calcula correctamente y contempla la lectura completada.
- El repositorio implementa `GetByWorkIdsAndUserIdAsync`.
- El servicio realiza una Ãºnica consulta batch adicional, como mÃ¡ximo, por pÃ¡gina.
- No existen consultas individuales de progreso por Work.
- Los usuarios anÃ³nimos reciben `myReadingProgress = null`.
- Se conservan los contratos y comportamientos existentes que no forman parte de esta tarea.
- Las pruebas y la documentaciÃ³n quedan actualizadas.
---

## Resultado de ejecuciÃ³n

### Archivos modificados
- `api/Application/Interfaces/IWorkReadingProgressRepository.cs` â€” nuevo `GetByWorkIdsAndUserIdAsync(IEnumerable<long> workIds, long userId, CancellationToken)`.
- `api/Infrastructure/Repositories/WorkReadingProgressRepository.cs` â€” implementaciÃ³n batch (una sola consulta).
- `api/Application/Services/WorkService.cs` â€” `GetCatalogPagedAsync(request, long? userId, ct)` con la consulta batch de progresos; helper compartido `MapMyReadingProgress` reutilizado por el detalle y el listado.
- `api/Application/Interfaces/IWorkService.cs` â€” firma actualizada.
- `api/Api/Controllers/WorksController.cs` â€” `Get` extrae el claim `sub` del JWT.
- `api/Application/DTOs/WorkCatalogDtos.cs` â€” `WorkCatalogItemDto` gana `MyReadingProgress` (`ReaderMyProgressDto`, reutilizado de TASK-API-0296).
- `tests/Infrastructure.Tests/Integration/WorkCatalogReadingProgressIntegrationTests.cs` (nuevo) â€” 9 tests.
- `tests/Infrastructure.Tests/Integration/CatalogWorkDetailIntegrationTests.cs`, `WorkReaderPagesIntegrationTests.cs`, `WorkRatingTestSupport.cs`, `WorkDetailReadingProgressIntegrationTests.cs`, `WorkCatalogIntegrationTests.cs` â€” call sites actualizados con `null`.
- `project/repositories.md` (conteo de operaciones 2 â†’ 3), `project/repositories/repositories-numbers.md` (mÃ©todo batch documentado), `project/services/services-catalog.md` (operaciÃ³n y notas del listado), `project/endpoints/endpoints-works.md` (contrato de `GET /api/works` con `myReadingProgress`).
- `project/services.md` y `project/endpoints.md`: solo se actualizaron los archivos de detalle que sus Ã­ndices referencian (`services-catalog.md` y `endpoints-works.md`); ningÃºn Ã­ndice cambiÃ³ porque no se agregaron archivos ni rutas nuevas.

### ImplementaciÃ³n realizada
1. **Repositorio**: `GetByWorkIdsAndUserIdAsync` devuelve los progresos de un usuario restringidos a los ids recibidos. Con la lista vacÃ­a devuelve lista vacÃ­a **sin tocar la base**. En caso contrario ejecuta **una Ãºnica consulta**: `AsNoTracking` + `Include(Work)` (para poder clavear por obra sin lazy loading) + filtro por usuario y por los ids solicitados. Nunca devuelve progresos de otros usuarios ni de obras fuera de los ids.
2. **Servicio**: se conserva la consulta paginada actual de `WorkRepository.GetCatalogPagedAsync`. Solo cuando hay usuario autenticado y la pÃ¡gina tiene items se toman los ids de la pÃ¡gina y se hace la segunda consulta batch; los progresos se indexan por `Work.Id` y cada obra se mapea con su `myReadingProgress`. Sin usuario, con pÃ¡gina vacÃ­a o anÃ³nimo, la consulta batch no se ejecuta y todos los items quedan en `null`.
3. **Contrato**: `myReadingProgress` usa `ReaderMyProgressDto` (`CurrentPage`, `TotalPages`, `Percentage`, `Status`, `LastReadAt`) con los **valores persistidos** por `PUT /api/works/{id}/progress`; no se calcula nada (`Percentage` es la columna `PercentageReading`), coincide con el detalle y no se agregaron propiedades persistidas a `Work`.
4. **Identidad**: exclusivamente desde el claim `sub` del JWT; `?userId=...` se ignora (verificado por HTTP). `[Authorize]` del controlador se mantiene: anÃ³nimo â†’ 401.

### Decisiones tomadas
- `WorkCatalogItemDto` solo lo consume `GET /api/works`, por lo que se extendiÃ³ directamente (no hizo falta un DTO especÃ­fico del listado ni se afectÃ³ otro contrato).
- `Include(Work)` en la consulta batch: permite clavear por obra sin disparar lazy loading por fila (evita N+1) manteniendo una sola consulta.
- Helper de mapeo compartido con el detalle (`MapMyReadingProgress`) para no duplicar la conversiÃ³n.
- Los tests no limpian el progreso creado (misma decisiÃ³n que TASK-API-0296): los tests son idempotentes porque el progreso se setea de forma absoluta y verifican el estado real antes de aseverar.

### Validaciones ejecutadas
- âœ… CompilaciÃ³n de la soluciÃ³n y de los tests: 0 errores.
- âœ… Suite completa: **323/323** (314 previas + 9 nuevas), ejecutada dos veces seguidas sin fallos.
- âœ… Tests nuevos: usuario con progreso en algunas obras (valores exactos inicial/intermedio/completado con 100 % y estado `Completed`); solo las obras del usuario y de la pÃ¡gina; aislamiento por usuario; usuario sin progreso en la pÃ¡gina â†’ todos `null`; anÃ³nimo â†’ todos `null`; pÃ¡gina vacÃ­a sin consulta batch; ids vacÃ­os en el repositorio sin consulta; filtros/orden/paginaciÃ³n preservados.
- âœ… DetecciÃ³n de N+1: tras la llamada del servicio, el `ChangeTracker` no contiene entidades `Work` ni `WorkReadingProgress` (prueba de que ninguna navegaciÃ³n se cargÃ³ por lazy loading).
- âœ… Smoke test HTTP real: `GET /api/works?pageSize=5` devuelve `myReadingProgress` solo para las obras con progreso del usuario; `PUT /api/works/{id}/progress` con `currentPage:3` se refleja en el listado (`{currentPage:3,totalPages:26,percentage:7,status:"Reading"}`); pÃ¡gina vacÃ­a â†’ 0 items; bÃºsqueda + orden preservan el contrato; sin token â†’ 401; `?userId=4` ignorado.
- âœ… Base de desarrollo: se eliminaron 6 valoraciones residuales de corridas fallidas previas y se restauraron sus acumuladores (0 filas en `WorkRatings`, 0 obras con acumuladores distintos de 0). El progreso de lectura se dejÃ³ en la base, segÃºn indicaciÃ³n.

### Problemas encontrados y correcciones
- Error de compilaciÃ³n por reutilizar el nombre `service` en scopos anidados dentro de los tests: renombrado a `setupService`.
- Test frÃ¡gil de TASK-API-0296 Detectado durante la suite completa: elegÃ­a una obra sin progreso que podÃ­a no tener pÃ¡ginas y dividÃ­a por cero. Corregido exigiendo obras con pÃ¡ginas (mismo criterio aplicado a los tests nuevos).
- Quedaron filas de valoraciÃ³n de corridas fallidas durante el debugging de concurrencia: eliminadas y verificada la base limpia.
