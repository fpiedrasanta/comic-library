# TASK-DASH-0021 — Implementar listado de usuarios

## Objetivo

Implementar la visualización de los usuarios obtenidos desde el backend respetando la estructura visual definida en `admin-users-dashboard.html`.

## Información visible

Cada usuario debe mostrar:

- Avatar.
- Nombre y apellido.
- Email.
- Nacionalidad.
- Fecha de registro.
- Cantidad de baneos.
- Estado actual.

## Estado del usuario

La representación visual debe permitir distinguir:

- Usuario activo y no baneado.
- Usuario actualmente baneado.
- Usuario inactivo.

El estado de baneo debe representar el estado actual del usuario, no simplemente la existencia histórica de baneos.

## Avatar

El response utilizado para construir cada card debe incluir la información necesaria para mostrar el avatar del usuario.

Si el usuario no posee avatar, debe utilizarse el mecanismo de fallback ya existente en el Dashboard.

## Reglas

- No deben mostrarse acciones de edición.
- No deben mostrarse acciones de eliminación.
- No debe mostrarse ninguna acción que permita modificar información del usuario.
- La cantidad de baneos debe representar la cantidad histórica de baneos asociados al usuario.

## Criterios de aceptación

- [ ] Cada usuario se representa mediante una card.
- [ ] La card muestra avatar.
- [ ] La card muestra nombre y apellido.
- [ ] La card muestra email.
- [ ] La card muestra nacionalidad.
- [ ] La card muestra fecha de registro.
- [ ] La card muestra cantidad de baneos.
- [ ] La card muestra el estado actual.
- [ ] El listado es exclusivamente de consulta.

## Execution Result

### Status
Finished

### Completed Work
- Se implementó la visualización de usuarios mediante cards en grilla responsive.
- Cada card muestra: avatar, nombre y apellido, email, nacionalidad, fecha de registro, cantidad de baneos y estado actual.
- El estado se representa visualmente: Active (verde), Temp Ban (amarillo), Inactive (rojo).
- No existen acciones de edición, eliminación ni modificación.
- La cantidad de baneos representa el total histórico del usuario.

### Validation
- Dashboard compila correctamente: 0 errores, 0 warnings.
- Las cards respetan la estructura visual del template.
- El listado es exclusivamente de consulta.

### Files Modified
- `dashboard/pages/users-page.tsx` (creado)

### Observations
- Se reutilizaron estilos y componentes existentes del Dashboard.
- El avatar se muestra con fallback visual cuando no existe.
