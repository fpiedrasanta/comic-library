# TASK-API-0293 â€” Validar implementaciÃ³n completa de WorkRating

## Objetivo

Validar que la funcionalidad de valoraciones de Works estÃ© implementada de extremo a extremo, que los acumuladores `RatingCount` y `AverageRating` se mantengan correctamente al crear y editar votos y que todas las tasks y la documentaciÃ³n de la US-0030 estÃ©n cerradas correctamente.

Esta task es de revisiÃ³n y validaciÃ³n. Corregir defectos encontrados Ãºnicamente cuando sea necesario para completar la funcionalidad y documentar cada correcciÃ³n.

## Contexto obligatorio

Leer:

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

Revisar las tasks API-0288, API-0289, API-0290, API-0291 y API-0292, incluidos sus resultados de ejecuciÃ³n.

## 1. ValidaciÃ³n funcional integral

Comprobar que estÃ©n implementados y conectados correctamente:

* Entidad `WorkRating` y sus relaciones.
* RestricciÃ³n de una valoraciÃ³n por usuario y Work.
* Repositorio de creaciÃ³n, ediciÃ³n, consultas y listado paginado.
* Servicio de creaciÃ³n y ediciÃ³n de votos.
* Servicio de listado paginado por Work.
* Endpoints `POST`, `PUT` y `GET` de valoraciones.
* AutorizaciÃ³n para usuarios autenticados no administradores.
* Identidad del usuario obtenida desde el JWT.
* InclusiÃ³n de `AverageRating` y `RatingCount` en el detalle de Work.
* DocumentaciÃ³n actualizada de contratos y comportamiento.

Verificar que los votos de cero estrellas se consideren votos vÃ¡lidos y aparezcan en los listados.

## 2. ValidaciÃ³n de los acumuladores de Work

Verificar los valores persistidos de `Work.RatingCount` y `Work.AverageRating` despuÃ©s de cada operaciÃ³n.

### Al crear un voto

Si la Work tiene \(n\) votos previos, promedio \(a\) y se agrega una puntuaciÃ³n \(s\):

* `newCount = n + 1`
* `newAverage = (n * a + s) / newCount`

El nuevo voto debe incrementar la cantidad total, incluso si `s = 0`.

Verificar expresamente:

* Primer voto.
* Voto de cero estrellas.
* Voto con puntuaciÃ³n positiva.
* Work que ya tiene mÃºltiples votos.
* Promedio y cantidad devueltos por el endpoint de detalle despuÃ©s de crear el voto.

### Al editar un voto existente

Recuperar la valoraciÃ³n anterior del mismo usuario y Work antes de actualizarla:

```csharp
RatingWork rw = GetRatingWork(user, work); // Mi voto anterior

total = work.RatingCount * work.AverageRating;
newTotal = total - rw.Stars + request.Stars;
newAverage = newTotal / work.RatingCount;
```

La cantidad de votos **no cambia** al editar.

Verificar que:

* Se resta la puntuaciÃ³n anterior.
* Se suma la nueva puntuaciÃ³n.
* Se actualiza `AverageRating`.
* `RatingCount` permanece igual.
* Si la puntuaciÃ³n no cambia, el promedio tampoco cambia.
* Si solo cambia el comentario, no cambian los acumuladores.
* La operaciÃ³n funciona al cambiar de cero estrellas a una puntuaciÃ³n positiva y viceversa.
* `CreatedAt` se conserva y `UpdatedAt` se actualiza.
* El detalle de Work devuelve los acumuladores actualizados.

La fÃ³rmula anterior supone que existe al menos un voto y que `RatingCount` coincide con la cantidad real de valoraciones. Para una Work sin votos, la creaciÃ³n debe seguir la lÃ³gica de primer voto y no dividir por cero.

### PrecisiÃ³n numÃ©rica

Comprobar que el promedio se calcule utilizando una representaciÃ³n numÃ©rica que admita decimales y que no se trunque mediante divisiÃ³n entera. La precisiÃ³n y el redondeo de presentaciÃ³n deben seguir las convenciones del proyecto.

Cuando sea posible, contrastar los acumuladores persistidos contra un cÃ¡lculo independiente basado en los votos almacenados, incluyendo los de cero estrellas.

## 3. ValidaciÃ³n de autorizaciÃ³n y errores

Comprobar:

