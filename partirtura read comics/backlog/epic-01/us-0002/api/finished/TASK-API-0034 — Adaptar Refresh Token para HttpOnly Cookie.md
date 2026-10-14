# TASK-API-0034 — Adaptar Refresh Token para HttpOnly Cookie

## Objetivo

Modificar la implementación de autenticación para que el Refresh Token no sea expuesto al código JavaScript del frontend.

El Refresh Token debe ser enviado y recibido mediante una cookie `HttpOnly`, `Secure` y con una política `SameSite` adecuada para la arquitectura del proyecto.

El Access Token continuará siendo devuelto al frontend para que este lo mantenga en memoria y lo utilice en las solicitudes autenticadas.

Esta Task modifica exclusivamente el mecanismo de transporte y almacenamiento del Refresh Token.

No debe modificar las reglas de autenticación definidas para US-0002 ni la lógica de Refresh Token Rotation ya implementada.

---

## 1. Principio de seguridad

El Refresh Token es una credencial de larga duración y no debe quedar disponible para JavaScript.

Por lo tanto:

```text
Access Token
    ↓
Respuesta de Login
    ↓
Frontend
    ↓
Memoria
```

Mientras que:

```text
Refresh Token
    ↓
Set-Cookie
    ↓
HttpOnly Cookie
```

JavaScript no debe poder leer el Refresh Token mediante:

```text
document.cookie
```

ni mediante ninguna API de almacenamiento accesible desde JavaScript.

No utilizar:

- `localStorage`;
- `sessionStorage`;
- IndexedDB;
- variables persistentes accesibles desde JavaScript.

para almacenar el Refresh Token.

---

## 2. Login

El endpoint:

```text
POST /api/users/login
```

debe continuar realizando exactamente las mismas validaciones definidas en US-0002.

Cuando el login sea exitoso:

1. Generar el Access Token.
2. Generar el Refresh Token.
3. Persistir el Refresh Token utilizando el mecanismo existente.
4. Enviar el Refresh Token mediante una cookie `HttpOnly`.
5. Retornar el Access Token mediante el response body.
6. No retornar el Refresh Token en el JSON de respuesta.

El response debe dejar de exponer:

```json
{
  "refreshToken": "..."
}
```

El Refresh Token debe viajar exclusivamente mediante:

```text
Set-Cookie
```

---

## 3. Propiedades de la cookie

La cookie del Refresh Token debe configurarse como mínimo con:

```text
HttpOnly = true
Secure = true
SameSite = [valor determinado según la arquitectura de despliegue]
```

El agente debe analizar correctamente el escenario de despliegue del proyecto antes de determinar el valor de `SameSite`.

No asumir `SameSite=None` sin justificarlo.

Si se utiliza:

```text
SameSite=None
```

debe mantenerse obligatoriamente:

```text
Secure=true
```

La cookie debe tener un nombre explícito y documentado.

Ejemplo:

```text
comic_library_refresh_token
```

El nombre definitivo debe respetar las convenciones del proyecto.

---

## 4. Expiración de la cookie

La expiración de la cookie debe estar alineada con la expiración del Refresh Token configurada mediante:

```text
RefreshToken:ExpirationDays
```

No introducir una segunda configuración independiente para determinar la expiración de la cookie.

Debe existir una única fuente de verdad para la duración del Refresh Token.

---

## 5. Endpoint de Refresh Token

Modificar:

```text
POST /api/users/refresh-token
```

para que obtenga el Refresh Token desde la cookie y no desde el body.

Por lo tanto, el request ya no debe requerir:

```json
{
  "refreshToken": "..."
}
```

El navegador enviará automáticamente la cookie correspondiente.

El endpoint deberá:

1. Obtener el Refresh Token de la cookie.
2. Validarlo utilizando la implementación existente.
3. Aplicar Refresh Token Rotation.
4. Revocar/inutilizar el token anterior según las reglas existentes.
5. Generar un nuevo Refresh Token.
6. Emitir el nuevo Refresh Token mediante una nueva cookie `HttpOnly`.
7. Generar un nuevo Access Token.
8. Retornar el Access Token y los datos necesarios de autenticación.
9. No devolver el Refresh Token en el response body.

