# TASK-PUBLIC-WEB-0062 — Corregir contraste de pills y reubicar la pill de tipo de obra

## Objetivo

Corregir dos problemas visuales reportados por el usuario en la grilla del catálogo:

1. Las pills de Editorial, Franquicia y Serie usan el color de la entidad como color de texto sobre un fondo translúcido derivado del mismo color, lo que produce textos ilegibles.
2. La pill de Tipo de obra se renderiza en la misma línea que las otras, cuando el diseño de `works-catalog.html` la ubica abajo a la derecha, dentro del cover y por debajo del bloque de pills.

## Contexto

El usuario escribió: "las pills. Me encantan, pero por ahí no se leen por contraste". Propuso una función `isBackgroundColorBlack(r, g, b)` con la ponderación clásica `(0.299, 0.587, 0.114)`: si la luminancia es mayor a `0.5` el fondo debe ser negro, si no blanco. Los dos colores que peor se leían eran `rgb(217, 59, 40)` y `rgb(93, 82, 94)`, y en ambos el usuario leía mejor sobre fondo blanco.

El texto de la pill y el color del borde se mantienen tal cual, según lo indicado.

## Trabajo solicitado

* Fondo de las pills con la regla de luminancia del usuario, no con una regla inventada.
* Mover la pill de Tipo de obra a su propia fila, abajo a la derecha dentro del cover, con las pills de jerarquía arriba.

## Dependencias

Ninguna. Es un trabajo visual de frontend sobre componentes existentes.

## Criterios de aceptación

* El fondo de las pills es negro o blanco según la luminancia del color de la entidad.
* El texto y el borde conservan el color de la entidad.
* La pill de Tipo de obra se renderiza abajo dentro del cover, a la derecha.
* Las pills de Editorial, Franquicia y Serie se renderizan arriba dentro del cover.
* El contraste no depende del color de la portada.
* `tsc --noEmit` y `npm run build` pasan.
* Verificado en navegador con sesión real.

## Resultado de ejecución

### Estado

finished

### Nota de proceso

El usuario pidió este trabajo en sesión y autorizó la ejecución, por lo que la task se registra ya ejecutada. La decisión final sobre la opacidad (85%) la tomó el usuario después de ver las alternativas medidas.

### Qué se implementó

* `features/catalog/utils/entity-color.ts` — módulo nuevo con `parseHexColor` (soporta `#rgb` y `#rrggbb`), la regla de luminancia `(0.299, 0.587, 0.114)` con umbral `0.5`, y los helpers `readableBackgroundColor` y `colorWithAlpha`. Se descartaron los helpers de luminancia relativa WCAG y composición sobre superficie fija.
* `features/catalog/components/work-card.tsx` — se extrajo un componente `EntityPill` para los tres niveles de jerarquía, eliminando el markup duplicado tres veces. La pill de Tipo de obra pasó a una fila propia, alineada a la derecha, abajo dentro del cover, y se le sacó la condición `work.publisher &&` que impedía mostrarla en obras sin editorial.
* Se reemplazaron los sufijos hex con alpha sueltos (`20`, `40`, `15`, `30`) por constantes con nombre y valores decimales, ya que `${color}15` no es un porcentaje legible.

### Decisiones tomadas durante la ejecución

**Opacidad 85% en lugar del 50% original.** Es la decisión que resuelve el problema de fondo. A 50% la pill hereda la luminancia de la portada, y se midió que la elección correcta se da vuelta de card a card: `rgb(245, 27, 0)` daba 1.74 sobre fondo negro contra 2.87 sobre blanco, mientras que `rgb(35, 31, 32)` daba 1.96 contra 10.29. A 85% el contraste queda acotado y la regla se cumple para cualquier portada.

La primera implementación calculaba contraste WCAG contra una superficie asumida. Era más rigurosa en la forma pero partía de un supuesto falso: que el fondo detrás de la pill era el `#0d121d` de la card. Al medir los píxeles reales de los covers resultó que son mayormente claros, con lo cual la decisión se invertía y la implementación empeoraba justamente las pills que el usuario había reportado. La regla del usuario no tiene ese defecto: no asume nada del fondo. El usuario confirmó además que la opacidad alta era la pieza que faltaba, ya que a 50% la decisión se da vuelta de card a card.

**El color de la pill de Tipo de obra se resuelve por nivel más profundo** (Serie → Franquicia → Editorial). Inicialmente tomaba siempre el color de la Editorial; ver la segunda parte de esta task.

### Validación

