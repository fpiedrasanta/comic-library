# TASK-DASH-0036 — Implementar pantalla de creación y edición de administrador

## Objetivo

Implementar la pantalla utilizada para crear y editar usuarios con rol Administrator.

La tarea comprende exclusivamente la interfaz y comportamiento local del formulario. La integración con backend será realizada posteriormente.

Maqueda en: C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\nuevo-administrador.html

## Modos

La pantalla debe soportar dos modos:

### Crear administrador

La navegación debe permitir acceder al formulario para crear un nuevo administrador.

El formulario debe contemplar los datos definidos por UX/UI y el contrato funcional de la User Story.

### Editar administrador

La pantalla debe permitir editar un administrador existente.

Los datos del administrador deben aparecer precargados.

El identificador y los datos del administrador deben manejarse de acuerdo con el patrón utilizado por las demás pantallas del Dashboard.

## Validaciones visuales

Implementar las validaciones necesarias definidas por UX/UI, incluyendo:

- Campos obligatorios.
- Formato de email.
- Reglas de contraseña cuando correspondan.
- Confirmación de contraseña cuando corresponda.
- Mensajes de validación comprensibles.

Las validaciones de negocio definitivas serán responsabilidad del backend.

## Confirmación

Antes de guardar debe mostrarse un mensaje de confirmación.

Para creación:

> ¿Estás seguro que deseas crear el administrador [Nombre]?

Para edición:

> ¿Estás seguro que deseas guardar los cambios del administrador [Nombre]?

El contenido definitivo deberá respetar el diseño UX/UI.

Después de una operación exitosa deberá contemplarse una confirmación visual:

- `Administrador creado`.
- `Administrador actualizado`.

Si la confirmación se implementa mediante toast y posteriormente se navega al listado, debe existir un pequeño delay para permitir que el administrador pueda visualizarla.

## Navegación

Debe contemplarse:

- Volver al listado sin guardar.
- Crear administrador → listado.
- Editar administrador → listado.

## Estados

Implementar:

- Carga.
- Error.
- Validación.
- Formulario con datos.
- Formulario vacío.
- Guardando.

Utilizar datos mock mientras no exista integración con backend.

## Criterios de aceptación

- [ ] Existe modo Crear.
- [ ] Existe modo Editar.
- [ ] El formulario respeta el diseño UX/UI.
- [ ] Los campos se validan visualmente.
- [ ] Los datos de edición aparecen precargados.
- [ ] Existe confirmación antes de guardar.
- [ ] Existe confirmación visual después de guardar.
- [ ] Se contempla navegación de cancelación.
- [ ] Se contemplan estados de carga y error.
- [ ] No se realizan llamadas al backend.
- [ ] La pantalla es responsive.

## Assigned to

Dashboard Agent

## Status

Finished

## Completed Work

- Implementada pantalla de creación y edición de administrador con diseño UX/UI.
- Creada página `admin-form-page.tsx` con soporte de modos crear y editar.
- En modo edición los datos se precargan desde el estado de navegación.
- Implementadas validaciones visuales: campos obligatorios, formato de email, reglas de contraseña, confirmación de contraseña.
- En modo edición se oculta la sección de contraseñas.
- Implementada confirmación modal antes de guardar con resumen de datos.
- Implementado toast de éxito después de guardar.
- Estados de carga y deshabilitación de botones durante guardado.
- Navegación de cancelación al listado.
- No se realizan llamadas al backend.
- Dashboard compila correctamente.

## Pending Work

Ninguno.

## Blocked task

Ninguno.

## Unblocked

Ninguno.