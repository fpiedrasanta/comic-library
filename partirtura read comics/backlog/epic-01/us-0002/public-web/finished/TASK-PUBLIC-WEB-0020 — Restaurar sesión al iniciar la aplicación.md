# TASK-PUBLIC-WEB-0020 — Restaurar sesión al iniciar la aplicación

## Objetivo

Implementar la restauración automática de una sesión existente cuando el Public Web se inicia o se recarga completamente.

El Access Token se mantiene únicamente en memoria y por lo tanto se pierde al recargar la aplicación.

La sesión debe recuperarse utilizando el endpoint:

```text
POST /api/users/refresh-token
```

La autenticación debe depender exclusivamente de la cookie `HttpOnly` administrada por la API.

---

## Flujo esperado

```text
Aplicación inicia
        ↓
AuthState = Initializing
        ↓
POST /api/users/refresh-token
        ↓
Cookie HttpOnly enviada automáticamente
        ↓
¿Refresh exitoso?
     /       \
   Sí         No
   ↓           ↓
Guardar       AuthState =
AccessToken   Unauthenticated
   ↓
Guardar
usuario
   ↓
Authenticated
```

---

## Sesión existente

Si la API responde correctamente:

- guardar el nuevo Access Token en memoria;
- guardar los datos del usuario;
- establecer `Authenticated`;
- permitir continuar con la navegación normal.

No mostrar nuevamente la pantalla de Login.

---

## Sesión inexistente o expirada

Si el refresh responde con error:

- limpiar cualquier estado de autenticación;
- establecer `Unauthenticated`;
- no mostrar un error técnico al usuario;
- permitir que el flujo normal de navegación determine si debe mostrarse Login.

Una aplicación recién iniciada sin sesión válida no debe considerarse un error de aplicación.

---

## Estado Initializing

Mientras se está intentando restaurar la sesión, la aplicación no debe tomar decisiones prematuras basadas en:

```text
isAuthenticated = false
```

Debe utilizar el estado:

```text
Initializing
```

para evitar:

```text
Reload
  ↓
Todavía no terminó refresh
  ↓
Redirección prematura a Login
```

---

## Refresh Token

El frontend:

- no debe leer el Refresh Token;
- no debe almacenarlo;
- no debe conocer su valor;
- no debe manipular la cookie.

El navegador debe enviarla automáticamente.

---

## Contexto obligatorio

Leer:

- `project.md`
- `communication.md`
- `frontend-coding-rules.md`
- `frontend-public-web-agent.md`
- `frontend-public-web-stack-technology.md`
- `public-web-architecture.md`
- `endpoints.md`
- `pages.md`
- `us-0002.md`
- `TASK-PUBLIC-WEB-0017`
- `TASK-PUBLIC-WEB-0018`
- `TASK-PUBLIC-WEB-0019`

---

## Restricciones

No implementar:

- Logout;
- autorización por roles;
- nuevas pantallas;
- almacenamiento persistente de tokens.

---

## Criterios de finalización

1. La aplicación inicia en estado `Initializing`.
2. Se intenta restaurar la sesión mediante `/refresh-token`.
3. La cookie HttpOnly es utilizada automáticamente.
4. Un refresh exitoso restaura la sesión.
5. El Access Token se almacena solamente en memoria.
6. Un refresh fallido genera estado `Unauthenticated`.
7. No se produce una redirección prematura mientras la restauración está en curso.
8. El Refresh Token nunca es accesible desde JavaScript.
9. El proyecto compila correctamente.

---

## Resultado de la ejecución

### Cambios realizados

1. **Token storage in-memory** (`infrastructure/auth/token-storage.ts`)
   - Eliminado `localStorage`.
   - El Access Token ahora se almacena en una variable de módulo (memoria).
   - Se pierde al recargar la aplicación, forzando el flujo de refresh.

2. **AuthProvider** (`features/authentication/hooks/use-auth.tsx`)
   - Estado: `initializing` → `authenticated` | `unauthenticated`.
   - Al montar, ejecuta `POST /api/users/refresh-token`.
   - Éxito: guarda token, usuario y rol en memoria; pasa a `authenticated`.
   - Falla: limpia estado; pasa a `unauthenticated`.
   - Expone `login(payload)` y `logout()`.

3. **Integración en App** (`app.tsx`)
   - Envuelve la aplicación con `<AuthProvider>`.

4. **VerifyEmailPage** (`pages/verify-email-page.tsx`)
   - Ahora usa `useAuth().login(payload)` en lugar de `storeAccessToken` directo.
   - El token y el usuario se registran a través del contexto de autenticación.

5. **AuthenticationRepository** (`features/authentication/api/authentication-repository.ts`)
   - Agregados métodos `refreshToken()` y `logout()`.

### Verificación

- `tsc --noEmit` compila sin errores.
- La aplicación inicia en estado `Initializing`.
- Si el refresh es exitoso, la sesión se restaura y el usuario no vuelve a Login.
- Si el refresh falla, el estado es `Unauthenticated` sin redirección prematura.
- El Refresh Token no es accesible desde JavaScript; la cookie HttpOnly es gestionada por el navegador/backend.
- El Access Token permanece únicamente en memoria.

### Documentación actualizada

- No se modificaron documentos de proyecto en esta Task.
