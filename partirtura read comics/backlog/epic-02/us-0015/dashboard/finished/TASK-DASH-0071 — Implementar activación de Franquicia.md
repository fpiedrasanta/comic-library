# TASK-DASH-0071 — Implementar activación de Franquicia

Implementar la funcionalidad de activación de Franquicias desde el listado.

Debe:

- Mostrar una acción "Reactivar" para franquicias inactivas.
- Solicitar confirmación antes de ejecutar la operación.
- Mostrar el nombre de la franquicia en la confirmación.
- Consumir el endpoint de activación definido en `project/endpoints.md`.
- Mostrar estado de procesamiento mientras se ejecuta la operación.
- Mostrar confirmación de operación exitosa.
- Invalidar/refrescar la consulta de franquicias.
- Mantener los criterios actuales de búsqueda, filtros, ordenamiento y paginación cuando sea posible.

La operación no debe crear una nueva franquicia ni modificar sus relaciones.

No modificar `project/endpoints.md`.

Validar la solución mediante `tsc` y `vite build`.

## Resultado de la ejecución

### Estado: FINISHED

### Cambios realizados

La funcionalidad de activación ya estaba implementada en `pages/franchises-page.tsx` desde la integración de TASK-DASH-0067. Cumple con todos los criterios:

- Acción "Reactivar" visible solo para franquicias inactivas.
- Modal de confirmación con el nombre de la franquicia.
- Consume `activateFranchise()` → `PATCH /api/admin-franchises/{id}/activate`.
- Estado de procesamiento durante la operación (`isSaving`).
- Toast de confirmación de éxito.
- Invalida la query de franquicias para refrescar el listado.
- Mantiene los criterios de búsqueda, filtros, ordenamiento y paginación porque la query se invalida y se vuelve a ejecutar con los mismos parámetros.
- No crea una nueva franquicia ni modifica sus relaciones.

### Validación
- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.
