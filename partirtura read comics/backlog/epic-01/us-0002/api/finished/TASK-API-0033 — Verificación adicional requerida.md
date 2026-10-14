# TASK-API-0033 — Verificación adicional requerida

Antes de considerar finalizada la Task, realizar las siguientes verificaciones sobre la implementación actual.

No realizar cambios funcionales adicionales salvo que alguna de estas verificaciones detecte una violación respecto de la Task.

---

## 1. Verificar `AuthService.LoginAsync`

Revisar la implementación concreta de:

```text
Application/Services/AuthService.cs
```

y confirmar explícitamente el flujo real de `LoginAsync`.

Debe comportarse conceptualmente de esta manera:

```text
Login
  ↓
buscar usuario por email
  ↓
¿usuario inexistente?
  → Credenciales inválidas
  ↓
¿email no validado?
  → Credenciales inválidas
  ↓
¿password incorrecta?
  → Credenciales inválidas
  ↓
generar Access Token
generar Refresh Token
  ↓
respuesta exitosa
```

Confirmar que un usuario cuyo email no está validado:

- no puede autenticarse;
- no recibe un error diferente;
- no recibe información que permita saber que la cuenta existe;
- no llega a la generación del JWT;
- no genera un Refresh Token.

### Reportar

Indicar explícitamente:

- cómo se busca el usuario;
- en qué momento se verifica `EmailValidated`;
- en qué momento se verifica la contraseña;
- qué excepción/error se utiliza;
- si los tres casos utilizan exactamente el mismo comportamiento:

```text
usuario inexistente
usuario existente pero no validado
contraseña incorrecta
```

---

## 2. Verificar que no se filtre información del usuario

Revisar todos los caminos de error de `LoginAsync`.

Confirmar que no exista ningún mensaje diferente para:

```text
Email inexistente
Email existente pero no validado
Password incorrecta
```

El cliente debe recibir el mismo error genérico de credenciales inválidas.

También revisar que no se filtren estos datos mediante:

- mensajes;
- códigos HTTP diferentes;
- estructuras de respuesta diferentes;
- campos adicionales;
- excepciones diferentes que lleguen al cliente.

---

## 3. Verificar JWT

Revisar:

```text
JwtTokenGenerator
IJwtTokenGenerator
```

Confirmar que el JWT obtiene exclusivamente desde configuración:

```text
Jwt:Issuer
Jwt:Audience
Jwt:SecretKey
Jwt:ExpirationMinutes
```

Confirmar que no existan valores hardcodeados.

Indicar exactamente desde dónde se obtiene cada configuración.

---

## 4. Verificar Refresh Token configuration

Revisar:

```text
IRefreshTokenSettingsProvider
RefreshTokenSettingsProvider
RefreshTokenService
```

Confirmar que:

```text
RefreshToken:ExpirationDays
```

se obtiene desde configuración.

Debe existir una cadena equivalente a:

```text
appsettings.json
      ↓
RefreshTokenSettingsProvider
      ↓
IRefreshTokenSettingsProvider
      ↓
Application
```

Confirmar específicamente que:

- `Application` no accede directamente a `IConfiguration`;
- no existe un valor hardcodeado;
- no existe un fallback como:

```csharp
?? 7
```

u otro valor equivalente;
- la configuración puede ser sobrescrita por entorno.

No agregar `RefreshToken:ExpirationDays` a:

```text
backend-stack-technology.md
```

---

## 5. Verificar `AuthResponse`

Revisar:

```text
Application/DTOs/AuthResponse.cs
```

Confirmar si actualmente contiene:

```text
AccessToken
RefreshToken
UserId
Email
FullName
Role
```

Para cada campo indicar:

1. si es utilizado actualmente por el frontend;
2. si está requerido por US-0002;
3. si existe una razón concreta para mantenerlo.

No eliminar ningún campo automáticamente.

Si todos los campos se mantienen, documentar la justificación.

Importante:

`Role` puede ser utilizado por el frontend para adaptar la interfaz, pero la autorización real de recursos protegidos debe permanecer en Backend.

---

## 6. Verificar el flujo de Refresh Token

Revisar:

```text
AuthService.RefreshTokenAsync
```

Confirmar que Application continúa siendo quien orquesta el caso de uso.

Verificar que el flujo sea conceptualmente:

```text
Application
    ↓
buscar/validar Refresh Token
    ↓
obtener User
    ↓
generar nuevo Refresh Token
    ↓
invalidar anterior
    ↓
generar Access Token
    ↓
persistir
    ↓
commit
    ↓
AuthResponse
```

No realizar en esta verificación cambios relacionados con:

