# TASK-DASH-0045 — Separar operaciones de usuarios y baneos del servicio de autenticación

## Objetivo

Refactorizar `auth.service.ts` para que cada feature contenga exclusivamente sus propias operaciones.

Actualmente, `features/authentication/services/auth.service.ts` contiene métodos que pertenecen a otras features:
- `getUsers`
- `getUserById`
- `getActiveUsersForBan`

Esto viola la arquitectura feature-based definida en `dashboard-architecture.md`.

## Alcance

Mover las operaciones de usuarios a un servicio propio dentro de `features/users/services/`.
Mover las operaciones de baneos a un servicio propio dentro de `features/bans/services/`.

Actualizar todos los imports que referencian estos métodos desde `auth.service.ts`.

## Criterio de aceptación

- `auth.service.ts` contiene únicamente operaciones de autenticación.
- Los servicios de usuarios y baneos exponen los métodos movidos.
- No existen referencias rotas a `authService.getUsers`, `authService.getUserById` o `authService.getActiveUsersForBan`.
- El Dashboard compila correctamente.
- No se introducen regresiones funcionales.

## Archivos afectados

- `dashboard/dashboard/features/authentication/services/auth.service.ts`
- `dashboard/dashboard/features/users/services/` (nuevo o existente)
- `dashboard/dashboard/features/bans/services/ban.service.ts`
- Páginas que consumen estos métodos.

## Assigned to

Dashboard Agent

## Resultado de la ejecución

### Cambios realizados

1. **`features/users/services/user.service.ts` (nuevo)**: creado con `getUsers` y `getUserById`.
2. **`features/bans/services/ban.service.ts`**: agregadas `getActiveUsersForBan` y `deactivateBan`.
3. **`features/authentication/services/auth.service.ts`**: eliminadas las operaciones de usuarios y baneos. Ahora solo contiene operaciones de autenticación.
4. **`pages/users-page.tsx`**: actualizado import a `user.service.ts`.
5. **`pages/bans-select-user-page.tsx`**: actualizado import a `ban.service.ts`.

### Validación

- `tsc -b --noEmit`: sin errores.
- `vite build`: exitoso.
- No quedan referencias a `authService.getUsers`, `authService.getUserById` ni `authService.getActiveUsersForBan`.

