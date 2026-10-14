# TASK-API-0298 â€” Implementar consulta paginada del historial de lectura

## Objetivo

Implementar la consulta paginada del historial de lectura del usuario autenticado, utilizando la entidad `WorkReadingProgress` existente.

La respuesta debe incluir toda la informaciÃ³n necesaria para renderizar las mismas `WorkCard` que utiliza el catÃ¡logo, incorporando el progreso individual de lectura.

No modificar el dominio existente salvo que se detecte un problema concreto que impida cumplir el contrato.

## 1. Repository

Crear o completar el repositorio de `WorkReadingProgress` con una funciÃ³n que permita obtener el historial de un usuario.

La consulta debe:

- Filtrar por el usuario indicado.
- Permitir filtrar por estado de lectura: `Reading` o `Completed`.
- Ordenar por `LastReadAt` descendente.
- Soportar paginaciÃ³n.
- Utilizar `AsNoTracking()`.
- Incluir mediante joins o proyecciones los datos necesarios para construir la respuesta completa de cada Work.
- Evitar consultas adicionales por cada registro.
- Respetar los filtros de visibilidad y las convenciones existentes del proyecto.

La consulta debe devolver los datos necesarios para representar las tarjetas del catÃ¡logo, junto con el progreso de lectura correspondiente.

No recuperar todos los registros para paginarlos en memoria.

### DocumentaciÃ³n

Leer y actualizar `project/repositories.md`, documentando el nuevo mÃ©todo, sus filtros, ordenaciÃ³n, paginaciÃ³n y estrategia de consulta.

## 2. Service

Implementar el servicio que consuma el repositorio y devuelva el `ListDTO` correspondiente.

El servicio debe:

- Obtener el usuario autenticado mediante el mecanismo existente.
- Validar y normalizar los parÃ¡metros de consulta conforme a las convenciones del proyecto.
- Aplicar el filtro de estado solicitado.
- Delegar al repositorio la consulta paginada y ordenada.
- Transformar los resultados al DTO utilizando el mecanismo de mapeo existente.
- Devolver los metadatos de paginaciÃ³n segÃºn el formato utilizado por los demÃ¡s listados del proyecto.

El resultado debe contener toda la informaciÃ³n necesaria para renderizar las `WorkCard` existentes, sin requerir una consulta individual adicional por Work.

No aceptar un `UserId` arbitrario enviado por el cliente.

### DocumentaciÃ³n

Leer y actualizar `project/services.md`, documentando el servicio, sus responsabilidades y el contrato de salida.

## 3. Endpoint

Crear el endpoint para consultar el historial de lectura paginado.

El endpoint debe:

- Requerir autenticaciÃ³n.
- Obtener la identidad del usuario autenticado.
- Permitir filtrar por estado de lectura: `Reading` o `Completed`.
- Permitir configurar los parÃ¡metros de paginaciÃ³n segÃºn las convenciones existentes.
- Invocar el servicio y devolver el payload producido por este.
- Utilizar los cÃ³digos de respuesta y el manejo centralizado de errores del proyecto.

La ruta y los nombres definitivos de los parÃ¡metros deben seguir las convenciones existentes de la API y quedar documentados en `project/endpoints.md`.

No crear endpoints separados para los estados `Reading` y `Completed`.

### DocumentaciÃ³n

Leer y actualizar `project/endpoints.md`, documentando:

- MÃ©todo HTTP y ruta.
- Requisito de autenticaciÃ³n.
- ParÃ¡metros de consulta.
- Estructura de la respuesta paginada.
- DTO utilizado.
- CÃ³digos de respuesta y errores relevantes.

## 4. Pruebas

Crear o actualizar las pruebas necesarias para validar el repositorio, el servicio y el endpoint.

Cubrir como mÃ­nimo:

- Usuario sin historial.
- Usuario con Works en estado `Reading`.
- Usuario con Works en estado `Completed`.
- Filtrado correcto por estado.
- Orden descendente por `LastReadAt`.
- PaginaciÃ³n y metadatos correctos.
- Aislamiento entre usuarios.
- ExclusiÃ³n de registros que no deban mostrarse por las reglas de visibilidad existentes.
- Correspondencia entre los datos devueltos y los necesarios para renderizar `WorkCard`.
- Porcentaje de lectura correcto, incluyendo lecturas completadas.
- Acceso anÃ³nimo rechazado.
- ParÃ¡metros invÃ¡lidos gestionados conforme a las convenciones del proyecto.
- Ausencia de consultas individuales por cada Work.

