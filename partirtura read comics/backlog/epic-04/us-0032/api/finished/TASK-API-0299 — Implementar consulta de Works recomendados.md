# TASK-API-0299 â€” Implementar consulta de Works recomendados

## Objetivo

Implementar la consulta de Works recomendados para la US-0033, permitiendo obtener hasta 12 Works que el usuario todavÃ­a no comenzÃ³ a leer, ordenados segÃºn el criterio seleccionado.

La implementaciÃ³n debe respetar la arquitectura existente y separar responsabilidades entre Repository, Service y Controller.

## 1. Repository

Implementar en `WorkRepository` una consulta especÃ­fica para obtener los Works recomendados.

La consulta debe resolverse en base de datos, sin cargar el catÃ¡logo completo para filtrar, calcular mÃ©tricas u ordenar en memoria.

### SelecciÃ³n de Works

Considerar Ãºnicamente Works activos que no tengan progreso de lectura del usuario actual con `PercentageReading > 0`.

Verificar el modelo de dominio para asegurar que esta condiciÃ³n excluya correctamente tanto los Works en estado `Reading` como los `Completed`.

### MÃ©tricas

Obtener las siguientes mÃ©tricas para cada Work:

- **CompletedCount:** cantidad de usuarios que completaron el Work, identificados mediante `WorkReadingProgress.PercentageReading = 100`.
- **AverageRating:** promedio de `WorkRating.Stars`, considerando Ãºnicamente valoraciones activas e incluyendo los votos de cero estrellas.

Los Works sin completaciones o sin valoraciones deben permanecer elegibles.

Utilizar subconsultas correlacionadas, agrupaciones con `LEFT JOIN` u otra forma equivalente que EF Core y el proveedor MySQL del proyecto traduzcan correctamente a SQL.

### Ordenamiento

Soportar los siguientes criterios:

- `MostPopular`: `CompletedCount` descendente y `CreatedAt` descendente.
- `RecentlyAdded`: `CreatedAt` descendente.
- `MostRated`: `AverageRating` descendente y `CreatedAt` descendente.

Para `MostRated`, los Works sin valoraciones deben aparecer despuÃ©s de aquellos que sÃ­ tienen valoraciones.

En `MostPopular`, los Works sin completaciones deben permanecer al final del orden por popularidad y ordenarse entre sÃ­ por `CreatedAt` descendente.

### LÃ­mite

Devolver como mÃ¡ximo 12 Works, aplicando el filtro y el ordenamiento antes del lÃ­mite.

La consulta debe mantener los datos necesarios para construir el DTO de catÃ¡logo existente, incluidas las entidades estructurales y sus colores cuando correspondan.

## 2. Service

Implementar un mÃ©todo de servicio que:

- Reciba el identificador del usuario, cuando estÃ© autenticado, y el criterio de ordenamiento.
- Valide el criterio solicitado.
- Utilice el repositorio para obtener los resultados.
- Devuelva hasta 12 Works mediante el DTO existente o uno especÃ­fico si el contrato actual lo requiere.
- No replique la lÃ³gica SQL ni las mÃ©tricas en memoria.

Para usuarios anÃ³nimos, ejecutar la consulta sin excluir progresos de ningÃºn usuario. No utilizar un identificador de usuario enviado por el cliente como identidad autenticada.

## 3. Controller

Exponer un endpoint especÃ­fico para la consulta de recomendados, siguiendo las convenciones de rutas, respuestas y manejo de errores existentes.

El endpoint debe:

- Permitir el acceso anÃ³nimo y autenticado, segÃºn las convenciones del catÃ¡logo pÃºblico.
- Aceptar el criterio de ordenamiento mediante un parÃ¡metro de consulta.
- Utilizar `MostPopular` como criterio predeterminado si no se especifica otro.
- Obtener la identidad del usuario autenticado desde el contexto de autenticaciÃ³n.
- Devolver hasta 12 resultados con el contrato de respuesta existente.
- Rechazar criterios de ordenamiento invÃ¡lidos mediante el mecanismo de validaciÃ³n y errores del proyecto.

Documentar el endpoint en `project/endpoints.md`.

## 4. Pruebas

Implementar pruebas que verifiquen:

- ExclusiÃ³n de Works con progreso superior a cero para el usuario actual.
- InclusiÃ³n de Works sin progreso.
- InclusiÃ³n de Works con progreso de otros usuarios, cuando el usuario actual todavÃ­a no los comenzÃ³.
- CÃ¡lculo de popularidad mediante progresos al 100%.
- Promedio de valoraciones activas, incluyendo votos de cero estrellas.
- InclusiÃ³n de Works sin completaciones y sin valoraciones.
- Ordenamiento correcto para los tres criterios y sus desempates.
- LÃ­mite mÃ¡ximo de 12 resultados.
- Comportamiento para usuarios anÃ³nimos.
- Rechazo de criterios invÃ¡lidos.
- Ausencia de duplicados y consistencia de los datos devueltos.

