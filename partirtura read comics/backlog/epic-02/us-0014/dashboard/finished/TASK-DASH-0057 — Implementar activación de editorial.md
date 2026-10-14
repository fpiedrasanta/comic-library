# TASK-DASH-0057 — Implementar activación de editorial

## Objetivo

Implementar la activación lógica de una editorial previamente desactivada desde el listado administrativo.

## Endpoint

Consultar `endpoints.md` para utilizar exactamente el endpoint de activación de editorial.

## Funcionalidad

Desde una editorial cuyo estado `IsActive` sea `false`:

1. Mostrar la acción de activar.
2. Ejecutar la operación contra API.
3. Mostrar el estado de la operación.
4. Actualizar la grilla con `IsActive = true`.

La operación no debe crear una nueva editorial ni modificar sus relaciones.

## Estados

Implementar:

- Loading.
- Success.
- Error.

Evitar múltiples solicitudes simultáneas para la misma operación.

## Actualización del listado

Después de una activación exitosa:

- Actualizar o invalidar correctamente el estado del listado.
- Mantener los criterios de búsqueda, filtros y ordenamiento cuando sea posible.
- Mostrar la editorial como activa.
- Volver a mostrar la acción de desactivación.

## Documentación

Actualizar `pages.md` o `components.md` únicamente si la implementación requiere cambios respecto de la documentación existente.

## Dependencias

TASK-DASH-0053.
TASK-DASH-0056.

## Unblocks

Ninguna.

## Resultado de la ejecución

### Cambios realizados

1. **`pages/publishers-page.tsx`**: la acción de reactivar ahora ejecuta `activatePublisher(id)` contra `PATCH /api/admin-publishers/{id}/activate`.
   - Modal de confirmación con nombre de la editorial.
   - Estados: loading (spinner en botón), success toast.
   - Después de éxito, invalida `queryClient.invalidateQueries({ queryKey: ['publishers'] })` para refrescar la grilla manteniendo criterios de búsqueda, filtros y ordenamiento.
   - La editorial reactivada vuelve a mostrar acción de "Desactivar" y `opacity` normal.
   - No se crea una nueva editorial ni se modifican relaciones.

### Validación

- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.
