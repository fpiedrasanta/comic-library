# TASK-DASH-0064 — Implementar pantalla de listado de Franquicias

## Objetivo

Implementar en el Dashboard la pantalla de listado de Franquicias utilizando como referencia visual y estructural el siguiente template UX/UI:

C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\listar-franquicias.html

La implementación debe respetar la estructura visual, distribución, componentes, estados y estilos definidos en el template.

## Alcance funcional

Implementar la pantalla como maqueta, utilizando datos mock locales.

Debe contemplar:

- Listado de Franquicias.
- Búsqueda.
- Filtro por Destacada.
- Filtro por Vigente.
- Filtro por Activa.
- Ordenamiento por:
  - Nombre.
  - País de la Editorial.
  - Editorial.
- Dirección ASC/DESC.
- Paginación.
- Visualización de imagen.
- Visualización de color.
- Estados booleanos mediante los indicadores definidos en el template.
- Acción Editar.
- Acción Desactivar.
- Acción Reactivar.
- Confirmación antes de desactivar.
- Confirmación antes de reactivar.
- Estados de carga, error y listado vacío, cuando correspondan al diseño.

La maqueta debe representar diferentes combinaciones de estados para permitir validar visualmente la pantalla.

## Navegación

Implementar la navegación hacia:

- Selección de Editorial para crear una Franquicia.
- Formulario de edición de una Franquicia.

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

La pantalla debe reproducir el template UX/UI y permitir recorrer las interacciones principales mediante datos mock.

El resultado debe quedar preparado para que una task posterior reemplace los datos mock por la API real.

## Resultado de la ejecución

### Estado: FINISHED

### Cambios realizados

1. **`types/franchise.ts`**: nuevos tipos `FranchiseListItemDto`, `FranchiseDetailDto`, `FranchiseListResponse` alineados al contrato `endpoints-franchises.md`.

2. **`features/franchises/services/franchise.service.ts`**: servicio mock con `getFranchises()` y `getFranchiseById()`. Datos locales, simula latencia, soporta filtros, búsqueda y ordenamiento.

3. **`pages/franchises-page.tsx`**: pantalla de listado completa con:
   - Búsqueda por nombre de franquicia, editorial o país.
   - Filtros: Destacada, Vigente, Activa.
   - Ordenamiento: Nombre, País de la editorial, Editorial.
   - Dirección ASC/DESC.
   - Paginación con input de página.
   - Tabla con Imagen, Nombre, Editorial, País, Color, Destacada, Vigente, Activa, Acciones.
   - Acciones Editar, Desactivar, Reactivar con modal de confirmación.
   - Estados: loading skeleton, error, listado vacío, toast de éxito.
   - Navegación a selección de editorial (`/franchises/select-publisher`) y edición (`/franchises/:id/edit`).

4. **`app/router/routes.tsx`**: agregada ruta `/franchises` apuntando a `FranchisesPage`.

5. **`pages.md`**: actualizado con las nuevas páginas de franquicias.
6. **`components.md`**: actualizado con `FranchisesPage`.

### Validación
- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.