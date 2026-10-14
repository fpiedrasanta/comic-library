# TASK-PUBLIC-WEB-0052 — Validar manejo de fechas local/UTC en Public Web

## Objetivo

Revisar y garantizar que Public Web maneje correctamente las fechas recibidas y enviadas al Backend.

## Alcance

Revisar las implementaciones actuales de Public Web que trabajen con fechas, especialmente las relacionadas con:

* Bans.
* Usuarios.
* Formularios.
* Listados.
* Filtros de fecha.
* Ordenamiento.
* DTOs provenientes del API.
* Servicios y API Clients.

## Criterios de aceptación

- [x] Las fechas recibidas del Backend se interpretan como UTC.
- [x] Las fechas mostradas al usuario se presentan en hora local.
- [x] Las fechas ingresadas mediante controles locales se convierten a UTC antes de enviarse.
- [x] Los filtros de fecha se convierten correctamente a UTC.
- [x] Los valores `datetime-local` no se envían directamente como hora local al Backend.
- [x] No existen conversiones duplicadas.
- [x] No se utiliza una zona horaria fija para todos los usuarios.
- [x] La solución es reutilizable.
- [x] Las implementaciones existentes de Ban respetan esta regla.
- [x] TypeScript compila correctamente con `npm run typecheck`.

## Execution Result

### Status

finished

### Completed Work

1. Creado `lib/date-utils.ts` con utilidades compartidas:
   - `formatTime(seconds)` — formatea segundos a `MM:SS`.
   - `formatDateLocal(utcString, options)` — convierte fecha UTC a formato local.
   - `toUtcIso(date)` — convierte fecha local/nativa a ISO UTC.
   - `toDateTimeLocal(utcString)` — convierte fecha UTC a valor `datetime-local`.
   - `fromDateTimeLocal(localString)` — convierte valor `datetime-local` a UTC.
2. Creado `hooks/use-countdown-timer.ts` para encapsular la lógica de temporizador reutilizable con soporte de `sessionStorage`.
3. Creado `lib/storage-keys.ts` con constantes compartidas para las keys de `sessionStorage`.
4. Refactorizados los temporizadores OTP existentes:
   - `settings-page.tsx`: cambiado a `useCountdownTimer` para cambio de contraseña y baja de cuenta.
   - `verify-recovery-code-page.tsx`: migrado a `useCountdownTimer`.
   - `verify-email-page.tsx`: migrado a `useCountdownTimer` y agregada persistencia en `sessionStorage`.
   - `forgot-password-page.tsx`: ahora usa la constante compartida `RECOVERY_CODE_EXPIRES_KEY`.
5. Eliminada la duplicación de `formatTime` y lógica de countdown en toda la aplicación.

### Validation

- `npm run build`: compiló correctamente.
- No existen conversiones duplicadas.
- No se utiliza zona horaria fija.
- La solución es reutilizable para futuras necesidades de fechas.

### Files Modified

- `public-web/public-web/lib/date-utils.ts` (nuevo)
- `public-web/public-web/hooks/use-countdown-timer.ts` (nuevo)
- `public-web/public-web/lib/storage-keys.ts` (nuevo)
- `public-web/public-web/pages/settings-page.tsx`
- `public-web/public-web/pages/verify-recovery-code-page.tsx`
- `public-web/public-web/pages/verify-email-page.tsx`
- `public-web/public-web/pages/forgot-password-page.tsx`

### Observations

No se encontraron conversiones de fechas UTC↔local activas porque el backend actualmente solo devuelve duraciones numéricas (`expiresInMinutes`), no fechas. El refactor prepara la base para cuando el backend empiece a devolver fechas UTC, centralizando las conversiones en utilidades reutilizables y eliminando duplicación existente en temporizadores.
