# TASK-DASH-0028 — Implementar pantalla de creación y edición de baneo

## Task ID

TASK-DASH-0028

## Title

Implementar pantalla de creación y edición de baneo

## Description

Implementar en Dashboard la pantalla utilizada para crear y editar un Ban.

Utilizar como referencia visual el template:

`C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\crear-baneo.html`

Esta task corresponde exclusivamente a la construcción visual y estructural de la pantalla.

No debe implementarse todavía la integración con el backend ni las operaciones de creación o edición.

## Modos de funcionamiento

La pantalla debe soportar dos modos:

### Crear

Flujo:

`Listado de Baneos → Crear Baneo → Seleccionar Usuario → Formulario Crear`

El usuario ya fue seleccionado previamente.

La pantalla debe mostrar:

- Datos del usuario seleccionado.
- Avatar.
- Datos relevantes del usuario.
- Formulario de Ban.

El título debe indicar:

`Crear Baneo`

### Editar

Flujo:

`Listado de Baneos → Editar → Formulario Editar`

En este flujo el usuario ya es conocido porque pertenece al Ban seleccionado.

**No debe existir selección de usuario en el modo edición.**

La pantalla debe mostrar:

- Datos del usuario asociado.
- Avatar.
- Datos relevantes del usuario.
- Datos actuales del Ban.
- Formulario editable.

El título debe indicar:

`Editar Baneo`

El usuario asociado al Ban no puede cambiarse durante la edición.

## Datos del usuario

La pantalla debe estar preparada para mostrar:

- Avatar.
- Fecha de creación.
- Nombre.
- Apellido.
- Nacionalidad.
- Email.
- Cantidad histórica de baneos.
- Otros datos definidos por el template.

## Formulario

### Fecha desde

Obligatoria.

En modo Crear:

- Debe venir precargada con la fecha/hora actual.

En modo Editar:

- Debe mostrar el valor actual del Ban.

### Fecha hasta

Opcional.

En modo Crear:

- Debe estar vacía por defecto.

En modo Editar:

- Debe mostrar el valor actual.

### Motivo

Campo libre.

En modo Crear:

- Vacío por defecto.

En modo Editar:

- Debe mostrar el motivo actual.

## Confirmación

Al intentar guardar debe mostrarse un mensaje de confirmación antes de ejecutar la operación.

### Crear

El mensaje debe incluir:

`¿Estás seguro que deseas banear a [Nombre Completo]?`

Y debajo debe mostrarse:

`Datos del baneo`

con el resumen de:

- Fecha desde.
- Fecha hasta.
- Motivo.

### Editar

Debe solicitar confirmación antes de aplicar los cambios.

La confirmación debe dejar claro que se modificarán los datos del Ban existente.

## Resultado exitoso

Después de una operación exitosa deberá mostrarse una confirmación:

### Crear

`Baneo guardado`

### Editar

Una confirmación equivalente indicando que el baneo fue actualizado.

Si la confirmación se implementa mediante toast, deberá existir un pequeño delay antes de navegar al listado para permitir que el usuario vea el mensaje.

Después del delay:

`Formulario → Listado de Baneos`

## Resultado con error

Si el backend devuelve un error:

- Mostrar un mensaje comprensible.
- No mostrar detalles técnicos.
- Permanecer en el formulario.
- Mantener los datos ingresados.

## Cancelar

Cancelar:

- No debe realizar ninguna operación contra el backend.
- Debe regresar al listado de baneos.

## Fechas

El frontend trabaja con hora local.

El backend trabaja con UTC.

La futura implementación deberá:

- Convertir los valores recibidos desde backend UTC a hora local para mostrarlos.
- Convertir los valores ingresados en hora local a UTC antes de enviarlos al backend.

Esta task solamente debe preparar la interfaz.

## Restricciones

- No implementar llamadas al backend.
- No implementar creación.
- No implementar edición.
- No implementar confirmaciones funcionales.
- No implementar conversión de fechas.
- No implementar navegación funcional basada en respuestas del backend.

## Validation

- Dashboard compila correctamente.
- El template es respetado.
- La pantalla soporta visualmente los modos Crear y Editar.
- El usuario aparece como dato informativo y no como selector.
- El formulario contempla fecha desde, fecha hasta y motivo.
- Se contempla visualmente la confirmación antes de guardar.
- Se contemplan estados de error.
- Se contempla navegación de Cancelar.

## Dependencies

User Story:

`US-0011 — Administrar bloqueos/baneos de usuarios`

Previous screens:

Crear:

`Listado de Baneos → Seleccionar Usuario`

Editar:

`Listado de Baneos`

Template:

`C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\crear-baneo.html`

## Assigned to

Frontend Dashboard Agent

## Status

Planned

## Execution Summary

Completed:
- Created `dashboard/pages/ban-form-page.tsx` implementing the ban form screen supporting both create and edit modes.
- Create mode (`/bans/create`): receives selected user via location state, pre-fills "Fecha desde" with current local date/time, shows user info card and form fields.
- Edit mode (`/bans/:id/edit`): receives existing ban via location state, pre-fills all form fields, shows associated user info card.
- Includes confirmation dialog before save, success toast with delayed navigation to `/bans`, cancel navigation, and error state for missing data.
- Updated `dashboard/app/router/routes.tsx` to add `/bans/:id/edit` route.
- Updated `project/pages.md` to document the new Ban Form page.

The screen respects the provided template, integrates with the existing Dashboard layout via `useDashboardPageHeader`, and contains no backend calls.