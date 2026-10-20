# TASK-API-0323 — Validar e integrar la administración de listas personales

## Objetivo

Verificar la integración de las operaciones de listas personales y asegurar que las listas del sistema mantienen su comportamiento previo.

## Alcance de validación

Verificar conjuntamente:

- `GET /api/catalog/lists` con `myLists`.
- Creación de listas personales.
- Edición de nombres.
- Eliminación física de listas y sus detalles.
- Incorporación y eliminación de obras.
- Actualización del orden.
- Persistencia de la portada predeterminada.
- Asociación del propietario autenticado.
- Separación entre listas personales y listas del sistema.

## Casos funcionales y de seguridad

- Un usuario solo consulta y administra sus propias listas.
- No se pueden modificar listas del sistema con endpoints personales.
- Los valores de propietario, visibilidad y tipo no pueden falsificarse desde el cliente.
- Eliminar una lista o quitar una obra no elimina entidades `Work`.
- Los registros `WorkListItem` se eliminan físicamente en las operaciones correspondientes.
- La portada de una lista no comparte una referencia editable que provoque modificaciones en otras listas.
- La paginación y los conteos siguen siendo correctos.
- Las operaciones fallidas no dejan datos parcialmente modificados.

## Git y ejecución

1. Leer `communication.md` y las instrucciones vigentes del agente Backend/API.
2. Actualizar la rama principal desde el remoto.
3. Trabajar sobre la rama correspondiente a US-0036, respetando el flujo definido en `communication.md`.
4. Revisar los cambios mediante `git diff`.
5. Ejecutar las pruebas disponibles, validaciones de compilación y pruebas de regresión.
6. Corregir los problemas encontrados, revisar nuevamente el diff y repetir las validaciones afectadas.
7. Confirmar que las migraciones y restricciones de base de datos sean compatibles con los datos existentes.
8. Realizar commits y push según las convenciones del proyecto.
9. Agregar los resultados al final de esta task sin sobrescribir el contenido anterior.
10. Mover la task a `finished` o `blocked` según `communication.md`, documentando resultados y pendientes.

## Criterios de aceptación

- Los endpoints funcionan de manera integrada.
- Las pruebas cubren los casos exitosos, errores de validación, autorización y regresión.
- Las listas del sistema conservan su comportamiento anterior.
- La compilación y las validaciones aplicables finalizan correctamente.
- Los resultados, commits, pruebas y estado final quedan documentados en esta task.

## Integración final en main

**Realizar estos pasos únicamente cuando todas las validaciones sean satisfactorias y no existan bloqueos pendientes.**

1. Confirmar que todos los cambios de la US-0036 estén committeados y publicados en `feature/us-0036-api`.
2. Cambiar a `main` y actualizarla desde el remoto.
3. Integrar `feature/us-0036-api` en `main`.
4. Resolver cualquier conflicto, si existiera, y repetir las validaciones afectadas.
5. Confirmar que el resultado integrado en `main` compila y que las pruebas pasan.
6. Publicar `main` en el remoto.
7. Eliminar la rama de la US local y remota únicamente después de verificar que la integración fue exitosa y que no se perderán cambios.
8. Registrar los commits integrados, las validaciones ejecutadas y el resultado de la integración en esta misma task mediante **append**, sin sobrescribir el contenido previo.

Si las validaciones fallan, la integración no debe realizarse. Documentar los hallazgos y el trabajo pendiente y mover la task a `blocked` según `communication.md`.

## Resultado de ejecución

**Estado**: Cumplido — todas las validaciones son satisfactorias; integración en `main` verificada.

**Ramas**:
- Trabajo: `feature/us-0036-api` (creada desde `main` actualizado).
- Integración: fast-forward de `feature/us-0036-api` en `main`, sin conflictos.
- Rama de trabajo eliminada (local y remota) **después** de verificar la integración.

