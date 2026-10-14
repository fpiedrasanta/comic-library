# TASK-DASH-0049 — Corregir manejo de fechas en formulario de baneos

## Objetivo

Corregir la conversión de fechas en el formulario de creación y edición de baneos para preservar la hora seleccionada por el administrador.

## Hallazgo

`lib/date-utils.ts` exporta `toUtcDate` que convierte un `datetime-local` a UTC pero **descartando la hora**:

```typescript
export function toUtcDate(localDateTime: string): string {
  const date = new Date(localDateTime)
  const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return utcDate.toISOString().split('T')[0] // <-- descarta la hora
}
```

`BanFormPage` utiliza `toUtcDate` para enviar `startDate` y `endDate` a los endpoints `POST /api/bans` y `PUT /api/bans/{banId}`.

Según `endpoints.md`, estos endpoints esperan fechas completas en UTC (`2026-01-01T00:00:00Z`), no solo la fecha.

Esto implica que:
- La hora seleccionada por el administrador se pierde.
- Los baneos se crean/actualizan con hora `00:00:00` UTC sin importar la selección.

## Alcance

Crear una función de conversión que preserve la hora (`toUtcDateTime`) o ajustar el comportamiento existente.
Actualizar el consumo en `BanFormPage` y `ban.service.ts`.
Verificar que los filtros de fecha del listado (`GET /api/bans`) continúen funcionando con el formato correcto.

## Criterio de aceptación

- Las fechas de baneo enviadas al backend preservan la hora local seleccionada, convertida a UTC.
- Los filtros de fecha del listado funcionan correctamente.
- El Dashboard compila sin errores TypeScript.

## Assigned to

Dashboard Agent

## Resultado de la ejecución

### Cambios realizados

1. **`lib/date-utils.ts`**: agregada función `toUtcDateTime(localDateTime)` que convierte `datetime-local` a UTC preservando la hora (`YYYY-MM-DDTHH:mm:ssZ`).
2. **`pages/ban-form-page.tsx`**: actualizado consumo de `toUtcDate` a `toUtcDateTime` para `startDate` y `endDate` en creación y edición de baneos.
3. **Filtros de listado**: `toUtcDate` se mantiene en `BansPage` porque los filtros del endpoint solo requieren fecha (`YYYY-MM-DD`), no hora.

### Validación

- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.
- Las fechas enviadas al backend ahora incluyen la hora local seleccionada por el administrador, convertida a UTC.

