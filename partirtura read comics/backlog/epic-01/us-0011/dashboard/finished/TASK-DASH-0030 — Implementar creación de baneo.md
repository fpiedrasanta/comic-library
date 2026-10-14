# TASK-DASH-0030 — Implementar creación de baneo

## Task ID

TASK-DASH-0030

## Title

Implementar flujo de creación de baneo

## Description

Implementar el flujo completo para crear un nuevo Ban.

Flujo:

`Listado de Baneos → Crear Baneo → Seleccionar Usuario → Formulario Crear → Confirmación → Guardar → Confirmación → Listado`

## Paso 1 — Crear Baneo

Desde el listado debe existir la acción `Crear Baneo`.

Debe navegar a:

`Seleccionar Usuario`

## Paso 2 — Seleccionar Usuario

La pantalla debe:

- Consultar únicamente usuarios activos.
- Permitir búsqueda por nombre, apellido y email.
- Permitir ordenamiento.
- Permitir paginación.
- Permitir seleccionar usuarios sin Ban vigente.
- Impedir seleccionar usuarios con Ban vigente.

La selección debe conservar el `UserId`.

Después de seleccionar:

`Seleccionar Usuario → Formulario Crear`

## Paso 3 — Formulario

Debe abrirse en modo:

`Crear Baneo`

Debe mostrar los datos del usuario seleccionado.

Campos:

- Fecha desde: obligatoria, precargada con fecha/hora actual.
- Fecha hasta: opcional, vacía por defecto.
- Motivo: libre.

## Paso 4 — Validación

Validar los campos según el contrato del backend.

No permitir guardar si existen errores de validación.

Los errores deben mostrarse en el formulario sin abandonar la pantalla.

## Paso 5 — Confirmación

Antes de guardar mostrar:

`¿Estás seguro que deseas banear a [Nombre Completo]?`

Debajo:

`Datos del baneo`

mostrando:

- Fecha desde.
- Fecha hasta.
- Motivo.

Cancelar la confirmación no realiza ninguna operación.

## Paso 6 — Guardar

Al confirmar:

- Ejecutar la operación mediante el API Client.
- Enviar el `UserId`.
- Enviar fechas convertidas de hora local a UTC.
- Enviar motivo.
- Respetar el contrato del backend.

## Paso 7 — Resultado

Si guarda correctamente:

Mostrar:

`Baneo guardado`

Si se utiliza toast:

- Mostrar el toast.
- Esperar un pequeño delay.
- Navegar al listado.

Resultado:

`Formulario → Listado de Baneos`

Si ocurre un error:

- Mostrar mensaje comprensible.
- Permanecer en el formulario.
- No perder los datos ingresados.

## Seguridad y consistencia

El frontend no debe implementar reglas de autorización propias.

El backend continúa siendo responsable de validar:

- Usuario.
- Estado de la cuenta.
- Existencia de Ban vigente.
- Reglas de negocio.

## Validation

- El flujo completo funciona.
- Solo usuarios activos pueden ser seleccionados.
- Usuarios con Ban vigente no pueden seleccionarse.
- Se confirma antes de guardar.
- Las fechas se convierten correctamente a UTC.
- El Ban se crea correctamente.
- Se muestra `Baneo guardado`.
- Se navega al listado después del delay.
- Los errores mantienen al usuario en el formulario.
- Dashboard compila correctamente.

## Dependencies

`TASK-DASH-0026`

`TASK-DASH-0027`

`TASK-DASH-0028`

Backend — Endpoint de creación de Ban.

## Assigned to

Frontend Dashboard Agent

## Status

Finished

## Completed Work

- Implementado flujo completo de creación de ban.
- Creado servicio `ban.service.ts` con métodos `getBans`, `createBan`, `updateBan` y `deactivateBan`.
- Implementada página `ban-form-page.tsx` con modo creación, precarga de fecha/hora actual, confirmación y redirección al listado.
- Reemplazada página `bans-select-user-page.tsx` que usaba datos MOCK por integración real con endpoint `GET /api/users/active-for-ban`.
- La selección de usuario consulta usuarios activos sin ban vigente, con búsqueda, ordenamiento y paginación.
- Los usuarios con `IsBanned = true` aparecen como no seleccionables.
- Las fechas se convierten correctamente de hora local a UTC antes de enviar al backend.
- Los errores del backend se muestran en el formulario sin perder datos ingresados.
- Dashboard compila correctamente.

## Pending Work

Ninguno.

## Blocked task

Ninguno.

## Unblocked

TASK-DASH-0031, TASK-DASH-0032, TASK-DASH-0033.