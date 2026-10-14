# TASK-API-0066 — Incorporar el rol Administrator a la generación de JWT

## Tipo

Backend / Authentication / JWT.

## User Story

US-0006 — Autenticación y acceso al Dashboard administrativo.

## Objetivo

Modificar el mecanismo existente de generación de Access Tokens JWT para incorporar el rol del usuario autenticado dentro de sus claims.

El sistema debe utilizar el rol persistido del usuario como fuente de información para determinar el valor del claim:

```text
role
```

Para esta User Story debe existir al menos el rol:

```text
Administrator
```

La incorporación del rol debe realizarse sobre el mecanismo de JWT existente.

No debe crearse un mecanismo de autenticación independiente para el Dashboard.

---

## Alcance

Implementar:

- Incorporación del rol del usuario al JWT.
- Uso del claim estándar `role`.
- Obtención del rol desde la identidad persistida.
- Inclusión del rol en los JWT generados por el sistema.
- Compatibilidad con el login mediante email y contraseña.
- Compatibilidad con login mediante Google.
- Compatibilidad con renovación mediante Refresh Token.
- Preservación de los claims existentes.
- Compatibilidad con la configuración JWT actual.
- Compatibilidad con `MapInboundClaims = false`, si ya forma parte de la configuración existente.

No implementar en esta task:

- Autorización de endpoints administrativos.
- Policies administrativas.
- `[Authorize(Roles = "Administrator")]`.
- Login específico para administradores.
- Gestión de roles.
- Gestión de usuarios.
- Seed del administrador.
- RBAC avanzado.
- Permisos granulares.

Estas responsabilidades corresponden a otras tasks de la User Story.

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

También revisar la implementación existente de:

- `AuthService`.
- `JwtTokenGenerator`.
- `AuthResponse`.
- `AuthResult`.
- Login.
- Login mediante Google.
- Refresh Token.
- Refresh Token Rotation.
- Configuración de JWT.
- `AddAuthentication`.
- `AddJwtBearer`.
- `MapInboundClaims`.
- Claims actualmente utilizados.

La implementación debe adaptarse al código existente y no asumir una estructura diferente.

---

## Claims del JWT

El JWT debe continuar incluyendo los claims que actualmente utiliza la aplicación.

Como mínimo, la identidad debe poder representarse mediante:

```text
sub
email
name
role
```

El nuevo claim será:

```text
role
```

Ejemplo conceptual:

```json
{
  "sub": "123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "Administrator"
}
```

No es necesario agregar otros claims que no sean requeridos por la arquitectura existente.

---

## Fuente del rol

El rol debe provenir del usuario autenticado.

La implementación no debe determinar el rol mediante:

- Email.
- Lista de emails.
- Request.
- Query string.
- Header enviado por el cliente.
- Body.
- Configuración del frontend.
- URL.
- Una condición hardcodeada dentro de un Controller.

Incorrecto:

```text
if (user.Email == "...")
{
    role = "Administrator";
}
```

Correcto conceptualmente:

```text
User
 ↓
Role
 ↓
JwtTokenGenerator
 ↓
JWT
```

El rol debe formar parte del modelo de identidad del usuario.

---

## JwtTokenGenerator

Modificar `JwtTokenGenerator` para incluir el rol dentro de los claims generados.

El generador debe continuar siendo responsable exclusivamente de la generación del JWT.

No debe:

- Consultar directamente `DbContext`.
- Acceder a repositorios.
- Resolver usuarios.
- Determinar permisos.
- Consultar la base de datos para obtener el rol.

La información necesaria debe ser proporcionada por la capa que orquesta la autenticación.

Conceptualmente:

```text
Application
    │
    │ User identity + role
    ▼
JwtTokenGenerator
    │
    ▼
JWT
```

La implementación concreta debe respetar la arquitectura existente.

---

## AuthService

Revisar `AuthService` para garantizar que el rol del usuario llegue correctamente al generador del JWT.

El login tradicional debe seguir el flujo:

```text
Email + Password
       ↓
User
       ↓
Role
       ↓
JWT
```

No debe duplicarse la lógica de generación de JWT.

El `AuthService` debe continuar orquestando el caso de uso y `JwtTokenGenerator` debe continuar encapsulando la creación técnica del token.

---

## Login mediante Google

El login mediante Google también debe generar un JWT que contenga el rol persistido del usuario.

El flujo conceptual es:

```text
Google ID Token
       ↓
GoogleUserInfo
       ↓
User
       ↓
Role
       ↓
JWT
```

No debe asignarse:

```text
Administrator
```

simplemente porque el usuario se autenticó mediante Google.

El rol debe depender de la identidad persistida.

No modificar en esta task las reglas generales de Google Authentication salvo lo estrictamente necesario para incorporar el rol al JWT.

---

## Refresh Token

El Access Token generado durante una renovación de sesión también debe contener el rol.

El flujo debe continuar utilizando el mecanismo existente:

```text
Refresh Token
       ↓
User
       ↓
Role
       ↓
New Access Token
```

No debe almacenarse el rol dentro del Refresh Token.

