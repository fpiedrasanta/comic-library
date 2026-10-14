# TASK-UI-0005 — Implementar dashboard principal autenticado

## Objetivo

Implementar la pantalla principal del Dashboard administrativo a partir del template:

`index-dashboard-template.html`

La pantalla debe representar el estado inicial del Dashboard una vez que el administrador se encuentra autenticado correctamente.

El frontend debe respetar la arquitectura, componentes, estilos y reglas definidas para el Dashboard.

---

## Alcance

Implementar:

- Página principal del Dashboard.
- Layout correspondiente al template.
- Navegación principal.
- Estado autenticado del administrador.
- Integración con el mecanismo de autenticación existente.
- Protección de la ruta del Dashboard.
- Manejo de sesión expirada.
- Logout desde el Dashboard.
- Integración con el backend únicamente cuando sea necesaria para representar información real.

No implementar todavía funcionalidades específicas de administración de usuarios. Estas corresponden a la siguiente User Story.

---

## Template de referencia

Utilizar como referencia visual:

`index-dashboard-template.html`

No modificar arbitrariamente el diseño definido por el template.

Respetar:

- Estructura HTML.
- Jerarquía visual.
- Tipografías.
- Espaciados.
- Componentes visuales.
- Iconografía.
- Colores.
- Estados visuales.
- Responsive behavior cuando corresponda.

Si el template contiene contenido estático utilizado únicamente como ejemplo visual, reemplazarlo por datos reales o estados del frontend cuando corresponda.

---

## Autenticación

El Dashboard debe considerar al usuario como autenticado únicamente cuando exista una sesión válida.

El frontend no debe considerar suficiente la existencia de un valor almacenado arbitrariamente en `localStorage`, `sessionStorage` o cualquier otro mecanismo.

La sesión debe utilizar el mecanismo de autenticación definido por el backend:

- Access Token JWT.
- Refresh Token mediante cookie `HttpOnly`.
- Refresh Token Rotation.

El Refresh Token no debe ser leído ni manipulado directamente por JavaScript.

---

## Protección de la ruta

La ruta correspondiente al Dashboard debe estar protegida.

Si un usuario no autenticado intenta acceder directamente a:

```text
/dashboard
```

o a la ruta equivalente definida por la arquitectura del frontend:

```text
Dashboard
    ↓
¿Sesión válida?
    ├── Sí → Dashboard
    └── No → Login
```

El frontend debe impedir la visualización de la aplicación administrativa cuando no exista una sesión válida.

Esta protección frontend es complementaria a la autorización realizada por el backend.

---

## Usuario administrador

El Dashboard debe utilizar la información del usuario autenticado obtenida mediante el mecanismo de sesión existente.

No debe determinarse el rol administrativo mediante:

- Email hardcodeado.
- Lista de emails.
- Variables específicas del frontend.
- Condiciones basadas en el nombre del usuario.
- Información enviada manualmente por el usuario.

El backend es la autoridad final sobre la autorización administrativa.

El frontend puede utilizar el rol presente en la identidad autenticada para controlar navegación y presentación visual.

---

## Estado de carga

Durante la inicialización de la aplicación debe contemplarse un estado de carga mientras se determina si existe una sesión válida.

No debe mostrarse momentáneamente el Dashboard para luego redirigir al Login debido a una comprobación de autenticación pendiente.

El flujo esperado es:

```text
Inicialización
      ↓
Verificar sesión
      ↓
┌─────┴─────┐
│           │
Válida    Inválida
│           │
▼           ▼
Dashboard  Login
```

---

## Access Token expirado

Cuando una llamada al backend determine que el Access Token expiró, el frontend debe intentar renovar la sesión mediante el mecanismo existente de Refresh Token.

El flujo esperado es:

```text
Request
   ↓
401 Unauthorized
   ↓
Intentar refresh
   ↓
┌──────┴──────┐
│             │
Éxito       Fallo
│             │
▼             ▼
Reintentar   Logout
request      + Login
```

No implementar un mecanismo alternativo de renovación de sesión.

No acceder directamente al Refresh Token.

---

## Logout

El Dashboard debe proporcionar acceso al cierre de sesión.

El logout debe utilizar el endpoint/mecanismo existente del backend.

Después de cerrar sesión correctamente:

- La sesión local debe limpiarse.
- El usuario debe ser redirigido al Login.
- No debe poder regresar al Dashboard mediante navegación del navegador.
- Si intenta acceder nuevamente a una ruta protegida, debe ser enviado al Login.

El frontend no debe implementar una lógica paralela de invalidación del Refresh Token.

---

