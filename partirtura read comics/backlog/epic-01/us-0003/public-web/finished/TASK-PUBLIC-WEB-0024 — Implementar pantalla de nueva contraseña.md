# TASK-PUBLIC-WEB-0024 — Implementar pantalla de nueva contraseña

## Objetivo

Implementar la pantalla donde el usuario establece una nueva contraseña luego de haber validado correctamente el código de recuperación.

La pantalla debe reutilizar la misma lógica y componente de validación de contraseña que ya existe en el formulario de registro, siempre que sea técnicamente posible.

No crear una segunda implementación de las reglas de password.

---

## 1. Prototipo de referencia

Utilizar como referencia visual:

```text
\read comics\partirtura read comics\ux_ui\reset-password-template.html
```

La implementación debe respetar la estética y estructura definida por el template.

No rediseñar la interfaz.

---

## 2. Campos

La pantalla debe contener:

- Nueva contraseña.
- Confirmación de nueva contraseña.
- Botón para confirmar el cambio.

---

## 3. Validación de password

Debe utilizarse la misma validación existente en el formulario de registro.

La contraseña debe cumplir:

- Mínimo 8 caracteres.
- Al menos un número.
- Al menos una letra minúscula.
- Al menos una letra mayúscula.
- Al menos un carácter especial.

Cada regla debe mostrarse visualmente:

```text
✓ Regla cumplida
✗ Regla pendiente
```

Las reglas cumplidas deben mostrarse en verde.

Las reglas no cumplidas deben mostrarse en rojo.

No duplicar la implementación de esta lógica si ya existe un componente reutilizable en Registro.

---

## 4. Confirmación de contraseña

La segunda contraseña debe coincidir exactamente con la primera.

Si no coincide:

- Mostrar un mensaje de error.
- Impedir el envío del formulario.

La validación debe realizarse antes de invocar la API.

---

## 5. Integración con API

Al enviar el formulario correctamente, invocar el endpoint correspondiente definido por el backend.

El request debe contener:

- Nueva contraseña.
- Código/token obtenido en el paso anterior.

El token/código utilizado debe ser exactamente el valor devuelto por el endpoint de verificación de código.

No utilizar nuevamente el código de seis dígitos recibido originalmente por email si el backend ya devolvió un nuevo valor para este paso.

Utilizar el contrato documentado actualmente en:

```text
project/endpoints.md
```

No inventar ni modificar contratos de API.

---

## 6. Estados

Implementar correctamente:

- Loading.
- Password inválida.
- Passwords diferentes.
- Error de API.
- Código/token inválido o expirado.
- Cambio exitoso.

Evitar doble submit.

---

## 7. Reutilización

Antes de crear componentes nuevos:

1. Buscar el componente utilizado en el formulario de registro para validar password.
2. Reutilizarlo si es aplicable.
3. Si necesita adaptaciones, realizarlas sin romper el registro.
4. Evitar duplicar las reglas de password.

La regla de password debe mantenerse centralizada para evitar que Registro y Recuperación tengan comportamientos diferentes.

---

## 8. Finalización del flujo

Ante una respuesta exitosa del backend:

```text
Nueva contraseña
      ↓
API
      ↓
Password actualizada
      ↓
Ir a Login
```

No iniciar automáticamente una sesión.

El usuario debe volver a autenticarse utilizando su nueva contraseña.

---

## 9. Documentación obligatoria

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

## 10. Criterios de finalización

La Task se considera finalizada cuando:

1. La pantalla respeta el template indicado.
2. Se reutiliza la lógica/componente de password existente en Registro.
3. Se muestran las cinco reglas de password.
4. Las reglas cumplidas aparecen en verde.
5. Las reglas pendientes aparecen en rojo.
6. Se valida la coincidencia de ambas contraseñas.
7. No se permite enviar una password inválida.
8. Se utiliza el código/token devuelto por el paso de verificación.
9. Se invoca correctamente el endpoint de cambio de password.
10. Se muestra loading.
11. Se evita el doble submit.
12. Se manejan correctamente los errores de API.
13. Ante éxito se redirige al Login.
14. No se inicia sesión automáticamente.
15. No se duplicó innecesariamente lógica existente.
16. No se rompe el formulario de registro.
 17. La aplicación compila correctamente.

---

## Resultado de la ejecución

### Cambios realizados

1. **Nueva pantalla `ResetPasswordPage`** (`pages/reset-password-page.tsx`)
   - Respeta template `reset-password-template.html`.
   - Reutiliza `PasswordInput` y `usePasswordRules` del formulario de registro.
   - Muestra las 5 reglas de password con estado visual verde/rojo.
   - Validación de coincidencia entre ambas contraseñas con Zod.
   - Al enviar, consume `POST /api/users/reset-password` con `email`, `authorizationToken` y `newPassword`.
   - Estados: loading, error API, éxito.
   - Ante éxito: muestra confirmación y botón "Ir a Iniciar sesión".
   - No inicia sesión automáticamente.

2. **Componentes reutilizados**
   - `PasswordInput` y `usePasswordRules` ya existían en `register-page.tsx` y se reutilizan sin modificar su lógica.

3. **Types y Repository** ya actualizados en TASK-0022.

### Verificación

- `tsc --noEmit` compila sin errores.
- No se duplican reglas de password.
- El formulario de registro continúa funcionando sin cambios.

### Documentación actualizada

- No se modificaron documentos de proyecto en esta Task.