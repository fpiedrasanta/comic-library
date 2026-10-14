# TASK-DASH-0011 — Mejorar navegación de UnauthorizedPage

## Objetivo

Mejorar la experiencia del usuario autenticado que no posee el rol `Administrator` y es rechazado por `ProtectedRoute`.

Actualmente `UnauthorizedPage` informa que el usuario no posee permisos, pero no ofrece una acción clara para continuar.

## Alcance

Modificar:

- `dashboard/pages/unauthorized-page.tsx`

No modificar la lógica de autenticación ni autorización de `ProtectedRoute`.

## Comportamiento

Cuando un usuario autenticado con rol distinto de `Administrator` accede al Dashboard:

- Debe visualizar `UnauthorizedPage`.
- Debe recibir un mensaje claro indicando que no posee permisos para acceder al panel administrativo.
- Debe poder cerrar sesión.
- Debe poder regresar al sitio público.

## Logout

Utilizar el mecanismo de logout existente.

No implementar un mecanismo de logout paralelo.

Al cerrar sesión:

- Revocar la sesión mediante el endpoint existente.
- Limpiar el estado de autenticación mediante el store existente.
- Eliminar el Access Token almacenado por el mecanismo actual.
- Redirigir al usuario al Login del Dashboard.

## Sitio público

Agregar una acción para regresar al Public Web.

Utilizar la configuración existente para determinar la URL del Public Web.

No hardcodear una URL de producción si el proyecto ya dispone de configuración para distintos ambientes.

## Seguridad

- No utilizar emails para determinar permisos.
- No agregar listas de usuarios autorizados en frontend.
- No modificar el rol del usuario.
- No modificar `ProtectedRoute`.
- No modificar el mecanismo de autenticación existente.

## Diseño

Mantener la identidad visual del Dashboard y el lenguaje visual utilizado por las demás pantallas.

La página debe funcionar correctamente en desktop y mobile.

## Documentación

Actualizar únicamente la documentación necesaria si la página o sus acciones no se encuentran correctamente documentadas.

Revisar:

- `project/pages.md`
- `project/components.md`

## Verificación técnica

- Dashboard compila correctamente.
- 0 errores.
- 0 warnings nuevos.
- Logout funciona utilizando el mecanismo existente.
- El enlace al Public Web utiliza configuración existente.
- Un `PublicUser` no queda atrapado en `UnauthorizedPage`.

## Resultado esperado

Un usuario autenticado sin permisos administrativos recibe una respuesta clara y puede salir del Dashboard o continuar hacia el Public Web sin quedar atrapado en una pantalla sin navegación.

# Reporte de implementación

### Cambios realizados

- `dashboard/pages/unauthorized-page.tsx`: agregados botones de "Cerrar sesión" y "Ir al sitio público".
- `dashboard/.env`, `.env.development`, `.env.test`, `.env.production`: agregada variable `VITE_PUBLIC_WEB_URL`.
- `dashboard/vite.config.ts`: agregado proxy de `/api` a `http://localhost:5000` para desarrollo.
- No se modificó `ProtectedRoute` ni la lógica de autenticación.

### Navegación

- Botón "Cerrar sesión": ejecuta `logout()` del hook existente, limpia sesión y redirige a `/login`.
- Botón "Ir al sitio público": navega a `VITE_PUBLIC_WEB_URL` (valor por defecto `http://localhost:5173` en desarrollo, `https://comiclibrary.com` en producción).
- No se hardcodeó la URL; se configura mediante variable de entorno.

### Logout

- Se reutiliza el mecanismo existente (`authService.logout` + store + redirección a `/login`).
- No se implementó un mecanismo paralelo.

### Proxy

- Se agregó proxy en `vite.config.ts` para que las requests a `/api` se redirijan a `http://localhost:5000`.
- Esto permite que las cookies `HttpOnly` funcionen correctamente en desarrollo sin problemas de dominio.
- En desarrollo, el Dashboard corre en `localhost:5173` y el proxy reenvía `/api` al backend en `localhost:5000`.

### Variables de entorno

- `VITE_PUBLIC_WEB_URL`: URL del Public Web.
- `VITE_API_BASE_URL`: se mantiene en `/api` para desarrollo/test y `https://api.comiclibrary.com/api` para producción.
- En desarrollo, `VITE_API_BASE_URL=/api` + proxy de Vite reenvía al backend.

### Seguridad

- No se utilizan emails para determinar permisos.
- No se agregaron listas de usuarios autorizados en frontend.
- No se modificó el rol del usuario.
- No se modificó `ProtectedRoute`.
- No se modificó el mecanismo de autenticación existente.

### Responsive

- La página se adapta correctamente a desktop y mobile.
- En mobile, los botones se apilan verticalmente.

### Compilación

- Comando utilizado: `npm run build`.
- Resultado: exitoso.
- Errores: 0.
- Warnings: 0.

### Problemas encontrados

- No se encontraron inconsistencias entre la implementación actual y la arquitectura existente.
- El proxy soluciona el problema de cookies en desarrollo.