# TASK-DASH-0061 — Integrar imagen en el formulario de edición de Publisher

**Status:** Pending

**Assigned to:** Dashboard Agent

**Blocked task:** TASK-API-0145

## Objetivo

Modificar `publisher-form-page.tsx` en modo edición para integrar completamente la imagen en el `PUT` de Publisher.

## Semántica requerida

```text
Imagen actual conservada:
imageId = id actual
image = null
```

```text
Imagen reemplazada:
imageId = 0
image = nuevo archivo
```

```text
Imagen eliminada:
imageId = 0
image = null
```

## Requisitos

* Mostrar imagen existente.
* Permitir reemplazarla.
* Permitir eliminarla.
* Mostrar preview de la nueva imagen.
* Enviar datos e imagen en una única request `multipart/form-data`.
* No realizar upload separado.
* No realizar delete separado.
* Mantener `IsActive` fuera del formulario de edición.
* Mantener las validaciones actuales.
* Utilizar exclusivamente el contrato definido por backend.
* Leer `endpoints.md`, sin modificarlo.

## Resultado de la ejecución

### Status
Finished

### Cambios realizados
- `publisher.service.ts`: `updatePublisher` ahora acepta `FormData` y envía `multipart/form-data` mediante `fetch` directo.
- `publisher-form-page.tsx`: en modo edición arma `FormData` con todos los campos y aplica la semántica del backend:
  - Conservar imagen: `imageId = existingId`, `avatar = null`.
  - Reemplazar imagen: `imageId = 0`, `avatar = nuevo archivo`.
  - Eliminar imagen: `imageId = 0`, `avatar = null`.
- No realiza upload ni delete separado; todo se resuelve en el `PUT`.

### Validación
- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.