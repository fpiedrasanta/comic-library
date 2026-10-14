# TASK-PUBLIC-WEB-0014 — Mostrar temporizador de expiración del código de validación

## Objetivo

Mostrar en la pantalla de validación de código el tiempo restante que tiene el usuario para ingresar el código recibido por email.

Actualmente el backend devuelve en la respuesta la información necesaria para conocer el tiempo disponible, pero el frontend no está mostrando el temporizador.

## Comportamiento esperado

Al ingresar a la pantalla para validar el código, el frontend debe utilizar la información recibida desde el backend para iniciar un temporizador.

El temporizador debe mostrar al usuario cuánto tiempo resta para ingresar el código.

Ejemplo:

```text
El código vence en 60 segundos.
```

Luego:

```text
El código vence en 59 segundos.
```

```text
El código vence en 58 segundos.
```

Y así sucesivamente hasta llegar a:

```text
El código vence en 0 segundos.
```

## Fuente de información

El tiempo de expiración debe obtenerse exclusivamente de la respuesta del backend.

No hardcodear el valor:

```text
60
```

El frontend debe utilizar el valor recibido por la API.

Esto es importante porque el backend puede utilizar posteriormente una duración diferente.

## Finalización del temporizador

Cuando el temporizador llegue a `0`:

- No debe continuar decrementando.
- Debe mostrar claramente que el código expiró.
- El usuario no debe poder interpretar que todavía dispone de tiempo para utilizarlo.
- Debe mantenerse disponible la opción de solicitar un nuevo código, si dicha funcionalidad ya forma parte del flujo.

## Reenvío del código

Cuando el usuario solicite reenviar el código y el backend devuelva una nueva respuesta con un nuevo tiempo de expiración:

1. El frontend debe reiniciar el temporizador.
2. Debe utilizar el nuevo tiempo recibido.
3. No debe continuar utilizando el tiempo del código anterior.

Ejemplo:

```text
Código anterior:
60 → 59 → 58 → ... → 0

Usuario solicita nuevo código.

Backend responde:
60 segundos

Nuevo temporizador:
60 → 59 → 58 → ...
```

## Navegación

El temporizador debe funcionar correctamente independientemente de que el usuario:

- Ingrese inicialmente a la pantalla.
- Llegue a la pantalla después del registro.
- Solicite un nuevo código.

No modificar el flujo de navegación existente.

## Restricciones

No modificar:

- El endpoint del backend.
- El contrato de la API.
- La generación del código.
- La duración del código.
- La lógica de validación del backend.

Si la información necesaria para implementar el temporizador no se encuentra realmente disponible en la respuesta del backend, no modificar unilateralmente el contrato.

En ese caso, registrar el bloqueo en la Task y generar una nueva Task dirigida a `api` explicando exactamente qué información necesita el frontend.

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

Leer además la implementación actual de:

- Pantalla de ingreso del código.
- Consumo del endpoint de registro.
- Consumo del endpoint de reenvío del código, si ya existe.
- Manejo de la respuesta del backend.

## Criterio de finalización

La Task se considera finalizada cuando:

1. El temporizador se muestra en la pantalla de validación.
2. El valor inicial proviene de la respuesta del backend.
3. El temporizador decrementa correctamente cada segundo.
4. El temporizador llega a `0` y se detiene.
5. El usuario puede identificar claramente cuándo el código expiró.
6. Al solicitar un nuevo código, el temporizador se reinicia utilizando el nuevo valor recibido desde el backend.
7. No existe ningún valor de tiempo hardcodeado en el frontend.
8. No se modificó el contrato de la API.
9. El comportamiento existente de validación del código continúa funcionando correctamente.

---

## Resultado de ejecución

### Trabajo realizado

1. **Texto visible del temporizador**
   - Agregado un texto encima del formulario OTP en `VerifyEmailPage`.
   - Muestra: `El código vence en X segundos.` mientras `timeLeft > 0`.
   - Muestra: `El código ha expirado.` cuando `timeLeft === 0`.

2. **Fuente de información**
   - El valor inicial sigue siendo `expiresInMinutes` recibido en `location.state` desde el backend (registro).
   - No se hardcodeó ningún valor.

3. **Decremento**
   - Ya estaba implementado con `setInterval` de 1 segundo. Se mantiene sin cambios.

4. **Llegada a 0**
   - Ya estaba implementado: detiene el intervalo y marca `isCodeExpired = true`. Se mantiene.

5. **Reenvío**
   - `handleResend` ya reinicia `timeLeft` con `payload.expiresInMinutes * 60` y recrea el intervalo.
   - El botón de reenvío muestra:
     - `Reenviar (formatTime(timeLeft))` mientras queda tiempo.
     - `Reenviar código` cuando expiró.

6. **Sin cambios en API ni contratos**

### Criterios verificados

- [x] 1. El temporizador se muestra en la pantalla de validación.
- [x] 2. El valor inicial proviene de la respuesta del backend.
- [x] 3. El temporizador decrementa correctamente cada segundo.
- [x] 4. El temporizador llega a `0` y se detiene.
- [x] 5. El usuario puede identificar claramente cuándo el código expiró.
- [x] 6. Al solicitar un nuevo código, el temporizador se reinicia utilizando el nuevo valor recibido desde el backend.
- [x] 7. No existe ningún valor de tiempo hardcodeado en el frontend.
- [x] 8. No se modificó el contrato de la API.
- [x] 9. El comportamiento existente de validación del código continúa funcionando correctamente.

### Archivos modificados

- `public-web/public-web/pages/verify-email-page.tsx`