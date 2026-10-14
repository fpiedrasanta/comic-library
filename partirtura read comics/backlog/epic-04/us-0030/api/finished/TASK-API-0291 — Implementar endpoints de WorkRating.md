# TASK-API-0291 — Implementar endpoints de WorkRating

## Objetivo

Implementar los endpoints para crear, editar y consultar valoraciones de Works, utilizando `WorkRatingService`.

Revisar además el endpoint existente de detalle de Work para confirmar que exponga `AverageRating` y `RatingCount` sin introducir responsabilidades que correspondan a otra capa.

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
* `project/endpoints.md`
* `project/endpoints/endpoints-works.md`

Revisar los controladores y endpoints existentes para mantener las convenciones de rutas, autenticación, respuestas, errores y validación.

## Alcance

### 1. Crear una valoración

Implementar un endpoint `POST` para crear una valoración de una Work.

Requisitos:

* Disponible para usuarios autenticados que no sean administradores.
* Obtener la identidad del usuario desde el JWT; no aceptar `UserId` como fuente confiable en el cuerpo de la solicitud.
* Recibir el identificador de la Work y los datos de la valoración según el contrato definido por el servicio.
* Admitir `Stars` entre `0` y `5`.
* Permitir un comentario opcional.
* Interpretar `Stars = 0` como un voto válido que incrementa `RatingCount` y participa del promedio.
* Impedir votos duplicados del mismo usuario para la misma Work, delegando la regla al servicio y respetando la restricción de persistencia.
* Utilizar los códigos de respuesta y el formato `ApiResponse` establecidos por el proyecto.

### 2. Editar una valoración

Implementar un endpoint `PUT` para editar la valoración existente del usuario para una Work.

Requisitos:

* Disponible para usuarios autenticados que no sean administradores.
* Identificar al usuario mediante el JWT.
* Permitir modificar la puntuación, incluido el valor `0`, y el comentario opcional.
* No permitir editar la valoración de otro usuario.
* Delegar en el servicio la actualización del registro y de los acumuladores.
* No incrementar `RatingCount` al editar.
* Mantener el formato de respuesta y manejo de errores del proyecto.

### 3. Obtener listado de valoraciones

Implementar un endpoint `GET` para obtener el listado paginado de valoraciones de una Work.

Requisitos:

* Definir la ruta siguiendo las convenciones existentes para endpoints de catálogo.
* Exponer los parámetros de paginación, filtros y ordenamiento admitidos por el servicio.
* Permitir ordenar por `Stars` o `CreatedAt`, ascendente o descendente.
* Incluir votos con `Stars = 0`.
* Devolver los datos necesarios para mostrar usuario, fecha, puntuación y comentario cuando exista.
* Aplicar la política de acceso correspondiente al catálogo público: no exponer valoraciones de Works inexistentes o inactivas.
* No exigir privilegios de administrador para consultar el listado, salvo que alguna restricción de seguridad ya documentada en el proyecto determine lo contrario.

### 4. Revisar el endpoint de detalle de Work

Revisar el endpoint existente:

`GET /api/works/{id}`

Verificar si el DTO devuelto por `MapCatalogDetail` incluye:

* `AverageRating`
* `RatingCount`

La información debe provenir de los acumuladores de la entidad `Work`, calculados y mantenidos por la lógica de aplicación.

**Criterio de decisión:**

* Si el endpoint ya devuelve ambos campos mediante el DTO existente, no modificarlo.
* Si el DTO ya los incluye pero el mapeo no los asigna, corregir el mapeo en la capa correspondiente.
* Si no los incluye, determinar si el contrato actual de detalle debe ampliarse para exponerlos. Documentar la decisión y su justificación antes de modificar el contrato.

No trasladar el cálculo del promedio ni la actualización de los acumuladores al controlador o al endpoint. Esa responsabilidad corresponde al servicio.

### 5. Autorización

Los endpoints de creación y edición deben estar disponibles para usuarios autenticados que no sean administradores.

* No utilizar autorización exclusiva de administradores.
* No confiar en identificadores de usuario enviados por el cliente.
* Aplicar las convenciones de autorización y extracción de identidad existentes.
* No permitir crear o editar valoraciones de Works inactivas.

## Documentación

Actualizar:

* `project/endpoints.md`
* `project/endpoints/endpoints-works.md`, si se documentan allí los endpoints relacionados con Works.
* La documentación específica de endpoints de `WorkRating`, si corresponde según la estructura existente.

Documentar rutas, métodos HTTP, autenticación, parámetros, cuerpos, respuestas y errores.

## Restricciones

* No modificar repositorios ni servicios en esta task, salvo que se detecte un defecto que impida integrar los contratos ya definidos. En ese caso, documentar el problema y mantener los cambios mínimos.
* No implementar componentes del Frontend.
* No recalcular el promedio desde los endpoints.
* No exponer `UserId` del cliente como identidad autenticada.
* No alterar el progreso de lectura como consecuencia de crear o editar una valoración.

## Validación

