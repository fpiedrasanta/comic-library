# TASK-PUBLIC-WEB-0064 — Los pills arman la cadena de filtros en la URL en vez de navegar

## Objetivo

Cambiar la forma de llegar a un contexto del catálogo. Hoy, hacer click en una pill de Editorial, Franquicia o Serie navega a `/publishers/:id`, `/franchises/:id` o `/series/:id`.

A partir de ahora las pills no navegan: escriben la cadena de jerarquía completa en la URL de la página en la que ya se está.

* Click en Editorial → `?idPublisher={id}`
* Click en Franquicia → `?idPublisher={id}&idFranchise={id}`
* Click en Serie → `?idPublisher={id}&idFranchise={id}&idSerie={id}`

El comportamiento se pidió en las cuatro páginas: `/catalog`, `/publishers/{id}`, `/franchises/{id}` y `/series/{id}`.

## Contexto

El usuario cambió de idea sobre la navegación y dejó claro que las páginas de contexto no se borran: "no borres esas páginas, porque la vamos a usar, pero de otra forma que vamos a ver más adelante". Por lo tanto las rutas y sus páginas se conservan y siguen funcionando por URL directa; sólo deja de haber links hacia ellas.

El nombre de los params de URL pasa de `publisherId`, `franchiseId`, `seriesId` a `idPublisher`, `idFranchise`, `idSerie`.

## Dependencias

Ninguna.

## Criterios de aceptación

* Click en una pill no navega a otra ruta.
* Click en Editorial escribe `?idPublisher={id}` y limpia los niveles más profundos.
* Click en Franquicia escribe `?idPublisher={id}&idFranchise={id}` y limpia el nivel de serie.
* Click en Serie escribe los tres niveles.
* Funciona igual en `/catalog` y en las tres páginas de contexto.
* Las rutas `/publishers/:id`, `/franchises/:id` y `/series/:id` siguen accesibles por URL directa y siguen mostrando resultados.
* Los filtros se representan correctamente en los inputs de la página.
* `tsc --noEmit` y `npm run build` pasan.

## Resultado de ejecución

### Estado

finished

### Qué se implementó

* `use-catalog-url-state.ts` — los tres params de jerarquía se renombraron a `idPublisher`, `idFranchise` e `idSerie`, con constantes con nombre para cada clave en lugar de literales repetidos. Se eliminó el campo `context` del retorno, que duplicaba los ids ya presentes en `filters` y no lo consumía nadie.
* `work-card.tsx` — `EntityPill` pasó de `Link` a `button`. El componente ya no conoce rutas ni URLs: emite la cadena resuelta de la obra mediante un callback `onSelectEntity` con la forma `{ publisherId?, franchiseId?, seriesId? }`. Al desestructurar `publisher`, `franchise` y `series` desde props, el estrechamiento de tipos se conserva dentro de los closures del click.
* `results-grid.tsx` — propaga `onSelectEntity` a cada `WorkCard`.
* `works-page.tsx` — maneja la selección. Los params del backend no cambian: `worksParams` sigue enviando `publisherId`, `franchiseId` y `seriesId` a `GET /api/works`. Sólo cambia el contrato de la URL del navegador.

### Decisión: la ruta manda en los niveles que fija

En una página de contexto hay un conflicto real: `/series/8` significa "esta serie", pero hacer click en la pill de Editorial de una card escribría un `idPublisher` distinto, y el efecto que sincroniza el contexto volvería a imponer el de la ruta. Las dos cosas no pueden ser verdad a la vez.

Se resolvió con que la ruta gane en los niveles que ella fija, y que la pill sólo pueda refinar los niveles de abajo. `fixedHierarchy` declara qué nivel es inmutable según `contextType`, y `handleSelectEntity` lo aplica antes de la selección. El resultado coincide con los filtros visibles en cada página: en `/publishers/:id` el input de Editorial está oculto y las pills refinan Franquicia y Serie; en `/franchises/:id` sólo Serie; en `/series/:id` no hay niveles refiables y el click no hace nada.

Consecuencia a tener en cuenta: en `/series/:id` las pills de jerarquía no producen ningún cambio, porque todo lo que podrían escribir ya está fijado por la ruta. Si se prefiriera que en las páginas de contexto el click navegue a `/catalog` con la cadena, es un cambio acotado y localizado.

### Validación

Chromium headless con sesión real. Tipeando sobre las pills y leyendo la URL:

| Página | Click | URL resultante |
| --- | --- | --- |
| `/catalog` | Editorial | `?idPublisher=8` |
| `/catalog` | Franquicia | `?idPublisher=8&idFranchise=9` |
| `/catalog` | Serie | `?idPublisher=8&idFranchise=9&idSerie=11` |
| `/publishers/3` | Franquicia | `?idPublisher=3&idFranchise=6`, sigue en `/publishers/3` |
| `/publishers/3` | Serie | `?idPublisher=3&idFranchise=6&idSerie=8` |
| `/franchises/6` | Serie | `?idPublisher=3&idFranchise=6&idSerie=8` |
| `/series/8` | Editorial | sin cambios, la ruta fija los tres niveles |

Los tres inputs de filtro quedan poblados con los nombres correctos tras la cadena completa en `/catalog`. Las tres páginas de contexto siguen accesibles por URL directa y devuelven sus resultados. La página de catálogo ya no renderiza ningún `Link`: el conteo de `<a>` en `/catalog` es 0, lo que confirma que las pills dejaron de navegar.

`npx tsc --noEmit` y `npm run build` pasan.

### Nota

El renombre de los params rompe los enlaces guardados con los nombres anteriores (`?publisherId=`, `?franchiseId=`, `?seriesId=`). Es una URL pública, así que conviene decidir si se acepta el corte o se agrega un alias de lectura para los nombres viejos. No se implementó alias porque no se pidió.