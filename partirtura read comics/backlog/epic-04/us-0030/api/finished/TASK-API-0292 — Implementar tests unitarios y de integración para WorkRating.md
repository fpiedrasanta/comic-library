# TASK-API-0292 â€” Implementar tests unitarios y de integraciÃ³n para WorkRating

## Objetivo

Implementar tests unitarios y de integraciÃ³n para las operaciones de `WorkRating` desarrolladas en las tasks API-0288 a API-0291.

## Contexto obligatorio

Leer:

* `backend-agent.md`
* `project.md`
* `backend-architecture.md`
* `backend-stack-technology.md`
* `backend-coding-rules.md`
* `communication.md`
* Las implementaciones de Domain, Repository, Service y Endpoints de `WorkRating`.
* Los tests existentes de entidades, servicios, repositorios y controladores relacionados con Works.

Seguir las convenciones y herramientas de testing ya adoptadas por el proyecto.

## Alcance

### 1. Tests unitarios del servicio

Cubrir, como mÃ­nimo:

* Crear una valoraciÃ³n nueva.
* Editar la valoraciÃ³n existente del mismo usuario y Work.
* Conservar `CreatedAt` y actualizar `UpdatedAt` al editar.
* Admitir puntuaciones entre 0 y 5.
* Permitir un voto sin comentario.
* Incrementar `RatingCount` al crear un voto, incluso con `Stars = 0`.
* No incrementar `RatingCount` al editar.
* Actualizar correctamente `AverageRating` cuando cambia la puntuaciÃ³n.
* No modificar los acumuladores cuando solo cambia el comentario.
* Actualizar correctamente el promedio al editar un voto de 0 estrellas o al cambiar una puntuaciÃ³n a 0.
* Mantener el promedio en 0 cuando no existen votos.
* Manejar correctamente el primer voto.
* Gestionar las puntuaciones invÃ¡lidas segÃºn las validaciones del servicio.

### 2. Tests unitarios de MapCatalogDetail

Verificar que el DTO de detalle de Work incluya:

* `AverageRating`.
* `RatingCount`.

Comprobar los casos de Works sin votos y con votos, incluidos los de cero estrellas.

### 3. Tests de integraciÃ³n del repositorio

Verificar:

* Crear y editar entidades `WorkRating`.
* Obtener una valoraciÃ³n por Id.
* Obtener una valoraciÃ³n por usuario y Work.
* Listar valoraciones con paginaciÃ³n.
* Filtrar por Work y por Stars, cuando corresponda.
* Ordenar por `Stars` y `CreatedAt`, ascendente y descendente.
* Incluir los datos de usuario necesarios para el listado.
* Incluir votos de cero estrellas.
* Respetar la restricciÃ³n de una Ãºnica valoraciÃ³n por usuario y Work.

### 4. Tests de integraciÃ³n de los endpoints

Verificar:

* Crear una valoraciÃ³n.
* Editar una valoraciÃ³n propia.
* Consultar el listado paginado.
* Obtener el promedio y la cantidad de votos en el detalle de Work.
* Rechazar solicitudes no autenticadas.
* Permitir las operaciones a usuarios autenticados no administradores.
* Impedir que un usuario edite el voto de otro.
* Gestionar votos duplicados y datos invÃ¡lidos.
* Rechazar operaciones sobre Works inexistentes o inactivas.
* Obtener respuestas coherentes despuÃ©s de crear o editar una valoraciÃ³n.

## Restricciones

* No modificar la lÃ³gica de producciÃ³n para hacer pasar un test sin justificar el cambio.
* No reemplazar los tests existentes.
* No duplicar pruebas ya cubiertas sin una razÃ³n concreta.
* Utilizar datos de prueba que permitan comprobar los cÃ¡lculos con resultados conocidos.
* Incluir expresamente escenarios con `Stars = 0`.

## ValidaciÃ³n

* Ejecutar los tests nuevos.
* Ejecutar los tests existentes afectados.
* Compilar la soluciÃ³n.
* Registrar los resultados, fallos y limitaciones del entorno de ejecuciÃ³n.

## Resultado de ejecuciÃ³n

Agregar al final un resumen de los archivos modificados, los escenarios cubiertos y los resultados de las ejecuciones, sin eliminar el contenido original.

Mover la task a `finished` o `blocked`, segÃºn corresponda, siguiendo `communication.md`.

---

## Resultado de ejecuciÃ³n

### Archivos modificados
- `tests/Infrastructure.Tests/Integration/WorkRatingTestSupport.cs` (nuevo) â€” soporte sobre datos reales de desarrollo.
- `tests/Infrastructure.Tests/Integration/WorkRatingServiceIntegrationTests.cs` (nuevo) â€” 16 tests del servicio.
- `tests/Infrastructure.Tests/Integration/WorkRatingRepositoryIntegrationTests.cs` (nuevo) â€” 6 tests del repositorio.
- `tests/Infrastructure.Tests/Integration/WorkRatingDetailIntegrationTests.cs` (nuevo) â€” 5 tests de `MapCatalogDetail` y del Reader.
- `tests/Infrastructure.Tests/WorkRatingsControllerContractTests.cs` (nuevo) â€” 7 tests de contrato del controlador.

