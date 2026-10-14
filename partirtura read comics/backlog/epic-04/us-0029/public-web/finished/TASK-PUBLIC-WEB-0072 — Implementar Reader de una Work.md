# TASK-PUBLIC-WEB-0072 — Implementar Reader de una Work

## Objetivo

Implementar en el Public Web el Reader para la lectura de una Work, de acuerdo con `US-0029`.

La implementación debe utilizar la maqueta UX/UI como **referencia exclusivamente visual**:

```text
C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\reader.html
```

El HTML define la referencia visual y de diseño, pero **no define la funcionalidad**.

La funcionalidad debe implementarse según `US-0029`.

---

## Requisitos funcionales

### 1. Ruta

Implementar:

```text
/works/:id/read
```

La ruta debe:

* requerir autenticación;
* funcionar mediante navegación desde el detalle de Work;
* funcionar mediante acceso directo por URL;
* funcionar correctamente con refresh;
* respetar Back/Forward del navegador.

---

## 2. Entrada desde el detalle de Work

La acción **Leer** de `/works/:id` debe navegar al Reader:

```text
/works/:id/read
```

No debe pasar nuevamente por la pantalla de detalle.

---

## 3. API

Consumir:

```http
GET /api/works/{id}/pages
```

El endpoint devuelve las páginas ordenadas de la Work junto con sus URLs protegidas.

No realizar requests individuales para obtener el listado de páginas.

El Reader debe utilizar el orden recibido por el API.

No inferir el orden a partir de nombres de archivos, URLs ni IDs.

---

## 4. Modelo de datos

Utilizar el contrato entregado por Backend:

```text
ReaderWorkPagesDto
    WorkId
    Pages
        Id
        Number
        Url
```

No duplicar ni reinterpretar información que ya proporciona el API.

---

## 5. Visualización de páginas

Mostrar una única imagen por vez.

La imagen debe conservar siempre su proporción original.

El Reader debe soportar:

* páginas verticales;
* páginas horizontales;
* páginas aproximadamente cuadradas;
* páginas dobles representadas como una única imagen.

No:

* deformar imágenes;
* recortar páginas;
* dividir automáticamente páginas dobles;
* asumir una relación de aspecto fija.

La presentación debe adaptarse al viewport.

La imagen debe utilizar un comportamiento equivalente a:

```css
object-fit: contain;
```

cuando corresponda a la arquitectura visual utilizada.

---

## 6. Navegación

Implementar:

* página siguiente;
* página anterior;
* primera página;
* última página.

La navegación a la última página debe recorrer las páginas secuencialmente, manteniendo la experiencia de cambio de página.

No implementar:

* input directo de número de página;
* slider;
* thumbnails de páginas.

---

## 7. Indicador de página

Mostrar:

```text
Página X de Y
```

actualizado según la página actualmente visualizada.

---

## 8. Animación de cambio de página

La animación de cambio de página es un requisito funcional importante.

Implementar una transición visual que transmita la sensación de pasar una página física.

Debe funcionar:

* al avanzar;
* al retroceder;
* mediante controles;
* mediante teclado;
* mediante touch.

La animación no debe deformar ni recortar la imagen.

Debe ser suficientemente rápida para no dificultar la lectura.

---

## 9. Sonido de cambio de página

Implementar sonido de cambio de página.

El sonido debe:

* reproducirse al cambiar de página cuando esté habilitado;
* poder activarse/desactivarse desde el Reader;
* respetar las restricciones de reproducción de audio del navegador;
* nunca bloquear la navegación si el audio no puede reproducirse.

No asumir que el navegador permitirá reproducción automática sin interacción del usuario.

La configuración debe formar parte del estado del Reader.

---

## 10. Touch

Implementar:

* swipe izquierda → siguiente página;
* swipe derecha → página anterior;
* toque en lateral izquierdo → página anterior;
* toque en lateral derecho → página siguiente.

Los gestos no deben interferir con:

* zoom;
* desplazamiento de una página ampliada;
* controles;
* menú.

---

## 11. Teclado

Implementar:

| Tecla        | Acción           |
| ------------ | ---------------- |
| `ArrowRight` | Página siguiente |
| `ArrowLeft`  | Página anterior  |
| `Home`       | Primera página   |
| `End`        | Última página    |
| `+`          | Zoom in          |
| `-`          | Zoom out         |

No interceptar estas teclas cuando el foco se encuentre en un control de entrada donde su comportamiento sea necesario.

---

## 12. Zoom

Implementar zoom mediante:

* botones `+` / `−`;
* rueda del mouse;
* pinch en dispositivos táctiles.

