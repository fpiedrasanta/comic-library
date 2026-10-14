# TASK-API-0145 — Integrar gestión de imagen en las operaciones de Publisher

**Status:** Pending

**Assigned to:** Backend Agent

**Blocked task:** TASK-API-0144

## Objetivo

Modificar las operaciones de creación y actualización de `Publisher` para que la imagen representativa de la editorial forme parte de la misma operación.

## Alcance

Revisar y modificar:

* `POST /api/admin-publishers`
* `PUT /api/admin-publishers/{publisherId}`

La imagen debe procesarse dentro de estas operaciones.

## Contrato

### Creación

```text
imageId = 0
image = null
→ Editorial sin imagen.
```

```text
imageId = 0
image = archivo
→ Crear editorial con imagen.
```

### Actualización

```text
imageId = 45
image = null
→ Conservar imagen 45.
```

```text
imageId = 0
image = archivo
→ Reemplazar imagen actual.
```

```text
imageId = 0
image = null
→ Eliminar imagen actual.
```

## Requisitos

* Utilizar `multipart/form-data`.
* Los datos de `Publisher` y su imagen deben viajar en una única request.
* No crear endpoints independientes para crear, actualizar o eliminar la imagen de `Publisher`.
* Mantener `ImageId` como referencia persistida.
* Validar la imagen según las reglas existentes.
* Procesar correctamente creación, conservación, reemplazo y eliminación.
* Mantener consistencia entre la entidad y el archivo.
* Evitar imágenes huérfanas.
* Mantener las imágenes privadas.
* `IsActive` continúa gestionándose exclusivamente mediante los endpoints de activar/desactivar existentes.

## Documentación

Actualizar:

* `services.md`
* `repositories.md`
* `endpoints.md`
* documentación del modelo si corresponde.

Actualizar `backend-coding-rules.md` si de esta implementación surge una regla transversal reutilizable.

## Criterios de aceptación

* Crear editorial sin imagen funciona.
* Crear editorial con imagen funciona mediante una única request.
* Editar editorial conservando imagen funciona.
* Editar editorial reemplazando imagen funciona.
* Editar editorial eliminando imagen funciona.
* No existen endpoints específicos de imagen para Publisher.
* La solución compila correctamente.

## Execution Result

### Status
Finished

### Completed Work
- Modificado `CreatePublisherRequest` y `UpdatePublisherRequest` en Application para incluir `AvatarData` y `AvatarFileName`.
- Modificado `PublisherService.CreatePublisherAsync` para integrar la gestión de imagen en la misma operación.
- Modificado `PublisherService.UpdatePublisherAsync` para integrar la gestión de imagen con conservación, reemplazo y eliminación.
- Modificado `AdminPublishersController` para aceptar `multipart/form-data` en create y update.
- Eliminado endpoint independiente `POST /api/admin-publishers/{publisherId}/image`.
- Eliminado método `UploadImageAsync` de `PublisherService` e `IPublisherService`.
- Eliminado DTO `UploadPublisherImageRequest`.
- Actualizada documentación en `project/endpoints.md` y `project/services.md`.
- Verificada la solución compila correctamente.

### Issues Found
Ninguno.

### Pending Work
Ninguna.

### Unblocked by
TASK-API-0144

### Unblocks
TASK-API-0146

### Assigned to
Backend Agent