### Cobertura implementada (33 tests nuevos)
**Servicio** (integraciÃ³n a MySQL real): primer voto; `Stars = 0` como voto vÃ¡lido que incrementa acumuladores y aparece en el listado; `null` normalizado a 0; review con solo espacios guardada como `null`; segundo guardado edita el mismo registro (mismo Id, `CreatedAt` preservado, `UpdatedAt` > `CreatedAt`, `RatingCount` sin cambios, promedio 4 â†’ 5); ediciÃ³n solo de comentario sin alterar acumuladores; ediciÃ³n hacia y desde 0 estrellas (5 â†’ 2.5 â†’ 0 â†’ 1.5 con `RatingCount` fijo en 2); scores -1 y 6 â†’ `ValidationException` sin crear registro; obra inexistente, usuario inexistente y obra inactiva â†’ `BusinessNotFoundException`; listado con orden por `Stars` y `CreatedAt` ascendente/descendente con desempate determinista por `Id`, paginaciÃ³n (pÃ¡ginas 1-3 de 2, 2 y 1 elementos, `HasNextPage`/`HasPriorPage`, sin duplicados entre pÃ¡ginas, mÃ¡s allÃ¡ de la Ãºltima hoja vacÃ­a), `totalCount`, identidad del votante y presencia de votos de 0 estrellas; obra inexistente/inactiva en el listado â†’ 404.

**Repositorio**: `GetByIdAsync` devuelve entidad rastreada con navegaciones por Lazy Loading (se muta y persiste); `GetByUserIdAndWorkIdAsync` encuentra el par y devuelve `null` para otras combinaciones; listado ordenado por ambos campos y direcciones con desempate por `Id`; filtro por obra; exclusiÃ³n de valoraciones inactivas; rechazo de duplicado por el Ã­ndice Ãºnico `(WorkId, UserId)` (`DbUpdateException`).

**Detalle del catÃ¡logo / Reader**: obra con votos (5, 4, 0) â†’ `RatingCount = 3`, `AverageRating = 3` desde los acumuladores; obra sin votos â†’ `0` y `0`; `GET /api/works/{id}/pages` devuelve `myRating` (stars + review) del usuario con voto, `null` para usuario sin voto y `null` para peticiÃ³n anÃ³nima.

**Contrato del controlador** (reflexiÃ³n): exige autenticaciÃ³n, no exige rol administrador, ruta `api/works/{workId}/ratings`, binding de cuerpo/query, y `WorkRatingVoteRequest` sin `UserId`.

### Decisiones tomadas
- **Sin datos de prueba artificiales**: los tests usan obras y usuarios reales de la BD de desarrollo (`comiclibrary_dev`), como el resto de la suite. Cada test solo elimina fÃ­sicamente las filas que Ã©l mismo creÃ³ (vÃ­a `ApplicationDbContext`) y restaura los acumuladores de la obra a su valor previo, verificado al final: 0 filas en `WorkRatings` y 0 obras con acumuladores distintos de 0.
- Las aserciones de orden se hacen sobre el contrato real (secuencia de puntuaciones + desempate por `Id`, y serie ordenada por `CreatedAt`/`Id`) en lugar de suponer que los ids autoincrementales siguen el orden de inserciÃ³n (MySQL no lo garantiza tras vaciar la tabla) ni que dos `CreatedAt` consecutivos difieran a precisiÃ³n de microsegundo.
- Los usuarios se re-consultan como entidades rastreadas dentro del mismo scope antes de insertar (una entidad desconectada con navegaciones cargadas hacÃ­a que EF intentara reinsertar `countries`).
- Tests "unitarios" con mocks: no aplican, el stack no incluye framework de mocking; el comportamiento del servicio se cubre a nivel de integraciÃ³n real (convenciÃ³n del proyecto, confirmada por el usuario). Los tests HTTP end-to-end se ejecutan manualmente por el usuario.
- ComparaciÃ³n de fechas con tolerancia de 1 ms: MySQL `datetime(6)` trunca a microsegundos.

### Validaciones ejecutadas
- âœ… `dotnet test` filtrado WorkRating: **33/33 en verde**.
- âœ… Suite completa: **306/306 en verde** (273 previas + 33 nuevas), sin tests omitidos.
- âœ… BD de desarrollo sin datos residuales tras la corrida (verificado con SQL).
- âœ… Smoke test HTTP end-to-end ejecutado con Ã©xito (ver TASK-API-0291).

### Problemas encontrados y correcciones
- ConfiguraciÃ³n previa de entidades/conexiones: ver 0288. Scrambling de ids autoincrementales y colisiones de `CreatedAt` a microsegundo: corregidos con aserciones basadas en el contrato (documentado arriba).
- Quedaron 5 filas residuales de una primera corrida abortada (helper previo que creaba datos de prueba, descartado a pedido del usuario): eliminadas manualmente y verificada la BD limpia.