**Commits integrados**:
- `8f989cd` — TASK-API-0319/0320/0321/0322: administración de listas personales (dominio, migración, repositorios, servicio, controller y filtro `myLists`).
- `bbc5eee` — TASK-API-0323: tests de integración y de contrato de las listas personales.
- `18e716a` — documentación de la US (endpoints, servicios, repositorios, dominio).
- `2beb916` — cierre documental de TASK-API-0319..0322 (movidas a `finished`).
- Commit adicional — registro del resultado de ejecución de TASK-API-0319..0322 dentro de los archivos de task.
- Commit de integración — fast-forward de `feature/us-0036-api` en `main` y push `main -> main`.

**Migración**:
- `20261020105458_MakeWorkListTypeOptional`: `WorkLists.ListTypeId` pasa a nullable. Necesaria porque las listas
  personales no tienen tipo de lista y las del sistema lo siguen teniendo. Compatible con los datos existentes:
  no se borra ni se reescribe ninguna fila (la columna pasa a admitir NULL). Aplicada con
  `dotnet ef database update` sobre la base de desarrollo; el snapshot de EF quedó sincronizado.
- Se mantienen el índice `HasIndex("ListTypeId")` y el `DeleteBehavior.Restrict` de la relación.

**Validaciones funcionales** (todas verificadas con tests automatizados):
1. `GET /api/catalog/lists` con `myLists` → `CatalogLists_WithMyListsTrue_ReturnsOnlyThePersonalListsOfTheUser`
   y `CatalogLists_WithoutMyLists_KeepsReturningOnlyTheSystemLists`.
2. Creación de listas personales → `CreatePersonalList_PersistsTheExpectedValues`.
3. Edición de nombres → `RenamePersonalList_ChangesOnlyTheName` (verifica que solo cambia `Name`).
4. Eliminación física de listas y sus detalles → `DeletePersonalList_RemovesTheListAndItsItemsWithoutRemovingTheWorks`.
5. Incorporación y eliminación de obras → `AddWork_CreatesTheRelationAndRejectsDuplicates`,
   `AddWork_RejectsAnUnknownWork`, `RemoveWork_DeletesOnlyTheRelationAndKeepsTheWork`.
6. Actualización del orden → `ReorderWorks_PersistsTheNewOrderOfTheAffectedWorks` y
   `ReorderWorks_RejectsAWorkThatDoesNotBelongToTheList`.
7. Persistencia de la portada predeterminada → `CreatePersonalList_PersistsAnIndependentCoverPerList` (cada lista
   tiene su propio archivo de portada).
8. Asociación del propietario autenticado → verificado en `CreatePersonalList_PersistsTheExpectedValues`
   (`OwnerType = User`, `Visibility = Private`, `Owner` = usuario autenticado).
9. Separación entre listas personales y del sistema → `CatalogLists_WithoutMyLists_KeepsReturningOnlyTheSystemLists`
   y `CatalogListDetail_IsAvailableForTheOwnerOfAPersonalList`.

**Casos funcionales y de seguridad**:
- Un usuario solo consulta y administra sus propias listas → `PersonalLists_CannotBeManagedByAnotherUser`
  (renombrar, eliminar y consultar la lista de otro usuario devuelven 404).
- No se pueden modificar listas del sistema con endpoints personales →
  `SystemLists_CannotBeManagedThroughThePersonalEndpoints`.
- Propietario, visibilidad y tipo no se pueden falsificar desde el cliente → el contrato de creación solo recibe
  `name`; el resto de los valores los define el backend (verificado con `MyListsControllerContractTests`).
- Eliminar una lista o quitar una obra no elimina entidades `Work` →
  `DeletePersonalList_RemovesTheListAndItsItemsWithoutRemovingTheWorks` y
  `RemoveWork_DeletesOnlyTheRelationAndKeepsTheWork` (la obra sigue en el catálogo).
- Los `WorkListItem` se eliminan físicamente en las operaciones correspondientes → verificado por el conteo de
  items tras eliminar.
- La portada de una lista no comparte una referencia editable → `CreatePersonalList_PersistsAnIndependentCoverPerList`
  (identificador y ruta de archivo distintos por lista).
