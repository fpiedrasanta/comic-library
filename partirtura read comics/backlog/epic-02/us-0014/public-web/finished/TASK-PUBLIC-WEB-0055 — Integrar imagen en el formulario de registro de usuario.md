# TASK-PUBLIC-WEB-0055 — Integrar imagen en el formulario de registro de usuario

**Status:** Finished

**Assigned to:** Public Web Agent

**Blocked by:** Ninguna

## Desbloqueo

TASK-API-0144 fue finalizada. El endpoint de registro ya soporta `multipart/form-data` con imagen.

## Trabajo realizado

- Verificado que el formulario de registro ya envía `FormData` con `avatar` incluido.
- Agregado botón de eliminación de preview de avatar antes del envío.
- Actualizado `register-page.tsx` para usar estado local (`selectedAvatar`) en lugar de `document.getElementById`.
- Eliminado acceso directo al DOM para obtener el archivo de avatar.

## Trabajo pendiente

Ninguno.

## Dependencia

TASK-API-0144 fue finalizada. No hay dependencias pendientes.

## Objetivo

Modificar el formulario público de registro para que el avatar sea enviado como parte de la creación del usuario.

## Requisitos

El formulario debe:
* Permitir seleccionar una imagen.
* Mostrar preview.
* Permitir eliminar la imagen antes del envío.
* Construir un único `FormData`.
* Enviar los datos del usuario y `image` mediante `multipart/form-data`.
* No realizar un POST independiente para crear el avatar.
* Mantener las validaciones y experiencia visual existentes.
* Manejar correctamente errores provenientes del backend.

En creación:
```text
imageId = 0
image = null
```
significa registro sin imagen.

```text
imageId = 0
image = archivo
```
significa registro con imagen.

## Documentación

No se modificó documentación porque el comportamiento ya estaba alineado con el contrato.

## Criterios de aceptación

* Registro sin imagen funciona.
* Registro con imagen funciona.
* Datos e imagen se envían en una única request.
* La request utiliza `multipart/form-data`.
* No existe una operación independiente de avatar.
* El proyecto compila correctamente.

## Execution Result

### Status
Finished

### Completed Work
- Verificado envío de `FormData` con `avatar` en registro.
- Agregado botón de eliminación de preview de avatar.
- Reemplazado `document.getElementById` por estado local controlado.

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
