# TASK-PUBLIC-WEB-0066 — Mejorar detalle de Franchise

## Objetivo

Modificar:

`/franchises/{id}`

para reemplazar el header actual por el diseño visual de referencia y consumir:

`GET /api/franchises/{id}`

Además, dentro del listado de Works:

* ocultar la pill Publisher;
* ocultar la pill Franchise.

La implementación debe ser **orientada a componentes y sin duplicación**.

El HTML es referencia visual; los datos hardcodeados deben reemplazarse por datos reales del endpoint.

## HTML de referencia

```html
<!-- HEADER DE FRANQUICIA -->
<div class="relative overflow-hidden bg-nepsCard border border-nepsBorder rounded-2xl p-6 shadow-2xl transition-all">

  <!-- GLOW Y GRADIENTE BASADO EN EL COLOR DE LA FRANQUICIA -->
  <div class="absolute -top-24 -left-24 w-96 h-96 bg-[#f51b00]/15 rounded-full blur-3xl pointer-events-none"></div>
  <div class="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-[#f51b00]/5 via-transparent to-transparent pointer-events-none"></div>

  <div class="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">

    <!-- IMAGEN REPRESENTATIVA -->
    <div class="w-28 h-28 sm:w-32 sm:w-32 rounded-2xl bg-slate-950/80 border border-[#f51b00]/30 p-3 flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#f51b00]/10">
      <img
        src="https://example.com/franchise-logo.svg"
        alt="Nombre de Franquicia"
        class="max-w-full max-h-full object-contain"
      />
    </div>

    <!-- CONTENIDO -->
    <div class="space-y-3 text-center sm:text-left flex-1">

      <!-- TIPO -->
      <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
        <span class="font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#f51b00]/15 text-[#f51b00] border border-[#f51b00]/30">
          Franquicia
        </span>
      </div>

      <!-- NOMBRE -->
      <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
        Nombre de Franquicia
      </h1>

      <!-- DESCRIPCIÓN -->
      <p class="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
        Descripción de la franquicia.
      </p>

    </div>
  </div>
</div>
```

### Adaptaciones

* `#f51b00` → `color`.
* `Nombre de Franquicia` → `name`.
* Imagen → `urlImage`.
* Descripción → `description`.
* La pill debe decir `Franquicia`.
* No mostrar ID.
* No mostrar Publisher en el header.
* La imagen es representativa y debe utilizar `object-contain`.
* Si `urlImage` es `null`, utilizar el estado existente para imágenes no disponibles.
* Si `description` es `null` o vacía, ocultar la descripción.
* La pill debe respetar el criterio de luminancia/contraste existente.
* Los efectos de glow, gradiente, borde y sombras deben utilizar el color de la Franchise.
* No hardcodear el color del HTML de referencia.

## Works dentro de Franchise

En `/franchises/{id}` las WorkCards no deben mostrar:

* Publisher.
* Franchise.

Deben continuar mostrando y funcionando normalmente:

* Series.
* WorkType.

No crear un WorkCard específico para Franchise.

El `WorkCard` existente debe recibir el contexto necesario para ocultar las pills correspondientes.

## Restricciones

* No modificar el endpoint.
* No modificar dominio ni base de datos.
* No implementar todavía el header de Series.
* No duplicar componentes.
* Mantener `WorksPage` como componente compartido.
* El HTML es únicamente referencia visual.
* La funcionalidad queda definida por esta task y US-0025.

## Validación

* `/franchises/{id}` consume `GET /api/franchises/{id}`.
* Header equivalente visualmente al HTML.
* Imagen correctamente contenida.
* Pill `Franquicia` con contraste correcto.
* Descripción correctamente mostrada.
* Campos opcionales ausentes no rompen el layout.
* WorkCards no muestran Publisher ni Franchise.
* Series y WorkType continúan funcionando.
* Responsive Mobile / Tablet / Desktop.
* TypeScript y build sin errores.

## Resultado de ejecución

### Estado

finished

### Qué se implementó

* `types/works.ts` — `FranchiseDetailDto` (`id`, `name`, `description`, `color`, `urlImage`) y `HierarchyLevel`, que pasó a vivir en los tipos en vez de en un componente.
* `api/catalog-repository.ts` — `getFranchiseDetail(id)`.
* `hooks/use-entity-detail.ts` — loader genérico compartido. Un 404 es una respuesta válida para un id que no resuelve, así que no se reintenta y se reporta aparte de un error real. El mensaje de error sale de la API, que es quien debe redactarlo.
* `hooks/use-franchise-detail.ts` — wrapper de una línea sobre el loader compartido, con la clave de caché que la página usa para el filtro.
* `components/entity-header.tsx` — la presentación del header, extraída del de publisher.
* `components/franchise-header.tsx` — binding de `useFranchiseDetail` a `EntityHeader`.
* `components/publisher-header.tsx` — refactorizado para usar `EntityHeader`; ya no tiene layout propio.
* `components/work-card.tsx` — `hiddenPills` ahora cubre los tres niveles.
* `components/works-page.tsx` — `HIDDEN_PILLS_BY_CONTEXT` declara qué niveles oculta cada ruta; el mapa reemplazar el `?:` inline que había quedado en la 65.
* `pages/context-page.tsx` — el nodo de franchise sale del detalle; se pasa `contextFranchiseId`.

