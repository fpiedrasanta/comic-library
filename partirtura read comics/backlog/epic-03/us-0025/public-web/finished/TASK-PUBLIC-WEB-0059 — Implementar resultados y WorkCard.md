# TASK-PUBLIC-WEB-0059 — Implementar resultados y WorkCard

## Objetivo

Implementar la presentación de resultados del catálogo y el componente reutilizable `WorkCard`.

La implementación debe integrarse con `WorksPage` y evitar cualquier duplicación de código entre los distintos contextos.

`works-catalog.html` es únicamente referencia visual.

## Resultados

Mostrar los Works devueltos por:

```text
GET /api/works
```

La lista debe utilizar el mismo componente independientemente de que los resultados provengan de:

* `/catalog`;
* `/publishers/:id`;
* `/franchises/:id`;
* `/series/:id`.

## WorkCard

Implementar un componente reutilizable para cada Work.

La tarjeta debe contener:

1. Publisher.
2. Franchise.
3. Series.
4. WorkType.
5. Cover.
6. Number.
7. Title.
8. Publication date.
9. Uploaded date.

La estructura visual debe respetar la referencia de `works-catalog.html`.

## Pills

Publisher, Franchise, Series y WorkType deben visualizarse como pills.

Para las entidades que poseen color configurado en base de datos, utilizar dicho color.

Las pills de:

* Publisher;
* Franchise;
* Series;

deben permitir navegar a la página correspondiente.

WorkType debe identificarse visualmente como clasificación del Work y no utilizarse para determinar su pertenencia jerárquica.

## Works sin Number

Cuando un Work no tenga Number:

* no mostrar placeholder;
* no mostrar texto ficticio;
* reservar igualmente el espacio visual correspondiente.

El objetivo es mantener la altura uniforme de las tarjetas.

## Cover

Mostrar la portada del Work utilizando la información devuelta por la API.

Respetar los mecanismos existentes del proyecto para acceder a imágenes protegidas.

No exponer directamente información privada que no corresponda al Public Web.

## Fechas

Mostrar:

* `Publicado:` PublicationDate;
* `Subido:` UploadedAt.

Si una fecha no está disponible, mantener el diseño sin introducir valores ficticios.

## Navegación

Al seleccionar una pill:

* Publisher → `/publishers/:id`
* Franchise → `/franchises/:id`
* Series → `/series/:id`

La navegación debe reutilizar `WorksPage` como página de resultados contextual.

## Estados

Implementar:

* resultados disponibles;
* sin resultados;
* carga;
* error de carga.

Los estados deben ser componentes reutilizables y no markup duplicado en cada contexto.

## Responsive

La tarjeta debe adaptarse correctamente a:

* Mobile;
* Tablet;
* Desktop.

Debe conservar una altura y jerarquía visual coherentes cuando las tarjetas se muestran en conjunto.

## Criterios de aceptación

* Existe un único `WorkCard` reutilizable.
* Los cuatro contextos utilizan el mismo componente.
* Se muestran Publisher, Franchise, Series y WorkType.
* Las pills utilizan los colores definidos por las entidades.
* Las pills de navegación llevan al contexto correspondiente.
* Works sin Number conservan la altura visual de la tarjeta.
* Se muestran portada, título y fechas.
* Los estados de carga, error y vacío son reutilizables.
* No existe duplicación de markup para los distintos contextos.

## Resultado de ejecución

### Estado

finished

### What was implemented

Reusable `WorkCard` and `ResultsGrid` components implemented for all catalog contexts.

### Files changed

* `public-web/public-web/features/catalog/components/work-card.tsx` — created reusable WorkCard
* `public-web/public-web/features/catalog/components/results-grid.tsx` — created ResultsGrid with loading, error, and empty states
* `public-web/public-web/components/protected-image.tsx` — reused for cover images

### Relevant decisions

* WorkCard uses `ProtectedImage` for covers, respecting the project's protected image pattern
* Number field reserves vertical space with transparent spacer when absent to keep card height uniform
* Pills use entity colors from API response with dynamic inline styles
* Pills navigate via `react-router-dom` `Link` to `/publishers/:id`, `/franchises/:id`, `/series/:id`
* ResultsGrid renders WorkCard for all four contexts without duplication
* Loading, error, and empty states are reusable presentational components
* Null-safe rendering for optional `series`/`franchise` relationships

### Validation

* TypeScript: `tsc --noEmit` passes
* Build: `npm run build` passes
