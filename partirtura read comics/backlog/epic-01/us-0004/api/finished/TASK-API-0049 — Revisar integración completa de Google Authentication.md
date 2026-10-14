# TASK-API-0049 — Revisar integración completa de Google Authentication

## Objetivo

Realizar una revisión integral de la implementación de US-0004 para detectar inconsistencias, duplicación, violaciones arquitectónicas o diferencias con los mecanismos existentes de autenticación.

Esta Task debe ejecutarse después de finalizar:

```text
TASK-API-0045
TASK-API-0046
TASK-API-0047
TASK-API-0048
```

---

## Revisar especialmente

### Usuarios duplicados

Verificar:

```text
Email/password User
        +
Google mismo email
        ↓
Mismo User
```

Nunca deben existir dos usuarios por utilizar distintos mecanismos de autenticación.

---

### Google User → Password

Verificar:

```text
Google User
    ↓
Recuperar contraseña
    ↓
Nueva password
    ↓
Login tradicional
```

Debe funcionar correctamente.

---

### Login tradicional

Verificar que la incorporación de Google no haya modificado:

- credenciales inválidas;
- usuarios no validados;
- JWT;
- Refresh Token;
- cookies;
- respuestas.

---

### Seguridad

Verificar que:

- no se confíe en emails enviados por el cliente;
- Google credentials se validen correctamente;
- no se almacenen tokens Google;
- no se almacenen secretos innecesarios;
- no se registren tokens en logs;
- no se revele información sobre el proveedor de autenticación;
- no se revelen usuarios existentes.

---

### Arquitectura

Verificar:

```text
Application
    ↓
Repositories
Infrastructure capabilities
    ↓
UnitOfWork
```

No deben existir Infrastructure Services que accedan a Repository para ocultar comportamiento de Application.

Application debe controlar la orquestación del caso de uso.

---

### Configuración

Verificar:

- Google ClientId configurable.
- Google ClientSecret configurable.
- Configuración por ambiente.
- Sin credenciales hardcodeadas.
- `RefreshToken:ExpirationDays` continúa siendo la única fuente de expiración.
- Configuración de cookies continúa centralizada.

---

## Documentación

Revisar y actualizar, si corresponde:

```text
project/backend-coding-rules.md
project/backend-stack-technology.md
project/domain.md
project/services.md
project/repositories.md
project/endpoints.md
```

No modificar documentación sin una razón concreta.

---

## Criterios de finalización

1. US-0004 está implementada completamente.
2. Google Login funciona para usuarios existentes.
3. Google Login crea usuarios inexistentes.
4. No existen usuarios duplicados.
5. Google User puede establecer password mediante recuperación.
6. Google User puede posteriormente utilizar email/password.
7. Login tradicional continúa funcionando.
8. JWT continúa utilizando la configuración existente.
9. Refresh Token continúa utilizando cookie HttpOnly.
10. No existen servicios de Infrastructure que oculten acceso a Repository.
11. Application continúa controlando la orquestación.
12. No se incorporó `ExternalIdentity` innecesariamente.
13. No se incorporó `GoogleData` innecesariamente.
14. No existen credenciales hardcodeadas.
15. No existen tokens Google almacenados o registrados.
16. Los endpoints están documentados.
17. Las reglas arquitectónicas continúan documentadas.
18. `Application`, `Infrastructure` y `Api` compilan correctamente.
19. Las pruebas existentes continúan pasando.
20. No se modificó comportamiento no relacionado con US-0004.

---

## BLOQUEOS

Por cualquier bloqueo o necesidad de información, generar una TASK en /planned para que sea revisada y evaluada por el humano, quién luego la moverá a /pending con el resultado de la definición.

## Execution Result

Completed successfully.

### Review Findings

1. **No duplicate users**: Email is the unique identifier. `GetByEmailAsync` ensures the same user is used regardless of authentication method. Verified in `AuthService.LoginWithGoogleAsync`.

2. **Google User → Password**: Google users have `IsEmailValidated = true` and `PasswordHash = string.Empty`. They can use the existing password recovery flow (`ForgotPassword` → `ValidatePasswordResetCode` → `ResetPassword`) to set a password. After setting a password, they can login with email/password. Verified in `PasswordResetService`.

3. **Traditional login unchanged**: `LoginAsync`, `RefreshTokenAsync`, and `LogoutAsync` remain unchanged. No modifications to existing authentication behavior.

4. **Security verified**:
   - Google ID tokens are validated server-side using `GoogleJsonWebSignature.ValidateAsync`
   - No Google tokens are stored in the database
   - No Google secrets are stored
   - Blanket catch in `LoginWithGoogleAsync` prevents any Google SDK exceptions from leaking to the client
   - All Google-related errors return generic "Credenciales incorrectas."
   - No provider or user existence information is revealed

5. **Architecture verified**:
   - `GoogleAuthenticationService` is in Infrastructure, implements `IGoogleAuthenticationService` from Application
   - `GoogleAuthenticationService` does NOT access repositories
   - `AuthService` in Application orchestrates the complete use case
   - No Infrastructure service hides repository access from Application

6. **Configuration verified**:
   - `Google:ClientId` and `Google:ClientSecret` are configurable per environment
   - Values are placeholders in appsettings, overridable via environment variables
   - `RefreshToken:ExpirationDays` remains the single source for token expiration
   - Cookie configuration remains centralized in `RefreshTokenCookieSettingsProvider`

7. **Documentation verified and updated**:
   - `endpoints.md`: New `POST /api/users/google-login` endpoint documented
   - `services.md`: `GoogleAuthenticationService`, `GoogleUserInfo`, and updated `AuthService` documented
   - `backend-stack-technology.md`: `Microsoft.AspNetCore.Authentication.Google` documented
   - `domain.md`: New exceptions (`InvalidCredentialsException`, `ValidationException`, `RateLimitExceededException`) documented
   - `repositories.md` and `backend-coding-rules.md`: No changes needed

### Verification

- Solution builds successfully with no errors and no warnings.
- No existing tests to run (test project not found in solution).
- No behavioral changes to existing endpoints.
- All acceptance criteria from TASK-API-0045, TASK-API-0046, TASK-API-0047, and TASK-API-0048 are met.