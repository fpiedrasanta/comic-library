# TASK-DASH-0013 — Implementar cierre de sesión actual y cierre de todas las sesiones

## Task ID

TASK-DASH-0013

## Title

Implementar gestión de sesiones desde el Dashboard administrativo.

## Description

Adaptar el Dashboard para soportar el comportamiento definido en US-0008.

El logout desde el Dashboard debe cerrar únicamente la sesión administrativa actual.

No debe invalidar sesiones independientes existentes en Public Web u otros dispositivos.

El Dashboard debe utilizar el mecanismo de sesiones proporcionado por el backend.

La opción de cerrar todas las sesiones debe estar disponible para el usuario administrativo autenticado, de acuerdo con el diseño y estructura del Dashboard: `partirtura read comics\ux_ui\settings-dashboard-template.html`

## Expected Result

Un administrador podrá:

- cerrar únicamente su sesión actual del Dashboard;
- mantener sesiones independientes activas en otros dispositivos o aplicaciones;
- cerrar todas sus sesiones cuando lo necesite.

## Relevant Context

User Story:

US-0008 — Gestionar sesiones y cerrar sesión

El Dashboard y Public Web comparten el sistema de identidad, pero las sesiones deben ser independientes.

Cerrar sesión desde Dashboard no debe cerrar una sesión independiente de Public Web.

Cerrar todas las sesiones debe invalidar todas las sesiones asociadas al usuario.

## Scope

### Included

- Integración del logout del Dashboard con sesiones independientes.
- Opción de cerrar todas las sesiones.
- Confirmación de cierre global.
- Manejo de loading.
- Manejo de errores.
- Limpieza del estado de autenticación.
- Redirección al login del Dashboard.
- Actualización de documentación cuando corresponda.

### Excluded

- Cambios en Backend.
- Eliminación de cuenta.
- Cambio de contraseña.
- Administración de usuarios.

## Acceptance Criteria

- [ ] El administrador puede cerrar su sesión actual desde el Dashboard.
- [ ] El logout no invalida sesiones independientes del mismo usuario.
- [ ] El Dashboard dispone de una opción para cerrar todas las sesiones.
- [ ] La acción de cierre global requiere confirmación.
- [ ] La operación utiliza el endpoint correspondiente del backend.
- [ ] Se muestran estados de loading y errores apropiados.
- [ ] Al cerrar la sesión actual, el administrador es redirigido al login del Dashboard.
- [ ] Al cerrar todas las sesiones, todas las sesiones del usuario quedan invalidadas.
- [ ] Una sesión independiente del Public Web queda invalidada al ejecutar "Cerrar todas las sesiones".
- [ ] La implementación no crea un mecanismo de autenticación independiente del Public Web.

## Execution Result

### Status
Finished

### Completed Work
- Se agregó `logoutAll()` al servicio `authService` llamando a `POST /users/logout-all`.
- Se modificó `settings-page.tsx` para incluir la sección "Sesiones activas".
- Se implementó la opción "Cerrar todas las sesiones" con confirmación explícita del usuario.
- Se agregaron estados de loading, error y éxito para la operación.
- Al confirmar "Cerrar todas las sesiones", se limpia el estado de autenticación y se redirige a `/login`.
- El logout actual del Dashboard ya estaba implementado en el `DashboardLayout` usando `/users/logout`, que cierra únicamente la sesión actual sin afectar otras sesiones independientes.
- No se creó un mecanismo de autenticación paralelo ni independiente del Public Web.

### Validation
- Dashboard compila correctamente: 0 errores, 0 warnings.
- Logout actual desde el sidebar redirige a `/login` y limpia el estado local.
- Logout all desde Settings muestra confirmación, loading, manejo de errores y redirección a `/login`.
- No se modifica el backend ni se crean endpoints nuevos.

### Files Modified
- `dashboard/features/authentication/services/auth.service.ts` (modificado)
- `dashboard/pages/settings-page.tsx` (modificado)

### Observations
- El endpoint `/users/logout` del backend cierra únicamente la sesión actual, por lo que el logout del sidebar ya cumplía con el requisito de no afectar sesiones independientes.
- El endpoint `/users/logout-all` invalida todas las sesiones activas del usuario, incluyendo Public Web y Dashboard.
- La redirección después de `logoutAll` se realiza con un delay breve para mostrar el mensaje de éxito al usuario.
