# TASK-DASH-0003 — Implementar pantalla de validación del código de recuperación

## Objetivo

Implementar la pantalla del Dashboard administrativo que permite ingresar y validar el código numérico de recuperación recibido por email.

La implementación debe utilizar como referencia visual:

`verify-code-dashboard-template.html`

El flujo debe reutilizar el mecanismo de recuperación de contraseña existente en el Backend.

---

## Alcance

La pantalla debe permitir:

- Ingresar el código de recuperación de 6 dígitos.
- Validar que el código tenga exactamente 6 dígitos numéricos.
- Enviar el código al Backend.
- Mostrar el estado de procesamiento.
- Manejar códigos inválidos o expirados.
- Continuar hacia el cambio de contraseña cuando el código sea válido.
- Permitir solicitar nuevamente un código cuando corresponda.
- Mostrar el tiempo de expiración informado por el Backend.
- Volver al paso anterior para modificar el email.

---

## Template

La implementación debe tomar como referencia:

```text
verify-code-dashboard-template.html
```

Debe respetarse, siempre que sea posible:

- Estructura visual.
- Distribución.
- Tipografía.
- Espaciado.
- Campos.
- Botones.
- Estados visuales.
- Mensajes.
- Jerarquía de información.

No modificar arbitrariamente el diseño definido por el template.

---

## Código

El formulario debe contener un único código de recuperación:

```text
123456
```

El código debe:

- Ser obligatorio.
- Contener exactamente 6 caracteres.
- Aceptar únicamente dígitos.
- Rechazar letras.
- Rechazar espacios.
- Rechazar códigos con longitud diferente de 6.

La validación del frontend no reemplaza la validación realizada por el Backend.

El Backend continúa siendo la autoridad final para determinar si el código es válido.

---

## Flujo

El flujo esperado es:

```text
Ingresar email
      │
      ▼
Solicitud de recuperación
      │
      ▼
Email enviado
      │
      ▼
Ingresar código
      │
      ▼
Backend
      │
      ├── Validar código
      ├── Verificar expiración
      └── Validar estado
      │
      ▼
Autorización temporal
      │
      ▼
Cambiar contraseña
```

La pantalla no debe validar criptográficamente el código.

No debe conocer ni reproducir el algoritmo de hashing utilizado por el Backend.

---

## Endpoint

Debe utilizarse el endpoint existente para validar el código de recuperación.

No crear un endpoint administrativo duplicado si el endpoint existente puede resolver el flujo.

Antes de implementar, verificar en `endpoints.md` el contrato real:

- Método HTTP.
- URL.
- Request DTO.
- Response DTO.
- Códigos HTTP.
- Estructura de errores.
- Información necesaria para continuar con el cambio de contraseña.

No asumir un contrato que no exista en el Backend.

---

## Estado del código

La pantalla debe contemplar como mínimo:

```text
Código pendiente
      │
      ├── Código válido
      │       ↓
      │   Continuar
      │
      ├── Código inválido
      │       ↓
      │   Mostrar error
      │
      └── Código expirado
              ↓
          Permitir solicitar otro
```

No debe permitirse continuar al cambio de contraseña cuando el Backend rechaza el código.

---

## Temporizador

Si el Backend proporciona información sobre la expiración del código, el Dashboard debe mostrar el tiempo restante de acuerdo con el diseño.

El temporizador debe ser una representación visual del estado recibido del Backend.

No debe considerarse el temporizador del frontend como mecanismo de seguridad.

La expiración real debe continuar siendo validada por el Backend.

Cuando el código expire:

- El usuario debe recibir una indicación clara.
- No debe poder validarse exitosamente un código expirado.
- Debe poder solicitar un nuevo código mediante el flujo correspondiente.

---

## Reenvío del código

Si el Backend permite reenviar un código:

