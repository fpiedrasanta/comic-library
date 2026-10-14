# TASK-PUBLIC-WEB-0029 — Compatibilizar recuperación de contraseña con usuarios registrados mediante Google

## Objetivo

Asegurar que un usuario cuyo registro original fue realizado mediante Google pueda establecer posteriormente una contraseña utilizando el flujo existente de recuperación de contraseña.

---

## Contexto

US-0004 establece que:

```text
Usuario creado originalmente con Google
        ↓
Puede utilizar "Recuperar contraseña"
        ↓
Establece una password
        ↓
Puede utilizar Email + Password
```

No debe crearse un flujo de recuperación específico para Google.

---

## Requerimientos

Revisar el flujo existente:

```text
Forgot Password
    ↓
Email
    ↓
Código
    ↓
Nueva Password
```

Verificar que funcione correctamente cuando el usuario:

- fue creado mediante Google;
- no tenía password previamente.

---

## Password

La password debe utilizar exactamente:

- las mismas validaciones;
- las mismas reglas;
- el mismo componente;
- el mismo flujo;

que utiliza un usuario registrado mediante email/password.

No duplicar validaciones.

---

## Login posterior

Una vez establecida la password:

```text
Email
+
Nueva Password
        ↓
Login tradicional
        ↓
Sesión autenticada
```

Debe funcionar sin ningún tratamiento especial en frontend.

---

## Restricciones

No agregar:

```text
GooglePassword
```

No agregar:

```text
GoogleUserPassword
```

No crear un flujo alternativo.

No modificar el mecanismo de recuperación de contraseña salvo lo necesario para soportar este caso.

---

## Criterios de finalización

1. Un usuario Google puede iniciar el flujo de recuperación.
2. Puede ingresar el código.
3. Puede establecer una nueva password.
4. Se utilizan las mismas validaciones existentes.
5. Se reutilizan componentes existentes cuando corresponda.
6. Puede posteriormente hacer Login mediante email/password.
7. No se duplica lógica de validación.
8. Los usuarios tradicionales continúan funcionando.
9. No se creó un flujo de password específico para Google.

---

## BLOQUEOS

Por cualquier bloqueo o necesidad de información, generar una TASK en /planned para que sea revisada y evaluada por el humano, quién luego la moverá a /pending con el resultado de la definición.

---
Result:
Completed.

Completed work:
- Verified that the existing password recovery flow in the frontend is fully compatible with users registered through Google.
- Confirmed that `forgot-password-page.tsx` does not contain any logic assuming the user has a password; it simply sends the email to `POST /users/forgot-password`.
- Confirmed that `verify-recovery-code-page.tsx` validates the OTP via `POST /users/validate-password-reset-code` without distinguishing between traditional and Google users.
- Confirmed that `reset-password-page.tsx` uses the same Zod password schema and `PasswordInput` component for any user, regardless of registration method.
- Confirmed that the flow does not create a separate recovery path for Google users (`GooglePassword`, `GoogleUserPassword`, or alternative flows do not exist).
- Confirmed that after establishing a password, the user can log in with email/password using the existing login mechanism without any frontend modification.
- Confirmed that the same validation rules, components, and endpoints are reused for both traditional and Google-registered users.
- Confirmed that traditional users continue to work without modification.

Validation:
- TypeScript compilation passes with `npm run typecheck`.
- No code changes were required because the existing password recovery implementation is already agnostic to the user's registration method.

Notes:
- The backend (TASK-API-0050) handles the business logic for users without a password (Google users). The frontend simply consumes the same endpoints and displays standardized error messages.
- No new files, components, or pages were added, so `pages.md` and `components.md` were not modified.