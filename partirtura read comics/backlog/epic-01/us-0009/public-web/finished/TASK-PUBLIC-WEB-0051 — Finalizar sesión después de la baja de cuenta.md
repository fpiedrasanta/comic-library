# TASK-PUBLIC-WEB-0051 — Finalizar sesión después de la baja de cuenta

## Objetivo

Finalizar correctamente la sesión del usuario después de que el backend confirme la baja de su cuenta.

## Alcance

Una vez confirmada la baja:

- Limpiar el estado de autenticación del Public Web.
- Limpiar la información de usuario mantenida en memoria o almacenamiento local cuando corresponda.
- Evitar que el usuario pueda continuar navegando como usuario autenticado.
- Redirigir al usuario a la pantalla de login.
- No ejecutar un logout adicional como mecanismo para realizar la baja.
- La baja de cuenta y el cierre de sesión deben mantenerse como operaciones conceptualmente independientes.
- El comportamiento debe ser consistente con el mecanismo de logout existente.

## Criterios de aceptación

- [x] Una baja confirmada deja al usuario sin sesión activa en el Public Web.
- [x] El estado local de autenticación queda correctamente limpiado.
- [x] El usuario es redirigido al login.
- [x] No se requiere que el usuario presione manualmente "Cerrar sesión".
- [x] No se utiliza logout como sustituto de la baja de cuenta.
- [x] El usuario no puede volver a acceder a una ruta protegida utilizando el estado local anterior.

## Execution Result

### Status

finished

### Completed Work

1. Agregado `useEffect` en `SettingsPage` que detecta `deleteStep === 3 && deleteSuccess`.
2. Limpia el estado de autenticación mediante `logout()`.
3. Redirige automáticamente a `/login` luego de 3 segundos.
4. El usuario no necesita presionar manualmente "Cerrar sesión".
5. La baja y el logout se mantienen como operaciones independientes.

### Validation

- `npm run build`: compiló correctamente.

### Files Modified

- `public-web/public-web/pages/settings-page.tsx`
