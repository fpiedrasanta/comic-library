# TASK-API-0105 — Incluir motivo del Ban vigente en el error de autenticación

## Objetivo

Modificar el mensaje retornado por el backend cuando un usuario intenta autenticarse teniendo un Ban vigente, para incluir el motivo del Ban.

No se debe modificar el contrato de respuesta de errores existente entre Backend y Frontend.

## Contexto

La validación de Ban durante el login fue implementada en:

`TASK-API-0101 — Validar Ban durante el login`

Actualmente, cuando el usuario posee un Ban vigente, el backend genera un error de autenticación con el mensaje:

`La cuenta se encuentra suspendida.`

Se requiere incorporar el motivo del Ban vigente en dicho mensaje para que el frontend pueda informárselo al usuario.

## Contrato existente

El contrato de error entre Backend y Frontend debe mantenerse exactamente igual.

Ejemplo:

```json
{
  "success": true/false,
  "message": string,
  "code": number,
  "payload": null
}
```

No modificar:

- `success`.
- `message` como propiedad.
- `code`.
- `payload`.
- La estructura general de `ApiResponse`.

La única modificación requerida es el contenido de `message` cuando el error corresponde a un Ban vigente.

## Mensaje para usuario baneado

Cuando exista un Ban vigente, el backend debe devolver:

```text
La cuenta se encuentra suspendida: ${reason}
```

Ejemplo:

```text
La cuenta se encuentra suspendida: Incumplimiento reiterado de las normas de la comunidad.
```

El valor `${reason}` debe corresponder al campo `Reason` del Ban vigente.

## Regla para determinar el Ban vigente

Debe utilizarse la misma regla de negocio implementada en `TASK-API-0101`.

Un Ban bloquea el login cuando:

- `Ban.IsActive = true`.
- `StartDate <= DateTime.UtcNow`.
- `EndDate == null` o `EndDate > DateTime.UtcNow`.

No debe utilizarse un Ban:

- Expirado.
- Revocado.
- Con `IsActive = false`.
- Histórico.

El motivo debe obtenerse exclusivamente del Ban que actualmente bloquea el acceso.

## Login tradicional

Debe aplicarse en:

`LoginAsync`

Cuando exista un Ban vigente:

- No se debe completar el login.
- No se debe emitir Access Token.
- No se debe emitir Refresh Token.
- Debe generarse el error HTTP `401`.
- El `message` debe ser:

```text
La cuenta se encuentra suspendida: ${reason}
```

## Login con Google

Debe aplicarse también en:

`LoginWithGoogleAsync`

El comportamiento debe ser exactamente equivalente al login tradicional.

Si el usuario está baneado:

- No se debe completar la autenticación.
- No se deben emitir tokens.
- Debe retornarse HTTP `401`.
- El `message` debe incluir el motivo del Ban vigente.

## Compatibilidad

No modificar el contrato de errores existente.

No crear:

- Nuevos campos.
- Nuevos códigos HTTP.
- Nuevas propiedades en `payload`.
- Nuevos DTOs de error.
- Nuevos mecanismos de comunicación entre Backend y Frontend.

Los demás errores de autenticación deben conservar su comportamiento actual.

Por ejemplo, un error de credenciales incorrectas debe continuar utilizando su mensaje actual.

## Seguridad

No devolver información adicional del registro `Ban`.

El mensaje debe contener únicamente el motivo (`Reason`) necesario para informar al usuario.

No exponer:

- `BanId`.
- Identificadores internos.
- Historial de baneos.
- Información de otros baneos.
- Información administrativa interna.

## Fechas

El backend continúa trabajando exclusivamente con UTC.

Esta modificación no debe introducir ninguna conversión de fechas.

## Criterios de aceptación

- [ ] El contrato de respuesta de errores permanece sin modificaciones.
- [ ] Un usuario con Ban vigente recibe HTTP `401`.
- [ ] El `message` tiene el formato `La cuenta se encuentra suspendida: ${reason}`.
- [ ] `${reason}` corresponde al Ban vigente que bloquea el acceso.
- [ ] Bans expirados no generan este mensaje.
- [ ] Bans revocados (`IsActive = false`) no generan este mensaje.
- [ ] Login tradicional aplica el comportamiento.
- [ ] Login con Google aplica el comportamiento.
- [ ] No se emite Access Token cuando existe un Ban vigente.
- [ ] No se emite Refresh Token cuando existe un Ban vigente.
- [ ] Los demás errores de autenticación mantienen su contrato y comportamiento actual.
- [ ] No se agregan propiedades al contrato `ApiResponse`.
- [ ] La API compila correctamente sin errores ni warnings.

## Relación con otras tareas

**Complementa:**

`TASK-API-0101 — Validar Ban durante el login`

**Desbloqueada por:**

`TASK-PUBLIC-WEB-0053 — Mostrar motivo de baneo durante el login`

## Assigned to

Backend Agent

## Status

Pending

## Execution Result

### Status
Finished

### Completed Work
- `AuthService.ValidateUserNotBannedAsync` modificado para incluir el motivo del Ban vigente en el mensaje de error.
- Cuando existe un ban vigente, el mensaje tiene el formato: `La cuenta se encuentra suspendida: {reason}`.
- El motivo se obtiene del primer ban activo retornado por `IBanRepository.GetActiveByUserIdAsync`.
- La validación se aplica en:
  - `LoginAsync` (login tradicional).
  - `LoginWithGoogleAsync` (login con Google).
- El contrato de respuesta de errores permanece sin modificaciones: mismo `success`, `code`, `payload` y estructura `ApiResponse`.
- No se agregan propiedades al contrato.
- Los demás errores de autenticación mantienen su comportamiento y mensaje actual.
- No se expone información adicional del registro `Ban` más allá del `Reason`.
- La API compila correctamente sin errores ni warnings.

### Pending Work
Ninguna. El motivo del ban está incluido en el error de autenticación.

### Unblocked by
TASK-API-0101

### Unblocks
Ninguna.

### Assigned to
Backend Agent
