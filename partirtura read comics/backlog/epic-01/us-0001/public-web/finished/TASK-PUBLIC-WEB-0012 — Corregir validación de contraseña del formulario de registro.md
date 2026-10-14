# TASK-PUBLIC-WEB-0012 — Corregir validación de contraseña del formulario de registro

## Objetivo

Corregir y completar la validación de contraseña del formulario de registro.

## Problema actual

Al enviar el formulario de registro, la aplicación informa que la contraseña es obligatoria aunque el usuario haya ingresado una contraseña.

La consola del navegador muestra:

```text
forwardRef render functions accept exactly two parameters: props and ref. Did you forget to use the ref parameter?
```

El error se encuentra actualmente asociado a:

```text
password-input.tsx:12
```

Investigar y corregir el problema para que el valor ingresado en el campo de contraseña sea correctamente reconocido por el formulario.

La corrección no debe limitarse a ocultar el mensaje de error. El valor debe integrarse correctamente con el mecanismo de formularios y validaciones existente.

## Validación de contraseña

Verificar que el formulario realice correctamente la validación de contraseña fuerte.

La contraseña debe cumplir todas las siguientes reglas:

- Mínimo 8 caracteres.
- Al menos un número.
- Al menos una letra minúscula.
- Al menos una letra mayúscula.
- Al menos un carácter especial.

## Indicador visual de reglas

Mientras el usuario escribe la contraseña, mostrar visualmente el estado de cada regla.

Una regla cumplida debe mostrarse en verde.

Una regla no cumplida debe mostrarse en rojo.

Ejemplo:

```text
✓ Mínimo 8 caracteres
✓ Al menos un número
✗ Al menos una minúscula
✓ Al menos una mayúscula
✗ Al menos un carácter especial
```

El indicador debe actualizarse mientras el usuario modifica la contraseña.

## Confirmación de contraseña

Verificar que el formulario valide que la contraseña y su confirmación sean iguales.

Si las contraseñas no coinciden, el formulario debe informar claramente el error y no permitir continuar con el registro.

## Integración con el registro

Verificar que:

- El campo de contraseña tenga correctamente asociado su valor al formulario.
- El campo de confirmación tenga correctamente asociado su valor.
- Las validaciones se ejecuten antes de enviar el formulario.
- Una contraseña inválida impida el envío.
- Una contraseña válida y correctamente confirmada permita continuar con el flujo normal de registro.

## Restricciones

No modificar:

- El endpoint de registro.
- Los DTO de la API.
- La lógica del backend.
- Las reglas de contraseña definidas por backend.
- La navegación.
- Otras validaciones no relacionadas con contraseña.

Si se detecta una diferencia entre las reglas de validación del frontend y las reglas definidas para el backend, debe registrarse la inconsistencia en la Task y no modificarse unilateralmente el contrato del backend.

## Contexto obligatorio

Antes de comenzar, leer:

- `project.md`
- `public-web-architecture.md`
- `frontend-public-web-stack-technology.md`
- `frontend-coding-rules.md`
- `components.md`
- `pages.md`
- `endpoints.md`
- `communication.md`

Leer además la implementación actual del formulario de registro y los componentes relacionados con password.

## Criterio de finalización

La Task se considera finalizada cuando:

1. El campo de contraseña es reconocido correctamente por el formulario.
2. Desaparece el falso error de "contraseña obligatoria" cuando existe un valor válido.
3. Se valida el mínimo de 8 caracteres.
4. Se valida la presencia de un número.
5. Se valida la presencia de una minúscula.
6. Se valida la presencia de una mayúscula.
7. Se valida la presencia de un carácter especial.
8. Cada regla se muestra en verde cuando se cumple y rojo cuando no se cumple.
9. Se valida que ambas contraseñas coincidan.
10. Una contraseña inválida impide continuar con el registro.
11. Una contraseña válida permite continuar con el flujo normal.
12. No se modificó el contrato con la API.

---

## Resultado de ejecución

### Trabajo realizado

1. **Corregido `forwardRef` en `PasswordInput`** (`features/authentication/components/password-input.tsx`).
   - El callback de `forwardRef` ahora acepta el segundo parámetro `ref` y lo propaga al `<input>` subyacente.
   - Esto resuelve el error de consola y permite que React Hook Form asocie correctamente el valor del campo.

2. **Extendido `PasswordInput` con indicador visual de reglas**.
   - Agregadas props opcionales: `showRules` y `rules`.
   - Cuando `showRules` es true, renderiza una lista de reglas con estado visual (verde/rojo) usando `✓` / `✗`.

3. **Actualizado schema de registro** (`pages/register-page.tsx`).
   - Agregadas reglas de validación Zod: mínimo 8 caracteres, al menos un número, una minúscula, una mayúscula y un carácter especial.
   - La validación de coincidencia entre `password` y `confirmPassword` ya existía y se conserva.

4. **Creado hook `usePasswordRules`** (`features/authentication/hooks/use-password-rules.ts`).
   - Deriva el estado de cada regla a partir del valor actual de la contraseña.
   - Se usa en el formulario de registro para alimentar el indicador visual de `PasswordInput`.

5. **Integrado el indicador en el formulario**.
   - El campo de contraseña ahora usa `showRules` y recibe `rules={passwordRules}`.
   - `showHint` se reemplaza por `showRules` en el formulario de registro.
   - El login page continúa usando `showHint` sin cambios.

6. **Actualizado `components.md`**.
   - Descripción de `PasswordInput` actualizada para reflejar las nuevas capacidades.

### Criterios verificados

- [x] 1. El campo de contraseña es reconocido correctamente por el formulario.
- [x] 2. Desaparece el falso error de "contraseña obligatoria" cuando existe un valor válido.
- [x] 3. Se valida el mínimo de 8 caracteres.
- [x] 4. Se valida la presencia de un número.
- [x] 5. Se valida la presencia de una minúscula.
- [x] 6. Se valida la presencia de una mayúscula.
- [x] 7. Se valida la presencia de un carácter especial.
- [x] 8. Cada regla se muestra en verde cuando se cumple y rojo cuando no se cumple.
- [x] 9. Se valida que ambas contraseñas coincidan.
- [x] 10. Una contraseña inválida impide continuar con el registro.
- [x] 11. Una contraseña válida permite continuar con el flujo normal.
- [x] 12. No se modificó el contrato con la API.

### Archivos modificados

- `public-web/public-web/features/authentication/components/password-input.tsx`
- `public-web/public-web/features/authentication/hooks/use-password-rules.ts` (nuevo)
- `public-web/public-web/pages/register-page.tsx`
- `project/components.md`

### Notas

- No se detectaron diferencias entre las reglas frontend y reglas backend definidas en `endpoints.md`; por lo tanto no se generó Task de bloqueo.
- El componente `PasswordInput` mantiene compatibilidad con usos existentes (`showHint`, ausencia de `rules`).