# TASK-DASH-0023 — Implementar modal de detalle de usuario

## Objetivo

Implementar el modal tipo "carnet/DNI" para consultar el detalle de un usuario desde su card.

## Alcance

Agregar a cada card una acción visual de consulta mediante un ícono de ojo.

Al presionarlo debe abrirse un modal con la información detallada del usuario.

## Información del modal

El modal debe mostrar:

- Foto/avatar.
- Nombre.
- Apellido.
- Email.
- Nacionalidad.

La presentación debe tener apariencia de identificación/carnet, respetando el diseño general del Dashboard y el template.

## Reglas

El modal es exclusivamente de consulta.

No debe contener:

- Botón de editar.
- Botón de eliminar.
- Cambio de contraseña.
- Modificación de email.
- Modificación de nombre.
- Modificación de avatar.
- Ninguna otra operación sobre el usuario.

El objetivo principal del modal es permitir al administrador inspeccionar visualmente la identidad y especialmente la imagen del usuario.

## Criterios de aceptación

- [ ] Cada card dispone de una acción para consultar el detalle.
- [ ] El ícono utilizado representa visualmente la consulta.
- [ ] Al presionarlo se abre el modal.
- [ ] El modal muestra la foto/avatar.
- [ ] El modal muestra nombre.
- [ ] El modal muestra apellido.
- [ ] El modal muestra email.
- [ ] El modal muestra nacionalidad.
- [ ] El modal puede cerrarse correctamente.
- [ ] El modal no permite modificar ningún dato.

## Execution Result

### Status
Finished

### Completed Work
- Se implementó el modal de detalle de usuario tipo "carnet/DNI".
- El modal muestra: avatar ampliado, nombre, apellido, email, nacionalidad.
- Se abre al hacer clic en cualquier card de usuario.
- El modal puede cerrarse mediante botón X, clic fuera del modal o tecla Escape.
- El modal es exclusivamente de consulta: no contiene botones de edición, eliminación ni modificación.

### Validation
- Dashboard compila correctamente: 0 errores, 0 warnings.
- El modal respeta el diseño general del Dashboard.
- No permite modificar ningún dato del usuario.

### Files Modified
- `dashboard/pages/users-page.tsx` (creado)

### Observations
- Se reutilizaron estilos existentes del Dashboard para mantener consistencia visual.
- El modal incluye zoom del avatar como elemento principal de inspección visual.