Las pruebas deben respetar las convenciones del proyecto y limpiar los datos generados.

## 5. DocumentaciÃ³n y validaciÃ³n

Actualizar `project/repositories.md` y `project/services.md` con las responsabilidades y mÃ©todos incorporados.

Revisar que `project/endpoints.md` refleje el contrato implementado.

Validar que:

- La soluciÃ³n compila.
- Las pruebas nuevas y las existentes pasan.
- La consulta se traduce a SQL correctamente.
- No se cargan todos los Works ni se realizan consultas individuales por resultado.
- La implementaciÃ³n respeta Clean Architecture y las convenciones del proyecto.

## Criterios de aceptaciÃ³n

- Repository, Service y Controller implementados.
- Los tres criterios de ordenamiento funcionan correctamente.
- Se devuelven hasta 12 Works elegibles.
- Las mÃ©tricas se calculan en base de datos.
- Los Works sin completaciones o valoraciones pueden completar los resultados.
- La identidad del usuario se obtiene del contexto de autenticaciÃ³n.
- Las pruebas y la documentaciÃ³n quedan actualizadas.

---

## Resultado de ejecuciÃ³n

### Archivos modificados
- `api/Application/Interfaces/IWorkRepository.cs` â€” nuevo `GetRecommendedAsync`.
- `api/Infrastructure/Repositories/WorkRepository.cs` â€” consulta de recomendados con `ApplyRecommendedOrdering` (subconsultas correlacionadas en el `ORDER BY`).
- `api/Application/Constants/RecommendedSortFields.cs` (nuevo) â€” `MostPopular`, `RecentlyAdded`, `MostRated`.
- `api/Application/Constants/RecommendedWorks.cs` (nuevo) â€” `MaxResults = 12`.
- `api/Application/Interfaces/IRecommendedWorksService.cs` (nuevo) + `api/Application/Services/RecommendedWorksService.cs` (nuevo).
- `api/Api/Controllers/RecommendedWorksController.cs` (nuevo) â€” `GET /api/works/recommended`.
- `api/Api/Program.cs` y `tests/Infrastructure.Tests/Integration/IntegrationTestFixture.cs` â€” registro de `IRecommendedWorksService`.
- `tests/Infrastructure.Tests/Integration/RecommendedWorksIntegrationTests.cs` (nuevo) â€” 12 tests de integraciÃ³n.
- `tests/Infrastructure.Tests/RecommendedWorksControllerContractTests.cs` (nuevo) â€” 5 tests de contrato.
- `tests/Infrastructure.Tests/Integration/WorkRatingTestSupport.cs` â€” `PickActiveUsersAsync` ahora ordena por `CreatedAt ASC` (determinista, inmune a nuevos usuarios de prueba).
- `project/repositories.md`, `project/repositories/repositories-catalog.md`, `project/services.md`, `project/services/services-catalog.md`, `project/endpoints.md`, `project/endpoints/endpoints-recommended-works.md` (nuevo).

### ImplementaciÃ³n realizada
1. **Repositorio** (`GetRecommendedAsync(userId, sortBy, ct)`): una sola consulta `AsNoTracking` + `AsSplitQuery` con los mismos includes que el catÃ¡logo (WorkType, Cover, Publisher, Franchise/Publisher, Series/Franchise/Publisher). Filtra obras activas y, cuando hay usuario, excluye con `NOT EXISTS` las obras que tienen **cualquier** progreso de ese usuario. Ordena con subconsultas correlacionadas y aplica `Take(12)` en base despuÃ©s de filtrar y ordenar.
2. **Ordenamiento**: `MostPopular` = `SUM(PercentageReading)` DESC (popularidad ponderada, decidida por el producto); `MostRated` =primero "tiene votos activos" y luego `AVG(Stars)` DESC; `RecentlyAdded` = `CreatedAt` DESC. Todos con `CreatedAt` DESC e `Id` DESC como desempate determinista.
3. **Servicio** (`RecommendedWorksService`): valida el criterio (case-insensitive; vacÃ­o = `MostPopular`; invÃ¡lido = `ValidationException` â†’ 422), delega en el repositorio y mapea con `WorkCardMapper.ToCard` (el mapper compartido con catÃ¡logo, detalle e historial).
4. **Endpoint**: `GET /api/works/recommended`, `[Authorize]` sin rol de administrador, identidad del claim `sub` (ningÃºn `UserId` del cliente), respuesta `ApiResponse<IReadOnlyList<WorkCatalogItemDto>>` con el mismo contrato de `WorkCard` que `GET /api/works` (`myReadingProgress` siempre `null` porque una obra recomendada no tiene progreso del usuario).

