# TASK-DASH-0010 — Restringir acceso al Dashboard según rol de usuario

## Objetivo

Adaptar la protección de rutas del Dashboard para que solamente los usuarios autenticados que posean el rol `Administrator` puedan acceder a las funcionalidades del Dashboard administrativo.

La validación del rol en el frontend constituye una protección de navegación y experiencia de usuario.

La autorización efectiva de los recursos administrativos continuará siendo responsabilidad del Backend.

No se debe implementar una nueva estrategia de autenticación ni modificar el mecanismo existente de JWT, Refresh Token o Refresh Token Rotation.

---

## Comportamiento esperado

El acceso a la ruta principal del Dashboard debe seguir las siguientes reglas:

```text
Usuario no autenticado
        │
        ▼
      /login

Usuario autenticado
        │
        ▼
   ¿Role = Administrator?
        │
   ┌────┴────┐
   │         │
  NO        SÍ
   │         │
   ▼         ▼
Acceso      Dashboard
rechazado
```

Un usuario con `PublicUser` puede continuar utilizando el Public Web normalmente.

El hecho de poseer el rol `PublicUser` no debe provocar ningún cambio en la autenticación o navegación del Public Web.

---

## ProtectedRoute

Modificar el mecanismo existente `ProtectedRoute` para que, además de verificar si existe una sesión autenticada, valide el rol del usuario.

Actualmente la protección conceptual es:

```text
isAuthenticated
      │
      ▼
Dashboard
```

Debe pasar a ser:

```text
isAuthenticated
      │
      ▼
role === Administrator
      │
      ▼
Dashboard
```

La validación debe utilizar la información del usuario autenticado que ya mantiene el sistema de autenticación.

No se debe determinar el rol mediante:

- Email del usuario.
- Lista hardcodeada de administradores.
- Información proporcionada por parámetros de la URL.
- Información ingresada manualmente por el usuario.
- Configuración específica del frontend que determine quién es administrador.

---

## Usuario no autenticado

Cuando un usuario no posee una sesión válida:

```text
ProtectedRoute
      │
      ▼
isAuthenticated = false
      │
      ▼
/login
```

Debe mantenerse el comportamiento existente.

No se debe modificar el flujo de autenticación.

---

## Usuario autenticado sin rol administrativo

Cuando el usuario posee una sesión válida pero su rol no es `Administrator`:

```text
User
 │
 ├── authenticated = true
 └── role = PublicUser
          │
          ▼
   ProtectedRoute
          │
          ▼
   Acceso rechazado
```

El usuario no debe poder visualizar el Dashboard administrativo.

El comportamiento concreto ante el rechazo debe respetar la arquitectura existente del Dashboard. Puede utilizarse una redirección a una pantalla apropiada o una pantalla de acceso no autorizado.

No se debe enviar al usuario a Login simplemente porque no posee permisos si la sesión continúa siendo válida.

La autenticación y la autorización deben mantenerse conceptualmente separadas.

---

## Usuario administrador

Cuando el usuario está autenticado y posee:

```text
role = Administrator
```

debe poder acceder normalmente al Dashboard.

```text
Administrator
      │
      ▼
ProtectedRoute
      │
      ▼
Dashboard
```

No debe solicitarse nuevamente email y contraseña.

---

## Estado de carga

La validación del usuario autenticado debe respetar el estado de inicialización de sesión existente.

Mientras `useAuth` todavía esté determinando si existe una sesión válida:

```text
Inicializando sesión
        │
        ▼
No redirigir prematuramente
        │
        ▼
Resolver autenticación
        │
        ├── No autenticado → Login
        │
        ├── PublicUser → Acceso rechazado
        │
        └── Administrator → Dashboard
```

No debe producirse un parpadeo del Dashboard antes de determinar el estado final de autenticación y autorización.

---

## Refresh Token

Esta task no debe modificar el mecanismo de Refresh Token.

Debe continuar utilizándose:

