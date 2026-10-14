# TASK-PUBLIC-WEB-0037 — Implementar pantalla Mi Perfil

## Objetivo

Implementar la pantalla de edición del perfil del usuario autenticado utilizando el template HTML existente para la pantalla de perfil como referencia visual.
Template: \read comics\partirtura read comics\ux_ui\edit-profile.html

## Alcance

- Crear la página React correspondiente a Mi Perfil.
- Implementar el formulario de edición de:
  - Nombre.
  - Apellido.
  - Nacionalidad.
- Mostrar email como dato informativo, sin permitir su modificación.
- Mostrar el avatar actual.
- Permitir seleccionar un nuevo avatar.
- Permitir eliminar la nacionalidad.
- Integrar el formulario con `PUT /api/users/me`.
- Integrar la actualización del avatar con `POST /api/users/me/avatar`.
- Utilizar los componentes existentes del proyecto cuando corresponda.

## Nacionalidad

La nacionalidad es opcional.

El usuario debe poder:

- Seleccionar una nacionalidad.
- Cambiar la nacionalidad.
- Dejarla vacía.
- Eliminar una nacionalidad previamente seleccionada.

No debe existir ninguna validación frontend que obligue a seleccionar nacionalidad.

## Avatar

El avatar debe utilizar `avatarUrl`.

No se debe almacenar ni manipular `StoragePath`.

Para mostrar un avatar local, utilizar la URL devuelta por el backend:

`/images/{id}`

La imagen será solicitada por el navegador al endpoint autenticado del backend.

No implementar autenticación adicional para las imágenes.

## Actualización

Al guardar:

- Enviar únicamente los datos permitidos por `PUT /api/users/me`.
- No enviar email como campo modificable.
- No enviar información de autenticación.
- Actualizar inmediatamente la información visible del usuario después de una actualización exitosa.

## Criterios de aceptación

- La pantalla utiliza el diseño definido en el template.
- El usuario puede modificar nombre y apellido.
- El usuario puede modificar o eliminar su nacionalidad.
- El email no puede modificarse.
- El usuario puede cambiar su avatar.
- El avatar actualizado se refleja en la pantalla y en el Index.
- No se manipulan rutas internas de storage.
- No se crea un mecanismo paralelo de autenticación.
- TypeScript compila correctamente.

---
Result:
Completed.

Completed work:
- Created `pages/profile-page.tsx` implementing the profile edit screen based on `ux_ui/edit-profile.html`.
- Added `UpdateProfileRequest` and `UpdateAvatarRequest` types to `types/api.ts`.
- Added `updateProfile()` and `updateAvatar()` methods to `AuthenticationRepository`.
- Added `refreshProfile()` to `use-auth.tsx` to reload profile data from the backend after updates.
- The form allows editing firstName, lastName, and countryId (nationality), with email displayed as read-only.
- Nationality is optional; users can select, change, or remove it using the select field with a "Sin nacionalidad" option.
- Avatar upload uses `POST /api/users/me/avatar` with `FormData`. The preview updates immediately and the change is reflected in the Index via `refreshProfile()`.
- Local avatar URLs (`/images/{id}`) are resolved against the browser origin in `profile-page.tsx`.
- The page uses the existing navbar, search bar, and `UserMenu` component.
- On successful save, the form shows a success message and refreshes the profile state.
- On error, the form shows a generic error message without exposing sensitive details.

Validation:
- TypeScript compilation passes with `npm run typecheck`.
- The design matches the template HTML.
- The page is responsive.
- No storage paths or internal server routes are accessed from the frontend.
- No parallel authentication mechanism was created.

Notes:
- No new reusable components were created, so `components.md` was not modified.
- `pages.md` was updated to document the new `/profile` route.