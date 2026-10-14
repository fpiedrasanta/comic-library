# TASK-API-0160 — Implementar contratos y servicio de Series

## Objetivo

Implementar los DTOs, contratos y servicio de aplicación necesarios para administrar Series.

La implementación debe respetar las reglas definidas en `US-0016 — Administrar series`.

## DTOs

Implementar los contratos necesarios para:

### Listado

Crear un DTO para los elementos del listado administrativo que permita mostrar:

- `Id`
- `Name`
- `FranchiseName`
- `PublisherName`
- `PublisherCountryName`
- `ImageId` o `UrlImage`, según el patrón utilizado actualmente.
- `Color`
- `IsFeatured`
- `IsOngoing`
- `IsActive`
- `CreatedAt`

### Detalle

Crear un DTO de detalle completo para alta/edición que incluya:

- `Id`
- `Name`
- `FranchiseId`
- `FranchiseName`
- `PublisherId`
- `PublisherName`
- `PublisherCountryName`
- `ImageId`
- `UrlImage`
- `Color`
- `IsFeatured`
- `IsOngoing`
- `IsActive`
- demás datos necesarios para representar completamente la Serie.

El detalle debe permitir que el Dashboard pueda cargar el formulario de edición sin depender del listado.

### Creación

Crear `CreateSeriesRequest`.

Debe permitir:

- `Name`
- `FranchiseId`
- `Color`
- `IsFeatured`
- `IsOngoing`
- `ImageId`
- `avatar`

La imagen debe formar parte de la misma operación mediante `multipart/form-data`.

### Edición

Crear `UpdateSeriesRequest`.

Debe permitir:

- `Name`
- `FranchiseId`
- `Color`
- `IsFeatured`
- `IsOngoing`
- `ImageId`
- `avatar`

`IsActive` no debe formar parte del contrato de edición.

## Servicio

Implementar:

- `ISeriesService`
- `SeriesService`

Debe contener:

- Consulta paginada.
- Consulta por ID.
- Creación.
- Edición.
- Activación.
- Desactivación.

## Reglas de negocio

Validar:

- Nombre obligatorio.
- Franquicia obligatoria.
- Franquicia existente y activa.
- Imagen existente y activa cuando corresponda.
- Color hexadecimal válido cuando se informa.
- `IsActive` no puede modificarse mediante Create/Update.
- No validar unicidad de `Name`.

## Imagen

La imagen debe formar parte de la operación de creación y edición.

No implementar endpoints independientes para:

- Crear imagen de Serie.
- Actualizar imagen de Serie.
- Eliminar imagen de Serie.

### POST

- Sin imagen: `imageId = 0`, sin archivo.
- Con imagen: `imageId = 0` + `avatar`.

### PUT

- Mantener imagen: `imageId = idExistente`, sin `avatar`.
- Reemplazar imagen: `imageId = 0` + `avatar`.
- Eliminar imagen: `imageId = 0`, sin `avatar`.

Seguir exactamente el patrón ya utilizado para Publisher y Franchise.

## Criterios de aceptación

- Los DTOs están definidos.
- `ISeriesService` y `SeriesService` están implementados.
- Las validaciones están centralizadas en el servicio.
- La imagen se procesa dentro del Create/Update.
- No existen operaciones independientes de imagen.
- El proyecto compila correctamente.

## Resultado

### DTOs implementados

- **SeriesListItemDto**: Id, Name, FranchiseName, PublisherName, PublisherCountryName, ImageId, UrlImage, Color, IsFeatured, IsOngoing, IsActive, CreatedAt
- **SeriesDetailDto**: Id, Name, FranchiseId, FranchiseName, FranchiseImageId, FranchiseUrlImage, FranchiseColor, FranchiseIsFeatured, FranchiseIsOngoing, FranchiseIsActive, ImageId, UrlImage, Color, IsFeatured, IsOngoing, IsActive
- **CreateSeriesRequest**: Name, FranchiseId, Color, IsFeatured, IsOngoing, AvatarData, AvatarFileName
- **UpdateSeriesRequest**: Name, FranchiseId, ImageId, Color, IsFeatured, IsOngoing, AvatarData, AvatarFileName
- **GetSeriesRequest**: Hereda de ListRequest, agrega PublisherId, FranchiseId, IsActive, IsFeatured, IsOngoing

### Servicio implementado

- **ISeriesService**: Contrato con operaciones GetPagedAsync, GetByIdAsync, CreateSeriesAsync, UpdateSeriesAsync, DeactivateSeriesAsync, ActivateSeriesAsync
- **SeriesService**: Implementación con validaciones centralizadas:
  - Nombre obligatorio
  - Franquicia existente y activa
  - Color hexadecimal válido (#RRGGBB)
  - IsActive no modificable vía Create/Update
  - Sin validación de unicidad de Name
  - Manejo de imagen integrado (crear, mantener, reemplazar, eliminar)
  - Cleanup de imagen en caso de error