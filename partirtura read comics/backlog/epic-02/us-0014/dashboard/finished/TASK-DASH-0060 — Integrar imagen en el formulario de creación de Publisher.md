# TASK-DASH-0060 — Integrar imagen en el formulario de creación de Publisher

**Status:** Pending

**Assigned to:** Dashboard Agent

**Blocked task:** TASK-API-0145

## Objetivo

Modificar `publisher-form-page.tsx` en modo creación para enviar los datos de la editorial y su imagen mediante una única request `multipart/form-data`.

## Requisitos

* Mantener drag & drop.
* Mantener selección de archivo.
* Mantener preview.
* Permitir eliminar la selección.
* Enviar `image` junto con los datos del Publisher.
* No realizar una llamada independiente para crear la imagen.
* Utilizar el contrato definido por el backend leyendo `endpoints.md`.
* Mantener validaciones actuales.
* Mantener estados de loading, error y éxito.

El agente **no debe modificar `endpoints.md`**.

## Resultado de la ejecución

### Status
Finished

### Cambios realizados
- `publisher.service.ts`: `createPublisher` ahora acepta `FormData` y envía `multipart/form-data` mediante `fetch` directo.
- `publisher-form-page.tsx`: en modo creación arma `FormData` con todos los campos y agrega `avatar` cuando hay imagen seleccionada. No realiza llamada independiente de upload.
- La imagen se envía en la misma request de creación, sin endpoints separados.

### Validación
- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.