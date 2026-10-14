# TASK-DASH-0001 — Implementar pantalla de Login del Dashboard

## Objetivo

Implementar la pantalla de Login del Dashboard administrativo utilizando como referencia visual y estructural:

`login-dashboard-template.html`

La pantalla debe permitir que un usuario administrador ingrese mediante email y contraseña utilizando el mecanismo de autenticación existente del Backend.

No debe implementarse un mecanismo de autenticación paralelo específico para el Dashboard.

---

## Alcance

La implementación comprende:

- Pantalla de Login.
- Campo Email.
- Campo Password.
- Validaciones del formulario.
- Integración con el endpoint de login existente.
- Manejo de autenticación exitosa.
- Manejo de credenciales incorrectas.
- Manejo de email no validado.
- Manejo de errores provenientes del Backend.
- Navegación hacia el Dashboard después de autenticarse correctamente.
- Navegación hacia la recuperación de contraseña.
- Estados visuales de carga durante el proceso de autenticación.

---

## Template

La pantalla debe implementarse tomando como referencia:

```text
login-dashboard-template.html
```

El template debe respetarse tanto como sea posible en:

- Estructura visual.
- Distribución de los elementos.
- Textos.
- Jerarquía visual.
- Estados visuales.
- Espaciados.
- Componentes existentes del proyecto.

No modificar el diseño arbitrariamente si el template ya define el comportamiento visual esperado.

---

## Formulario

El formulario debe contener:

```text
Email
Password
```

El campo Email debe:

- Ser obligatorio.
- Validar formato de email.
- Mostrar un mensaje apropiado cuando el formato sea inválido.

El campo Password debe:

- Ser obligatorio.
- Permitir ingresar la contraseña de forma segura.
- No mostrar el valor en texto plano mientras se ingresa.

El botón de Login debe permanecer deshabilitado mientras el formulario sea inválido.

---

## Autenticación

Al enviar el formulario válido:

```text
Dashboard
    ↓
Login
    ↓
Email + Password
    ↓
Backend API
    ↓
Autenticación existente
    ↓
AuthResponse
    ↓
Dashboard
```

Debe utilizarse el endpoint de autenticación existente.

No crear un endpoint específico como:

```text
/api/admin/login
```

si el endpoint actual de autenticación puede utilizarse para este flujo.

El frontend no debe implementar:

- Generación de JWT.
- Generación de Refresh Token.
- Validación criptográfica de tokens.
- Hashing de contraseñas.
- Validación del rol contra información confiable enviada por el cliente.

Estas responsabilidades pertenecen al Backend.

---

## Sesión

Después de una autenticación exitosa, el frontend debe utilizar la respuesta proporcionada por el Backend según la arquitectura de autenticación existente.

El Refresh Token no debe ser almacenado ni manipulado por el frontend cuando el Backend lo gestione mediante cookie `HttpOnly`.

El frontend no debe intentar acceder mediante JavaScript al contenido del Refresh Token.

El Access Token debe gestionarse de acuerdo con la arquitectura definida para el Dashboard.

No introducir un mecanismo alternativo de almacenamiento de tokens sin justificación arquitectónica.

---

## Autorización

El Dashboard debe considerar que el usuario autenticado necesita poseer el rol:

```text
Administrator
```

Sin embargo, el frontend no constituye el mecanismo de seguridad.

La autorización efectiva será realizada por el Backend.

El frontend puede utilizar la información del usuario autenticado para:

- Determinar qué rutas mostrar.
- Proteger visualmente determinadas funcionalidades.
- Redirigir usuarios que no correspondan al Dashboard.

No debe asumirse que ocultar una ruta o botón impide el acceso a la API.

---

## Login exitoso

Cuando el Backend autentique correctamente al usuario:

1. Procesar la respuesta de autenticación.
2. Establecer el estado de sesión del Dashboard.
3. Conservar el Access Token según la arquitectura definida.
4. No acceder ni almacenar el Refresh Token.
5. Navegar hacia `index-dashboard-template.html` o la ruta correspondiente al Dashboard.
6. Permitir posteriormente la renovación de sesión mediante el mecanismo existente.

