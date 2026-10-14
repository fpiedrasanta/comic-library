# TASK-DASH-0031 — Implementar edición de baneo

## Task ID

TASK-DASH-0031

## Title

Implementar flujo de edición de baneo

## Description

Implementar el flujo completo para editar un Ban existente.

Flujo:

`Listado de Baneos → Editar → Formulario Editar → Confirmación → Guardar → Listado`

## Importante

La edición **NO pasa por la pantalla de selección de usuario**.

El usuario ya es conocido porque el Ban seleccionado contiene su `UserId`.

El usuario asociado al Ban **no puede cambiarse durante la edición**.

## Paso 1 — Editar

Desde una fila del listado se selecciona:

`Editar`

La navegación debe conservar el identificador del Ban seleccionado.

## Paso 2 — Cargar datos

La pantalla debe abrirse en modo:

`Editar Baneo`

Debe obtener y mostrar:

### Usuario

- Avatar.
- Nombre.
- Apellido.
- Email.
- Nacionalidad.
- Fecha de creación.
- Cantidad histórica de baneos.
- Otros datos definidos por el diseño.

### Ban

- Fecha desde.
- Fecha hasta.
- Motivo.
- Estado.

## Paso 3 — Edición

El administrador puede modificar los campos permitidos por el contrato del backend.

El usuario asociado no puede modificarse.

## Paso 4 — Confirmación

Antes de guardar los cambios debe mostrarse una confirmación indicando que se modificará el Ban.

La confirmación debe mostrar los datos relevantes del cambio.

Cancelar la confirmación no realiza ninguna operación.

## Paso 5 — Guardar

Al confirmar:

- Ejecutar la operación mediante el API Client.
- Enviar el `BanId`.
- Enviar los datos modificados.
- Convertir fechas de hora local a UTC.
- Respetar el contrato del backend.

## Paso 6 — Resultado

Si la operación es exitosa:

- Mostrar una confirmación mediante toast o mecanismo visual existente.
- Esperar un pequeño delay si se utiliza toast.
- Navegar al listado de Baneos.

Si ocurre un error:

- Mostrar mensaje comprensible.
- Permanecer en el formulario.
- Mantener los datos ingresados.

## Eliminación física

La edición no debe eliminar físicamente registros.

La persistencia de los Baneos respeta la regla general del proyecto:

`IsActive`

## Validation

- Desde la grilla se puede editar un Ban.
- Se abre directamente el formulario.
- No aparece la pantalla de selección de usuario.
- El usuario asociado se muestra correctamente.
- Los datos actuales del Ban aparecen cargados.
- El usuario no puede cambiarse.
- Se solicita confirmación antes de guardar.
- Las fechas se convierten correctamente a UTC.
- El Ban se actualiza correctamente.
- Se muestra la confirmación.
- Se regresa al listado.
- Los errores mantienen al usuario en el formulario.
- Dashboard compila correctamente.

## Dependencies

`TASK-DASH-0026`

`TASK-DASH-0028`

Backend — Endpoint de consulta de detalle de Ban.

Backend — Endpoint de actualización de Ban.

## Assigned to

Frontend Dashboard Agent

## Status

Finished

## Completed Work

- Implementado flujo completo de edición de ban.
- La edición no pasa por pantalla de selección de usuario; navega directamente al formulario con el ban seleccionado.
- El formulario carga en modo `Editar Baneo` con datos del usuario y del ban pre-cargados.
- Los campos editables son: Fecha desde, Fecha hasta y Motivo.
- El usuario asociado no puede cambiarse durante la edición.
- Se muestra confirmación antes de guardar con resumen de cambios.
- Las fechas se convierten correctamente de hora local a UTC.
- Los errores del backend se muestran en el formulario sin perder datos ingresados.
- Dashboard compila correctamente.

## Pending Work

Ninguno.

## Blocked task

Ninguno.

## Unblocked

TASK-DASH-0032, TASK-DASH-0033.