### Decisiones tomadas
- **ExclusiÃ³n por cualquier progreso** (no por `PercentageReading > 0`): verificado el dominio, una obra abierta en la pÃ¡gina 1 queda `Reading` con 0 % y debe excluirse. Documentado en repositorio y endpoint.
- **Acceso**: se requiere autenticaciÃ³n, igual que el resto del catÃ¡logo (decisiÃ³n del producto); el caso anÃ³nimo de la US no aplica.
- **Popularidad ponderada** `SUM(PercentageReading)` (decisiÃ³n del producto, reemplaza el `CompletedCount` literal de la task): una obra con varios lectores al 90 % supera a una con un solo lector al 100 %.
- **Sin valoraciones al final**: EF traduce `Sum`/`Average` sobre subconsultas con `COALESCE(..., 0)`, lo que hacÃ­a indistinguibles "sin votos" y "voto de 0 estrellas". Resuelto con una clave booleana explÃ­cita (`Count(votos activos) > 0`) antes del promedio. Verificado con datos reales.
- **Contrato**: se reutiliza `WorkCatalogItemDto` (no se creÃ³ un segundo formato de `WorkCard`).
- **Datos de prueba**: con autorizaciÃ³n del usuario, se insertÃ³ en la base de desarrollo un dataset controlado (6 usuarios `rec.user1..6`, progresos con porcentajes exactos y votos) sobre obras reales, de modo que los tests son deterministas y no escriben datos. Se limpiaron los residuos de corridas de test previas (progreso y votos de pruebas) y se reconciliaron los acumuladores `RatingCount`/`AverageRating` de todas las obras; se conservaron los votos reales del usuario.

### Validaciones ejecutadas
- âœ… CompilaciÃ³n de la soluciÃ³n: 0 errores.
- âœ… Suite completa: **354/354** (337 previas + 17 nuevas), estable en 3 corridas consecutivas.
- âœ… Tests nuevos: orden ponderado (obra con 5 lectores al 97 % primero, por encima de obras con lecturas al 100 %); exclusiÃ³n de obras ya empezadas (incluida pÃ¡gina 1 con 0 %) y de obras completadas; inclusiÃ³n de obras leÃ­das por otros usuarios; `MostRated` con promedio, voto de 0 estrellas y obras sin votos al final; `RecentlyAdded`; lÃ­mite de 12; exclusiÃ³n de obras inactivas (con restauraciÃ³n); criterio por defecto e invÃ¡lido (422); datos de `WorkCard` completos y `ChangeTracker` vacÃ­o (sin lazy loading por obra); repo con filtro/orden/lÃ­mite; el progreso escrito por el servicio se refleja en la exclusiÃ³n.
- âœ… OrÃ¡culo: cada test de orden compara contra el orden esperado recalculado desde la base (robusto a los datos reales).
- âœ… Smoke test HTTP real: `MostPopular` devuelve 12 obras en el orden ponderado correcto (485 â†’ 200 mÃ¡s nueva â†’ 200 â†’ 107 â†’ 103 â†’ 102 â†’ 100 â†’ 10); `RecentlyAdded` por fecha; `MostRated` (5, 5, 5, 4.5, 3, 0 y luego las sin votos); `sortBy` en minÃºsculas funciona; `sortBy=foo` â†’ 422; sin token â†’ 401; tarjeta con `title`, `urlCover`, `series`/`franchise`/`publisher` y `myReadingProgress: null`.

### Problemas encontrados y correcciones
- **Deadlock/orden incorrecto por NULL**: MySQL trataba `SUM`/`AVG` nulos como 0 en el `ORDER BY` externo (columna derivada), lo que colocaba obras sin votos antes que una con voto de 0 estrellas. Corregido con la clave booleana "tiene votos" en `MostRated`.
- **EF `Sum((int?)x)` genera `COALESCE(SUM(x), 0)`**: el `?? -1` no aplicaba; documentado y resuelto con las claves explÃ­citas.
- Los tests existentes que eligÃ­an "los primeros N usuarios activos" se rompieron al agregar los usuarios controlados (el orden por defecto es `CreatedAt DESC`): el helper ahora ordena por `CreatedAt ASC`, restaurando el comportamiento previo.
- Residuos de corridas de test previas en la base (progreso y votos de pruebas sobre obras reales y de test): limpiados, con acumuladores reconciliados.
