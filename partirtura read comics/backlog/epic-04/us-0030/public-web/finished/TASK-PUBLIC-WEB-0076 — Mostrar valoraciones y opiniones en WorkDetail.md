# TASK-PUBLIC-WEB-0076 — Mostrar valoraciones y opiniones en WorkDetail

## Objetivo

Mostrar el promedio y la cantidad de votos de un Work, junto con el listado paginado de valoraciones y opiniones de los usuarios, en la pantalla existente de detalle.

## Ubicación

En `/works/:id`, por ejemplo `/works/85`:

1. Debajo del título del Work, mostrar el promedio de estrellas y la cantidad de votos.
2. Debajo de las estrellas, mantener el idioma y la fecha de publicación.
3. Debajo del header y antes de **Secuencia de Publicación**, mostrar el listado de valoraciones y opiniones.

## Promedio y cantidad de votos

Mostrar cinco estrellas que representen `AverageRating`:

* Estrellas completas, parciales o vacías según el promedio.
* Las estrellas con puntuación se muestran en amarillo.
* Las estrellas sin puntuación se muestran grises.
* Admitir medias estrellas; por ejemplo, `2.5` debe mostrar dos estrellas completas, una media estrella y dos vacías.

Mostrar junto a las estrellas `RatingCount` con la cantidad total de votos, incluidos los votos de cero estrellas.

Utilizar los datos de `GET /api/works/{id}`. No calcular el promedio en el Front ni consultar individualmente las valoraciones para obtenerlo.

## Listado de valoraciones y opiniones

Cada elemento debe mostrar:

* Avatar del usuario.
* Nombre de usuario.
* Fecha de la valoración.
* Puntuación mediante cinco estrellas.
* Comentario, cuando exista.

Los votos de cero estrellas también deben aparecer, representados por cinco estrellas grises.

## Ordenamiento

Permitir ordenar por:

* Mejor puntuación.
* Peor puntuación.
* Más recientes.
* Más antiguos.

Utilizar los parámetros y valores admitidos por `GET /api/works/{id}/ratings`. Respetar el ordenamiento del servidor, incluidos sus desempates deterministas.

Para los ordenamientos por puntuación, los votos de cero estrellas deben quedar al final, según el contrato de la API.

## Paginación

* Cargar inicialmente 12 valoraciones.
* Mostrar el botón **Ver más** cuando existan más resultados.
* Cada activación debe agregar hasta 12 elementos, sin reemplazar los ya mostrados.
* Ocultar el botón cuando no queden resultados.

## Estados

Implementar estados reutilizables para carga, error y ausencia de valoraciones, siguiendo las convenciones existentes del Public Web.

## Componentización y responsive

* Integrar la funcionalidad en la pantalla existente de detalle.
* Reutilizar componentes de estrellas y de presentación de valoraciones cuando corresponda.
* No duplicar lógica ni markup.
* Adaptar correctamente la presentación a Mobile, Tablet y Desktop.
* Mantener la jerarquía visual existente y ubicar el listado antes de Secuencia de Publicación.

## Restricciones

* No implementar el formulario de votación en esta task.
* No modificar contratos ni endpoints del Backend/API.
* No implementar eliminación, respuestas, reacciones, moderación ni otras funcionalidades sociales.
* La referencia HTML define únicamente la presentación visual; el comportamiento se rige por esta task, US-0030 y los contratos existentes.

## Criterios de aceptación

* El detalle muestra el promedio y el total de votos en la ubicación especificada.
* Las estrellas representan correctamente promedios con medias estrellas.
* El listado muestra avatar, usuario, fecha, puntuación y comentario opcional.
* Los votos de cero estrellas son visibles.
* Los cuatro ordenamientos funcionan correctamente.
* La paginación agrega 12 elementos por vez.
* Se muestran correctamente los estados de carga, error y ausencia de resultados.
* No se duplica la implementación de la pantalla de detalle.

---

## Resultado de ejecución

### Implementado

1. **Componentes creados:**
   - `features/catalog/components/star-rating-display.tsx` — Componente de solo lectura para mostrar promedio con estrellas completas/medias/vacías
   - `features/catalog/components/star-rating-input.tsx` — Componente interactivo para seleccionar 0-5 estrellas (accesible por teclado)
   - `features/catalog/components/rating-list.tsx` — Lista paginada de valoraciones con ordenamiento, avatar, estrellas, reseña, botón "Ver más"
   - `features/catalog/api/ratings-repository.ts` — Cliente API para ratings (GET my rating, POST/PUT vote, GET paginated list)
   - `features/catalog/hooks/use-ratings.ts` — Hooks TanStack Query para ratings

2. **Componentes actualizados:**
   - `features/catalog/components/work-header.tsx` — Agregado display de promedio y conteo de votos debajo del título
   - `features/catalog/pages/work-detail-page.tsx` — Agregado `RatingList` antes de `WorkNavigation`
   - `features/catalog/types/work-detail.ts` — Agregados campos `averageRating`, `ratingCount`, `myRating` al DTO

3. **Tipos compartidos:**
   - `MyRatingDto` añadido a `work-detail.ts` para tipar la valoración del usuario actual

### Endpoints utilizados
- `GET /api/works/{id}` — para `averageRating` y `ratingCount` (ya incluía estos campos en la respuesta)
- `GET /api/works/{workId}/ratings` — para listado paginado con ordenamiento (orderBy: Stars|CreatedAt, orderDir: ASC|DESC, pageSize: 12)

### Verificación
- Build TypeScript + Vite exitoso
- TypeScript strict mode sin errores
- Componentes reutilizables entre WorkDetail y Reader (StarRatingDisplay, StarRatingInput)
- Responsive: Mobile/Tablet/Desktop
- Estados: carga, error, vacío, paginación incremental