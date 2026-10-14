# TASK-API-0065 — Incorporar rol a la autenticación y JWT

## Tipo

Backend / Application / Infrastructure / Authentication.

## User Story

US-0006 — Autenticación y acceso al Dashboard administrativo.

## Objetivo

Incorporar el rol del usuario dentro del mecanismo de autenticación existente para que el `Access Token` JWT contenga la información necesaria para determinar posteriormente si el usuario posee autorización administrativa.

El rol debe formar parte de la identidad autenticada y debe estar representado mediante un claim estándar:

```text
role
```

El valor inicial utilizado por el sistema será:

```text
Administrator
```

Esta task debe modificar el mecanismo existente de generación de JWT para incluir el rol del usuario sin crear un mecanismo de autenticación paralelo para el Dashboard.

La autorización efectiva de endpoints administrativos será implementada en una task posterior.

---

## Alcance

Implementar:

- Recuperación del rol del usuario durante la autenticación.
- Inclusión del rol en el `Access Token` JWT.
- Uso del claim estándar `role`.
- Compatibilidad con login mediante email y contraseña.
- Compatibilidad con login mediante Google.
- Compatibilidad con refresh token.
- Compatibilidad con la configuración existente de JWT.
- Preservación de los claims existentes.
- Configuración de ASP.NET Core JWT para interpretar correctamente el claim de rol.

No implementar en esta task:

- Policies administrativas.
- Protección de endpoints administrativos.
- Login específico para `/api/admin`.
- Nuevos endpoints de autenticación.
- Gestión de usuarios.
- Gestión de roles desde el Dashboard.
- RBAC avanzado.
- Permisos granulares.
- Creación del usuario administrador inicial.

---

## Documentación previa obligatoria

Antes de modificar el código, revisar:

- `project.md`
- `communication.md`
- `backend-architecture.md`
- `backend-stack-technology.md`
- `backend-coding-rules.md`
- `domain.md`
- `services.md`
- `repositories.md`
- `endpoints.md`

También revisar la implementación actual de:

- `AuthService`.
- `JwtTokenGenerator`.
- `AuthResult`.
- `AuthResponse`.
- `RefreshTokenGenerator`.
- `RefreshTokenRepository`.
- Configuración de JWT.
- `Program.cs`.
- Configuración de `AddAuthentication`.
- Configuración de `AddJwtBearer`.
- Claims actualmente generados.
- `MapInboundClaims`.
- Login tradicional.
- Login mediante Google.
- Refresh Token Rotation.

No asumir que la implementación actual utiliza correctamente los claims estándar.

---

## Claims actuales

La implementación existente genera información de identidad mediante JWT.

Debe conservarse la información actualmente utilizada por el sistema.

Los claims relevantes deben mantenerse como:

```text
sub
email
name
role
```

El claim `role` debe agregarse sin eliminar los claims existentes necesarios para la autenticación.

No cambiar innecesariamente los nombres de claims existentes.

---

## Claim de rol

El JWT debe incluir el rol del usuario mediante:

```text
role
```

Por ejemplo:

```json
{
  "sub": "123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "Administrator"
}
```

El valor debe obtenerse de la identidad persistida del usuario.

No debe obtenerse desde:

- Request.
- Query string.
- Header enviado por el frontend.
- Body.
- Configuración del frontend.
- Email del usuario.

El rol debe provenir exclusivamente del estado de identidad del usuario almacenado por el backend.

---

## JwtTokenGenerator

Modificar `JwtTokenGenerator` para incorporar el rol del usuario al token.

El generador debe recibir la información necesaria para generar el claim.

Evitar que `JwtTokenGenerator` consulte directamente repositorios o DbContext.

La responsabilidad del generador continúa siendo:

```text
Datos de identidad
        ↓
JwtTokenGenerator
        ↓
JWT
```

No debe transformarse `JwtTokenGenerator` en un servicio de acceso a datos.

---

## AuthService

`AuthService` debe asegurarse de que el resultado de autenticación contenga la información necesaria para generar el JWT con el rol correcto.

Para login mediante email/password:

```text
Email
  ↓
User
  ↓
Role
  ↓
JwtTokenGenerator
  ↓
Access Token
```

Para login mediante Google:

```text
Google ID Token
        ↓
GoogleUserInfo
        ↓
User
        ↓
Role
        ↓
JwtTokenGenerator
        ↓
Access Token
```

Para refresh token:

```text
Refresh Token
        ↓
User
        ↓
Role
        ↓
JwtTokenGenerator
        ↓
New Access Token
```