- Debe existir la opción correspondiente según el template.
- Debe utilizarse el endpoint existente.
- Debe respetarse el rate limiting implementado por el Backend.
- El frontend debe impedir solicitudes accidentales duplicadas cuando corresponda.
- No debe intentar generar el código localmente.

El nuevo código reemplazará funcionalmente al anterior según las reglas del Backend.

---

## Seguridad

El frontend nunca debe:

- Generar códigos de recuperación.
- Hashear códigos.
- Almacenar códigos en texto plano de manera persistente.
- Registrar códigos en logs.
- Mostrar el código en mensajes de depuración.
- Determinar localmente si un código es correcto.
- Crear autorización para cambiar la contraseña por su cuenta.

La autorización temporal para cambiar la contraseña debe provenir del Backend.

---

## Información necesaria para continuar

Cuando el código sea validado correctamente, el Backend puede devolver la información necesaria para autorizar el cambio de contraseña.

El frontend debe utilizar únicamente el contrato definido por el Backend.

Si se devuelve un token temporal de autorización:

- No debe tratarse como JWT.
- No debe utilizarse como Access Token.
- No debe enviarse a endpoints diferentes del flujo de recuperación.
- No debe incluirse en logs.
- No debe exponerse innecesariamente en la interfaz.

El mecanismo exacto debe respetar la implementación existente de `PasswordResetAuthorizationService`.

---

## Manejo de errores

La pantalla debe utilizar el mecanismo global de manejo de errores existente.

Debe contemplar como mínimo:

- Código inválido.
- Código expirado.
- Solicitud demasiado frecuente.
- Error de comunicación con el Backend.
- Error inesperado.

No deben mostrarse:

- Stack traces.
- Excepciones internas.
- Información de infraestructura.
- Hashes.
- Tokens.
- Información sensible.

---

## Estado de carga

Mientras se valida el código:

- Deshabilitar el botón.
- Evitar solicitudes simultáneas.
- Mostrar el estado de carga definido por el diseño.
- Restaurar la posibilidad de interacción cuando termine la solicitud.

---

## Navegación

El flujo debe permitir:

```text
Ingresar email
      │
      ▼
Ingresar código
      │
      ├── Código válido
      │       ↓
      │   Nueva contraseña
      │
      └── Volver
              ↓
          Ingresar email
```

La navegación debe respetar las rutas definidas por la arquitectura del Dashboard.

No debe existir navegación hacia:

- Registro.
- Google Login.
- Administración de usuarios.

---

## Recuperación sin sesión

El usuario no necesita estar autenticado para validar el código de recuperación.

No debe requerirse:

- Access Token.
- Refresh Token.
- Sesión administrativa.

El mecanismo de autorización temporal generado durante la recuperación es independiente de la sesión normal.

---

## Integración con el Backend

Reutilizar:

- Cliente HTTP existente.
- Endpoint existente.
- DTOs existentes.
- Manejo global de errores.
- Configuración de API.
- Servicios compartidos del Dashboard.

No crear una segunda infraestructura HTTP para recuperación.

---

## Componentización

Seguir las reglas de arquitectura y componentización del Dashboard.

Separar adecuadamente:

- Presentación.
- Validación del formulario.
- Comunicación con API.
- Estado de recuperación.
- Navegación.

Reutilizar componentes existentes cuando corresponda.

No crear abstracciones genéricas innecesarias.

---

## Documentación obligatoria

Antes de implementar esta task, revisar:

- `project.md`
- `communication.md`
- `frontend-dashboard-stack-technology.md`
- `frontend-coding-rules.md`
- `dashboard-architecture.md`
- `pages.md`
- `components.md`
- `endpoints.md`
- `services.md`
- `epic-01.md`

También revisar la implementación existente de:

- Password reset.
- Código de recuperación.
- Expiración.
- Reenvío.
- Autorización temporal.
- Manejo global de errores.

---

## Documentación a actualizar

Evaluar la actualización de:

```text
project/pages.md
project/components.md
project/endpoints.md
```