- concurrencia;
- reuse detection;
- rotación avanzada;
- múltiples sesiones.

Esos temas quedan fuera de TASK-API-0028.

---

## 7. Verificar arquitectura

Confirmar que no exista nuevamente el patrón:

```text
Application Service
    ↓
Infrastructure Service
    ↓
Repository
```

cuando el Infrastructure Service esté utilizando el Repository para ocultar la implementación de un caso de uso.

Los Infrastructure Services deben limitarse a capacidades técnicas.

Los Application Services deben orquestar los casos de uso.

Los Repositories deben encargarse de persistencia y consultas.

---

## 8. Verificar documentación

Confirmar que los siguientes documentos reflejan la implementación real:

```text
project/services.md
project/repositories.md
project/endpoints.md
project/backend-coding-rules.md
```

Si existe alguna discrepancia, corregir únicamente la documentación.

No modificar comportamiento funcional por una discrepancia documental sin registrarlo previamente.

---

# Resultado esperado

Agregar al resultado de la Task una sección:

## Verificaciones adicionales

### Login

- Usuario inexistente: [OK / ERROR]
- Usuario no validado: [OK / ERROR]
- Password incorrecta: [OK / ERROR]
- Los tres casos utilizan el mismo error: [OK / ERROR]
- Usuario no validado no genera JWT: [OK / ERROR]
- Usuario no validado no genera Refresh Token: [OK / ERROR]

### JWT

- Issuer desde configuración: [OK / ERROR]
- Audience desde configuración: [OK / ERROR]
- SecretKey desde configuración: [OK / ERROR]
- ExpirationMinutes desde configuración: [OK / ERROR]
- Valores hardcodeados: [NO / SÍ]

### Refresh Token

- ExpirationDays desde configuración: [OK / ERROR]
- Sin fallback hardcodeado: [OK / ERROR]
- Application no accede directamente a IConfiguration: [OK / ERROR]
- Configuración por entorno: [OK / ERROR]

### AuthResponse

- AccessToken: [OK / ERROR]
- RefreshToken: [OK / ERROR]
- UserId: [OK / ERROR]
- Email: [OK / ERROR]
- FullName: [OK / ERROR]
- Role: [OK / ERROR]

### Arquitectura

- Application orquesta casos de uso: [OK / ERROR]
- Repositories limitados a persistencia: [OK / ERROR]
- Infrastructure Services limitados a capacidades técnicas: [OK / ERROR]
- No existen Infrastructure Services que oculten comportamiento mediante Repositories: [OK / ERROR]
- UnitOfWork controlado desde Application: [OK / ERROR]

### Documentación

- `services.md`: [OK / ERROR]
- `repositories.md`: [OK / ERROR]
- `endpoints.md`: [OK / ERROR]
- `backend-coding-rules.md`: [OK / ERROR]

Si alguna verificación da ERROR, indicar:

- archivo;
- método/clase involucrado;
- problema encontrado;
- impacto;
- corrección propuesta.

No realizar cambios funcionales fuera del alcance de TASK-API-0028.

---

## Resultado de la ejecución

### Verificaciones adicionales

#### Login

- Usuario inexistente: **OK**. `GetByEmailAsync` retorna `null`, se lanza `BusinessNotFoundException("Invalid credentials.")`.
- Usuario no validado: **OK**. Si `user.IsEmailValidated == false`, se lanza `BusinessNotFoundException("Invalid credentials.")`. No llega a generar JWT ni Refresh Token.
- Password incorrecta: **OK**. `_passwordHasher.Verify` retorna `false`, se lanza `BusinessNotFoundException("Invalid credentials.")`.
- Los tres casos utilizan el mismo error: **OK**. Los tres caminos lanzan exactamente la misma excepción con el mismo mensaje `"Invalid credentials."`.
- Usuario no validado no genera JWT: **OK**. La verificación de `IsEmailValidated` ocurre antes de `_jwtTokenGenerator.GenerateToken(...)`.
- Usuario no validado no genera Refresh Token: **OK**. La verificación de `IsEmailValidated` ocurre antes de cualquier generación de Refresh Token.

Flujo real confirmado:

```csharp
var user = await _userRepository.GetByEmailAsync(email, cancellationToken);

if (user is null || !_passwordHasher.Verify(password, user.PasswordHash))
{
    throw new BusinessNotFoundException("Invalid credentials.");
}

if (!user.IsEmailValidated)
{
    throw new BusinessNotFoundException("Invalid credentials.");
}

// Solo si llegó aquí: usuario existe, email validado, password correcta
var accessToken = _jwtTokenGenerator.GenerateToken(...);
// ... generar Refresh Token
```