El usuario debe quedar identificado como administrador según la información proporcionada por el Backend.

---

## Credenciales incorrectas

Cuando el Backend rechace las credenciales:

- No revelar si el email existe o no cuando el Backend utilice un mensaje genérico.
- Mostrar un mensaje apropiado al usuario.
- No exponer detalles internos de la API.
- No mostrar información técnica innecesaria.
- Permitir volver a intentar el Login.

El frontend no debe modificar ni interpretar el comportamiento de seguridad definido por el Backend.

---

## Email no validado

Si el Backend informa que el usuario no posee un email validado:

- El Login debe ser rechazado.
- Mostrar el mensaje correspondiente al usuario.
- No establecer una sesión administrativa.
- No navegar al Dashboard.

El frontend no debe intentar sortear esta validación.

---

## Estado de carga

Mientras se procesa el Login:

- Deshabilitar el botón de envío.
- Evitar múltiples solicitudes simultáneas.
- Mostrar el estado visual de carga definido por el template/diseño.
- Restaurar el formulario cuando finalice la solicitud.

Si la solicitud falla, el usuario debe poder volver a intentarlo.

---

## Recuperación de contraseña

La pantalla debe proporcionar acceso al flujo de recuperación de contraseña.

La navegación debe llevar a:

```text
put-your-mail-dashboard-template.html
```

No implementar recuperación de contraseña dentro de la pantalla de Login.

No crear un flujo diferente de recuperación exclusivamente para administradores.

---

## Registro

La pantalla de Login del Dashboard no debe proporcionar:

```text
Register
Create account
Sign up
```

No debe existir ninguna navegación desde el Login que permita registrar usuarios administrativos.

---

## Google

La pantalla de Login del Dashboard no debe proporcionar:

```text
Continue with Google
```

La autenticación mediante Google pertenece al Public Web.

No agregar componentes, servicios ni dependencias relacionadas con Google Authentication para este Login.

---

## Manejo de errores

El componente debe respetar el mecanismo global de manejo de errores definido por el proyecto.

No duplicar lógica global de errores dentro del componente de Login.

Los errores deben traducirse a mensajes apropiados para el usuario cuando corresponda.

No mostrar:

- Stack traces.
- Excepciones internas.
- Información de infraestructura.
- Tokens.
- Contraseñas.
- Datos sensibles.

---

## Navegación

La pantalla debe contemplar como mínimo:

```text
Login
  │
  ├── Login exitoso
  │       ↓
  │    Dashboard
  │
  └── ¿Olvidaste tu contraseña?
          ↓
    Recuperación de contraseña
```

No debe existir navegación hacia registro ni Login mediante Google.

---

## Componentización

Seguir las reglas de componentización definidas para el Dashboard.

No crear componentes innecesarios.

La lógica de autenticación no debe quedar acoplada directamente al componente visual si la arquitectura existente contempla un servicio de autenticación.

Reutilizar servicios, modelos, interceptors, guards y componentes existentes cuando corresponda.

No duplicar mecanismos que ya existan en el Public Web si pueden reutilizarse apropiadamente.

---

## Contrato con Backend

Antes de implementar, revisar el contrato real del endpoint de autenticación existente.

Verificar:

- Método HTTP.
- URL.
- Request DTO.
- Response DTO.
- Códigos HTTP.
- Estructura de errores.
- Access Token.
- Información del usuario.
- Role.
- Manejo de cookies.

No asumir contratos diferentes a los implementados por el Backend.

Si el contrato utilizado por el Dashboard requiere modificaciones en el Backend, documentar la necesidad y no implementar un contrato alternativo unilateralmente.

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

- Login.
- AuthService.
- JWT.
- Refresh Token.
- Refresh Token Rotation.
- Cookies `HttpOnly`.
- Manejo global de errores.
- Estado de autenticación existente.

---

