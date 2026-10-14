# TASK-PUBLIC-WEB-0050 — Implementar confirmación de baja de cuenta

## Objetivo

Implementar la confirmación efectiva de la baja de cuenta mediante el código OTP validado.

## Alcance

- Implementar la llamada al endpoint de confirmación de baja.
- Enviar únicamente los datos necesarios para completar la confirmación.
- No enviar `userId` ni email para identificar al usuario.
- Mostrar un estado de procesamiento mientras se ejecuta la operación.
- Gestionar correctamente errores de código inválido, expirado o cualquier otro error informado por la API.
- Evitar múltiples envíos simultáneos.
- Una vez confirmada la baja, mostrar el estado final definido por el template.

## Criterios de aceptación

- [x] La confirmación utiliza el código ingresado por el usuario.
- [x] No se envía un identificador de usuario desde el frontend.
- [x] Se muestra un estado de loading durante la operación.
- [x] Los errores son mostrados correctamente.
- [x] Un código inválido o expirado no permite completar la operación.
- [x] La cuenta solo se considera dada de baja cuando el backend confirma la operación.
- [x] Se muestra el mensaje de confirmación definido por el template.

## Execution Result

### Status

finished

### Completed Work

1. Implementada confirmación de baja consumiendo `POST /api/users/account-deletion/confirm`.
2. Se envía únicamente el código OTP en el body; no se envía userId ni email.
3. Estado de loading durante la operación.
4. Errores gestionados correctamente (400, 401, 409).
5. Una vez confirmada, se muestra el mensaje final del template.

### Validation

- `npm run build`: compiló correctamente.

### Files Modified

- `public-web/public-web/pages/settings-page.tsx`
- `public-web/public-web/features/authentication/api/authentication-repository.ts`
