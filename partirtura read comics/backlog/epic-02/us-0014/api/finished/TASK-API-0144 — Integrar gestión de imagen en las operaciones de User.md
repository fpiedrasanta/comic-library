# TASK-API-0144 — Integrar gestión de imagen en las operaciones de User

**Status:** Pending

**Assigned to:** Backend Agent

**Blocked task:** Ninguna

**Unblocks:** TASK-DASH-0056 y TASK-PUBLIC-WEB-0055

## Objetivo

Modificar las operaciones de creación y actualización de `User` para que la imagen asociada al usuario forme parte de la misma operación de negocio.

La imagen no debe gestionarse mediante endpoints independientes.

## Alcance

Revisar e implementar:

* Registro de usuario.
* Actualización de perfil de usuario.
* Persistencia de la relación `User → Image`.
* Recepción de archivos mediante `multipart/form-data`.
* Creación de una imagen durante el registro cuando se proporciona archivo.
* Conservación de una imagen existente durante la actualización.
* Reemplazo de una imagen existente.
* Eliminación de una imagen existente.

## Contrato de imagen

### Creación

```text
imageId = 0
image = null
→ Usuario sin imagen.
```

```text
imageId = 0
image = archivo
→ Crear usuario con nueva imagen.
```

No debe aceptarse una imagen existente mediante `imageId` durante la creación.

### Actualización

```text
imageId = 45
image = null
→ Conservar imagen 45.
```

```text
imageId = 0
image = archivo
→ Reemplazar la imagen actual por una nueva.
```

```text
imageId = 0
image = null
→ Eliminar la imagen actual.
```

## Requisitos

* Los endpoints existentes de creación y actualización de usuario deben incorporar la imagen.
* Los contratos deben utilizar `multipart/form-data`.
* No crear endpoints específicos `CreateAvatar`, `UpdateAvatar`, `DeleteAvatar` ni equivalentes.
* La operación de negocio debe resolver datos del usuario e imagen conjuntamente.
* Validar tipo, extensión, tamaño y demás reglas existentes para imágenes.
* Mantener las imágenes privadas.
* Evitar imágenes huérfanas si falla la operación.
* Resolver correctamente la eliminación/reemplazo de la imagen anterior.
* Mantener la operación consistente ante errores.

## Documentación

Actualizar:

* `services.md`
* `repositories.md`
* `endpoints.md`

Si se modifica el modelo:

* `models.md` o el artefacto de dominio equivalente existente.

Si se incorpora una dependencia:

* `backend-stack-technology.md`

Si se establece una regla transversal:

* `backend-coding-rules.md`

## Criterios de aceptación

* Registro sin imagen funciona.
* Registro con imagen funciona mediante una única request.
* Actualización conservando imagen funciona.
* Actualización reemplazando imagen funciona.
* Actualización eliminando imagen funciona.
* No existen operaciones independientes de avatar para este flujo.
* No quedan imágenes huérfanas como consecuencia de errores controlables.
* La solución compila correctamente.
* La documentación queda alineada con el contrato real.

## Execution Result

### Status
Finished

### Completed Work
- Modificado `UpdateProfileRequest` en Application para incluir `ImageId`, `AvatarData` y `AvatarFileName`.
- Modificado `UserService.UpdateProfileAsync` para integrar la gestión de imagen en la misma operación:
  - `imageId = existingId + avatar = null` → conservar imagen actual.
  - `imageId = 0 + avatar = archivo` → reemplazar imagen actual.
  - `imageId = 0 + avatar = null` → eliminar imagen actual.
- Modificado `UsersController.UpdateProfile` para aceptar `multipart/form-data` y mapear `IFormFile` a `UpdateProfileRequest`.
- Eliminados endpoints independientes de avatar: `POST /api/users/me/avatar` y `DELETE /api/users/me/avatar`.
- Eliminados métodos `UpdateAvatarAsync` y `DeleteAvatarAsync` de `UserService` e `IUserService`.
- Eliminados DTOs `UpdateAvatarRequest` (Application) y `UpdateAvatarApiRequest` (Api).
- Actualizada documentación en `project/endpoints.md` y `project/services.md`.
- Verificada la solución compila correctamente.

### Issues Found
Ninguno.

### Pending Work
Ninguna.

### Unblocked by
Ninguna.

### Unblocks
TASK-API-0145

### Assigned to
Backend Agent