## Documentación a actualizar

Actualizar únicamente los documentos afectados por la implementación.

Como mínimo, evaluar:

```text
project/pages.md
project/components.md
project/endpoints.md
```

Si se incorpora o modifica algún servicio de autenticación del Dashboard, actualizar también la documentación correspondiente.

Si se modifica alguna regla general del frontend, actualizar:

```text
project/frontend-coding-rules.md
```

No documentar información sensible.

---

## Criterios de aceptación

### CA-01 — Visualización del Login

**Dado** que el usuario accede al Dashboard

**Cuando** no existe una sesión autenticada

**Entonces** debe visualizar la pantalla correspondiente a `login-dashboard-template.html`.

### CA-02 — Campos del formulario

El formulario debe permitir ingresar:

- Email.
- Password.

### CA-03 — Validación de email

**Dado** un email con formato inválido

**Cuando** el usuario intenta iniciar sesión

**Entonces** el frontend debe impedir el envío y mostrar la validación correspondiente.

### CA-04 — Campos obligatorios

**Dado** que Email o Password están vacíos

**Cuando** el usuario intenta iniciar sesión

**Entonces** el formulario debe considerarse inválido.

### CA-05 — Login exitoso

**Dado** un usuario administrador con email validado

**Y** una contraseña correcta

**Cuando** inicia sesión

**Entonces** debe autenticarse mediante el endpoint existente.

**Y** debe establecerse la sesión del Dashboard.

**Y** debe navegar al Dashboard.

### CA-06 — Credenciales incorrectas

**Dado** un usuario que proporciona credenciales incorrectas

**Cuando** intenta iniciar sesión

**Entonces** el frontend debe mostrar el error correspondiente.

**Y** no debe establecer una sesión.

### CA-07 — Usuario sin email validado

**Dado** un usuario cuyo email no fue validado

**Cuando** intenta iniciar sesión

**Entonces** no debe acceder al Dashboard.

### CA-08 — Recuperación de contraseña

**Dado** que el usuario está en Login

**Cuando** selecciona la opción de recuperación

**Entonces** debe navegar a `put-your-mail-dashboard-template.html`.

### CA-09 — Sin registro

**Dado** que el usuario está en Login

**Entonces** no debe existir una opción para registrarse.

### CA-10 — Sin Google

**Dado** que el usuario está en Login

**Entonces** no debe existir una opción de autenticación mediante Google.

### CA-11 — Refresh Token

**Dado** que el Login fue exitoso

**Entonces** el frontend no debe acceder directamente al Refresh Token cuando éste sea gestionado mediante cookie `HttpOnly`.

### CA-12 — Múltiples solicitudes

**Dado** que el Login está siendo procesado

**Cuando** el usuario intenta enviar nuevamente el formulario

**Entonces** no deben generarse solicitudes duplicadas simultáneas.

### CA-13 — Errores

Los errores mostrados al usuario no deben exponer:

- Tokens.
- Contraseñas.
- Stack traces.
- Información interna del Backend.
- Información sensible.

### CA-14 — Compilación

La aplicación Dashboard debe compilar correctamente.

No deben introducirse errores ni warnings nuevos relacionados con la implementación.

---

## Fuera de alcance

Esta task no incluye:

- Implementación del Backend de autenticación.
- Implementación de roles en Backend.
- Implementación de autorización en Backend.
- Implementación de Refresh Token Rotation en Backend.
- Registro de usuarios.
- Login mediante Google.
- Administración de usuarios.
- Gestión del perfil.
- Implementación completa del Dashboard.
- Recuperación de contraseña.
- Validación del código de recuperación.
- Gestión avanzada de permisos.

Estas funcionalidades corresponden a otras tasks de la User Story.

---

## Resultado esperado

La pantalla de Login del Dashboard debe quedar implementada y conectada al mecanismo de autenticación existente.

Un administrador debe poder:

```text
Ingresar email
      ↓
Ingresar password
      ↓
Autenticar
      ↓
Establecer sesión
      ↓
Acceder al Dashboard
```

