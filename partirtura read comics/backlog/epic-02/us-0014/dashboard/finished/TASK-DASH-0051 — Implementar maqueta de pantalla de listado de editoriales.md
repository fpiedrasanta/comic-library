# TASK-DASH-0051 — Implementar maqueta de pantalla de listado de editoriales

## Objetivo

Implementar en el Dashboard la maqueta visual de la pantalla administrativa de listado de editoriales correspondiente a US-0014 — Administrar editoriales.

La implementación debe utilizar como referencia visual el template entregado por UX/UI:

`C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\listar-editoriales.html`

Esta task comprende exclusivamente la construcción de la interfaz. La integración con la API se realizará en una task posterior.

## Alcance

La pantalla debe representar:

- Título `Editoriales`.
- Campo de búsqueda.
- Filtros de `Destacadas` y `Viva`.
- Selector de ordenamiento.
- Selector de dirección ASC/DESC.
- Grilla de editoriales.
- Paginación.
- Acciones disponibles sobre cada editorial.
- Imagen representativa cuando exista.
- Color mediante una muestra visual.
- Estado `IsFeatured`.
- Estado `IsAlive`.
- Estado `IsActive`.

La pantalla debe utilizar datos estáticos o mocks locales únicamente para permitir visualizar correctamente todos los estados de la interfaz.

Estos datos no deben considerarse integración funcional con el backend.

## Grilla

La grilla debe contemplar:

- Imagen.
- Nombre.
- País.
- Color.
- Destacada.
- Viva.
- Activa.
- Acciones.

Los estados booleanos deben representarse mediante los componentes visuales definidos en el template, utilizando check verde para `true` y cruz roja para `false`.

El color debe representarse visualmente mediante una muestra circular. No es necesario mostrar el valor hexadecimal.

## Acciones

La maqueta debe contemplar visualmente:

- Editar.
- Desactivar/eliminar.
- Activar cuando la editorial esté inactiva.

La confirmación de desactivación debe respetar el patrón visual utilizado por el Dashboard.

No debe implementarse todavía la comunicación con la API.

## Estados

Implementar la representación visual necesaria para:

- Listado con resultados.
- Listado vacío.
- Loading.
- Error.
- Editorial activa.
- Editorial inactiva.
- Editorial destacada.
- Editorial no destacada.
- Editorial viva.
- Editorial no viva.
- Editorial con imagen.
- Editorial sin imagen.

## Responsive

La pantalla debe respetar los patrones responsive existentes en el Dashboard y el comportamiento definido por el template.

## Componentización

Reutilizar componentes existentes cuando corresponda.

No duplicar componentes que ya existan en el Dashboard.

Si el template requiere un nuevo componente reutilizable, incorporarlo siguiendo la arquitectura y coding rules existentes.

## Documentación

Actualizar:

- `pages.md` con la nueva pantalla de listado de editoriales.
- `components.md` con los nuevos componentes creados, si corresponde.

La documentación debe reflejar la implementación real.

## Restricciones

No implementar:

- Llamadas a API.
- Paginación real.
- Búsqueda real.
- Filtros reales.
- Ordenamiento real.
- Creación.
- Edición.
- Activación.
- Desactivación.

Estas funcionalidades serán implementadas en tasks posteriores.

## Dependencias

Ninguna.

## Unblocks

TASK-DASH-0053.

## Resultado de la ejecución

### Cambios realizados

1. **`types/publisher.ts` (nuevo)**: creado tipo `Publisher` con todos los campos requeridos (imagen, nombre, descripción, website, país, año fundación, historia, `IsAlive`, `Color`, `IsFeatured`, `IsActive`).
2. **`pages/publishers-page.tsx` (nuevo)**: implementada maqueta de listado siguiendo el template `listar-editoriales.html`.
   - Datos mock locales con 4 editoriales representando todos los estados (activa/inactiva, destacada/no destacada, viva/cerrada, con/sin imagen).
   - Búsqueda por nombre y país.
   - Filtros visuales de Destacadas y Viva (sin funcionalidad backend).
   - Ordenamiento por Nombre y País, dirección ASC/DESC.
   - Paginación funcional con datos locales.
   - Tabla con columnas: Imagen, Nombre, País, Color (sample circular), Destacada, Viva, Activa, Acciones.
   - Estados visuales con check verde (true) y cruz roja (false).
   - Acciones: Editar, Desactivar, Reactivar.
   - Modales de confirmación para desactivación y reactivación.
   - Estados: loading overlay, error, vacío, success toast.
3. **`pages/dashboard-layout.tsx`**: agregado item de menú "Editoriales" con icono `BookOpen` en el sidebar.
4. **`app/router/routes.tsx`**: agregadas rutas `/publishers`, `/publishers/create`, `/publishers/:id/edit`.

### Validación

- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.
- La maqueta representa todos los estados requeridos sin integración backend.
