# TASK-PUBLIC-WEB-0056 — Integrar imagen en Mi Perfil

**Status:** Finished

**Assigned to:** Public Web Agent

**Blocked by:** Ninguna

## Desbloqueo

TASK-API-0144 fue finalizada. El endpoint de actualización de perfil ya soporta `multipart/form-data` con imagen.

## Trabajo realizado

- Modificado `authentication-repository.ts`: `updateProfile` ahora acepta `FormData` e incluye `imageId` y `avatar`.
- Eliminado método `updateAvatar` del repository.
- Actualizado `profile-page.tsx` para enviar perfil e imagen en una única request.
- Implementada semántica de conservación, reemplazo y eliminación de imagen.
- Agregado botón de eliminación de avatar en la pantalla de perfil.
- Eliminado uso de `document.getElementById` para acceso al archivo.
- Actualizados tipos en `types/api.ts`: removidos `UpdateProfileRequest` y `UpdateAvatarRequest`.

## Trabajo pendiente

Ninguno.

## Dependencia

TASK-API-0144 fue finalizada. No hay dependencias pendientes.

## Objetivo

Modificar la pantalla de perfil para gestionar el avatar como parte de la actualización del usuario.

## Semántica

### Conservar
```text
imageId = id de la imagen actual
image = null
```

### Reemplazar
```text
imageId = 0
image = nuevo archivo
```

### Eliminar
```text
imageId = 0
image = null
```

## Requisitos

* Mostrar imagen actual.
* Permitir seleccionar una nueva imagen.
* Mostrar preview.
* Permitir eliminar la imagen.
* Enviar usuario e imagen mediante una única request `multipart/form-data`.
* No realizar `UpdateAvatar`.
* No realizar `DeleteAvatar`.
* Mantener estados de carga y error.
* Mantener las reglas visuales existentes.

## Documentación

No se modificó documentación porque el contrato ya estaba definido en `endpoints.md`.

## Criterios de aceptación

* Conservación, reemplazo y eliminación funcionan.
* La actualización utiliza una única request.
* La imagen no se gestiona mediante endpoints independientes.
* El proyecto compila correctamente.

## Execution Result

### Status
Finished

### Completed Work
- Unificado endpoint de actualización de perfil con gestión de imagen.
- Eliminados endpoints independientes de avatar del frontend.
- Implementada semántica de conservación, reemplazo y eliminación.
- Agregado botón de eliminación de avatar en perfil.
- Actualizados tipos y repository.

### Issues Found
Ninguno.

### Pending Work
Ninguna.

### Unblocked by
TASK-API-0144

### Unblocks
Ninguna

### Assigned to
Public Web Agent
