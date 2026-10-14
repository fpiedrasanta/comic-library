# TASK-API-0137 — Implementar contratos y servicio de Editorial

## Objetivo

Definir los contratos de API y la lógica de aplicación necesaria para gestionar editoriales.

## Contratos

Crear los request/response necesarios para:

- Consulta paginada.
- Creación.
- Edición.
- Activación.
- Desactivación.

Los contratos de creación y edición deben permitir administrar la información definida para Editorial.

El identificador debe obtenerse desde la ruta durante la edición.

`IsActive` no debe formar parte del contrato de creación o edición.

## Creación

`CreateEditorialAsync` debe:

- Validar que el nombre sea obligatorio.
- Validar que el nombre sea único.
- Validar que el país exista.
- Validar que el país esté activo.
- Validar que la imagen exista cuando se proporcione.
- Validar que el color, cuando exista, sea hexadecimal válido.
- Crear la editorial como activa.
- Persistir mediante `IUnitOfWork`.

## Edición

`UpdateEditorialAsync` debe:

- Validar que la editorial exista.
- Validar que el nombre sea obligatorio.
- Validar unicidad del nombre excluyendo la editorial actual.
- Validar el país cuando sea informado.
- Validar que el país esté activo.
- Validar la imagen cuando sea informada.
- Validar el color cuando sea informado.
- No modificar `IsActive`.

## Imagen

La referencia a la imagen debe poder modificarse posteriormente.

La eliminación o reemplazo físico del archivo debe respetar la estrategia existente para `Image` y no debe ser implementada mediante lógica específica de Editorial si ya existe un servicio responsable de imágenes.

## Activación y desactivación

Implementar:

- `ActivateEditorialAsync`
- `DeactivateEditorialAsync`

Las operaciones deben ser lógicamente idempotentes.

No debe eliminarse físicamente la editorial.

## Documentación

Al finalizar la task actualizar:

- `models.md`
- `services.md`
- `repositories.md`

## Pending Work

Ninguna.

## Unblocked by

TASK-API-0136

## Unblocks

TASK-API-0138

## Assigned to

Backend Agent

## Execution Result

### Status
Finished

### Completed Work
- Creados DTOs en `Application/DTOs/`:
  - `PublisherDto`: respuesta detallada de editorial.
  - `AdminPublisherListItemDto`: ítem para listado administrativo.
  - `CreatePublisherRequest`: contrato de creación.
  - `UpdatePublisherRequest`: contrato de edición (sin `IsActive`).
  - `GetPublishersRequest`: request paginado con filtro `IsActive`.
- Creada `IPublisherService` en `Application/Interfaces/IPublisherService.cs`.
- Creado `PublisherService` en `Application/Services/PublisherService.cs` con:
  - `GetPagedAsync`: validación de parámetros, delegación a repositorio, construcción de `ListResponse<AdminPublisherListItemDto>`.
  - `CreatePublisherAsync`: validación de nombre obligatorio/único, país existente y activo, imagen existente cuando se proporciona, validación de color hexadecimal `#RRGGBB`, creación con `IsActive = true`.
  - `UpdatePublisherAsync`: validación de existencia, nombre obligatorio/único excluyendo el actual, país activo, imagen activa, color hex, no modifica `IsActive`.
  - `DeactivatePublisherAsync` y `ActivatePublisherAsync`: idempotentes, solo modifican `IsActive`.
- Inyectada dependencia de `IImageRepository` en `PublisherService` (no `IUnitOfWork.GetByIdAsync`).
- Actualizados `project/services.md`, `project/repositories.md` y `project/endpoints.md`.
- Verificada la solución compila correctamente.

### Issues Found
- `PublisherService` inicialmente usaba `IUnitOfWork.GetByIdAsync<Image>` para validar imágenes, lo cual no existe en la interfaz `IUnitOfWork`. Se corrigió inyectando `IImageRepository` directamente, siguiendo el patrón existente.

### Pending Work
Ninguna.

### Unblocked by
TASK-API-0136

### Unblocks
TASK-API-0138

### Assigned to
Backend Agent