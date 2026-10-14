# TASK-DASH-0027 — Implementar pantalla de selección de usuario para nuevo baneo

## Task ID

TASK-DASH-0027

## Title

Implementar pantalla de selección de usuario para nuevo baneo

## Description

Implementar en Dashboard la pantalla utilizada para seleccionar el usuario al que se aplicará un nuevo Ban.

Utilizar como referencia visual el template:

`C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\seleccionar-usuario-baneo.html`

Esta task corresponde exclusivamente a la construcción visual y estructural de la pantalla.

No debe implementarse todavía la consulta real de usuarios ni la creación del Ban.

## Flujo

Esta pantalla pertenece exclusivamente al flujo de creación:

`Listado de Baneos → Crear Baneo → Seleccionar Usuario → Crear Baneo`

Esta pantalla **NO forma parte del flujo de edición**.

En edición el usuario ya es conocido a partir del Ban seleccionado y se debe acceder directamente al formulario de edición.

## Alcance

Implementar:

- Layout.
- Header.
- Buscador.
- Ordenamiento.
- Grilla de usuarios.
- Cards de usuarios.
- Estado seleccionable.
- Estado baneado/no seleccionable.
- Paginación.
- Botón para regresar al listado de baneos.
- Estados visuales de loading, vacío, error y sin resultados.

## Usuarios

La pantalla deberá estar preparada para mostrar únicamente usuarios con:

`IsActive = true`

Los usuarios inactivos no deben formar parte del listado cuando se implemente la funcionalidad.

## Cards

Reutilizar el patrón visual de las cards de `Consultar usuarios`.

Cada card debe mostrar:

- Avatar.
- Nombre completo.
- Email.
- Nacionalidad.
- Fecha de registro.
- Cantidad histórica de baneos.
- Estado actual.

El avatar debe utilizar posteriormente el componente de imágenes protegidas existente en Dashboard.

## Selección

Usuario sin Ban vigente:

- Debe mostrarse como seleccionable.
- Debe existir una acción `Seleccionar`.

Usuario con Ban vigente:

- Debe mostrarse visualmente como baneado.
- La acción `Seleccionar` debe estar deshabilitada.

La interfaz debe impedir que el administrador interprete que puede crear un segundo Ban mientras existe uno vigente.

## Búsqueda

Debe existir un único campo:

`Buscar por nombre, apellido o correo...`

La funcionalidad será implementada posteriormente.

## Ordenamiento

Debe existir:

### Ordenar por

- Fecha de registro.
- Nombre.
- Apellido.
- Correo.

### Dirección

- Asc.
- Desc.

La funcionalidad será implementada posteriormente.

## Paginación

Debe existir visualmente el patrón de paginación utilizado por Dashboard.

Valores por defecto:

- `currentPage = 1`
- `pageSize = 48`
- `orderBy = createdAt`
- `orderDir = desc`

La funcionalidad será implementada posteriormente.

## Navegación

Debe existir una acción para regresar al listado de baneos sin seleccionar ningún usuario.

La selección de un usuario deberá quedar preparada para continuar hacia:

`Formulario Crear Baneo`

## Restricciones

- No implementar llamadas al backend.
- No implementar búsqueda.
- No implementar filtros reales.
- No implementar ordenamiento real.
- No implementar paginación real.
- No crear Ban.
- No modificar usuarios.
- No implementar lógica de autorización.

## Validation

- Dashboard compila correctamente.
- La pantalla respeta el template proporcionado.
- Las cards mantienen consistencia con `Consultar usuarios`.
- Se diferencian visualmente usuarios seleccionables y no seleccionables.
- La pantalla puede ser navegada desde el flujo de Nuevo Baneo.
- No existen llamadas al backend.

## Dependencies

User Story:

`US-0011 — Administrar bloqueos/baneos de usuarios`

Previous screen:

`Listado de Baneos`

Next screen:

`Crear Baneo`

Template:

`C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\seleccionar-usuario-baneo.html`

## Assigned to

Frontend Dashboard Agent

## Status

Planned

## Execution Summary

Completed:
- Created `dashboard/pages/bans-select-user-page.tsx` implementing the user selection screen with mock active users, search, sorting, user cards with selectable/disabled states, pagination, and step indicator.
- Selection of an eligible user navigates to `/bans/create` passing the selected user via React Router location state.
- Updated `dashboard/app/router/routes.tsx` to add `/bans/select-user` and `/bans/create` routes.
- Updated `project/pages.md` to document the new pages.

The screen respects the provided template, reuses the user card pattern from `Consultar usuarios`, integrates with the existing Dashboard layout, and contains no backend calls.