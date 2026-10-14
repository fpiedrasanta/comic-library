# TASK-PUBLIC-WEB-0035 — Implementar el Index autenticado a partir del template HTML

## Objetivo

Implementar en Public Web el Index autenticado de Comic Library utilizando como referencia visual y funcional el template HTML proporcionado para el Index.

El template HTML ya contiene el maquetado completo de la pantalla y debe utilizarse como referencia para reproducir la interfaz dentro de la arquitectura React existente.

Template: \read comics\partirtura read comics\ux_ui\index-template.html

## Alcance

- Crear la página/componente correspondiente al Index autenticado.
- Trasladar el maquetado existente del template HTML a React.
- Mantener la estructura visual, estilos, responsive design y distribución definidos en el template.
- Reutilizar los componentes existentes del proyecto cuando corresponda.
- Mantener Tailwind CSS y las convenciones actuales del proyecto.
- Implementar el header/navbar autenticado.
- Implementar el menú de usuario desplegable.
- Implementar el contenido principal del Index.
- Implementar el footer.
- Mantener las secciones visuales existentes:
  - Saludo de bienvenida.
  - Continuar lectura.
  - Recomendados del catálogo.
  - Navegación principal.
  - Buscador.
  - Menú de usuario.

## Datos

En esta task los datos del catálogo, lecturas y recomendaciones pueden permanecer estáticos/mockeados si todavía no existen endpoints correspondientes.

Sin embargo, los datos básicos del usuario autenticado no deben quedar hardcodeados cuando ya estén disponibles mediante el estado de autenticación o los servicios existentes.

El avatar debe utilizar el campo `avatarUrl` proporcionado por el backend.

Si `avatarUrl` es `null`, la interfaz debe utilizar el comportamiento visual definido para usuarios sin avatar.

## Menú de usuario

El menú debe reproducir el comportamiento del template:

- Mostrar avatar.
- Mostrar nombre del usuario.
- Mostrar email cuando corresponda.
- Mostrar las opciones:
  - Editar Perfil.
  - Mi Biblioteca.
  - Configuración.
  - Cerrar Sesión.
- El menú debe abrirse/cerrarse mediante interacción del usuario.
- Debe cerrarse al hacer click fuera del menú.
- No utilizar el JavaScript del template HTML; implementar el comportamiento mediante React.

La opción `Editar Perfil` debe quedar preparada para navegar posteriormente a la pantalla de perfil.

## Navegación

La navegación debe integrarse con el sistema de routing existente.

Por el momento deben quedar identificadas las rutas correspondientes a:

- Index.
- Mi Perfil.
- Mi Biblioteca.
- Configuración.
- Logout.

No es necesario implementar las pantallas de Mi Biblioteca ni Configuración si todavía no forman parte del alcance de la US.

## Autenticación

- El Index debe ser una página protegida.
- Un usuario no autenticado no debe poder acceder al Index.
- Debe reutilizarse el mecanismo de autenticación existente.
- No crear un mecanismo paralelo de autenticación.
- No almacenar tokens adicionales.

## Template de referencia

El template HTML entregado para esta task es la fuente visual de verdad para el Index.

No se debe reinterpretar el diseño ni crear una nueva propuesta visual.

## Documentación

Actualizar `project/pages.md` para documentar la nueva página Index y su ruta.

Actualizar `project/components.md` únicamente si se crean componentes reutilizables nuevos.

## Criterios de aceptación

- El Index existe como página React dentro de Public Web.
- El resultado visual corresponde al template HTML proporcionado.
- El diseño es responsive.
- El menú de usuario funciona correctamente.
- El avatar y los datos básicos del usuario no están hardcodeados.
- La página está protegida mediante el mecanismo de autenticación existente.
- La opción `Editar Perfil` queda preparada para navegar a la pantalla de perfil.
- No se utilizan scripts JavaScript provenientes del template.
- TypeScript compila correctamente.

---
Result:
Completed.

Completed work:
- Created `pages/index-page.tsx` implementing the authenticated Index page based on `ux_ui/index-template.html`.
- Created `app/router/protected-route.tsx` to protect authenticated routes using the existing `useAuth` mechanism.
- Created `features/authentication/components/user-menu.tsx` as a reusable component for the authenticated user dropdown menu with avatar, name, email, and navigation options.
- Updated `app/router/routes.tsx` to add the `/index` route protected by `ProtectedRoute`.
- Updated `project/pages.md` to document the new Index page.
- Updated `project/components.md` to document the new `UserMenu` component.
- The page uses dynamic user data from `useAuth` (fullName, email, avatarUrl, role) instead of hardcoded values.
- The avatar falls back to the user's initial when `avatarUrl` is null.
- The user menu supports open/close behavior and closes on outside click using React event handling.
- Navigation links for Index, Mi Biblioteca, Configuración, and Logout are integrated with React Router.
- The page includes the sections: welcome greeting, continue reading, recommended catalog, search bar, and footer.
- Data for comics and recommendations is mocked as specified in the task requirements.
- Traditional login and Google login users share the same session and see the same Index page.

Validation:
- TypeScript compilation passes with `npm run typecheck`.
- The visual design matches the template HTML.
- The page is responsive.
- The user menu works correctly with click-outside closing.
- The page is protected; unauthenticated users are redirected to `/login`.
- No JavaScript from the template HTML was used; all behavior is implemented in React.