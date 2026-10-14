# TASK-DASH-0037 — Implementar consulta y gestión del listado de administradores

## Objetivo

Integrar la pantalla de listado de administradores con el backend y reemplazar los datos mock por datos reales.

## Alcance

Implementar:

- Consulta de administradores.
- Búsqueda.
- Ordenamiento.
- Dirección de ordenamiento.
- Paginación.
- Estado de cuenta.
- Información de avatar.
- Manejo de errores.

La implementación debe utilizar el API Client existente y mantener la comunicación con backend centralizada en el service correspondiente.

## Búsqueda

La búsqueda deberá respetar los campos definidos por el backend y UX/UI.

Los cambios de búsqueda deberán reiniciar la paginación a la primera página.

## Ordenamiento

Implementar las opciones definidas por el contrato de backend.

Los cambios de ordenamiento deberán actualizar la consulta y mantener el estado de filtros correspondiente.

## Paginación

La paginación deberá utilizar la metadata devuelta por backend.

Debe conservar:

- Búsqueda.
- Ordenamiento.
- Dirección.

al cambiar de página.

## Estados

Implementar correctamente:

- Loading.
- Success.
- Empty.
- No results.
- Error.

Los errores deben mostrarse mediante mensajes comprensibles para el administrador y respetando el contrato común de errores del backend.

## Criterios de aceptación

- [ ] No quedan datos mock en el listado.
- [ ] Los administradores se obtienen desde el backend.
- [ ] La búsqueda funciona contra backend.
- [ ] El ordenamiento funciona contra backend.
- [ ] La paginación funciona contra backend.
- [ ] Los filtros se conservan al cambiar de página.
- [ ] Los estados de loading, empty y error están implementados.
- [ ] No existe lógica duplicada de acceso a API.
- [ ] El Dashboard compila correctamente.

## Dependencies

TASK-DASH-0035

TASK-API-0106

## Assigned to

Dashboard Agent

## Status

Finished

## Completed Work

- Creado servicio `admin.service.ts` con métodos `getAdmins`, `createAdmin`, `updateAdmin`, `deactivateAdmin` y `activateAdmin`.
- Integrado listado de administradores con endpoint `GET /api/admin-users`.
- Reemplazados datos mock por llamadas reales al backend.
- Implementada búsqueda por nombre, apellido y correo con reinicio de paginación.
- Implementado ordenamiento por fecha de registro, nombre, apellido y correo.
- Implementada paginación real con metadata del backend.
- Implementados estados: loading, success, empty, error.
- Los errores del backend se muestran en el listado sin perder filtros.
- Actualizada página `admins-page.tsx` para consumir el servicio.
- Dashboard compila correctamente.

## Pending Work

Ninguno.

## Blocked task

Ninguno.

## Unblocked

TASK-DASH-0038, TASK-DASH-0039.