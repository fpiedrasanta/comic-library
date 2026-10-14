# TASK-API-0020 — Crear entidades de autenticación

## Objetivo

Crear las entidades de dominio necesarias para implementar la autenticación mediante Access Token y Refresh Token.

## Alcance

La Task debe analizar el modelo actual de usuarios y determinar las entidades necesarias para soportar:

- Refresh Tokens.
- Asociación de Refresh Tokens con usuarios.
- Expiración de Refresh Tokens.
- Revocación de Refresh Tokens.
- Refresh Token Rotation.

El Refresh Token debe poder identificarse y gestionarse de manera independiente del Access Token.

## Refresh Token

La entidad debe permitir representar como mínimo:

- El usuario al que pertenece.
- El hash del Refresh Token.
- La fecha de creación.
- La fecha de expiración.
- El momento de revocación, cuando corresponda.

El modelo final debe respetar las convenciones establecidas en `backend-coding-rules.md`.

No almacenar el Refresh Token en texto plano.

## Consideraciones

No crear entidades innecesarias.

El modelo debe representar las necesidades reales del sistema y permitir implementar posteriormente:

- Validación.
- Expiración.
- Revocación.
- Rotation.

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

1. El modelo de dominio representa correctamente los Refresh Tokens.
2. Los Refresh Tokens están asociados a un usuario.
3. El modelo permite determinar si un Refresh Token expiró.
4. El modelo permite determinar si un Refresh Token fue revocado.
5. El modelo permite implementar Refresh Token Rotation.
6. No se almacena el Refresh Token en texto plano.
7. `domain.md` está actualizado.

---

## Resultado de la ejecución

### Cambios realizados

**`Domain/Entities/RefreshToken.cs`** (nuevo)
- Se creó la entidad `RefreshToken` con las propiedades:
  - `Id`: long, auto-incremental.
  - `UserId`: long, relación con `User`.
  - `User`: navegación hacia `User`.
  - `TokenHash`: string, almacena el hash del refresh token (no texto plano).
  - `CreatedAt`: DateTime en UTC.
  - `ExpiresAt`: DateTime, fecha de expiración.
  - `RevokedAt`: DateTime?, fecha de revocación (null si no fue revocado).
  - `IsUsed`: bool, indica si el token fue utilizado en una rotación.

**`Domain/Entities/User.cs`** (modificado)
- Se agregó la colección `ICollection<RefreshToken> RefreshTokens` para representar la relación uno a muchos con `RefreshToken`.

**`project/domain.md`** (actualizado)
- Se agregó la sección `### RefreshToken` documentando la nueva entidad, sus propiedades y relaciones.

### Verificación

- `Domain` compila correctamente.
- `Application` compila correctamente.
- `Infrastructure` compila correctamente.
- El modelo permite implementar validación, expiración, revocación y Refresh Token Rotation.
- El Refresh Token no se almacena en texto plano.
