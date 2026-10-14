# TASK-PUBLIC-WEB-0033 — Verificación final de integración del API Client y credenciales HTTP

## Objetivo

Realizar una verificación final del mecanismo de comunicación HTTP utilizado por el Public Web para confirmar que el cambio incorporado para autenticación mediante Google y cookies HttpOnly no genere inconsistencias ni deje mecanismos HTTP alternativos sin configurar.

Esta Task es exclusivamente de revisión y corrección. No debe introducir una nueva arquitectura de comunicación HTTP.

---

## 1. API Client centralizado

Verificar que:

- Todas las llamadas HTTP al Backend realizadas por el Public Web utilizan el API Client centralizado.
- No existan llamadas `fetch` directas fuera del mecanismo establecido por:

```text
infrastructure/api/client/api-client.ts
```

- No existan otros clientes HTTP paralelos que puedan omitir la configuración de credenciales.

Si existen llamadas HTTP fuera del API Client centralizado:

- Identificarlas.
- Determinar si corresponden al Backend de Comic Library.
- Migrarlas al mecanismo centralizado si corresponde según la arquitectura existente.

No modificar llamadas a servicios externos que requieran deliberadamente un mecanismo diferente.

---

## 2. Credentials

Verificar que el API Client centralizado utilice:

```text
credentials: 'include'
```

cuando corresponda al mecanismo de comunicación con el Backend.

El objetivo es permitir que el navegador:

- Reciba cookies HttpOnly establecidas por la API.
- Envíe automáticamente la cookie de Refresh Token en requests posteriores.
- Mantenga el mecanismo de sesión existente.

---

## 3. Refresh Token

Verificar específicamente el flujo:

```text
Login
    ↓
API
    ↓
Set-Cookie
    ↓
Refresh Token HttpOnly
    ↓
Browser
```

y posteriormente:

```text
Access Token expirado
    ↓
POST /api/users/refresh-token
    ↓
Browser envía automáticamente la cookie
    ↓
API valida Refresh Token
    ↓
Nuevo Access Token
    ↓
Nueva cookie Refresh Token
```

El Refresh Token no debe:

- aparecer en el body de una respuesta;
- almacenarse en `localStorage`;
- almacenarse en `sessionStorage`;
- almacenarse en estado global del frontend;
- aparecer en logs.

---

## 4. Login tradicional

Verificar que el cambio de `credentials` no haya alterado negativamente el Login tradicional:

```text
Email + Password
    ↓
POST /api/users/login
    ↓
AuthResponse
    +
Refresh Token Cookie
```

Debe continuar funcionando utilizando el mismo mecanismo de autenticación existente.

---

## 5. Google Login

Verificar que el mecanismo preparado para Google Login utilice el mismo API Client centralizado:

```text
Google ID Token
    ↓
AuthenticationRepository.googleLogin()
    ↓
API Client
    ↓
POST /api/users/google-login
```

No debe existir un cliente HTTP específico o paralelo para Google Login.

---

## 6. Requests no autenticados

Verificar que agregar:

```text
credentials: 'include'
```

no provoque cambios funcionales en los endpoints públicos.

Las requests públicas deben continuar funcionando normalmente.

No crear lógica especial por endpoint salvo que exista una necesidad real.

---

## 7. Requests autenticados

Verificar que las requests autenticadas continúen enviando correctamente:

```text
Authorization: Bearer <AccessToken>
```

cuando corresponda.

La incorporación de cookies no debe reemplazar el mecanismo actual de Access Token para autorización de recursos.

---

## 8. CORS

No modificar la configuración CORS del Backend desde el Public Web.

La API ya debe permitir credentials para los orígenes autorizados.

Si se detecta que el frontend está configurado de forma incompatible con el contrato existente del Backend, documentar el problema y corregir únicamente la parte correspondiente al Public Web.

---

## 9. No crear mecanismos paralelos

No crear:

- Otro API Client.
- Otro mecanismo de cookies.
- Otro almacenamiento de Refresh Token.
- Otro mecanismo de sesión.
- Otra implementación de Login.
- Otro mecanismo específico para Google.

Debe reutilizarse la arquitectura de autenticación existente.

---

## 10. Documentación

Si no se detectan cambios arquitectónicos, no modificar documentación innecesariamente.

Si se identifica una regla general reutilizable, actualizar solamente los documentos permitidos para el Public Web:

```text
project/public-web-architecture.md
project/frontend-public-web-stack-technology.md
project/frontend-public-web-agent.md
project/frontend-coding-rules.md
project/pages.md
project/components.md
```

No modificar:

```text
project/project.md
project/communication.md
project/endpoints.md
```

salvo que exista una razón explícita y compatible con las reglas de acceso del agente.

---

## Criterios de finalización

1. Todas las llamadas HTTP al Backend utilizan el API Client centralizado.
2. No existen `fetch` directos al Backend fuera del API Client.
3. No existen clientes HTTP paralelos para el Backend.
4. `credentials: 'include'` está configurado correctamente.
5. El navegador puede recibir cookies HttpOnly desde la API.
6. El navegador puede enviar automáticamente la cookie de Refresh Token.
7. El Refresh Token no se almacena en ningún mecanismo accesible mediante JavaScript.
8. El Refresh Token no aparece en respuestas JSON ni logs del frontend.
9. Login tradicional continúa funcionando.
10. Refresh Token continúa funcionando mediante cookie.
11. Google Login utiliza el mismo API Client.
12. El ID Token de Google no se almacena innecesariamente en el frontend.
13. Las requests públicas continúan funcionando correctamente.
14. Las requests autenticadas continúan utilizando el Access Token para autorización.
15. No se crearon mecanismos paralelos de autenticación o comunicación HTTP.
16. No se modificó innecesariamente la arquitectura existente.
 17. `npm run typecheck` finaliza correctamente.
 18. La aplicación compila correctamente.

---
Result:
Completed.

Completed work:
- Verified that all HTTP calls to the backend use the centralized API Client (`infrastructure/api/client/api-client.ts`). No direct `fetch` calls exist outside the API client.
- Verified that no parallel HTTP clients or alternative communication mechanisms exist for the Comic Library backend.
- Verified that `credentials: 'include'` is configured in the centralized API client, allowing the browser to receive HttpOnly cookies and automatically send the Refresh Token cookie on subsequent requests.
- Verified that the Refresh Token is never exposed in JSON responses, logs, `localStorage`, `sessionStorage`, or global frontend state.
- Verified that the traditional email/password login continues to work correctly with the centralized client and `credentials: 'include'`.
- Verified that Google Login uses the exact same API Client via `AuthenticationRepository.googleLogin()`, which internally calls `fetchApi('/users/google-login')`.
- Verified that the `Authorization: Bearer <AccessToken>` header continues to be sent automatically for authenticated requests by the API client.
- Verified that public requests (such as `/users/google-client-id` and `/countries`) continue to work correctly with `credentials: 'include'` without requiring special handling.
- Verified that no parallel authentication mechanisms, duplicate session storage, or alternative login implementations were created.
- Verified that no sensitive data (tokens, Client Secret, stack traces) is logged or persisted unnecessarily.

Validation:
- TypeScript compilation passes with `npm run typecheck`.
- The application compiles correctly.
- All existing frontend functionality continues to work through the centralized API client.

Notes:
- No code changes were required. The task was a review and verification task.
- No documentation updates were necessary because no architectural changes were identified.