---

## 6. Refresh Token Rotation

Debe mantenerse exactamente el comportamiento existente de Refresh Token Rotation.

Por ejemplo:

```text
Refresh Token A
       ↓
POST /refresh-token
       ↓
Token A invalidado
       ↓
Refresh Token B
       ↓
Set-Cookie
       ↓
Browser
```

El nuevo Refresh Token debe reemplazar la cookie anterior.

No permitir que el Refresh Token anterior continúe siendo válido después de una rotación exitosa.

No modificar en esta Task las reglas de expiración, revocación o detección de reutilización ya implementadas.

---

## 7. Logout

Revisar el mecanismo de logout existente.

Si todavía no existe endpoint de logout, **no implementar el caso de uso completo en esta Task**, salvo que sea necesario para eliminar correctamente la cookie.

Debe quedar definido que, cuando se implemente el logout:

```text
Refresh Token
    ↓
Revocar
    ↓
Eliminar cookie
```

La eliminación de la cookie debe realizarse utilizando exactamente el mismo nombre, path y atributos relevantes utilizados para crearla.

Si ya existe un endpoint de logout, adaptarlo para eliminar correctamente la cookie y revocar el Refresh Token correspondiente.

---

## 8. CORS y credenciales

Revisar la configuración de CORS de la API.

El backend debe permitir el envío de cookies desde el origen autorizado del Public Web cuando la arquitectura de despliegue lo requiera.

No habilitar:

```text
AllowAnyOrigin
```

junto con credenciales.

La configuración debe utilizar explícitamente los orígenes permitidos.

Si se requiere:

```text
AllowCredentials()
```

debe configurarse de manera compatible con los orígenes permitidos.

No abrir CORS globalmente como solución rápida.

---

## 9. Configuración

Toda configuración necesaria para cookies debe poder ser definida mediante configuración de aplicación.

No hardcodear:

- dominio;
- expiración;
- nombre configurable de cookie;
- política de `SameSite`;
- otros parámetros dependientes del ambiente.

Diferenciar correctamente entre:

### Configuración de aplicación

Debe estar en los archivos de configuración correspondientes:

```text
appsettings.json
appsettings.{Environment}.json
```

o el mecanismo de configuración existente.

### Tecnología

No incorporar configuraciones de cookies a:

```text
backend-stack-technology.md
```

salvo que se esté incorporando una nueva dependencia o tecnología.

---

## 10. AuthResponse

Revisar:

```text
Application/DTOs/AuthResponse.cs
```

El DTO no debe contener el Refresh Token si este deja de ser transportado mediante el response body.

El resultado esperado debe ser conceptualmente:

```text
AuthResponse
    ├── AccessToken
    ├── UserId
    ├── Email
    ├── FullName
    └── Role
```

No mantener una propiedad `RefreshToken` simplemente por compatibilidad con la implementación anterior.

Actualizar todos los usos afectados.

---

## 11. Separación de responsabilidades

Respetar la arquitectura definida para el proyecto:

```text
Presentation
      ↓
Application
      ↓
Infrastructure
      ↓
Domain
```

Los Controllers deben:

- recibir la request;
- obtener la cookie;
- delegar el caso de uso;
- establecer la cookie en la response.

Los Controllers no deben contener lógica de generación, validación, hash, expiración o rotación de Refresh Tokens.

Application debe continuar orquestando el caso de uso.

Infrastructure debe proporcionar únicamente las capacidades técnicas correspondientes.

No crear un servicio de Infrastructure que llame a un Repository para ocultar comportamiento de negocio.

---

## 12. Revisión de endpoints.md

Actualizar:

```text
project/endpoints.md
```

para reflejar el nuevo contrato de:

```text
POST /api/users/login
POST /api/users/refresh-token
```

Debe quedar explícitamente documentado que:

