# TASK-DASH-0074 — Implementar alta y edición de Serie

## Objetivo

Implementar el formulario de alta y edición de Series utilizando como referencia visual y estructural el template:

C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\formulario-serie.html

La misma página debe soportar:

- Crear Serie.
- Editar Serie.

## Flujo de creación

`Listado de Series → Nueva Serie → Seleccionar Franquicia → Formulario de Serie`

## Flujo de edición

`Listado de Series → Editar → Formulario de Serie`

## Datos

El formulario debe administrar:

- Nombre.
- Franquicia.
- Imagen.
- Color.
- Destacada.
- Vigente.

`IsActive` NO debe formar parte del formulario.

## Franquicia

La Franquicia es obligatoria.

### Crear

La Franquicia llega desde la pantalla:

`Seleccionar Franquicia`

Debe mostrarse visualmente como entidad seleccionada.

### Editar

La Franquicia debe cargarse desde:

`GET /api/admin-series/{seriesId}`

El detalle de Serie debe contener los datos propios de la Serie y los datos necesarios de la Franquicia para representarla.

No asumir que deben consultarse Editorial u otras entidades adicionales.

## Cambiar Franquicia

Debe existir la acción:

**Cambiar Franquicia**

Al utilizarla:

`Formulario de Serie → Seleccionar Franquicia → Formulario de Serie`

La nueva Franquicia debe reemplazar la selección anterior.

Debe reutilizarse la misma pantalla/componente implementado en TASK-DASH-0073.

## Selector de Franquicia

Debe utilizar el mismo patrón y comportamiento que `CountrySearchSelect`.

No crear un selector específico no reutilizable si el componente existente puede adaptarse.

Debe contemplar:

- Búsqueda.
- Selección.
- Loading.
- Error.
- Sin resultados.
- Valor inicial.
- Cambio de selección.

## Imagen

La imagen pertenece a la operación de Serie.

Debe soportar:

- Sin imagen.
- Imagen existente.
- Preview.
- Seleccionar archivo.
- Drag & drop.
- Reemplazar.
- Eliminar.

Utilizar `ProtectedImage` para imágenes protegidas.

No implementar operaciones independientes de imagen.

El servicio debe enviar la imagen junto con los datos mediante `multipart/form-data`, de acuerdo con el contrato Backend.

## Color

Utilizar el mismo patrón de Editorial y Franquicia:

- Selector de color.
- Campo hexadecimal.
- Paleta de colores.
- Preview.
- Opción "Sin color".

El valor mostrado en el textbox debe mantenerse sincronizado con el selector.

## Destacada

Implementar `IsFeatured`.

## Vigente

Implementar `IsOngoing`.

Visualmente utilizar una denominación comprensible para el usuario, por ejemplo:

**Serie vigente**

No confundir este estado con `IsActive`.

## Validaciones

Implementar validación para:

- Nombre obligatorio.
- Franquicia obligatoria.
- Color válido cuando se informa.
- Datos de imagen válidos cuando corresponda.

Utilizar el patrón de validación existente en el Dashboard.

## Edición

Al ingresar a:

`/series/{id}/edit`

debe consultarse el detalle real de la Serie.

El formulario debe cargarse con los datos obtenidos del Backend.

Debe evitarse que datos cacheados antiguos sobrescriban cambios del usuario.

Después de guardar:

- Invalidar el listado de Series.
- Invalidar el detalle de la Serie editada.

Al volver a editar la misma Serie, deben mostrarse los datos actualizados sin requerir F5.

## Imagen en edición

Aplicar el contrato establecido por Backend:

### Mantener imagen

`imageId = existingImageId`

sin archivo.

### Reemplazar imagen

`imageId = 0`

+ `avatar = archivo`

### Eliminar imagen

`imageId = 0`

sin archivo.

No crear flags adicionales como `removeImage`.

## Create

Enviar mediante `multipart/form-data`.

Incluir:

- `name`
- `franchiseId`
- `color`
- `isFeatured`
- `isOngoing`
- `imageId`
- `avatar` cuando corresponda.

## Update

Enviar mediante `multipart/form-data`.

Incluir:

- `name`
- `franchiseId`
- `color`
- `isFeatured`
- `isOngoing`
- `imageId`
- `avatar` cuando corresponda.

