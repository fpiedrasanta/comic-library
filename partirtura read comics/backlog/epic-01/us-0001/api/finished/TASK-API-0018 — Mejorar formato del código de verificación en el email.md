# TASK-API-0018 — Mejorar formato del código de verificación en el email

## Objetivo

Modificar el formato visual del código de verificación enviado por email para que el texto descriptivo y el código aparezcan en líneas separadas.

Actualmente el correo se recibe mostrando:

**Tu código de verificación** **126829**

El formato esperado es:

**Tu código de verificación**

**126829**

El código debe aparecer visualmente separado del texto descriptivo y centrado respecto del contenido del mensaje, de manera que sea fácil de identificar y copiar.

## Comportamiento esperado

El contenido debe mostrar:

```text
Tu código de verificación

126829
```

El código debe conservar:

- Los 6 dígitos numéricos.
- El formato destacado actualmente utilizado.
- La posibilidad de copiarlo fácilmente.

No modificar la generación del código ni su validación.

## Restricciones

Esta Task modifica exclusivamente la presentación del código dentro del email.

No modificar:

- La generación del código.
- La duración del código.
- La validación del código.
- El endpoint de validación.
- El contrato de la API.
- El flujo de registro.
- La lógica del frontend.

## Contexto obligatorio

Antes de comenzar, leer:

- `project.md`
- `backend-architecture.md`
- `backend-stack-technology.md`
- `backend-coding-rules.md`
- `domain.md`
- `services.md`
- `repositories.md`
- `endpoints.md`
- `communication.md`
- La Epic correspondiente.
- La User Story correspondiente.

Leer además:

- El template HTML del email de validación.
- El template de texto plano del email de validación.
- La implementación actual del servicio de envío de email.

## Criterio de finalización

La Task se considera finalizada cuando:

1. El texto "Tu código de verificación" aparece en una línea independiente.
2. El código aparece en una línea independiente.
3. El código aparece visualmente destacado.
4. El código se mantiene como un número de exactamente 6 dígitos.
5. El cambio se aplica al contenido HTML del email.
6. El contenido de texto plano continúa siendo legible y mantiene la separación entre el texto y el código.
7. No se modificó ninguna funcionalidad relacionada con la generación o validación del código.

---

## Resultado de la ejecución

### Cambios realizados

**Template HTML (`Api/EmailTemplates/validation-mail-body.html`)**
- Se aumentó el `margin-bottom` del label "Tu código de verificación" de `8px` a `24px` para separar visualmente el texto descriptivo del código.
- El código continúa dentro del mismo `div` con borde punteado, preservando el formato destacado.

**Template texto plano (`Api/EmailTemplates/validation-mail-body.txt`)**
- Se separó el texto y el código en líneas independientes.
- Antes: `Tu código de verificación es: {{code}}`
- Ahora:
  ```text
  Tu código de verificación

  {{code}}
  ```

### Verificación

- No se modificó lógica de generación, validación, endpoints ni servicios.
- No se requirió actualización de documentación adicional.
- La compilación de `Application` e `Infrastructure` continúa siendo correcta.