* Un usuario no autenticado no puede crear ni editar votos.
* Un usuario autenticado no administrador puede crear y editar su propio voto.
* Un usuario no puede editar el voto de otra persona.
* Una segunda creaciÃ³n del mismo usuario para la misma Work no genera un voto duplicado.
* Las puntuaciones fuera del rango permitido son rechazadas.
* No se puede valorar una Work inexistente o inactiva.
* Los errores utilizan el formato y los cÃ³digos establecidos por el proyecto.

## 4. ValidaciÃ³n de documentaciÃ³n

Revisar que estÃ©n actualizados y sean coherentes:

* `project/domain/domain.md`
* `project/repositories.md`
* `project/services.md`
* `project/endpoints.md`

AdemÃ¡s:

* Revisar los catÃ¡logos especÃ­ficos enlazados desde esos documentos, si existen.
* Confirmar que los contratos documentados coincidan con los DTO y endpoints implementados.
* Confirmar que la documentaciÃ³n refleje la semÃ¡ntica de `Stars = 0`.
* Confirmar que documente el mantenimiento de `RatingCount` y `AverageRating`.

Actualizar cualquier documento incompleto o inconsistente.

## 5. ValidaciÃ³n del estado de las tasks

Revisar todas las tasks de la US-0030, desde API-0288 hasta API-0293, y verificar que cada una:

* Contenga una secciÃ³n **Resultado de ejecuciÃ³n**.
* Mantenga el contenido original de la task.
* Registre los archivos modificados, decisiones, validaciones y resultados.
* EstÃ© en `finished` o `blocked`, siguiendo `communication.md`.

**No debe quedar ninguna task en `pending`.**

Si una task sigue pendiente, carece de resultado o no refleja el estado real de la implementaciÃ³n, corregir su documentaciÃ³n o estado segÃºn corresponda. No marcar como `finished` una task cuya implementaciÃ³n no estÃ© completa; si existe un impedimento real, dejarla en `blocked` con la causa documentada.

## 6. EjecuciÃ³n de pruebas y compilaciÃ³n

* Ejecutar los tests unitarios e integraciÃ³n de WorkRating.
* Ejecutar los tests existentes afectados.
* Compilar la soluciÃ³n.
* Verificar el flujo completo: crear voto â†’ consultar detalle â†’ editar voto â†’ consultar detalle.
* Registrar los comandos ejecutados y sus resultados.
* Distinguir los fallos introducidos por esta funcionalidad de los fallos preexistentes.

## Restricciones

* No agregar funcionalidades fuera de la US-0030.
* No cambiar reglas de negocio sin documentar la decisiÃ³n.
* No alterar el progreso ni el estado de lectura de una Work al votar.
* No dar por vÃ¡lida la implementaciÃ³n Ãºnicamente porque compile: comprobar tambiÃ©n los datos persistidos y las respuestas de los endpoints.

## Resultado de ejecuciÃ³n

Al finalizar, agregar un resumen de los archivos revisados o modificados, las pruebas ejecutadas, los cÃ¡lculos verificados, los defectos corregidos y el estado final de cada task.

Confirmar explÃ­citamente que no queda ninguna task en `pending`, o identificar las que deban permanecer en `blocked` y explicar por quÃ©.

Mover esta task a `finished` o `blocked`, segÃºn corresponda, siguiendo `communication.md`.

---

## Resultado de ejecuciÃ³n

### Archivos revisados / modificados
- Revisadas las 6 tasks de la US-0030 (API-0288 a API-0293) y sus resultados de ejecuciÃ³n.
- Revisados: `api/Domain/Entities/WorkRating.cs`, `api/Domain/Entities/Work.cs`, `api/Infrastructure/Persistence/Configurations/WorkRatingConfiguration.cs`, `api/Infrastructure/Persistence/ApplicationDbContext.cs`, `api/Infrastructure/Persistence/Migrations/20261009155714_AddWorkRatingAndWorkRatingAccumulators.cs`, `api/Application/Interfaces/IWorkRatingRepository.cs`, `api/Infrastructure/Repositories/WorkRatingRepository.cs`, `api/Application/Services/WorkRatingService.cs`, `api/Api/Controllers/WorkRatingsController.cs`, `api/Application/DTOs/WorkRatingDtos.cs`, `api/Application/DTOs/WorkCatalogDtos.cs`, `api/Application/DTOs/WorkContentDtos.cs`, `api/Application/Services/WorkService.cs`.
- DocumentaciÃ³n revisada y coherente: `project/domain.md`, `project/domain/domain-content.md`, `project/repositories.md`, `project/repositories/repositories-catalog.md`, `project/services.md`, `project/services/services-catalog.md`, `project/endpoints.md`, `project/endpoints/endpoints-work-ratings.md`, `project/endpoints/endpoints-works.md`.
- CorrecciÃ³n menor aplicada: typo en el resultado de ejecuciÃ³n de TASK-API-0292 (ruta documentada). Sin cambios de cÃ³digo.

