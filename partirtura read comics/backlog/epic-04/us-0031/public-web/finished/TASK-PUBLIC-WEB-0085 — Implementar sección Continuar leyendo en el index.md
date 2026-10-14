# TASK-PUBLIC-WEB-0085 — Implementar sección Continuar leyendo en el index

## Objetivo

Implementar la sección **Continuar leyendo** en el index del Public Web para que los usuarios puedan retomar rápidamente sus lecturas pendientes.

La implementación debe integrarse con la estructura existente del index, reutilizar los componentes y contratos disponibles y mantener los criterios estéticos del proyecto.

## Referencia visual

Utilizar como referencia:

`C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\index-template.html`

La referencia visual define la disposición y jerarquía de la sección y sus tarjetas. No debe copiarse literalmente ni considerarse una especificación funcional.

Adaptar el diseño a los estilos, componentes y convenciones existentes en el Public Web.

## Consulta de datos

Utilizar el endpoint de historial definido en `TASK-API-0298`, filtrando por estado `Reading` y solicitando un máximo de 10 Works.

- Ordenar por última actividad de lectura descendente.
- Reutilizar los datos de catálogo y `myReadingProgress` devueltos por la API.
- No realizar consultas individuales por Work.
- No recalcular el porcentaje de progreso en el frontend.
- No implementar endpoints nuevos ni modificar el backend.

## Visibilidad

- Mostrar la sección únicamente cuando existan Works en estado `Reading`.
- Si no existen resultados, ocultar completamente la sección, sin reservar espacio en el index.
- No incluir Works completados ni Works sin progreso de lectura.
- Respetar el aislamiento de datos por usuario autenticado y los mecanismos de autenticación existentes.

## Componente de tarjeta

La tarjeta de **Continuar leyendo** tiene una composición diferente de `WorkCard`, utilizado en el catálogo y en Mi colección.

Implementar un componente reutilizable específico para esta sección, por ejemplo `ContinueReadingCard`, sin modificar la presentación de `WorkCard`.

Cada tarjeta debe mostrar:

- Portada del Work.
- Publisher.
- Título del Work.
- Barra de progreso.
- Porcentaje leído.
- Página actual y total de páginas.

La composición debe seguir la referencia visual: portada a la izquierda e información y progreso a la derecha.

Reutilizar los componentes, estilos, mecanismos de acceso a imágenes y convenciones visuales existentes siempre que corresponda. Evitar duplicar lógica de obtención de datos o de cálculo del progreso.

La tarjeta debe ser navegable para retomar la lectura mediante la ruta existente `/works/{id}/read`.

## Enlace al historial

Incorporar el enlace **Ver historial**, que debe navegar a Mi colección, reutilizando la pantalla implementada en `TASK-PUBLIC-WEB-0080`.

## Responsive

Adaptar la sección y sus tarjetas a Mobile, Tablet y Desktop, conservando la jerarquía visual de la referencia y los criterios estéticos del proyecto.

## Estados

Implementar los estados necesarios para la consulta:

- Carga.
- Error de carga, utilizando el mecanismo de recuperación y presentación de errores existente.
- Resultados disponibles.
- Sin resultados: ocultar la sección.

No duplicar componentes de estado que ya existan en el proyecto.

## Fuera de alcance

- Modificar la página de catálogo o el componente `WorkCard`.
- Implementar funcionalidades nuevas de historial o progreso.
- Mostrar recomendaciones, favoritos o Works completados.
- Modificar las reglas de lectura.
- Crear endpoints o persistencia adicionales.

## Criterios de aceptación

- La sección se muestra únicamente cuando hay Works en estado `Reading`.
- Sin Works en lectura, la sección queda completamente oculta.
- Se muestran como máximo 10 Works, ordenados por última actividad descendente.
- Las tarjetas presentan portada, Publisher, título y progreso.
- La tarjeta utiliza una composición específica, sin alterar `WorkCard`.
- El progreso se toma de la API, sin cálculos duplicados ni consultas por Work.
- Seleccionar una tarjeta permite retomar la lectura.
- `Ver historial` navega a Mi colección.
- La implementación reutiliza componentes y convenciones del proyecto, es responsive y no altera el comportamiento de las demás secciones del index.

---

## Resultado de ejecución

### Estado

**finished.**

> **Enmienda posterior (indicación directa del humano, chat):** el límite pasó de 10 a **12** obras.
> Motivo: 12 es múltiplo de 3, las columnas de la grilla de la sección, así las filas se completan
> parejas (12 = 4 filas, 9 = 3 filas, 6 = 2 filas) en lugar de dejar una fila incompleta con 10.
> Se ajustó `CONTINUE_READING_PAGE_SIZE`, la documentación (`project/components.md`,
> `project/components/public-web-components.md`, `project/pages.md`) y este registro. La especificación
> de la task queda intacta salvo esta nota: su criterio "máximo 10 Works" queda reemplazado por 12.

