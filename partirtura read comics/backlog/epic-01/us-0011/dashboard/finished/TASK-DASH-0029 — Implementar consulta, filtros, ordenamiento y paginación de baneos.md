# TASK-DASH-0029 — Implementar consulta, filtros, ordenamiento y paginación de baneos

## Task ID

TASK-DASH-0029

## Title

Implementar consulta, filtros, ordenamiento y paginación de baneos

## Description

Implementar la funcionalidad de consulta del listado de Baneos en Dashboard.

La pantalla visual correspondiente se encuentra implementada en `TASK-DASH-0026`.

La implementación debe utilizar los endpoints y contratos definidos por Backend.

## Alcance

Implementar:

- Consulta paginada.
- Búsqueda.
- Filtro por fecha desde.
- Filtro por fecha hasta.
- Filtro por estado activo.
- Ordenamiento.
- Dirección de ordenamiento.
- Paginación.
- Estados loading, vacío y error.

## Búsqueda

Un único parámetro de búsqueda.

Debe buscar mediante OR sobre:

- Nombre.
- Apellido.
- Email.

No deben existir tres campos de búsqueda independientes.

## Filtros de fecha

### Fecha desde

Opcional e inclusiva.

### Fecha hasta

Opcional e inclusiva.

Cuando el usuario indique la misma fecha en ambos campos, por ejemplo:

`01/01/2026` → `01/01/2026`

el resultado debe incluir todo ese día:

`01/01/2026 00:00:00`

hasta:

`01/01/2026 23:59:59.999...`

## Zona horaria

El usuario trabaja con hora local.

El backend trabaja exclusivamente con UTC.

El frontend debe:

- Convertir fechas UTC recibidas desde backend a hora local para visualización.
- Convertir fechas ingresadas en hora local a UTC antes de enviarlas al backend.
- No enviar fechas locales sin convertir.
- No interpretar fechas UTC como si fueran hora local.

## Estado

Filtro:

- Todos.
- Sí.
- No.

`Sí` representa baneos actualmente activos.

`No` representa baneos que no están actualmente activos.

Los registros con:

`IsActive = false`

no deben ser tratados como baneos activos.

## Ordenamiento

Debe soportar:

- `createdAt`
- Nombre.
- Correo.
- `StartDate`.
- `EndDate`.

Dirección:

- `Asc`
- `Desc`

Valores iniciales:

- `currentPage = 1`
- `pageSize = 48`
- `orderBy = createdAt`
- `orderDir = desc`

## Paginación

La consulta debe enviar:

- `currentPage`
- `pageSize`
- `orderBy`
- `orderDir`

Los filtros y búsqueda deben conservarse al cambiar de página.

Al cambiar búsqueda, filtros u ordenamiento:

- Reiniciar a `currentPage = 1`.

## Restricciones

- Utilizar el API Client centralizado.
- No realizar `fetch` directo desde la página.
- No duplicar lógica de autenticación.
- Respetar el contrato definido por Backend.

## Validation

- La grilla muestra los datos reales.
- La búsqueda funciona por nombre, apellido o email.
- Los filtros funcionan individualmente y combinados.
- Las fechas respetan inclusión de ambos extremos.
- Las conversiones UTC/local son correctas.
- El ordenamiento funciona en ambas direcciones.
- La paginación funciona correctamente.
- Dashboard compila sin errores ni warnings.

## Dependencies

`TASK-DASH-0026`

Backend:

Endpoints correspondientes al listado paginado de Baneos.

## Assigned to

Frontend Dashboard Agent

## Status

Planned

## Execution Summary

Completed:
- Updated `dashboard/types/ban.ts` to match `BanListItemDto` from `GET /api/bans` (`firstName`, `lastName`, `email`, `avatarUrl`, `status`, etc.).
- Created `dashboard/features/bans/services/ban.service.ts` with centralized `getBans` call using the API Client. Includes sort-field mapping (`createdAt` → `CreatedAt`, `firstName` → `FirstName`, etc.), sort-direction mapping (`asc` → `ASC`, `desc` → `DESC`), and `toUtcDate` conversion for local `datetime-local` filter values.
- Updated `dashboard/pages/bans-page.tsx` to replace mock data with real API integration: search, date filters (with UTC conversion), active-status filter, sorting, and pagination are all wired to the backend. Added error state, loading state, and enabled/disabled pagination controls based on real response metadata. Filters and search reset `currentPage` to 1 as required.
- Updated `dashboard/pages/ban-form-page.tsx` to consume the new `Ban` DTO shape.

Build passes. No backend calls were added outside the centralized API Client.