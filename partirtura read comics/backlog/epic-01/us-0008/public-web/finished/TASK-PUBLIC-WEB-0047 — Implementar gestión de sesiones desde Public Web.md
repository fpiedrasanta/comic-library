# TASK-PUBLIC-WEB-0047 — Implementar gestión de sesiones desde Public Web

## Task ID

TASK-PUBLIC-WEB-0047

## Title

Implementar cierre de sesión actual y cierre de todas las sesiones desde Public Web.

## Description

Implementar en Public Web las funcionalidades correspondientes a US-0008.

El usuario debe poder cerrar únicamente la sesión actual desde el menú de usuario y disponer desde Settings de una opción para cerrar todas las sesiones activas de su cuenta:
Revisar el template: `partirtura read comics\ux_ui\settings-template.html` (agregar una caja más y agregar la caja de eliminación de cuenta al final. El orden es: Cambiar pass / Cerrar todas las sesiones / Eliminar cuenta).

También podes revisar el template del dashboard por si te parece buena idea la separación de colores y eso: `partirtura read comics\ux_ui\settings-dashboard-template.html`

El comportamiento debe integrarse con los endpoints de sesión proporcionados por Backend.

## Expected Result

El usuario podrá:

- cerrar únicamente la sesión actual;
- mantener activas sus sesiones en otros dispositivos;
- acceder desde Settings a la opción de cerrar todas las sesiones;
- confirmar el cierre global;
- quedar deslogueado de todas las sesiones luego de ejecutar la operación.

## Relevant Context

### User Story

US-0008 — Gestionar sesiones y cerrar sesión

### Página existente

`SettingsPage`

### Template existente

`settings-template.html`

La sección de cierre de sesión ya forma parte del menú de usuario.

La nueva opción de cierre global debe incorporarse en Settings sin implementar la eliminación de cuenta.

## Scope

### Included

- Integración del logout actual con el nuevo comportamiento por sesión.
- Opción "Cerrar todas las sesiones" dentro de Settings.
- Confirmación de la acción.
- Estados de loading.
- Manejo de errores.
- Limpieza del estado local de autenticación.
- Redirección al login.
- Actualización de componentes/documentación cuando corresponda.

### Excluded

- Cambios en Backend.
- Eliminación de cuenta.
- Cambio de contraseña.
- Administración de sesiones desde Dashboard.

## Acceptance Criteria

- [x] El usuario puede cerrar la sesión actual desde UserMenu.
- [x] El logout no provoca el cierre de otras sesiones del usuario.
- [x] Existe una acción claramente identificada para "Cerrar todas las sesiones".
- [x] La acción se encuentra dentro de Settings.
- [x] La acción solicita confirmación antes de ejecutarse.
- [x] La operación utiliza el endpoint correspondiente del backend.
- [x] Mientras se ejecuta la operación se muestra un estado de carga.
- [x] Si la operación falla, se informa correctamente al usuario.
- [x] Luego de cerrar todas las sesiones, la sesión actual también queda finalizada.
- [x] El usuario es redirigido al login.
- [x] La aplicación no intenta mantener una sesión local inválida.
- [x] La interfaz respeta los patrones visuales existentes de Settings.
- [x] La implementación no incluye la sección de eliminación de cuenta.

## Execution Result

### Status

finished

### Completed Work

1. Agregado `logoutAll()` en `AuthenticationRepository` consumiendo `POST /api/users/logout-all`.
2. Agregado `logoutAll` en `AuthContext` y `useAuth`.
3. Actualizada `SettingsPage` con nueva sección "Cerrar todas las sesiones":
   - Confirmación explícita antes de ejecutar.
   - Estado de loading durante la operación.
   - Manejo de errores.
   - Limpieza de estado local y redirección al login mediante `logout()`.
4. El logout individual desde `UserMenu` ya existía y continúa funcionando únicamente sobre la sesión actual.

### Validation

- `npm run build`: compiló correctamente.
- Pruebas manuales verificadas:
  1. Logout individual desde UserMenu: solo cierra la sesión actual, las demás permanecen activas.
  2. Logout all desde Settings: cierra todas las sesiones del usuario autenticado, incluyendo la actual.
  3. Sesiones de Public Web y Dashboard son independientes; cerrar una no afecta la otra.
  4. El usuario es redirigido al login luego de cualquiera de las dos operaciones.

### Files Modified

- `public-web/public-web/features/authentication/api/authentication-repository.ts`
- `public-web/public-web/features/authentication/hooks/use-auth.tsx`
- `public-web/public-web/pages/settings-page.tsx`

### Observations

No se requirieron nuevos endpoints. El endpoint `POST /api/users/logout-all` ya estaba documentado en `endpoints.md`. No se incluyó la sección de eliminación de cuenta según el alcance definido.
