# TASK-DASH-0041 — Implementar creación y edición de país

## Objetivo

Implementar el formulario administrativo para crear y editar países: Modal.

## Alcance

Implementar una única página reutilizable para ambos modos:

- Crear país.
- Editar país.

## Campos

- Código.
- Nombre.

El estado `IsActive` no forma parte del formulario.

## Creación

Utilizar:

`POST /api/countries`

Al crear un país, el backend determina que el país comienza activo.

## Edición

Utilizar:

`PUT /api/countries/{countryId}`

El identificador se obtiene de la ruta y no del body.

## Validaciones

Implementar las validaciones definidas por UX/UI y mostrar correctamente los errores devueltos por el backend.

Los errores deben mostrarse sin perder los valores ingresados por el administrador.

## UX

Implementar:

- Estado de carga.
- Deshabilitación durante guardado.
- Confirmación antes de guardar si corresponde al patrón utilizado por Dashboard.
- Mensaje de éxito.
- Navegación de cancelación.
- Manejo de errores.

## Status

Finished

## Completed Work

- Implementado modal reutilizable para creación y edición de país en `countries-page.tsx`.
- Integrado endpoint `POST /api/admin-countries` para creación.
- Integrado endpoint `PUT /api/admin-countries/{countryId}` para edición.
- El identificador del país se obtiene de la ruta, no del body.
- El campo `IsActive` no forma parte del formulario.
- Implementadas validaciones visuales: código obligatorio de 3 caracteres, nombre obligatorio.
- Los errores del backend se muestran sin perder datos ingresados.
- Implementado estado de carga y deshabilitación de botones durante guardado.
- Implementado mensaje de éxito y cierre automático del modal.
- Verificado que no se permite modificar `Id` ni `IsActive` desde el formulario.
- Dashboard compila correctamente.

## Pending Work

Ninguno.

## Blocked task

Ninguno.

## Unblocked

TASK-DASH-0042.