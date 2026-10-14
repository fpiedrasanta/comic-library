# TASK-API-0035 — Revisar y cerrar el transporte de Refresh Token mediante cookie HttpOnly

## Objetivo

Revisar la implementación actual del flujo de autenticación para confirmar que el Refresh Token:

- No sea expuesto al frontend mediante el JSON de respuesta de la API.
- No sea recibido desde el frontend mediante el body de los endpoints.
- Sea transportado exclusivamente mediante una cookie `HttpOnly`.
- Mantenga el comportamiento existente de expiración, revocación y Refresh Token Rotation.
- Respete la configuración definida por ambiente.
- No introduzca violaciones de la arquitectura definida para el proyecto.

Esta Task es principalmente de revisión y corrección. No debe modificar el comportamiento funcional del Login ni del Refresh Token más allá de corregir los puntos indicados.

---

## 1. Contrato público de autenticación

Verificar que `AuthResponse` sea el contrato público que retorna la API.

Debe contener únicamente la información que el frontend necesita:

- `AccessToken`
- `UserId`
- `Email`
- `FullName`
- `Role`

El `RefreshToken` **NO debe formar parte de `AuthResponse`**.

Por lo tanto, las respuestas de:

```text
POST /api/users/login
POST /api/users/refresh-token
```

no deben contener el Refresh Token en el JSON.

---

## 2. Transporte interno del Refresh Token

El Refresh Token generado por `AuthService` debe poder llegar a Presentation para ser almacenado en una cookie.

Para esto puede utilizarse un resultado interno de aplicación, actualmente:

```text
AuthResult
```

que contiene:

```text
AuthResponse
RefreshTokenRaw
```

`AuthResult`:

- No es un contrato HTTP.
- No debe exponerse directamente al frontend.
- No debe documentarse como response público de un endpoint.
- Solamente debe permitir transportar internamente el Refresh Token raw desde Application hasta Presentation.

Presentation es responsable de convertir ese valor en una cookie HTTP.

---

## 3. Cookie del Refresh Token

El Controller debe establecer el Refresh Token mediante una cookie.

La cookie debe:

- Ser `HttpOnly`.
- Tener nombre configurable.
- Tener expiración configurable.
- Tener `Secure` configurable.
- Tener `SameSite` configurable.
- Utilizar el mismo período de expiración definido para Refresh Tokens.

No debe existir un nombre de cookie hardcodeado en el Controller si ya existe una configuración para ello.

---

## 4. Configuración

La configuración debe provenir de `appsettings.json` y poder ser sobrescrita por ambiente.

La configuración relacionada con Refresh Token debe incluir:

```text
RefreshToken:ExpirationDays
```

La configuración de la cookie debe incluir:

```text
Cookies:RefreshToken:Name
Cookies:RefreshToken:HttpOnly
Cookies:RefreshToken:Secure
Cookies:RefreshToken:SameSite
```

### Reglas

No debe existir ningún valor hardcodeado en código para:

- nombre de cookie;
- expiración;
- `HttpOnly`;
- `Secure`;
- `SameSite`.

`RefreshToken:ExpirationDays` debe ser la única fuente de verdad para la expiración del Refresh Token.

El `CookieOptions.Expires` debe derivarse de esa misma configuración.

---

## 5. Configuración por ambiente

Verificar que la configuración permita diferencias entre desarrollo y producción.

Para desarrollo local puede utilizarse una configuración compatible con HTTP local, por ejemplo:

```text
Secure = false
SameSite = Lax
```

Para producción, cuando la API se encuentre bajo HTTPS, la cookie debe utilizar:

```text
Secure = true
```

La configuración exacta de `SameSite` debe mantenerse configurable y no quedar fijada mediante código.

No asumir que los valores de desarrollo son adecuados para producción.

---

## 6. CORS

Verificar que la configuración CORS sea compatible con el uso de cookies.

Cuando se utilizan cookies cross-origin, la política correspondiente debe permitir credentials.

Debe mantenerse una lista explícita de orígenes autorizados.

No utilizar:

```text
AllowAnyOrigin()
```

junto con:

```text
AllowCredentials()
```

Los orígenes permitidos deben continuar siendo configurables o estar definidos explícitamente según las reglas actuales del proyecto.

---

## 7. Endpoint Login

Verificar:

```text
POST /api/users/login
```

El flujo debe ser:

```text
Frontend
    ↓
email + password
    ↓
API
    ↓
AuthService
    ↓
AccessToken + RefreshTokenRaw
    ↓
Controller
    ├── establece cookie HttpOnly con RefreshTokenRaw
    └── retorna AuthResponse
```

