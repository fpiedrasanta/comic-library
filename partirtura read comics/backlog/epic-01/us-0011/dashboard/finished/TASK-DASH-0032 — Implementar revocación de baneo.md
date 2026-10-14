# TASK-DASH-0032 — Implementar revocación de baneo

## Task ID

TASK-DASH-0032

## Title

Implementar revocación de baneo desde el listado

## Description

Implementar la funcionalidad para revocar/anular un Ban desde el listado de Baneos.

La operación se presenta visualmente como `Eliminar`, pero **no debe eliminar físicamente el registro de la base de datos**.

El historial de Baneos debe conservarse para fines de auditoría.

## Flujo

`Listado de Baneos → Eliminar → Confirmación → Revocar Ban → Confirmación → Listado`

No debe navegar a otra pantalla.

## Confirmación

Al seleccionar `Eliminar`, mostrar:

`¿Estás seguro que deseas eliminar el baneo vigente de [Nombre Completo]?`

La confirmación debe dejar claro que se está revocando/anulando el Ban.

Cancelar:

- No realiza ninguna operación.
- Cierra la confirmación.
- Permanece en el listado.

## Operación

Al confirmar:

- Ejecutar la operación mediante el API Client.
- Identificar el Ban mediante su `BanId`.
- El backend debe realizar la operación mediante `IsActive`.
- No ejecutar DELETE físico.
- No eliminar el historial del usuario.

## Resultado

Si la operación es exitosa:

Mostrar:

`Baneo eliminado`

Si se utiliza toast:

- Mostrar el toast.
- Permanecer en la pantalla.
- Actualizar la grilla después de la operación.

No debe navegarse fuera del listado.

## Actualización

Después de una revocación exitosa:

- El registro debe dejar de aparecer como Ban activo.
- La grilla debe reflejar el nuevo estado.
- Los filtros actuales deben mantenerse cuando corresponda.
- La página actual debe conservarse si continúa siendo válida.

## BanCount

La revocación de un Ban no debe borrar el historial.

Por lo tanto, el `BanCount` histórico debe seguir considerando el registro revocado.

El `BanCount` no debe incluir registros que hayan sido eliminados lógicamente mediante `IsActive = false` si el contrato del backend define dichos registros como excluidos del conteo.

El frontend debe respetar el valor calculado por Backend y no calcular `BanCount` localmente.

## Restricciones

- No realizar DELETE físico.
- No eliminar registros del historial.
- No realizar `fetch` directo.
- Utilizar el API Client centralizado.
- No abandonar la grilla después de eliminar/revocar.
- No implementar lógica de persistencia en frontend.

## Validation

- El botón `Eliminar` muestra confirmación.
- El nombre del usuario aparece correctamente en la confirmación.
- Cancelar no modifica nada.
- Confirmar ejecuta la operación.
- El Ban queda inactivo mediante el mecanismo definido por backend.
- El historial permanece disponible.
- Se muestra `Baneo eliminado`.
- La grilla se actualiza.
- El usuario permanece en la grilla.
- No existe DELETE físico desde frontend.
- Dashboard compila correctamente.

## Dependencies

`TASK-DASH-0026`

Backend — Endpoint de revocación/anulación de Ban.

## Assigned to

Frontend Dashboard Agent

## Status

Finished

## Completed Work

- Implementada funcionalidad de revocación de ban desde el listado.
- La acción visual es `Eliminar` pero opera como revocación lógica mediante `PATCH /api/bans/{banId}/deactivate`.
- No se ejecuta DELETE físico ni se eliminan registros del historial.
- Se muestra confirmación modal antes de ejecutar la operación.
- El mensaje de confirmación incluye el nombre del usuario afectado.
- Después de la revocación exitosa se muestra `Baneo eliminado` y se actualiza la grilla localmente.
- La grilla permanece en la misma página y conserva los filtros actuales.
- El frontend respeta el valor calculado por backend para `BanCount` sin derivarlo localmente.
- Dashboard compila correctamente.

## Pending Work

Ninguno.

## Blocked task

Ninguno.

## Unblocked

TASK-DASH-0033.