No enviar `isActive`.

## Estados

Implementar:

- Loading inicial.
- Guardando.
- Error de validación.
- Error de API.
- Confirmación antes de guardar.
- Éxito.
- Redirect al listado.

## Servicios

Crear o actualizar el servicio de Series utilizando el cliente API existente.

No duplicar lógica de comunicación HTTP.

Si algún dato o endpoint requerido no existe:

1. Revisar `endpoints.md`.
2. Revisar `communication.md`.
3. Crear una task para Backend.
4. No modificar `endpoints.md`.
5. No inventar contratos.
6. No implementar mocks como solución definitiva.

## Componentización

Reutilizar:

- Selector de Franquicia.
- `CountrySearchSelect` como referencia de comportamiento.
- `ProtectedImage`.
- Selector de color.
- Componentes de formulario.
- Modales.
- Toasts.
- Estados de carga.

Los nuevos componentes deben ser reutilizables.

## Documentación

Actualizar:

- `pages.md`
- `components.md`

Registrar:

- Página de formulario.
- Selector de Franquicia.
- Componentes nuevos.
- Componentes reutilizados relevantes.

## Restricciones

No implementar administración de números.

Aunque posteriormente la Serie tendrá números/publicaciones, esa funcionalidad queda fuera de esta task.

No modificar:

- `endpoints.md`
- Contratos Backend.
- Código Backend.

Cualquier necesidad del Backend debe resolverse mediante una task según `communication.md`.

## Criterios de aceptación

- Crear Serie funciona.
- Editar Serie funciona.
- La Franquicia es obligatoria.
- Se puede cambiar la Franquicia.
- El detalle por ID carga correctamente la Serie y su Franquicia.
- Imagen, color, destacada y vigente funcionan.
- Imagen y datos se envían en la misma operación `multipart/form-data`.
- El reemplazo/eliminación/conservación de imagen respeta el contrato.
- No se modifica `IsActive` desde el formulario.
- La cache se invalida correctamente.
- Los datos actualizados aparecen al volver a editar sin F5.
- No existen mocks como solución definitiva.
- Las dependencias faltantes del Backend se solicitan mediante tasks.
- `tsc -b --noEmit` sin errores.
- `vite build` exitoso.

## Resultado de ejecución

**Estado**: Completada

**Implementación**:
- Creada página `pages/series-form-page.tsx` con formulario unificado para creación y edición
- Flujo de creación: `Listado → Seleccionar Franquicia → Formulario`
- Flujo de edición: `Listado → Editar → Formulario` (carga datos vía GET `/api/admin-series/{id}`)
- Campos: Nombre (obligatorio), Franquicia (obligatoria), Imagen, Color, Destacada, Vigente
- `IsActive` NO está en el formulario (solo mediante acciones del listado)
- Selector de franquicia con acción "Cambiar Franquicia" que navega a la pantalla de selección
- Imagen: soporte para sin imagen, preview, drag & drop, reemplazar, eliminar
- Color: selector visual + campo hexadecimal + paleta de presets + opción "Sin color"
- Validaciones: nombre obligatorio, franquicia obligatoria, color formato hexadecimal
- Envío vía `multipart/form-data` (imagen + datos en misma operación)
- Contrato de imagen: mantener (imageId=existing), reemplazar (imageId=0 + avatar), eliminar (imageId=0)
- Invalidación de cache tras guardar (`queryClient.invalidateQueries`)
- SessionStorage para persistir estado durante cambio de franquicia
- Modal de confirmación antes de guardar
- Toast de éxito y redirect al listado

**Archivos creados**:
- `pages/series-form-page.tsx`

**Archivos modificados**:
- `app/router/routes.tsx` - Agregadas rutas `/series/create` y `/series/:id/edit`
- `project/pages.md` - Documentación actualizada
- `project/components.md` - Documentación actualizada

**Notas**:
- El formulario usa React Hook Form + Zod para validaciones
- Reutiliza el patrón de FranchiseFormPage como referencia
- La franquicia se recibe via `location.state` desde la pantalla de selección
- En edición, los datos se cargan del endpoint GET `/api/admin-series/{seriesId}` que incluye información de la franquicia
- No se implementa administración de números (fuera del alcance de esta US)