### Decisiones

**No se duplicó el header.** La 65 había dejado el layout del header de publisher dentro de `PublisherHeader`. Agregar el de franchise como copia habría sido una clonación de dos componentes casi idénticos. Se extrajo `EntityHeader`, que sólo recibe props y no sabe de endpoints, y cada header queda como el binding de su DTO. El de series va a usar el mismo componente.

**El mensaje de error viene de la API.** El componente no distingue 404 de otros errores para redactar: el backend ya responde "La franquicia no existe." y "El identificador de la franquicia es obligatorio.", y el frontend sólo decide el título según el status. Así no hay dos lugares diciendo lo mismo.

**`FranchiseNode.publisherId` pasó a `number | null`.** El detalle público de franchise no incluye su publisher, y no hay forma de obtenerlo sin una obra. Antes el tipo era `number` obligatorio, lo que obligaba a inventar un valor. Con `null`, una franquicia sin obras deja el `publisherId` sin resolver en vez de mandar un id falso: el filtro por `franchiseId` alcanza para filtrar, y la cascada de series ya manda `franchiseId` en lugar de `publisherId` cuando el primero está puesto.

**El alpha de la pill es 0.85, igual que en `WorkCard` y en la 65.** El HTML de referencia propone `/15`, donde el color de entidad como texto cae a 1.2:1 en colores oscuros. Se verificó con las tres franquicias reales: Batman `#73aaa7` y la de test `#00FF00` dan fondo negro 0.85, Spiderman `#f10d04` da fondo blanco 0.85, y en los tres casos el texto con el color de entidad lee sobre esa superficie.

### Bug encontrado y corregido durante la validación

`WorkCard` recibía `hiddenPills` pero sólo aplicaba el caso de publisher, porque era el único nivel que la 65 necesitaba. Al pasar el mapa a dos niveles, la pill de Franquicia seguía visible en `/franchises/:id`. Se reemplazó el booleano suelto por un helper `show(level)` que cubre los tres niveles de una vez, de modo que el header de series no vuelva a tropezar con lo mismo.

### Validación

Chromium headless con sesión real, contra el backend corriendo.

`/franchises/6` (Spiderman, `#f10d04`, sin descripción): h1 "Spiderman", pill `Franquicia` con fondo `rgba(255,255,255,0.85)`, borde `rgba(241,13,4,0.3)`, texto `rgb(241,13,4)`. Sin ID, sin historia, sin website y sin nombre de publisher. Logo renderizado a 57x102 dentro de su caja de 128x128, contenido. Cards: 0 pills de Editorial, 0 de Franquicia, 2 de Serie, 2 de WorkType.

`/franchises/5` (Batman, `#73aaa7`): pill con fondo `rgba(0,0,0,0.85)` y texto `rgb(115,170,167)`. Logo 67x102 en caja de 128x128. Cards: 0 Editorial, 0 Franquicia, 0 Serie (no tiene series), 2 WorkType.

`/franchises/11` (franquicia de test, `#00FF00`, con descripción): muestra "Integration test franchise"; la única vez que la descripción aparece, lo que confirma que en 6 y 5 se ocultó por ser `null` y no por un fallo de render. Su logo no aparece porque `GET /images/1062` responde 404 — dato de test roto, no defecto: cae a la inicial "T" en la misma caja de 128x128.

Estados de error: `/franchises/99999999` muestra "La franquicia no existe" con el mensaje del backend; `/franchises/0` muestra "No se pudo mostrar la franquicia" con "El identificador de la franquicia es obligatorio.", que es el 422 real del endpoint.

Responsive, logo contenido y sin scroll horizontal: mobile 390x844 (48px en caja de 112), tablet 820x1180 (57 en 128), desktop 1440x1000 (57 en 128).

La cadena de filtros sigue funcionando: en `/franchises/6`, click en la pill de Serie escribe `?idPublisher=3&idFranchise=6&idSerie=8` sin cambiar de ruta, y tras filtrar las pills de Editorial y Franquicia siguen ocultas.

Sin regresiones: `/catalog` conserva sus 24 pills de Editorial y 24 de Franquicia; `/publishers/3` mantiene visibles las 16 de Franquicia; `/series/8` sigue con el `ContextualHeader` viejo y sus tres pills por card.

`npm run typecheck` exit 0. `npm run build` OK (176 módulos, 8.03s).

### Notas

