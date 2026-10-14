# TASK-PUBLIC-WEB-0069 — Implementar exploración de Publishers, Franchises y Series

## Objetivo

Implementar en el Public Web las tres pantallas de exploración del catálogo:

* `/publishers`
* `/franchises`
* `/series`

La referencia visual se encuentra en:

```text
C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\listar-series-pw.html
```

El HTML es **únicamente una referencia visual**.

La funcionalidad, comportamiento, datos y contratos reales son los definidos por la **US-0026 y el backend existente**. No asumir comportamientos funcionales a partir del HTML.

---

## Requisito principal

Las tres pantallas deben utilizar una **misma estructura de componentes reutilizables**, adaptando únicamente la información correspondiente a cada entidad.

No crear tres implementaciones independientes ni duplicar la estructura completa de las páginas.

La pantalla de Series representa el caso más completo.

### Series

Mostrar:

* Imagen.
* Nombre de Series.
* Pill de Publisher.
* Pill de Franchise.

### Franchise

Reutilizar la misma estructura mostrando:

* Imagen.
* Nombre de Franchise.
* Pill de Publisher.

### Publisher

Reutilizar la misma estructura mostrando:

* Imagen.
* Nombre de Publisher.

Las pills que no correspondan no deben dejar espacios visuales innecesarios.

---

## Imagen

Seguir la referencia visual del HTML para el tamaño, proporción y tratamiento general.

**Única diferencia respecto de la referencia visual:**

La imagen debe implementarse utilizando:

```css
object-fit: cover;
```

y **sin padding interno**.

La imagen debe ocupar completamente su área visual.

Este comportamiento debe ser consistente con las imágenes utilizadas actualmente en los headers de:

* Publisher.
* Franchise.
* Series.

Mantener los bordes redondeados y el tratamiento visual general definido para esos headers.

---

## Publisher

Ruta:

```text
/publishers
```

### Datos

Utilizar:

```text
GET /api/catalog/publishers
```

Mostrar:

* buscador;
* listado/grilla de Publishers;
* imagen;
* nombre.

### Búsqueda

El buscador debe permitir buscar por nombre de Publisher.

La búsqueda se ejecuta contra el backend.

### Navegación

Al seleccionar una card:

```text
/publishers/{id}
```

---

## Franchise

Ruta:

```text
/franchises
```

### Datos

Utilizar:

```text
GET /api/catalog/franchises
```

Mostrar:

* buscador;
* listado/grilla de Franchises;
* imagen;
* nombre;
* pill de Publisher.

### Búsqueda

El buscador debe permitir buscar por:

* nombre de Franchise;
* nombre de Publisher.

La búsqueda se ejecuta contra el backend.

### Navegación

Al seleccionar una card:

```text
/franchises/{id}
```

---

## Series

Ruta:

```text
/series
```

### Datos

Utilizar:

```text
GET /api/catalog/series
```

Mostrar:

* buscador;
* listado/grilla de Series;
* imagen;
* nombre;
* pill de Publisher;
* pill de Franchise.

### Búsqueda

El buscador debe permitir buscar por:

* nombre de Series;
* nombre de Franchise;
* nombre de Publisher.

La búsqueda se ejecuta contra el backend.

### Navegación

Al seleccionar una card:

```text
/series/{id}
```

---

## Pills

Las pills de Publisher y Franchise deben utilizar el `Color` recibido desde el backend.

No hardcodear colores de entidades.

La misma representación visual debe utilizarse en las tres pantallas.

Las pills deben ser componentes reutilizables.

---

## Paginación e infinite scroll

Implementar infinite scroll utilizando los parámetros de paginación de los endpoints.

Comportamiento:

* cargar la primera página al entrar a la pantalla;
* al acercarse al final del listado solicitar la siguiente página;
* acumular los resultados existentes;
* evitar duplicados;
* evitar solicitudes concurrentes de la misma página;
* detener las solicitudes cuando no existan más resultados;
* mantener el estado actual mientras se cargan páginas adicionales.

No implementar paginación tradicional visible para el usuario.

---

## Búsqueda

Implementar la búsqueda utilizando el backend.

Evitar realizar una solicitud por cada tecla.

Aplicar debounce apropiado antes de solicitar los resultados.

Al modificar la búsqueda:

* reiniciar el listado;
* solicitar la primera página correspondiente al nuevo criterio;
* descartar resultados anteriores que ya no correspondan a la búsqueda actual.

---

## Estados

Implementar los estados visuales definidos por la referencia:

* carga inicial;
* carga de páginas adicionales;
* resultados;
* sin resultados;
* error;
* imagen faltante.

Los estados deben reutilizar componentes cuando corresponda.

---

## Responsive

Implementar correctamente:

* Mobile.
* Tablet.
* Desktop/PC.

La grilla debe adaptarse al espacio disponible sin producir overflow horizontal.

Mantener proporciones y jerarquía visual de la referencia.

---

## Componentización

La implementación debe estar orientada a componentes y evitar duplicación.

