# TASK-API-0026 — Crear endpoint de renovación de tokens

## Objetivo

Crear el endpoint que permita renovar la sesión utilizando un Refresh Token válido.

## Endpoint

Crear el endpoint de renovación de tokens siguiendo las convenciones establecidas para los endpoints del proyecto.

Debe recibir el Refresh Token.

Debe devolver:

- Nuevo Access Token.
- Nuevo Refresh Token.

## Flujo

El endpoint debe utilizar el servicio correspondiente para:

1. Validar el Refresh Token.
2. Verificar que no esté expirado.
3. Verificar que no esté revocado.
4. Obtener el usuario asociado.
5. Invalidar el Refresh Token utilizado.
6. Generar un nuevo Access Token.
7. Generar un nuevo Refresh Token.
8. Devolver ambos tokens.

Debe aplicarse Refresh Token Rotation.

## Errores

Debe rechazar la solicitud cuando:

- El Refresh Token no existe.
- El Refresh Token es inválido.
- El Refresh Token está expirado.
- El Refresh Token fue revocado.
- El Refresh Token ya fue utilizado.

La respuesta debe utilizar el manejo centralizado de errores.

## Responsabilidad

El Controller no debe implementar la lógica de validación, expiración, revocación ni generación de tokens.

Debe invocar la interfaz del servicio correspondiente.

## Contexto obligatorio

Antes de comenzar, leer:

- `project.md`
- `backend-architecture.md`
- `backend-stack-technology.md`
- `backend-coding-rules.md`
- `domain.md`
- `services.md`
- `repositories.md`
- `endpoints.md`
- `communication.md`
- La Epic correspondiente: `epic-01.md`
- La User Story correspondiente: `us-0002.md`

Leer además:

- El servicio de Refresh Tokens.
- El servicio de generación de JWT.
- El endpoint de login.

## Documentación

Si como resultado de la implementación se incorpora una nueva dependencia:

- Actualizar `backend-stack-technology.md`.

Si se incorpora o modifica un servicio:

- Actualizar `services.md`.

Si se establece una regla general reutilizable para el manejo de contraseñas:

- Actualizar `backend-coding-rules.md`.

Si como resultado de la implementación se incorpora o modifican entidades:
- Actualizar: `domain.md`

Si como resultado de la implementación se incorpora o modifican repositorios:
- Actualizar: `repositories.md`

Si como resultado de la implementación se incorpora o modifican end-points:
- Actualizar: `endpoints.md`

Si como resultado de la implementación se identifican errores en la comunicación:
- Actualizar/corregir: `communication.md`

## Criterio de finalización

La Task se considera finalizada cuando:

1. Existe un endpoint para renovar la sesión.
2. Acepta un Refresh Token válido.
3. Rechaza Refresh Tokens inválidos.
4. Rechaza Refresh Tokens expirados.
5. Rechaza Refresh Tokens revocados.
6. Rechaza Refresh Tokens previamente utilizados.
7. Genera un nuevo Access Token.
8. Genera un nuevo Refresh Token.
9. Invalida el Refresh Token anterior.
10. Implementa correctamente Refresh Token Rotation.
11. El endpoint está documentado en `endpoints.md`.

---

## Resultado de la ejecución

### Cambios realizados

**`Application/Interfaces/IAuthService.cs`** (modificado)
- Se agregó el método `Task<AuthResponse> RefreshTokenAsync(string refreshToken, CancellationToken)`.

**`Application/Services/AuthService.cs`** (modificado)
- Se implementó `RefreshTokenAsync`:
  - Llama a `_refreshTokenService.RenewAsync(refreshToken)` para validar el token, invalidar el anterior y generar uno nuevo.
  - Obtiene el usuario por `userId`.
  - Genera un nuevo Access Token con `IJwtTokenGenerator`.
  - Persiste los cambios con `_unitOfWork.SaveChangesAsync`.
  - Retorna `AuthResponse` con ambos tokens y datos del usuario.

**`Application/Interfaces/IRefreshTokenService.cs`** (modificado)
- Se agregó el método `Task<(long UserId, string NewRawToken)> RenewAsync(string rawToken, CancellationToken)`.
- `RenewAsync` encapsula la lógica de Refresh Token Rotation:
  - Busca el token por hash.
  - Valida que no sea nulo, que el userId sea válido, que no esté revocado ni usado ni expirado.
  - Marca el token anterior como revocado y usado.
  - Genera un nuevo Refresh Token con la expiración configurada.
  - Retorna el `userId` y el nuevo token raw.

**`Infrastructure/Services/RefreshTokenService.cs`** (modificado)
- Se implementó `RenewAsync`:
  - Utiliza `_configuration.GetValue<int?>("RefreshToken:ExpirationDays") ?? 7` para determinar la expiración del nuevo token.
  - Persiste el nuevo token mediante `GenerateAsync`.

**`Api/DTOs/RefreshTokenRequest.cs`** (nuevo)
- DTO de request con validación `[Required]` para el campo `RefreshToken`.

**`Api/Controllers/UsersController.cs`** (modificado)
- Se agregó el endpoint `POST /api/users/refresh-token`:
  - Recibe `RefreshTokenRequest`.
  - Invoca `_authService.RefreshTokenAsync`.
  - Retorna `ApiResponse<object>` con el nuevo Access Token, Refresh Token y datos del usuario.

**`project/endpoints.md`** (actualizado)
- Se agregó la documentación del endpoint `POST /api/users/refresh-token` con request, response, errores y notas de seguridad.

### Verificación

- `Api` compila correctamente.
- `Application` compila correctamente.
- `Infrastructure` compila correctamente.
- El endpoint respeta el formato estándar `ApiResponse`.
- No revela información sensible en errores.
- Refresh Token Rotation está implementado: el token anterior se invalida y se genera uno nuevo.
