# TASK-API-0043 — Modificar template de email de recuperación de contraseña

## Objetivo

Modificar el template del correo electrónico de recuperación de contraseña para que el código de 6 dígitos se muestre en una línea separada, debajo del texto "TU CÓDIGO DE RECUPERACIÓN".

## Formato actual

```text
TU CÓDIGO DE RECUPERACIÓN 624054
```

## Formato esperado

```text
TU CÓDIGO DE RECUPERACIÓN
624054
```

El código debe visualizarse claramente separado del texto, en su propia línea.

## Contexto

El Frontend Public Web Agent requiere este cambio porque el usuario final reporta dificultades de lectura en el formato actual. El código de 6 dígitos debe visualizarse de forma clara y separada para mejorar la experiencia de usuario durante el flujo de recuperación de contraseña.

## Endpoints afectados

- `POST /api/users/forgot-password`
- `POST /api/users/resend-password-reset-code`

Ambos endpoints envían el código de recuperación por email utilizando el mismo template.

## Restricciones

- No modificar la lógica de generación, expiración o validación del código.
- No modificar el contrato de la API.
- Solo modificar el template de email.
- El código debe continuar mostrándose claramente, sin enmascaramiento.

## Criterios de aceptación

1. El correo muestra "TU CÓDIGO DE RECUPERACIÓN" en una línea.
2. El código de 6 dígitos se muestra en la línea siguiente, separado visualmente.
3. El resto del contenido del correo se mantiene igual.
4. No se modifican contratos de API ni lógica de negocio.

## Generado por

Frontend Public Web Agent

## Asignado a

Backend Agent

---

## Resultado de la ejecución

### Cambios realizados

**Template HTML (`Api/EmailTemplates/password-reset.html`)**
- Se cambió el texto del label a `TU CÓDIGO DE RECUPERACIÓN` (mayúsculas).
- Se aumentó el `margin-bottom` del label de `24px` a `32px` para separarlo visualmente del código.
- Se ajustó el `line-height` del código de `1` a `1.2` para mayor legibilidad.

**Template TXT (`Api/EmailTemplates/password-reset.txt`)**
- Se cambió el texto del label a `TU CÓDIGO DE RECUPERACIÓN` (mayúsculas).
- Se mantuvo la línea vacía entre el label y el código para asegurar la separación en clientes de texto plano.

### Verificación

- `Api` compila correctamente.
- No se modificaron contratos de API.
- No se modificó lógica de negocio.
- Solo se modificaron los archivos de template de email.
