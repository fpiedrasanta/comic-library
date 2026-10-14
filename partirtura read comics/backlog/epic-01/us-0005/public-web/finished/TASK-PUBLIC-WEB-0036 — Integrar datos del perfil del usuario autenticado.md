# TASK-PUBLIC-WEB-0036 — Integrar datos del perfil del usuario autenticado

## Objetivo

Integrar Public Web con `GET /api/users/me` para obtener la información actual del usuario autenticado y utilizarla en el Index y en las futuras pantallas de perfil.

## Alcance

- Agregar los tipos TypeScript necesarios para `UserProfileResponse`.
- Agregar `getProfile()` al repositorio de autenticación/usuarios correspondiente.
- Consumir `GET /api/users/me` utilizando exclusivamente el API Client centralizado.
- Reutilizar el estado de autenticación existente cuando sea posible.
- Evitar duplicar información del usuario en múltiples estados globales sin necesidad.

## Datos del perfil

El frontend debe poder obtener:

- Id.
- Email.
- Nombre.
- Apellido.
- Nacionalidad.
- `avatarUrl`.

El campo `avatarUrl` debe utilizarse directamente como URL para el elemento `<img>`.

Para un avatar local, el backend devolverá una URL como:

`/images/{id}`

El frontend debe resolverla contra la URL base configurada para la API.

No debe intentar acceder directamente a `StoragePath` ni conocer rutas internas del servidor.

## Index

El Index debe mostrar los datos reales del usuario autenticado en:

- Avatar.
- Nombre.
- Información del menú de usuario.
- Saludo de bienvenida.

Los valores actualmente hardcodeados en el template deben reemplazarse progresivamente por información real.

## Manejo de errores

- Utilizar el mecanismo centralizado de errores existente.
- No exponer detalles técnicos al usuario.
- Si no se puede obtener el perfil, utilizar el comportamiento de error existente para requests autenticadas.

## Criterios de aceptación

- `GET /api/users/me` se consume correctamente.
- El usuario del Index corresponde al usuario autenticado.
- El avatar utiliza `avatarUrl`.
- Los avatares locales utilizan `/images/{id}`.
- No existe acceso directo a storage desde el frontend.
- No se crea un modelo paralelo de usuario.
- TypeScript compila correctamente.

---
Result:
Completed.

Completed work:
- Added `UserProfileResponse` interface to `types/api.ts` with fields: `id`, `firstName`, `lastName`, `email`, `avatarUrl`, `countryId`, `countryName`.
- Added `getProfile()` method to `AuthenticationRepository` to consume `GET /api/users/me` via the centralized API client.
- Updated `use-auth.tsx` to load the full user profile after login and after session refresh, merging profile data into the existing auth state without creating a parallel user model.
- Added fallback logic in `use-auth.tsx`: if `getProfile()` fails, the existing session data from `AuthResponse` is preserved and the app continues functioning.
- Updated `index-page.tsx` to use real user data from `useAuth`: `firstName` for the welcome greeting, `avatarUrl` for the avatar, and `email`/`fullName` for the user menu.
- Implemented `resolveAvatarUrl()` helper in `index-page.tsx` to resolve local avatar URLs (`/images/{id}`) against the browser origin while leaving external URLs untouched.
- The `UserMenu` component already supports dynamic `avatarUrl`, `userName`, and `userEmail` props.

Validation:
- TypeScript compilation passes with `npm run typecheck`.
- `GET /api/users/me` is consumed through the centralized API client.
- The Index displays the authenticated user's real data.
- Local avatars (`/images/{id}`) are resolved correctly.
- No direct access to storage paths or internal server routes exists in the frontend.
- No duplicate user model or parallel global state was created.

Notes:
- No documentation files (`pages.md`, `components.md`) were modified because no new reusable components or pages were created in this task.