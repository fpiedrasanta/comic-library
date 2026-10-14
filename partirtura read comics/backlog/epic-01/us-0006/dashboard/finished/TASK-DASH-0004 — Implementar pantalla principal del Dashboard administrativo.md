# TASK-DASH-0004 — Implementar pantalla principal del Dashboard administrativo

## Objetivo

Implementar la pantalla principal del Dashboard administrativo de Comic Library.

La implementación debe utilizar como referencia visual:

`index-dashboard-template.html`

La pantalla constituye el punto de entrada de un administrador una vez autenticado correctamente.

Esta task corresponde exclusivamente a la implementación frontend de la pantalla principal y a la integración mínima necesaria para establecer el acceso visual al Dashboard autenticado.

La autorización efectiva de los recursos administrativos continúa siendo responsabilidad del Backend.

---

## Alcance

La pantalla debe permitir:

- Mostrar el Dashboard una vez autenticado.
- Mostrar la información básica del usuario autenticado cuando corresponda.
- Proporcionar la estructura visual inicial del Dashboard.
- Mantener la sesión administrativa existente.
- Permitir cerrar sesión.
- Proteger las rutas del Dashboard frente a usuarios no autenticados.
- Redirigir al Login cuando no exista una sesión válida.
- Preparar la estructura de navegación para las funcionalidades administrativas futuras.

No se implementan en esta task las funcionalidades específicas de administración de usuarios ni de contenido.

---

## Template

La implementación debe tomar como referencia:

```text
index-dashboard-template.html
```

Debe respetarse, siempre que sea posible:

- Estructura visual.
- Distribución.
- Tipografía.
- Espaciado.
- Navegación.
- Componentes visuales.
- Iconografía.
- Botones.
- Jerarquía de información.

No modificar arbitrariamente el diseño definido por el template.

---

## Acceso al Dashboard

El flujo esperado es:

```text
Login
  │
  ├── Credenciales válidas
  │
  ▼
Sesión autenticada
  │
  ▼
Dashboard
```

La aplicación debe verificar que exista una sesión válida antes de permitir el acceso a la pantalla principal.

El frontend no debe considerar suficiente una variable local que indique que el usuario está autenticado.

La sesión debe basarse en el mecanismo de autenticación existente.

---

## Usuario autenticado

Cuando exista una sesión válida, el Dashboard puede mostrar información básica del usuario autenticado, utilizando únicamente información disponible en el contrato existente.

No deben mostrarse datos sensibles como:

- PasswordHash.
- Refresh Token.
- Tokens temporales.
- Códigos de recuperación.
- Google ID Token.
- Información interna del Backend.

Si el Dashboard necesita información adicional del usuario, deberá utilizar el endpoint existente correspondiente en lugar de duplicar información en el frontend.

---

## Rol administrativo

El Dashboard está destinado a usuarios con:

```text
Administrator
```

El frontend puede utilizar el rol incluido en la identidad autenticada para:

- Mostrar u ocultar opciones de navegación.
- Determinar qué elementos de UI puede presentar.
- Redirigir usuarios sin autorización.

Sin embargo, el frontend nunca debe considerarse la autoridad final de autorización.

El Backend debe continuar validando el rol en cada endpoint administrativo protegido.

No implementar autorización basada exclusivamente en:

- Variables locales.
- LocalStorage.
- SessionStorage.
- Parámetros de URL.
- Información enviada por el usuario.
- Condiciones hardcodeadas en componentes.

---

## Protección de rutas

Las rutas administrativas deben estar protegidas mediante el mecanismo de guards o equivalente definido por la arquitectura del Dashboard.

Flujo esperado:

```text
Usuario intenta acceder a /dashboard
          │
          ▼
¿Sesión válida?
     │          │
    NO         SÍ
     │          │
     ▼          ▼
   Login     Dashboard
```

Un usuario no autenticado no debe poder acceder visualmente a las pantallas protegidas del Dashboard.

Esta protección es complementaria a la autorización del Backend.

---

## Access Token