### ValidaciÃ³n funcional integral
- âœ… Entidad `WorkRating` con navegaciones `User`/`Work`, sin FK escalares, `IsActive`, `Stars` `int` no-nulleable (0â€“5), `Review` opcional, `CreatedAt`/`UpdatedAt`.
- âœ… Ãndice Ãºnico `(WorkId, UserId)` verificado en BD con `SHOW CREATE TABLE`.
- âœ… Repositorio completo (create, update, get por Id, get por usuario+Work, listado paginado con `AsNoTracking`, `Include(User)+ThenInclude(Avatar)`, orden Stars/CreatedAt ASC/DESC con desempate por `Id`, filtro por obra, exclusiÃ³n de inactivos).
- âœ… Servicio de creaciÃ³n/ediciÃ³n (upsert) y de listado paginado.
- âœ… Endpoints `POST`, `PUT`, `GET` operativos con `ApiResponse`/`ListResponse`.
- âœ… AutorizaciÃ³n: `[Authorize]` sin rol de administrador; usuarios autenticados no administradores pueden crear y editar su propio voto; administrador incluido (EPIC-04: mismos permisos).
- âœ… Identidad desde el claim `sub` del JWT; nunca desde el cuerpo (verificado por test de contrato y por smoke test).
- âœ… `AverageRating` y `RatingCount` en el detalle de Work desde los acumuladores, sin consultas a valoraciones.
- âœ… Votos de 0 estrellas: vÃ¡lidos, incrementan `RatingCount`, participan del promedio y aparecen en los listados.

### ValidaciÃ³n de acumuladores ( fÃ³rmula )
Verificado con tests de servicio y con smoke test HTTP real (obra 2, usuarios reales):
- **Primer voto**: `RatingCount 0 â†’ 1`, `AverageRating 0 â†’ 5`.
- **Voto de 0 estrellas de otro usuario**: `RatingCount 1 â†’ 2`, `AverageRating 5 â†’ 2.5` (fÃ³rmula `(n*a + s)/(n+1)` con `s = 0`).
- **EdiciÃ³n cambiando estrellas** (5 â†’ 0 y 0 â†’ 3): `RatingCount` fijo en 2, promedio `2.5 â†’ 0 â†’ 1.5` (fÃ³rmula `(n*a - anterior + nuevo)/n`). Sin divisiÃ³n por cero: la rama de creaciÃ³n cubre la obra sin votos.
- **EdiciÃ³n solo de comentario**: acumuladores intactos.
- **PrecisiÃ³n**: promedio en `double` sin truncamiento por divisiÃ³n entera (2.5, 1.5 verificados exactos); sin redondeo de persistencia.
- âœ… Flujo completo crear voto â†’ consultar detalle â†’ editar voto â†’ consultar detalle ejecutado por HTTP: 201 (avg 5, count 1) â†’ 201 mismo id (avg 5) â†’ PUT de otro usuario (avg 2.5, count 2).

### ValidaciÃ³n de autorizaciÃ³n y errores
- âœ… Sin token â†’ **401** (POST y GET).
- âœ… Usuario no administrador crea y edita su propio voto â†’ 201/200.
- âœ… Un usuario no puede editar el voto de otro: el servicio resuelve la valoraciÃ³n por (usuario autenticado, obra); no existe ruta que acepte otro usuario.
- âœ… Segunda creaciÃ³n del mismo usuario para la misma obra â†’ **mismo id** (upsert), sin duplicado; reforzado por el Ã­ndice Ãºnico en BD.
- âœ… `stars` fuera de 0â€“5 â†’ **422** (`ValidationException`).
- âœ… Obra inexistente o inactiva â†’ **404** (`BusinessNotFoundException`).
- âœ… Formato de errores vÃ­a `GlobalExceptionHandlerMiddleware` y `ApiResponse` del proyecto.