- Access Token.
- Refresh Token.
- Cookie `HttpOnly`.
- Refresh Token Rotation.
- Interceptor existente.
- Endpoint de refresh existente.

Si el Access Token expira mientras el usuario está navegando por el Dashboard, el mecanismo existente debe continuar renovando la sesión.

Una renovación exitosa debe conservar la información de identidad necesaria para determinar el rol del usuario.

---

## Logout

Esta task no debe modificar el comportamiento existente de logout.

Al cerrar sesión:

```text
Logout
  │
  ▼
Limpiar sesión
  │
  ▼
/login
```

Si posteriormente el usuario intenta acceder directamente a una ruta protegida del Dashboard, `ProtectedRoute` debe volver a impedir el acceso.

---

## Backend

Esta task no debe implementar autorización administrativa en endpoints Backend.

Actualmente todavía no existen funcionalidades administrativas que requieran autorización exclusiva por rol.

La protección de recursos administrativos será implementada en las User Stories correspondientes.

El Backend continuará siendo la autoridad final para autorizar operaciones administrativas cuando dichas operaciones sean implementadas.

El frontend no debe considerarse un mecanismo de seguridad suficiente.

---

## Public Web

No modificar el comportamiento del Public Web.

Un usuario con rol `Administrator` debe poder utilizar el Public Web normalmente.

El rol `Administrator` no debe impedir el acceso a funcionalidades públicas.

Conceptualmente:

```text
                    User
                     │
             ┌───────┴───────┐
             │               │
        Public Web        Dashboard
             │               │
     PublicUser /       Administrator
     Administrator
```

El Dashboard es el que restringe su navegación a usuarios con rol administrativo.

---

## Seguridad

Verificar que:

- No se utilicen emails para determinar administradores.
- No existan listas hardcodeadas de administradores.
- No se almacenen nuevas credenciales.
- No se modifique el manejo de Refresh Tokens.
- No se modifique el manejo de passwords.
- No se expongan tokens en la UI.
- No se implemente autorización administrativa real únicamente en frontend.
- El frontend solamente controle el acceso visual y la navegación.
- La autorización de operaciones administrativas continúe dependiendo del Backend.

---

## Archivos a evaluar

Como mínimo revisar:

```text
dashboard/app/router/protected-route.tsx

dashboard/app/router/routes.tsx

dashboard/features/authentication/hooks/use-auth.ts

dashboard/store/auth-store.ts
```

También revisar los tipos existentes relacionados con:

```text
User

AuthResponse

UserRole
```

No modificar archivos que no sean necesarios para implementar esta funcionalidad.

---

## Documentación

Actualizar únicamente la documentación que resulte necesaria como consecuencia de la implementación.

Como mínimo evaluar:

```text
project/pages.md
project/components.md
project/dashboard-architecture.md
```

Documentar que el Dashboard requiere:

```text
Authenticated User
        +
Administrator role
```

No documentar esta protección frontend como mecanismo de autorización de seguridad.

---

## Criterios de aceptación

### CA-01 — Administrador puede acceder

**Dado** un usuario autenticado

**Y** con rol `Administrator`

**Cuando** accede a `/`

**Entonces** puede visualizar el Dashboard.

### CA-02 — Usuario público no puede acceder

**Dado** un usuario autenticado

**Y** con rol `PublicUser`

**Cuando** intenta acceder a `/`

**Entonces** no debe visualizar el Dashboard administrativo.

### CA-03 — Usuario no autenticado

**Dado** un usuario sin sesión válida

**Cuando** intenta acceder a una ruta protegida

**Entonces** debe ser redirigido a `/login`.

### CA-04 — No utilizar email

El acceso al Dashboard no debe depender del email del usuario.

### CA-05 — No modificar autenticación

La implementación no debe crear un mecanismo paralelo de autenticación.

### CA-06 — Refresh

**Dado** un administrador autenticado

**Cuando** expira el Access Token

**Entonces** el mecanismo existente de Refresh Token debe continuar funcionando.

### CA-07 — Logout

**Dado** un administrador autenticado