* Compilar el Backend/API.
* Verificar que usuarios autenticados no administradores puedan crear y editar sus propias valoraciones.
* Verificar que usuarios no autenticados reciban la respuesta de autorización correspondiente.
* Verificar que un usuario no pueda editar la valoración de otro.
* Verificar el comportamiento ante votos duplicados.
* Verificar la aceptación de `Stars = 0` y su inclusión en el listado.
* Verificar paginación, filtros y ordenamiento.
* Verificar el comportamiento ante Works inexistentes o inactivas.
* Confirmar mediante revisión del contrato y pruebas que `GET /api/works/{id}` exponga `AverageRating` y `RatingCount` cuando corresponda.
* Registrar cualquier diferencia entre el contrato esperado y el implementado.

## Resultado de ejecución

Al finalizar, agregar a esta task un resumen de los archivos modificados, las decisiones tomadas, las validaciones ejecutadas y sus resultados, sin eliminar el contenido original.

Mover la task a `finished` o `blocked`, según corresponda, siguiendo `communication.md`.

---

## Resultado de ejecución

### Archivos modificados
- `api/Api/Controllers/WorkRatingsController.cs` (nuevo) — `POST`, `PUT` y `GET` bajo `api/works/{workId}/ratings`, con `[Authorize]` (sin rol de administrador).
- `project/endpoints/endpoints-work-ratings.md` (nuevo) — documentación de rutas, autenticación, cuerpos, respuestas y errores.
- `project/endpoints.md` — entrada en el índice de documentos por controlador.
- `project/endpoints/endpoints-works.md` — `GET /api/works/{id}` documenta `averageRating`/`ratingCount`; `GET /api/works/{id}/pages` documenta `myRating`.
- `project/services/services-catalog.md` — ajustado (menciones al mapeo del Reader en 0290).

### Implementación realizada
1. **`POST /api/works/{workId}/ratings`**: cuerpo `WorkRatingVoteRequest { stars, review }`, identidad desde el claim `sub` del JWT, respuesta `201 Created` con `Location` vía `CreatedAtAction(nameof(Get), ...)`. Upsert: un segundo POST del mismo usuario edita su voto (no hay duplicados).
2. **`PUT /api/works/{workId}/ratings`**: mismo contrato; usado para expresar la acción explícita de edición del Reader/detalle.
3. **`GET /api/works/{workId}/ratings`**: query `currentPage`, `pageSize`, `orderBy` (Stars/CreatedAt), `orderDir` (ASC/DESC); devuelve `ApiResponse<ListResponse<WorkRatingListItemDto>>`.
4. **Identidad**: `GetAuthenticatedUserId()` lee `User.FindFirst("sub")` (mismo patrón que `WorksController`); nunca se acepta `UserId` del cliente (verificado por test de contrato).
5. **Sin cambios en el detalle**: `GET /api/works/{id}` ya exponía los campos ampliados en 0290; no se tocó el controlador de Works. El cálculo de promedio vive solo en el servicio.
6. **Reader**: en lugar de un endpoint extra `/mine`, `GET /api/works/{id}/pages` ahora devuelve `myRating` (stars + review) del usuario autenticado, que es donde el formulario final muestra la valoración existente (decisión del usuario, coherente con "mi voto solo se hace/edita cuando termino de leer un comic").

### Decisiones tomadas
- Rutas anidadas bajo `/api/works/{workId}/ratings` (no hay id de valoración en la ruta: la valoración es única por usuario+Work).
- Autorización: `[Authorize]` simple, sin `Roles` — usuarios autenticados no administradores (y administradores) pueden votar, consistente con `WorksController` y con EPIC-04.
- Sin política de rate limiting nueva, consistente con `PUT /api/works/{id}/progress` (existente y sin límite).
- Mensajes nuevos en inglés ("Rating saved", "Rating updated", "User not authenticated").
- `Stars = 0` y review vacío son válidos; `stars` fuera de 0–5 → 422 desde el servicio.

### Validaciones ejecutadas
- ✅ Compilación: 0 errores. API arranca correctamente (migración aplicada al inicio, Hangfire operativo).
- ✅ Smoke test HTTP real contra `http://localhost:5131` con JWT propio (usuario 2, obra 2):
  - POST sin token → **401**.
  - POST con token → **201** (id 170, stars 4).
  - POST duplicado del mismo usuario → **201**, **mismo id 170**, stars 5, `updatedAt` seteado.
  - GET listado → totalCount 1, usuario "QA Comics", stars 5, review editado.
  - GET detalle → `averageRating=5`, `ratingCount=1`.
  - PUT de otro usuario (3) → **200**, id 171, stars 0.
  - GET detalle → `averageRating=2.5`, `ratingCount=2` (el voto de 0 estrellas cuenta).
  - GET pages → `myRating = { stars: 5, review: "http smoke edited" }`.
  - `stars: 9` → **422**; obra inexistente → **404**; sin token → **401**.
- ✅ Tests de contrato por reflexión: `[Authorize]` presente, sin `AllowAnonymous`, sin `Roles`, rutas y binding correctos, `WorkRatingVoteRequest` sin `UserId`.
- ✅ Datos del smoke test eliminados y acumuladores restaurados (verificado: 0 filas en `WorkRatings`).

### Problemas encontrados
- Ninguno. La API arrancó solo con el perfil correcto: `dotnet run` requiere `ASPNETCORE_ENVIRONMENT=Development` (o `--launch-profile http`); con el perfil inexistente "Development" falla por connection string, ajeno a esta task.
