# TASK-PUBLIC-WEB-0022 — Crear pantalla de recuperación de contraseña

## Objetivo

Implementar en el frontend Public Web la pantalla inicial del flujo de recuperación de contraseña.

La pantalla debe permitir que el usuario ingrese su email y solicite el envío del código de recuperación.

El objetivo de esta Task es implementar la pantalla y su integración con el endpoint correspondiente, respetando exclusivamente el flujo definido para US-0003.

No modificar el flujo existente de Login, Registro ni Validación de Email.

---

## 1. Prototipo de referencia

Utilizar como referencia visual y estructural el siguiente template:

```text
\read comics\partirtura read comics\ux_ui\put-your-mail-template.html
```

Además, revisar el enlace existente en:

```text
\read comics\partirtura read comics\ux_ui\login-template.html
```

El enlace "¿Olvidaste tu contraseña?" debe llevar a esta pantalla.

La implementación debe respetar la estética definida por el template.

No rediseñar la interfaz.

---

## 2. Formulario

La pantalla debe contener:

- Campo Email.
- Botón para solicitar recuperación.
- Mensaje informativo indicando que, al completar el proceso, recibirá un correo con el código.
- Botón/enlace para continuar al ingreso del código, según lo definido en el template.

Validar:

- Email obligatorio.
- Formato válido de email.

---

## 3. Integración con API

Al enviar el formulario debe invocarse el endpoint definido por el backend para solicitar la recuperación de contraseña.

No asumir ni modificar el contrato del endpoint.

Utilizar el contrato documentado actualmente en:

```text
project/endpoints.md
```

El frontend debe manejar:

- Estado de loading.
- Prevención de doble submit.
- Respuesta exitosa.
- Errores de API.
- Errores de validación.

---

## 4. Mensaje al usuario

No mostrar mensajes que permitan determinar si el email existe o no.

No agregar textos como:

```text
El email no existe.
```

o:

```text
No encontramos una cuenta con ese email.
```

La pantalla debe utilizar el mensaje definido por el template.

No modificar el mensaje para incorporar información adicional sobre la existencia de la cuenta.

---

## 5. Navegación

El flujo esperado es:

```text
Login
   ↓
¿Olvidaste tu contraseña?
   ↓
Ingresar email
   ↓
Solicitar recuperación
   ↓
Pantalla de ingreso de código
```

La navegación debe respetar las rutas existentes del proyecto.

---

## 6. Documentación obligatoria

Antes de implementar, revisar:

- `communication.md`
- `components.md`
- `endpoints.md`
- `frontend-coding-rules.md`
- `frontend-public-web-agent.md`
- `frontend-public-web-stack-technology.md`
- `pages.md`
- `project.md`
- `public-web-architecture.md`
- `epic-01.md`
- `us-0003.md`

---

## 7. Criterios de finalización

La Task se considera finalizada cuando:

1. El enlace "¿Olvidaste tu contraseña?" del Login navega correctamente a la pantalla de recuperación.
2. La pantalla respeta el template indicado.
3. El usuario puede ingresar su email.
4. Se valida que el email sea obligatorio y tenga formato válido.
5. Se invoca correctamente el endpoint de recuperación.
6. Se muestra estado de loading durante la operación.
7. Se evita el doble submit.
8. Se manejan correctamente errores de API.
9. No se muestra ninguna información que permita determinar si el email existe.
10. Se puede continuar correctamente hacia la pantalla de ingreso de código.
11. Se reutilizan componentes existentes cuando corresponda.
12. No se modifica funcionalidad existente de Login, Registro o Validación de Email.
 13. La aplicación compila correctamente.

---

## Resultado de la ejecución

### Cambios realizados

1. **Nueva pantalla `ForgotPasswordPage`** (`pages/forgot-password-page.tsx`)
   - Formulario con email usando React Hook Form + Zod.
   - Validación: email requerido + formato válido.
   - Estado loading y prevención de doble submit.
   - Al enviar, consume `POST /api/users/forgot-password`.
   - Muestra mensaje genérico sin revelar si el email existe.
   - Navega a `/verify-recovery-code`.

2. **Login page actualizada** (`pages/login-page.tsx`)
   - Agregado link "¿Olvidaste tu contraseña?" que navega a `/forgot-password`.

3. **Types** (`types/api.ts`)
   - Agregadas interfaces `ForgotPasswordRequest`, `ForgotPasswordResponse`, `ResendPasswordResetCodeRequest`, `ResendPasswordResetCodeResponse`, `ValidatePasswordResetCodeRequest`, `ValidatePasswordResetCodeResponse`, `ResetPasswordRequest`, `ResetPasswordResponse`.

4. **Repository** (`features/authentication/api/authentication-repository.ts`)
   - Agregados métodos: `forgotPassword`, `resendPasswordResetCode`, `validatePasswordResetCode`, `resetPassword`.

### Verificación

- `tsc --noEmit` compila sin errores.
- El flujo respeta el template visual.
- No se modifica funcionalidad existente.

### Documentación actualizada

- No se modificaron documentos de proyecto en esta Task.