**Cuando** cierra sesión

**Entonces** debe ser redirigido a `/login`

**Y** no debe poder regresar al Dashboard utilizando una sesión inválida.

### CA-08 — Public Web

**Dado** un usuario con rol `Administrator`

**Cuando** utiliza el Public Web

**Entonces** puede utilizar normalmente las funcionalidades públicas.

### CA-09 — Backend

La implementación no debe agregar ni modificar autorización de endpoints administrativos Backend.

---

## Resultado esperado

El Dashboard debe quedar restringido visualmente y mediante navegación a usuarios con rol `Administrator`.

El comportamiento debe quedar diferenciado de la autenticación:

```text
Autenticación
    ↓
¿Quién es el usuario?

Autorización Backend
    ↓
¿Qué puede hacer?

Protección Dashboard
    ↓
¿Puede acceder a la aplicación administrativa?
```

La task debe limitarse a esta protección frontend y no introducir cambios innecesarios en el sistema de identidad.

---

## Reporte de implementación

### Implementación

- Componentes creados o modificados:
  - `dashboard/pages/unauthorized-page.tsx` creado.
  - `dashboard/app/router/protected-route.tsx` modificado para validar rol.
- `ProtectedRoute` modificado: ahora verifica `isAuthenticated`, presencia de `user` y `user.role === 'Administrator'`.
- Servicios modificados: ninguno.
- Store de autenticación modificado: ninguno.
- Tipos o modelos modificados: ninguno.
- Rutas modificadas: ninguna (se reutilizan las rutas existentes protegidas por `ProtectedRoute`).

### Autenticación

- Sesión válida determinada por `useAuth` consultando `/api/users/me` con token en `sessionStorage`.
- Usuario autenticado obtenido desde respuesta de `/api/users/me` mapeada a `User`.
- Rol obtenido desde campo `role` del objeto `User`.
- Estado de carga respetado: mientras `isLoading` es true, no se redirige prematuramente.

### Autorización de navegación

- `Administrator`: accede al Dashboard.
- `PublicUser`: se muestra `UnauthorizedPage`.
- No autenticado: redirigido a `/login`.
- Pantalla utilizada para usuarios sin permisos: `UnauthorizedPage`.

### Refresh Token

- No se modificó el mecanismo existente.
- El refresh continúa funcionando mediante interceptor y cookie `HttpOnly`.
- El rol continúa disponible después de renovar la sesión porque `/api/users/me` lo incluye en la respuesta.

### Logout

- El logout existente continúa funcionando.
- Una sesión cerrada no permite volver al Dashboard porque `ProtectedRoute` detecta `isAuthenticated = false`.

### Public Web

- Un usuario `Administrator` continúa pudiendo utilizar el Public Web normalmente.
- La restricción de rol aplica únicamente a las rutas del Dashboard protegidas por `ProtectedRoute`.

### Seguridad

- No se utilizan emails hardcodeados.
- No existen listas de administradores en frontend.
- No se almacenan credenciales nuevas.
- No se implementó autorización Backend como parte de esta task.

### Documentación

- `project/pages.md` actualizado: se agregó `UnauthorizedPage` y se especificó que Dashboard Layout y Home requieren rol `Administrator`.
- `project/components.md` actualizado: se agregó `UnauthorizedPage` y se indicó que `DashboardLayout` está protegido por `ProtectedRoute` con validación de rol.
- `project/dashboard-architecture.md` actualizado: se agregó en sección 34 que el frontend puede restringir el acceso visual al Dashboard a usuarios con rol `Administrator`.

### Compilación

- Comando utilizado: `npm run build`.
- Resultado: exitoso.
- Cantidad de errores: 0.
- Cantidad de warnings: 0.

### Problemas encontrados

- No se encontraron inconsistencias entre `UserRole`, `AuthResponse`, `User`, `auth-store`, `useAuth`, `ProtectedRoute`, routing ni contratos Backend.
- No fue necesario modificar el diseño originalmente previsto.: