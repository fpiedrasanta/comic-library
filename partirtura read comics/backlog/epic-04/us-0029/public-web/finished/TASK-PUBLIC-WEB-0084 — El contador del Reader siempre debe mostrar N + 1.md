# TASK-PUBLIC-WEB-0084 — El contador del Reader siempre debe mostrar `N + 1`

## Objetivo

El contador de páginas del Reader debe mostrar como total la cantidad de páginas del cómic más la
página extra de valoración, en **todas** las posiciones.

## Contexto

- Colisión con lo implementado en TASK-PUBLIC-WEB-0078, donde el indicador mostraba el total del
  recorrido (`N + 1`) solo en la primera página y en la posición de valoración, y la cantidad de
  páginas de cómic (`N`) en las páginas intermedias.
- Reporte directo del humano: en los cómics sigue apareciendo `1 de {cantidadPaginas}` cuando lo
  esperado es `1 de {cantidadPaginas + 1}`, porque la página extra es el formulario para votar.

## Regla acordada

Para el usuario, un cómic de 10 páginas tiene 11 posiciones. El denominador del indicador es siempre
`N + 1`:

- Página 1 → `1 de 11`
- Páginas 2 … N → `2 de 11` … `10 de 11`
- Posición final → `11 de 11`

## Solución

- `reader.tsx`: se eliminó la variable derivada `displayedTotal` y se pasa `totalPages` al footer.
- `reader-footer.tsx`: prop `displayedTotal` → `totalPages`.
- `reader-page-indicator.tsx`: prop `displayedTotal` → `totalPages`; el indicador usa `totalPages`.

## Criterios de aceptación

- [x] El contador muestra `N + 1` como total en todas las posiciones, incluidas las intermedias.
- [x] La navegación, el progreso y el formulario de valoración no se alteran.
- [x] No queda código ni props muertos (`displayedTotal`).
- [x] `npm run typecheck` y `npm run build` pasan sin errores.

## Fuera de alcance

- Cambiar la navegación, `totalPages` como límite, el progreso o el formulario de valoración.
- Modificar el endpoint de páginas.

---

## Resultado de ejecución

### Implementado

`totalPages = pages.length + 1` (`reader.tsx`) ahora es la única fuente del denominador del contador.
Se eliminó el cálculo condicional que usaba `pages.length` mientras se leía y la prop intermedia
`displayedTotal` en los tres componentes del indicador (reader, footer, indicator).

### Archivos modificados

- `public-web/public-web/features/reader/components/reader.tsx` — se removió `displayedTotal`; se pasa
  `totalPages` al `ReaderFooter`.
- `public-web/public-web/features/reader/components/reader-footer.tsx` — prop renombrada a `totalPages`.
- `public-web/public-web/features/reader/components/reader-page-indicator.tsx` — prop renombrada a
  `totalPages` y usada en el indicador.
- `project/components.md` — sección de reader: contador siempre `N + 1`, referencia a TASK-0084.
- `project/pages.md` — fila `Work Reader` actualizada.

### Decisiones

- Al ser el denominador siempre el mismo, se eliminó la variable derivada en lugar de mantenerla: una
  sola fuente de verdad (`totalPages`) y sin prop intermedia innecesaria.
- No se tocó `totalPages` como límite de navegación ni la posición de valoración.

### Notas para el futuro

- Esta tarea revierte deliberadamente la parte del indicador definida en TASK-PUBLIC-WEB-0078; ambas
- quedan registradas para no reintroducir el comportamiento anterior por error.

### Verificación

- `npm run typecheck`: sin errores.
- `npm run build`: sin errores (warnings preexistentes de chunking).
