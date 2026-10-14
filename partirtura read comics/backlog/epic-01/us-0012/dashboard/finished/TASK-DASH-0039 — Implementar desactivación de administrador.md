# TASK-DASH-0039 — Implementar desactivación de administrador

## Objetivo

Implementar la funcionalidad para desactivar/eliminar lógicamente un usuario administrador desde el listado.

La operación no debe realizar una eliminación física si el backend define la cuenta como baja lógica.

## Flujo

El flujo debe ser:

`Listado → Eliminar/Desactivar → Confirmación → Listado`

Al seleccionar la acción deberá mostrarse un mensaje de control indicando claramente el administrador afectado.

Ejemplo:

> ¿Estás seguro que deseas desactivar al administrador Federico Piedrasanta?

El administrador debe poder cancelar la operación.

## Confirmación

Una vez confirmada la operación:

1. Enviar la solicitud al backend.
2. Esperar respuesta exitosa.
3. Mostrar:

`Administrador desactivado`

4. Actualizar el listado.
5. Permanecer en la misma pantalla.

No debe realizarse una navegación innecesaria hacia otra pantalla.

## Reglas

El frontend no debe interpretar `IsActive` como `IsBanned`.

En esta funcionalidad:

- `User.IsActive = true` significa que la cuenta está activa.
- `User.IsActive = false` significa que la cuenta fue dada de baja/desactivada.
- Los baneos pertenecen exclusivamente al modelo `Ban`.

## Errores

Ante un error:

- Mostrar el mensaje recibido por backend.
- No modificar artificialmente el estado local.
- Mantener al administrador en el listado.

## Criterios de aceptación

- [ ] Existe confirmación antes de desactivar.
- [ ] El administrador afectado se identifica claramente.
- [ ] La operación utiliza el endpoint correspondiente.
- [ ] No se realiza DELETE físico desde frontend.
- [ ] Se muestra confirmación `Administrador desactivado`.
- [ ] La grilla se actualiza después de la operación.
- [ ] El usuario permanece en la grilla.
- [ ] Los filtros y paginación se conservan cuando corresponda.
- [ ] Los errores se muestran correctamente.
- [ ] No se confunde `User.IsActive` con `IsBanned`.
- [ ] El Dashboard compila correctamente.

## Dependencies

TASK-DASH-0037

## Assigned to

Dashboard Agent

## Status

Finished

## Completed Work

- Implementada funcionalidad de desactivación/activación de administrador desde el listado.
- Creado servicio `admin.service.ts` con métodos `deactivateAdmin` y `activateAdmin`.
- La desactivación usa `PATCH /api/admin-users/{userId}/deactivate`.
- La reactivación usa `PATCH /api/admin-users/{userId}/activate`.
- No se realiza DELETE físico; se usa baja lógica mediante `IsActive`.
- Modal de confirmación antes de desactivar con mensaje claro del administrador afectado.
- Toast de confirmación después de operación exitosa.
- La grilla se actualiza localmente después de la operación.
- Los filtros y paginación se conservan.
- Errores del backend se muestran sin modificar el estado local artificialmente.
- Verificado que no se confunde `User.IsActive` con `IsBanned`.
- Dashboard compila correctamente.

## Pending Work

Ninguno.

## Blocked task

Ninguno.

## Unblocked

Ninguno.