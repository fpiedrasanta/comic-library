# TASK-DASH-0038 — Implementar creación y edición de administradores

## Objetivo

Integrar el formulario de administradores con los endpoints correspondientes del backend.

Debe completarse el flujo funcional de:

`Listado → Nuevo → Formulario → Confirmación → Listado`

y:

`Listado → Editar → Formulario → Confirmación → Listado`

## Crear

Al seleccionar `Nuevo`:

1. Navegar al formulario de creación.
2. Completar los datos requeridos.
3. Validar los datos antes de enviar.
4. Mostrar confirmación.
5. Enviar la solicitud al backend.
6. Mostrar `Administrador creado` cuando la operación sea exitosa.
7. Esperar el delay correspondiente para permitir visualizar la confirmación.
8. Navegar al listado.

## Editar

Al seleccionar `Editar`:

1. Navegar al formulario.
2. Cargar los datos del administrador.
3. Permitir modificar únicamente los campos definidos por la User Story.
4. Mostrar confirmación antes de guardar.
5. Enviar la actualización al backend.
6. Mostrar `Administrador actualizado`.
7. Navegar al listado después del delay correspondiente.

## Errores

Si el backend devuelve un error:

- Mostrar el mensaje recibido mediante el contrato común.
- Mantener los datos ingresados por el administrador.
- No navegar al listado.
- Permitir corregir y volver a intentar.

## Criterios de aceptación

- [ ] Crear administrador funciona de extremo a extremo.
- [ ] Editar administrador funciona de extremo a extremo.
- [ ] Se respetan las validaciones del backend.
- [ ] Existe confirmación antes de guardar.
- [ ] Se muestra confirmación exitosa.
- [ ] La navegación posterior a la confirmación respeta el delay definido.
- [ ] Los errores no eliminan los datos ingresados.
- [ ] No se duplican llamadas al backend.
- [ ] El Dashboard compila correctamente.

## Dependencies

TASK-DASH-0036
TASK-DASH-0037

## Assigned to

Dashboard Agent

## Status

Finished

## Completed Work

- Integrado formulario de administradores con endpoints del backend.
- Creado servicio `admin.service.ts` con métodos `createAdmin` y `updateAdmin`.
- Implementado flujo de creación: `Listado → Nuevo → Formulario → Confirmación → POST /api/admin-users → Toast → Listado`.
- Implementado flujo de edición: `Listado → Editar → Formulario precargado → Confirmación → PUT /api/admin-users/{userId} → Toast → Listado`.
- Validaciones visuales: campos obligatorios, formato de email, reglas de contraseña, confirmación de contraseña.
- En modo edición se oculta la sección de contraseñas.
- Errores del backend se muestran en el formulario sin perder datos ingresados.
- Actualizada página `admin-form-page.tsx` para consumir el servicio.
- Dashboard compila correctamente.

## Pending Work

Ninguno.

## Blocked task

Ninguno.

## Unblocked

TASK-DASH-0039.