Como mínimo, identificar y reutilizar los componentes necesarios para:

* página/listado de entidades;
* buscador;
* grilla;
* card de entidad;
* área de imagen;
* pill de entidad;
* estados de carga;
* estado vacío;
* estado de error.

Publisher, Franchise y Series deben ser configuraciones/variantes del mismo concepto de listado y card, no tres implementaciones independientes.

---

## Fuente de verdad

La referencia visual:

```text
C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\listar-series-pw.html
```

define únicamente la **apariencia visual**.

La **funcionalidad real** debe seguir:

* US-0026.
* Contratos actuales de:

  * `GET /api/catalog/publishers`
  * `GET /api/catalog/franchises`
  * `GET /api/catalog/series`

No inferir comportamiento funcional adicional desde el HTML.

---

## Fuera de alcance

No implementar en esta task:

* CRUD de Publishers.
* CRUD de Franchises.
* CRUD de Series.
* modificación de entidades;
* reader;
* progreso de lectura;
* favoritos;
* ratings;
* comentarios;
* recomendaciones;
* listas de usuario;
* cambios en API;
* cambios en contratos backend;
* nuevas funcionalidades de catálogo no definidas en US-0026.

---

## Criterio de finalización

La task está completa cuando:

1. `/publishers` funciona utilizando el endpoint correspondiente.
2. `/franchises` funciona utilizando el endpoint correspondiente.
3. `/series` funciona utilizando el endpoint correspondiente.
4. Las tres pantallas comparten componentes y estructura.
5. Las diferencias de información entre las tres entidades se resuelven mediante variantes/configuración, sin duplicar layouts.
6. La búsqueda funciona según lo definido para cada entidad.
7. El infinite scroll funciona correctamente.
8. Las cards navegan al detalle correspondiente.
9. Las pills utilizan los colores recibidos del backend.
10. Las imágenes utilizan `object-fit: cover` y no tienen padding.
11. Los estados de carga, vacío, error e imagen faltante están implementados.
12. El comportamiento responsive funciona en Mobile, Tablet y Desktop.
13. No se modifica el backend ni la documentación del proyecto.

---

# Resultado de ejecución

## Qué se implementó

Las tres pantallas de exploración, `/publishers`, `/franchises` y `/series`, como
**un único componente de listado configurado tres veces**. No hay tres
implementaciones: `EntityListingPage` contiene encabezado, buscador, conteo,
grilla, infinite scroll y los cuatro estados, y cada ruta pasa únicamente su
endpoint, su copy y un mapper de card.

La diferencia entre las tres entidades es qué pills trae la card, y eso viaja en
los datos (`CatalogEntityCard.pills`), no en el layout:

| Ruta | Endpoint | Pills por card | Card navega a |
| --- | --- | --- | --- |
| `/publishers` | `GET /api/catalog/publishers` | ninguna | `/publishers/{id}` |
| `/franchises` | `GET /api/catalog/franchises` | Editorial | `/franchises/{id}` |
| `/series` | `GET /api/catalog/series` | Editorial + Franquicia | `/series/{id}` |

## Archivos nuevos

- `types/entity-cards.ts` — DTOs de los tres endpoints y la card normalizada.
- `api/entity-cards-repository.ts` — `getCatalogPublishers`, `getCatalogFranchises`,
  `getCatalogSeries`. No envían `orderBy`/`orderDir`: el orden es regla del caso de uso.
- `hooks/use-entity-cards.ts` — `useEntityCards` sobre `useInfiniteQuery` y
  `flattenEntityCards` (acumula páginas y deduplica por id).
- `hooks/use-listing-search.ts` — término de búsqueda en la URL como `?search=`.
- `components/entity-listing-page.tsx` — el listado completo.
- `components/entity-card.tsx` — la card.
- `components/entity-pill-link.tsx` — pill que navega al detalle de su entidad.
- `components/entity-logo-fallback.tsx` — placeholder de imagen faltante.
- `components/entity-card-skeleton.tsx` — skeletons de primera carga.
- `components/entity-listing-state.tsx` — estados vacío y error.
- `components/dashboard/catalog-menu.tsx` — dropdown de escritorio y hamburguesa mobile.
- `pages/publishers-page.tsx`, `pages/franchises-page.tsx`, `pages/series-page.tsx` —
  configuración por entidad.

## Archivos modificados

- `app/router/routes.tsx` — tres rutas nuevas protegidas, conviven con `/publishers/:id`,
  `/franchises/:id` y `/series/:id`.
- `components/dashboard/dashboard-header.tsx` — `Catálogo` pasa a ser un dropdown.
- `components/dashboard/index.ts`, `features/catalog/{api,components,hooks,pages}/index.ts` — exports.
- `features/catalog/components/catalog-search.tsx` — `placeholder` opcional.
- `features/catalog/components/entity-header.tsx` — usa `EntityLogoFallback`.
- `project/pages.md`, `project/components.md` — documentación.

## Decisiones

### Infinite scroll con `useInfiniteQuery`