El Dashboard debe utilizar el Access Token mediante el mecanismo existente.

No crear un mecanismo alternativo para almacenar o transportar tokens.

Respetar la estrategia definida en:

```text
frontend-dashboard-stack-technology.md
frontend-coding-rules.md
dashboard-architecture.md
```

El Access Token no debe aparecer en:

- URLs.
- Parámetros de navegación.
- Logs.
- Mensajes de error.
- Elementos visuales.

---

## Refresh Token

El Dashboard debe integrarse con el mecanismo existente de Refresh Token.

El Refresh Token continúa siendo responsabilidad del Backend y debe permanecer protegido mediante:

```text
HttpOnly Cookie
```

El frontend no debe:

- Leer directamente el Refresh Token.
- Guardarlo en LocalStorage.
- Guardarlo en SessionStorage.
- Incluirlo en respuestas JSON.
- Manipular su valor.

Cuando el Access Token expire, el mecanismo existente de renovación debe poder mantener la sesión administrativa.

---

## Renovación de sesión

Si el Dashboard ya posee un mecanismo de renovación de sesión, debe reutilizarse.

No implementar un segundo mecanismo exclusivo para el Dashboard.

El flujo esperado es:

```text
Request administrativo
        │
        ▼
Access Token expirado
        │
        ▼
Refresh Token válido
        │
        ▼
Nuevo Access Token
+
Nuevo Refresh Token
        │
        ▼
Reintentar request
```

La rotación del Refresh Token continúa siendo responsabilidad del Backend.

---

## Logout

El Dashboard debe proporcionar una opción para cerrar sesión.

El flujo debe reutilizar el mecanismo existente:

```text
Dashboard
    │
    ▼
Logout
    │
    ▼
Backend
    │
    ▼
Invalidación de sesión
    │
    ▼
Login
```

Al cerrar sesión:

- El estado de autenticación frontend debe eliminarse.
- El usuario debe ser redirigido al Login.
- No debe poder regresar al Dashboard utilizando navegación del navegador si la sesión ya no es válida.
- Debe utilizarse el endpoint existente de logout.

No implementar un endpoint administrativo independiente.

---

## Navegación

El Dashboard debe disponer de una estructura de navegación inicial.

La navegación debe estar preparada para incorporar posteriormente las funcionalidades administrativas de la plataforma.

Como mínimo debe existir:

```text
Dashboard
Logout
```

Las opciones futuras pueden representarse según el template, pero no deben implementarse funcionalidades que pertenezcan a otras User Stories.

No implementar en esta task:

- Gestión de usuarios.
- Gestión de países.
- Gestión de comics.
- Gestión de editoriales.
- Gestión de franquicias.
- Gestión de series.
- Gestión de números.
- Gestión de obras.
- Estadísticas.

---

## Estado no autenticado

Si el usuario intenta acceder al Dashboard sin sesión:

```text
/dashboard
    │
    ▼
No autenticado
    │
    ▼
Login
```

La redirección debe ser consistente y no generar loops.

---

## Sesión expirada

Si la sesión deja de ser válida y el mecanismo de Refresh Token no puede renovarla:

```text
Access Token expirado
        │
        ▼
Refresh Token inválido
        │
        ▼
Sesión finalizada
        │
        ▼
Login
```

El usuario no debe permanecer visualmente dentro del Dashboard como si continuara autenticado.

---

## Manejo de errores

Utilizar el mecanismo global de manejo de errores existente.

No implementar manejadores independientes para cada componente cuando la arquitectura ya disponga de un mecanismo común.

No mostrar:

- Stack traces.
- Excepciones internas.
- Información de infraestructura.
- Tokens.
- Cookies.
- Datos sensibles.

Los errores de autorización provenientes del Backend deben procesarse según el comportamiento global definido por el proyecto.

---

## Componentización

Seguir las reglas de arquitectura del Dashboard.

Separar adecuadamente:

- Layout.
- Navegación.
- Estado de autenticación.
- Contenido de la pantalla.
- Acciones del usuario.

