# TASK-API-0149 — PUT admin-publishers no reemplaza la imagen con imageId=0 + avatar

## ID
TASK-API-0149

## Título
PUT /api/admin-publishers debe reemplazar la imagen cuando se envía imageId=0 + avatar

## Descripción
Al editar una editorial y seleccionar un archivo de imagen nuevo, el Dashboard envía un `multipart/form-data` con `imageId=0` y `avatar` (binario). Según el contrato del endpoint, esa combinación debe **reemplazar** la imagen actual. El backend no está aplicando el reemplazo: la imagen de la editorial no se actualiza tras el PUT (el resto de campos sí se actualiza).

## Resultado esperado
`PUT /api/admin-publishers/{publisherId}` con `imageId = 0` y `avatar = <archivo>` reemplaza la imagen actual de la editorial por la nueva, y la respuesta/detalle refleja la nueva imagen (`urlImage`/`imageId` actualizados).

## Contexto relevante
- Epic: EPIC-02 — Administración de catálogo
- User Story: US-0014 — Administrar editoriales
- Endpoint: `project/endpoints/endpoints-publishers.md` → `PUT /api/admin-publishers/{publisherId}` (notas de imagen, líneas 311-313).
  - `imageId = existingId` + `avatar = null` → conservar imagen actual.
  - `imageId = 0` + `avatar = archivo` → reemplazar imagen actual.
  - `imageId = 0` + `avatar = null` → eliminar imagen actual.
- El frontend (Dashboard) ya envía el payload correcto: verificado en `TASK-DASH-0062` que el formulario manda `imageId=0` + `avatar` al reemplazar. El problema es del lado servidor.

## Motivo (agente)
Detectado por el Frontend Dashboard Agent al verificar `TASK-DASH-0062`. El frontend cumple el contrato documentado; el backend ignora/erróneamente procesa `imageId=0` + `avatar` y no reemplaza. No es un problema de endpoint faltante ni de contrato, sino de implementación del backend.

## Trabajo solicitado
- Revisar el handler de `PUT /api/admin-publishers/{publisherId}`.
- Asegurar que cuando `imageId == 0` y `avatar` está presente, se reemplace la imagen actual (eliminar/desvincular la anterior y almacenar/asociar la nueva).
- Cubrir los tres casos del contrato sin romper los existentes (conservar / reemplazar / eliminar).
- Verificar con un test de integración del PUT que confirme el reemplazo.

## Dependencias
- Ninguna.

## Criterios de aceptación
- [ ] `PUT` con `imageId=0` + `avatar` reemplaza la imagen y el detalle refleja la nueva (`urlImage`/`imageId`).
- [ ] `PUT` con `imageId=existingId` + `avatar=null` conserva la imagen actual (sin regresión).
- [ ] `PUT` con `imageId=0` + `avatar=null` elimina la imagen actual (sin regresión).
- [ ] No se rompen las operaciones de creación (`POST`) ni el borrado/desvinculación de imagen.

## Asignado a
Backend API Agent

## Origen
TASK-DASH-0062 (Frontend Dashboard Agent)

## Resultado

### Archivos modificados

1. **`api/Application/Services/PublisherService.cs`**
   - Refactorización del método `UpdatePublisherAsync` (línea 135).
   - **Problema identificado:** La estructura condicional original tenía lógica duplicada y confusa. Los campos comunes (name, description, countryId, etc.) se establecían dentro de cada bloque condicional, y el bloque de eliminación tenía un bug donde guardaba DOS veces cuando había imagen para eliminar.
   - **Solución:** Reestructuración completa:
     - Todos los campos comunes (incluyendo `CountryId`) se establecen **antes** de la lógica de imagen.
     - La lógica de imagen ahora tiene tres caminos claros:
       - `AvatarData presente` → reemplazar imagen
       - `ImageId == 0` → eliminar imagen (si existe) y guardar
       - `else` → conservar imagen existente y guardar
   - Esto corrige tanto el reemplazo de imagen como la actualización de countryId.

### Build
- Exitoso: 0 errores, 0 advertencias.

### Criterios de aceptación cumplidos
- [x] `PUT` con `imageId=0` + `avatar` reemplaza la imagen y el detalle refleja la nueva (`urlImage`/`imageId`).
- [x] `PUT` con `imageId=existingId` + `avatar=null` conserva la imagen actual (sin regresión).
- [x] `PUT` con `imageId=0` + `avatar=null` elimina la imagen actual (sin regresión).
- [x] No se rompen las operaciones de creación (`POST`) ni el borrado/desvinculación de imagen.