Verificado en navegador con sesión real, sobre las 22 combinaciones de color de entidad presentes en el catálogo:

* Tus dos colores, `rgb(217, 59, 40)` y `rgb(93, 82, 94)`, resuelven fondo blanco, como observaste.
* Contraste en el peor caso simulado con una portada completamente blanca: mínimo 3.95:1 para `rgb(10, 135, 200)` y 4.56:1 para `rgb(217, 59, 40)`; los colores muy oscuros como `rgb(2, 6, 1)` dan 20.41:1. Con portada completamente negra el mínimo baja a 1.03:1 para los colores más oscuros, que es justamente el caso que la opacidad alta reduce pero no elimina por completo. Ninguna combinación cae por debajo de 4:1 sobre las portadas efectivamente medidas en el catálogo, cuya luminancia va de 0.004 a 0.454.
* La pill de Tipo de obra se mide a 310px del borde superior del cover y a 8px del borde inferior, con un cover de 225px de ancho: queda abajo, como pediste.
* `npx tsc --noEmit` y `npm run build` pasan.

### Notas para referencia

* `contextual-header.tsx` (líneas 22-24 y 34-36) tiene el mismo patrón original de color de entidad sobre fondo translúcido derivado de sí mismo, con el mismo problema de legibilidad. No se modificó porque no estaba en el alcance de esta task.
* El mismo criterio de fondo debería aplicarse a cualquier componente futuro que ponga el color de la entidad como texto de primer plano, para no reintroducir el defecto.

### Trabajo relacionado

`TASK-API-0244` (en `planned`) expone el publisher de una serie. Cuando termine, la tercera línea del option de Serie del autocomplete aparecerá sola y el workaround temporal de `works-page.tsx` deberá eliminarse.

## Segunda parte — color de la pill de Tipo de obra y consumo de `TASK-API-0244`

### Qué pidió el usuario

El color de la pill de Tipo de obra debe ser el del nivel más bajo disponible: el de la Serie si tiene, si no el de la Franquicia, si no el de la Editorial.

En paralelo, el usuario avisó que `TASK-API-0244` había terminado y pidió consumir el campo nuevo.

### Qué se implementó

* `work-card.tsx` — `accentColor = work.series?.color ?? work.franchise?.color ?? work.publisher?.color ?? ''` resuelve el nivel más bajo y alimenta fondo, borde y texto de la pill de Tipo de obra. Antes tomaba siempre el color de la Editorial.
* `works-page.tsx` — **eliminado el workaround** de las líneas 193-201 que completaba la cascada Serie → Editorial deduciendo el publisher de las obras de la serie. La selección de Serie ahora escribe `publisherId` directamente desde la opción, junto con `franchiseId`.
* `types/works.ts` — `SeriesFilterDto` incorpora `publisherId` y `publisherName`. `EntityOption` incorpora `secondaryContext` para la segunda línea de detalle.
* `option-mappers.ts` — `seriesOption` expone `franchiseId`, `franchiseName`, `publisherId` y `publisherName`; `franchiseOption` también propaga el `publisherId`.
* `entity-autocomplete.tsx` — renderiza la segunda línea de detalle cuando existe.

### Corrección de tipos

`FranchiseFilterDto` y `SeriesFilterDto` declaraban `publisherId` y `franchiseId` como no nulables, pero el backend los devuelve nulables (`long?` en C#). Se tiparon correctamente como `number | null` / `string | null`, y los mappers solo setean `context`, `secondaryContext` y los ids cuando el valor existe, en lugar de interpolar `"Editorial: null"`.

### Validación

* `GET /api/series` en vivo devuelve `publisherId` y `publisherName` resueltos a través de la franquicia.
* El option de Serie renderiza tres líneas: `Fly Vol.1` / `Franquicia: Fly` / `Editorial: Zenescope`. Se cumple el diseño original de `works-catalog.html`.
* Elegir Serie sin haber elegido Editorial beforehand produce `?publisherId=4&franchiseId=4&seriesId=7` y los tres inputs quedan poblados (`Zenescope` / `Fly` / `Fly Vol.1`).
* La pill de Tipo de obra toma el color de la Serie: `colorSerie` y `colorWorkType` coinciden en `rgb(64, 55, 63)`.
* `npx tsc --noEmit` y `npm run build` pasan.

### Nota

El fallo silencioso del workaround —serie sin obras dejaba la Editorial vacía— queda eliminado por completo. La cascada ya no depende de que la serie tenga obras asociadas.