Si se incorpora un servicio específico del Dashboard para la validación del código, documentarlo en el artefacto correspondiente.

No documentar códigos reales ni tokens de autorización.

---

## Criterios de aceptación

### CA-01 — Visualización

**Dado** que el usuario solicita recuperar su contraseña

**Cuando** accede al paso de validación

**Entonces** debe visualizar la pantalla basada en `verify-code-dashboard-template.html`.

### CA-02 — Código obligatorio

**Dado** que el código está vacío

**Cuando** intenta continuar

**Entonces** el formulario debe considerarse inválido.

### CA-03 — Código numérico

**Dado** un código que contiene caracteres no numéricos

**Cuando** el usuario intenta validarlo

**Entonces** no debe enviarse la solicitud al Backend.

### CA-04 — Longitud

**Dado** un código con menos o más de 6 dígitos

**Cuando** el usuario intenta validarlo

**Entonces** el formulario debe considerarse inválido.

### CA-05 — Código válido

**Dado** un código válido y no expirado

**Cuando** se envía al Backend

**Entonces** el usuario debe poder continuar con el cambio de contraseña.

### CA-06 — Código inválido

**Dado** un código incorrecto

**Cuando** se envía al Backend

**Entonces** debe mostrarse el error correspondiente y no debe permitirse continuar.

### CA-07 — Código expirado

**Dado** un código expirado

**Cuando** se envía al Backend

**Entonces** debe rechazarse la operación y debe informarse al usuario de manera apropiada.

### CA-08 — Reenvío

**Dado** que el código expiró o el usuario necesita solicitar otro

**Cuando** utiliza la opción de reenvío

**Entonces** debe utilizarse el mecanismo existente del Backend.

### CA-09 — Rate limiting

El frontend debe respetar las respuestas de rate limiting del Backend y no intentar evadirlas mediante solicitudes adicionales.

### CA-10 — Sin sesión

El proceso debe funcionar sin Access Token ni sesión autenticada.

### CA-11 — Seguridad

El frontend no debe generar, hashear ni persistir códigos de recuperación.

### CA-12 — Autorización temporal

Si el Backend devuelve un token temporal para el cambio de contraseña:

- Debe conservarse únicamente durante el flujo necesario.
- No debe tratarse como JWT.
- No debe enviarse a endpoints ajenos al proceso.
- No debe exponerse en logs.

### CA-13 — Estado de carga

Mientras se procesa la validación:

- El botón debe quedar deshabilitado.
- No deben enviarse solicitudes duplicadas.
- Debe mostrarse el estado visual correspondiente.

### CA-14 — Error de comunicación

Ante un error de comunicación:

- Debe mostrarse un mensaje apropiado.
- El usuario debe poder volver a intentar.
- No deben exponerse detalles técnicos.

### CA-15 — Sin registro

La pantalla no debe ofrecer registro.

### CA-16 — Sin Google

La pantalla no debe ofrecer autenticación mediante Google.

### CA-17 — Compilación

El Dashboard debe compilar correctamente sin errores ni warnings nuevos relacionados con esta implementación.

---

## Fuera de alcance

Esta task no incluye:

- Generación de códigos.
- Hashing de códigos.
- Persistencia de códigos.
- Envío de emails.
- Implementación del Backend.
- Cambio de contraseña.
- Invalidación de Refresh Tokens.
- Login.
- Registro.
- Gestión de usuarios.
- Gestión de roles.

---

## Resultado esperado

El Dashboard debe permitir completar correctamente el segundo paso de recuperación:

```text
Ingresar email
      ↓
Recibir código
      ↓
Ingresar código de 6 dígitos
      ↓
Validar código
      ↓
Autorización temporal
      ↓
Cambiar contraseña
```

La validación real del código debe permanecer completamente bajo responsabilidad del Backend.

---

# Reporte de implementación

Al finalizar la implementación, reportar:

## Implementación

