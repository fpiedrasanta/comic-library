# TASK-API-0047 — Implementar caso de uso de Login mediante Google

## Objetivo

Implementar en Application el caso de uso de autenticación mediante Google, integrándolo con el modelo de usuarios existente y reutilizando los mecanismos actuales de JWT y Refresh Token.

---

## Contexto

User Story:

```text
US-0004 — Autenticación mediante Google: /partirtura read comics/backlog/epic-01/us-0004/us-0004.md
```

Debe utilizarse el servicio técnico creado en:

```text
TASK-API-0046
```

---

## Flujo

### 1. Validar identidad Google

Application debe utilizar el servicio de Google para obtener una identidad validada.

```text
Credential Google
        ↓
Google Authentication Service
        ↓
GoogleUserInfo
```

---

### 2. Buscar usuario por email

Una vez validada la identidad:

```text
GoogleUserInfo.Email
        ↓
UserRepository.GetByEmailAsync(...)
```

---

### 3. Usuario existente

Si existe un usuario con ese email:

```text
User encontrado
        ↓
Autenticar usuario existente
        ↓
Generar Access Token
        ↓
Generar Refresh Token
        ↓
Retornar resultado de autenticación
```

No crear un nuevo usuario.

Esto debe funcionar tanto para:

- usuario registrado originalmente mediante email/password;
- usuario creado originalmente mediante Google.

---

### 4. Usuario inexistente

Si no existe un usuario con ese email:

```text
User no encontrado
        ↓
Crear User
        ↓
Email validado
        ↓
Persistir User
        ↓
Generar Access Token
        ↓
Generar Refresh Token
        ↓
Retornar resultado de autenticación
```

Utilizar los datos proporcionados por Google para completar:

- Email.
- FirstName.
- LastName.
- Avatar, si corresponde al modelo actual.

No crear información que no sea necesaria.

---

## Email validado

Un usuario creado mediante Google debe considerarse con email validado.

No debe enviarse al usuario por el flujo tradicional de validación de email.

---

## Password

Un usuario creado mediante Google inicialmente puede no tener password.

No inventar una password.

No almacenar ningún secreto proveniente de Google como `PasswordHash`.

El usuario podrá establecer posteriormente una password mediante el flujo existente de:

```text
Recuperar contraseña
```

Una vez establecida, podrá utilizar:

```text
Google
```

o:

```text
Email + Password
```

---

## Generación de sesión

Debe reutilizarse el mecanismo existente.

Application debe generar:

```text
Access Token
Refresh Token
```

El Refresh Token debe continuar siendo entregado al Controller para que Presentation lo establezca mediante la cookie `HttpOnly` existente.

No crear un mecanismo alternativo.

---

## AuthResponse

La respuesta pública debe continuar utilizando:

```text
AuthResponse
```

No agregar un campo específico como:

```text
GoogleToken
GoogleData
Provider
```

salvo que exista una necesidad funcional concreta.

---

## Arquitectura

Application debe orquestar:

```text
Google Authentication Service
        ↓
UserRepository
        ↓
UnitOfWork
        ↓
JWT Generator
        ↓
Refresh Token Generator
        ↓
AuthResult
```

Los servicios técnicos de Infrastructure no deben acceder a repositorios.

Application debe controlar:

- búsqueda del usuario;
- creación del usuario;
- persistencia;
- generación de tokens;
- mapeo de respuesta.

---

## Restricciones

No crear:

```text
ExternalIdentity
```

No crear:

```text
GoogleData
```

No duplicar usuarios.

No modificar el comportamiento del Login tradicional.

No modificar el flujo de recuperación de contraseña salvo que sea estrictamente necesario para soportar usuarios creados mediante Google.

No crear una segunda implementación de JWT o Refresh Token.

---

## Manejo de errores

Si la autenticación de Google es inválida:

```text
Credenciales inválidas.
```

No devolver información interna de Google.

No exponer:

- detalles del token;
- claims;
- excepciones del SDK;
- información sensible.

---

## Documentación

Actualizar:

```text
project/services.md
```

si se incorpora o modifica un servicio.

Actualizar:

```text
project/repositories.md
```

si se incorporan nuevas operaciones de repositorio.

Actualizar:

```text
project/domain.md
```

si se modifica el modelo `User`.

---

## Criterios de finalización

1. Google puede autenticar un usuario existente.
2. Google puede crear un usuario inexistente.
3. No se crean usuarios duplicados.
4. La búsqueda de usuarios se realiza por email validado por Google.
5. Los usuarios creados mediante Google tienen email validado.
6. Los datos de Google necesarios se almacenan en `User`.
7. No se almacena una password inventada para usuarios Google.
8. El usuario Google puede posteriormente establecer una password mediante recuperación de contraseña.
9. El usuario puede posteriormente utilizar email/password.
10. Se genera el mismo Access Token que en Login tradicional.
11. Se genera el mismo Refresh Token que en Login tradicional.
12. El Refresh Token continúa siendo gestionado mediante cookie HttpOnly en Presentation.
13. Application controla la orquestación.
14. Ningún Infrastructure Service accede a Repository.
15. No se crea `ExternalIdentity`.
16. No se crea `GoogleData` innecesariamente.
17. El Login tradicional continúa funcionando.
18. `Application`, `Infrastructure` y `Api` compilan correctamente.

--

## BLOQUEOS

Por cualquier bloqueo o necesidad de información, generar una TASK en /planned para que sea revisada y evaluada por el humano, quién luego la moverá a /pending con el resultado de la definición.

## Execution Result

Completed successfully.

### Changes Made

- Updated `IAuthService` to include `LoginWithGoogleAsync(string idToken)`.
- Implemented `LoginWithGoogleAsync` in `AuthService`:
  - Validates Google ID token via `IGoogleAuthenticationService`.
  - Retrieves existing user by email or creates a new one with validated email and empty password.
  - New users are assigned the first active country as nationality.
  - Reuses `GenerateAuthResultAsync` to produce JWT and Refresh Token.
  - Catches Google validation exceptions and throws `InvalidCredentialsException` to avoid leaking details.
- Refactored `AuthService` to extract common token generation logic into `GenerateAuthResultAsync`.
- Created `Application/DTOs/GoogleLoginApiRequest.cs`.
- Updated `services.md` with `LoginWithGoogleAsync` behavior, new dependencies, and notes.
- No changes to `domain.md` or `repositories.md` were needed.

### Verification

- Solution builds successfully with no errors.
- Traditional login (`LoginAsync`) continues to work unchanged.
- Google login creates users with `IsEmailValidated = true` and `PasswordHash = string.Empty`.
- No `ExternalIdentity` or `GoogleData` entities were created.
- No Google tokens are stored or logged.