La respuesta HTTP debe contener:

```text
AccessToken
UserId
Email
FullName
Role
```

El Refresh Token debe aparecer únicamente en:

```text
Set-Cookie
```

y nunca en el JSON.

---

## 8. Endpoint Refresh Token

Verificar:

```text
POST /api/users/refresh-token
```

El endpoint no debe recibir:

```json
{
  "refreshToken": "..."
}
```

El Refresh Token debe obtenerse exclusivamente desde la cookie configurada.

El flujo debe ser:

```text
Browser
    │
    │ Cookie: RefreshToken
    ▼
API
    ↓
Controller
    ↓
AuthService
    ↓
validación + rotation
    ↓
nuevo AccessToken + nuevo RefreshToken
    ↓
Controller
    ├── reemplaza cookie anterior
    └── retorna AuthResponse
```

El nuevo Refresh Token debe establecerse nuevamente mediante cookie.

---

## 9. Refresh Token Rotation

Verificar que este cambio de transporte no haya alterado el comportamiento de Refresh Token Rotation.

Debe mantenerse:

```text
Refresh Token A
      ↓
      usado
      ↓
      revocado
      ↓
Refresh Token B
```

El Refresh Token anterior no debe continuar siendo válido después de una rotación exitosa.

No debe almacenarse ningún Refresh Token raw en base de datos.

---

## 10. Seguridad

Verificar que:

- El Refresh Token no aparezca en logs.
- El Refresh Token no aparezca en excepciones.
- El Refresh Token no aparezca en `ApiResponse`.
- El Refresh Token no aparezca en `AuthResponse`.
- El Refresh Token no aparezca en documentación pública del endpoint.
- El Refresh Token no sea almacenado en `localStorage`.
- El Refresh Token no sea almacenado en `sessionStorage`.
- El frontend no necesite conocer el valor del Refresh Token.

El frontend solamente debe manejar el Access Token.

---

## 11. Arquitectura

La implementación debe respetar:

```text
Presentation
    ↓
Application
    ↓
Infrastructure
```

### Application

Debe:

- orquestar el caso de uso;
- generar/obtener los tokens mediante las abstracciones correspondientes;
- controlar la unidad de trabajo;
- retornar `AuthResult`.

### Presentation

Debe:

- recibir `AuthResult`;
- establecer la cookie HTTP;
- retornar `AuthResponse`.

### Infrastructure

Debe implementar las capacidades técnicas correspondientes.

No crear servicios de Infrastructure que llamen a repositories para ocultar comportamiento de negocio.

No mover lógica de negocio al Controller para resolver este flujo.

---

## 12. Documentación obligatoria

Revisar y actualizar, si corresponde:

```text
project/services.md
project/endpoints.md
project/backend-coding-rules.md
```

### `services.md`

Debe reflejar:

- `AuthService`;
- `AuthResult`;
- configuración de Refresh Token;
- configuración de la cookie;
- responsabilidades de cada componente.

### `endpoints.md`

Debe documentar:

```text
POST /api/users/login
POST /api/users/refresh-token
```

El contrato público debe mostrar `AuthResponse`.

No debe documentarse `RefreshTokenRaw` como parte de la respuesta JSON.

Debe quedar indicado que el Refresh Token se transporta mediante cookie HttpOnly.

### `backend-coding-rules.md`

Debe incorporarse una regla general indicando que:

- los Refresh Tokens no se exponen mediante DTOs públicos;
- deben transportarse mediante cookies HttpOnly;
- los valores sensibles/configurables no deben hardcodearse;
- Presentation es responsable de decidir el mecanismo HTTP de transporte;
- Application no debe conocer detalles de cookies HTTP.

---

## 13. Documentación tecnológica

No agregar la configuración de Refresh Token o cookies a:

```text
backend-stack-technology.md
```

Estas configuraciones no constituyen tecnologías ni dependencias.

Solamente actualizar ese documento si realmente se incorpora una nueva dependencia tecnológica.

---

## 14. Contexto obligatorio

Antes de ejecutar esta Task, leer:

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
- `TASK-API-0031`
- `TASK-API-0032`

---

## Criterios de finalización

La Task se considera finalizada cuando:

1. `AuthResponse` no contiene `RefreshToken`.
2. `AuthResult` se utiliza únicamente como resultado interno entre Application y Presentation.
3. El Login retorna el Refresh Token exclusivamente mediante cookie HttpOnly.
4. El endpoint `refresh-token` obtiene el Refresh Token exclusivamente desde cookie.
5. El endpoint `refresh-token` no recibe el token mediante body.
6. La cookie tiene nombre configurable.
7. La cookie tiene expiración configurable.
8. `HttpOnly` es configurable.
9. `Secure` es configurable.
10. `SameSite` es configurable.
11. `RefreshToken:ExpirationDays` es la única fuente de verdad para la expiración.
12. No existen valores hardcodeados de configuración de la cookie.
13. CORS permite credentials únicamente para orígenes autorizados.
14. Refresh Token Rotation continúa funcionando correctamente.
15. Los Refresh Tokens no se almacenan en texto plano.
16. Los Refresh Tokens no aparecen en logs ni respuestas JSON.
17. Application no contiene dependencias de HTTP o cookies.
18. Presentation es responsable de establecer la cookie.
19. No existen servicios de Infrastructure que oculten comportamiento de negocio mediante repositories.
20. `endpoints.md` refleja correctamente el contrato HTTP real.
21. `services.md` refleja la implementación real.
22. `backend-coding-rules.md` contiene las reglas generales correspondientes.
23. No se agregaron configuraciones de aplicación a `backend-stack-technology.md`.
24. `Application`, `Infrastructure` y `Api` compilan correctamente.

---

## Resultado esperado

El flujo final debe quedar conceptualmente así:

```text
                         LOGIN
                           │
Frontend ────────────────► API
  email/password           │
                            ▼
                      AuthService
                            │
                     ┌──────┴──────┐
                     │             │
                AccessToken   RefreshTokenRaw
                     │             │
                     ▼             ▼
                  JSON          HttpOnly Cookie
                     │             │
                     └──────┬──────┘
                            ▼
                         Browser


                      REFRESH TOKEN
                            │
Browser ───── Cookie ────► API
                            │
                            ▼
                      AuthService
                            │
                     Rotation Token
                            │
                     ┌──────┴──────┐
                     │             │
                AccessToken   New RefreshToken
                     │             │
                     ▼             ▼
                  JSON          HttpOnly Cookie
```

El frontend **nunca debe conocer ni almacenar el Refresh Token**.

---

## Resultado de la verificación

### Verificación de criterios

1. `AuthResponse` no contiene `RefreshToken`: **OK**.
2. `AuthResult` se utiliza únicamente como resultado interno: **OK**.
3. El Login retorna el Refresh Token exclusivamente mediante cookie HttpOnly: **OK**.
4. El endpoint `refresh-token` obtiene el Refresh Token exclusivamente desde cookie: **OK**.
5. El endpoint `refresh-token` no recibe el token mediante body: **OK**.
6. La cookie tiene nombre configurable: **OK** (`Cookies:RefreshToken:Name`).
7. La cookie tiene expiración configurable: **OK** (`RefreshToken:ExpirationDays`).
8. `HttpOnly` es configurable: **OK** (`Cookies:RefreshToken:HttpOnly`).
9. `Secure` es configurable: **OK** (`Cookies:RefreshToken:Secure`).
10. `SameSite` es configurable: **OK** (`Cookies:RefreshToken:SameSite`).
11. `RefreshToken:ExpirationDays` es la única fuente de verdad: **OK**.
12. No existen valores hardcodeados de configuración de la cookie: **OK**.
13. CORS permite credentials únicamente para orígenes autorizados: **OK** (`AllowCredentials()` con orígenes explícitos).
14. Refresh Token Rotation continúa funcionando: **OK**.
15. Los Refresh Tokens no se almacenan en texto plano: **OK**.
16. Los Refresh Tokens no aparecen en logs ni respuestas JSON: **OK**.
17. Application no contiene dependencias de HTTP o cookies: **OK**.
18. Presentation es responsable de establecer la cookie: **OK**.
19. No existen servicios de Infrastructure que oculten comportamiento: **OK**.
20. `endpoints.md` refleja correctamente el contrato: **OK**.
21. `services.md` refleja la implementación real: **OK**.
22. `backend-coding-rules.md` contiene las reglas generales: **OK** (sección 53).
23. No se agregaron configuraciones a `backend-stack-technology.md`: **OK**.
24. `Application`, `Infrastructure` y `Api` compilan correctamente: **OK**.

### Correcciones realizadas

Ninguna. La implementación existente desde TASK-API-0034 cumple con todos los criterios de esta Task. No se detectaron desviaciones ni violaciones.

### Observaciones

- El flujo de autenticación respeta la arquitectura: Application orquesta, Presentation maneja HTTP/cookies, Infrastructure proporciona capacidades técnicas.
- No se requiere modificar código ni documentación adicional.
- La configuración permite diferencias por ambiente sin valores hardcodeados.