- La paginación y los conteos siguen siendo correctos → el filtro se aplica antes de contar y paginar; los tests
  comparan el total con el número de listas del sistema.
- Las operaciones fallidas no dejan datos parcialmente modificados → transacciones con rollback en la creación y
  en el borrado, y validaciones previas a la escritura en el resto de las operaciones.

**Revisión técnica**:
- Separación de capas respetada: `MyListsController` (binding + auth), `PersonalListService` (casos de uso y
  validaciones), `IWorkListRepository`/`IWorkListItemRepository`/`IFileStorageService` (persistencia), `WorkList`
  (dominio). Sin lógica de persistencia en el controlador y sin repositorio genérico.
- El usuario se toma siempre del claim `sub`; ningún endpoint acepta una identidad enviada por el cliente.
- Errores gestionados con las excepciones del dominio (`BusinessNotFoundException` → 404,
  `BusinessConflictException` → 409, `ValidationException` → 422) y el middleware centralizado existente.
  Transacciones mediante `IUnitOfWork` + `SaveChangesAsync`/`CommitAsync`/`RollbackAsync`.
- `git diff` revisado: 44 archivos, todos de la US (dominio, configuración, migración, repositorios, servicio,
  controller, DTOs, documentación y tests). No hay cambios ajenos ni refactors generales.
- Documentación actualizada: `endpoints/endpoints-personal-lists.md` (nuevo), `endpoints.md`,
  `endpoints/endpoints-catalog.md` (parámetro `myLists` y detalle de listas personales), `services.md`,
  `services/services-catalog.md`, `repositories.md`, `repositories/repositories-catalog.md`, `domain.md` y
  `domain/domain-catalog.md`.

**Validaciones ejecutadas**:
- `dotnet build api/Api/Api.csproj` → **0 errores** (los warnings NU1902/NU1903 y CS8602 son preexistentes del
  repositorio).
- `dotnet test tests/Infrastructure.Tests/Infrastructure.Tests.csproj` → **435/435 pass** (424 previos a la US +
  11 nuevos: 16 casos de integración de listas personales y 13 de contrato, contando los casos de la Theory).
  Sin regresiones: se actualizó `CatalogControllerContractTests` para incluir el parámetro `myLists` en el
  contrato del request de catálogo.
- Repetido sobre `main` después de la integración: 0 errores y 435/435 pass.

**Incidencias durante la ejecución y cómo se resolvieron**:
- `git mv` sobre archivos con modificaciones sin stagear mueve la versión del índice, por lo que el primer
  commit de cierre (`2beb916`) registró los archivos de task sin el resultado de ejecución. Se detectó revisando
  el diff contra `main` y se corrigió con un commit adicional que registra el resultado dentro de los archivos.
- El repositorio tiene dos carpetas de migraciones (`Infrastructure/Migrations` y
  `Infrastructure/Persistence/Migrations`); la nueva migración se creó en `Persistence/Migrations`, que es la
  carpeta en uso desde 2026-09-25 (misma que `AddFavorites`).
- El asset de la portada genérica no existía en el backend: se copió `ux_ui/portada genérica.jfif` a
  `api/Infrastructure/Assets/default-list-cover.jfif` y se incluye en el build, para que cada lista tenga una
  copia propia persistida por el flujo de imágenes.
- La primera obra agregada a una lista tomaba la posición 1 en lugar de 0: se corrigió `GetMaxPositionAsync` para
  que devuelva `-1` cuando la lista no tiene items, respetando la convención 0-based del proyecto.

**Integración final**:
- `main` actualizado desde el remoto, merge fast-forward sin conflictos, build y tests verificados sobre `main`
  y `main` publicado.
- Rama `feature/us-0036-api` eliminada (local y remota) tras confirmar la integración.

**Notas**: no quedan bloqueos ni trabajo pendiente en Backend/API para US-0036. El Public Web puede construir la
sección "Mis listas" reutilizando el catálogo con `myLists=true` y la página de detalle de lista.