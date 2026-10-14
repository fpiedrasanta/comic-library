# TASK-DASH-0052 — Implementar maqueta de pantalla de alta y edición de editorial

## Objetivo

Implementar en el Dashboard la maqueta visual de la pantalla utilizada para crear y editar editoriales correspondiente a US-0014 — Administrar editoriales.

La implementación debe utilizar como referencia visual el template entregado por UX/UI:

`C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\formulario-editoral.html`

Esta task comprende exclusivamente la construcción de la interfaz. La integración con la API se realizará en tasks posteriores.

## Alcance

La pantalla debe representar el formulario de editorial con los campos definidos por la funcionalidad:

- Imagen.
- Nombre.
- Descripción.
- Website.
- País.
- Año de fundación.
- Historia.
- `IsAlive`.
- `Color`.
- `IsFeatured`.

La misma pantalla debe permitir representar los modos:

- Crear editorial.
- Editar editorial.

## Imagen

Implementar la interfaz visual para una única imagen.

Debe contemplar:

- Drag & drop.
- Selección mediante archivo.
- Preview.
- Estado sin imagen.
- Imagen existente.
- Reemplazo.
- Eliminación mediante acción visual.

La maqueta debe permitir visualizar tanto el estado con imagen como el estado sin imagen.

No implementar todavía la subida real de archivos.

## Color

Implementar el selector de color definido por el template.

Debe permitir representar:

- Color seleccionado.
- Valor hexadecimal.
- Estado sin color.
- Selector visual de color.

No implementar todavía persistencia.

## País

Utilizar el componente visual correspondiente para seleccionar un país.

La lista puede utilizar datos estáticos para la maqueta.

No realizar consultas al backend en esta task.

## Estados booleanos

Representar visualmente:

- Editorial destacada / no destacada.
- Editorial viva / no viva.

## Acciones

El formulario debe contemplar:

- Cancelar.
- Guardar.

Debe existir una representación visual de los estados:

- Guardando.
- Error de validación.
- Error de API.
- Guardado exitoso.

No implementar todavía las operaciones contra el backend.

## Validación visual

Representar errores de validación para los campos correspondientes.

No inventar reglas de negocio adicionales.

Las reglas definitivas deben respetar los contratos definidos en `endpoints.md`.

## Componentización

Reutilizar componentes existentes cuando corresponda.

No duplicar componentes ya existentes.

Si se crean componentes reutilizables, documentarlos en `components.md`.

## Documentación

Actualizar:

- `pages.md` con la pantalla de alta/edición de editorial.
- `components.md` con los componentes nuevos creados, si corresponde.

La documentación debe reflejar la implementación real.

## Restricciones

No implementar:

- POST.
- PUT.
- Carga real de imágenes.
- Eliminación real de imágenes.
- Consultas reales de países.
- Persistencia.
- Integración con API.

Estas funcionalidades serán implementadas en tasks posteriores.

## Dependencias

Ninguna.

## Unblocks

TASK-DASH-0054.
TASK-DASH-0055.

## Resultado de la ejecución

### Cambios realizados

1. **`pages/publisher-form-page.tsx` (nuevo)**: implementada maqueta de formulario siguiendo el template `formulario-editoral.html`.
   - Modos Crear y Editar en la misma pantalla.
   - Formulario con React Hook Form + Zod.
   - Campos: Nombre, País (select), Año de Fundación, Website, Descripción Breve, Historia.
   - Imagen: drag & drop, selección de archivo, preview, reemplazo, eliminación. Estado sin imagen y con imagen.
   - Color: selector nativo de color + input hexadecimal manual, sample visual, botón "Sin color".
   - Booleanos: switches visuales para `IsFeatured` (Editorial Destacada) e `IsAlive` (¿En Operación / Existente?).
   - Validación visual con mensajes de error por campo.
   - Estados: Guardando (spinner), Error de validación, Error de API, Guardado exitoso (redirect simulado).
   - Modal de confirmación antes de guardar.
   - En modo edición, carga datos mock por ID desde `MOCK_PUBLISHERS` (simula API).
2. **`types/publisher.ts`**: tipo `Publisher` reutilizado desde el listado.
3. **`app/router/routes.tsx`**: rutas ya agregadas en TASK-DASH-0051.

### Validación

- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.
- No implementa POST/PUT real ni subida de imágenes (maqueta únicamente).