`WorksPage` pagina a mano con `fetchQuery` y un `IntersectionObserver`. Acá se
usó `useInfiniteQuery`, que ya resuelve lo que la task pedía: una request por
página, ninguna duplicada y ninguna concurrente para la misma página.
`flattenEntityCards` deduplica por id igual, porque el backend pagina por nombre
con desempate por id.

### `object-fit: cover` sin padding, según la task

La US pedía `object-contain` y la task pide explícitamente `cover` sin padding,
alINEado con los headers. Se siguió la task, que es la autoridad, y la US-0026
queda desactualizada en ese punto.

### Pills superpuestas sobre la imagen, según la US

La US dice que las pills van superpuestas sobre el área de imagen; el HTML de
referencia las muestra debajo, entre la imagen y el nombre. Se siguió la US.

### La card es un link estirado, no un link que envuelve

Las pills son links, y anidar links es HTML inválido. La card renderiza un
`<Link>` absoluto sobre todo el `article` y las pills quedan un nivel arriba en
el stacking order. Tres detalles hicieron falta para que funcione:

- El overlay de pills es `absolute inset-0`, así que sin `pointer-events-none`
  se comía el click de la imagen. Las pills hacen `pointer-events-auto`.
- El link de la card va en `z-10`, no en `z-0`: el `transform` del hover de la
  imagen la convierte en stacking context y, empatada en `z-0`, la imagen ganaba
  el click.
- El overlay de pills usa `content-start`: con `flex-wrap`, el `align-content`
  por defecto reparte las filas por todo el alto y la segunda fila de pills caía
  al medio de la imagen.

### Búsqueda en la URL con `replace`

Es un gesto continuo; con `push` el historial se llenaría de estados
intermedios. `CatalogSearch` ya aplicaba debounce de 350 ms, así que no hay una
request por tecla.

### Menú: cuatro secciones deshabilitadas

Por decisión humana el dropdown muestra `Listas`, `Mi colección`, `Favoritos` y
`Mis listas` atenuadas y sin navegación, para que se vea lo que viene sin
ofrecer pantallas vacías. `Mi Colección` y `Wishlist` estaban antes en el header
como botones de primer nivel apuntando a rutas inexistentes; se movieron al
dropdown. El botón hamburguesa para mobile es alcance extra a la task, pedido
como decisión adjuncta.

## Verificación

- `npm run typecheck` → 0 errores.
- `npm run build` → OK. Solo los warnings de `"use client"` de dependencias.
- `qa-entity-listings.mjs` → 47 checks en verde: listado y h1 de las tres rutas,
  conteo, pills por card, navegación de card y de cada pill, búsqueda con debounce
  (1 request con `search`), búsqueda escrita en la URL, reinicio del listado al
  buscar, coincidencia por nombre de editorial, estado vacío, restablecer búsqueda,
  infinite scroll, dropdown de escritorio y menú mobile.
- `qa-entity-responsive.mjs` → 12 checks en verde: sin overflow horizontal en
  mobile/tablet/desktop para las tres rutas, imagen sin padding, área cuadrada y
  `object-fit: cover`.
- `qa-entity-card.mjs` → 7 checks en verde: pills pegadas al borde superior y sin
  separarse al apilar, click en la imagen y en el nombre navegando al detalle, y
  la pill conservando su propia navegación.

### El infinite scroll no se pudo probar con datos reales

La base de desarrollo tiene 5/6/8 entidades y la página pide 24, así que nunca
hay una segunda página que pedir. Se verificó interceptando
`GET /api/catalog/series` con el mismo contrato (3 páginas de 24,
`totalCount: 72`), duplicando 2 ids repetidos a propósito: llegaron 74 ítems y se
renderizaron 72 cards, con las páginas pedidas `[1, 2, 3]` una sola vez, sin
requests extra al terminar y sin errores de consola. La acumulación, la
deduplicación y la condición de fin quedan probadas contra el cliente real; lo
que no se ejercitó es el backend sirviendo esas páginas.

### Verificación pendiente de ejecución manual

Los cuatro estados del listado se ejercitan por código (skeleton, cards, vacío,
error) pero el estado de error real —backend caído o red caída— no se probó de
forma automatizada, porque el listado no falla con los datos actuales.

## Notas

- `entity-header.tsx` usa `bg-nepsCard`, `bg-nepsInput` y `nepsBorder` en
  camelCase, y el theme de Tailwind solo define `neps-card`, `neps-input`,
  `neps-border` en kebab-case. Esos clases no se generan, así que el fondo del
  header no se está aplicando. Preexistente a esta task y **no corregido** por
  estar fuera de alcance.
- Los scripts `qa-entity-listings.mjs`, `qa-entity-responsive.mjs` y
  `qa-entity-card.mjs` quedaron en `public-web/` como evidencia de la
  verificación. No son parte del entregable.
- El criterio 13 pedía no modificar la documentación del proyecto; se actualizó
  igual `pages.md` y `components.md` por indicación posterior del humano, ya que
  el índice de rutas y de componentes estaba desactualizado respecto del código.