El zoom debe conservar la proporción original de la imagen.

Cuando la imagen ampliada exceda el viewport, debe poder desplazarse para inspeccionar su contenido.

El zoom no debe modificar la composición original de la página.

---

## 13. Modo inmersivo

Implementar un modo que permita ocultar los controles del Reader.

Cuando los controles estén ocultos:

* la página debe ocupar el máximo espacio disponible;
* debe mantenerse la posibilidad de volver a mostrar los controles;
* la lectura debe continuar normalmente.

---

## 14. Fullscreen

Implementar fullscreen utilizando la API correspondiente del navegador.

Debe funcionar en:

* desktop;
* tablet;
* mobile.

Debe respetar tanto portrait como landscape.

---

## 15. Menú / configuración

Implementar el menú superpuesto definido visualmente en la maqueta.

Debe permitir configurar, como mínimo:

* sonido de página;
* fullscreen;
* modo inmersivo;
* controles del Reader.

El menú debe poder cerrarse sin abandonar el Reader.

---

## 16. Carga de páginas

Las páginas deben cargarse individualmente.

La carga de una página no debe bloquear innecesariamente la carga de otras.

Implementar precarga de páginas próximas a la posición actual, especialmente:

* siguiente;
* anterior.

La precarga debe respetar el orden de lectura.

No descargar previamente el contenido completo de la Work.

---

## 17. Estados de carga

Mientras una página se encuentre cargando debe mostrarse un estado visual de loading.

El usuario no debe quedar frente a un área vacía sin explicación.

---

## 18. Errores

Si una página no puede cargarse:

* mostrar un error explícito;
* mostrar `Reintentar`;
* permitir volver a intentar la carga;
* no cerrar el Reader;
* no expulsar al usuario de la aplicación.

Un error individual de página no debe convertirse en un error global del Reader si puede manejarse localmente.

---

## 19. Navegación entre Works

Utilizar las relaciones `PreviousWork` y `NextWork` disponibles en el contexto de la Work cuando corresponda.

Si existe una Work anterior o siguiente, permitir navegar directamente hacia su Reader.

La navegación debe ir directamente a:

```text
/works/{id}/read
```

sin pasar por la pantalla de detalle.

No implementar en esta task el orden de lectura de Lists.

Cuando posteriormente exista un contexto de List, el Reader deberá poder reutilizarse para ese contexto.

---

## 20. Estados especiales

Implementar visualmente el estado correspondiente a la última página.

La lógica de progreso y finalización será implementada en una User Story posterior.

Por lo tanto, esta task **no debe persistir**:

* porcentaje;
* `CurrentPage`;
* `Reading`;
* `Completed`;
* `LastReadAt`;
* historial.

El Reader debe quedar preparado para integrarse posteriormente con dicha funcionalidad.

---

## 21. Responsive

La implementación debe funcionar correctamente en:

* mobile;
* tablet;
* desktop;
* portrait;
* landscape.

Prioridad:

1. mobile aproximadamente 480 px;
2. tablet;
3. desktop.

Las páginas deben conservar siempre su proporción independientemente del viewport.

---

## 22. Arquitectura Frontend

La implementación debe ser **orientada a componentes**.

No generar un componente monolítico ni duplicar markup/lógica para cada estado o tamaño de pantalla.

Extraer componentes reutilizables cuando corresponda, especialmente para:

* área de lectura;
* controles;
* indicador de página;
* navegación;
* menú;
* zoom;
* loading;
* error;
* configuración;
* fullscreen.

La lógica de navegación debe estar centralizada y no duplicada entre mouse, touch y teclado.

---

## 23. Referencia visual

Utilizar:

```text
C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\reader.html
```

como referencia visual para:

* composición;
* jerarquía;
* espaciado;
* tipografía;
* controles;
* estados;
* colores;
* responsive;
* apariencia de la transición;
* menú;
* experiencia inmersiva.

**El HTML no es código funcional para copiar literalmente.**

No convertir la maqueta HTML en una implementación basada en HTML estático.

La implementación debe utilizar la arquitectura y componentes existentes del Public Web.

Si existe una diferencia entre la maqueta y `US-0029`, prevalece `US-0029`.

---

## 24. Seguridad

No implementar mecanismos para impedir que el usuario guarde una imagen que el navegador ya recibió.

No agregar:

* watermark;
* bloqueo de `Save image as`;
* protección artificial sobre el elemento `<img>`;
* descarga del comic completo.

Las URLs de las páginas ya son proporcionadas por Backend mediante el mecanismo de protección existente.

---

## 25. Fuera de alcance

