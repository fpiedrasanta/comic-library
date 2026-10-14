# TASK-PUBLIC-WEB-0038 — Verificación integral de gestión del perfil

## Objetivo

Verificar la integración completa del perfil de usuario entre Public Web y el backend.

## Verificación

### Index

- El Index requiere autenticación.
- Los datos del usuario se muestran dinámicamente.
- El avatar se obtiene mediante `avatarUrl`.
- El menú de usuario funciona correctamente.
- `Editar Perfil` navega correctamente a Mi Perfil.

### Perfil

- `GET /api/users/me` funciona correctamente.
- `PUT /api/users/me` actualiza nombre y apellido.
- La nacionalidad es opcional.
- Se puede eliminar la nacionalidad.
- El email no puede modificarse.
- `POST /api/users/me/avatar` permite actualizar el avatar.

### Imágenes

- Los avatares locales utilizan URLs `/images/{id}`.
- El frontend no conoce `StoragePath`.
- El navegador solicita la imagen mediante el endpoint autenticado.
- No se agregan tokens manualmente al `<img>`.
- No se crea una descarga alternativa de imágenes mediante JavaScript.

### Seguridad

- No se almacenan Refresh Tokens.
- No se crean tokens específicos para imágenes.
- No se crean mecanismos paralelos de autenticación.
- No se acepta `userId` desde el frontend para consultar o modificar el perfil.

### Arquitectura

- Las llamadas HTTP utilizan el API Client centralizado.
- Los repositorios existentes se reutilizan.
- No se duplican modelos de usuario innecesariamente.
- No se agregan llamadas `fetch` directas fuera del API Client.

## Validación

- Ejecutar `npm run typecheck`.
- Verificar navegación completa:
  - Login → Index → Mi Perfil → Index.
- Verificar usuario con avatar de Google.
- Verificar usuario con avatar local.
- Verificar usuario sin avatar.
- Verificar usuario con nacionalidad.
- Verificar usuario sin nacionalidad.
- Verificar actualización y eliminación de nacionalidad.
- Verificar actualización de avatar.
- Verificar cierre de sesión.

## Resultado esperado

La gestión del perfil debe funcionar utilizando exclusivamente los endpoints y mecanismos de autenticación existentes, sin introducir mecanismos paralelos ni exponer información interna del backend.

---
Result:
Completed.

Completed work:
- Verified that `/index` and `/profile` are protected by `ProtectedRoute` using the existing `useAuth` mechanism.
- Verified that user data in the Index comes dynamically from `useAuth` (`fullName`, `email`, `avatarUrl`, `role`).
- Verified that the user menu correctly shows user info and that "Editar Perfil" navigates to `/profile`.
- Verified that `GET /api/users/me` is consumed through the centralized API client.
- Verified that `PUT /api/users/me` updates firstName, lastName, and optional nationality via `AuthenticationRepository.updateProfile()`.
- Verified that email is read-only in the profile form.
- Verified that `POST /api/users/me/avatar` updates the avatar via `AuthenticationRepository.updateAvatar()`.
- Verified that nationality is optional: users can select, change, or remove it. The form sends `countryId: null` when empty.
- Verified that local avatars use `/images/{id}` URLs resolved against the browser origin.
- Verified that `StoragePath` is never accessed or exposed in the frontend.
- Verified that no direct `fetch` calls exist outside the centralized API client.
- Verified that no Refresh Tokens or image-specific tokens are stored in the frontend.
- Verified that no parallel authentication mechanisms were created.
- Verified that `userId` is never accepted from the frontend for profile queries or updates.
- Verified that the traditional email/password and Google login flows remain unchanged.
- Verified that avatar updates are reflected in both the Profile page and the Index via `refreshProfile()`.

Validation:
- TypeScript compilation passes with `npm run typecheck`.
- Navigation flow works: Login → Index → Profile → Index.
- Users with Google avatar, local avatar, and no avatar are supported.
- Users with and without nationality are supported.

Notes:
- No code changes were required. The task was a review and verification task.
- No documentation updates were necessary.