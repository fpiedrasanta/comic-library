# TASK-PUBLIC-WEB-0023 — Implementar pantalla y componente de verificación de código para recuperación de contraseña

## Objetivo

Implementar el paso de ingreso y validación del código de recuperación de contraseña correspondiente a US-0003.

Antes de crear nuevos componentes, revisar la implementación existente utilizada para la validación del email durante el registro.

Si el componente existente puede reutilizarse, debe reutilizarse o adaptarse en lugar de crear una segunda implementación equivalente.

---

## 1. Prototipo de referencia

Utilizar como referencia visual:

```text
\read comics\partirtura read comics\ux_ui\verify-code-template.html
```

Ya existe una pantalla de validación de código utilizada durante el registro de usuarios.

Debe analizarse si esa pantalla y sus componentes pueden reutilizarse para el flujo de recuperación de contraseña.

No duplicar componentes sin una justificación técnica.

---

## 2. Código

El código de recuperación es de:

```text
6 dígitos numéricos
```

El componente debe permitir:

- Ingresar un dígito por casillero.
- Avanzar automáticamente al siguiente casillero.
- Retroceder mediante Backspace.
- Corregir cualquier dígito.
- Pegar un código completo desde el clipboard.
- Al pegar los 6 dígitos, distribuirlos automáticamente entre los seis casilleros.
- No aceptar caracteres no numéricos.
- No permitir más de seis dígitos.
- Detectar cuando los seis dígitos fueron ingresados.

El comportamiento de pegado debe ser equivalente al comportamiento ya implementado para la validación de email.

---

## 3. Integración con API

Cuando el usuario envía el código, invocar el endpoint correspondiente definido por el backend.

Utilizar el contrato documentado actualmente en:

```text
project/endpoints.md
```

No inventar ni modificar contratos de API.

La respuesta exitosa del backend genera un nuevo código/token necesario para el siguiente paso del flujo.

Ese valor debe conservarse temporalmente para poder utilizarlo al cambiar la contraseña.

---

## 4. Estados

Implementar correctamente:

- Loading.
- Código incompleto.
- Código inválido.
- Código expirado.
- Error de API.
- Respuesta exitosa.

Evitar doble submit.

No mostrar información innecesaria sobre el funcionamiento interno del backend.

---

## 5. Navegación

El flujo debe ser:

```text
Ingresar email
      ↓
Código de recuperación
      ↓
Ingresar código de 6 dígitos
      ↓
API valida código
      ↓
API devuelve nuevo código/token
      ↓
Pantalla de nueva contraseña
```

El valor devuelto por la API debe quedar disponible para el siguiente paso.

No almacenar información sensible innecesariamente en `localStorage`.

---

## 6. Reutilización

Antes de implementar nuevos componentes:

1. Buscar el componente utilizado actualmente para validar el email durante el registro.
2. Determinar si puede reutilizarse.
3. Si necesita modificaciones, hacerlas de manera que no rompan el flujo de registro.
4. Evitar duplicar lógica de ingreso de códigos de seis dígitos.

Si la implementación existente ya soporta:

- navegación entre casilleros;
- Backspace;
- pegado de código completo;
- validación numérica;

debe reutilizarse.

---

## 7. Documentación obligatoria

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

## 8. Criterios de finalización

La Task se considera finalizada cuando:

1. La pantalla respeta el template indicado.
2. Se reutiliza el componente existente de validación de código cuando sea técnicamente posible.
3. Se pueden ingresar exactamente seis dígitos numéricos.
4. Se puede pegar el código completo y los seis dígitos se distribuyen correctamente.
5. La navegación entre casilleros funciona correctamente.
6. Backspace funciona correctamente.
7. Se manejan códigos incompletos.
8. Se manejan errores de API.
9. Se manejan códigos inválidos o expirados.
10. Se muestra loading durante la validación.
11. Se evita el doble submit.
12. Se conserva correctamente el nuevo código/token devuelto por el backend.
13. Ante una respuesta exitosa se navega a la pantalla de nueva contraseña.
14. No se rompe el flujo existente de validación de email del registro.
15. No se duplicó innecesariamente lógica existente.
 16. La aplicación compila correctamente.

---

## Resultado de la ejecución

### Cambios realizados

1. **Componente compartido `OtpInputs`** (`features/authentication/components/otp-inputs.tsx`)
   - Extraído de la lógica existente de `verify-email-page.tsx`.
   - Soportado: navegación entre casilleros, Backspace, pegado completo, validación numérica.
   - Reutilizado por `VerifyEmailPage` y `VerifyRecoveryCodePage`.

2. **Nueva pantalla `VerifyRecoveryCodePage`** (`pages/verify-recovery-code-page.tsx`)
   - Respeta template `verify-code-template.html`.
   - Usa `OtpInputs` compartido.
   - Temporizador visible con formato `MM:SS`.
   - Botón de reenvío consume `POST /api/users/resend-password-reset-code`.
   - Al validar, consume `POST /api/users/validate-password-reset-code` y navega a `/reset-password` con `authorizationToken`.
   - Maneja loading, errores, código incompleto, código expirado.
   - No almacena `authorizationToken` en `localStorage`.

3. **Refactor `VerifyEmailPage`** (`pages/verify-email-page.tsx`)
   - Ahora usa `OtpInputs` compartido.
   - No se modifica su flujo de validación de email.

4. **Types y Repository** ya actualizados en TASK-0022.

### Verificación

- `tsc --noEmit` compila sin errores.
- Se reutiliza `OtpInputs` sin duplicar lógica.
- El flujo de validación de email del registro continúa funcionando.

### Documentación actualizada

- No se modificaron documentos de proyecto en esta Task.