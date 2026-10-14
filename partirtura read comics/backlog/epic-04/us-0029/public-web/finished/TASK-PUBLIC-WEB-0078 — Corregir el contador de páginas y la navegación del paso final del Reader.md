# TASK-PUBLIC-WEB-0078 — Corregir el contador de páginas y la navegación del paso final del Reader

## Origen

Solicitud directa del humano (chat). Autoriza la ejecución inmediata de este cambio sobre el Reader existente.

## Descripción

El Reader de una Work muestra `N` páginas de cómic más una página final sintética (posición `N+1`)
que contiene el formulario de valoración. El comportamiento esperado (ejemplo con `N = 10`, rating en
la posición `11`) es el siguiente:

- **Página 1**: si existe `PreviousWork`, mostrar la acción hacia la Work anterior en lugar del indicador.
  Si NO existe `PreviousWork`, mostrar el indicador `1 de 11` (`cantidad de páginas + 1`).
- **Botón "Ir al último"**: debe llevar a la página `11` (`cantidad de páginas + 1`), es decir a la
  página de valoración, NO a la última página de cómic.
- **Página de valoración (`N+1`)**: muestra el formulario para votar. En el footer, si existe
  `NextWork`, mostrar la acción hacia la Work siguiente. Si NO existe `NextWork`, mostrar `11 de 11`.
- **Páginas intermedias (2 … N)**: mostrar SIEMPRE el indicador `2 de 10`, `3 de 10`, … `10 de 10`
  (denominador = cantidad de páginas de cómic, sin sumar la página de valoración).

## Resultado esperado

El indicador de página usa como denominador la cantidad de páginas de cómic (`N`) mientras se lee
(páginas 2 … N), y la cantidad total del recorrido (`N+1`, incluyendo la página de valoración)
únicamente en los dos extremos: la primera página y la página de valoración.

La acción de Work siguiente se muestra en la página de valoración (`N+1`), no en la última página de
cómic. "Ir al último" aterriza en la página de valoración.

## Contexto relevante

- Reader: `features/reader/components/reader.tsx`
- Indicador: `features/reader/components/reader-page-indicator.tsx`
- Footer: `features/reader/components/reader-footer.tsx`
- Tipos: `features/reader/types/reader.ts`
- US-0029 — Leer una Work (indicador y navegación).
- US-0030 §1 y §6 — la valoración se ubica en la posición final `TotalPages + 1`.
- TASK-PUBLIC-WEB-0073 (navegación entre Works) y TASK-PUBLIC-WEB-0077 (formulario de valoración).

Comportamiento actual (a corregir):

- `totalPages = pages.length + 1` y el indicador usa siempre `totalPages` como denominador
  (p. ej. `2 de 11` en lugar de `2 de 10`).
- `goLast` navega a `totalPages - 2` (última página de cómic) en lugar de `totalPages - 1`
  (página de valoración).
- La acción de Work siguiente se muestra en la última página de cómic (`isLastComicPage`) en lugar de
  la página de valoración.

## Dependcias

- Ninguna. No se requieren cambios de endpoint ni de contratos Backend/API.

## Alcance

- Modificar `reader.tsx`: `goLast` → página de valoración; calcular el denominador mostrado
  (`displayedTotal`); pasar el flag de posición final (página de valoración) al footer.
- Renombrar en `reader-footer.tsx` y `reader-page-indicator.tsx` las props `totalPages` →
  `displayedTotal` e `isLastComicPage` → `isLastPosition` para reflejar la semántica real.
- No modificar navegación de páginas (anterior/siguiente), ni el progreso de lectura.

## Fuera de alcance

- Cambios de endpoints/contratos.
- Cambios en la animación, sonido, zoom o modo inmersivo del Reader.
- Modificar la lógica de valoración o de progreso de lectura.

## Criterios de aceptación

