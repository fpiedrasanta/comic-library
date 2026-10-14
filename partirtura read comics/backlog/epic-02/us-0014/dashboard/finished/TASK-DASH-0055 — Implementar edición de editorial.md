# TASK-DASH-0055 — Implementar edición de editorial

## Objetivo

Implementar la funcionalidad de edición de editoriales utilizando la pantalla construida en `TASK-DASH-0052` y el endpoint definido en `endpoints.md`.

## Endpoint

Consultar `endpoints.md` para utilizar exactamente el endpoint de edición de editorial.

El identificador de la editorial debe obtenerse de la ruta.

No utilizar `location.state` como fuente de verdad para los datos de edición.

## Carga de datos

Al ingresar al modo edición:

- Obtener la información actual de la editorial mediante API.
- Mostrar sus datos en el formulario.
- Mostrar la imagen existente cuando corresponda.
- Mostrar el color existente cuando corresponda.
- Mostrar país, descripción, website, año, historia y estados actuales.

No utilizar datos mock como fuente de información.

## Funcionalidad

Implementar:

- Edición de los campos permitidos.
- Selección de país.
- Edición del color.
- Edición de `IsFeatured`.
- Edición de `IsAlive`.
- Reemplazo de imagen.
- Eliminación de imagen.
- Validación.
- Guardado.
- Manejo de errores.
- Confirmación de edición exitosa.

`IsActive` no debe modificarse desde el formulario de edición.

La activación y desactivación pertenecen a tasks específicas.

## Imagen

Permitir:

- Mantener la imagen existente.
- Reemplazarla.
- Eliminarla.
- Cargar una nueva cuando no exista.
- Visualizar preview.

Utilizar el contrato y mecanismo definido por API.

## Validación

Respetar las reglas definidas en `endpoints.md`.

No duplicar reglas de negocio del backend.

## Estados

Implementar:

- Loading inicial.
- Saving.
- Validation error.
- API error.
- Success.
- Editorial inexistente.

## Actualización del listado

Después de una edición exitosa, invalidar o actualizar correctamente el estado del listado de editoriales.

## Documentación

Actualizar `pages.md` y `components.md` si la implementación final difiere de la maqueta o introduce componentes nuevos.

## Dependencias

TASK-DASH-0052.
TASK-DASH-0053.

## Unblocks

Ninguna.

## Resultado de la ejecución

### Cambios realizados

1. **`pages/publisher-form-page.tsx`**: modo edición integrado con backend.
   - Carga inicial mediante `getPublisher(id)` usando `GET /api/admin-publishers/{publisherId}`.
   - Precarga del formulario con todos los campos del detalle: `name`, `countryId`, `color`, `description`, `website`, `foundedYear`, `history`, `isFeatured`, `isAlive`.
   - Manejo de imagen existente: se muestra preview desde `/images/{imageId}` cuando existe. Se permite reemplazar (preview local) o eliminar. Si se reemplaza, se incluye como `avatar` en el `FormData` del `PUT`. Si se elimina, se envía `imageId = 0`.
   - Envío mediante `updatePublisher(id, formData)` con los mismos campos que creación. `IsActive` no se incluye en el payload (el contrato no lo permite modificar).
   - Estados: loading inicial, saving, validation error, API error, success toast con redirect.
   - Después de éxito, invalida `queryClient.invalidateQueries({ queryKey: ['publishers'] })`.

### Validación

- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.
