# TASK-PUBLIC-WEB-0026 — Preparar integración de autenticación mediante Google

## Objetivo

Preparar el Public Web para consumir el nuevo mecanismo de autenticación mediante Google definido en:

```text
US-0004 — Autenticación mediante Google
```

La implementación debe integrarse con la arquitectura de autenticación existente y no crear un mecanismo de sesión paralelo.

---

## Contexto

El Public Web ya dispone de:

- Login mediante email/password.
- Manejo de Access Token.
- Manejo de sesión del usuario autenticado.
- Refresh Token gestionado por el backend mediante cookie HttpOnly.
- Manejo centralizado de errores.
- Componentes y servicios de autenticación existentes.

El Login mediante Google debe incorporarse como una alternativa al Login tradicional.

---

## Requerimientos

### 1. Revisar implementación existente

Antes de realizar cambios, leer:

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

También leer:

```text
backlog/epic-01/epic-01.md
backlog/epic-01/us-0004/us-0004.md
```

Y revisar la implementación actual de:

- Login.
- Auth service.
- Session management.
- HTTP client.
- Error handling.
- Refresh de sesión.
- Componentes relacionados con autenticación.

---

## 2. Endpoint

Asumir que el backend expondrá el endpoint definido para Google Login.

No inventar otro contrato.

El frontend debe consumir el endpoint documentado en:

```text
project/endpoints.md
```

Si el backend todavía no finalizó la implementación, utilizar el contrato documentado como fuente de verdad.

---

## 3. Modelo de respuesta

El frontend debe utilizar el `AuthResponse` público definido por la API.

El Refresh Token:

- no forma parte del JSON;
- no debe almacenarse manualmente;
- no debe aparecer en localStorage;
- no debe aparecer en sessionStorage;
- no debe aparecer en variables globales;
- será gestionado mediante cookie HttpOnly por el backend.

---

## 4. Credenciales

Las requests que correspondan deben utilizar las opciones necesarias para permitir el envío de cookies cuando el navegador deba enviar la cookie HttpOnly del Refresh Token.

No implementar almacenamiento manual del Refresh Token.

---

## 5. Arquitectura

La integración debe respetar la arquitectura existente.

El componente visual no debe:

- llamar directamente al endpoint;
- manejar tokens;
- interpretar cookies;
- implementar lógica de autenticación.

Debe utilizar los servicios existentes de autenticación.

---

## Restricciones

No modificar todavía el diseño visual del Login salvo lo estrictamente necesario para preparar la integración.

No modificar el flujo de Login email/password.

No implementar todavía el comportamiento completo del botón Google si requiere componentes que serán creados en la siguiente Task.

No modificar endpoints documentados.

No modificar backend.

---

## Documentación

Si se modifica una regla general de autenticación frontend:

```text
project/frontend-coding-rules.md
```

Si se incorporan componentes reutilizables:

```text
project/components.md
```

Modificar documentación únicamente si corresponde al cambio real.

---

## Criterios de finalización

1. El Public Web tiene preparada la integración con el endpoint Google Login.
2. Se utiliza el contrato definido por `endpoints.md`.
3. Se utiliza el `AuthResponse` existente.
4. El Refresh Token no se maneja desde JavaScript.
5. No se almacena el Refresh Token.
6. Se mantienen las cookies HttpOnly gestionadas por backend.
7. La integración utiliza los servicios existentes de autenticación.
8. El Login tradicional continúa funcionando.
9. No se creó un mecanismo de sesión paralelo.
10. La arquitectura existente se mantiene.
11. La aplicación compila correctamente.

---

## BLOQUEOS

Por cualquier bloqueo o necesidad de información, generar una TASK en /planned para que sea revisada y evaluada por el humano, quién luego la moverá a /pending con el resultado de la definición.

---
Result:
Completed.

Completed work:
- Added `GoogleLoginRequest` interface to `types/api.ts` with the `idToken` property.
- Added `googleLogin(request: GoogleLoginRequest): Promise<AuthResponse>` method to `AuthenticationRepository` in `features/authentication/api/authentication-repository.ts`.
- Updated `infrastructure/api/client/api-client.ts` to include `credentials: 'include'` in all fetch requests, ensuring HttpOnly cookies (Refresh Token) are properly sent and received by the browser.

Validation:
- TypeScript compilation passes with `npm run typecheck`.
- The Google Login endpoint `/api/users/google-login` is consumed through the existing centralized API client.
- The response uses the existing `AuthResponse` model.
- The existing `login` function in `use-auth.tsx` can handle the Google login response without modification.
- No parallel session mechanism was created.
- Traditional email/password login continues to use the same architecture.

Notes:
- No new reusable components were added, so `components.md` was not modified.
- No general authentication rules were changed, so `frontend-coding-rules.md` was not modified.
- No pages were added or modified, so `pages.md` was not modified.