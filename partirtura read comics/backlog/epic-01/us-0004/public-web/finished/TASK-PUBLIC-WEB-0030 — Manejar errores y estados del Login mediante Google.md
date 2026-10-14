# TASK-PUBLIC-WEB-0030 — Manejar errores y estados del Login mediante Google

## Objetivo

Implementar y normalizar el manejo de estados y errores específicos del Login mediante Google sin revelar información innecesaria al usuario.

---

## Estados

El flujo debe contemplar como mínimo:

```text
Idle
Loading
Success
Error
```

Evitar múltiples requests simultáneos.

---

## Errores de Google

Si la autenticación con Google es cancelada por el usuario:

- no mostrar un error técnico;
- permitir continuar utilizando Login tradicional.

Si Google devuelve una credencial inválida:

- mostrar un mensaje genérico de autenticación fallida.

Si la API devuelve un error:

- utilizar el mecanismo centralizado de manejo de errores existente.

---

## Información que NO debe mostrarse

Nunca mostrar:

- Client Secret;
- tokens;
- claims;
- excepciones técnicas;
- stack traces;
- información interna de Google;
- información sobre la existencia de un usuario.

---

## UX

El usuario debe poder:

```text
Google Login falla
        ↓
Volver a intentar
```

sin quedar en un estado inconsistente.

---

## Criterios de finalización

1. Los estados Loading/Error/Success están contemplados.
2. Se evita doble envío.
3. La cancelación de Google no deja la aplicación en estado inválido.
4. Los errores son comprensibles.
5. No se revela información sensible.
6. Se utiliza el manejo de errores existente.
7. El usuario puede volver a intentar.
8. Login tradicional continúa disponible.

---

## BLOQUEOS

Por cualquier bloqueo o necesidad de información, generar una TASK en /planned para que sea revisada y evaluada por el humano, quién luego la moverá a /pending con el resultado de la definición.

---
Result:
Completed.

Completed work:
- Added `isGoogleLoading` state to `login-page.tsx` to track the Google authentication API call phase.
- Updated `handleGoogleSuccess` to set `isGoogleLoading` to `true` before calling the API and `false` in the `finally` block.
- Changed `handleGoogleError` to clear `googleError` instead of setting a new one, preventing the UI from showing an error when the user cancels the Google popup.
- Added a loading indicator ("Autenticando con Google...") displayed while the API call is in progress.
- Disabled the email/password submit button while Google authentication is loading (`disabled={isSubmitting || isGoogleLoading}`).
- Preserved the existing centralized error handling: API errors are caught and displayed using `apiError.message` without exposing sensitive information.
- Ensured the user can retry Google authentication after an error by simply clicking the button again.
- Ensured the traditional email/password login remains available and functional.

Validation:
- TypeScript compilation passes with `npm run typecheck`.
- Cancellation of the Google popup no longer leaves the application in an invalid state.
- No sensitive information (Client Secret, tokens, claims, stack traces) is exposed to the user.
- The existing error handling mechanism is used consistently.

Notes:
- No new files, components, or pages were added, so `pages.md` and `components.md` were not modified.