En todos los casos el JWT debe reflejar el rol actual del usuario.

---

## Refresh Token

La renovación mediante Refresh Token debe generar un nuevo JWT utilizando el rol actual del usuario.

No debe conservarse el rol exclusivamente a partir del JWT anterior.

El backend debe volver a obtener la identidad necesaria a partir del usuario asociado al Refresh Token.

Esto permite que un cambio futuro de rol tenga efecto en el siguiente Access Token generado.

Ejemplo:

```text
Access Token anterior
role = PublicUser

        ↓

Usuario recibe Administrator

        ↓

Refresh Token

        ↓

Nuevo Access Token
role = Administrator
```

De la misma manera, si un usuario deja de ser administrador, un nuevo Access Token no debe continuar otorgándole el rol anterior simplemente porque el Refresh Token fue generado cuando tenía otro rol.

---

## Configuración JWT

Revisar la configuración actual de:

```csharp
AddJwtBearer(...)
```

y verificar que ASP.NET Core reconozca:

```text
role
```

como claim de rol.

La configuración debe ser compatible con el comportamiento existente de:

```text
MapInboundClaims = false
```

cuando dicha configuración ya forme parte del proyecto.

No cambiar `MapInboundClaims` sin una razón técnica.

El objetivo es mantener los claims estándar:

```text
sub
email
name
role
```

sin que ASP.NET Core los transforme inesperadamente.

---

## RoleClaimType

Si la configuración actual requiere especificarlo explícitamente, utilizar:

```text
role
```

como `RoleClaimType`.

La configuración debe permitir posteriormente utilizar mecanismos estándar como:

```csharp
[Authorize(Roles = "Administrator")]
```

o policies equivalentes.

No implementar todavía esos mecanismos de autorización en esta task.

---

## Login tradicional

Verificar que un usuario autenticado mediante:

```text
POST /api/users/login
```

reciba un Access Token que contenga su rol.

El endpoint existente debe mantenerse.

No crear:

```text
POST /api/admin/login
```

ni ningún endpoint equivalente.

El Dashboard utilizará el mismo mecanismo de autenticación existente.

---

## Login mediante Google

Verificar que el login mediante Google continúe funcionando.

Un usuario creado mediante Google debe recibir un JWT cuyo claim `role` corresponda al rol persistido para ese usuario.

El hecho de haber utilizado Google no debe asignar automáticamente:

```text
Administrator
```

El rol debe provenir de la identidad persistida.

No modificar en esta task las reglas de creación de usuarios Google salvo que sea estrictamente necesario para incorporar el rol.

---

## Refresh Token Rotation

El mecanismo existente de Refresh Token Rotation debe continuar funcionando sin cambios conceptuales.

La renovación debe:

1. Validar el Refresh Token.
2. Obtener el usuario asociado.
3. Obtener su rol actual.
4. Invalidar el Refresh Token anterior.
5. Generar un nuevo Refresh Token.
6. Generar un nuevo Access Token.
7. Incluir el rol actual en el nuevo Access Token.

No almacenar el rol dentro del Refresh Token.

El Refresh Token continúa siendo un mecanismo de sesión y no debe transformarse en un JWT.

---

## AuthResponse

Revisar `AuthResponse`.

El contrato actual ya contiene:

```text
Role
```

por lo que debe mantenerse.

El valor retornado en:

```json
{
  "role": "Administrator"
}
```

debe coincidir con el rol utilizado para generar el JWT.

No agregar información adicional al DTO si no es necesaria.

---

## Seguridad

La implementación debe respetar:

- El rol nunca debe ser aceptado desde el frontend.
- El rol nunca debe obtenerse de un request del cliente.
- El rol nunca debe determinarse por email.
- El JWT debe ser firmado mediante la configuración existente.
- El Access Token debe continuar teniendo la expiración configurada.
- El Refresh Token no debe aparecer en JSON.
- El Refresh Token debe continuar utilizando HttpOnly cookie.
- No registrar Access Tokens en logs.
- No registrar Refresh Tokens en logs.
- No registrar credenciales.
- No registrar información sensible.
- Mantener la generación centralizada de JWT.

---

## Compatibilidad con usuarios sin rol

Debe revisarse cómo se comportan los usuarios existentes que todavía no posean un rol debido a datos creados antes de esta modificación.

La implementación debe definir un comportamiento seguro.

Un usuario sin rol administrativo:

```text
NO debe
    ↓
ser interpretado como Administrator
```

Si el modelo requiere asignar un rol por defecto, debe utilizarse el mecanismo definido por la arquitectura y documentarse.