### ValidaciÃ³n de documentaciÃ³n
- âœ… `domain.md`/`domain-content.md`: entidad, relaciones, opcionalidad de `Review`, semÃ¡ntica de `Stars = 0`, acumuladores.
- âœ… `repositories.md`/`repositories-catalog.md`: operaciones, tracking, includes, ordenamiento.
- âœ… `services.md`/`services-catalog.md`: operaciones del servicio, fÃ³rmulas de acumuladores, mapeo del detalle, reutilizaciÃ³n de fila.
- âœ… `endpoints.md`/`endpoints-work-ratings.md`/`endpoints-works.md`: rutas, mÃ©todos, autenticaciÃ³n, parÃ¡metros, cuerpos, respuestas y errores; contratos coincidentes con DTO y endpoints implementados.
- âœ… La documentaciÃ³n refleja la semÃ¡ntica de `Stars = 0` y el mantenimiento de `RatingCount`/`AverageRating`.

### ValidaciÃ³n del estado de las tasks
- TASK-API-0288 â†’ `finished` con resultado de ejecuciÃ³n.
- TASK-API-0289 â†’ `finished` con resultado de ejecuciÃ³n.
- TASK-API-0290 â†’ `finished` con resultado de ejecuciÃ³n.
- TASK-API-0291 â†’ `finished` con resultado de ejecuciÃ³n.
- TASK-API-0292 â†’ `finished` con resultado de ejecuciÃ³n.
- TASK-API-0293 â†’ `finished` con este resultado.
- âœ… **Ninguna task queda en `pending`**. Todas conservan su contenido original.

### EjecuciÃ³n de pruebas y compilaciÃ³n
- `dotnet build` de la soluciÃ³n: **0 errores**.
- `dotnet test` completo: **306/306 en verde** (273 previas sin fallos antes de los cambios + 33 nuevas de WorkRating). No se detectaron fallos preexistentes: la suite pasaba 273/273 antes de esta funcionalidad.
- Smoke test HTTP end-to-end contra `http://localhost:5131` (JWT propio, usuario real, obra real): todos los casos esperados; datos eliminados y acumuladores restaurados.
- BD de desarrollo verificada tras las pruebas: 0 filas en `WorkRatings`, todas las obras activas, `RatingCount = 0` en todas, sin progreso de lectura alterado (la valoraciÃ³n nunca modifica `WorkReadingProgress`).

### Nota de convivencia con la especificaciÃ³n
US-0030 y TASK-API-0288 describÃ­an `Stars` como 1â€“5 opcional; las tasks de servicio/endpoints y la decisiÃ³n del usuario definen 0â€“5 con 0 = voto vÃ¡lido. Se implementÃ³ 0â€“5 (Dominio `int` no-nulleable, request `int?`) y quedÃ³ documentado en las tasks y en `domain-content.md`. Las reglas de US-0030 sobre "promedio solo con puntuaciÃ³n" quedan explÃ­citamente reinterpretadas por las tasks posteriores de API.

### Defectos corregidos
- ConfiguraciÃ³n EF con `WithOne()` â†’ `WithMany()` (0288).
- `Stars int?` â†’ `int` y comentarios en espaÃ±ol â†’ inglÃ©s (0288).
- Falta de cableado de `WorkRating` en `DbContext` y ausencia de migraciÃ³n (0288).
- EdiciÃ³n sobre valoraciÃ³n desactivada ahora la reactiva, evitando violar el Ã­ndice Ãºnico (0290).

---

## Corrección posterior a la validación (revisión de US-0030)

Durante la revisión de la implementación completa se detectó un defecto de concurrencia: `CreateRatingAsync` leía los acumuladores de la Work en memoria, los recalculaba y guardaba, por lo que dos votos simultáneos sobre la misma obra podían perder actualizaciones de `RatingCount`/`AverageRating`. Además, la valoración y los acumuladores no se escribían en la misma transacción.

Corregido en TASK-API-0294:

* los acumuladores se actualizan con una única sentencia `UPDATE Works` parametrizada que evalúa las fórmulas sobre los valores almacenados (sin lectura previa en memoria);
* la valoración y los acumuladores se escriben dentro de la misma transacción (`BeginTransAsync`/`CommitAsync`, con `RollbackAsync` nuevo en `IUnitOfWork`);
* la actualización de acumuladores es la primera escritura de la transacción para evitar el deadlock entre el lock compartido de la FK del insert y el lock exclusivo de la fila de `Works`;
* una petición rechazada por el índice único `(WorkId, UserId)` se recupera releyendo la valoración existente y completándola como edición;
* la corrección se verificó con tests de concurrencia nuevos (3 tests) y con la suite completa (309/309). Ver TASK-API-0294 para el detalle.
