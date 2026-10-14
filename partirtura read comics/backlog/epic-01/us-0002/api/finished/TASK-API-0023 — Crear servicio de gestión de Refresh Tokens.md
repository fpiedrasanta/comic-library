# TASK-API-0023 — Crear servicio de gestión de Refresh Tokens

## Objetivo

Crear el servicio responsable de generar, validar, almacenar, expirar y revocar Refresh Tokens.

El servicio debe implementar Refresh Token Rotation.

## Alcance

El servicio debe permitir:

- Generar Refresh Tokens criptográficamente seguros.
- Generar el hash utilizado para almacenarlos.
- Asociarlos a un usuario.
- Establecer su fecha de expiración.
- Validar un Refresh Token.
- Detectar Refresh Tokens expirados.
- Detectar Refresh Tokens revocados.
- Revocar Refresh Tokens.
- Invalidar el Refresh Token utilizado durante una renovación.
- Generar un nuevo Refresh Token durante la renovación.

## Seguridad

El Refresh Token no debe almacenarse en texto plano.

Debe almacenarse únicamente la información necesaria para validarlo de forma segura.

El token enviado al frontend debe poder compararse con el valor almacenado sin necesidad de almacenar el token original.

## Refresh Token Rotation

Cuando un Refresh Token válido sea utilizado para renovar una sesión:

1. Validar el Refresh Token.
2. Invalidar el Refresh Token utilizado.
3. Generar un nuevo Refresh Token.
4. Persistir el nuevo Refresh Token.
5. Devolver el nuevo Refresh Token al flujo de autenticación.

Un Refresh Token utilizado anteriormente no debe poder volver a utilizarse.

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

1. Los Refresh Tokens se generan de manera segura.
2. Los Refresh Tokens no se almacenan en texto plano.
3. Los Refresh Tokens pueden expirar.
4. Los Refresh Tokens pueden ser revocados.
5. Un Refresh Token utilizado no puede reutilizarse.
6. Se implementa Refresh Token Rotation.
7. La implementación respeta la arquitectura existente.
8. La documentación correspondiente está actualizada.

---

## Resultado de la ejecución

### Cambios realizados

**`Application/Interfaces/IRefreshTokenService.cs`** (nuevo)
- Interfaz con métodos:
  - `GenerateAsync`: genera un nuevo Refresh Token y retorna el token raw junto con la entidad.
  - `ValidateAsync`: valida un Refresh Token contra su hash y reglas de negocio.
  - `RevokeAsync`: revoca un Refresh Token existente.
  - `RotateAsync`: implementa Refresh Token Rotation (invalida el anterior y genera uno nuevo).
  - `GetActiveTokenAsync`: obtiene el Refresh Token activo de un usuario.

**`Infrastructure/Services/RefreshTokenService.cs`** (nuevo)
- Implementación de `IRefreshTokenService`.
- Generación criptográficamente segura utilizando `RandomNumberGenerator.GetBytes(64)` codificado en Base64Url.
- Hash de tokens mediante `SHA256` antes de persistir.
- Validación por hash, usuario, expiración, revocación y uso previo.
- Refresh Token Rotation: marca el token anterior como usado y revocado, luego genera uno nuevo.
- No almacena tokens en texto plano.
- Cumple con la arquitectura Clean Architecture (interfaz en Application, implementación en Infrastructure).

**`Api/Program.cs`** (modificado)
- Se registró `IRefreshTokenRepository` y `IRefreshTokenService` en el contenedor de dependencias.

**`project/services.md`** (actualizado)
- Se agregó la entrada `RefreshTokenService` documentando su responsabilidad, dependencias, comportamiento, ubicación y notas de seguridad.

### Verificación

- `Application` compila correctamente.
- `Infrastructure` compila correctamente.
- No se incorporaron nuevas dependencias tecnológicas.
- Los Refresh Tokens se generan de forma segura, se almacenan hasheados y soportan expiración, revocación y rotación.
