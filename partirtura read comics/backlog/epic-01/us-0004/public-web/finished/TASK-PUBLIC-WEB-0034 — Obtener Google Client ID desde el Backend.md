# TASK-PUBLIC-WEB-0034 — Obtener Google Client ID desde el Backend

## Objetivo

Corregir la configuración del Login mediante Google para que el Google Client ID sea obtenido desde el Backend y no se mantenga duplicado mediante variables de entorno del Public Web.

La configuración de Google debe permanecer centralizada en el Backend.

---

## 1. Eliminar configuración duplicada del Frontend

Eliminar:

```text
VITE_GOOGLE_CLIENT_ID
```

de:

```text
.env
.env.development
.env.production
.env.test
```

No reemplazarlo por otra variable de entorno del Public Web.

El Public Web no debe contener una copia del Google Client ID en archivos `.env`.

---

## 2. Obtener Client ID desde el Backend

Consumir el endpoint definido por el Backend para obtener el Google Client ID.

El frontend debe obtener el valor mediante el API Client centralizado.

No realizar requests HTTP directas fuera del API Client.

El flujo debe ser:

```text
Public Web
    ↓
GET /api/users/google-client-id
    ↓
Google Client ID
```

Utilizar el contrato documentado en:

```text
project/endpoints.md
```

No inventar una ruta diferente.

---

## 3. Inicialización de Google Identity Services

Utilizar el Client ID obtenido desde el Backend para inicializar:

```text
GoogleOAuthProvider
```

El componente debe utilizar el Client ID recibido dinámicamente.

No debe existir:

```text
clientId="hardcoded..."
```

ni:

```text
clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
```

---

## 4. Estado de carga

Mientras el Client ID todavía no haya sido obtenido:

- No mostrar un botón de Google que no pueda funcionar.
- No inicializar Google Identity Services con un Client ID vacío o inválido.
- Mantener el comportamiento visual de la pantalla de Login.

Utilizar el mecanismo de loading existente del proyecto cuando corresponda.

No crear una nueva pantalla de carga exclusivamente para Google.

---

## 5. Error al obtener Client ID

Si el Backend no puede proporcionar el Client ID:

- No mostrar información técnica.
- No mostrar valores de configuración.
- No mostrar `ClientSecret`.
- Informar al usuario mediante el mecanismo existente de errores del Login.
- El Login tradicional mediante email/password debe continuar funcionando si es posible.

No hacer que un error de configuración de Google inutilice innecesariamente todo el formulario de Login.

---

## 6. Reutilización de infraestructura existente

Utilizar:

- API Client centralizado.
- `AuthenticationRepository` o el repositorio correspondiente según la arquitectura existente.
- `useAuth`.
- El mecanismo de sesión existente.

No crear:

- Otro API Client.
- Otro mecanismo de autenticación.
- Otro contexto de sesión.
- Otro almacenamiento de tokens.

---

## 7. Seguridad

El frontend puede recibir y utilizar el:

```text
Google Client ID
```

El Client ID no es un secreto.

El frontend **nunca debe recibir ni almacenar**:

```text
Google Client Secret
```

El Client Secret debe permanecer exclusivamente en el Backend.

No almacenar el ID Token de Google más allá del tiempo estrictamente necesario para completar el Login.

---

## 8. Configuración

La fuente de verdad debe continuar siendo:

```text
Api/appsettings.json
```

con:

```text
Google:ClientId
Google:ClientSecret
```

El frontend no debe duplicar estos valores en:

```text
.env
.env.development
.env.production
.env.test
```

---

## 9. Documentación

Actualizar, si corresponde:

```text
project/pages.md
project/components.md
project/frontend-coding-rules.md
project/public-web-architecture.md
```

No modificar nunca:

```text
project/endpoints.md
```
En caso de necesitar cambios (nuevos end-points o modificar existentes: parametros de envio, parametros recibidos, ruta, etc) solicitar al backend mediante una task en planned y mover la actual a blocked hasta que los cambios sean confirmados.
Revisar communication.md para saber cómo crear la task.


No modificar:

```text
project/frontend-public-web-stack-technology.md
```

si no se incorpora una nueva dependencia.

---

## Criterios de finalización

1. `VITE_GOOGLE_CLIENT_ID` no existe en los archivos `.env` del Public Web.
2. El frontend obtiene el Google Client ID desde el Backend.
3. Se utiliza el endpoint definido en `endpoints.md`.
4. La llamada utiliza el API Client centralizado.
5. `GoogleOAuthProvider` recibe dinámicamente el Client ID obtenido.
6. Google Identity Services no se inicializa con un Client ID vacío o inválido.
7. Un error al obtener el Client ID no revela información técnica.
8. El Login tradicional continúa funcionando.
9. El Client Secret nunca llega al frontend.
10. El ID Token solamente se utiliza para completar el Login mediante Google.
11. El Refresh Token continúa siendo administrado exclusivamente mediante cookie HttpOnly.
12. No se crean mecanismos paralelos de autenticación o sesión.
 13. `npm run typecheck` finaliza correctamente.
 14. La aplicación compila correctamente.

---
Result:
Completed.

Completed work:
- Removed `VITE_GOOGLE_CLIENT_ID` from `.env`, `.env.development`, `.env.production`, and `.env.test` files.
- Added `GoogleClientIdResponse` interface to `types/api.ts`.
- Added `getGoogleClientId()` method to `AuthenticationRepository` to consume `GET /api/users/google-client-id`.
- Removed `GoogleOAuthProvider` from `app.tsx` to avoid initializing Google Identity Services at the app root.
- Updated `login-page.tsx` to fetch the Google Client ID from the backend on mount using `authenticationRepository.getGoogleClientId()`.
- The `GoogleOAuthProvider` is now rendered inside `login-page.tsx` only after the Client ID is successfully retrieved from the backend.
- While the Client ID is loading, a neutral loading message is displayed without exposing technical details.
- If the backend fails to provide the Client ID, an error message is shown using the existing error mechanism, and the traditional email/password login remains available.
- The Client ID is passed dynamically to `GoogleOAuthProvider`; no hardcoded or environment-based values remain in the frontend.

Validation:
- TypeScript compilation passes with `npm run typecheck`.
- The frontend no longer contains `VITE_GOOGLE_CLIENT_ID` in any `.env` file.
- The Google Client ID is obtained exclusively from the backend via the centralized API client.
- Google Identity Services is initialized only when a valid Client ID is available.
- The traditional email/password login continues to work independently of the Google configuration.

Notes:
- No documentation files (`pages.md`, `components.md`, `frontend-coding-rules.md`, `public-web-architecture.md`) were modified because no architectural rules or reusable component APIs changed.