No implementar:

* progreso de lectura;
* historial;
* continuar lectura;
* favoritos;
* ratings;
* reviews;
* comentarios;
* anotaciones;
* recomendaciones;
* listas personales;
* lectura de Lists;
* orden de lectura de Lists;
* Arcos como contexto;
* Crossovers como contexto;
* thumbnails de páginas;
* búsqueda dentro del Reader;
* filtros;
* ordenamiento;
* administración;
* procesamiento CBR/CBZ;
* IA;
* descarga CBR;
* descarga CBZ;
* descarga PDF.

---

## Criterios de aceptación

* [ ] `/works/:id/read` funciona correctamente.
* [ ] El Reader requiere autenticación.
* [ ] El detalle de Work permite entrar al Reader mediante `Leer`.
* [ ] Se consume `GET /api/works/{id}/pages`.
* [ ] Las páginas se muestran en el orden recibido.
* [ ] Se muestra una sola página a la vez.
* [ ] Se soportan páginas verticales, horizontales y cuadradas.
* [ ] Las páginas dobles se muestran como una única imagen.
* [ ] No se deforman ni recortan páginas.
* [ ] Existe indicador `Página X de Y`.
* [ ] Existe navegación anterior/siguiente.
* [ ] Existe navegación a primera/última página.
* [ ] La navegación a última página mantiene la transición secuencial.
* [ ] Existe animación de cambio de página.
* [ ] La animación funciona al avanzar y retroceder.
* [ ] Existe sonido de cambio de página.
* [ ] El sonido puede activarse/desactivarse.
* [ ] El sonido no bloquea la navegación.
* [ ] Swipe izquierdo avanza.
* [ ] Swipe derecho retrocede.
* [ ] Los laterales permiten navegar mediante touch.
* [ ] Funciona navegación por teclado.
* [ ] Funciona zoom mediante controles.
* [ ] Funciona zoom mediante rueda.
* [ ] Funciona zoom mediante pinch.
* [ ] Una imagen ampliada puede desplazarse.
* [ ] Existe modo inmersivo.
* [ ] Los controles pueden ocultarse.
* [ ] Existe fullscreen.
* [ ] Existe menú/configuración.
* [ ] Las páginas próximas se precargan.
* [ ] La carga de páginas es independiente.
* [ ] Existe estado loading.
* [ ] Existe estado de error.
* [ ] Existe `Reintentar`.
* [ ] Un error individual no cierra el Reader.
* [ ] Funciona en mobile, tablet y desktop.
* [ ] Funciona en portrait y landscape.
* [ ] Se mantiene la proporción original de las imágenes.
* [ ] La implementación está orientada a componentes.
* [ ] No existe duplicación innecesaria de lógica o markup.
* [ ] Se utiliza `reader.html` como referencia visual y no como fuente funcional.
* [ ] No se implementa ninguna funcionalidad fuera del alcance de US-0029.

---

## Finalización

Actualizar esta task con el resultado de la ejecución de la tarea sin eliminar el contenido original, agregar (append) al último de este archivo y mover a `finished` (o `blocked`) según indica `communication.md`.

---

## Execution Result

### Implemented

- Reader feature at `public-web/public-web/features/reader/`
- Route `/works/:id/read` with `ProtectedRoute` in `public-web/public-web/app/router/routes.tsx`
- "Leer" button on Work detail page linking to `/works/:id/read`
- `GET /api/works/{id}/pages` consumption via `reader-repository.ts`
- Protected images via `useProtectedImage` hook (API Client auth → Blob → Object URL → `<img>`)

### Components

- `ReaderPageRoute` — route wrapper resolving `:id`
- `Reader` — main component orchestrating navigation, zoom, pan, gestures, preloading, and view states
- `ReaderHeader` — top bar with back navigation, sound toggle, menu button
- `ReaderFooter` — bottom controls: first/prev/next/last, page indicator, zoom controls, immersive toggle
- `ReaderMenu` — settings overlay: sound, zoom, immersive mode, fullscreen
- `ReaderLoading` / `ReaderError` / `ReaderEnd` — loading spinner, error with retry, and last-page completion states

### Features

- Page-by-page reading with `object-contain` (no cropping, no deformation)
- Page turn animation (3D perspective, direction-aware)
- Page turn sound via Web Audio API (toggleable, non-blocking)
- Keyboard navigation: ArrowRight, ArrowLeft, Home, End, +, -
- Touch: swipe left/right, side taps, pinch zoom
- Mouse: wheel zoom (Ctrl/Cmd), drag pan when zoomed
- Zoom: 0.5x to 3x via buttons, wheel, pinch
- Pan when zoomed via mouse drag
- Immersive mode (hide/show controls)
- Fullscreen API
- Preloading adjacent pages (previous and next)
- Per-page loading and error states
- Sequential navigation to last page (100ms interval with animation)

