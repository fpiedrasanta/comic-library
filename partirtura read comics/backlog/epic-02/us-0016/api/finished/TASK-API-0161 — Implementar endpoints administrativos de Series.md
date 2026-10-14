# TASK-API-0161 — Implementar endpoints administrativos de Series

## Objetivo

Implementar los endpoints administrativos necesarios para la US-0016.

Todos los endpoints deben requerir autenticación y rol `Administrator`.

## Endpoints

### Listado

`GET /api/admin-series`

Debe soportar:

- `page`
- `pageSize`
- `search`
- `publisherId`
- `franchiseId`
- `isFeatured`
- `isOngoing`
- `isActive`
- `sortBy`
- `sortDirection`

### Búsqueda

`search` debe buscar únicamente por:

- Nombre de la Serie.
- Nombre de la Franquicia.
- Nombre de la Editorial.

No incluir otros campos.

### Filtros

Debe permitir filtrar por:

- Editorial.
- Franquicia.
- `IsFeatured`.
- `IsOngoing`.
- `IsActive`.

Cuando un filtro booleano no sea enviado, no debe aplicarse.

### Ordenamiento

Los únicos campos permitidos son:

- `Name`
- `Franchise`
- `Publisher`
- `Country`

`Country` representa el nombre del país de la Editorial, no `CountryId`.

Dirección:

- `ASC`
- `DESC`

## Detalle

Implementar obligatoriamente:

`GET /api/admin-series/{seriesId}`

Debe devolver los datos completos de la Serie necesarios para la edición.

El detalle debe incluir:

### Datos propios de la Serie

- `Id`
- `Name`
- `FranchiseId`
- `ImageId`
- `UrlImage`
- `Color`
- `IsFeatured`
- `IsOngoing`
- `IsActive`

### Datos propios de la Franquicia

Debe incluir la información necesaria para representar visualmente la Franquicia actualmente asociada a la Serie:

- `FranchiseId`
- `FranchiseName`
- `FranchiseImageId`
- `FranchiseUrlImage`
- `FranchiseColor`
- `FranchiseIsFeatured`
- `FranchiseIsOngoing`
- `FranchiseIsActive`

### Importante

El objetivo del detalle es que el Dashboard pueda cargar directamente el formulario de edición de una Serie mostrando:

- Los datos actuales de la Serie.
- La Franquicia actualmente seleccionada.
- La imagen de la Franquicia.
- El color de la Franquicia.

**No es necesario incluir los datos propios de la Editorial en el detalle de la Serie.**

La Editorial no forma parte del contexto necesario para editar una Serie.

Si posteriormente la UI necesita información de la Editorial, podrá obtenerse mediante los mecanismos correspondientes sin modificar este contrato.

El endpoint no debe requerir múltiples requests para reconstruir los datos propios de la Serie y de su Franquicia.

## Creación

`POST /api/admin-series`

Debe recibir `multipart/form-data`.

Debe permitir enviar datos de la Serie y, opcionalmente, su imagen en la misma operación.

## Edición

`PUT /api/admin-series/{seriesId}`

Debe recibir `multipart/form-data`.

Debe permitir modificar:

- Nombre.
- Franquicia.
- Imagen.
- Color.
- Destacada.
- Vigente.

No debe permitir modificar `IsActive`.

## Activación

`PATCH /api/admin-series/{seriesId}/activate`

## Desactivación

`PATCH /api/admin-series/{seriesId}/deactivate`

Ambas operaciones deben ser idempotentes y modificar únicamente `IsActive`.

## Seguridad

Todos los endpoints deben requerir:

`[Authorize(Roles = Roles.Administrator)]`

No debe existir ningún endpoint público que permita modificar Series.

## Documentación

Actualizar:

- `project/endpoints.md`

Documentar todos los endpoints y sus contratos.

## Criterios de aceptación

- Todos los endpoints están implementados.
- El listado soporta búsqueda, filtros, ordenamiento y paginación.
- La búsqueda utiliza únicamente Serie, Franquicia y Editorial.
- El ordenamiento utiliza únicamente Nombre, Franquicia, Editorial y País.
- El detalle por ID devuelve información completa de la Serie.
- El detalle por ID devuelve la información necesaria de la Franquicia asociada.
- El detalle incluye la imagen y el color de la Franquicia.
- El detalle no incluye información innecesaria de la Editorial.
- Create/Update utilizan `multipart/form-data`.
- La imagen se procesa dentro del Create/Update.
- Activar/Desactivar utilizan operaciones separadas.
- Todos los endpoints requieren Administrator.
- La documentación queda actualizada.
- La solución compila correctamente.

## Resultado

### Endpoints implementados

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin-series | Listado paginado con búsqueda, filtros y ordenamiento |
| GET | /api/admin-series/{seriesId} | Detalle completo con info de franquicia |
| POST | /api/admin-series | Crear serie con imagen opcional (multipart/form-data) |
| PUT | /api/admin-series/{seriesId} | Actualizar serie con imagen (multipart/form-data) |
| PATCH | /api/admin-series/{seriesId}/deactivate | Desactivar (lógica, idempotente) |
| PATCH | /api/admin-series/{seriesId}/activate | Activar (lógica, idempotente) |

### Archivos creados

- **Controller**: `Api/Controllers/AdminSeriesController.cs` con `[Authorize(Roles = Roles.Administrator)]`
- **FormRequests**: `Api/DTOs/CreateSeriesFormRequest.cs`, `Api/DTOs/UpdateSeriesFormRequest.cs`
- **DI**: Registro de `ISeriesRepository` y `ISeriesService` en `Program.cs`
- **Documentación**: `project/endpoints/endpoints-series.md` con documentación completa de cada endpoint

### Características

- Todos los endpoints requieren autenticación y rol Administrator
- Búsqueda por Serie, Franquicia y Editorial
- Filtros: publisherId, franchiseId, isActive, isFeatured, isOngoing
- Ordenamiento: Name, Franchise, Publisher, Country (ASC/DESC)
- Detalle incluye datos completos de la Franquicia (imagen, color, etc.)
- Sin endpoints DELETE físicos
- Sin endpoints independientes de imagen