Reutilizar componentes existentes cuando corresponda.

No crear abstracciones genéricas innecesarias.

---

## Responsive

La implementación debe respetar el comportamiento responsive definido por el template y por las reglas visuales del Dashboard.

Verificar al menos:

- Desktop.
- Tablet.
- Mobile.

No modificar la estructura visual salvo que sea necesario para que el template funcione correctamente en los tamaños soportados.

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
- Access Token.
- Refresh Token.
- Refresh Token Rotation.
- Logout.
- Manejo global de errores.

---

## Documentación a actualizar

Evaluar la actualización de:

```text
project/pages.md
project/components.md
project/endpoints.md
```

Si se incorpora un nuevo servicio o mecanismo de navegación, actualizar el documento correspondiente.

---

## Criterios de aceptación

### CA-01 — Pantalla principal

**Dado** un administrador autenticado

**Cuando** accede al Dashboard

**Entonces** debe visualizar la pantalla basada en `index-dashboard-template.html`.

### CA-02 — Usuario autenticado

**Dado** un usuario con una sesión válida

**Cuando** accede al Dashboard

**Entonces** la aplicación debe permitirle visualizar la pantalla principal.

### CA-03 — Usuario no autenticado

**Dado** un usuario sin sesión válida

**Cuando** intenta acceder al Dashboard

**Entonces** debe ser redirigido al Login.

### CA-04 — Rol administrativo

**Dado** un usuario autenticado sin rol `Administrator`

**Cuando** intenta acceder al Dashboard

**Entonces** el frontend no debe presentarle funcionalidades administrativas.

**Y** el Backend debe continuar rechazando cualquier endpoint administrativo.

### CA-05 — Protección frontend

Las rutas protegidas del Dashboard deben utilizar el mecanismo de protección definido por la arquitectura frontend.

### CA-06 — Protección Backend

El frontend no debe asumir que la protección de rutas reemplaza la autorización del Backend.

### CA-07 — Refresh Token

El Dashboard debe reutilizar el mecanismo existente de Refresh Token.

### CA-08 — HttpOnly

El frontend no debe intentar leer ni almacenar el Refresh Token.

### CA-09 — Renovación

Cuando expire el Access Token y el Refresh Token continúe siendo válido, debe poder mantenerse la sesión mediante el mecanismo existente.

### CA-10 — Sesión expirada

Cuando el Refresh Token ya no sea válido:

**Entonces** el usuario debe ser redirigido al Login.

### CA-11 — Logout

**Dado** un administrador autenticado

**Cuando** selecciona Logout

**Entonces** debe finalizar su sesión utilizando el mecanismo existente.

### CA-12 — Acceso posterior al logout

**Dado** que el administrador cerró sesión

**Cuando** intenta volver al Dashboard

**Entonces** debe ser redirigido al Login.

### CA-13 — Sin datos sensibles

La interfaz no debe mostrar ni almacenar:

- PasswordHash.
- Refresh Token.
- Tokens de recuperación.
- Códigos de recuperación.
- Google ID Token.
- Google Client Secret.

### CA-14 — Navegación

La pantalla debe disponer de la navegación definida por el template y permitir cerrar sesión.

### CA-15 — Funcionalidades futuras

No deben implementarse funcionalidades administrativas pertenecientes a otras User Stories.

### CA-16 — Responsive

La pantalla debe funcionar correctamente en los tamaños soportados por el Dashboard.

### CA-17 — Compilación

El Dashboard debe compilar correctamente sin errores ni warnings nuevos relacionados con esta implementación.

---

## Fuera de alcance

Esta task no incluye:

- Login.
- Registro.
- Recuperación de contraseña.
- Gestión de usuarios.
- Gestión de roles.
- Gestión de países.
- Administración del catálogo.
- Gestión de comics.
- Gestión de editoriales.
- Gestión de franquicias.
- Gestión de series.
- Gestión de números.
- Gestión de obras.
- Estadísticas.
- Permisos granulares.

---

## Resultado esperado

