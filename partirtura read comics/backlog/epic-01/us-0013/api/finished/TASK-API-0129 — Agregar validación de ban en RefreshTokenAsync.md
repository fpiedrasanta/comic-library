# TASK-API-0129 — Agregar validación de ban en RefreshTokenAsync

## Objetivo

Evitar que usuarios baneados puedan renovar su sesión mediante Refresh Token, cerrando la brecha de seguridad detectada en la revisión transversal.

## Completed Work

- En `AuthService.RefreshTokenAsync`, después de resolver el usuario por `GetByIdAsync`, se agregó la validación `ValidateUserNotBannedAsync(user.Id, cancellationToken)`.
- Si el usuario tiene un ban vigente, se rechaza la renovación con `InvalidCredentialsException("Token de actualización inválido.")`.
- Verificada la solución compila correctamente.

## Pending Work

Ninguna.

## Reason

`LoginAsync` y `LoginWithGoogleAsync` verifican que el usuario no esté baneado, pero `RefreshTokenAsync` no realizaba esta validación. Un usuario baneado con un refresh token válido podía continuar obteniendo nuevos access tokens hasta que el refresh token expire.

## Assigned to

Backend Agent

## Blocked task

Ninguna.