No realizar una migración silenciosa que otorgue privilegios administrativos.

---

## Consistencia entre AuthResponse y JWT

El rol retornado por:

```text
AuthResponse.Role
```

y el claim:

```text
role
```

debe representar la misma identidad.

Ejemplo:

```json
{
  "accessToken": "...",
  "userId": 123,
  "email": "fede@example.com",
  "fullName": "Federico Piedrasanta",
  "role": "Administrator"
}
```

El JWT correspondiente debe contener:

```text
sub = 123
email = fede@example.com
name = Federico Piedrasanta
role = Administrator
```

No debe existir una fuente de verdad diferente para ambos valores.

---

## No implementar autorización todavía

Esta task no debe agregar:

```csharp
[Authorize(Roles = "Administrator")]
```

a endpoints administrativos porque la protección de recursos administrativos pertenece a:

```text
TASK-API-0066
```

La presente task solamente prepara el sistema de identidad.

---

## Criterios de aceptación

### CA-01 — Role claim

El Access Token JWT debe incluir el claim:

```text
role
```

### CA-02 — Rol Administrator

Cuando el usuario posee:

```text
Administrator
```

el JWT debe contener:

```text
role = Administrator
```

### CA-03 — Rol persistido

El valor del rol debe provenir de la identidad persistida del usuario.

### CA-04 — No confiar en frontend

El backend no debe aceptar el rol desde información enviada por el cliente.

### CA-05 — Login tradicional

El login mediante email/password debe generar correctamente el claim de rol.

### CA-06 — Google Login

El login mediante Google debe continuar funcionando y generar el claim de rol correspondiente.

### CA-07 — Refresh Token

La renovación mediante Refresh Token debe generar un Access Token con el rol actual del usuario.

### CA-08 — Cambio de rol

Si el rol persistido de un usuario cambia, el siguiente Access Token generado mediante refresh debe reflejar el nuevo rol.

### CA-09 — Claims existentes

Los claims existentes necesarios para autenticación deben continuar funcionando:

```text
sub
email
name
```

### CA-10 — RoleClaimType

ASP.NET Core debe reconocer:

```text
role
```

como claim de rol.

### CA-11 — AuthResponse

El campo `Role` de `AuthResponse` debe continuar representando el rol actual del usuario.

### CA-12 — Mismo sistema de autenticación

No deben crearse endpoints específicos de login para administradores.

### CA-13 — Seguridad

El rol no debe depender del email del usuario ni de información enviada por el frontend.

### CA-14 — No autorización en esta task

No deben implementarse todavía las restricciones de acceso a endpoints administrativos.

### CA-15 — Compilación

La solución debe compilar correctamente.

---

## Pruebas

Implementar o actualizar tests para verificar como mínimo:

### Login con usuario administrador

Verificar que el JWT contenga:

```text
role = Administrator
```

### Login con usuario común

Verificar que el JWT contenga su rol correspondiente y no:

```text
Administrator
```

### Refresh de administrador

Verificar que un refresh genere un nuevo JWT con:

```text
role = Administrator
```

### Cambio de rol

Si el usuario cambia de rol entre dos sesiones:

```text
Access Token 1
    ↓
role = PublicUser

Cambio de rol

Refresh Token
    ↓
Access Token 2
    ↓
role = Administrator
```

debe reflejarse correctamente el nuevo rol.

### Google Login

Verificar que un usuario autenticado mediante Google reciba correctamente su rol.

### RoleClaimType

Verificar que ASP.NET Core pueda reconocer el claim `role` como claim de rol.

---

## Archivos potencialmente afectados

El agente debe determinar los archivos concretos después de revisar el código existente.

Potencialmente podrían modificarse:

```text
Application/Services/AuthService.cs

Application/DTOs/AuthResponse.cs

Application/DTOs/AuthResult.cs

Infrastructure/Services/JwtTokenGenerator.cs

Api/Program.cs

Api/Extensions/*

Tests/*
```

No modificar archivos que no sean necesarios.

---

## Reglas de implementación

Respetar estrictamente:

- `backend-coding-rules.md`
- `backend-architecture.md`
- Clean Architecture.
- Dependency Injection.
- Separación entre Application e Infrastructure.
- Código en inglés.
- Funciones pequeñas y con una única responsabilidad.
- No duplicar lógica de generación de JWT.
- No acceder a DbContext desde `JwtTokenGenerator`.
- No crear un repositorio genérico.
- No crear un servicio paralelo para administradores.
- Mantener la generación de tokens centralizada.

---

