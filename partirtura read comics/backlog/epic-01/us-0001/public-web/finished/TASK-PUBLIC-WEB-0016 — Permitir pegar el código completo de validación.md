# TASK-PUBLIC-WEB-0016 — Permitir pegar el código completo de validación

## Objetivo

Modificar el componente de ingreso del código de validación para permitir que el usuario pueda pegar el código completo de 6 dígitos en el primer campo.

Actualmente, cuando el usuario copia el código completo y lo pega en el primer casillero, solamente se ingresa el primer dígito y los otros cinco campos permanecen vacíos.

## Comportamiento esperado

Si el usuario copia un código completo de 6 dígitos, por ejemplo:

```text
126829
```

y lo pega en el primer casillero, el frontend debe distribuir automáticamente los seis dígitos entre los seis campos.

Resultado esperado:

```text
[1] [2] [6] [8] [2] [9]
```

No debe ser necesario que el usuario pegue cada dígito individualmente.

## Reglas

El comportamiento debe funcionar cuando:

- El código completo se pega en el primer casillero.
- El código contiene exactamente 6 dígitos.
- El usuario copia el código desde el email.
- El usuario utiliza `Ctrl + V`.
- El usuario utiliza el mecanismo de pegado disponible en el dispositivo.

Los seis campos deben quedar correctamente completados.

Después de pegar el código completo, el comportamiento existente para enviar o validar el código debe continuar funcionando normalmente.

## Validación

El componente debe mantener las reglas existentes para el código:

- Exactamente 6 dígitos.
- Solamente caracteres numéricos.

Si el contenido pegado no corresponde a un código válido, no debe generar un estado inconsistente en los seis campos.

## Consideraciones de UX

Luego de pegar el código completo:

- Los seis dígitos deben quedar visibles.
- El foco debe quedar en una posición coherente con el flujo actual.
- No debe ser necesario volver a escribir ninguno de los dígitos.
- No debe modificarse el comportamiento normal cuando el usuario ingresa los dígitos uno por uno.

## Restricciones

Esta Task modifica exclusivamente el comportamiento de ingreso y pegado del código en el frontend.

No modificar:

- El endpoint de validación.
- El contrato de la API.
- La generación del código.
- La duración del código.
- La lógica de validación del backend.
- El formato del email.
- La navegación existente.

## Contexto obligatorio

Antes de comenzar, leer:

- `project.md`
- `public-web-architecture.md`
- `frontend-public-web-stack-technology.md`
- `frontend-coding-rules.md`
- `pages.md`
- `components.md`
- `endpoints.md`
- `communication.md`
- La Epic correspondiente.
- La User Story correspondiente.

Leer además la implementación actual del componente de ingreso del código de validación.

## Criterio de finalización

La Task se considera finalizada cuando:

1. El usuario puede pegar un código completo de 6 dígitos en el primer campo.
2. Los seis dígitos se distribuyen automáticamente entre los seis campos.
3. El código queda listo para ser enviado al backend.
4. El ingreso manual de los dígitos uno por uno continúa funcionando.
5. Los códigos que no cumplen las reglas existentes no generan un estado inconsistente.
6. No se modificó el contrato de la API.
7. El flujo de validación existente continúa funcionando correctamente.

---

## Resultado de ejecución

### Trabajo realizado

1. **Agregado `handlePaste` en `VerifyEmailPage`**
   - Intercepta el evento `onPaste` de cada input OTP.
   - Extrae solo dígitos del texto pegado.
   - Limita a 6 caracteres máximo.
   - Distribuye los dígitos entre los seis campos actualizando el estado `otp` completo.
   - Enfoca el último campo lleno (o el último campo si se pegaron 6 dígitos).

2. **Validación**
   - Si el contenido pegado no contiene dígitos válidos, no modifica el estado.
   - El ingreso manual uno por uno continúa funcionando sin cambios.

3. **UX**
   - Después de pegar, los 6 dígitos quedan visibles en sus campos correspondientes.
   - El foco se posiciona en el último campo lleno, coherente con el flujo actual.

### Criterios verificados

- [x] 1. El usuario puede pegar un código completo de 6 dígitos en el primer campo.
- [x] 2. Los seis dígitos se distribuyen automáticamente entre los seis campos.
- [x] 3. El código queda listo para ser enviado al backend.
- [x] 4. El ingreso manual de los dígitos uno por uno continúa funcionando.
- [x] 5. Los códigos que no cumplen las reglas existentes no generan un estado inconsistente.
- [x] 6. No se modificó el contrato de la API.
- [x] 7. El flujo de validación existente continúa funcionando correctamente.

### Archivos modificados

- `public-web/public-web/pages/verify-email-page.tsx`