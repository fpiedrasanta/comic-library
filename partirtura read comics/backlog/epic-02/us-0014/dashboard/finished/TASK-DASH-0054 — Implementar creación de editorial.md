# TASK-DASH-0054 — Implementar creación de editorial

## Objetivo

Implementar la funcionalidad de creación de editoriales utilizando la pantalla construida en `TASK-DASH-0052` y el endpoint definido en `endpoints.md`.

## Endpoint

Consultar `endpoints.md` para utilizar exactamente el endpoint de creación de editorial, incluyendo:

- Método HTTP.
- Ruta.
- Request.
- Contrato de respuesta.
- Manejo de errores.

No inventar contratos ni rutas.

## Funcionalidad

Implementar:

- Apertura del formulario en modo creación.
- Carga de datos necesarios.
- Edición de los campos.
- Selección de país.
- Selección de color.
- Configuración de `IsFeatured`.
- Configuración de `IsAlive`.
- Carga de imagen.
- Preview de imagen.
- Validación.
- Envío del formulario.
- Manejo de errores.
- Confirmación de creación exitosa.
- Navegación posterior según los patrones existentes del Dashboard.

## Imagen

La imagen debe gestionarse utilizando el mecanismo definido por la API y los componentes existentes.

Debe soportar:

- Drag & drop.
- Selección de archivo.
- Preview.
- Estado sin imagen.

La imagen debe enviarse según el contrato definido por backend.

No implementar procesamiento de imagen en el frontend si este corresponde al backend.

## Validación

Respetar las reglas y contratos definidos por API.

Como mínimo deben contemplarse:

- Nombre.
- País.
- Año de fundación cuando corresponda.
- Color hexadecimal cuando exista.
- Campos obligatorios.

Los mensajes de error deben utilizar el mecanismo estándar del Dashboard.

## Estados

Implementar:

- Loading.
- Saving.
- Validation error.
- API error.
- Success.

Evitar doble envío durante una operación en curso.

## Actualización de listado

Luego de una creación exitosa, invalidar o actualizar correctamente el estado del listado de editoriales para que la nueva editorial pueda aparecer sin requerir una recarga manual de la aplicación.

## Documentación

Actualizar `pages.md` y `components.md` si la implementación final difiere de la maqueta o introduce componentes nuevos.

## Dependencias

TASK-DASH-0052.
TASK-DASH-0053.

## Unblocks

Ninguna.

## Resultado de la ejecución

### Cambios realizados

1. **`pages/publisher-form-page.tsx`**: reescrito para modo creación con backend real.
   - Carga de países desde `getCountries` y poblado del `<select>` con `countryId` numérico.
   - Validación con Zod: `name` obligatorio, `countryId` obligatorio, `color` hexadecimal opcional, `website` URL opcional, `foundedYear` rango 800-2026.
   - Envío del formulario mediante `createPublisher` con payload JSON acorde al contrato (`name`, `description`, `website`, `countryId`, `foundedYear`, `history`, `isAlive`, `color`, `isFeatured`).
   - Si se selecciona una imagen, se sube mediante `uploadPublisherImage(publisherId, file)` a `POST /api/admin-publishers/{publisherId}/image` y el `imageId` resultante se envía en el payload de creación/edición.
   - Estados: loading de países, saving con spinner, validation errors, API error, success toast con redirect a `/publishers`.
   - Después de éxito, invalida `queryClient.invalidateQueries({ queryKey: ['publishers'] })`.

### Validación

- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.
