# TASK-DASH-0068 — Implementar selección de editorial para Franquicia

Implementar la pantalla de selección de editorial utilizando como referencia la maqueta:

C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\seleccionar-editorial.html

La pantalla forma parte del flujo de creación y edición de una Franquicia.

Debe:

- Consultar las editoriales mediante el endpoint existente de Editoriales.
- Mostrar las editoriales mediante un listado paginado.
- Permitir buscar por nombre de editorial o país.
- Permitir seleccionar una editorial.
- Permitir cancelar y volver al formulario de Franquicia.
- Al seleccionar una editorial, regresar al formulario conservando el contexto de la operación.
- Al regresar al formulario, establecer el `PublisherId` seleccionado.
- En modo edición, permitir cambiar la editorial actualmente asociada a la franquicia.

La pantalla de selección no debe permitir:

- Crear editoriales.
- Editar editoriales.
- Desactivar editoriales.
- Reactivar editoriales.

Su única responsabilidad dentro de este flujo es seleccionar una editorial existente.

## Resultado de la ejecución

### Estado: FINISHED

### Cambios realizados

1. **`pages/franchise-select-publisher-page.tsx`**: actualizada para consumir el endpoint real de editoriales mediante `getPublishers` de `publisher.service.ts`. Ahora consulta `/api/admin-publishers` con `isActive: true`, soporta búsqueda por nombre o país, ordenamiento por nombre o país, y paginación del backend.

2. **`features/franchises/services/publisher-mock.service.ts`**: eliminado. La selección de editorial ya no depende de datos mock.

3. **`pages/franchise-form-page.tsx`**: ajustada para recibir `PublisherSelectItem` desde `location.state` sin depender del servicio mock eliminado.

### Validación
- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.