Al finalizar esta task debe existir un Dashboard administrativo funcional como punto de entrada posterior al Login:

```text
Login
  │
  ▼
Sesión autenticada
  │
  ▼
Dashboard
  │
  ├── Navegación
  ├── Contenido inicial
  └── Logout
```

El Dashboard debe reutilizar completamente el sistema de identidad existente y no debe introducir un mecanismo paralelo de autenticación.

La autorización efectiva de las funcionalidades administrativas debe continuar siendo responsabilidad del Backend.

---

# Reporte de implementación

Al finalizar la implementación, reportar:

## Implementación

- Componentes creados o modificados:
  - `dashboard/pages/dashboard-layout.tsx` creado/actualizado con layout completo.
  - `dashboard/pages/home-page.tsx` actualizado con contenido del template.
- Servicios creados o modificados: ninguno nuevo; se reutilizan los servicios de autenticación existentes.
- Guards o mecanismos de protección agregados: `ProtectedRoute` en `app/router/protected-route.tsx`.
- Rutas agregadas o modificadas: ruta `/` protegida con `ProtectedRoute` y `DashboardLayout`.
- Componentes de layout implementados: `DashboardLayout` con sidebar, topbar, área de contenido y footer de usuario.

## Autenticación

- Cómo se determina si existe una sesión válida: `useAuth` consulta `/api/users/me` con el token almacenado en `sessionStorage`.
- Cómo se obtiene la información del usuario autenticado: respuesta de `GET /api/users/me` mapeada a `User`.
- Cómo se utiliza el Access Token: enviado en header `Authorization: Bearer` por `api-client.ts`.
- Cómo se integra la renovación de sesión: interceptor `authFetch` detecta 401 y ejecuta refresh automáticamente.

## Autorización

- Cómo se identifica el rol `Administrator`: incluido en el `User` devuelto por `/api/users/me`.
- Comportamiento de usuario sin rol: el frontend no muestra funcionalidades administrativas; el backend rechaza endpoints protegidos.
- Mecanismos de protección en frontend: `ProtectedRoute` + verificación de `isAuthenticated`.
- Autoridad final: backend valida rol en cada endpoint administrativo.

## Refresh Token

- Frontend no puede leer el Refresh Token: transportado por cookie `HttpOnly`.
- No se almacena en LocalStorage ni SessionStorage.
- Se mantiene mediante cookie `HttpOnly` gestionada por el backend.
- Se reutiliza Refresh Token Rotation existente.

## Logout

- Endpoint utilizado: `POST /api/users/logout`.
- Comportamiento al cerrar sesión: limpia estado de auth, elimina token de `sessionStorage`, redirige a `/login`.
- Redirección posterior: `/login`.
- Comportamiento al intentar regresar: `ProtectedRoute` detecta sesión inválida y redirige.

## Template

- Elementos de `index-dashboard-template.html` implementados: sidebar con navegación y usuario, topbar con título y botón "Nuevo Comic", área de contenido con cards KPI y tabla de catálogo, footer de usuario con avatar, nombre, rol y logout.
- No fue necesario modificar el template; se reprodujo fielmente en React/Tailwind.
- Datos estáticos de ejemplo: KPI y tabla utilizan datos de ejemplo del template; la integración con backend real se planifica para la próxima User Story.

## Responsive

- Desktop: sidebar visible, layout horizontal completo.
- Tablet: sidebar oculto, topbar con botón de menú hamburguesa.
- Mobile: mismo comportamiento que tablet, con header fijo.

## Documentación

- `project/pages.md` actualizado con nuevas rutas del Dashboard.
- `project/components.md` actualizado con `DashboardLayout` y `OtpInputs`.

## Compilación

- Comando utilizado: `npm run build`.
- Resultado: exitoso.
- Errores: 0.
- Warnings: 0.

## Problemas encontrados

- No se encontraron inconsistencias entre el template, la arquitectura y los contratos del backend.
- El diseño responsive del template se implementó manteniendo el comportamiento original (sidebar hidden en mobile, topbar sticky).