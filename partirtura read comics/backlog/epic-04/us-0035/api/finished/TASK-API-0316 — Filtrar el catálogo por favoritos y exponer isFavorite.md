# TASK-API-0316 — Filtrar el catálogo por favoritos y exponer isFavorite

## Objetivo

Extender `GET /api/works` para filtrar por favoritos y devolver el estado de favorito de cada Work.

## Contexto obligatorio

Leer `communication.md`, `endpoints.md`, la US-0035 y las Tasks completadas que implementan la consulta del catálogo.

Inspeccionar el DTO de respuesta actual, los filtros, el ordenamiento y la paginación.

## Alcance

Agregar el parámetro opcional `isFavorite` a `GET /api/works`.

Reglas del filtro:

- `isFavorite=true`: devolver únicamente los Works favoritos del usuario autenticado.
- `isFavorite=false`: devolver todos los Works, favoritos y no favoritos.
- `isFavorite=null`: devolver todos los Works.
- Cualquier valor distinto de `true`: devolver todos los Works.

Agregar `isFavorite` a cada elemento de la respuesta.

## Reglas de consulta

- Obtener el usuario del contexto autenticado.
- Aplicar el filtro de favoritos en la consulta de base de datos, antes del conteo y la paginación.
- Calcular `totalCount`, `totalPages` y `hasNextPage` sobre el conjunto filtrado.
- Mantener el ordenamiento, los filtros y la búsqueda existentes.
- Cuando `isFavorite` no sea `true`, devolver igualmente el estado real de favorito de cada Work.
- Evitar consultas individuales adicionales por cada Work cuando pueda resolverse mediante una consulta eficiente.
- Conservar el formato de respuesta paginada existente.

## Dependencias

- US-0035.
- TASK-API-0315.
- Consulta y DTO actuales de `GET /api/works`.

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

- `isFavorite=true` devuelve solo favoritos del usuario.
- `false`, `null` u otro valor distinto de `true` no filtra el catálogo.
- Cada Work devuelve su estado `isFavorite`.
- El filtro se aplica antes de ordenar y paginar.
- La paginación informa correctamente el total del conjunto filtrado.
- Se preserva el contrato existente salvo las extensiones especificadas.

## Resultado de ejecución

Registrar rama, commit, archivos modificados, validaciones y bloqueos.

## Resultado de ejecución

**Estado**: Cumplido — criterios de aceptación verificados.

**Qué se implementó**:
- Parámetro opcional `isFavorite` en `GET /api/works` (`GetCatalogWorksRequest.isFavorite`, `bool?`).
  - `true`: devuelve únicamente los Works favoritos del usuario autenticado.
  - `false`, `null` o cualquier otro valor: no filtra el catálogo (devuelve todos los Works).
- El filtro se aplica **en la base de datos, antes del conteo, del ordenamiento y de la paginación**
  (`WorkRepository.ApplyFavoriteFilter`), de modo que `totalCount`, `totalPages` y `hasNextPage` describen
  el conjunto filtrado. Sin `userId` (o `userId <= 0`) el filtro `true` devuelve el conjunto vacío.
- `isFavorite` agregado a cada Work de la respuesta (`WorkCatalogItemDto.IsFavorite`), con el estado real
  del usuario autenticado, también cuando el filtro no está activo.
- El estado se resuelve con **una única consulta por página** (`IFavoriteRepository.GetFavoriteWorkIdsAsync`),
  sin una consulta por Work.

**Qué se cambió**:
- `api/Application/DTOs/WorkCatalogDtos.cs`: `GetCatalogWorksRequest.isFavorite` y `WorkCatalogItemDto.IsFavorite`.
- `api/Application/Helpers/WorkCardMapper.cs`: `ToCard(Work, WorkReadingProgress?, bool isFavorite = false)`.
- `api/Application/Interfaces/IWorkRepository.cs` y `api/Infrastructure/Repositories/WorkRepository.cs`:
  `GetCatalogPagedAsync` recibe `userId` e `isFavorite`; nuevo `ApplyFavoriteFilter`.
- `api/Application/Services/WorkService.cs`: pasa el filtro al repositorio y arma el estado de favorito de la
  página con una consulta batched (`GetFavoriteWorkIdsAsync`).
- `api/Application/Interfaces/IFavoriteRepository.cs` y `api/Infrastructure/Repositories/FavoriteRepository.cs`:
  nueva operación `GetFavoriteWorkIdsAsync`.
- `project/endpoints/endpoints-favorites.md` (nuevo), `project/endpoints/endpoints-works.md`,
  `project/endpoints.md`, `project/repositories.md`, `project/repositories/repositories-catalog.md`,
  `project/services.md`, `project/services/services-catalog.md`, `project/domain.md`,
  `project/domain/domain-content.md`.

**Decisiones relevantes**:
- La búsqueda, los filtros jerárquicos, el filtro por WorkType, el ordenamiento y la paginación existentes se
  conservan sin cambios; el filtro de favoritos se combina con ellos mediante AND.
- El filtro se resuelve con un subquery `EXISTS` sobre `Favorites` en la misma consulta del catálogo: no se
  cargan los favoritos en memoria y no hay N+1.
- El atributo `isFavorite` es de solo respuesta: no se agrega a ningún request.

**Notas**:
- Commit: 78330ab. Branch: feature/us-0036.
- Tests: `FavoritesIntegrationTests.Catalog_WithIsFavoriteTrue_ReturnsOnlyTheFavoritesOfTheUser`,
  `Catalog_WithIsFavoriteFalseOrNull_DoesNotFilterTheCatalog` y
  `Catalog_IsFavoriteFilter_IsAppliedBeforeCountingAndPaginating` (verifican filtro, estado por Work y
  metadatos de paginación sobre el conjunto filtrado).
- Build 0 errores; suite completa 408/408 pass.
