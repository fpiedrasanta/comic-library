# TASK-DASH-0040 — Implementar pantalla de listado de países

## Objetivo

Implementar la pantalla administrativa de países definida por UX/UI.
C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\paises.html

Contiene los modales para edición y nuevo, no es necesario crear otra pantalla.

## Alcance

Implementar:

- Listado de países.
- Búsqueda.
- Ordenamiento.
- Paginación.
- Visualización del estado.
- Acción de editar.
- Acción de desactivar.
- Acción de activar.
- Estados de loading.
- Estados vacíos.
- Estados de error.
- Confirmaciones.
- Mensajes de éxito.

## Integración

Reemplazar cualquier dato mock por la integración con:

`GET /api/countries`

Utilizar el API Client existente y mantener las llamadas HTTP centralizadas en el servicio correspondiente.

## Reglas

- Los países activos deben mostrarse como activos.
- Los países inactivos deben mostrarse como inactivos.
- Un país inactivo no debe interpretarse como eliminado.
- No derivar el estado localmente mediante reglas diferentes a `isActive`.
- La búsqueda, ordenamiento y paginación deben delegarse al backend.
- Los filtros y la búsqueda deben reiniciar la página actual cuando corresponda.

## Acciones

- Activo:
  - Editar.
  - Desactivar.

- Inactivo:
  - Editar.
  - Activar.

## Status

Finished

## Completed Work

- Creado tipo `Country`, `CountryListResponse`, `CreateCountryResponse` en `types/country.ts`.
- Creado servicio `country.service.ts` con métodos `getCountries`, `createCountry`, `updateCountry`, `deactivateCountry` y `activateCountry`.
- Implementada página `countries-page.tsx` con listado de cards responsive.
- Integrado endpoint `GET /api/admin-countries` con paginación, búsqueda y ordenamiento delegados al backend.
- Implementados estados: loading, empty, error y success toast.
- Los filtros y búsqueda reinician la página actual.
- Las acciones de editar, desactivar y activar abren modales correspondientes.
- El estado `IsActive` se respeta visualmente sin reglas locales adicionales.
- Agregada ruta `/countries` en router y link en sidebar del Dashboard.
- Dashboard compila correctamente.

## Pending Work

Ninguno.

## Blocked task

Ninguno.

## Unblocked

TASK-DASH-0041, TASK-DASH-0042.