- Componentes creados o modificados:
  - `dashboard/pages/verify-recovery-code-page.tsx` creado.
  - `dashboard/features/authentication/components/otp-inputs.tsx` creado.
  - `dashboard/features/authentication/schemas/verify-code.schema.ts` creado.
- Servicios creados o modificados: `auth.service.ts` (métodos `validatePasswordResetCode` y `resendPasswordResetCode`).
- Modelos o DTOs utilizados: `VerifyCodeFormData`, `ValidatePasswordResetCodeResponse`, `ResendPasswordResetCodeResponse`.
- Rutas agregadas o modificadas: `GET /verify-recovery-code` agregada en `routes.tsx`.
- Endpoint utilizado: `POST /api/users/validate-password-reset-code`.

## Formulario

- Validaciones implementadas: Zod valida código exactamente 6 dígitos numéricos.
- Restricciones aplicadas al código: solo números, longitud fija 6, rechazo de letras y espacios.
- Estado de carga: botón deshabilitado durante envío, texto "Verificando...".
- Comportamiento ante solicitudes duplicadas: controlado por `isSubmitting`.

## Integración Backend

- Endpoint utilizado: `POST /api/users/validate-password-reset-code`.
- Método HTTP: POST.
- Request enviado: `{ email, code }`.
- Response recibido: `{ authorizationToken }`.
- Autorización temporal conservada: se pasa por `state` de React Router a `/reset-password`.
- Continuación hacia cambio de contraseña: navegación a `/reset-password` con `state: { email, authorizationToken }`.

## Temporizador y expiración

- Backend devuelve `expiresInMinutes` en la respuesta de `forgot-password` y `resend-password-reset-code`.
- Tiempo restante mostrado: temporizador visual en formato `MM:SS` basado en `expiresInMinutes`.
- Cuando el temporizador llega a cero: se muestra `00:00`, el código queda como expirado; el backend es la autoridad final.
- El temporizador frontend no es mecanismo de seguridad; la expiración real se valida en el backend.

## Reenvío

- Endpoint utilizado: `POST /api/users/resend-password-reset-code`.
- Comportamiento ante reenvío: genera nuevo código, invalida anterior, actualiza temporizador.
- Manejo del rate limiting: el backend controla límites; el frontend respeta la respuesta.
- Comportamiento visual: botón "Reenviar código" deshabilitado durante la solicitud.

## Seguridad

- No se generan códigos en frontend.
- No se hashean códigos en frontend.
- No se registran códigos en consola.
- No se exponen tokens temporales en UI.
- No se utilizan Access Tokens para este flujo.
- El backend continúa siendo la autoridad para validar el código.

## Navegación

- Ruta de recuperación: `/forgot-password`.
- Ruta de validación: `/verify-recovery-code`.
- Ruta de cambio de contraseña: `/reset-password`.
- Comportamiento al volver al paso anterior: botón de back o logo navegan a `/forgot-password`.
- Comportamiento ante código inválido: mensaje inline "Código inválido o vencido."
- Comportamiento ante código expirado: mismo mensaje genérico; el backend no distingue entre inválido y expirado.

## Template

- Elementos de `verify-code-dashboard-template.html` implementados: estructura completa, header NEPS, card centrada, icono, título, email enmascarado, componente `OtpInputs` de 6 recuadros, botón "Verificar Código", temporizador, botón "Reenviar código", footer, glows de fondo.
- No fue necesario modificar el template; se reprodujo fielmente en React/Tailwind.

## Documentación

- `project/pages.md` actualizado con `/verify-recovery-code`.
- `project/components.md` actualizado con `OtpInputs`.

## Compilación

- Comando utilizado: `npm run build`.
- Resultado: exitoso.
- Errores: 0.
- Warnings: 0.

## Problemas encontrados

- No se encontraron inconsistencias entre el template, el contrato del backend y la arquitectura.
- Los endpoints de validación y reenvío ya estaban disponibles y respetan el contrato documentado.