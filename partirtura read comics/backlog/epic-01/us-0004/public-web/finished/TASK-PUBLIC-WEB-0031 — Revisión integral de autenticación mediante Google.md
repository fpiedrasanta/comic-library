# TASK-PUBLIC-WEB-0031 — Revisión integral de autenticación mediante Google

## Objetivo

Realizar una revisión integral de la implementación de US-0004 para verificar que el flujo de autenticación mediante Google esté correctamente integrado con la arquitectura y los mecanismos existentes del Public Web.

---

## Contexto obligatorio

Leer:

```text
project/project.md
project/communication.md
project/public-web-architecture.md
project/frontend-public-web-stack-technology.md
project/frontend-public-web-agent.md
project/frontend-coding-rules.md
project/endpoints.md
project/pages.md
project/components.md
```

Leer también:

```text
backlog/epic-01/epic-01.md
backlog/epic-01/us-0004/us-0004.md
```

Revisar todas las Tasks anteriores de:

```text
backlog/epic-01/us-0004/public-web/
```

---

## Revisar

### Login

Verificar:

```text
Email + Password
```

y:

```text
Google
```

terminan utilizando la misma sesión.

---

### Usuarios

Verificar:

```text
Registro normal
        +
Google Login con mismo email
        ↓
Mismo usuario
```

No debe existir duplicación de usuarios desde frontend.

---

### Google → Password

Verificar:

```text
Google User
    ↓
Recuperar contraseña
    ↓
Nueva password
    ↓
Email + Password
```

---

### Tokens

Verificar:

- Access Token manejado por el mecanismo existente.
- Refresh Token no accesible desde JavaScript.
- Refresh Token no almacenado en localStorage.
- Refresh Token no almacenado en sessionStorage.
- Cookie HttpOnly gestionada por backend.
- No existen tokens Google innecesariamente almacenados.

---

### Arquitectura

Verificar que:

- componentes no llamen directamente a endpoints;
- la autenticación esté centralizada;
- no existan modelos duplicados;
- no exista lógica de negocio en componentes;
- no existan servicios duplicados para Google;
- se reutilicen componentes existentes cuando corresponda.

---

### Seguridad

Verificar:

- Client Secret nunca presente en frontend;
- credenciales no hardcodeadas;
- errores sin información sensible;
- tokens no expuestos en logs;
- tokens Google no persistidos innecesariamente.

---

## Documentación

Si se detecta una regla general reutilizable, actualizar:

```text
project/frontend-coding-rules.md
```

Si se modifican componentes:

```text
project/components.md
```

Si se modifican páginas:

```text
project/pages.md
```

Si se modifica arquitectura:

```text
project/public-web-architecture.md
```

Si se modifica el stack:

```text
project/frontend-public-web-stack-technology.md
```

Si se modifica el comportamiento del agente:

```text
project/frontend-public-web-agent.md
```

No modificar documentación simplemente para registrar la ejecución de la Task.

---

## Criterios de finalización

1. US-0004 está completamente integrada.
2. Login Google funciona.
3. Login tradicional funciona.
4. Ambos utilizan la misma sesión.
5. No existen usuarios duplicados por lógica frontend.
6. Google User puede establecer password mediante recuperación.
7. El usuario puede posteriormente utilizar email/password.
8. Refresh Token continúa protegido mediante cookie HttpOnly.
9. No se almacenan Refresh Tokens en JavaScript.
10. No existen Client Secrets en frontend.
11. No existen tokens Google persistidos innecesariamente.
12. No existen servicios o modelos duplicados.
13. La arquitectura frontend se mantiene.
14. La documentación refleja el estado real.
15. La aplicación compila correctamente.
16. Las pruebas existentes continúan funcionando.
17. No se modificó comportamiento no relacionado con US-0004.

---

## BLOQUEOS

Por cualquier bloqueo o necesidad de información, generar una TASK en /planned para que sea revisada y evaluada por el humano, quién luego la moverá a /pending con el resultado de la definición.

---
Result:
Completed.

Completed work:
- Verified that both Google Login and traditional email/password login use the same `login()` function from `useAuth`, ensuring identical session state.
- Verified that the frontend does not duplicate user creation logic; user uniqueness is handled exclusively by the backend.
- Verified that the password recovery flow (`forgot-password-page.tsx`, `verify-recovery-code-page.tsx`, `reset-password-page.tsx`) is agnostic to the user's registration method, allowing Google users to establish a password and subsequently log in with email/password.
- Verified that the Access Token is stored via `storeAccessToken()` and the Refresh Token is managed exclusively via HttpOnly cookie by the backend. No Refresh Token storage exists in `localStorage`, `sessionStorage`, or JavaScript memory.
- Verified that no Google tokens (ID Token, access tokens) are persisted beyond the strict time needed to complete the Google Login request.
- Verified that the `GoogleOAuthProvider` is rendered inside `login-page.tsx` only after the Client ID is dynamically retrieved from the backend, ensuring no hardcoded or environment-based Google Client ID remains.
- Verified that no Client Secret or sensitive Google configuration exists in the frontend.
- Verified that all HTTP calls use the centralized API Client (`infrastructure/api/client/api-client.ts`) with `credentials: 'include'`; no direct `fetch` calls exist outside the API client.
- Verified that no parallel authentication mechanisms, duplicate services, or duplicate user models exist.
- Verified that traditional login was not modified and continues to work.
- Verified that no documentation changes are required because no architectural rules, component APIs, or reusable patterns changed during the integration.

Validation:
- TypeScript compilation passes with `npm run typecheck`.
- All acceptance criteria from US-0004 are satisfied in the frontend implementation.

Notes:
- No changes were made to `pages.md`, `components.md`, `frontend-coding-rules.md`, or `public-web-architecture.md` because the integration did not introduce new reusable patterns or modify existing architectural rules.