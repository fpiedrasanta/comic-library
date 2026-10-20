# TASK-API-0320 — Crear, editar y eliminar listas personales

## Objetivo

Implementar las operaciones para crear, renombrar y eliminar físicamente listas personales del usuario autenticado.

## Operaciones

Implementar tres endpoints para:

1. Crear una lista indicando únicamente `Name`.
2. Editar el nombre de una lista personal existente.
3. Eliminar físicamente una lista personal junto con todos sus `WorkListItem`.

Las rutas, verbos HTTP y formatos de respuesta deben seguir las convenciones existentes del backend.

## Creación de una lista

Al crear una lista, inicializar sus propiedades de la siguiente manera:

| Propiedad | Valor |
|---|---|
| `Name` | Nombre recibido del frontend |
| `Description` | `Lista creada por {nombre de usuario}` |
| `Cover` | Imagen genérica predeterminada, persistida mediante el mecanismo existente de imágenes |
| `Color` | Color predeterminado de marca NEPS; utilizar azul salvo que exista una convención definida en el proyecto |
| `ListType` | Sin tipo asociado |
| `OwnerType` | `1` — usuario |
| `Owner` | Usuario autenticado |
| `Visibility` | `1` — privada |
| `IsActive` | `true` |
| `CreatedAt` | Fecha y hora UTC |

No recibir del frontend propiedades que deben definirse en el backend, como propietario, visibilidad, tipo o fecha de creación.

### Imagen predeterminada

- Localizar la imagen predeterminada existente en el proyecto.
- Leer el archivo desde disco y persistirlo mediante el flujo existente de imágenes, como si fuera una imagen recibida en la creación.
- La imagen persistida debe ser independiente para cada lista, de manera que una futura modificación individual no afecte las demás.
- No duplicar mecanismos de almacenamiento, validación ni acceso a imágenes.

### Tipo de lista

Las listas personales no tienen `ListType`. Revisar el modelo de dominio, la configuración de EF Core y las restricciones de base de datos para permitir esta ausencia sin asignar artificialmente un tipo del sistema. Mantener intactas las reglas de las listas existentes.

## Edición

- Recibir el identificador de la lista y el nuevo nombre.
- Modificar únicamente `Name`.
- Validar que la lista exista, sea personal y pertenezca al usuario autenticado.
- No permitir modificar listas del sistema mediante este endpoint.

## Eliminación

- Eliminar físicamente el `WorkList`.
- Eliminar físicamente todos sus `WorkListItem`.
- Ejecutar la operación de forma transaccional cuando corresponda.
- No eliminar las obras relacionadas ni afectar sus datos, otras listas, el progreso, las valoraciones, los comentarios o los favoritos.
- No permitir eliminar listas de otros usuarios ni listas del sistema.

## Criterios de aceptación

- Una lista nueva se persiste con todos los valores definidos.
- La portada se almacena mediante el mecanismo de imágenes existente y es independiente por lista.
- La lista queda asociada al usuario autenticado.
- La edición cambia solamente el nombre.
- La eliminación elimina la lista y sus detalles, sin eliminar las obras.
- Las operaciones no permiten modificar listas de otros usuarios.
- Se respetan las validaciones, errores y convenciones de respuesta del proyecto.

## Implementación

Revisar `domain.md`, `repositories.md`, `services.md`, `endpoints.md` y los contratos existentes. No introducir una arquitectura paralela ni duplicar lógica de persistencia.

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
- Creación de una lista personal indicando **únicamente el nombre** (`POST /api/users/me/lists`). El backend
  define el resto de los valores: `OwnerType = User`, `Owner = usuario autenticado`, `Visibility = Private`,
  `IsActive = true`, `ListType = null` (sin tipo), `Color = #38BDF8` (azul de marca), `Description = "Lista
  creada por {nombre de usuario}"` y `CreatedAt` en UTC.
