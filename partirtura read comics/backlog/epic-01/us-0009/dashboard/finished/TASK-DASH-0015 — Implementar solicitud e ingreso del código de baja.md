# TASK-DASH-0015 — Implementar solicitud e ingreso del código de baja

## Objetivo

Implementar en `SettingsPage` del Dashboard la primera parte del flujo de confirmación de baja mediante código OTP.

## Alcance

- Implementar la llamada al endpoint de solicitud de código de baja.
- El frontend no debe solicitar ni enviar el email del usuario.
- El backend debe identificar al usuario mediante la sesión autenticada.
- Mostrar el estado correspondiente luego de solicitar el código.
- Reutilizar el componente OTP existente del Dashboard cuando corresponda.
- Permitir ingresar un código de 6 dígitos.
- Mostrar el temporizador correspondiente.
- Permitir reenviar el código cuando corresponda según las reglas existentes.
- Mostrar los errores de la API de acuerdo con el mecanismo existente del Dashboard.
- No ejecutar todavía la baja efectiva de la cuenta.

## Criterios de aceptación

- [ ] Al iniciar la operación se solicita el código al backend.
- [ ] El frontend no solicita el email del usuario.
- [ ] El código ingresado contiene 6 dígitos.
- [ ] Se reutilizan componentes existentes cuando corresponda.
- [ ] Se muestra el temporizador correspondiente.
- [ ] Los errores son gestionados correctamente.
- [ ] Un código inválido no produce la baja de la cuenta.
- [ ] El usuario puede continuar el flujo únicamente con un código válido.

## Execution Result

### Status
Finished

### Completed Work
- Se implementó la llamada a `POST /api/users/account-deletion/request` sin enviar email en el body.
- Se reutilizó `OtpInputs` para el ingreso del código de 6 dígitos.
- Se muestra el temporizador con `expiresInMinutes` devuelto por el backend.
- Se agregó botón de reenvío de código llamando nuevamente a `/account-deletion/request`.
- Los errores se muestran inline y no ejecutan la baja efectiva.
- El código se envía al endpoint de confirmación integrado; no existe validación separada en el frontend.

### Validation
- Dashboard compila correctamente: 0 errores, 0 warnings.
- El frontend no envía email ni userId; el backend identifica al usuario por sesión.
- El flujo no completa la baja hasta que se confirma el código.

### Files Modified
- `dashboard/types/auth.ts` (modificado)
- `dashboard/features/authentication/services/auth.service.ts` (modificado)
- `dashboard/pages/settings-page.tsx` (modificado)

### Observations
- El endpoint de solicitud no requiere body; la sesión autenticada alcanza para identificar al usuario.
- Se mantuvo el mismo patrón de OTP y temporizador utilizado en recuperación de contraseña.
