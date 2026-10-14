# TASK-PUBLIC-WEB-0086 — Implementar sección Recomendados del catálogo

## Objetivo

Implementar la sección **Recomendados del catálogo** en el index del Public Web, de acuerdo con la US-0033.

La implementación debe integrarse con la página existente, reutilizar componentes y convenciones del proyecto y mantener la coherencia visual con las demás secciones.

## Referencia visual

Utilizar el archivo:

`C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\index-template.html`

Tomar como referencia visual la sección `#catalogo`.

El HTML define la disposición visual, la relación de aspecto de las portadas y la jerarquía de la información. No debe copiarse literalmente ni considerarse una especificación funcional.

Los datos de ejemplo y las etiquetas decorativas del HTML no representan información real del catálogo ni reglas funcionales.

## Integración con Backend/API

Consumir el endpoint de recomendados implementado en `TASK-API-0299`.

Utilizar el criterio de ordenamiento seleccionado y mostrar los Works devueltos por la API.

- Mostrar hasta 12 Works.
- No realizar consultas individuales por Work.
- No recalcular métricas ni ordenar los resultados en el frontend.
- Respetar la selección y exclusión de Works definida en la US-0033.
- Utilizar los datos reales devueltos por la API.

## Selector de ordenamiento

Incorporar un selector con las siguientes opciones:

- **Más populares** (`MostPopular`).
- **Agregados recientemente** (`RecentlyAdded`).
- **Más votados** (`MostRated`).

Seleccionar inicialmente **Más populares**, salvo que exista una convención general del proyecto que determine el criterio inicial.

Al cambiar la opción, volver a consultar el endpoint con el criterio seleccionado y actualizar los resultados.

Evitar solicitudes duplicadas y respetar los mecanismos existentes de carga, cancelación y manejo de errores.

## Tarjeta de portada

La tarjeta utilizada en esta sección tiene una composición visual diferente de `WorkCard`, utilizado en el catálogo y en Mi colección.

Implementar un componente reutilizable específico para las portadas recomendadas, por ejemplo `RecommendedWorkCard`.

Cada tarjeta debe mostrar:

- Portada del Work.
- Promedio de estrellas cuando existan valoraciones.
- Publisher.
- Título.
- Número o volumen y año de publicación, cuando los datos estén disponibles.

La portada debe conservar una relación de aspecto estándar de **2:3**, utilizando `object-fit: cover` o el mecanismo equivalente del proyecto.

Las tarjetas deben mantener alturas y alineación coherentes dentro de la grilla.

Reutilizar los mecanismos existentes de acceso a imágenes, navegación, tipografía, colores y componentes visuales cuando corresponda. No duplicar lógica de negocio ni modificar `WorkCard` para adaptarlo a esta presentación.

### Valoraciones y datos opcionales

- Mostrar el promedio real de estrellas cuando existan valoraciones.
- No mostrar puntuaciones ficticias.
- No mostrar una etiqueta `Leído` para Works excluidos por la API.
- No mostrar la etiqueta `Nuevo` salvo que exista una regla funcional definida y datos que permitan determinarla.
- Si faltan número, volumen o fecha de publicación, adaptar la información visible sin inventar valores.

Al seleccionar una tarjeta, navegar al detalle del Work mediante la ruta existente.

## Diseño responsive

Implementar la grilla adaptativa tomando como referencia el HTML:

- Mobile: 2 columnas.
- Pantallas pequeñas y medianas: aumentar progresivamente las columnas.
- Desktop: hasta 5 columnas.

La distribución debe adaptarse al ancho disponible y conservar el espaciado, las proporciones de las portadas y la jerarquía visual.

Mantener la identidad estética del Public Web; no introducir una implementación visual aislada del resto del proyecto.

## Estados

Implementar los estados utilizando los componentes y mecanismos existentes:

- Carga.
- Error de carga.
- Resultados disponibles.
- Sin resultados.

Si no existen Works elegibles, ocultar completamente la sección, sin dejar un espacio vacío en el index.

## Fuera de alcance

- Modificar el algoritmo de selección u ordenamiento del backend.
- Modificar la página de catálogo o el componente `WorkCard`.
- Implementar recomendaciones personalizadas.
- Incorporar favoritos, listas o funcionalidades sociales.
- Alterar el progreso de lectura o las valoraciones.
- Introducir datos ficticios para completar la grilla.

## Criterios de aceptación

- La sección se integra en el index existente.
- Consume el endpoint de `TASK-API-0299`.
- Muestra hasta 12 Works con datos reales.
- El selector permite cambiar entre los tres criterios de ordenamiento.
- Al cambiar el criterio, los resultados se actualizan correctamente.
- Las tarjetas utilizan una composición específica y reutilizable.
- Las portadas mantienen la relación de aspecto 2:3.
- Las tarjetas muestran Publisher, título, información editorial disponible y promedio real de estrellas cuando corresponda.
- No se inventan etiquetas, puntuaciones ni datos editoriales.
- La sección se oculta cuando no hay resultados elegibles.
- No se realizan consultas individuales por Work ni se duplica la lógica del backend.
- La implementación es responsive y no altera las demás secciones del index.

---

## Resultado de ejecución

### Estado

**finished.** Bloqueo resuelto: TASK-API-0300 (Backend) finalizada.

> **Historial del bloqueo:** durante la primera ejecución `averageRating` no estaba en el contrato
> (`WorkCatalogItemDto`), así que la tarea quedó en `blocked` con TASK-API-0300 en `planned/api/`.
> El backend la finalizó (opción 1: `averageRating` agregado al DTO compartido, desde los acumuladores
> de `Work`, `null` cuando la obra no tiene valoraciones activas) y la tarea volvió a `pending` para
> completar el punto pendiente.