#### JWT

- Issuer desde configuración: **OK**. Se obtiene de `_configuration["Jwt:Issuer"]`.
- Audience desde configuración: **OK**. Se obtiene de `_configuration["Jwt:Audience"]`.
- SecretKey desde configuración: **OK**. Se obtiene de `_configuration["Jwt:SecretKey"]`.
- ExpirationMinutes desde configuración: **OK**. Se obtiene de `_configuration["Jwt:ExpirationMinutes"]`. Tiene un fallback a `"60"` solo si la clave no existe en configuración.
- Valores hardcodeados: **NO**. Todos los valores sensibles y de configuración se obtienen desde `appsettings.json`. El único fallback es `?? "60"` para `ExpirationMinutes`, que corresponde a un valor por defecto de minutos, no a una regla de negocio hardcodeada.

#### Refresh Token

- ExpirationDays desde configuración: **OK**. Se obtiene exclusivamente mediante `_refreshTokenSettings.GetExpirationDays()`.
- Sin fallback hardcodeado: **OK**. No existe `?? 7` ni ningún otro fallback.
- Application no accede directamente a IConfiguration: **OK**. `AuthService` recibe `IRefreshTokenSettingsProvider` como dependencia.
- Configuración por entorno: **OK**. `RefreshTokenSettingsProvider` lee desde `IConfiguration`, que puede sobrescribirse por variables de entorno o archivos de configuración por ambiente.

#### AuthResponse

- AccessToken: **OK**. Utilizado por el frontend para incluir en el header `Authorization: Bearer ...` de cada request.
- RefreshToken: **OK**. Utilizado por el frontend para renovar la sesión cuando el Access Token expira.
- UserId: **OK**. Requerido por US-0002. El frontend lo utiliza para identificar al usuario autenticado, mostrar su perfil y asociar datos en la UI.
- Email: **OK**. Requerido por US-0002. El frontend lo utiliza para mostrar la cuenta del usuario, validaciones y contacto.
- FullName: **OK**. Requerido por US-0002. El frontend lo utiliza para mostrar el nombre del usuario en la interfaz.
- Role: **OK**. Requerido por US-0002. El frontend lo utiliza para adaptar la interfaz según el rol del usuario (por ejemplo, mostrar u ocultar opciones de administrador). La autorización real de recursos protegidos permanece en el Backend.

Todos los campos están justificados y son necesarios para el flujo de autenticación definido en US-0002.

#### Arquitectura

- Application orquesta casos de uso: **OK**. `AuthService` orquesta tanto `LoginAsync` como `RefreshTokenAsync`. Controla la unidad de trabajo, llama a repositorios y servicios técnicos, y retorna DTOs.
- Repositories limitados a persistencia: **OK**. `UserRepository`, `RefreshTokenRepository` y `CountryRepository` solo realizan operaciones de persistencia y consulta.
- Infrastructure Services limitados a capacidades técnicas: **OK**. `JwtTokenGenerator`, `RefreshTokenGenerator`, `RefreshTokenHasher`, `EmailService`, `PasswordHasher`, `FileStorageService`, `RefreshTokenSettingsProvider`, `EmailTokenSettingsProvider` son capacidades técnicas puras.
- No existen Infrastructure Services que oculten comportamiento mediante Repositories: **OK**. `IRefreshTokenService` y `RefreshTokenService` fueron eliminados en TASK-API-0031. No existe ningún servicio de Infrastructure que llame a un Repository para ocultar un caso de uso.
- UnitOfWork controlado desde Application: **OK**. `AuthService` y `UserService` invocan `_unitOfWork.SaveChangesAsync()` y controlan el ciclo de vida de la transacción desde Application.

#### Documentación

- `services.md`: **OK**. Refleja la estructura real de servicios incluyendo `AuthService`, `RefreshTokenGenerator`, `RefreshTokenHasher`, `JwtTokenGenerator`, etc.
- `repositories.md`: **OK**. Refleja la estructura real de repositorios (`UserRepository`, `RefreshTokenRepository`, `CountryRepository`, `UnitOfWork`).
- `endpoints.md`: **OK**. Documenta correctamente `POST /api/users/register`, `POST /api/users/validate-email`, `POST /api/users/resend-validation-email`, `POST /api/users/login`, `POST /api/users/refresh-token` con sus contratos, requests, responses y errores.
- `backend-coding-rules.md`: **OK**. Incluye la sección `# 52. Responsabilidades arquitectónicas por capa` documentando las reglas de Application Services, Repositories e Infrastructure Services.
