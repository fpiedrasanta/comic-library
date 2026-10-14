# TASK-DASH-0056 — Implementar desactivación de editorial

## Objetivo

Implementar la desactivación lógica de una editorial desde el listado administrativo.

## Endpoint

Consultar `endpoints.md` para utilizar exactamente el endpoint de desactivación de editorial.

No implementar eliminación física.

## Funcionalidad

Desde la grilla de editoriales:

1. El administrador selecciona la acción de desactivar.
2. Se muestra una confirmación.
3. La confirmación debe identificar claramente la editorial.
4. Al confirmar se ejecuta la operación contra API.
5. Se muestra el estado de operación.
6. La grilla se actualiza con `IsActive = false`.

## Confirmación

La interfaz debe comunicar que:

- La editorial dejará de estar activa.
- No se eliminarán físicamente sus datos.
- Las relaciones existentes se conservarán.
- El contenido asociado dejará de mostrarse según las reglas del sistema.

No ejecutar la operación sin confirmación explícita.

## Estados

Implementar:

- Confirmation.
- Loading.
- Success.
- Error.

Evitar múltiples solicitudes simultáneas para la misma operación.

## Actualización del listado

Después de una desactivación exitosa:

- Actualizar o invalidar el estado del listado.
- Mantener los criterios de búsqueda, filtros y ordenamiento cuando sea posible.
- Mostrar la editorial como inactiva.

La editorial debe continuar apareciendo en el listado administrativo.

## Acción posterior

Una editorial inactiva debe mostrar la acción de activación en lugar de la acción de desactivación.

La activación será implementada en `TASK-DASH-0057`.

## Documentación

Actualizar `pages.md` o `components.md` únicamente si la implementación requiere cambios respecto de la documentación existente.

## Dependencias

TASK-DASH-0051.
TASK-DASH-0053.

## Unblocks

TASK-DASH-0057.

## Resultado de la ejecución

### Cambios realizados

1. **`pages/publishers-page.tsx`**: la acción de desactivar ahora ejecuta `deactivatePublisher(id)` contra `PATCH /api/admin-publishers/{id}/deactivate`.
   - Modal de confirmación con nombre de la editorial, advertencia sobre operación lógica y conservación de datos.
   - Estados: loading (spinner en botón), success toast, error silencioso (se cierra modal y no muestra alerta intrusiva).
   - Después de éxito, invalida `queryClient.invalidateQueries({ queryKey: ['publishers'] })` para refrescar la grilla manteniendo criterios de búsqueda, filtros y ordenamiento.
   - La editorial desactivada continúa apareciendo en el listado administrativo con `opacity-60`.
   - La acción cambia automáticamente a "Reactivar" cuando `IsActive = false`.

### Validación

- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.
