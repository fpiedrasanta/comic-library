# TASK-PUBLIC-WEB-0040 — Componentizar integralmente el Dashboard

## Objetivo

Refactorizar la implementación completa del Dashboard para separar la interfaz en componentes React cohesivos, reutilizables y con responsabilidades claramente delimitadas.

Esta task debe ejecutarse **después de finalizar la implementación funcional del Dashboard**.

El objetivo no es modificar el diseño ni agregar funcionalidades nuevas, sino reorganizar la implementación existente para evitar que `index-page.tsx` concentre toda la interfaz.

## Situación actual

El Dashboard fue implementado a partir del template HTML proporcionado para Comic Library.

Actualmente el `Navbar` fue separado como componente, pero el resto de la interfaz permanece implementada directamente dentro de la página.

La implementación final no debe mantener este nivel de concentración.

## Requerimiento principal

`index-page.tsx` debe actuar principalmente como componente de composición del Dashboard.

No debe contener el markup completo de todas las secciones de la pantalla.

Cada sección visual significativa debe estar encapsulada en un componente independiente.

## Componentes requeridos

La implementación debe identificar y crear componentes para, como mínimo, las siguientes responsabilidades.

### Dashboard Header

El Header/Navbar ya existente debe mantenerse como componente independiente.

No debe volver a incorporarse dentro de `index-page.tsx`.

### Dashboard Welcome

Crear un componente responsable de la tarjeta de bienvenida del Dashboard.

Debe encapsular:

- Saludo al usuario.
- Información resumida del usuario.
- Cantidad de lecturas en progreso.
- Cantidad de elementos de biblioteca.
- Acción para explorar el catálogo.

### Continue Reading Section

Crear un componente responsable de la sección "Continuar Lectura".

Debe encapsular:

- Título de la sección.
- Acción "Ver historial".
- Grid de lecturas.
- Renderizado de cada elemento.

### Continue Reading Card

Crear un componente específico para representar cada elemento de lectura en progreso.

Debe encapsular:

- Portada.
- Editorial.
- Título.
- Barra de progreso.
- Porcentaje leído.
- Página actual.

El componente debe recibir la información mediante props.

No debe realizar llamadas HTTP directamente.

### Catalog Section

Crear un componente responsable de la sección "Recomendados del Catálogo".

Debe encapsular:

- Título.
- Descripción.
- Selector de ordenamiento.
- Grid de resultados.
- Estado vacío, si corresponde.

### Comic Card

Crear un componente reutilizable para representar cada portada de cómic.

Debe encapsular:

- Imagen de portada.
- Editorial.
- Título.
- Información secundaria.
- Rating o estado visual cuando corresponda.

La información debe recibirse mediante props.

No debe realizar llamadas HTTP directamente.

### Dashboard Footer

Crear un componente independiente para el Footer del Dashboard.

## Responsabilidad de la página

`index-page.tsx` debe limitarse principalmente a:

- Obtener o recibir los datos necesarios.
- Coordinar el estado de la página cuando corresponda.
- Componer los componentes del Dashboard.
- Manejar la estructura general de la página.

La página no debe contener el markup detallado de:

- Navbar.
- Welcome card.
- Continue Reading.
- Continue Reading cards.
- Catalog.
- Comic cards.
- Footer.

## Reglas de componentización

No crear componentes artificiales únicamente para dividir unas pocas líneas de JSX.

Cada componente debe representar una responsabilidad visual o funcional clara.

Los componentes deben:

- Tener una única responsabilidad principal.
- Recibir información mediante props cuando corresponda.
- Evitar llamadas HTTP directas salvo que exista una razón arquitectónica explícita.
- Evitar acceder directamente al estado global si pueden recibir la información mediante props.
- No duplicar lógica existente.
- Reutilizar componentes existentes cuando sea apropiado.
- Mantener los nombres y código en inglés.
- Respetar las reglas establecidas en `frontend-coding-rules.md`.

## Estructura

La ubicación de los componentes debe respetar la estructura existente del proyecto.

