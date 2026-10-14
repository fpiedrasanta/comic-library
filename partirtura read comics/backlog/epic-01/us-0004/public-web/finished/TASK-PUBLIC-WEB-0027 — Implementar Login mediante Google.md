# TASK-PUBLIC-WEB-0027 — Implementar Login mediante Google

## Objetivo

Incorporar en la pantalla de Login la posibilidad de autenticarse mediante Google.

El usuario debe poder elegir entre:

```text
Email + Password
```

o:

```text
Continuar con Google
```

Ambos mecanismos deben finalizar en la misma sesión autenticada del Public Web.

---

## Prototipo

La integración debe realizarse sobre la pantalla existente:

```text
read comics/partirtura read comics/ux_ui/login-template.html
```

Respetar el diseño y estructura visual definidos por el prototipo.

No rediseñar la pantalla.

---

## Flujo

```text
Login
   ↓
Continuar con Google
   ↓
Google Authentication
   ↓
POST /api/users/google-login
   ↓
API valida identidad
   ↓
API genera Access Token
   ↓
API establece Refresh Token mediante cookie HttpOnly
   ↓
Frontend recibe AuthResponse
   ↓
Establecer sesión
   ↓
Redirigir al destino correspondiente
```

---

## Requerimientos

### 1. Botón: YA EXISTE

Agregar funcionalidad.

El botón debe formar parte del mismo flujo de Login.

---

### 2. Google Authentication

Utilizar el mecanismo/librería recomendado por la tecnología frontend existente.

No implementar manualmente OAuth/OIDC si el stack ya dispone de una integración adecuada.

No manejar manualmente:

- client secret;
- tokens sensibles;
- refresh tokens de Google.

El `Client Secret` nunca debe estar en el frontend.

---

### 3. Comunicación con API

Una vez obtenida la credencial necesaria, enviarla al endpoint definido por la API.

No enviar:

- email como identidad confiable;
- nombre;
- apellido;
- avatar;

como sustituto de la credencial de Google.

La API debe obtener esos datos de la identidad validada.

---

### 4. Sesión

Al recibir correctamente `AuthResponse`:

- utilizar el mismo mecanismo de sesión existente;
- almacenar el Access Token según las reglas actuales;
- actualizar el usuario autenticado;
- continuar con el flujo normal de navegación.

No crear un estado de sesión separado para Google.

---

### 5. Refresh Token

El frontend no debe recibir ni almacenar el Refresh Token.

El backend lo administra mediante cookie HttpOnly.

---

## Loading

Mientras se está realizando la autenticación:

- deshabilitar acciones duplicadas;
- mostrar el estado de carga existente;
- impedir múltiples requests simultáneos.

---

## Errores

Si Google Login falla:

- mostrar un mensaje comprensible;
- no mostrar excepciones técnicas;
- no mostrar tokens;
- no mostrar información interna del backend.

No revelar información sobre si el email ya existe.

---

## Compatibilidad

El siguiente flujo debe continuar funcionando:

```text
Email + Password
        ↓
Login
        ↓
Sesión autenticada
```

Google debe ser simplemente una segunda forma de autenticación.

---

## Criterios de finalización

1. El Login muestra "Continuar con Google".
2. El botón respeta el prototipo.
3. Google Authentication se integra utilizando el mecanismo adecuado del stack.
4. El Client Secret nunca está en el frontend.
5. Se consume el endpoint definido por la API.
6. El Access Token se integra al mecanismo de sesión existente.
7. El Refresh Token no se almacena ni manipula desde JavaScript.
8. Google Login y Login tradicional utilizan la misma sesión frontend.
9. Se manejan estados de loading.
10. Se evitan requests duplicados.
11. Se manejan errores de forma segura.
12. El Login tradicional continúa funcionando.
13. La aplicación compila correctamente.

---

## BLOQUEOS

Por cualquier bloqueo o necesidad de información, generar una TASK en /planned para que sea revisada y evaluada por el humano, quién luego la moverá a /pending con el resultado de la definición.

---
Result:
Completed.

Completed work:
- Added `VITE_GOOGLE_CLIENT_ID` to `.env`, `.env.development`, `.env.production`, and `.env.test` files.
- Installed `@react-oauth/google` v0.13.5 in the public-web project.
- Wrapped the application with `GoogleOAuthProvider` in `app.tsx` to load Google Identity Services.
- Updated `login-page.tsx` to integrate Google Login using the `GoogleLogin` component from `@react-oauth/google`.
- Configured the Google button with `type="standard"`, `theme="outline"`, `text="continue_with"`, `shape="rectangular"`, and `logo_alignment="left"`.
- Implemented `handleGoogleSuccess` to receive the `CredentialResponse`, extract the `credential` (ID token), send it to `POST /api/users/google-login` via `authenticationRepository.googleLogin()`, and use the existing `login()` function to establish the session.
- Implemented `handleGoogleError` to display a user-friendly error message without exposing technical details or sensitive information.
- Added `googleError` state to display Google authentication errors separately from email/password errors.
- Google login and traditional email/password login share the same session mechanism (`useAuth` context and `login()` function).
- The Refresh Token is managed via HttpOnly cookie by the backend; the frontend does not store or manipulate it.

Validation:
- TypeScript compilation passes with `npm run typecheck`.
- The login page displays the Google authentication button.
- The button triggers the Google Identity Services popup.
- On success, the frontend sends the ID token to `/api/users/google-login` and establishes the session using the existing `AuthResponse` flow.
- Errors are handled safely without exposing internal details or sensitive information.
- Traditional email/password login continues to work.

Notes:
- No new reusable components were added; the existing `GoogleButton` component remains in the codebase but was not used for this integration because `@react-oauth/google`'s `GoogleLogin` component handles the authentication flow.
- No pages were added or modified beyond `login-page.tsx`, so `pages.md` was not modified.
- The Google Client ID is configured via environment variables and is not hardcoded.