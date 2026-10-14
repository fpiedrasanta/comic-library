# TASK-API-0101 — Validar Ban durante el login

## Task ID

TASK-API-0101

## Title

Validar estado de Ban durante el login

## Description

Modificar el flujo de autenticación para validar si el usuario posee actualmente un Ban vigente antes de completar el login.

Esta validación debe aplicarse independientemente de que el usuario intente acceder al Dashboard o al Public Web.

El backend es la autoridad para determinar si una cuenta puede autenticarse.

## Active Ban

Un usuario se considera actualmente baneado cuando existe un Ban que cumple:

- `IsActive = true`.
- `StartDate <= DateTime.UtcNow`.
- `EndDate` es `null` o `EndDate > DateTime.UtcNow`.

## Behavior

Si el usuario posee un Ban vigente:

- No debe completarse el login.
- No debe emitirse un Access Token válido para iniciar sesión.
- Debe devolverse un error de negocio apropiado.
- El frontend debe poder identificar que el acceso fue rechazado por Ban.

Si no posee un Ban vigente, el flujo de login debe continuar normalmente.

## Expired bans

Los Bans cuya fecha de finalización ya haya pasado no deben impedir el login.

Los Bans con `IsActive = false` tampoco deben impedir el login.

## Security

La validación debe ejecutarse en backend.

No debe depender de:

- Dashboard.
- Public Web.
- JavaScript del cliente.
- Estado almacenado localmente.

## Acceptance Criteria

- [ ] El login consulta si existe un Ban vigente.
- [ ] Un usuario actualmente baneado no puede completar el login.
- [ ] No se emite Access Token cuando el login es rechazado por Ban.
- [ ] Los Bans expirados no bloquean el login.
- [ ] Los Bans con `IsActive = false` no bloquean el login.
- [ ] La validación utiliza UTC.
- [ ] La respuesta permite al frontend identificar el motivo del rechazo.
- [ ] La regla aplica tanto a Dashboard como a Public Web.
- [ ] No se duplica la lógica de Ban en los dos frontends.

## Assigned to

Backend Agent

## Status

Planned

## Dependencies

TASK-API-0097

## Execution Result

### Status
Finished

### Completed Work
- `AuthService` modificado para incluir `IBanRepository` como dependencia.
- Método privado `ValidateUserNotBannedAsync` agregado:
  - Consulta `IBanRepository.GetActiveByUserIdAsync`.
  - Si existe un ban vigente, lanza `InvalidCredentialsException` con el mensaje `"La cuenta se encuentra suspendida."`.
- La validación se aplica en:
  - `LoginAsync` (login tradicional).
  - `LoginWithGoogleAsync` (login con Google).
- Si el usuario tiene un ban vigente:
  - No se completa el login.
  - No se emite Access Token.
  - No se genera Refresh Token.
  - El frontend recibe un mensaje que permite identificar el rechazo por ban sin exponer detalles internos.
- Los bans expirados o revocados (`IsActive = false`) no bloquean el login porque `GetActiveByUserIdAsync` ya filtra por vigencia actual.
- La validación utiliza `DateTime.UtcNow` internamente a través del repositorio.
- La regla aplica tanto a Dashboard como a Public Web porque ambos usan los mismos endpoints de autenticación.
- No se duplica lógica de ban en los frontends.
- Compilación completa sin errores.

### Pending Work
Ninguna. La validación de ban durante el login está implementada.

### Unblocked by
TASK-API-0097

### Unblocks
TASK-API-0102

### Assigned to
Backend Agent