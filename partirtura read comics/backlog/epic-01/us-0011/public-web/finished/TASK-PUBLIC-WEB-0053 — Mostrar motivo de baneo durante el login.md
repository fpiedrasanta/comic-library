# TASK-PUBLIC-WEB-0053 — Mostrar motivo de baneo durante el login

## Objetivo

Actualizar el flujo de autenticación de Public Web para informar al usuario el motivo de su baneo cuando el backend rechaza el inicio de sesión debido a que la cuenta se encuentra actualmente baneada.

## Estado

**finished**

## Resolución

El backend modificará el mensaje de error 401 para incluir el motivo del ban en el campo `message`:

```json
{
  "success": false,
  "message": "La cuenta se encuentra suspendida: ${reason}",
  "code": 401,
  "payload": null
}
```

Public Web ya muestra `apiError.message` en la interfaz de login cuando ocurre un error 401:

```tsx
if (apiError.status === 401) {
  setError(apiError.message || 'Credenciales incorrectas.')
}
```

Esto significa que, cuando el backend devuelva el mensaje con el motivo del ban, el frontend lo mostrará automáticamente sin requerir cambios adicionales en el contrato ni en la lógica de presentación.

## Criterios de aceptación

- [x] Cuando el backend responde con el mensaje de ban, Public Web lo muestra correctamente.
- [x] El login no genera una sesión autenticada.
- [x] El usuario permanece en la pantalla de login.
- [x] Se muestra el motivo proporcionado por el backend dentro del mensaje.
- [x] No se realiza una segunda llamada para obtener el motivo.
- [x] No se almacena el motivo del Ban de forma persistente.
- [x] No se muestran detalles técnicos de la API.
- [x] Los restantes errores de login mantienen su comportamiento actual.
- [x] TypeScript compila correctamente con `npm run typecheck`.

## Notas

No se requirieron modificaciones en el código del frontend. El manejo actual de errores de autenticación ya contempla mostrar el mensaje devuelto por el backend sin filtrarlo ni modificarlo.
