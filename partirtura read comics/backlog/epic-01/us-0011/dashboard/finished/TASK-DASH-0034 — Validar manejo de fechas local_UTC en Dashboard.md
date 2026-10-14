# TASK-DASH-0034 — Validar manejo de fechas local/UTC en Dashboard

## Objetivo

Revisar y garantizar que Dashboard maneje correctamente las fechas recibidas y enviadas al Backend.

El Backend trabaja exclusivamente con UTC.

Dashboard debe:

* Convertir fechas UTC recibidas del Backend a hora local para mostrarlas en la interfaz.
* Convertir fechas ingresadas en hora local por el administrador a UTC antes de enviarlas al Backend.
* No modificar la semántica de las fechas durante el procesamiento.
* Evitar conversiones duplicadas o inconsistentes.

## Regla arquitectónica

La responsabilidad queda definida de la siguiente manera:

```text id="r9f2kc"
Backend
   │
   │ UTC
   ▼
Dashboard
   │
   │ UTC → hora local
   ▼
UI
```

Y:

```text id="w1n8ds"
UI
   │
   │ hora local
   ▼
Dashboard
   │
   │ hora local → UTC
   ▼
Backend
```

## Alcance

Revisar las implementaciones actuales de Dashboard que trabajen con fechas, especialmente:

* Listado de Bans.
* Creación de Ban.
* Edición de Ban.
* Filtros de fecha.
* Ordenamiento.
* Paginación.
* DTOs.
* Servicios.
* API Client.
* Formularios `datetime-local`.

## Reglas

### Fechas recibidas

Las fechas provenientes del Backend están expresadas en UTC.

Antes de mostrarlas en Dashboard deben convertirse a la hora local del navegador del administrador.

### Fechas ingresadas

Los controles de fecha/hora de Dashboard trabajan en hora local.

Antes de enviar estos valores al Backend deben convertirse a UTC.

### Listado de Bans

Revisar específicamente:

* `createdAt`
* `startDate`
* `endDate`

Deben mostrarse en hora local.

No debe mostrarse directamente el valor UTC recibido por el API.

### Filtros de fecha

Los valores introducidos en:

* `Fecha desde`
* `Fecha hasta`

representan fechas/hora locales.

Antes de enviarlos al Backend deben convertirse a UTC.

Los filtros inclusivos deben conservar la semántica definida por el contrato del Backend.

### Crear Ban

`Fecha desde` debe mostrarse y editarse en hora local.

Antes de crear el Ban:

```text id="a5c7mx"
Hora local → UTC → API
```

### Editar Ban

Los valores recibidos del Backend deben convertirse:

```text id="n2v6qd"
UTC → hora local → formulario
```

Al guardar:

```text id="e8h4tp"
Hora local → UTC → API
```

### API Client y servicios

No duplicar las conversiones de fecha en componentes, servicios y API Client simultáneamente.

Mantener una responsabilidad clara y reutilizable para la conversión.

## Zona horaria

No asumir que todos los administradores utilizan una zona horaria determinada.

La conversión debe utilizar la zona horaria local del navegador.

No implementar offsets manuales como:

```text id="z7k3bf"
UTC-3
```

como mecanismo general de conversión.

## Criterios de aceptación

* [ ] Las fechas recibidas del Backend se interpretan como UTC.
* [ ] Las fechas mostradas en Dashboard se convierten a hora local.
* [ ] Las fechas ingresadas por el administrador se convierten a UTC antes de enviarse.
* [ ] Los filtros `Fecha desde` y `Fecha hasta` se convierten correctamente a UTC.
* [ ] El listado de Bans muestra las fechas en hora local.
* [ ] El formulario de creación muestra y envía correctamente `StartDate`.
* [ ] El formulario de edición convierte correctamente las fechas en ambos sentidos.
* [ ] No existen conversiones duplicadas.
* [ ] No se utiliza una zona horaria fija.
* [ ] La implementación es reutilizable para futuras pantallas.
* [ ] Las implementaciones actuales de Ban respetan esta regla.
* [ ] Dashboard compila correctamente sin errores ni warnings.

## Assigned to

Dashboard Agent

## Status

Planned

## Execution Summary

Completed:
- Created `dashboard/lib/date-utils.ts` with reusable date utilities:
  - `formatDate()`: converts UTC strings to local display format (`es-AR`).
  - `getCurrentLocalDateTime()`: returns current local datetime for `datetime-local` inputs.
  - `toUtcDate()`: converts local `datetime-local` values to UTC date strings for API filters.
  - `toLocalDateTime()`: converts UTC datetimes from backend to local `datetime-local` values for form pre-fill.
- Updated `dashboard/features/bans/services/ban.service.ts` to import `toUtcDate` from the shared utility instead of duplicating it.
- Updated `dashboard/pages/bans-page.tsx` to use shared `formatDate` and `toUtcDate`.
- Updated `dashboard/pages/bans-select-user-page.tsx` to use shared `formatDate`.
- Updated `dashboard/pages/ban-form-page.tsx` to use shared `formatDate`, `getCurrentLocalDateTime`, and `toLocalDateTime`, replacing inline conversions.
- Verified all conversions respect browser local timezone via `getTimezoneOffset()` without hardcoded offsets.
- Verified UTC → local display in list, filters, and forms; local → UTC conversion for filters; and round-trip correctness for create/edit modes.
- Build passes cleanly.

No date conversion bugs were found in the existing implementations; the main improvement was centralizing the utilities to satisfy the reusability and no-duplication acceptance criteria.
