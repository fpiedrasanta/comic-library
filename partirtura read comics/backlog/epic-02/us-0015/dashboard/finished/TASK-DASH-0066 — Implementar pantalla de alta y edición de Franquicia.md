# TASK-DASH-0066 — Implementar pantalla de alta y edición de Franquicia

## Objetivo

Implementar en el Dashboard el formulario de alta y edición de Franquicias.

Utilizar como referencia visual y estructural el siguiente template UX/UI:

C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\formulario-franquicia.html

La implementación debe respetar la estructura visual, distribución, componentes, estados y estilos definidos en el template.

## Alcance funcional

Implementar el mismo formulario para:

- Crear Franquicia.
- Editar Franquicia.

El formulario debe contemplar:

- Nombre.
- Editorial.
- Descripción.
- Imagen.
- Color.
- Destacada.
- Vigente.

## Editorial

La Editorial es obligatoria.

### Alta

La Editorial debe provenir de la pantalla de selección de Editorial.

Debe existir una acción que permita volver a seleccionar la Editorial antes de guardar.

### Edición

Debe mostrarse la Editorial actualmente asociada.

El administrador debe poder cambiar la Editorial mediante el mismo flujo de selección utilizado para el alta.

El formulario no debe permitir editar manualmente datos propios de la Editorial.

## Imagen

Implementar la experiencia definida para las imágenes de Editorial:

- Drag & drop.
- Selección de archivo.
- Preview.
- Reemplazo.
- Eliminación de la imagen.

La imagen debe tratarse como parte del formulario de Franquicia.

## Color

Implementar el selector de color definido en el template UX/UI.

Debe permitir:

- Seleccionar visualmente el color.
- Visualizar el color seleccionado.
- Introducir/modificar el valor hexadecimal.
- Dejar la Franquicia sin color.

## Estados

Implementar los estados visuales definidos en el template:

- Carga.
- Guardando.
- Validación.
- Error.
- Éxito.
- Confirmación antes de guardar, si está contemplada en el template.

## Datos

Para esta task utilizar datos mock locales.

No implementar todavía POST ni PUT contra la API.

## Navegación

Implementar:

- Alta → luego de seleccionar Editorial.
- Edición → desde el listado de Franquicias.
- Cancelar → regreso al listado.
- Cambio de Editorial → pantalla de selección de Editorial.

## Documentación

Actualizar:

- `pages.md`
- `components.md`

Registrar la nueva página y los componentes creados o reutilizados.

## Restricciones

No modificar:

- `endpoints.md`
- Contratos de API.
- Servicios del Backend.
- Código del Backend.

No implementar todavía la integración con los endpoints de Franquicia.

## Criterio de aceptación

El administrador debe poder recorrer los flujos completos de maqueta:

### Alta

Listado de Franquicias
→ Nueva Franquicia
→ Seleccionar Editorial
→ Formulario
→ Cancelar / Guardar maqueta.

### Edición

Listado de Franquicias
→ Editar
→ Formulario
→ Cambiar Editorial si corresponde
→ Cancelar / Guardar maqueta.

La pantalla debe reproducir el template UX/UI proporcionado.

## Resultado de la ejecución

### Estado: FINISHED

### Cambios realizados

1. **`pages/franchise-form-page.tsx`**: formulario de alta y edición de franquicias con:
   - Nombre obligatorio con validación.
   - Editorial Madre mostrada como tarjeta con imagen, nombre e ID, y acción "Cambiar editorial".
   - Descripción opcional.
   - Imagen representativa con drag & drop, selección de archivo, preview, reemplazo y eliminación.
   - Selector de color con picker nativo, input hexadecimal, presets y opción "Sin color".
   - Switches para Franquicia destacada y Franquicia vigente.
   - Modal de confirmación antes de guardar.
   - Estados: loading, guardando, validación, error, éxito.
   - Navegación: cancelar al listado, cambiar editorial a selección.

2. **`app/router/routes.tsx`**: agregadas rutas `/franchises/create` y `/franchises/:id/edit`.
3. **`pages.md`**: actualizado con las nuevas páginas.
4. **`components.md`**: actualizado con `FranchiseFormPage`.

### Validación
- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.