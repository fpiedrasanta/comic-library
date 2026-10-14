# TASK-API-0046 — Crear servicio técnico para validar identidad de Google

## Objetivo

Crear la capacidad técnica necesaria para validar una identidad autenticada mediante Google.

La implementación debe quedar aislada detrás de una abstracción para que Application no dependa directamente de la librería utilizada para Google.

---

## Contexto

La User Story correspondiente es:

```text
US-0004 — Autenticación mediante Google: /partirtura read comics/backlog/epic-01/us-0004/us-0004.md
```

Application debe orquestar el caso de uso.

La validación técnica de Google pertenece a Infrastructure.

La implementación no debe contener lógica de negocio relacionada con usuarios.

---

## Requerimientos

### 1. Interfaz en Application

Crear una interfaz en Application para representar la capacidad de validar una identidad de Google.

La interfaz debe devolver únicamente la información que Application necesita para resolver el caso de uso.

Como mínimo:

```text
Email
FirstName
LastName
Avatar
```

La estructura concreta del resultado queda a criterio del agente siempre que no exponga detalles de la librería utilizada.

---

### 2. Implementación en Infrastructure

Crear la implementación concreta en Infrastructure.

Debe utilizar la dependencia incorporada en:

```text
TASK-API-0045
```

La implementación debe validar correctamente la identidad proporcionada por Google.

No aceptar un email o identidad proporcionada directamente por el cliente sin validación.

---

### 3. Seguridad

La implementación debe:

- Validar la autenticidad del token/credential proporcionado por Google.
- Validar issuer cuando corresponda.
- Validar audience/client id cuando corresponda.
- Validar expiración.
- No confiar únicamente en claims enviados sin validar.
- No almacenar el token de Google.
- No registrar tokens de Google en logs.
- No devolver tokens de Google al frontend.

---

### 4. Resultado

El servicio debe entregar a Application únicamente los datos necesarios para continuar el flujo.

Por ejemplo:

```text
GoogleUserInfo
    Email
    FirstName
    LastName
    Avatar
```

No transportar innecesariamente el objeto completo de la librería de Google hacia Application.

---

## Arquitectura

Debe respetarse:

```text
Application
    ↓
IGoogleAuthenticationService
    ↓
Infrastructure
    ↓
Google SDK / Library
```

Application no debe conocer:

- nombres de clases de la librería de Google;
- tipos específicos del SDK;
- detalles HTTP de Google;
- mecanismos internos de validación.

---

## Restricciones

No debe:

- Buscar usuarios en Repository.
- Crear usuarios.
- Generar JWT.
- Generar Refresh Token.
- Establecer cookies.
- Implementar el caso de uso completo de Login.
- Contener reglas de negocio.

El servicio debe ser una **capacidad técnica**, no un servicio que oculte comportamiento de Application.

---

## Documentación

Actualizar:

```text
project/services.md
```

Documentar:

- Interfaz.
- Implementación.
- Responsabilidad.
- Dependencias.
- Qué información retorna.

Actualizar:

```text
project/backend-coding-rules.md
```

solamente si durante la implementación se establece una regla general reutilizable.

---

## Criterios de finalización

1. Existe una interfaz en Application para validar identidad Google.
2. Existe una implementación concreta en Infrastructure.
3. Infrastructure utiliza la librería Google incorporada.
4. Application no depende de tipos específicos de Google.
5. La identidad de Google se valida antes de confiar en sus datos.
6. El servicio no accede a repositorios.
7. El servicio no contiene lógica de negocio.
8. No genera JWT.
9. No genera Refresh Token.
10. No establece cookies.
11. No almacena tokens Google.
12. No registra tokens Google.
13. Devuelve únicamente la información necesaria para Application.
14. `services.md` refleja la implementación.
15. `Application`, `Infrastructure` y `Api` compilan correctamente.

--

## BLOQUEOS

Por cualquier bloqueo o necesidad de información, generar una TASK en /planned para que sea revisada y evaluada por el humano, quién luego la moverá a /pending con el resultado de la definición.

## Execution Result

Completed successfully.

### Changes Made

- Created `Application/DTOs/GoogleUserInfo.cs` record with Email, FirstName, LastName, and AvatarUrl.
- Created `Application/Interfaces/IGoogleAuthenticationService.cs` interface with `ValidateAsync` method.
- Created `Infrastructure/Services/GoogleAuthenticationService.cs` implementation using `Google.Apis.Auth.GoogleJsonWebSignature` to validate Google ID tokens.
- Added `Google.Apis.Auth` package version 1.64.0 to Infrastructure project.
- Registered `IGoogleAuthenticationService` in DI container in `Program.cs`.
- Updated `services.md` with GoogleAuthenticationService and GoogleUserInfo documentation.

### Verification

- Solution builds successfully with no errors.
- Application layer does not reference any Google-specific types.
- Infrastructure validates tokens using Google's public keys and ClientId configuration.
- No business logic, repository access, JWT generation, or cookie handling in the service.
- No Google tokens are stored or logged.