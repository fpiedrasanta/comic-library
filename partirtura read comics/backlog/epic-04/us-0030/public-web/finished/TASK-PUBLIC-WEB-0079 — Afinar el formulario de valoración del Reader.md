# TASK-PUBLIC-WEB-0079 — Afinar el formulario de valoración del Reader

## Origen

Solicitud directa del humano (chat). Autoriza la ejecución inmediata sobre el formulario de
valoración del Reader.

## Descripción

Ajustes sobre `RatingForm` (posición final del Reader) y su integración:

1. Quitar la etiqueta inline "Sin puntuación" que aparece junto a las estrellas (queda duplicada con la
   etiqueta inferior). Conservar la etiqueta inferior.
2. Agrandar las estrellas a 48×48.
3. El botón "Cerrar" debe llevar al detalle del cómic (`/works/{id}`), igual que el botón "volver" del
   header, en lugar de volver a la página anterior del Reader.
4. La reseña no debe ser obligatoria para votar. (Ver nota en Decisión sobre el caso vacío.)

## Resultado esperado

- El conjunto de estrellas se muestra a 48×48 y sin la leyenda inline "Sin puntuación"; la leyenda
  inferior se mantiene.
- "Cerrar" navega al detalle de la Work.
- Se puede votar con estrellas y sin reseña, o solo con reseña. Solo se bloquea la valoración
  completamente vacía (sin estrellas y sin reseña), regla de negocio de US-0030 validada por el Backend.

## Contexto relevante

- `features/reader/components/rating-form.tsx` — formulario (usa `StarRatingInput`).
- `features/catalog/components/star-rating-input.tsx` — componente de estrellas compartido.
- `features/reader/components/reader.tsx` — renderiza `RatingForm` y define `handleRatingClose`.
- `features/reader/components/reader-header.tsx` — el "volver" navega a `/works/${workId}`.
- US-0030 §1/§6 (valoración en la posición final), §"Unicidad y persistencia" (no persistir vacías).
- TASK-PUBLIC-WEB-0077 (formulario de valoración en el Reader).

## Dependencias

- Ninguna. No se requieren cambios de endpoint ni de contratos Backend/API.

## Alcance

- `star-rating-input.tsx`: quitar el span inline "Sin puntuación".
- `rating-form.tsx`: constante de tamaño de estrella (48) aplicada a las dos instancias de
  `StarRatingInput`.
- `reader.tsx`: `handleRatingClose` navega a `/works/${workId}` en lugar de `totalPages - 2`.
- Actualizar descripciones en `project/components.md` si aplica.

## Fuera de alcance

- Cambiar la regla de negocio que prohíbe valoraciones vacías (requeriría cambio de Backend + US).
- Cambios en el flujo de creación/edición más allá de lo solicitado.

## Criterios de aceptación

- [x] No se muestra la leyenda inline "Sin puntuación" junto a las estrellas; la leyenda inferior se conserva.
- [x] Las estrellas se muestran a 48×48.
- [x] "Cerrar" navega al detalle de la Work (`/works/{id}`).
- [x] Se puede votar con estrellas y sin reseña; y con solo reseña.
- [x] La valoración completamente vacía (sin estrellas y sin reseña) sigue bloqueada (regla US-0030).
- [x] `npm run typecheck` y `npm run build` pasan sin errores.

---

## Resultado de ejecución

### Implementado

1. **Etiqueta inline eliminada** (`star-rating-input.tsx`): se removió el `<span>Sin puntuación</span>`
   que renderizaba junto a las estrellas. La etiqueta inferior del formulario (`rating-form.tsx`) se
   conserva. El prop `allowZero` se mantiene para la conducta de deselección a 0.

2. **Estrellas más grandes** (`rating-form.tsx`): se agregó la constante `RATING_STAR_SIZE = 48` y se
   aplicó `size={RATING_STAR_SIZE}` a las dos instancias de `StarRatingInput` (vista de valoración
   existente y formulario de ingreso).

3. **"Cerrar" → detalle** (`reader.tsx`): `handleRatingClose` ahora navega a `/works/${workId}`
   (detalle de la Work), igual que el botón "volver" del header, en lugar de volver a la página de
   cómic anterior. Cubre tanto el botón "Cerrar" del formulario nuevo como el cierre tras guardar.

### Archivos modificados

- `public-web/public-web/features/catalog/components/star-rating-input.tsx` — sin span inline.
- `public-web/public-web/features/reader/components/rating-form.tsx` — constante `RATING_STAR_SIZE` (48) aplicada.
- `public-web/public-web/features/reader/components/reader.tsx` — `handleRatingClose` navega al detalle.

### Decisiones

- **Reseña opcional**: la lógica de habilitación del botón (`stars === 0 && !review.trim()`) ya permite
  votar con estrellas y sin reseña, o solo con reseña. No se cambió.
- **Valoración vacía bloqueada**: no se permite enviar una valoración sin estrellas y sin reseña porque
  US-0030 lo prohíbe explícitamente ("no se permiten guardar valoraciones vacías") y el Backend es la
  autoridad que valida. Aunque el frontend lo enviara, sería rechazado. No se relajó esta regla; hacerlo
  requeriría una tarea de API + cambio de US.

### Notas para el futuro

- Si se decide permitir valoraciones sin puntuación y sin reseña, se debe: (a) ajustar la validación del
  Backend y (b) actualizar US-0030; el cambio de frontend sería quitar la condición
  `(stars === 0 && !review.trim())` del `disabled` y del `handleSubmit`.

### Verificación

- `npm run typecheck`: sin errores.
- `npm run build`: sin errores (warnings preexistentes no relacionados).
