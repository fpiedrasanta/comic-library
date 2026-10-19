# TASK-API-0317 — Exponer isFavorite en historial y recomendaciones

## Objetivo

Incorporar el estado de favorito del usuario autenticado en las respuestas de historial de lectura y Works recomendados.

## Contexto obligatorio

Leer `communication.md`, `endpoints.md`, la US-0035 y las Tasks completadas que implementan:

- `GET /api/users/me/reading-history`
- `GET /api/works/recommended`

Inspeccionar sus DTO, consultas, servicios, ordenamiento y paginación.

## Alcance

Agregar `isFavorite` a cada Work devuelto por:

- `GET /api/users/me/reading-history`
- `GET /api/works/recommended`

**El atributo es exclusivamente de respuesta.** No agregar `isFavorite` al request ni modificar los parámetros existentes de estos endpoints.

## Reglas

- Calcular el estado para el usuario autenticado.
- No aceptar una identidad de usuario enviada por el cliente para determinar los favoritos.
- Mantener los filtros, parámetros, ordenamiento, paginación y demás campos actuales.
- Evitar consultas individuales adicionales por cada Work.
- No modificar las reglas de progreso de lectura ni las de recomendación.
- Mantener el formato de respuesta existente.

## Dependencias

- US-0035.
- TASK-API-0315.
- DTO y consultas existentes de historial y recomendaciones.

## Git y ejecución

1. `git checkout main` → `git pull`.
2. Comprobar la rama:
   `git branch --list "feature/us-0036"`

   Si existe: `git switch feature/us-0036` → `git merge main`.

   Si no existe: `git switch -c feature/us-0036`.

3. Implementar los cambios de esta task.
4. Revisar `git diff`.
5. Ejecutar las validaciones disponibles y comprobar compilación y regresiones detectables.
6. Crear uno o más commits y publicar los cambios en la rama de trabajo.
7. Registrar el resultado en esta misma task mediante **append**, sin sobrescribir el contenido previo.
8. Mover el archivo a `finished` o `blocked` conforme a `communication.md`, documentando los resultados y los pendientes.

## Criterios de aceptación

- Ambos endpoints devuelven `isFavorite` por Work.
- El atributo no se incorpora a sus requests.
- El valor corresponde al usuario autenticado.
- Se conservan los contratos y comportamientos restantes.
- No se introduce una consulta individual por Work que degrade el rendimiento.

## Resultado de ejecución

Registrar rama, commit, archivos modificados, validaciones y bloqueos.

## Resultado de ejecución

**Estado**: Cumplido — criterios de aceptación verificados.

**Qué se implementó**:
- `isFavorite` agregado a cada Work devuelto por `GET /api/users/me/reading-history` y por
  `GET /api/works/recommended`, con el estado del usuario autenticado.
- El atributo es **exclusivamente de respuesta**: no se modificó ningún parámetro, filtro, ordenamiento,
  paginación ni cuerpo de request de ambos endpoints.
- El estado se resuelve con **una única consulta por página/lista**
  (`IFavoriteRepository.GetFavoriteWorkIdsAsync`), nunca con una consulta por Work.

**Qué se cambió**:
- `api/Application/Services/ReadingHistoryService.cs`: batch de favoritos de la página y mapeo de `isFavorite`.
- `api/Application/Services/RecommendedWorksService.cs`: ídem para la lista de recomendados.
- `project/endpoints/endpoints-reading-history.md`, `project/endpoints/endpoints-recommended-works.md`,
  `project/endpoints/endpoints-favorites.md`, `project/services.md`, `project/services/services-catalog.md`.

**Decisiones relevantes**:
- La identidad del usuario sigue viniendo exclusivamente del contexto autenticado (`userId` resuelto en el
  controller desde el claim `sub`); no se acepta ninguna identidad enviada por el cliente.
- No se modificaron las reglas de progreso de lectura ni las de recomendación: solo se agrega un atributo
  de salida.

**Notas**:
- Commit: 78330ab. Branch: feature/us-0036.
- Tests: `FavoritesIntegrationTests.ReadingHistory_ExposesTheFavoriteStateOfEveryWork` y
  `RecommendedWorks_ExposeTheFavoriteStateOfEveryWork`.
- Build 0 errores; suite completa 408/408 pass.
