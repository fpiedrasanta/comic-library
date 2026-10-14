# TASK-API-0050 — Completar casos límite de Google Login y compatibilidad con usuarios sin password

## Objetivo

Revisar y corregir la implementación de `LoginWithGoogleAsync` para asegurar que el Login mediante Google sea compatible con usuarios existentes, usuarios pendientes de validación y usuarios creados originalmente mediante Google.

La Task debe corregir únicamente el comportamiento necesario para completar el flujo definido en US-0004, sin introducir nuevas entidades como `ExternalIdentity` o `GoogleData`.

---

## 1. Usuario existente con email no validado

Si Google devuelve un email que corresponde a un usuario existente cuyo email todavía no fue validado:

```text
Usuario existente
Email no validado
        ↓
Login con Google
        ↓
Google valida correctamente el ID Token
        ↓
Marcar email como validado
        ↓
Continuar Login
        ↓
Generar JWT + Refresh Token
```

El email debe considerarse validado porque Google confirmó la identidad del correo mediante un ID Token válido.

No se debe crear un segundo usuario.

---

## 2. Usuario existente con email validado

Si el email obtenido desde Google corresponde a un usuario existente y ya validado:

```text
Usuario existente
Email validado
        ↓
Login con Google
        ↓
Login exitoso
```

Debe reutilizarse el usuario existente.

No se debe crear otro registro.

---

## 3. Usuario inexistente

Si no existe ningún usuario con el email obtenido desde Google:

```text
Google ID Token válido
        ↓
Email no existente
        ↓
Crear User
        ↓
IsEmailValidated = true
        ↓
Continuar Login
```

El nuevo usuario debe mantener las reglas existentes del dominio.

No crear `ExternalIdentity` ni `GoogleData` salvo que exista un requerimiento explícito posterior.

---

## 4. Usuarios creados originalmente mediante Google

Un usuario creado mediante Google puede no tener una contraseña tradicional.

Actualmente se representa mediante:

```text
PasswordHash = string.Empty
```

Verificar que esta representación sea compatible con todos los flujos existentes.

Debe ser posible:

```text
Usuario creado con Google
        ↓
PasswordHash vacío
        ↓
Recuperar contraseña
        ↓
Establecer nueva contraseña
        ↓
PasswordHash contiene hash válido
        ↓
Login tradicional mediante email + password
```

No modificar innecesariamente el modelo de usuario si la representación actual es suficiente.

---

## 5. Login tradicional de usuario Google

Verificar que un usuario creado originalmente mediante Google y que todavía no posee contraseña:

```text
Email + password
        ↓
PasswordHash vacío
        ↓
Credenciales inválidas
```

No debe producir errores técnicos, excepciones inesperadas ni comportamientos inconsistentes.

Una vez que el usuario establezca una contraseña mediante el flujo de recuperación:

```text
Email + nueva password
        ↓
PasswordHash válido
        ↓
Login tradicional permitido
```

---

## 6. Generación de sesión

Google Login debe utilizar el mismo mecanismo de generación de sesión que el Login tradicional.

Debe continuar utilizando:

- JWT configurado mediante `Jwt:*`.
- Refresh Token.
- Refresh Token Rotation.
- Cookie HttpOnly para el Refresh Token.
- `AuthResult` como resultado interno.
- `AuthResponse` como respuesta pública.

No duplicar la lógica de generación de tokens.

---

## 7. Seguridad

No almacenar:

- Google ID Token.
- Google Access Token.
- Google Refresh Token.

No registrar estos valores en logs.

Los errores producidos por una validación inválida del ID Token deben continuar siendo genéricos y no revelar información sensible.

---

## 8. Arquitectura

Respetar las reglas arquitectónicas existentes:

- `AuthService` orquesta el caso de uso.
- `GoogleAuthenticationService` solamente valida el ID Token y devuelve `GoogleUserInfo`.
- Los repositorios solamente realizan persistencia.
- Los servicios de Infrastructure no deben ocultar acceso a repositorios.
- No crear nuevas abstracciones innecesarias.

---

## 9. Documentación

Actualizar, si corresponde:

- `project/services.md`
- `project/domain.md`
- `project/repositories.md`
- `project/endpoints.md`
- `project/frontend-coding-rules.md` solamente si se identifica una regla general aplicable.

No modificar `backend-stack-technology.md` salvo que se incorpore una nueva dependencia.

---

## Criterios de finalización

1. Un usuario existente con email no validado puede autenticarse mediante Google.
2. Al autenticarse correctamente mediante Google, su email queda marcado como validado.
3. Nunca se crea un segundo usuario para un email existente.
4. Un usuario existente y validado puede autenticarse mediante Google.
5. Un usuario inexistente puede ser creado mediante Google.
6. Un usuario creado mediante Google puede existir con `PasswordHash` vacío.
7. Un `PasswordHash` vacío no provoca errores técnicos durante el Login tradicional.
8. Un usuario Google puede utilizar Recuperar contraseña.
9. Después de establecer una contraseña, puede utilizar Login tradicional.
10. Google Login utiliza el mismo mecanismo de JWT y Refresh Token que Login tradicional.
11. El Refresh Token continúa siendo enviado exclusivamente mediante cookie HttpOnly.
12. No se almacenan ni registran tokens de Google.
13. No se crean entidades `ExternalIdentity` ni `GoogleData`.
14. Application, Infrastructure y Api compilan correctamente.

---

## BLOQUEOS

Por cualquier bloqueo o necesidad de información, generar una TASK en /planned para que sea revisada y evaluada por el humano, quién luego la moverá a /pending con el resultado de la definición.

## Execution Result

Completed successfully.

### Changes Made

- Updated `AuthService.LoginWithGoogleAsync` to handle existing users with unvalidated emails:
  - When a user exists but `IsEmailValidated` is false, the method now sets `IsEmailValidated = true`, clears `EmailValidationToken` and `EmailValidationTokenExpiresAt`, updates `UpdatedAt`, and persists the changes.
  - This ensures Google-authenticated users are properly validated without creating duplicates.

### Edge Cases Verified

1. **Usuario existente con email no validado**: Google login now marks the email as validated and continues with authentication. No duplicate user is created.
2. **Usuario existente con email validado**: Works as before - reuses the existing user.
3. **Usuario inexistente**: Creates a new user with `IsEmailValidated = true` and empty `PasswordHash`.
4. **Google User sin password**: `PasswordHash = string.Empty` does not cause technical errors during traditional login. `PasswordHasher.Verify` returns false for any non-empty password against an empty hash, which correctly results in `InvalidCredentialsException`.
5. **Google User → Recuperar contraseña**: Works correctly because `IsEmailValidated = true`. The user can request a reset, set a new password, and then login with email/password.
6. **Login tradicional de usuario Google sin password**: Returns "Credenciales incorrectas." without technical errors.
7. **Generación de sesión**: Uses the same `GenerateAuthResultAsync` method as traditional login. JWT, Refresh Token, and cookie configuration are identical.
8. **Seguridad**: No Google tokens are stored or logged. All Google validation errors return generic "Credenciales incorrectas."

### Verification

- Solution builds successfully with no errors and no warnings.
- No new entities (`ExternalIdentity`, `GoogleData`) were created.
- No architectural violations detected.
- No changes to traditional login behavior.