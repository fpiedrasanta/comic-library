# TASK-API-0319 — Filtrar listas del catálogo por propietario

## Objetivo

Extender `GET /api/catalog/lists` con el parámetro opcional `myLists`, sin modificar el comportamiento actual de las listas del sistema.

## Contrato

Request existente:

`GET /api/catalog/lists?currentPage=1&pageSize=24`

Nuevo parámetro:

`myLists` (boolean, opcional).

Reglas:

- `myLists=true`: devolver únicamente listas personales del usuario autenticado.
- Cualquier otro caso (`false`, omitido, `null` o valor no reconocido): devolver únicamente listas del sistema.
- Mantener los parámetros de paginación existentes y el contrato actual de respuesta.

## Reglas de negocio

- Las listas personales deben filtrarse por el usuario autenticado, no por un identificador de propietario enviado por el cliente.
- Las listas del sistema deben seguir identificándose mediante `OwnerType` y los criterios existentes del proyecto.
- Aplicar el filtro en la consulta a base de datos antes de contar resultados y paginar.
- No mezclar listas personales y del sistema en una misma respuesta.

## Criterios de aceptación

- `myLists=true` devuelve solamente las listas personales del usuario autenticado.
- `myLists=false` devuelve solamente listas del sistema.
- Sin el parámetro se conserva el comportamiento actual.
- Un valor no reconocido no habilita la consulta de listas personales ni produce un error de conversión.
- El total de resultados y la paginación corresponden al conjunto filtrado.
- Los contratos existentes continúan funcionando sin cambios incompatibles.

## Implementación

Revisar los endpoints, servicios, repositorios y contratos existentes antes de modificar código. Reutilizar la consulta y los mecanismos de paginación actuales.

## Git y ejecuciÃ³n

1. `git checkout main` â†’ `git pull`.
2. Comprobar la rama:
   `git branch --list "feature/us-0036-api"`

   Si existe: `git switch feature/us-0036-api` â†’ `git merge main`.

   Si no existe: `git switch -c feature/us-0036-api`.

3. Implementar los cambios de esta task.
4. Revisar `git diff`.
5. Ejecutar las validaciones disponibles y comprobar compilaciÃ³n y regresiones detectables.
6. Crear uno o mÃ¡s commits y publicar los cambios en la rama de trabajo.
7. Registrar el resultado en esta misma task mediante **append**, sin sobrescribir el contenido previo.
8. Mover el archivo a `finished` o `blocked` conforme a `communication.md`, documentando los resultados y los pendientes.

## Resultado de ejecución

**Estado**: Cumplido — criterios de aceptación verificados.

**Qué se implementó**:
- `GET /api/catalog/lists` acepta el nuevo parámetro opcional `myLists`.
  - `myLists=true`: devuelve únicamente las listas personales del usuario autenticado (`OwnerType = User` y
    `Owner.Id = userId`).
  - Cualquier otro valor (`false`, omitido, vacío o no reconocido): devuelve únicamente las listas del sistema
    (`OwnerType = System`), que es el comportamiento previo.
- El filtro se aplica **en la base de datos, antes de contar y de paginar** (`ApplyPersonalListsFilter` /
  `ApplySystemListsFilter` en `WorkListRepository`), por lo que `totalCount`, `totalPages` y `hasNextPage`
  describen el conjunto filtrado.
- Las listas personales y las del sistema nunca se mezclan en una misma respuesta.
- El propietario se resuelve **siempre** con el usuario autenticado; el cliente no puede enviar un identificador
  de propietario.

**Qué se cambió**:
- `api/Application/DTOs/CatalogListDtos.cs`: `GetCatalogListsRequest.myLists`.
- `api/Application/Services/WorkListService.cs`: `IsMyListsRequest` y paso del flag al repositorio.
- `api/Infrastructure/Repositories/WorkListRepository.cs`: `GetCatalogPagedAsync` recibe `bool myLists` y aplica
  el filtro correspondiente.
- `project/endpoints/endpoints-catalog.md`, `project/repositories/repositories-catalog.md`.

**Decisiones relevantes**:
- `myLists` se declara como `string?` y no como `bool?`: el criterio de la US es que **cualquier valor distinto
  de `true`** devuelva las listas del sistema "sin producir un error de conversión". Con un `bool?` el binder del
  framework agregaría un error de ModelState y el endpoint respondería 400 por la
  `InvalidModelStateResponseFactory` del proyecto. Como `string?`, un valor no reconocido nunca falla y se
  interpreta como "no es `true`" (comparación case-insensitive).
- No se toca el resto de los filtros, del ordenamiento ni de la paginación: el filtro de propietario se combina
  con ellos mediante AND.

**Notas**:
- Commit: `8f989cd`. Branch: `feature/us-0036-api`.
- Tests: `CatalogLists_WithMyListsTrue_ReturnsOnlyThePersonalListsOfTheUser` (devuelve solo las listas
  personales del usuario y no las de otro usuario) y `CatalogLists_WithoutMyLists_KeepsReturningOnlyTheSystemLists`
  (`null`, `false`, `not-a-boolean` y vacío devuelven el mismo total de listas del sistema y nunca una lista
  personal).
- Se actualizó `CatalogControllerContractTests` para incluir el nuevo parámetro `myLists` en el contrato del
  request.