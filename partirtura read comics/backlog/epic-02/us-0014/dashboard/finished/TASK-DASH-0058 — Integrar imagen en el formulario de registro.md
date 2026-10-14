# TASK-DASH-0058 — Integrar imagen en el formulario de registro

**Status:** Pending

**Assigned to:** Dashboard/Public Frontend Agent según corresponda al formulario de registro

**Blocked task:** TASK-API-0144

## Objetivo

Modificar el formulario de registro para enviar los datos del usuario y su imagen mediante una única operación `multipart/form-data`.

## Requisitos

* Mantener el diseño y comportamiento visual existente.
* Permitir seleccionar una imagen.
* Mostrar preview antes del envío.
* Permitir eliminar la imagen seleccionada.
* Construir un único `FormData`.
* Enviar los campos del usuario y `image` en la misma request.
* No realizar una segunda llamada específica para crear el avatar.
* En creación, `imageId` debe ser `0`/omitirse según el contrato definitivo del backend; nunca debe utilizarse para asociar una imagen existente.
* Manejar correctamente errores de validación de datos e imagen.
* Mantener la experiencia actual del formulario.

## Documentación

El agente frontend **solo puede leer `endpoints.md`** para conocer el contrato. No debe modificarlo.

Actualizar únicamente la documentación frontend que corresponda.

## Resultado de la ejecución

### Status
No me corresponde

### Motivo
El formulario de registro pertenece al proyecto `public-web`, no al Dashboard. Esta task está fuera del alcance del Frontend Dashboard Agent.

### Assigned to
Public Web Agent