* El backend no necesitó cambios: `GET /api/franchises/{id}` ya existía con el contrato pedido.
* `ContextualHeader` queda sólo para Series. Cuando llegue la tarea de series, se borra.
* El gap que ya se había anotado en la 65 se derivó al backend, sin workaround: `TASK-API-0247` pidió exponer `PublisherId`, `PublisherName` y `PublisherColor` en `GET /api/franchises/{id}`, y quedó cerrada. Ver la sección de cierre más abajo.

### Ajuste posterior solicitado por el usuario

El logo de Publisher y Franchise dejó de tener padding: ahora llena su caja con `object-cover` sobre un contenedor `overflow-hidden`, conservando el `rounded-2xl` y el border con el color de la entidad. Como el contenedor dejó de ser flex, el fallback de la inicial lleva su propio wrapper `w-full h-full flex items-center justify-center` para seguir centrado.

Medido en Chromium: el logo ocupa 98% x 98% de la caja —el 2% restante es el border de 1px— tanto en desktop como en mobile, con `padding: 0px`, `border-radius: 16px` y `border-color` igual al color de la entidad; el fallback queda centrado en X y en Y. Con `object-cover` los logos verticales se recortan al cuadrado: el de Spiderman es 142x264 en origen. Es la de las dos opciones que el usuario eligió, descartando `object-contain`, que dejaba barras laterales. `npm run typecheck` exit 0 y `npm run build` OK después del ajuste.

### Cierre del gap con el backend

`TASK-API-0247` quedó `finished`: `GET /api/franchises/{id}` expone ahora `PublisherId`, `PublisherName` y `PublisherColor`, y `endpoints-franchises.md` está actualizado. Con eso el workaround temporal se eliminó por completo.

* `types/works.ts` — `FranchiseDetailDto` suma los tres campos. `FranchiseNode.publisherId` vuelve a ser `number`.
* `pages/context-page.tsx` — en el contexto franchise, tanto el nodo de `publisher` como el de `franchise` salen del detalle. Ya no se derivan de `works[0]`.
* La query que pedía una sola obra para resolver los nodos quedó `enabled: type === 'series'`: las páginas de publisher y de franchise dejaron de hacer ese request, una request menos por carga. La página de series sigue usándola porque todavía no tiene endpoint de detalle.

Sobre la nulabilidad: primero se modeló `FranchiseNode.publisherId` como `number | null` con la excusa de que el DTO la declara nullable, y se descartó un centinela `?? 0` por ser un valor inventado. El backend documentó que `Franchise.PublisherId` es FK **requerida** con `DeleteBehavior.Restrict`, así que una franquicia no puede existir sin editorial y la nulabilidad del DTO es puramente defensiva. El tipo quedó `number`, y el nodo sólo se construye cuando el id viene efectivamente en la respuesta, que es la forma honesta de cubrir el caso defensivo sin mentir en el tipo.

### Pill de Editorial en el header de Franchise

La regla original de esta task decía "No mostrar Publisher en el header", escrita cuando el payload no lo traía. Con `TASK-API-0247` cerrado el usuario pidió que la editorial se viera, y eligió la segunda pill con el color de la editorial por sobre mostrarla como dato o como línea de texto.

* `EntityHeader` acepta una prop opcional `parent` con `label`, `name`, `color` y `onSelect`, que renderiza una segunda pill clickeable usando el mismo cálculo de luminancia que la pill del nivel. Si no viene, no renderiza nada.
* `FranchiseHeader` arma esa prop desde `publisherId` / `publisherName` / `publisherColor` del detalle, y sólo si el id y el nombre vienen presentes.
* `WorksPage` le pasa un `onSelectPublisher` que reusa `handleSelectEntity`, o sea el mismo camino de código que las pills de las cards: no hay lógica nueva de navegación.

El click no cambia los resultados, porque la ruta de `/franchises/:id` ya fija el publisher. Lo que sí hace es escribir `?idPublisher={id}&idFranchise={id}` en una URL que antes no tenía query, con lo que el contexto queda explícito en un enlace compartido. Se le avisó al usuario que el click no iba a alterar el filtrado antes de elegir esta opción.

Verificado: `Marvel Comics` en `#f51b00` (fondo blanco 0.85, texto `rgb(245,27,0)`), `DC Comics` en `#0d4a84`, `Zenescope` en `#231f20` (el más oscuro del set, ~12:1 con el fondo blanco) y la editorial de test en `#FF0000`. El click en `/franchises/6` lleva la URL de sin-query a `?idPublisher=3&idFranchise=6` sin salir de la ruta y sin cambiar el header. `/publishers/3` no recibe segunda pill, porque no tiene nivel superior.

Regresión sobre las cuatro rutas, contando sólo las pills dentro del grid de cards: `/catalog` 24/24/22, `/publishers/3` 0/16/14, `/franchises/6` 0/0/2, `/series/8` 2/2/2. Typecheck exit 0, build OK (176 módulos).