No debe convertirse el Refresh Token en un JWT.

La implementación de Refresh Token Rotation debe mantenerse.

---

## Rol actual del usuario

Cuando se genere un nuevo Access Token, el rol debe representar el estado actual del usuario.

Por ejemplo:

```text
Usuario
Role = Administrator

        ↓

Login

        ↓

JWT
role = Administrator
```

Si posteriormente el rol cambia:

```text
Usuario
Role = User

        ↓

Nuevo Access Token

        ↓

JWT
role = User
```

La implementación no debe conservar indefinidamente un rol antiguo únicamente porque un token anterior lo contenía.

---

## Configuración de JWT

Revisar la configuración actual de:

```csharp
AddJwtBearer(...)
```

y verificar que el claim:

```text
role
```

pueda ser utilizado posteriormente por ASP.NET Core como claim de rol.

Si resulta necesario configurar explícitamente el tipo de claim, utilizar:

```text
role
```

como `RoleClaimType`.

No cambiar innecesariamente la configuración actual.

Si existe:

```text
MapInboundClaims = false
```

debe preservarse salvo que exista una razón técnica documentada para modificarlo.

---

## No implementar autorización

Esta task solamente incorpora el rol al JWT.

No debe agregarse todavía:

```csharp
[Authorize(Roles = "Administrator")]
```

ni:

```csharp
RequireRole("Administrator")
```

ni policies administrativas.

La autorización efectiva será implementada posteriormente en:

```text
TASK-API-0068
```

El objetivo de esta task es dejar disponible la información de rol dentro de la identidad autenticada.

---

## AuthResponse

Revisar `AuthResponse`.

Si el DTO ya contiene:

```text
Role
```

debe mantenerse.

El valor de:

```text
AuthResponse.Role
```

debe corresponder al rol utilizado para generar el JWT.

No agregar campos adicionales si no son necesarios.

No modificar el contrato público de autenticación salvo que la implementación actual lo requiera.

---

## Seguridad

La implementación debe respetar las siguientes reglas:

- El rol no puede ser enviado por el cliente para determinar privilegios.
- El rol no puede determinarse mediante el email.
- El JWT debe continuar siendo firmado.
- El secreto JWT debe continuar protegido mediante configuración segura.
- No registrar JWT completos en logs.
- No registrar Refresh Tokens.
- No registrar credenciales.
- No registrar códigos de recuperación.
- No registrar códigos de validación de email.
- Mantener la generación de JWT centralizada.
- Mantener el mecanismo actual de Refresh Token.
- No exponer Refresh Tokens en JSON.

---

## Compatibilidad

Verificar que la modificación no rompa:

- Login tradicional.
- Login mediante Google.
- Refresh Token.
- Refresh Token Rotation.
- Logout.
- Recuperación de contraseña.
- Validación JWT existente.

Esta task no debe modificar innecesariamente otros mecanismos de autenticación.

---

## Criterios de aceptación

### CA-01 — Claim role

Un JWT generado para un usuario debe contener:

```text
role
```

### CA-02 — Administrator

Un usuario cuyo rol sea:

```text
Administrator
```

debe recibir un JWT con:

```text
role = Administrator
```

### CA-03 — Usuario común

Un usuario que no sea administrador no debe recibir:

```text
role = Administrator
```

salvo que su rol persistido sea efectivamente `Administrator`.

### CA-04 — Fuente del rol

El rol debe obtenerse de la identidad persistida del usuario.

### CA-05 — No utilizar email

El sistema no debe determinar el rol utilizando el email.

### CA-06 — Login tradicional

El JWT generado mediante login con email y contraseña debe contener el rol.

### CA-07 — Google Login

El JWT generado mediante Google Authentication debe contener el rol correspondiente al usuario.

### CA-08 — Refresh Token

Un nuevo Access Token generado mediante Refresh Token debe contener el rol actual del usuario.

### CA-09 — Claims existentes

Los claims existentes necesarios para autenticación deben continuar funcionando:

```text
sub
email
name
```

### CA-10 — RoleClaimType

ASP.NET Core debe reconocer `role` como claim de rol cuando corresponda.

### CA-11 — AuthResponse

`AuthResponse.Role` debe ser consistente con el rol incluido en el JWT.

### CA-12 — Sin autenticación paralela

No deben crearse endpoints específicos de autenticación para administradores.

### CA-13 — Sin autorización todavía

Esta task no debe agregar restricciones de acceso a endpoints administrativos.

### CA-14 — Compilación

La solución debe compilar correctamente.

---

## Pruebas manuales

No es necesario crear una suite de tests automatizados exclusivamente para esta task.

Realizar las verificaciones manuales necesarias para confirmar:

### Administrador

Login con un usuario cuyo rol sea:

```text
Administrator
```

Verificar que el JWT contenga:

```text
role = Administrator
```

### Usuario común

Login con un usuario cuyo rol no sea administrativo.

Verificar que el JWT no contenga:

```text
role = Administrator
```

### Refresh

Renovar la sesión de un administrador mediante Refresh Token.

