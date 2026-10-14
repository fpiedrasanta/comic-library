# TASK-DASH-0059 — Integrar imagen en el formulario Mi Perfil

**Status:** Pending

**Assigned to:** Dashboard Agent

**Blocked task:** TASK-API-0144

## Objetivo

Modificar el formulario de perfil para que la imagen forme parte de la actualización del usuario.

## Requisitos

Cuando el usuario conserva la imagen actual:

```text
imageId = id de la imagen actual
image = null
```

Cuando reemplaza la imagen:

```text
imageId = 0
image = nuevo archivo
```

Cuando elimina la imagen:

```text
imageId = 0
image = null
```

La pantalla debe:

* Mostrar la imagen actual.
* Permitir reemplazarla.
* Permitir eliminarla.
* Mostrar preview de la nueva imagen.
* Enviar datos e imagen mediante una única request `multipart/form-data`.
* No realizar llamadas independientes para actualizar/eliminar el avatar.
* Mantener los estados de loading, error y éxito existentes.

El agente debe leer `endpoints.md` para utilizar el contrato real y **no debe modificarlo**.

## Resultado de la ejecución

### Status
No me corresponde

### Motivo
El formulario "Mi Perfil" no existe en el Dashboard. Las pantallas de perfil/avatar pertenecen al proyecto `public-web` (`/profile`, `PUT /api/users/me`, `POST /api/users/me/avatar`). Dentro del Dashboard solo existe `SettingsPage`, no una pantalla de edición de perfil con avatar. Esta task está fuera del alcance del Frontend Dashboard Agent.

### Assigned to
Public Web Agent
