# TASK-DASH-0017 — Finalizar sesión después de la baja de cuenta

## Objetivo

Finalizar correctamente la sesión del usuario del Dashboard después de que el backend confirme la baja de su cuenta.

## Alcance

Una vez confirmada la baja:

- Limpiar el estado de autenticación del Dashboard.
- Limpiar la información del usuario mantenida en memoria o almacenamiento local cuando corresponda.
- Evitar que el usuario pueda continuar navegando como usuario autenticado.
- Redirigir al usuario a la pantalla de login del Dashboard.
- No ejecutar un logout adicional como mecanismo para realizar la baja.
- Mantener la baja de cuenta y el cierre de sesión como operaciones conceptualmente independientes.
- Utilizar el mecanismo de limpieza de sesión existente en el Dashboard.

## Criterios de aceptación

- [ ] Una baja confirmada deja al usuario sin sesión activa en el Dashboard.
- [ ] El estado local de autenticación queda correctamente limpiado.
- [ ] El usuario es redirigido al login del Dashboard.
- [ ] No se requiere que el usuario presione manualmente "Cerrar sesión".
- [ ] No se utiliza logout como sustituto de la baja de cuenta.
- [ ] El usuario no puede volver a acceder a una ruta protegida utilizando el estado local anterior.

## Execution Result

### Status
Finished

### Completed Work
- Una vez confirmada la baja, se limpia el estado de autenticación del Dashboard mediante `useAuthStore.getState().logout()`.
- Se elimina la información del usuario mantenida en memoria.
- Se redirige al usuario a `/login` luego de confirmar la baja.
- No se ejecuta un logout adicional como sustituto de la baja de cuenta.
- La baja de cuenta y el cierre de sesión se mantienen como operaciones conceptualmente independientes.

### Validation
- Dashboard compila correctamente: 0 errores, 0 warnings.
- Una baja confirmada deja al usuario sin sesión activa.
- El usuario no puede volver a acceder a rutas protegidas porque el estado local queda limpio.

### Files Modified
- `dashboard/pages/settings-page.tsx` (modificado)

### Observations
- Se reutiliza el mecanismo de limpieza de sesión existente en el Dashboard.
- La redirección a `/login` se realiza con un delay breve para mostrar el mensaje de éxito.
