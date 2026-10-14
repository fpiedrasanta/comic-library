# TASK-PUBLIC-WEB-0028 — Integrar Google Login con el estado de sesión existente

## Objetivo

Asegurar que un usuario autenticado mediante Google sea tratado exactamente como cualquier otro usuario autenticado por el Public Web.

No debe existir una sesión diferente para usuarios Google.

---

## Requerimientos

Después de un Google Login exitoso, el frontend debe:

1. Guardar/actualizar el Access Token utilizando el mecanismo existente.
2. Actualizar el usuario autenticado.
3. Actualizar el estado global de autenticación.
4. Permitir navegación a las páginas protegidas.
5. Mostrar correctamente los datos del usuario.
6. Permitir utilizar las funcionalidades existentes.
7. Utilizar el mecanismo existente de refresh de sesión.

---

## AuthResponse

Utilizar exclusivamente los datos disponibles en:

```text
AuthResponse
```

Actualmente:

```text
AccessToken
UserId
Email
FullName
Role
```

No crear un modelo alternativo para usuarios Google.

---

## Usuario

El frontend no debe asumir que un usuario Google tiene características especiales.

Después del login:

```text
Usuario Google
      ↓
Usuario autenticado
```

La UI debe trabajar con el mismo modelo de usuario autenticado utilizado por Login tradicional.

---

## Refresh

Cuando expire el Access Token:

```text
Access Token expirado
        ↓
Refresh existente
        ↓
Cookie HttpOnly
        ↓
Nuevo Access Token
        ↓
Actualizar sesión
```

No crear un refresh específico para Google.

---

## Logout

El usuario autenticado mediante Google debe utilizar exactamente el mismo flujo de Logout existente.

No implementar Logout mediante Google como sustituto del Logout de la aplicación.

---

## Criterios de finalización

1. Google User utiliza el mismo estado global de autenticación.
2. No existe un estado paralelo `googleUser`.
3. No existe un modelo de sesión específico para Google.
4. Las páginas protegidas funcionan igual.
5. El refresh existente funciona.
6. El Logout existente funciona.
7. El usuario Google puede acceder a las mismas funcionalidades según su rol.
8. La UI utiliza `AuthResponse`.
9. No se almacena ningún token Google innecesario.
10. No se modifica el Login tradicional.

---

## BLOQUEOS

Por cualquier bloqueo o necesidad de información, generar una TASK en /planned para que sea revisada y evaluada por el humano, quién luego la moverá a /pending con el resultado de la definición.

---
Result:
Completed.

Completed work:
- Verified that `login-page.tsx` uses the existing `login()` function from `useAuth` for Google authentication, ensuring the same session state is used for both Google and traditional login.
- Confirmed that `AuthResponse` is the single source of truth for user session data; no alternative session model or `googleUser` state exists.
- Confirmed that the Access Token is stored via `storeAccessToken()`, the user is updated via `setUser()`, and the global auth state is updated via `setAuthState('authenticated')` — exactly the same mechanism as traditional login.
- Confirmed that protected pages rely on the same `AuthProvider` context and will behave identically for Google-authenticated users.
- Confirmed that the existing refresh mechanism (`restoreSession` + `/users/refresh-token` + HttpOnly cookie) works for Google users without any modification.
- Confirmed that the existing logout mechanism works for Google users without any modification.
- Confirmed that no Google-specific tokens or credentials are stored in the frontend.
- Confirmed that the traditional email/password login flow was not modified.

Validation:
- TypeScript compilation passes with `npm run typecheck`.
- No parallel session state or Google-specific session model was introduced.

Notes:
- No code changes were required because the previous task (TASK-PUBLIC-WEB-0027) already integrated Google Login using the existing authentication infrastructure.