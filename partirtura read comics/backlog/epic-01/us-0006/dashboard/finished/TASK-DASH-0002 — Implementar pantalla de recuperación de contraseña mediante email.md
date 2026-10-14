# TASK-DASH-0002 — Implementar pantalla de recuperación de contraseña mediante email

## Objetivo

Implementar la pantalla del Dashboard administrativo que permite iniciar el proceso de recuperación de contraseña mediante el ingreso del email del usuario.

La implementación debe utilizar como referencia visual:

`put-your-mail-dashboard-template.html`

El flujo debe reutilizar el mecanismo de recuperación de contraseña existente en el Backend y no debe implementar un mecanismo paralelo exclusivo para administradores.

---

## Alcance

La pantalla debe permitir:

- Ingresar el email asociado a la cuenta.
- Validar el formato del email.
- Solicitar el inicio del proceso de recuperación.
- Mostrar el estado de procesamiento.
- Manejar correctamente la respuesta del Backend.
- Navegar hacia la pantalla de ingreso del código de recuperación.
- Volver al Login.
- Mostrar errores de validación o comunicación de acuerdo con el mecanismo global del Dashboard.

---

## Template

La implementación debe tomar como referencia:

```text
put-your-mail-dashboard-template.html
```

Debe respetarse, siempre que sea posible:

- Estructura visual.
- Distribución.
- Tipografía.
- Espaciado.
- Textos.
- Botones.
- Estados visuales.
- Jerarquía de información.

No modificar arbitrariamente el diseño definido por el template.

---

## Formulario

El formulario debe contener:

```text
Email
```

El campo debe:

- Ser obligatorio.
- Validar formato de email.
- Permitir ingresar el email de la cuenta.
- Mostrar una validación apropiada cuando el formato sea incorrecto.

El botón para continuar debe permanecer deshabilitado mientras el formulario sea inválido.

---

## Flujo

El flujo esperado es:

```text
Dashboard Login
      │
      ▼
¿Olvidaste tu contraseña?
      │
      ▼
Ingresar email
      │
      ▼
Backend API
      │
      ├── Solicitar recuperación
      ├── Generar código
      ├── Persistir código
      └── Enviar email
      │
      ▼
Pantalla de código
```

La pantalla no debe generar códigos localmente.

La generación, persistencia, expiración y envío del código son responsabilidades del Backend.

---

## Endpoint

Debe utilizarse el endpoint existente de recuperación de contraseña.

No crear un endpoint administrativo duplicado como:

```text
/api/admin/password-reset
```

si el endpoint existente puede utilizarse para resolver el flujo.

Antes de implementar, verificar en `endpoints.md` el contrato real:

- Método HTTP.
- URL.
- Request DTO.
- Response DTO.
- Códigos HTTP.
- Estructura de errores.
- Información de expiración retornada por el Backend.

No asumir un contrato que no exista en el Backend.

---

## Seguridad y enumeración de usuarios

El frontend debe respetar el comportamiento genérico del Backend.

No debe intentar determinar si:

- El email existe.
- El email no existe.
- El usuario es administrador.
- El usuario no es administrador.

La respuesta visual debe basarse únicamente en el contrato proporcionado por el Backend.

No implementar lógica que permita enumerar usuarios desde el Dashboard.

---

## Usuarios no administradores

La recuperación de contraseña no debe otorgar privilegios administrativos.

Si el usuario no posee el rol `Administrator`, el flujo de recuperación no debe modificar su rol.

El frontend no debe:

- Agregar el rol `Administrator`.
- Modificar roles.
- Enviar información de roles al endpoint de recuperación.
- Determinar privilegios mediante datos manipulables desde el cliente.

La autorización administrativa continúa siendo responsabilidad del Backend.

---

## Código de recuperación

Después de solicitar correctamente la recuperación:

- El usuario debe ser dirigido a la pantalla correspondiente al ingreso del código.
- La navegación debe utilizar la pantalla:

```text
verify-code-dashboard-template.html
```

Si el Backend devuelve información necesaria para continuar el flujo, ésta debe conservarse utilizando el mecanismo definido por la arquitectura.

No almacenar códigos de recuperación en texto plano innecesariamente.

El código recibido por email será ingresado posteriormente por el usuario en la pantalla correspondiente.

