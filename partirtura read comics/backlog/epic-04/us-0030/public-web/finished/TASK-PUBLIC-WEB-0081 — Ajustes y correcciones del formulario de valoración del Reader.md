# TASK-PUBLIC-WEB-0081 — Ajustes y correcciones del formulario de valoración del Reader

## Origen

Solicitud directa del humano (chat). Autoriza la ejecución inmediata sobre `RatingForm` y su
integración con el Reader y el detalle de Work.

## Descripción

Dos cambios y dos bugs:

1. **Cambio**: centrar las estrellas.
2. **Bug**: se muestra "Creada: Invalid Date".
3. **Cambio**: al guardar el voto no salir del Reader; quedarse en la misma posición mostrando la
   pantalla de "ya votaste" (para poder seguir navegando al cómic siguiente).
4. **Bug**: tras votar y volver al detalle, los votos/comentarios y el promedio/conteo no se
   actualizan hasta refrescar (F5).

## Resultado esperado

- Estrellas centradas en la vista de valoración y en el formulario.
- No se muestran fechas inválidas; el Reader no muestra fechas (el endpoint de páginas no las trae).
- Al guardar, el usuario permanece en la posición final y ve su valoración guardada.
- Al volver al detalle tras votar, la lista de valoraciones y el promedio/conteo se refrescan sin F5.

## Contexto relevante

- `features/reader/components/rating-form.tsx`
- `features/reader/components/reader.tsx` (render del `RatingForm`)
- `features/reader/hooks/use-work-pages.ts` (query key del Reader)
- `features/catalog/hooks/use-ratings.ts` (invalidaciones tras votar)
- `features/catalog/hooks/use-work-detail.ts` (key `['catalog','work-detail',id]`)
- Contrato `GET /api/works/{id}/pages`: `myRating` es `ReaderMyRatingDto (Stars, Review)`, sin fechas.
- TASK-PUBLIC-WEB-0079, TASK-PUBLIC-WEB-0080.

## Dependencias

- Ninguna. No se requieren cambios de endpoint ni de contratos Backend/API.

## Alcance

- `rating-form.tsx`: centrar estrellas; estado local `submittedRating` + `activeRating`; al guardar,
  no navegar (quitar `onClose` del camino de éxito) y mostrar la valoración guardada; eliminar las
  fechas "Creada/Actualizada"; refrescar el cache de páginas del Reader.
- `reader.tsx`: `key={workId}` en `RatingForm` para resetear estado al cambiar de work.
- `use-work-pages.ts`: exportar `readerWorkPagesKey`.
- `use-ratings.ts`: invalidar `['catalog','work-detail',workId]` tras votar/actualizar.
- Documentación: `project/components.md`.

## Fuera de alcance

- Cambiar endpoints/contratos ni agregar fechas al endpoint de páginas.

## Criterios de aceptación

- [x] Las estrellas se muestran centradas (valoración y formulario).
- [x] No aparece "Invalid Date"; el Reader no muestra fechas de creación/actualización.
- [x] Al guardar, permanece en la posición final y muestra la valoración guardada (no navega afuera).
- [x] Cambiar de work resetea el formulario (no arrastra la valoración previa).
- [x] Tras volver al detalle, la lista de valoraciones y el promedio/conteo se actualizan sin F5.
- [x] `npm run typecheck` y `npm run build` pasan sin errores.

---

## Resultado de ejecución

### Implementado

1. **Estrellas centradas** (`rating-form.tsx`): las dos instancias de `StarRatingInput` se envuelven en
   un contenedor `flex justify-center`; el pie del formulario pasa a `text-center`.

2. **"Invalid Date" corregido** (`rating-form.tsx`): se eliminó el bloque "Creada/Actualizada". El
   endpoint de páginas devuelve `myRating` sin fechas (`ReaderMyRatingDto` = Stars/Review), por lo que
   `new Date(undefined)` producía "Invalid Date". Las fechas se siguen mostrando en el detalle, que usa
   el endpoint de listado (que sí trae `CreatedAt`).

3. **No salir al guardar** (`rating-form.tsx`): al guardar/actualizar ya no se llama `onClose`. En su
   lugar se guarda la valoración recibida en el estado local `submittedRating` y se sale del modo edición
   (`isEditing`), de modo que se muestra la vista "Tu valoración" en la misma posición. Además se
   invalida el cache del Reader (`readerWorkPagesKey`) para que, al volver a esa posición, `myRating`
   esté fresco. `reader.tsx` recibe `key={workId}` en `RatingForm` para resetear el estado al cambiar de
   work (evita que la valoración de una work se muestre en otra).

4. **Detalle se refresca tras votar** (`use-ratings.ts`): `useVoteWork` y `useUpdateWorkRating` ahora
   invalidan también `['catalog', 'work-detail', workId]` (además de `myRating` y `workRatings`), que es
   la key del promedio y conteo mostrados en el encabezado de valoraciones del detalle. Así, al volver
   al detalle se refrescan lista + promedio + conteo sin F5.

### Archivos modificados

- `public-web/public-web/features/reader/components/rating-form.tsx` — ítems 1, 2 y 3.
- `public-web/public-web/features/reader/components/reader.tsx` — `key={workId}` en `RatingForm`.
- `public-web/public-web/features/reader/hooks/use-work-pages.ts` — export `readerWorkPagesKey`.
- `public-web/public-web/features/catalog/hooks/use-ratings.ts` — invalidación del work-detail.
- `project/components.md` — descripción de `RatingForm` actualizada.

### Decisiones

- El Reader no muestra fechas de la valoración porque el contrato de páginas no las expone; mostrarlas
  requeriría cambiar el endpoint (fuera de alcance y no permitido para este agente). Las fechas viven en
  el detalle.
- `submittedRating` (estado local) da feedback inmediato sin parpadeos; la invalidación del cache de
  páginas mantiene la consistencia si el usuario sale y vuelve a la posición final.
- Invalidar `['catalog','work-detail',workId]` respeta "backend is authority": la siguiente visita al
  detalle recalcula promedio y conteo desde el servidor.

### Notas para el futuro

- Si se quisiera mostrar fechas en el Reader, habría que ampliar `ReaderMyRatingDto` en el Backend
   (tarea de API) y actualizar el endpoint de páginas.

### Verificación

- `npm run typecheck`: sin errores.
- `npm run build`: sin errores (warnings preexistentes no relacionados).