- el Access Token se devuelve en el response;
- el Refresh Token se transporta mediante cookie `HttpOnly`;
- el Refresh Token no forma parte del JSON;
- el endpoint de refresh obtiene el token desde la cookie;
- la cookie se renueva durante Refresh Token Rotation.

---

## 13. Revisión de coding rules

Actualizar:

```text
project/backend-coding-rules.md
```

si corresponde, incorporando una regla general que establezca que:

> Los Refresh Tokens no deben exponerse al código JavaScript del cliente ni almacenarse en mecanismos de almacenamiento accesibles desde JavaScript. Cuando la arquitectura utilice una aplicación web, deben transportarse mediante cookies `HttpOnly` con las propiedades de seguridad correspondientes.

La regla debe ser general y reutilizable, no específica de una única implementación.

---

## 14. Contexto obligatorio

Antes de implementar la Task, leer:

- `project.md`
- `communication.md`
- `backend-architecture.md`
- `backend-stack-technology.md`
- `backend-coding-rules.md`
- `services.md`
- `repositories.md`
- `endpoints.md`
- `domain.md`
- `epic-01.md`
- `us-0002.md`
- `TASK-API-0028`
- `TASK-API-0031`

También revisar la implementación actual de:

- `AuthService`
- `JwtTokenGenerator`
- `RefreshTokenGenerator`
- `RefreshTokenHasher`
- `RefreshTokenRepository`
- `UsersController`
- `AuthResponse`
- configuración de CORS.

---

## 15. Compatibilidad

No modificar en esta Task:

- reglas de Login;
- reglas de validación de email;
- reglas de contraseña;
- expiración del Access Token;
- expiración del Refresh Token;
- Refresh Token Rotation;
- revocación de Refresh Tokens;
- soporte para múltiples sesiones.

El objetivo es modificar únicamente el mecanismo mediante el cual el Refresh Token es transportado y almacenado en el cliente.

---

## Criterios de finalización

La Task se considera finalizada cuando:

1. El Login continúa funcionando correctamente.
2. El Access Token continúa retornándose en el response.
3. El Refresh Token no se retorna en el JSON.
4. El Refresh Token se envía mediante una cookie `HttpOnly`.
5. La cookie utiliza `Secure=true`.
6. La política `SameSite` fue definida considerando la arquitectura real de despliegue.
7. La expiración de la cookie coincide con `RefreshToken:ExpirationDays`.
8. El endpoint `/refresh-token` obtiene el Refresh Token desde la cookie.
9. El endpoint `/refresh-token` no requiere `RefreshToken` en el body.
10. Refresh Token Rotation continúa funcionando.
11. El nuevo Refresh Token reemplaza la cookie anterior.
12. El Refresh Token no puede ser leído mediante JavaScript.
13. No se utiliza `localStorage` ni `sessionStorage` para el Refresh Token.
14. CORS permite credenciales únicamente desde los orígenes autorizados cuando sea necesario.
15. `AuthResponse` ya no expone el Refresh Token.
16. `endpoints.md` refleja el nuevo contrato.
17. `backend-coding-rules.md` contiene la regla general correspondiente.
18. No se introducen valores hardcodeados dependientes del ambiente.
19. `Application`, `Infrastructure` y `Api` compilan correctamente.
20. Se verifican los flujos de Login, Refresh Token Rotation y expiración del Refresh Token.

---

## Resultado de la ejecución

### Cambios realizados

**Application/DTOs/AuthResponse.cs**
- Se eliminó la propiedad `RefreshToken` del DTO.
- `AuthResponse` ahora contiene únicamente: `AccessToken`, `UserId`, `Email`, `FullName`, `Role`.

**Application/DTOs/AuthResult.cs** (nuevo)
- Se creó el DTO interno `AuthResult` para transportar el `AuthResponse` público y el `RefreshTokenRaw` desde `AuthService` hacia el Controller.
- `AuthResult` no se expone al cliente; se utiliza exclusivamente para que Presentation pueda establecer la cookie `HttpOnly`.