---

## Estado de carga

Mientras se procesa la solicitud:

- Deshabilitar el botón.
- Evitar múltiples solicitudes simultáneas.
- Mostrar el estado de carga definido por el diseño.
- Restaurar el formulario si ocurre un error.

El usuario debe poder volver a intentar la operación cuando corresponda.

---

## Manejo de errores

La pantalla debe utilizar el mecanismo global de manejo de errores existente.

No duplicar lógica global de errores.

Los mensajes mostrados al usuario no deben exponer:

- Excepciones internas.
- Stack traces.
- Información de infraestructura.
- Tokens.
- Códigos de recuperación.
- Información sensible.

Cuando el Backend utilice respuestas genéricas para evitar enumeración de usuarios, el frontend debe conservar ese comportamiento.

---

## Navegación

La pantalla debe contemplar:

```text
Login
  │
  └── ¿Olvidaste tu contraseña?
          │
          ▼
     Ingresar email
          │
          ▼
     Código de recuperación
```

Debe existir una forma de volver al Login.

No debe existir navegación hacia:

- Registro.
- Google Login.
- Administración de usuarios.

---

## Sesión existente

La recuperación de contraseña no debe requerir una sesión autenticada.

El flujo debe poder iniciarse desde el Login del Dashboard.

No asumir que existe un Access Token válido.

No utilizar el Refresh Token como mecanismo de autorización del proceso de recuperación.

---

## Integración con el Backend

La implementación debe reutilizar:

- Endpoint existente de recuperación.
- DTO existente.
- Cliente HTTP existente.
- Manejo global de errores existente.
- Configuración de API existente.
- Servicios compartidos del Dashboard cuando corresponda.

No crear una segunda infraestructura HTTP exclusivamente para recuperación de contraseña.

---

## Componentización

Seguir las reglas de arquitectura y componentización del Dashboard.

La pantalla debe mantener separadas:

- Presentación.
- Validación del formulario.
- Comunicación con API.
- Navegación.

Reutilizar componentes existentes cuando sea apropiado.

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

- Recuperación de contraseña.
- Generación de códigos.
- Expiración.
- Envío de emails.
- Validación de códigos.
- Manejo global de errores.

---

## Documentación a actualizar

Evaluar la actualización de:

```text
project/pages.md
project/components.md
project/endpoints.md
```

Si se incorpora un servicio específico del Dashboard para recuperación de contraseña, documentarlo en el artefacto correspondiente.

No documentar códigos reales ni información sensible.

---

## Criterios de aceptación

### CA-01 — Visualización

**Dado** que el usuario selecciona recuperar su contraseña desde Login

**Cuando** accede a la pantalla

**Entonces** debe visualizar la pantalla basada en `put-your-mail-dashboard-template.html`.

### CA-02 — Campo email

La pantalla debe permitir ingresar un email.

### CA-03 — Email obligatorio

**Dado** que el email está vacío

**Cuando** el usuario intenta continuar

**Entonces** el formulario debe considerarse inválido.

### CA-04 — Email inválido

**Dado** que el email no posee un formato válido

**Cuando** el usuario intenta continuar

**Entonces** no debe enviarse la solicitud al Backend.

### CA-05 — Solicitud de recuperación

**Dado** un email válido

**Cuando** el usuario solicita recuperar su contraseña

**Entonces** debe invocarse el endpoint existente de recuperación.

### CA-06 — Navegación al código

**Dado** que la solicitud fue procesada correctamente

**Entonces** el usuario debe poder continuar hacia la pantalla de ingreso del código de recuperación.

### CA-07 — Sin enumeración

**Dado** un email que puede o no existir

**Cuando** el Backend responde

**Entonces** el frontend no debe revelar información adicional que permita determinar la existencia de la cuenta.

### CA-08 — Usuario no administrador

**Dado** un usuario sin rol `Administrator`

**Cuando** utiliza el proceso de recuperación

**Entonces** el frontend no debe modificar ni solicitar modificaciones de su rol.

### CA-09 — Sin sesión

El proceso debe poder iniciarse sin un usuario autenticado.

### CA-10 — Estado de carga

Mientras se procesa la solicitud:

- El botón debe quedar deshabilitado.
- No deben enviarse solicitudes duplicadas.
- Debe mostrarse el estado visual correspondiente.

### CA-11 — Error

Ante un error del Backend o de comunicación:

- Debe mostrarse un mensaje apropiado.
- El formulario debe poder volver a utilizarse.
- No deben exponerse detalles técnicos.

### CA-12 — Sin registro

La pantalla no debe ofrecer ninguna opción para registrar usuarios.

### CA-13 — Sin Google

La pantalla no debe ofrecer autenticación mediante Google.

### CA-14 — Compilación

El Dashboard debe compilar correctamente sin errores ni warnings nuevos relacionados con esta implementación.

---

## Fuera de alcance

Esta task no incluye:

- Generación de códigos de recuperación.
- Hashing de códigos.
- Persistencia de códigos.
- Envío de emails.
- Validación del código.
- Cambio de contraseña.
- Invalidación de Refresh Tokens.
- Implementación del Backend.
- Login.
- Registro.
- Administración de usuarios.
- Gestión de roles.

Estas funcionalidades pertenecen a otras tasks.

---

## Resultado esperado

El Dashboard debe disponer de una pantalla funcional para iniciar la recuperación de contraseña:

```text
Login
  ↓
¿Olvidaste tu contraseña?
  ↓
Ingresar email
  ↓
Solicitar recuperación
  ↓
Pantalla de código
```

El flujo debe reutilizar completamente el mecanismo existente del Backend y mantener las reglas de seguridad de recuperación de contraseña.

---

# Reporte de implementación

Al finalizar la implementación, reportar:

## Implementación

- Componentes creados o modificados:
  - `dashboard/pages/forgot-password-page.tsx` creado.
  - `dashboard/features/authentication/schemas/forgot-password.schema.ts` creado.
- Servicios creados o modificados: `auth.service.ts` (método `forgotPassword`).
- Modelos o DTOs utilizados: `ForgotPasswordFormData`, `ForgotPasswordResponse`.
- Rutas agregadas o modificadas: `GET /forgot-password` agregada en `routes.tsx`.
- Endpoint utilizado: `POST /api/users/forgot-password`.

## Formulario

- Validaciones implementadas: Zod valida email obligatorio y formato válido.
- Comportamiento del botón: deshabilitado mientras el formulario es inválido o durante envío.
- Estado de carga: texto cambia a "Enviando..." y botón deshabilitado.
- Manejo de solicitudes duplicadas: controlado por `isSubmitting` de React Hook Form.

## Integración Backend

- Endpoint utilizado: `POST /api/users/forgot-password`.
- Método HTTP: POST.
- Request enviado: `{ email }`.
- Response recibido: `{ expiresInMinutes }`.
- Información conservada para continuar: email enviado por `state` de React Router a `/verify-recovery-code`.

## Seguridad

- No se generan códigos en frontend.
- No se almacenan códigos innecesariamente.
- No se revela si un email existe: el backend responde con mensaje genérico.
- No se modifica el rol del usuario.
- No se exponen datos sensibles.
- El flujo no requiere autenticación: funciona sin sesión previa.

## Navegación

- Ruta de Login: `/login`.
- Ruta de recuperación: `/forgot-password`.
- Ruta de ingreso del código: `/verify-recovery-code`.
- Comportamiento ante éxito: navega a `/verify-recovery-code` con `state: { email }`.
- Comportamiento ante error: muestra mensaje inline y permite reintentar.

## Template

- Elementos de `put-your-mail-dashboard-template.html` implementados: estructura completa, header NEPS, card centrada, icono, título, descripción, input email, botón "Enviar Código", link "Volver al inicio de sesión", footer, glows de fondo.
- No fue necesario modificar el template; se reprodujo fielmente en React/Tailwind.

## Documentación

- No se requirió actualizar documentación adicional más allá de `pages.md` ya actualizado en TASK-DASH-0001.

## Compilación

- Comando utilizado: `npm run build`.
- Resultado: exitoso.
- Errores: 0.
- Warnings: 0.

## Problemas encontrados

- No se encontraron inconsistencias entre el template, el contrato del backend y la arquitectura.
- El endpoint `/api/users/forgot-password` ya estaba disponible y responde correctamente.