El Login no debe permitir registro ni autenticación mediante Google y debe mantener la separación entre autenticación del frontend y autorización efectiva del Backend.

---

# Reporte de implementación

Al finalizar la implementación, reportar:

### Implementación

- Componentes creados o modificados:
  - `dashboard/pages/login-page.tsx` creado.
  - `dashboard/types/api.ts` actualizado para `ApiResponse`.
  - `dashboard/types/auth.ts` creado.
  - `dashboard/store/auth-store.ts` creado.
  - `dashboard/features/authentication/services/auth.service.ts` creado.
  - `dashboard/features/authentication/services/auth-interceptor.ts` creado.
  - `dashboard/features/authentication/hooks/use-auth.ts` creado.
  - `dashboard/app/router/protected-route.tsx` creado.
  - `dashboard/app/router/routes.tsx` actualizado con ruta `/login`.
- Servicios creados o modificados: `auth.service.ts`, `auth-interceptor.ts`.
- Guards/interceptors utilizados o modificados: `ProtectedRoute` creado en `app/router/protected-route.tsx`.
- Rutas agregadas o modificadas: `GET /login` agregada en `routes.tsx`.
- Modelos/DTOs utilizados: `LoginFormData` (Zod), `AuthResponse`, `User`.
- Endpoint de Backend utilizado: `POST /api/users/login`.

### Autenticación

- Request enviado al Backend: `{ email, password }` por `POST /api/users/login`.
- Response recibido: `{ accessToken, userId, email, fullName, role }`.
- AccesToken gestionado en `auth-store.ts` y en `sessionStorage` con clave `dashboard_access_token`.
- Refresh Token no accesible desde JavaScript: transportado exclusivamente por cookie `HttpOnly` por el backend; el frontend no lo lee ni lo almacena.
- Comportamiento ante Login exitoso: se establece el estado de sesión, se navega a `/` (Dashboard protegido).

### Errores

- Credenciales incorrectas: mensaje retornado por el backend, mostrado en un alert inline sin exponer detalles.
- Email no validado: backend devuelve 401, el frontend muestra el mensaje genérico y no navega.
- Errores de validación: Zod valida formato y campos requeridos antes de enviar.
- Error de conexión / Backend: capturados por `api-client.ts` y mostrados como mensaje genérico.

### Navegación

- Ruta del Login: `/login`.
- Ruta del Dashboard: `/` (protegida por `ProtectedRoute`).
- Ruta de recuperación de contraseña: `/forgot-password`.
- Comportamiento cuando el usuario ya está autenticado: el hook `useAuth` consulta `/api/users/me` y permite acceder al Dashboard.
- Comportamiento cuando la sesión expira: `ProtectedRoute` detecta `isAuthenticated = false` y redirige a `/login`.

### Template

- Elementos de `login-dashboard-template.html` implementados: estructura completa, header NEPS, card de login, campos Email y Password, link "¿Olvidaste tu contraseña?", botón "Ingresar al Panel", footer, glows de fondo, paleta NEPS.
- No fue necesario modificar el template; se reprodujo fielmente en React/Tailwind.

### Seguridad

- No existe registro en la pantalla de Login.
- No existe Login mediante Google.
- No se almacenan Refresh Tokens en el frontend.
- No se exponen tokens en logs.
- No se exponen contraseñas.
- No se implementó autorización únicamente en frontend; el backend valida el rol.

### Documentación

- `project/pages.md` actualizado con páginas del Dashboard.
- `project/components.md` actualizado con `DashboardLayout` y `OtpInputs`.

### Compilación

- Comando utilizado: `npm run build`.
- Resultado: exitoso.
- Errores: 0.
- Warnings: 0.

### Problemas encontrados

- Inicialmente el `api-client.ts` no manejaba el contrato `ApiResponse` del backend; se corrigió para parsear `payload` y normalizar errores.
- Se ajustaron imports relativos a alias `@/` para coherencia con la configuración de Vite/TS.