### Implementado

1. **Hook de la sección** (`features/catalog/hooks/use-continue-reading.ts`): historial de lectura
   filtrado a `Reading` y limitado a 12 obras, ordenado por actividad reciente. Reutiliza
   `useReadingHistory` / `getReadingHistory` de TASK-PUBLIC-WEB-0080; no se agregó ningún endpoint.
2. **Tarjeta** (`components/dashboard/continue-reading-card.tsx`): reescrita sobre datos reales. Dejó
   de recibir las props del mock (`progress`, `currentPage`, `cover`, `accentColor`, `progressColor`) y
   ahora recibe el `WorkCatalogItemDto` + su `myReadingProgress`. Portada mediante `ProtectedImage`
   (las portadas del backend son imágenes protegidas), color de la editorial con `readableAccentColor`
   y progreso con `readingProgressAppearance`, que es la misma escala de avance de `WorkCard` y de Mi
   colección. Toda la tarjeta es un `Link` a `/works/{id}/read`.
3. **Sección** (`components/dashboard/continue-reading-section.tsx`): recibe datos y estados del
   índice, mantiene `Ver historial` → `/my-collection`, y ahora:
   - **sin obras en lectura devuelve `null`**: la sección desaparece y no reserva espacio;
   - error → encabezado + bloque de error con `Reintentar` (`refetch`);
   - carga → encabezado + indicador de carga.
   Las tarjetas se arman con `flatMap`, que descarta los ítems sin progreso **sin usar ninguna
   aserción no-nula**.
4. **Índice** (`pages/index-page.tsx`): llama a `useContinueReading` y pasa datos, estados y `refetch`
   a la sección. El componente no consulta nada por sí mismo.

### Archivos modificados

- `public-web/public-web/features/catalog/hooks/use-reading-history.ts` — `pageSize` pasó a ser
  parámetro (la sección pide 10) y entró en la query key.
- `public-web/public-web/features/catalog/hooks/use-continue-reading.ts` (nuevo).
- `public-web/public-web/features/catalog/hooks/index.ts` — export de `useContinueReading`.
- `public-web/public-web/components/dashboard/continue-reading-card.tsx` — reescrita con datos reales.
- `public-web/public-web/components/dashboard/continue-reading-section.tsx` — datos reales, estados y
  ocultado. Se eliminó el tipo mock `ContinueReadingItem` y su prop `items` (ya sin referencias).
- `public-web/public-web/pages/index-page.tsx` — conexión con el hook.
- `project/components.md` — filas nuevas para la sección, la tarjeta y el hook.
- `project/components/public-web-components.md` — las dos filas que describían estos componentes con
  el mock fueron actualizadas (habrían quedado contradiciendo el código) y se agregó el hook.
- `project/pages.md` — fila `Index` actualizada.

### Decisiones

- **La barra usa la escala de avance del proyecto, no el color literal del HTML**: `reading-progress-work-card.html`
  no aplica acá (no hay tal referencia para esta sección); `index-template.html` pinta las barras con
  `nepsAccent` y con varios colores según el ejemplo. Como la referencia "no debe copiarse literalmente
  ni considerarse una especificación funcional", reutilicé `readingProgressAppearance`, que es la escala
  ya establecida para progreso de lectura y está derivada del porcentaje real.
- **Sin búsqueda ni orden en la sección**: el backend ya ordena por `LastReadAt` descendente y la
  sección pide sólo las 10 más recientes.
- **Estados inline y mínimos**: el proyecto no tiene componentes genéricos reutilizables de
  carga/error (`EntityListingState` es para listados de entidades a página completa y
  `ResultsGrid` los tiene inline), así que no había nada que reutilizar sin arrastrar copy de
  catálogo; se replicó el patrón visual existente en pequeña escala, no un componente nuevo.
- **Sección en `components/dashboard/`, tarjeta con imports type-only de catálogo**: evita mover
  archivos de lugar ("no unnecessary code movement"); no hay acoplamiento en runtime. La sección es
  composición de página, igual que `CatalogSection`, que vive en la misma carpeta.
- `DashboardWelcome` conserva `inProgressCount={0}`: cambiar ese número entra en "no alterar las demás
  secciones del index", aunque ahora el dato existe.

### Notas para el futuro

- El color de la barra en esta sección queda en la rama amarillo→naranja porque el historial está
  filtrado a `Reading`; el verde sólo aparece en tarjetas con estado `Completed`.
- `ContinueReadingCard` sigue exportada en el barrel `components/dashboard/index.ts` aunque ya sólo la
  consume la sección: es un export preexistente que quedó sin consumidores externos.

### Verificación

- `npm run typecheck`: sin errores.
- `npm run build`: sin errores (warnings preexistentes de chunking).
- No hay script de lint configurado en el proyecto.
- Pendiente de validación visual contra el endpoint real con el usuario autenticado.
