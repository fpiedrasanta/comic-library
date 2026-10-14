# TASK-DASH-0050 — Obtener datos de edición vía API en lugar de location.state

## Objetivo

Reemplazar la obtención de datos por `location.state` en las pantallas de edición por consultas directas a la API.

## Hallazgos

### AdminFormPage

En modo edición, obtiene el administrador desde `location.state` en lugar de llamar a `GET /api/admin-users/{userId}`.

Si el administrador recarga la página en `/admins/:id/edit`, `location.state` es `null` y la pantalla queda vacía o con errores.

### BanFormPage

En modo edición, obtiene el baneo desde `location.state` en lugar de llamar a `GET /api/bans/{banId}` y `GET /api/users/{userId}`.

Mismo problema de recarga de página.

## Alcance

- `AdminFormPage`: cargar datos vía `adminService` o endpoint específico en `useEffect`.
- `BanFormPage`: cargar ban y usuario vía API en `useEffect`.
- Mantener redirección si el recurso no existe.

## Criterio de aceptación

- Las páginas de edición obtienen sus datos exclusivamente desde la API.
- La recarga de página en modo edición no pierde los datos.
- Los estados de loading y error se muestran correctamente.
- El Dashboard compila sin errores TypeScript.

## Assigned to

Dashboard Agent

## Resultado de la ejecución

### Cambios realizados

1. **`features/users/services/admin.service.ts`**: agregado `getAdminById(userId)` que consulta `GET /admin-users/{userId}`.
2. **`features/bans/services/ban.service.ts`**: agregado `getBanById(banId)` que consulta `GET /bans/{banId}`. Actualizado import de tipos.
3. **`pages/admin-form-page.tsx`**:
   - En modo edición, extrae `adminId` de la ruta con regex `/admins/(\d+)/edit`.
   - Carga datos vía `getAdminById` en `useEffect`.
   - Muestra estados de loading y error con early returns.
   - Eliminada dependencia de `location.state` para datos de edición.
4. **`pages/ban-form-page.tsx`**:
   - En modo edición, extrae `banId` de la ruta con regex `/bans/(\d+)/edit`.
   - Carga datos vía `getBanById` en `useEffect`.
   - Muestra estados de loading y error con early returns.
   - Eliminada dependencia de `location.state` para datos de edición.

### Validación

- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.
- La recarga de página en modo edición no pierde los datos.
- Estados de loading y error se muestran correctamente.