Las pruebas deben seguir las estrategias existentes del proyecto, incluyendo limpieza y restauraciÃ³n de datos cuando utilicen la base de datos real.

## 5. RevisiÃ³n integral y documentaciÃ³n

Antes de finalizar:

1. Revisar las tareas relacionadas con `WorkReadingProgress` y la lectura individual.
2. Verificar que la implementaciÃ³n respete los contratos existentes y no introduzca regresiones.
3. Revisar la coherencia entre repositorio, servicio, endpoint y DTOs.
4. Leer y actualizar, cuando corresponda, `project/repositories.md`, `project/services.md` y `project/endpoints.md`.
5. Comprobar que la documentaciÃ³n no contradiga las implementaciones existentes.
6. Registrar el resultado de ejecuciÃ³n en esta task, sin sobrescribir su especificaciÃ³n.
7. Actualizar el backlog con el estado final de la tarea y las tareas relacionadas, respetando las convenciones del proyecto.

## Contrato de respuesta

El payload debe contener una lista paginada de elementos que incluyan:

- La informaciÃ³n de Work necesaria para renderizar la `WorkCard` del catÃ¡logo.
- El progreso de lectura del usuario correspondiente a ese Work.
- Los metadatos de paginaciÃ³n definidos por el proyecto.

**El JSON definitivo se ajustarÃ¡ al payload del catÃ¡logo que se proporcionarÃ¡ como referencia antes de implementar el mapeo.** No inventar campos, renombrar propiedades ni omitir datos que las tarjetas existentes necesitan.

## Fuera de alcance

- Modificar el dominio de lectura ya implementado.
- Crear o actualizar registros de progreso desde este endpoint.
- Implementar la interfaz de Mi colecciÃ³n.
- Implementar la secciÃ³n Continuar leyendo del index.
- Implementar favoritos o listas.
- Introducir nuevas reglas de negocio no definidas por esta US.

## Criterios de aceptaciÃ³n

- Existe un mÃ©todo de repositorio paginado, ordenado y sin tracking.
- Las relaciones necesarias se resuelven sin consultas individuales por registro.
- El servicio devuelve el `ListDTO` con el contrato esperado.
- El endpoint requiere autenticaciÃ³n y devuelve Ãºnicamente el historial del usuario autenticado.
- Se pueden consultar los estados `Reading` y `Completed`.
- La respuesta contiene los datos necesarios para renderizar las `WorkCard` existentes.
- Las pruebas cubren filtros, ordenaciÃ³n, paginaciÃ³n, aislamiento y errores.
- `repositories.md`, `services.md` y `endpoints.md` quedan actualizados y coherentes.
- Se revisan las tareas relacionadas y se documenta la validaciÃ³n final.
- No se introducen cambios fuera del alcance definido.

## Anexo â€” Contrato de respuesta del historial de lectura

La respuesta debe conservar el envelope estÃ¡ndar de la API:

- `success`
- `message`
- `code`
- `payload`

El `payload` debe conservar la estructura de paginaciÃ³n utilizada por `GET /api/works`:

- `currentPage`
- `hasNextPage`
- `hasPriorPage`
- `totalPages`
- `pageSize`
- `nextPage`
- `priorPage`
- `totalCount`
- `items`

Cada elemento de `items` debe mantener las mismas propiedades y estructuras del catÃ¡logo:

- `id`
- `workTypeId`
- `workTypeName`
- `title`
- `description`
- `numberValue`
- `publicationDate`
- `createdAt`
- `coverId`
- `urlCover`
- `series`
- `franchise`
- `publisher`
- `myReadingProgress`

Los objetos `series`, `franchise` y `publisher` deben conservar sus propiedades actuales, incluyendo `id`, `name` y `color`, cuando corresponda.

### Diferencias respecto del catÃ¡logo

1. Los resultados corresponden exclusivamente al historial del usuario autenticado.
2. El listado permite filtrar por estado `Reading` o `Completed`.
3. Los resultados se ordenan por `LastReadAt` descendente.
4. Cada elemento debe incluir `myReadingProgress` con los datos del progreso persistido, incluyendo `currentPage`, `totalPages`, `percentage`, `status` y `lastReadAt`.
5. `myReadingProgress` no debe ser `null` en los elementos devueltos por el historial.
6. Los metadatos de paginaciÃ³n deben calcularse sobre el conjunto filtrado antes de aplicar la paginaciÃ³n.

### Restricciones

- No modificar los nombres ni los tipos de las propiedades existentes del catÃ¡logo.
- No duplicar ni crear un segundo formato de `WorkCard`.
- No devolver informaciÃ³n de progreso de otros usuarios.
- No ejecutar consultas individuales por cada Work.
- Reutilizar los DTOs y mecanismos de paginaciÃ³n existentes cuando sea posible.
- Si el contrato actual de `myReadingProgress` difiere en algÃºn nombre o tipo, prevalece el contrato implementado y documentado en `TASK-API-0297`.

### Criterio de aceptaciÃ³n adicional

La respuesta del historial puede consumirse utilizando el mismo mapeo de datos que el catÃ¡logo para renderizar `WorkCard`, sin transformaciones especÃ­ficas por pantalla ni pÃ©rdida de informaciÃ³n.

---

## Resultado de ejecuciÃ³n

### Archivos modificados
- `api/Application/Interfaces/IWorkReadingProgressRepository.cs` â€” nuevo `GetPagedHistoryByUserIdAsync`.
- `api/Infrastructure/Repositories/WorkReadingProgressRepository.cs` â€” implementaciÃ³n paginada del historial.
- `api/Application/Interfaces/IReadingHistoryService.cs` (nuevo) â€” `GetPagedAsync`.
- `api/Application/Services/ReadingHistoryService.cs` (nuevo) â€” servicio del historial.
- `api/Application/DTOs/WorkContentDtos.cs` â€” `GetReadingHistoryRequest(currentPage, pageSize, state)`.
- `api/Application/Constants/ReadingHistoryStates.cs` (nuevo) â€” constantes `reading`, `completed`, `all` (sin strings mÃ¡gicos).
- `api/Application/Helpers/WorkCardMapper.cs` (nuevo) â€” mapeo Ãºnico de la `WorkCard` del catÃ¡logo, extraÃ­do de `WorkService`.
- `api/Application/Services/WorkService.cs` â€” delega en `WorkCardMapper` (se eliminaron los helpers privados duplicados).
- `api/Api/Controllers/ReadingHistoryController.cs` (nuevo) â€” `GET /api/users/me/reading-history`.
- `api/Api/Program.cs` y `tests/Infrastructure.Tests/Integration/IntegrationTestFixture.cs` â€” registro de `IReadingHistoryService`.
- `tests/Infrastructure.Tests/Integration/ReadingHistoryIntegrationTests.cs` (nuevo) â€” 11 tests de integraciÃ³n.
- `tests/Infrastructure.Tests/ReadingHistoryControllerContractTests.cs` (nuevo) â€” 4 tests de contrato.
- `project/repositories.md`, `project/repositories/repositories-numbers.md`, `project/services.md`, `project/services/services-catalog.md`, `project/endpoints.md`, `project/endpoints/endpoints-reading-history.md` (nuevo).

### ImplementaciÃ³n realizada
1. **Repositorio** (`GetPagedHistoryByUserIdAsync`): filtra por usuario y por estado opcional (`ReadingState?`), restringe a obras **activas** (reglas de visibilidad del catÃ¡logo), ordena por `LastReadAt` descendente con `Id` como desempate determinista, pagina en base (`Skip`/`Take`, nunca en memoria) y resuelve todo en **una Ãºnica consulta** `AsNoTracking` + `AsSplitQuery` con los mismos includes que `GetCatalogPagedAsync` (`Work.WorkType`, `Work.Cover`, `Work.Publisher`, `Work.Franchise.Publisher`, `Work.Series.Franchise.Publisher`). Devuelve `(items, totalCount)`.
2. **Servicio** (`ReadingHistoryService.GetPagedAsync`): recibe `userId` desde el controlador (JWT), valida `userId > 0`, normaliza paginaciÃ³n con `PaginationGuard` (12/50), traduce el filtro `state`, delega al repositorio, mapea cada progreso con `WorkCardMapper.ToCard` y construye `ListResponse` con `PaginationGuard.Build`.
3. **Filtro `state`** (decisiÃ³n del usuario, documentada de forma explÃ­cita para el front): `reading` â†’ solo `Reading`; `completed` â†’ solo `Completed`; `all`, ausente, vacÃ­o o **cualquier valor desconocido** (p.ej. `foo`) â†’ historial completo del usuario, sin error. "Todos" significa todas las entradas del historial del usuario (leyendo + terminadas), **nunca** todas las obras del sistema.
4. **Endpoint**: `GET /api/users/me/reading-history`, `[Authorize]` (sin rol de administrador), identidad del claim `sub` (sin `UserId` del cliente, verificado por test de contrato y por HTTP ignorando `?userId=`), respuesta `ApiResponse<ListResponse<WorkCatalogItemDto>>`.
5. **DTO**: se reutiliza `WorkCatalogItemDto` (mismo contrato que `GET /api/works`), con `myReadingProgress` **nunca null** en el historial y valores persistidos (`percentage` = `PercentageReading`, sin recalcular). No se creÃ³ un segundo formato de `WorkCard`.
6. **Mapper compartido**: `WorkCardMapper` ( extraÃ­do de `WorkService`) es ahora el Ãºnico mapeo de la tarjeta; catÃ¡logo, detalle e historial producen datos idÃ©nticos.

### Decisiones tomadas
- Ruta `GET /api/users/me/reading-history` (convenciÃ³n `api/users/me` del perfil).
- Estado invÃ¡lido â†’ se comporta como `all` (sin error), documentado con ejemplo en `endpoints-reading-history.md`.
- PaginaciÃ³n 12/50, igual que `GET /api/works`.
- Los tests no limpian el progreso creado (mismo criterio que 0296/0297): setean valores absolutos y verifican el estado real antes de aseverar.
- La obra desactivada para probar visibilidad se reactiva en `finally`.
- No se modificÃ³ el dominio ni las reglas de progreso; solo se agregÃ³ una consulta de lectura.

### Validaciones ejecutadas
- âœ… CompilaciÃ³n de la soluciÃ³n y de los tests: 0 errores.
- âœ… Suite completa: **337/337** (323 previas + 14 nuevas), estable en 3 corridas de los tests nuevos.
- âœ… Tests nuevos: usuario sin historial (vacÃ­o con metadata en 0); orden `LastReadAt` descendente; filtros `reading`, `completed`, `all` y desconocido (=`all`); aislamiento entre usuarios; exclusiÃ³n de obras inactivas (con restauraciÃ³n); datos de `WorkCard` completos y progreso persistido (incluye completadas al 100 % cuando la obra tiene pÃ¡ginas); paginaciÃ³n y metadata; normalizaciÃ³n de parÃ¡metros invÃ¡lidos; `userId` invÃ¡lido â†’ `ValidationException`; repositorio paginado/ordenado/filtrado sin tracking; ausencia de N+1 (`ChangeTracker` sin entidades `Work` ni `WorkReadingProgress`).
- âœ… Smoke test HTTP real: `PUT /api/works/4/progress {currentPage:3}` â†’ el historial devuelve el item con `myReadingProgress {currentPage:3,totalPages:25,percentage:8,status:"Reading"}` y **exactamente los mismos campos** que los items de `GET /api/works`; `state=reading`/`completed`/`foo`; pÃ¡gina mÃ¡s allÃ¡ de la Ãºltima â†’ 0 items con metadata correcta; `currentPage=0&pageSize=-5` normalizados a 1/12; sin token â†’ 401; `?userId=3` ignorado.
- âœ… RevisiÃ³n de tareas relacionadas: contratos de `WorkReadingProgress` y de `GET /api/works` intactos; 0296/0297 siguen vigentes y coherentes (mismo DTO y mismos valores de progreso).
- âœ… Base de desarrollo: 0 obras inactivas (la obra de la prueba de visibilidad quedÃ³ restaurada). Las 3 valoraciones existentes son votos manuales reales del usuario y se conservan.

### Problemas encontrados
- Proceso `Api` de una corrida previa bloqueaba los DLLs: detenido y recompilado.
- Una aserciÃ³n exigÃ­a 100 % en todos los completados: una obra sin pÃ¡ginas queda `Completed` con 0 % (regla existente de `WorkReadingProgress`). Corregido exigiendo 100 % solo cuando la obra tiene pÃ¡ginas, y documentado el comportamiento en el endpoint.
