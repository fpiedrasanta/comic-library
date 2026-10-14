# TASK-API-0219 — Implementar dominio de Listas de Obras

## Objetivo

Implementar el modelo de dominio de `WorkList` y `WorkListItem` según US-0023, dejando preparada desde ahora la distinción entre listas `System` y `User`.

## Leer antes de comenzar

* `project/domain.md`

Revisar las entidades `Work`, `ListType` y las relaciones existentes.

## Implementar

### WorkList

Propiedades:

* `Id`
* `Name`
* `Description`
* `Cover` : Image
* `Color`
* `ListType`
* `OwnerType`
* `Owner` : User
* `Visibility`
* `IsActive`
* `CreatedAt`

### WorkListItem

Propiedades:

* `Id`
* `WorkList` : WorkList
* `Work` : Work
* `Position`

## Reglas de dominio

* `OwnerType.System` → `OwnerUserId = null`.
* `OwnerType.User` → `OwnerUserId` obligatorio.
* Las listas creadas actualmente por administración son `System`.
* `Visibility` debe existir desde ahora.
* Las listas `System` son inicialmente `Public`.
* Una lista tiene un único `ListType`.
* Una obra no puede repetirse dentro de la misma lista.
* Cada obra tiene una única `Position` dentro de la lista.
* `Position` determina el orden de las obras.
* Desactivar una lista no elimina sus obras ni sus relaciones.
* No realizar eliminación física.

## Persistencia

Crear las configuraciones EF Core necesarias.

Configurar:

* Primary keys.
* Relaciones `WorkList → ListType`.
* Relaciones `WorkListItem → WorkList`.
* Relaciones `WorkListItem → Work`.
* Restricción de obra única dentro de una lista.
* Persistencia de `Position`.
* Restricciones necesarias para `OwnerType` / `Owner`.

Revisar las convenciones existentes antes de decidir nombres, tipos y comportamiento de las relaciones.

## Documentación

Actualizar:

* `project/domain.md`

Documentar las nuevas entidades, propiedades y relaciones.

## Restricciones

* No implementar repositorios.
* No implementar servicios.
* No implementar endpoints.
* No agregar funcionalidades de listas de usuario todavía.
* Respetar `backend-coding-rules.md`.

## Validación

* Compilación sin errores ni warnings nuevos.
* Configuración EF Core válida.
* Migración creada si corresponde.
* Verificar consistencia con `Work` y `ListType`.

## Execution result

- Verified `WorkList` and `WorkListItem` entities against the domain model and existing navigation conventions.
- Added composite unique indexes for `(WorkListId, WorkId)` and `(WorkListId, Position)` so a work and a position cannot be duplicated within a list.
- Added the `CK_WorkLists_Owner` database constraint enforcing `System` lists without an owner and `User` lists with an owner.
- Updated `project/domain/domain-catalog.md` with the persistence invariants.
- Generated migration `20260917214142_EnforceWorkListInvariants`.
- Validation: `dotnet build ComicLibrary.sln --no-restore` completed with 0 errors and 0 warnings.

