# TASK-DASH-0026 — Implementar pantalla de listado de baneos

## Task ID

TASK-DASH-0026

## Title

Implementar pantalla de listado de baneos

## Description

Implementar en Dashboard la pantalla de consulta y auditoría de baneos utilizando como referencia visual el template:

`C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\admin-baneos.html`

Esta task corresponde exclusivamente a la construcción visual y estructural de la pantalla.

No debe implementarse todavía la integración con el backend ni la funcionalidad de las acciones.

La pantalla debe quedar preparada para que las siguientes tasks incorporen consulta, filtros, ordenamiento, paginación, creación, edición y revocación de baneos.

## Alcance

Implementar:

- Layout general de la pantalla.
- Header y título de la sección.
- Controles de búsqueda.
- Controles de filtros.
- Controles de ordenamiento.
- Botón `Crear Baneo`.
- Grilla de baneos.
- Acciones visuales por registro:
  - Editar.
  - Eliminar.
  - Ver.
- Paginador.
- Estados visuales necesarios según el template.
- Responsive.
- Integración con el layout y navegación existente del Dashboard.

## Búsqueda

Debe existir un único campo de búsqueda.

Placeholder:

`Buscar por nombre, apellido o correo...`

La funcionalidad de búsqueda será implementada en una task posterior.

## Filtros

Debe existir:

- Fecha desde.
- Fecha hasta.
- Baneos activos: Todos / Sí / No.

Los controles deben existir visualmente pero no deben realizar consultas todavía.

## Ordenamiento

Debe existir:

### Ordenar por

- Fecha.
- Nombre.
- Correo.
- Fecha desde.
- Fecha hasta.

### Dirección

- Asc.
- Desc.

Los valores visuales por defecto deberán ser:

- `Fecha`.
- `Desc`.

## Grilla

La grilla debe mostrar como mínimo:

- Fecha de creación del Ban.
- Apellido.
- Nombre.
- Correo.
- Fecha desde.
- Fecha hasta.
- Estado.
- Acciones.

El estado debe diferenciar visualmente:

- Activo.
- Finalizado.

## Acciones

Las acciones deben existir visualmente, pero no deben ejecutar operaciones reales en esta task.

### Crear Baneo

El botón `Crear Baneo` deberá quedar preparado para iniciar posteriormente el flujo:

`Listado de Baneos → Seleccionar Usuario → Crear Baneo`

### Editar

La acción `Editar` deberá quedar preparada para iniciar posteriormente el flujo:

`Listado de Baneos → Editar Baneo`

La pantalla de edición recibirá posteriormente el Ban seleccionado y su usuario asociado.

No debe existir una pantalla de selección de usuario durante la edición.

### Eliminar

La acción `Eliminar` deberá quedar preparada para posteriormente mostrar una confirmación antes de realizar la operación.

Mensaje requerido:

`¿Estás seguro que deseas eliminar el baneo vigente de [Nombre Completo]?`

## Ver

La acción `Ver` debe quedar representada visualmente según el template.

Si el diseño contempla un modal o pantalla específica para visualizar el detalle, respetar el diseño proporcionado.

No implementar lógica adicional en esta task.

## Paginación

Debe existir visualmente el patrón de paginación utilizado por el Dashboard.

Valores por defecto del contrato:

- `currentPage = 1`
- `pageSize = 48`
- `orderBy = createdAt`
- `orderDir = desc`

La funcionalidad será implementada posteriormente.

## Estados visuales

Contemplar los estados necesarios definidos por el template:

- Loading.
- Listado con resultados.
- Sin resultados.
- Error.

No implementar todavía la obtención real de datos.

Puede utilizarse información mock únicamente para representar correctamente el diseño.

## Restricciones

- No implementar llamadas al backend.
- No crear servicios de API.
- No implementar filtros funcionales.
- No implementar ordenamiento funcional.
- No implementar paginación funcional.
- No implementar creación.
- No implementar edición.
- No implementar eliminación.
- No modificar el modelo de datos del backend.

## Reutilización

Reutilizar componentes y estilos existentes del Dashboard cuando corresponda.

Mantener consistencia visual con:

- Consulta de usuarios.
- Cards.
- Badges.
- Botones.
- Inputs.
- Selects.
- Paginación.

## Validation

- Dashboard compila correctamente.
- La pantalla respeta el template proporcionado.
- La navegación hacia la sección funciona.
- Los controles y acciones están visualmente presentes.
- No existen llamadas al backend.
- No existen operaciones de modificación.

## Dependencies

User Story:

`US-0011 — Administrar bloqueos/baneos de usuarios`

Template:

`C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\admin-baneos.html`

## Assigned to

Frontend Dashboard Agent

## Status

Planned

## Execution Summary

Completed:
- Created `dashboard/types/ban.ts` with `Ban` and `BanListResponse` interfaces.
- Created `dashboard/pages/bans-page.tsx` implementing the ban list screen with mock data, search, filters, sorting, table with actions, pagination, loading/empty states, and ProtectedImage for avatars.
- Updated `dashboard/app/router/routes.tsx` to add `/bans` route nested under `DashboardLayout`.
- Updated `project/pages.md` to document the new Bans page.

The screen respects the provided template, integrates with the existing Dashboard layout via `useDashboardPageHeader`, and contains no backend calls.