## Manejo de sesión inválida

Si el Refresh Token expiró, fue revocado, fue utilizado previamente o no puede utilizarse para renovar la sesión:

1. El frontend debe considerar la sesión inválida.
2. Debe limpiar el estado de autenticación.
3. Debe redirigir al Login.
4. No debe mostrar errores técnicos al usuario.

No debe entrar en un ciclo infinito de intentos de refresh.

---

## Navegación

Implementar la navegación visible definida por:

`index-dashboard-template.html`

Las opciones que todavía no posean una funcionalidad implementada deben tratarse según el diseño definido para el Dashboard.

No crear funcionalidades administrativas que no formen parte de US-0006.

En particular, esta task no implementa:

- Gestión de usuarios.
- Alta de usuarios.
- Edición de usuarios.
- Eliminación de usuarios.
- Activación/desactivación de usuarios.
- Gestión avanzada de roles.

---

## Integración con Backend

Utilizar los endpoints existentes de autenticación.

No crear endpoints específicos para el Dashboard si los existentes son suficientes.

No crear:

```text
/api/admin/login
/api/admin/refresh
/api/admin/logout
```

salvo que exista una justificación arquitectónica documentada y aprobada.

El Dashboard debe reutilizar la infraestructura de autenticación existente.

---

## Manejo de errores

Los errores provenientes de la API deben procesarse mediante el mecanismo global definido para el frontend.

No mostrar:

- Stack traces.
- Excepciones internas.
- Información de infraestructura.
- Tokens.
- Datos sensibles.
- Información técnica innecesaria.

Los errores de autenticación deben traducirse a estados comprensibles para el usuario.

---

## Responsive

La pantalla debe funcionar correctamente en las resoluciones contempladas por el Dashboard.

Verificar como mínimo:

- Desktop.
- Tablet.
- Resoluciones menores razonables.

No introducir comportamiento responsive que contradiga el template.

---

## Arquitectura

Respetar:

- Arquitectura del Dashboard.
- Separación entre componentes y servicios.
- Servicios para comunicación con la API.
- Guards/interceptors/middleware equivalente según el stack.
- Configuración centralizada de la URL de API.
- Reutilización de mecanismos de autenticación existentes.

No implementar llamadas HTTP directamente dentro de componentes cuando la arquitectura existente indique utilizar servicios.

No duplicar la lógica de autenticación en múltiples componentes.

---

## Código

Respetar `frontend-coding-rules.md`.

En particular:

- Código en inglés.
- Componentes con responsabilidades claras.
- Funciones pequeñas.
- No duplicar lógica.
- No introducir lógica de negocio en componentes visuales.
- Utilizar nombres descriptivos.
- Mantener la lógica de autenticación centralizada.
- No almacenar información sensible innecesariamente.

---

## Criterios de aceptación

### CA-01 — Dashboard autenticado

**Dado** un administrador autenticado correctamente

**Cuando** accede al Dashboard

**Entonces** debe visualizarse `index-dashboard-template.html` implementado en el frontend.

### CA-02 — Usuario no autenticado

**Dado** un usuario sin sesión válida

**Cuando** intenta acceder al Dashboard

**Entonces** debe ser redirigido al Login.

### CA-03 — Estado de carga

**Dado** que el frontend todavía está verificando la sesión

**Entonces** no debe mostrarse incorrectamente el Dashboard como contenido autenticado.

### CA-04 — Access Token expirado

**Dado** un administrador con Access Token expirado

**Cuando** realiza una operación contra la API

**Entonces** el frontend debe utilizar el mecanismo existente de Refresh Token para intentar renovar la sesión.

### CA-05 — Refresh exitoso

**Dado** un Access Token expirado

**Y** un Refresh Token válido

**Cuando** se renueva la sesión

**Entonces** el frontend debe obtener el nuevo Access Token y continuar la sesión.

### CA-06 — Refresh fallido

**Dado** un Access Token expirado

**Y** un Refresh Token inválido o expirado

**Cuando** se intenta renovar la sesión

**Entonces** el frontend debe cerrar la sesión y redirigir al Login.

### CA-07 — Refresh Token

**Dado** un usuario autenticado

**Entonces** el frontend no debe acceder directamente al Refresh Token.

### CA-08 — Logout

**Dado** un administrador autenticado

**Cuando** selecciona cerrar sesión

**Entonces** debe utilizarse el mecanismo existente de logout.

**Y** debe finalizarse la sesión del frontend.

**Y** debe redirigirse al Login.

### CA-09 — Acceso posterior al logout

**Dado** un administrador que cerró sesión