- [ ] En la página 1, si existe `PreviousWork`, se muestra la acción de Work anterior en lugar del indicador.
- [ ] En la página 1, si NO existe `PreviousWork`, el indicador muestra `1 de (N+1)`.
- [ ] El botón "Ir al último" navega a la página de valoración (posición `N+1`).
- [ ] La página de valoración muestra el formulario para votar.
- [ ] En la página de valoración, si existe `NextWork`, se muestra la acción de Work siguiente en lugar del indicador.
- [ ] En la página de valoración, si NO existe `NextWork`, el indicador muestra `(N+1) de (N+1)`.
- [ ] Las páginas intermedias (2 … N) muestran SIEMPRE el indicador `X de N`.
- [ ] Avanzar desde la página `N` lleva a la página de valoración `N+1`; retroceder vuelve a `N`.
- [ ] La navegación anterior/siguiente de página y el progreso de lectura no se alteran.
- [ ] `npm run typecheck` y `npm run build` pasan sin errores.

---

## Resultado de ejecución

### Implementado

- El contador de páginas ya no usa siempre `N+1` como denominador. Ahora:
  - Páginas 2 … N (leyendo): indicador `X de N` (cantidad de páginas de cómic).
  - Primera página y página de valoración (`N+1`): indicador con el total del recorrido `N+1`
    (`1 de N+1` y `N+1 de N+1`).
- "Ir al último" (botón del footer y tecla `End`) ahora aterriza en la página de valoración
  (`index = totalPages - 1`) en lugar de la última página de cómic. Avanzar desde la página `N`
  sigue llevando a la página de valoración.
- La acción de Work siguiente se muestra en la página de valoración (`N+1`) cuando existe
  `NextWork`, ya no en la última página de cómic. La acción de Work anterior sigue en la primera
  página cuando existe `PreviousWork`.

### Archivos modificados

- `public-web/public-web/features/reader/components/reader.tsx`
  - `goLast` navega a `totalPages - 1` (página de valoración) y su guard usa `totalPages - 1`.
  - Nueva variable derivada `displayedTotal = currentPageIndex === 0 || isRatingPosition ? totalPages : pages.length`.
  - `ReaderFooter` recibe `displayedTotal` e `isLastPosition={isRatingPosition}` en lugar de `totalPages` e `isLastComicPage`.
- `public-web/public-web/features/reader/components/reader-footer.tsx`
  - Props renombradas: `totalPages` → `displayedTotal`, `isLastComicPage` → `isLastPosition`.
  - Pasa `isLastPage={isLastPosition}` al indicador (posición final = página de valoración).
- `public-web/public-web/features/reader/components/reader-page-indicator.tsx`
  - Prop `totalPages` → `displayedTotal`; el indicador renderiza `de {displayedTotal}`.
- `project/components.md` — actualizada la sección de componentes del Reader (TASK-PUBLIC-WEB-0078) y las descripciones de `Reader`, `ReaderFooter` y `ReaderPageIndicator`.
- `project/pages.md` — actualizada la descripción de la página Work Reader (contador y navegación entre Works).

### Decisiones

- Se mantiene `totalPages = pages.length + 1` como total de navegación (incluye la página de
  valoración); solo cambia el denominador **mostrado** en el indicador, calculado en `reader.tsx`
  como `displayedTotal`.
- El denominador usa `pages.length` (más explícito que `totalPages - 1`) para representar la
  cantidad de páginas de cómic mientras se lee.
- Renombrar props (`displayedTotal`, `isLastPosition`) refleja la semántica real tras el cambio y
  evita que `totalPages` confunda (ya no es el denominador mostrado).
- "Ir al último" conserva el salto directo (no secuencial), igual que el comportamiento previo de
  TASK-PUBLIC-WEB-0073; solo cambia el destino.

### Notas para el futuro

- La página de valoración (`N+1`) es ahora el verdadero "último paso": concentra la acción de Work
  siguiente y el cierre del formulario (`handleRatingClose`) sigue volviendo a la última página de
  cómic (`totalPages - 2`).
- Caso borde: un cómic de una sola página (`N=1`, `totalPages=2`) muestra `1 de 2` en la página 1 y
  `2 de 2` en la página de valoración (no hay páginas intermedias). Comportamiento consistente con el
  modelo de extremos.

### Verificación

- `npm run typecheck`: sin errores.
- `npm run build`: sin errores (warnings preexistentes de `"use client"` de librerías y tamaño de
  chunk, no relacionados con este cambio).
- Recorrido con `N=10` validado contra los criterios de aceptación (ver sección anterior).