- Portada genérica persistida por el **flujo de imágenes existente**: el asset `portada genérica` se copió al
  repositorio (`api/Infrastructure/Assets/default-list-cover.jfif`), se incluye en el build
  (`Infrastructure.csproj`, `CopyToOutputDirectory`) y en cada creación se lee del disco y se guarda con
  `IFileStorageService.SaveDefaultListCoverAsync`, que produce un **archivo propio por lista** (nombre GUID) para
  que una modificación posterior de una lista no afecte a las demás.
- `ListType` pasó a ser **opcional** en el dominio (`WorkList.ListType?`), con la migración
  `20261020105458_MakeWorkListTypeOptional` que vuelve `ListTypeId` nullable, y con `ListTypeId`/`ListTypeName`
  nullable en los DTOs de catálogo, administración y reader.
- Renombrado (`PUT /api/users/me/lists/{listId}`): modifica **únicamente** `Name`.
- Eliminación física (`DELETE /api/users/me/lists/{listId}`): borra la lista y todos sus `WorkListItem` en una
  transacción, y elimina el archivo de la portada. **No** elimina obras, ni progreso, valoraciones, comentarios
  ni favoritos, ni afecta a otras listas.

**Qué se cambió**:
- `api/Domain/Entities/WorkList.cs`: `ListType` nullable.
- `api/Application/Services/PersonalListService.cs` + `api/Application/Interfaces/IPersonalListService.cs` (nuevos).
- `api/Application/DTOs/PersonalListDtos.cs` (nuevo), `api/Application/Constants/PersonalListDefaults.cs` (nuevo).
- `api/Api/Controllers/MyListsController.cs` (nuevo) — ruta `api/users/me/lists`.
- `api/Infrastructure/Repositories/WorkListItemRepository.cs` + `IWorkListItemRepository.cs` (nuevos).
- `api/Infrastructure/Repositories/WorkListRepository.cs`: `GetPersonalByIdAsync`, `GetPersonalWithItemsAsync`,
  `DeleteAsync`; `GetCatalogByIdAsync` acepta el `userId` para devolver el detalle de una lista personal a su
  propietario.
- `api/Infrastructure/Services/FileStorageService.cs` + `IFileStorageService.cs`: `SaveDefaultListCoverAsync`.
- `api/Infrastructure/Assets/default-list-cover.jfif` (nuevo) e `Infrastructure.csproj`.
- `api/Infrastructure/Persistence/Migrations/20261020105458_MakeWorkListTypeOptional.*` (nuevos).
- `api/Application/Services/ListRatingService.cs`: las listas personales no se pueden valorar.
- `api/Application/Services/WorkListService.cs`: el detalle administrativo y las activating/desactivating solo
  afectan a listas del sistema.
- `api/Api/Program.cs`: registro de `IPersonalListService`.

**Decisiones relevantes**:
- Servicio nuevo `PersonalListService` en lugar de ampliar `WorkListService`: las listas personales tienen reglas
  de autorización, de borrado y de contrato distintas a las del sistema, y mezclarlas en el servicio de
  administración habría dejado un servicio de más de 800 líneas con dos conjuntos de reglas.
- El nombre es **único en el sistema** (se reutiliza la validación existente), tal como se decidió para esta US.
- La eliminación de la lista y de sus detalles es física: es la excepción documentada a la regla de borrado
  lógico, igual que `FavoriteRepository` en US-0035, y queda registrada en `repositories.md`.
- El usuario se toma siempre del claim `sub`; ningún endpoint acepta un identificador de usuario.

**Notas**:
- Commit: `8f989cd`. Branch: `feature/us-0036-api`.
- Tests: `CreatePersonalList_PersistsTheExpectedValues`, `CreatePersonalList_PersistsAnIndependentCoverPerList`,
  `CreatePersonalList_RejectsADuplicatedName`, `RenamePersonalList_ChangesOnlyTheName`,
  `DeletePersonalList_RemovesTheListAndItsItemsWithoutRemovingTheWorks`,
  `PersonalLists_CannotBeManagedByAnotherUser`, `SystemLists_CannotBeManagedThroughThePersonalEndpoints`,
  `PersonalLists_CannotBeRated` y `CatalogListDetail_IsAvailableForTheOwnerOfAPersonalList`.