### Implementado

1. **Repositorio** (`features/catalog/api/recommended-works-repository.ts` + export en `api/index.ts`):
   `getRecommendedWorks({ sortBy })` sobre `GET /api/works/recommended`. Sin filtrado ni reordenado en
   Front.
2. **Tipo de orden** (`features/catalog/types/works.ts`): `RecommendedSortField = 'MostPopular' |
   'RecentlyAdded' | 'MostRated'`. El backend rechaza con 422 cualquier otro valor, así que el front
   nunca manda uno inválido.
3. **Hook** (`features/catalog/hooks/use-recommended-works.ts`): `useQuery` con el criterio en la query
   key. `staleTime: 0` porque el conjunto elegible cambia en cuanto el usuario empieza a leer una obra:
   la siguiente visita al index no debe ofrecer una obra que ya no aplica. No hizo falta tocar el Reader
   (fuera de alcance) para lograrlo.
4. **Selector** (`features/catalog/components/recommended-sort-controls.tsx`): las tres opciones con las
   etiquetas de la task (**Más votados**, no "Mejor valorados" del HTML). Cada opción es el `sortBy` que
   se manda al backend.
5. **Tarjeta** (`features/catalog/components/recommended-work-card.tsx`): portada 2:3 con `object-cover`
   mediante `ProtectedImage`, publisher con `readableAccentColor`, título, y línea editorial con
   `Nº {numberValue}` y año de publicación (cada uno sólo si existe; no se inventan valores). Badge
   `★ X.X` sobre la portada con el promedio, que se renderiza sólo cuando `averageRating` no es `null`
   (obras sin valoraciones no muestran nada). Toda la tarjeta navega a `/works/{id}`. La grilla es
   `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`, igual que la referencia.
6. **Sección** (`components/dashboard/catalog-section.tsx`): reescrita sobre datos reales, con encabezado,
   selector, grilla y estados. Sin obras elegibles devuelve `null` (la sección desaparece y no reserva
   espacio); error y carga se muestran en el lugar con `Reintentar`. Se eliminó el select mock que
   navegaba a `/catalog` y la descripción meta del HTML.
7. **Índice** (`pages/index-page.tsx`): `useState` del criterio (inicial `MostPopular`, criterio por
   defecto de la task y del backend) + `useRecommendedWorks`, pasando datos y estados a la sección.

### Archivos modificados

- `public-web/public-web/features/catalog/types/works.ts` — `RecommendedSortField` y
  `averageRating: number | null` en `WorkCatalogItemDto`.
- `public-web/public-web/features/catalog/api/recommended-works-repository.ts` (nuevo).
- `public-web/public-web/features/catalog/api/index.ts` — export.
- `public-web/public-web/features/catalog/hooks/use-recommended-works.ts` (nuevo).
- `public-web/public-web/features/catalog/hooks/index.ts` — export.
- `public-web/public-web/features/catalog/components/recommended-work-card.tsx` (nuevo).
- `public-web/public-web/features/catalog/components/recommended-sort-controls.tsx` (nuevo).
- `public-web/public-web/components/dashboard/catalog-section.tsx` — reescrita; pasa
  `averageRating={work.averageRating}`.
- `public-web/public-web/components/dashboard/index.ts` — se quita `ComicCard` (eliminado).
- `public-web/public-web/components/dashboard/comic-card.tsx` — **eliminado** (mock sin uso).
- `public-web/public-web/features/catalog/pages/list-detail-page.tsx` — `averageRating: null` en el
  mapeo, porque el endpoint de listas no expone valoraciones.
- `public-web/public-web/pages/index-page.tsx` — conexión.
- `project/components.md` y `project/components/public-web-components.md` — componentes nuevos,
  `CatalogSection` actualizada, fila de `ComicCard` eliminada.
- `project/pages.md` — fila `Index` actualizada.

### Decisiones

- **`staleTime: 0` en el hook** en lugar de invalidar desde el Reader: modificar el Reader está fuera de
  alcance, y así se evita exactamente el problema de datos viejos ya reportado antes para el historial.
- **Orden del selector en estado local del componente**, no en la URL: es una opción de vista de una
  sección del index, igual que el filtro de Mi colección, y la task no pide que sea compartible.
- **Sin `keepPreviousData`:** al cambiar el criterio la grilla muestra el estado de carga en lugar de
  mantener resultados viejos, para no exhibir obras de otro criterio.
- **Promedio desde `averageRating` del DTO**, no recalculado ni consultado por obra. Obras sin
  valoraciones devuelven `null` del backend y no muestran badge: no hay puntuaciones ficticias.
- Se quitaron las etiquetas decorativas del HTML (`Leído`, `Nuevo`, `★ 4.9` de ejemplo) porque la task
  prohíbe inventarlas y no hay regla funcional ni datos que las sustenten.
- `DashboardWelcome` conserva `inProgressCount={0}`: modificarlo entra en "no alterar las demás secciones".

### Notas para el futuro

- `averageRating` ahora vive en `WorkCatalogItemDto`, así que el catálogo y el historial también lo
  reciben. Si en algún momento esas tarjetas quieren mostrar la valoración, el dato ya está disponible
  sin cambios de API.
- El backend decidió no exponer `ratingCount` en el listado (sigue disponible en el detalle).

### Verificación

- `npm run typecheck`: sin errores.
- `npm run build`: sin errores (warnings preexistentes de chunking).
- No hay script de lint configurado en el proyecto.
- Pendiente de validación visual contra el endpoint real con el usuario autenticado.