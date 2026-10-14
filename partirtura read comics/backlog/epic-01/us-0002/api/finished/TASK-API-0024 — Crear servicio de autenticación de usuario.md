# TASK-API-0024 — Crear servicio de autenticación de usuario

## Objetivo

Crear el servicio de aplicación responsable de ejecutar el proceso completo de autenticación de un usuario mediante email y contraseña.

## Flujo

El servicio debe:

1. Recibir email y contraseña.
2. Buscar el usuario mediante el repositorio correspondiente.
3. Si el usuario no existe, devolver el error genérico de credenciales inválidas.
4. Validar la contraseña.
5. Si la contraseña es incorrecta, devolver el mismo error genérico.
6. Verificar que el email del usuario haya sido validado.
7. Si el usuario puede autenticarse, generar un Access Token.
8. Generar un Refresh Token.
9. Persistir el Refresh Token.
10. Devolver la información necesaria para establecer la sesión.

## Seguridad

No revelar si el email existe cuando las credenciales son incorrectas.

El usuario inexistente y la contraseña incorrecta deben producir el mismo comportamiento externo.

Un usuario cuyo email no haya sido validado no puede obtener tokens de autenticación.

## Respuesta

El servicio debe devolver el DTO necesario para que Presentation pueda responder al frontend.

La respuesta debe contener como mínimo:

- Access Token.
- Refresh Token.

La estructura concreta debe respetar las convenciones de respuesta definidas en `backend-coding-rules.md`.

## Arquitectura

La lógica de autenticación debe permanecer en Application.

El Controller no debe contener lógica de negocio.

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

Leer además las Tasks relacionadas con:

- Hashing de contraseñas.
- JWT.
- Refresh Tokens.
- Usuarios.

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

1. Existe un servicio de autenticación.
2. Valida correctamente email y contraseña.
3. No revela si un email existe.
4. No permite autenticarse con un email no validado.
5. Genera Access Token.
6. Genera Refresh Token.
7. Persiste el Refresh Token.
8. Devuelve el DTO necesario para el endpoint.
9. No contiene lógica de presentación.
10. `services.md` está actualizado.

---

## Resultado de la ejecución

### Cambios realizados

**`Application/Interfaces/IAuthService.cs`** (nuevo)
- Interfaz con método `LoginAsync(string email, string password, CancellationToken)`.

**`Application/DTOs/AuthResponse.cs`** (nuevo)
- DTO de respuesta con `AccessToken`, `RefreshToken`, `UserId`, `Email`, `FullName`, `Role`.

**`Application/Services/AuthService.cs`** (nuevo)
- Implementación del servicio de autenticación.
- Busca el usuario por email.
- Verifica la contraseña usando `IPasswordHasher`.
- Verifica que el email esté validado.
- Genera Access Token mediante `IJwtTokenGenerator`.
- Genera y persiste Refresh Token mediante `IRefreshTokenService`.
- Devuelve `AuthResponse` con ambos tokens y datos del usuario.
- Utiliza el mismo error genérico para email inexistente y contraseña incorrecta.

**`Application/Interfaces/IRefreshTokenSettingsProvider.cs`** (nuevo)
- Interfaz para obtener la expiración de Refresh Tokens.

**`Infrastructure/Settings/RefreshTokenSettingsProvider.cs`** (nuevo)
- Implementación que lee `RefreshToken:ExpirationDays` desde configuración.

**`Api/Program.cs`** (modificado)
- Se registraron `IAuthService` → `AuthService` y `IRefreshTokenSettingsProvider` → `RefreshTokenSettingsProvider`.

**`project/services.md`** (actualizado)
- Se agregó la entrada `AuthService` documentando su responsabilidad, dependencias, comportamiento, ubicación y notas de seguridad.

### Verificación

- `Application` compila correctamente.
- `Infrastructure` compila correctamente.
- No se incorporaron nuevas dependencias tecnológicas.
- La lógica de autenticación respeta la arquitectura Clean Architecture.
- No se revela información sensible en los errores.
