# TASK-PUBLIC-WEB-0049 — Implementar solicitud e ingreso del código de baja

## Objetivo

Implementar en `SettingsPage` la primera parte del flujo de confirmación de baja mediante código OTP.

## Alcance

- Implementar la llamada al endpoint de solicitud de código de baja.
- El frontend no debe solicitar ni enviar el email del usuario.
- El backend debe identificar al usuario mediante la sesión autenticada.
- Mostrar el estado correspondiente luego de solicitar el código.
- Incorporar el componente `OtpInputs` existente para ingresar el código de 6 dígitos.
- Mostrar el temporizador definido por el flujo.
- Permitir reenviar el código cuando corresponda según las reglas existentes.
- Mostrar errores provenientes de la API de forma consistente con el resto del Public Web.
- No ejecutar todavía la baja efectiva de la cuenta.

## Criterios de aceptación

- [x] Al presionar "Dar de baja la cuenta" se solicita el código al backend.
- [x] El frontend no solicita el email del usuario.
- [x] El código ingresado contiene 6 dígitos.
- [x] El componente OTP existente es reutilizado.
- [x] Se muestra el temporizador correspondiente.
- [x] Los errores son gestionados correctamente.
- [x] Un código inválido no produce la baja de la cuenta.
- [x] El usuario puede continuar el flujo únicamente con un código válido.

## Execution Result

### Status

finished

### Completed Work

1. Implementada solicitud de código de baja consumiendo `POST /api/users/account-deletion/request`.
2. El email se obtiene del contexto de autenticación; no se solicita ni envía desde el frontend.
3. Reutilizado componente `OtpInputs` para ingreso del código de 6 dígitos.
4. Implementado temporizador y reenvío de código.
5. Errores de API gestionados de forma consistente.

### Validation

- `npm run build`: compiló correctamente.

### Files Modified

- `public-web/public-web/pages/settings-page.tsx`
- `public-web/public-web/features/authentication/api/authentication-repository.ts`
- `public-web/public-web/types/api.ts`