### State Management

- TanStack Query for `GET /api/works/{id}/pages`
- Zustand store (`reader-store.ts`) for zoom, sound, immersive, menu UI state

### Documentation Updated

- `project/pages.md` — added Work Reader page
- `project/components.md` — added reader components

### Verified

- TypeScript strict mode: `npm run typecheck` passes
- Build: `npm run build` passes

### Files Changed

- `public-web/public-web/app/router/routes.tsx`
- `public-web/public-web/app.tsx`
- `public-web/public-web/features/catalog/pages/work-detail-page.tsx`
- `public-web/public-web/features/reader/types/reader.ts`
- `public-web/public-web/features/reader/api/reader-repository.ts`
- `public-web/public-web/features/reader/hooks/use-work-pages.ts`
- `public-web/public-web/features/reader/hooks/use-reader-audio.ts`
- `public-web/public-web/features/reader/stores/reader-store.ts`
- `public-web/public-web/features/reader/components/reader-page.tsx`
- `public-web/public-web/features/reader/components/reader.tsx`
- `public-web/public-web/features/reader/components/reader-header.tsx`
- `public-web/public-web/features/reader/components/reader-footer.tsx`
- `public-web/public-web/features/reader/components/reader-menu.tsx`
- `public-web/public-web/features/reader/components/reader-states.tsx`
- `public-web/public-web/index.css`
- `project/pages.md`
- `project/components.md`

---

## Execution Result Update

### Layout Fixes

- Added `ReaderAppLayout` in `app.tsx`: the Reader now renders in a dedicated fullscreen layout (`fixed inset-0`) isolated from the global `AppLayout` header/footer and padding.
- Moved `/works/:id/read` route from `routes.tsx` to `app.tsx` under `ReaderAppLayout`.
- Reader root is now `fixed inset-0 flex flex-col`, so header stays at the top and footer stays at the bottom of the viewport.
- Image area uses `flex-1 w-full h-full overflow-hidden flex items-center justify-center`, so the page image adapts to the remaining space between reader header and reader footer.
- Removed fixed `max-h-[82vh]` / `max-h-[85vh]` constraints from the image; sizing is now driven by the available reader viewport.
- Image remains `object-contain`; when zoomed in beyond the viewport, the container can be panned via mouse drag.

### Navigation Controls

- Added explicit Prev/Next overlay buttons centered vertically on the image area.
- These buttons are always visible during normal reading, making page navigation discoverable.
- Side tap zones remain active; overlay buttons do not interfere with zoom/pan/menu behavior.

### Error/Loading/End States

- All reader states now render within the fullscreen reader layout, so they keep 100% of the viewport height.
- Removed the previous shrinking behavior where error/loading views could collapse the reader area.

### Verified

- TypeScript strict mode: `npm run typecheck` passes
- Build: `npm run build` passes

### Pan, Sound and Animation Changes

- Removed page-turn sound and deleted `use-reader-audio.ts`.
- Removed page-turn animation classes and keyframes from `index.css`.
- Removed sound toggle from `ReaderHeader` and `ReaderMenu`.
- Removed `soundEnabled` from `ReaderStore`.
- Replaced custom transform-based panning with native scroll-based panning:
  - Reading area is a scroll container with hidden scrollbar (`.scrollbar-hide`).
  - Image no longer uses `object-contain`; zoom is applied through explicit `width`/`height` calculated from natural image size.
  - Mouse drag pans by updating `scrollLeft`/`scrollTop` via container ref.
  - Touch drag pans by updating `scrollLeft`/`scrollTop` via container ref.
  - Arrow keys call `container.scrollBy` for smooth scrolling.
- Mouse and touch drag use `dragStartRef` to track initial pointer position and scroll offset.
- Image is rendered directly inside the scroll container without horizontal centering, so it starts at the top-left.
- Page-change navigation uses visible fixed overlay prev/next buttons and touch side-tap detection only; swipe-based page turn was removed.
- Keyboard arrow keys now pan the image with natural reading direction:
  - `ArrowRight` moves the image to the left
  - `ArrowLeft` moves the image to the right
  - `ArrowDown` moves the image down
  - `ArrowUp` moves the image up
- On page load, zoom is automatically calculated so the image fits the container width, and scroll is reset to top-left.
- Zoom state is now local to `Reader`; store no longer manages zoom.

