# TASK-DASH-0016 — Implementar confirmación de baja de cuenta

## Objetivo

Implementar la confirmación efectiva de la baja de la propia cuenta mediante el código OTP validado.

## Alcance

- Implementar la llamada al endpoint de confirmación de baja.
- Enviar únicamente los datos necesarios para completar la confirmación.
- No enviar `userId` ni email para identificar al usuario.
- Mostrar un estado de procesamiento durante la operación.
- Gestionar errores de código inválido, expirado o cualquier otro error informado por la API.
- Evitar múltiples envíos simultáneos.
- Una vez confirmada la baja, mostrar el estado final correspondiente.

## Criterios de aceptación

- [ ] La confirmación utiliza el código ingresado por el usuario.
- [ ] No se envía un identificador de usuario desde el frontend.
- [ ] Se muestra un estado de loading durante la operación.
- [ ] Los errores son mostrados correctamente.
- [ ] Un código inválido o expirado no permite completar la operación.
- [ ] La cuenta solo se considera dada de baja cuando el backend confirma la operación.
- [ ] Se muestra un mensaje de confirmación al completar la operación.

## Execution Result

### Status
Finished

### Completed Work
- Se implementó la llamada a `POST /api/users/account-deletion/confirm` enviando únicamente `{ code }`.
- No se envía `userId` ni `email` desde el frontend.
- Se muestra estado de loading durante la operación.
- Los errores se muestran inline y no completan la baja.
- La baja solo se confirma cuando el backend devuelve éxito.
- Se muestra mensaje de confirmación al completar la operación.

### Validation
- Dashboard compila correctamente: 0 errores, 0 warnings.
- El frontend no envía identificadores adicionales al backend.
- La operación depende exclusivamente de la confirmación del backend.

### Files Modified
- `dashboard/types/auth.ts` (modificado)
- `dashboard/features/authentication/services/auth.service.ts` (modificado)
- `dashboard/pages/settings-page.tsx` (modificado)

### Observations
- El endpoint confirma la baja y devuelve `payload.message` con el resultado.
- Se reutiliza el mismo patrón de estados y manejo de errores que el resto del Dashboard.
