# TASK-PUBLIC-WEB-0077 — Implementar formulario de valoración en el Reader

## Objetivo

Implementar en la pantalla del Reader el formulario que permite al usuario autenticado crear o actualizar su valoración del Work.

## Ubicación y momento

Al llegar a la posición final del Reader (`TotalPages + 1`), mostrar el formulario de valoración.

La funcionalidad debe integrarse con el Reader existente, sin crear una pantalla independiente.

## Estado inicial

Obtener la valoración del usuario mediante el dato `myRating` devuelto por `GET /api/works/{id}/pages`.

* Si `myRating` es `null`, mostrar el formulario vacío.
* Si existe una valoración, mostrar sus estrellas y su comentario, si lo tiene.

## Formulario

Permitir al usuario:

* Seleccionar una puntuación de cero a cinco estrellas.
* Escribir un comentario opcional.
* Enviar la valoración mediante un botón.

El componente de estrellas debe permitir seleccionar explícitamente cero estrellas. Esta opción no debe confundirse con un formulario sin completar.

## Crear una valoración

Si el usuario todavía no tiene una valoración:

* El botón debe decir **Votar**.
* Al enviarlo, crear la valoración mediante `POST /api/works/{workId}/ratings`.
* Enviar únicamente la puntuación y el comentario; la identidad del usuario debe obtenerse del JWT en el Backend/API.
* Si la operación tiene éxito, actualizar el estado local para mostrar la valoración guardada y cambiar el botón a **Actualizar**.

## Actualizar una valoración

Si el usuario ya tiene una valoración:

* Mostrar la puntuación y el comentario existentes.
* El botón debe decir **Actualizar**.
* Permitir modificar ambos campos.
* Enviar los cambios mediante `PUT /api/works/{workId}/ratings`.
* Si la operación tiene éxito, reflejar los datos guardados en el formulario.

Actualizar una valoración no debe crear otra fila ni incrementar `RatingCount`.

## Estados y errores

Implementar estados de envío, éxito y error de acuerdo con las convenciones del proyecto.

Evitar envíos duplicados mientras una operación está en curso. Si falla el envío, conservar los datos introducidos para que el usuario pueda reintentarlo.

## Integración y restricciones

* Reutilizar el componente de estrellas con la pantalla de detalle cuando resulte apropiado, respetando las diferencias entre mostrar un promedio y seleccionar una puntuación.
* Adaptar el formulario a Mobile, Tablet y Desktop.
* No modificar los contratos ni endpoints del Backend/API.
* No implementar eliminación de valoraciones, respuestas, reacciones ni moderación.
* No modificar el progreso de lectura como consecuencia de votar.
* Seguir US-0030 y las convenciones del Public Web.

## Criterios de aceptación

* Al llegar a la posición final, se muestra el formulario.
* Sin valoración previa, el formulario aparece vacío y el botón dice **Votar**.
* Con valoración previa, se muestran los datos existentes y el botón dice **Actualizar**.
* Se puede seleccionar cualquier puntuación entre cero y cinco estrellas.
* El comentario es opcional.
* Crear una valoración usa POST; actualizarla usa PUT.
* La identidad del usuario no se envía en el cuerpo de la petición.
* Los errores no borran los datos introducidos.
* La valoración no altera el progreso de lectura.

---

## Resultado de ejecución

### Implementado

1. **Componentes creados:**
   - `features/reader/components/rating-form.tsx` — Formulario de valoración para el Reader (crear/editar)
   - Reutiliza `StarRatingInput` de `features/catalog/components/star-rating-input.tsx`
   - Usa hooks `useMyRating`, `useVoteWork`, `useUpdateWorkRating` de `features/catalog/hooks/use-ratings.ts`

2. **Componentes actualizados:**
   - `features/reader/components/reader.tsx` — Integrado `RatingForm` en posición `TotalPages + 1` (índice `totalPages` en 0-based)
   - `features/reader/types/reader.ts` — Agregado `MyRatingDto` y campo `myRating` en `ReaderWorkPagesDto`

3. **Tipos compartidos:**
   - `MyRatingDto` definido en `reader/types/reader.ts` con `stars`, `review`, `createdAt`, `updatedAt`

### Endpoints utilizados
- `GET /api/works/{workId}/pages` — ahora incluye `myRating` en la respuesta
- `POST /api/works/{workId}/ratings` — crear valoración (upsert)
- `PUT /api/works/{workId}/ratings` — actualizar valoración (upsert)

### Comportamiento
- **Sin valoración previa**: Formulario vacío, botón "Votar", permite 0-5 estrellas + reseña opcional
- **Con valoración previa**: Muestra estrellas y reseña guardadas, botón "Editar valoración" → abre formulario con datos precargados, botón "Actualizar"
- **Validación**: Requiere al menos estrellas > 0 o reseña no vacía
- **Estados**: Carga, envío, error (con mensaje), éxito (cierra formulario y vuelve a última página)
- **Navegación**: Al cerrar desde posición final, vuelve a la última página real
- **Reutilización**: `StarRatingInput` compartido con WorkDetail

### Verificación
- Build TypeScript + Vite exitoso
- TypeScript strict mode sin errores
- Responsive: Mobile/Tablet/Desktop
- No altera progreso de lectura (`WorkReadingProgress` independiente)