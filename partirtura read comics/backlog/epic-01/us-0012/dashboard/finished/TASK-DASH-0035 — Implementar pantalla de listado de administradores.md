# TASK-DASH-0035 — Implementar pantalla de listado de administradores

## Objetivo

Implementar la pantalla de listado de usuarios administradores del Dashboard, correspondiente a la User Story de administración de usuarios administradores.

La tarea comprende exclusivamente la construcción visual y estructural de la pantalla, utilizando el diseño entregado por UX/UI.

No debe implementarse todavía integración con backend.

Maqueta en: C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\listar-administradores.html

## Alcance

La pantalla debe permitir visualizar:

- Avatar.
- Nombre completo.
- Email.
- Fecha de registro.
- Estado de la cuenta.
- Acciones disponibles sobre cada administrador.

Debe contemplar:

- Grilla o tabla según el diseño UX/UI.
- Búsqueda.
- Ordenamiento.
- Paginación.
- Acción para crear un nuevo administrador.
- Acción para editar un administrador.
- Acción para eliminar/desactivar un administrador, según lo definido funcionalmente.

## Estados visuales

Implementar los estados necesarios para:

- Listado con resultados.
- Cargando.
- Sin administradores.
- Sin resultados para una búsqueda.
- Error.
- Administrador activo.
- Administrador inactivo.

Utilizar datos mock únicamente para construir y validar la interfaz.

## Navegación

Debe contemplarse la navegación hacia:

- Crear administrador.
- Editar administrador.
- Confirmación de eliminación/desactivación.

No implementar todavía llamadas al backend.

## Consistencia

Reutilizar los componentes y patrones existentes del Dashboard para:

- Layout.
- Header.
- Búsqueda.
- Paginación.
- Cards o tabla.
- Badges de estado.
- Botones.
- Modales de confirmación.

## Criterios de aceptación

- [ ] La pantalla respeta el diseño UX/UI.
- [ ] Se muestran administradores utilizando datos mock.
- [ ] Se contemplan estados de carga, vacío, error y búsqueda sin resultados.
- [ ] Existe navegación hacia crear administrador.
- [ ] Existe navegación hacia editar administrador.
- [ ] Existe acción para eliminar/desactivar administrador.
- [ ] Se mantiene la identidad visual del Dashboard.
- [ ] No se realizan llamadas al backend.
- [ ] La pantalla es responsive.

## Assigned to

Dashboard Agent

## Status

Finished

## Completed Work

- Implementada pantalla de listado de administradores con diseño UX/UI.
- Creada página `admins-page.tsx` con datos mock (2 administradores: activo e inactivo).
- Implementada búsqueda por nombre, apellido y correo.
- Implementado ordenamiento por fecha de registro, nombre, apellido y correo.
- Implementada paginación visual.
- Estados visuales: activo (badge verde, acciones editar/desactivar) e inactivo (badge gris, acción reactivar).
- Modal de confirmación para desactivación.
- Toast de confirmación para reactivación.
- Responsive con grid de cards.
- No se realizan llamadas al backend.
- Dashboard compila correctamente.

## Pending Work

Ninguno.

## Blocked task

Ninguno.

## Unblocked

TASK-DASH-0036.