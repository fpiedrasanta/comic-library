# TASK-DASH-0042 — Implementar activación y desactivación de países

## Objetivo

Implementar las operaciones de activación y desactivación lógica de países desde el Dashboard.

## Alcance

Implementar las acciones:

- Desactivar país.
- Activar país.

## Endpoints

Desactivación:

`PATCH /api/countries/{countryId}/deactivate`

Activación:

`PATCH /api/countries/{countryId}/activate`

## Reglas

- No ejecutar DELETE.
- No eliminar físicamente el país.
- La acción disponible debe depender del estado actual.
- La desactivación debe requerir confirmación.
- La activación debe mostrar confirmación o feedback según el patrón UX definido.
- Después de una operación exitosa, actualizar el listado sin perder innecesariamente filtros, ordenamiento o página actual.

## Mensajes

Los mensajes de éxito y error deben utilizar el mecanismo existente del Dashboard.

## Status

Finished

## Completed Work

- Implementadas acciones de desactivación y activación en `countries-page.tsx`.
- Integrado endpoint `PATCH /api/admin-countries/{countryId}/deactivate`.
- Integrado endpoint `PATCH /api/admin-countries/{countryId}/activate`.
- No se ejecuta DELETE físico desde el frontend.
- La acción disponible depende del estado actual del país.
- Implementado modal de confirmación antes de desactivar.
- Implementado modal de confirmación antes de activar.
- Después de operación exitosa, se actualiza el listado local conservando filtros, ordenamiento y página actual.
- Implementados mensajes de éxito y manejo de errores del backend.
- Verificado que un país inactivo no se muestra como eliminado.
- Dashboard compila correctamente.

## Pending Work

Ninguno.

## Blocked task

Ninguno.

## Unblocked

TASK-DASH-0043.