**Cuando** intenta acceder nuevamente al Dashboard

**Entonces** debe ser redirigido al Login.

### CA-10 — Rol

**Dado** un usuario autenticado sin rol `Administrator`

**Cuando** intenta acceder al Dashboard

**Entonces** el frontend no debe permitirle utilizar la aplicación administrativa.

**Y** el backend debe continuar siendo la autoridad final de autorización.

### CA-11 — No duplicar autenticación

El Dashboard no debe implementar un mecanismo independiente de:

- JWT.
- Refresh Token.
- Refresh Token Rotation.
- Logout.
- Recuperación de sesión.

Debe reutilizar los mecanismos existentes.

### CA-12 — Compilación

El Dashboard debe compilar correctamente.

No deben introducirse errores ni warnings nuevos relacionados con la implementación.

---

## Documentación

Revisar y actualizar únicamente si la implementación modifica alguno de los siguientes contratos o decisiones:

- `project/pages.md`
- `project/components.md`
- `project/frontend-coding-rules.md`
- `project/frontend-dashboard-stack-technology.md`
- `project/dashboard-architecture.md`

No modificar documentación que no haya cambiado.

---

## Resultado esperado

Al finalizar esta task:

- El Dashboard principal estará implementado a partir de `index-dashboard-template.html`.
- La ruta estará protegida.
- El estado de autenticación estará centralizado.
- El Dashboard utilizará el mecanismo de sesión existente.
- El Refresh Token continuará protegido mediante cookie `HttpOnly`.
- La renovación de sesión reutilizará Refresh Token Rotation.
- El logout utilizará el mecanismo existente.
- Una sesión inválida llevará al Login.
- Un usuario sin autorización administrativa no podrá utilizar el Dashboard.
- No se habrá creado un sistema de autenticación paralelo.
- No se habrán implementado todavía funcionalidades de administración de usuarios.

---

# Reporte de implementación

### Archivos creados o modificados

- Componentes creados:
  - `dashboard/pages/dashboard-layout.tsx`
  - `dashboard/pages/home-page.tsx`
  - `dashboard/app/router/protected-route.tsx`
- Servicios creados o modificados:
  - `dashboard/features/authentication/services/auth.service.ts`
  - `dashboard/features/authentication/services/auth-interceptor.ts`
- Guards/interceptors creados o modificados: `ProtectedRoute`, `authFetch`.
- Routing modificado: `dashboard/app/router/routes.tsx`.
- Configuración modificada: `dashboard/tailwind.config.ts` (paleta NEPS).

### Autenticación

- Sesión válida determinada por `useAuth` consultando `/api/users/me` con token en `sessionStorage`.
- Acceso expirado manejado por interceptor que detecta 401 y ejecuta refresh automáticamente.
- Refresh ejecutado mediante `POST /api/users/refresh-token`.
- Refresh Token no accesible desde JavaScript: transportado por cookie `HttpOnly` exclusivamente.

### Autorización

- Rol `Administrator` controlado por información del `User` autenticado.
- Usuario sin rol: no accede a funcionalidades administrativas; el backend rechaza endpoints protegidos.
- Protección frontend: `ProtectedRoute` + verificación de `isAuthenticated`.
- Autoridad final: backend valida rol en cada endpoint administrativo.

### Logout

- Endpoint utilizado: `POST /api/users/logout`.
- Estado local limpiado: `auth-store.ts` elimina token y usuario; se redirige a `/login`.
- Regreso al Dashboard después de logout: bloqueado por `ProtectedRoute`.

### Errores

- Respuestas `401`: interceptor intenta refresh; si falla, limpia estado y redirige a Login.
- Fallos de refresh: logout forzado y redirección a `/login`.
- Loop infinito de refresh evitado: flag `isRefreshing` y promesa única `refreshPromise`.

### Template

- Partes de `index-dashboard-template.html` implementadas: sidebar con navegación y perfil de usuario, topbar con título y acción principal, cards KPI, tabla de catálogo con filtros y paginador, footer.
- Partes pendientes: integración de datos reales del backend en KPI y tabla (planificado para próxima User Story).
- No se modificó el template; se adaptó a React manteniendo la estructura visual.

### Compilación

- Resultado: exitoso.
- Errores: 0.
- Warnings: 0.

### Documentación

- `project/pages.md` actualizado.
- `project/components.md` actualizado.

### Problemas encontrados

- No se requirieron cambios arquitectónicos; la reutilización del mecanismo de autenticación existente funcionó sin modificaciones al backend.
- El diseño responsive del template se implementó manteniendo el comportamiento original.

---

## Estado

Finished