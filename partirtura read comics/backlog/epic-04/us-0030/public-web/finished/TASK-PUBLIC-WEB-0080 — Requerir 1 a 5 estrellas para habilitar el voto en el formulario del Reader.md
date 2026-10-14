# TASK-PUBLIC-WEB-0080 — Requerir 1 a 5 estrellas para habilitar el voto en el formulario del Reader

## Origen

Solicitud directa del humano (chat). Autoriza la ejecución inmediata. Aclara/refina la decisión de
reseña opcional tomada en TASK-PUBLIC-WEB-0079.

## Descripción

Regla definitiva del formulario de valoración del Reader:

- La reseña es **opcional**.
- Para habilitar **Votar** es obligatorio tener entre **1 y 5 estrellas**.
- Si NO hay ninguna estrella, no se puede votar, exista o no reseña.

Esto reemplaza el comportamiento anterior (que permitía votar solo con reseña).

## Resultado esperado

- El botón "Votar"/"Actualizar" queda deshabilitado mientras no haya al menos una estrella.
- Con 1 a 5 estrellas se puede votar con o sin reseña.
- Con 0 estrellas no se puede votar haya o no reseña.

## Contexto relevante

- `features/reader/components/rating-form.tsx` — habilitación del botón y envío.
- US-0030 §1, §5 y Criterios de aceptación (modificados para reflejar la regla).
- TASK-PUBLIC-WEB-0079 (reseña opcional / valoración vacía bloqueada).

## Dependencias

- Ninguna. No se requieren cambios de endpoint ni de contratos Backend/API.

## Alcance

- `rating-form.tsx`: constante `MIN_RATING_STARS = 1`, derivado `canSubmit = stars >= MIN_RATING_STARS`,
  guard en `handleSubmit`, `disabled` del botón y envío de `stars` (siempre 1–5).
- Documentación: `us-0030.md` (§1, §5, criterios), `project/components.md` (descripción de `RatingForm`).

## Fuera de alcance

- Cambiar endpoints/contratos.
- Modificar la lógica de promedio/conteo del Backend.

## Criterios de aceptación

- [x] Con 0 estrellas, "Votar" está deshabilitado aunque haya reseña.
- [x] Con 1 a 5 estrellas, "Votar" se habilita con o sin reseña.
- [x] La reseña es opcional (se envía `review` o `null`).
- [x] El envío manda `stars` entre 1 y 5.
- [x] US-0030 refleja la nueva regla.
- [x] `npm run typecheck` y `npm run build` pasan sin errores.

---

## Resultado de ejecución

### Implementado

- `rating-form.tsx`:
  - Constante `MIN_RATING_STARS = 1`.
  - Derivado `canSubmit = stars >= MIN_RATING_STARS` (puntuación obligatoria 1–5; reseña no interviene).
  - `handleSubmit`: guard `if (!canSubmit) { setSubmitError('Seleccioná al menos una estrella'); return }`.
  - Botón de envío: `disabled={isSubmitting || !canSubmit}`.
  - Cuerpo de la petición: `stars` (siempre 1–5) y `review: review.trim() || null` (opcional).

### Archivos modificados

- `public-web/public-web/features/reader/components/rating-form.tsx` — regla de habilitación y envío.
- `backlog/epic-04/us-0030/us-0030.md` — §1 (se quita "guardar cualquiera de los dos de manera
  independiente" y "puede escribir una reseña sin puntuar"; se explicita que la puntuación 1–5 es
  obligatoria y la reseña opcional), §5 (ya no se permite quitar la puntuación; se rechaza si no queda
  puntuación 1–5) y Criterios de aceptación.
- `project/components.md` — descripción de `RatingForm`.

### Decisiones

- La reseña es opcional, pero la puntuación (1–5) es obligatoria para votar. Se elimina la posibilidad
  de crear/guardar una valoración solo con reseña (sin estrellas), conforme a la indicación del humano.
- `us-0030.md` se corrigió por indicación directa del humano (no es una adaptación a la implementación,
  sino una decisión de producto explícita). Se registra aquí el motivo y el alcance del cambio.

### Notas para el futuro

- Al editar una valoración existente que solo tuviera reseña (sin estrellas), el usuario deberá agregar
  una puntuación 1–5 para poder guardar, alineado con la nueva regla.

### Verificación

- `npm run typecheck`: sin errores.
- `npm run build`: sin errores (warnings preexistentes no relacionados).