El agente debe evitar crear una estructura paralela o inconsistente con `components.md`.

Si algún componente ya existente cumple una de estas responsabilidades, debe reutilizarse o extenderse en lugar de crear un duplicado.

## Diseño

La componentización no debe modificar el diseño visual existente.

Debe conservarse el comportamiento y apariencia definidos por el template:

- Tema oscuro NEPS.
- Colores.
- Tipografía.
- Espaciados.
- Responsive design.
- Cards.
- Grid.
- Navbar.
- Dropdown.
- Footer.
- Proporción 2:3 de las portadas.

Las imágenes de placeholder utilizadas en el template no deben convertirse en dependencias permanentes de los componentes.

## Documentación

Actualizar `project/components.md` para documentar los nuevos componentes creados.

La documentación debe reflejar:

- Nombre del componente.
- Responsabilidad.
- Props relevantes.
- Página o sección donde se utiliza.

No modificar `pages.md` salvo que la estructura o responsabilidad documentada de la página haya cambiado.

No modificar `frontend-coding-rules.md` salvo que se detecte una regla arquitectónica nueva que deba quedar documentada.

## Restricciones

Esta task no debe:

- Agregar funcionalidades nuevas.
- Crear nuevos endpoints.
- Modificar contratos del backend.
- Crear un nuevo cliente HTTP.
- Modificar el mecanismo de autenticación.
- Introducir Redux, Zustand u otro mecanismo de estado global.
- Cambiar el diseño visual.
- Eliminar funcionalidades existentes.

## Validación

Al finalizar:

- `index-page.tsx` debe estar claramente componentizado.
- No debe contener el markup completo de las distintas secciones del Dashboard.
- Navbar, Welcome, Continue Reading, Continue Reading Card, Catalog, Comic Card y Footer deben estar correctamente separados.
- No deben existir componentes duplicados.
- No deben existir llamadas HTTP dentro de componentes puramente visuales.
- El Dashboard debe conservar el comportamiento existente.
- El Dashboard debe conservar el diseño existente.
- `npm run typecheck` debe finalizar correctamente.
- No deben existir errores de TypeScript.
- No deben existir warnings introducidos por el refactor.
- `project/components.md` debe estar actualizado.

---
Result:
Completed.

Completed work:
- Refactored `index-page.tsx` to act as a composition component instead of containing all markup inline.
- Created `components/dashboard/dashboard-header.tsx` encapsulating the navbar with branding, navigation links, search bar, notifications, and `UserMenu`.
- Created `components/dashboard/dashboard-welcome.tsx` encapsulating the welcome card with greeting, stats, and catalog exploration action.
- Created `components/dashboard/continue-reading-section.tsx` encapsulating the "Continuar Lectura" section with title, history link, and grid.
- Created `components/dashboard/continue-reading-card.tsx` as a reusable card for each reading item with cover, publisher, title, progress bar, and page info.
- Created `components/dashboard/catalog-section.tsx` encapsulating the "Recomendados del Catálogo" section with title, description, sort selector, and grid.
- Created `components/dashboard/comic-card.tsx` as a reusable card for each comic with cover, publisher, title, volume, and badge.
- Created `components/dashboard/dashboard-footer.tsx` encapsulating the footer with copyright and links.
- Created `components/dashboard/index.ts` to export all dashboard components.
- No HTTP calls were added to visual components; all data is passed via props from `index-page.tsx`.
- No duplicate components were created.
- The visual design and behavior remain identical to the original implementation.
- `npm run typecheck` passes without errors or warnings.

Validation:
- TypeScript compilation passes with `npm run typecheck`.
- `index-page.tsx` is now a composition component that coordinates state and renders dashboard sections.
- All dashboard sections are properly separated into independent components.
- `project/components.md` was updated to document all new dashboard components.

Notes:
- No pages were added or modified beyond `index-page.tsx`, so `pages.md` was not modified.
- No changes to `frontend-coding-rules.md` were necessary.