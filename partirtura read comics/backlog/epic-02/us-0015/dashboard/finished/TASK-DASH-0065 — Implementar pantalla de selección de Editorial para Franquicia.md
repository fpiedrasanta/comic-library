# TASK-DASH-0065 — Implementar pantalla de selección de Editorial para Franquicia

## Objetivo

Implementar en el Dashboard la pantalla utilizada para seleccionar la Editorial asociada a una nueva Franquicia.

Utilizar como referencia visual y estructural el siguiente template UX/UI:

C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\seleccionar-editorial.html

La implementación debe respetar la estructura visual, distribución, componentes, estados y estilos definidos en el template.

## Alcance funcional

Implementar la pantalla como maqueta, utilizando datos mock locales.

Debe permitir:

- Visualizar las Editoriales disponibles.
- Buscar Editorial.
- Seleccionar una Editorial.
- Confirmar visualmente la selección.
- Continuar al formulario de Franquicia.

La pantalla es exclusivamente de selección.

Desde esta pantalla no deben estar disponibles las acciones administrativas de Editorial:

- Crear Editorial.
- Editar Editorial.
- Desactivar Editorial.
- Reactivar Editorial.

## Navegación

Implementar el flujo:

Listado de Franquicias
→ Nueva Franquicia
→ Seleccionar Editorial
→ Formulario de Franquicia.

La Editorial seleccionada debe quedar disponible como contexto para el formulario de creación.

## Documentación

Actualizar:

- `pages.md`
- `components.md`

Registrar la nueva página y los componentes creados o reutilizados.

## Restricciones

No implementar integración con API en esta task.

No modificar:

- `endpoints.md`
- Contratos de API.
- Servicios del Backend.
- Código del Backend.

## Criterio de aceptación

El administrador debe poder seleccionar visualmente una Editorial y continuar al formulario de creación de Franquicia.

La pantalla debe reproducir el template UX/UI proporcionado.

## Resultado de la ejecución

### Estado: FINISHED

### Cambios realizados

1. **`features/franchises/services/publisher-mock.service.ts`**: servicio mock local para editoriales con `getPublishersForSelection()`. Datos estáticos, simula latencia, soporta búsqueda, filtro por país y ordenamiento.

2. **`pages/franchise-select-publisher-page.tsx`**: pantalla de selección de editorial con:
   - Tabla de editoriales con imagen, nombre, país, color.
   - Búsqueda por nombre o país.
   - Filtro por país.
   - Ordenamiento por nombre o país.
   - Selección visual con resaltado de fila, badge "Seleccionada" y botón "Continuar".
   - Navegación al formulario de creación de franquicia con `location.state` carrying la editorial seleccionada.
   - Sin acciones administrativas (solo selección).
   - Estados: loading skeleton, error, listado vacío.

3. **`app/router/routes.tsx`**: agregada ruta `/franchises/select-publisher`.
4. **`pages.md`**: actualizado.
5. **`components.md`**: actualizado.

### Validación
- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.