## Documentación a actualizar

Si se modifica el modelo de autenticación o los claims, evaluar actualizar:

```text
project/services.md
```

Si se modifica el contrato de autenticación:

```text
project/endpoints.md
```

Si se modifica la arquitectura JWT:

```text
project/backend-architecture.md
```

Si se modifica alguna regla tecnológica:

```text
project/backend-stack-technology.md
```

Actualizar únicamente los documentos afectados.

---

## Resultado esperado

Al finalizar esta task:

1. Los JWT contienen el claim `role`.
2. El claim representa el rol real del usuario.
3. `Administrator` puede viajar como rol dentro del JWT.
4. El login tradicional genera correctamente el rol.
5. El login mediante Google genera correctamente el rol.
6. El refresh token genera un JWT utilizando el rol actual.
7. ASP.NET Core reconoce `role` como claim de autorización.
8. Los claims existentes continúan funcionando.
9. `AuthResponse.Role` continúa siendo consistente con el JWT.
10. No existe un mecanismo de autenticación separado para administradores.
11. Todavía no se implementan restricciones de endpoints administrativos.
12. La solución compila correctamente.

---

## Reporte obligatorio de implementación

Al finalizar la implementación, reportar:

### 1. Archivos modificados

Indicar todos los archivos creados, modificados o eliminados.

### 2. JWT

Indicar:

- Qué claims contiene ahora el JWT.
- Cómo se obtiene el rol.
- Cómo se incorpora al token.
- Si se modificó `JwtTokenGenerator`.

No reportar tokens reales.

### 3. Configuración JWT

Indicar:

- Si fue necesario modificar `AddJwtBearer`.
- Valor utilizado para `RoleClaimType`.
- Estado de `MapInboundClaims`.

### 4. AuthService

Explicar cómo se obtiene el rol durante:

- Login.
- Google Login.
- Refresh Token.

### 5. Compatibilidad

Confirmar que continúan funcionando:

- Login.
- Google Login.
- Refresh Token Rotation.
- Logout.

### 6. Tests

Reportar:

- Tests creados o modificados.
- Resultado.
- Tests pendientes.

### 7. Compilación

Reportar el resultado de:

```bash
dotnet build
```

Indicar específicamente:

```text
Application
Infrastructure
Api
```

si corresponde.

### 8. Documentación

Indicar:

- Documentos actualizados.
- Documentos revisados que no necesitaron cambios.

### 9. Problemas encontrados

Si aparece algún problema con JWT, claims, Identity, roles, EF Core o autenticación, no realizar cambios arquitectónicos importantes por cuenta propia.

Reportar:

```text
PROBLEMA:
...

IMPACTO:
...

ALTERNATIVAS:
...

RECOMENDACIÓN:
...
```

y dejar la decisión para revisión.

---

## Reporte de implementación (Backend Agent)

### 1. Archivos modificados
- `Application/Interfaces/IJwtTokenGenerator.cs`: `GenerateToken` recibe `UserRole role`.
- `Infrastructure/Services/JwtTokenGenerator.cs`: incluye el claim `role` con `role.ToString()`.
- `Application/Services/AuthService.cs`: pasa `user.Role` al generador; `AuthResponse.Role = user.Role.ToString()`.
- `Application/Services/UserService.cs`: `ValidateEmailAsync` pasa `user.Role`.
- `Api/Program.cs`: `TokenValidationParameters.RoleClaimType = "role"`.
- `project/services.md`: notas actualizadas.

### 2. JWT
- Claims: `sub`, `email`, `name`, `role`.
- El rol proviene de la identidad persistida (`user.Role`); no se acepta del cliente.
- En login, Google login y refresh, `AuthService`/`UserService` leen `user.Role` y lo pasan al generador.

### 3. Configuración JWT
- `AddJwtBearer`: `RoleClaimType = "role"`. `MapInboundClaims = false` se mantuvo.

### 4. AuthService
- Login, Google login y Refresh Token obtienen `user.Role` y lo pasan a `JwtTokenGenerator`.

### 5. Compatibilidad
- Login, Google login, Refresh Token Rotation y Logout siguen funcionando sin cambios conceptuales.

### 6. Tests
- El repo no tiene proyecto de tests; verificado por compilación y revisión.

### 7. Compilación
- `dotnet build ComicLibrary.sln`: 0 warnings, 0 errores (Application/Infrastructure/Api).

### 8. Documentación
- `services.md` actualizado. `domain.md`, `endpoints.md` no requirieron cambios.

### 9. Problemas encontrados
- Ninguno.