Verificar que el nuevo Access Token conserve:

```text
role = Administrator
```

### Google

Si existe un usuario Google disponible para realizar la prueba, verificar que el JWT generado contenga el rol persistido del usuario.

### Claims

Verificar que continúen disponibles:

```text
sub
email
name
role
```

No incluir JWT reales ni Refresh Tokens en el reporte.

---

## Archivos potencialmente afectados

El agente debe determinar los archivos concretos después de revisar la implementación existente.

Potencialmente:

```text
Application/Services/AuthService.cs

Infrastructure/Services/JwtTokenGenerator.cs

Api/Program.cs

Api/Extensions/*
```

Los nombres concretos pueden variar según la estructura real del proyecto.

No crear archivos innecesarios.

---

## Reglas de implementación

Respetar:

- `backend-coding-rules.md`
- `backend-architecture.md`
- Clean Architecture.
- Dependency Injection.
- Separación Application / Infrastructure / Presentation.
- Código en inglés.
- Funciones pequeñas.
- Una responsabilidad por función.
- No Generic Repository.
- No acceso a DbContext desde `JwtTokenGenerator`.
- No duplicar la generación de JWT.
- No crear autenticación específica para administradores.
- No implementar autorización administrativa en esta task.

---

## Documentación a actualizar

Si el comportamiento de JWT está documentado en:

```text
project/services.md
```

actualizarlo para reflejar la inclusión del claim `role`.

Si el comportamiento forma parte de la arquitectura:

```text
project/backend-architecture.md
```

actualizarlo cuando corresponda.

Si cambia el contrato de autenticación:

```text
project/endpoints.md
```

actualizarlo.

Actualizar únicamente documentación realmente afectada por la implementación.

---

## Resultado esperado

Al finalizar esta task:

1. El JWT contiene el claim `role`.
2. El valor del claim corresponde al rol persistido del usuario.
3. `Administrator` puede ser representado correctamente.
4. El login tradicional genera correctamente el rol.
5. Google Login continúa funcionando.
6. Refresh Token genera un Access Token con el rol actual.
7. ASP.NET Core puede reconocer `role` como claim de rol.
8. Los claims existentes continúan funcionando.
9. `AuthResponse.Role` es consistente con el JWT.
10. No existe autenticación paralela para administradores.
11. No se implementó todavía autorización de endpoints administrativos.
12. La solución compila correctamente.

---

## Reporte obligatorio de implementación

Al finalizar, reportar:

### 1. Archivos modificados

Indicar todos los archivos creados, modificados o eliminados.

### 2. JWT

Indicar:

- Claims incluidos.
- Cómo se obtiene el rol.
- Cómo se incorpora al JWT.
- Si fue necesario modificar `JwtTokenGenerator`.

No reportar tokens reales.

### 3. Configuración JWT

Indicar:

- Si se modificó `AddJwtBearer`.
- Si se configuró `RoleClaimType`.
- Estado de `MapInboundClaims`.

### 4. Flujos verificados

Indicar si se verificaron:

- Login tradicional.
- Google Login.
- Refresh Token.
- Refresh Token Rotation.

### 5. Pruebas manuales

Reportar el resultado de las verificaciones realizadas.

### 6. Compilación

Reportar el resultado de:

```bash
dotnet build
```

Indicar:

```text
Application
Infrastructure
Api
```

cuando corresponda.

### 7. Documentación

Indicar qué documentos fueron actualizados y cuáles fueron revisados sin necesidad de cambios.

### 8. Problemas encontrados

Si aparece algún problema relacionado con JWT, claims, roles o autenticación, reportar:

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

No realizar cambios arquitectónicos importantes sin reportarlos.

---

## Reporte de implementación (Backend Agent)

### 1. Archivos modificados
- `Application/Interfaces/IJwtTokenGenerator.cs`: `GenerateToken(long, string, string, UserRole)`.
- `Infrastructure/Services/JwtTokenGenerator.cs`: claim `role` con `role.ToString()` (`PublicUser`/`Administrator`).
- `Application/Services/AuthService.cs`: pasa `user.Role`; `AuthResponse.Role = user.Role.ToString()`.
- `Application/Services/UserService.cs`: `ValidateEmailAsync` pasa `user.Role`.
- `Api/Program.cs`: `RoleClaimType = "role"`.
- `project/services.md`: notas actualizadas.

### 2. JWT
- Claims: `sub`, `email`, `name`, `role`. El rol es el persistido; el generador no accede a DbContext/repos.

### 3. Configuración JWT
- `AddJwtBearer`: `RoleClaimType = "role"`; `MapInboundClaims = false` mantenido.

### 4. Flujos verificados (por revisión)
- Login tradicional, Google login y Refresh Token generan JWT con el rol actual del usuario.

### 5. Pruebas manuales
- Sin proyecto de tests; verificado por compilación.

### 6. Compilación
- `dotnet build ComicLibrary.sln`: 0 warnings, 0 errores.

### 7. Documentación
- `services.md` actualizado; el resto revisado sin cambios.

### 8. Problemas encontrados
- Ninguno.