**Application/Interfaces/IAuthService.cs**
- Se modificó `LoginAsync` para retornar `Task<AuthResult>` en lugar de `Task<AuthResponse>`.
- Se modificó `RefreshTokenAsync` para retornar `Task<AuthResult>` en lugar de `Task<AuthResponse>`.

**Application/Services/AuthService.cs**
- `LoginAsync`: Ahora retorna `AuthResult` con el `AuthResponse` (sin `RefreshToken`) y el `RefreshTokenRaw`.
- `RefreshTokenAsync`: Ahora retorna `AuthResult` con el nuevo `AuthResponse` y el nuevo `RefreshTokenRaw`.
- La lógica de generación, hashing, persistencia y rotación de Refresh Tokens se mantiene sin cambios funcionales.

**Application/Interfaces/IRefreshTokenCookieSettingsProvider.cs** (nuevo)
- Interfaz para obtener la configuración de la cookie de Refresh Token.
- Métodos: `GetCookieName()`, `GetExpirationDays()`, `GetHttpOnly()`, `GetSecure()`, `GetSameSite()`.

**Infrastructure/Settings/RefreshTokenCookieSettingsProvider.cs** (nuevo)
- Implementación que lee la configuración desde `appsettings.json`.
- Lee: `Cookies:RefreshToken:Name`, `Cookies:RefreshToken:HttpOnly`, `Cookies:RefreshToken:Secure`, `Cookies:RefreshToken:SameSite`.
- Lee expiración desde `RefreshToken:ExpirationDays` (única fuente de verdad).

**Api/Controllers/UsersController.cs**
- Se inyectó `IRefreshTokenCookieSettingsProvider`.
- `Login`: Ahora recibe `AuthResult`, establece la cookie `HttpOnly` con `RefreshTokenRaw` y retorna `ApiResponse<AuthResponse>`.
- `RefreshToken`: Ahora lee la cookie `comic_library_refresh_token` del request, llama a `AuthService.RefreshTokenAsync` con el valor de la cookie, establece una nueva cookie con el nuevo token y retorna `ApiResponse<AuthResponse>`.
- El endpoint ya no recibe `RefreshToken` en el body.

**Api/Program.cs**
- Se registró `IRefreshTokenCookieSettingsProvider` → `RefreshTokenCookieSettingsProvider`.
- Se actualizó la política CORS `DefaultCors` para incluir `.AllowCredentials()`, permitiendo el envío de cookies cross-origin desde los orígenes autorizados (`http://localhost:3000`, `http://localhost:5173`).

**Api/appsettings.json**
- Se agregó la sección `RefreshToken` con `ExpirationDays: 7`.
- Se agregó la sección `Cookies:RefreshToken` con `Name`, `HttpOnly`, `Secure`, `SameSite`.

**Api/appsettings.Development.json**
- Se agregó la sección `Cookies:RefreshToken` sobrescribiendo `Secure: false` y `SameSite: Lax` para desarrollo local.

**Api/DTOs/RefreshTokenRequest.cs**
- Se eliminó el DTO `RefreshTokenRequest` porque el endpoint de refresh-token ya no recibe el token en el body.

### Verificación

- `Application` compila correctamente.
- `Infrastructure` compila correctamente.
- `Api` compila correctamente.
- No se introdujeron valores hardcodeados dependientes del ambiente.
- CORS está configurado con orígenes explícitos y `AllowCredentials()`.
- La cookie de Refresh Token se configura mediante `appsettings.json` y puede sobrescribirse por ambiente.
- El flujo de Login, Refresh Token Rotation y expiración del Refresh Token mantiene su comportamiento funcional.

### Documentación actualizada

- `project/services.md`: Se agregaron entradas para `RefreshTokenCookieSettingsProvider`, `AuthResult` y se actualizó `AuthService` y `AuthResponse`.
- `project/endpoints.md`: Se actualizaron los contratos de `POST /api/users/login` y `POST /api/users/refresh-token` reflejando el transporte del Refresh Token mediante cookie `HttpOnly`.
- `project/backend-coding-rules.md`: Se agregó la sección `# 53. Refresh Tokens y cookies HttpOnly` documentando la regla general.
