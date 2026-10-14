# TASK-PUBLIC-WEB-0063 — Debouncear la búsqueda general del catálogo

## Objetivo

La búsqueda general del catálogo dispara una request a `GET /api/works` por cada carácter tipeado, porque `CatalogSearch` llama a `onChange` en cada `onChange` del input y eso actualiza los search params de la URL, lo que genera una `queryKey` nueva y una fetch nueva. El usuario describe el síntoma como que "al ejecutarse instantáneo me cuesta escribir, porque me corta".

El objetivo es que la búsqueda solo se ejecute cuando el usuario deja de tipear durante un intervalo prudencial.

## Contexto

El usuario propuso la idea en pseudocódigo: un contador que se reinicia con cada tecla y dispara la llamada a la API cuando pasa un cuarto de segundo sin actividad.

El debounce ya existía en los autocompletes (`entity-autocomplete.tsx`, 300ms, con un `setTimeout` inline), pero la búsqueda general no lo tenía, y tampoco tenía estado local: el input estaba controlado directamente por el valor de la URL.

## Trabajo solicitado

* La búsqueda general no debe consultar al backend mientras el usuario sigue escribiendo.
* El input debe seguir mostrando el texto al instante, sin depender del round trip.
* El botón de limpiar debe aplicarse de inmediato, sin esperar el debounce.
* No debe quedar lógica de debounce duplicada entre la búsqueda general y los autocompletes.

## Dependencias

Ninguna.

## Criterios de aceptación

* Tipear una palabra completa genera una sola request a `GET /api/works`.
* Durante el tipeo no se emite ninguna request.
* El texto aparece en el input de inmediato.
* El botón de limpiar borra el texto y el filtro de inmediato.
* Un debounce pendiente no se dispara si el componente se desmonta.
* Un debounce pendiente no pisa una acción explícita posterior, como limpiar o elegir una opción.
* El debounce de los autocompletes sigue funcionando y conserva foco y texto.
* `tsc --noEmit` y `npm run build` pasan.

## Resultado de ejecución

### Estado

finished

### Qué se implementó

* `features/catalog/hooks/use-debounced-callback.ts` — hook nuevo. Devuelve `schedule` y `cancel`. Mantiene la callback en un ref para que `schedule` sea estable aunque el consumidor pase una función nueva en cada render, y limpia el timer pendiente en el unmount.
* `features/catalog/components/catalog-search.tsx` — pasa a tener estado local `inputValue`. El input escribe en el estado local al instante y llama a `commitDebounced`, que empuja el valor a la URL recién 350ms después de la última tecla. Un efecto sincroniza el estado local cuando el valor commiteado cambia desde afuera.
* `features/catalog/components/entity-autocomplete.tsx` — se elimina el `setTimeout` inline y el `debounceRef`, y se usa el hook compartido con 300ms.
* `features/catalog/hooks/index.ts` — exporta el hook.

### Decisiones

**350ms para la búsqueda general y 300ms para los autocompletes.** Son dos contextos distintos: la búsqueda general lanza una consulta de obras y cambia la URL, mientras que el autocomplete sólo pide una lista de entidades. No hace falta unificarlos en un solo valor.

**El input tiene estado local en vez de depender de la URL.** Si el input leyera el valor de la URL, seguiría mostrando el texto al instante, pero cada tecla seguiría disparando un `setSearchParams` y por lo tanto un render extra y una `queryKey` nueva. El estado local saca el round trip del camino crítico; la URL se actualiza una sola vez, cuando el usuario para.

**`cancel` es parte de la API del hook y no un detalle interno.** Cualquier cosa que supere al debounce pendiente tiene que poder cancelarlo. Sin esto pasa esto, y pasó durante la verificación: tipear "batmanzz" y apretar el botón de limpiar antes de los 350ms dejaba la URL en `?search=batmanzz` con el input vacío, porque el debounce pendiente se disparaba después del clear y sobrescribía el estado commiteado. El hook expone `cancel` y el clear y la selección de una opción lo invocan.

### Validación

Chromium headless con sesión real, tipeando 10 caracteres con 90ms de separación:

| Escenario | Resultado |
| --- | --- |
| Tipear "spiderman" (994ms) | 0 requests, input ya muestra "spiderman" |
| 350ms después de parar | 1 request: `?pageSize=24&search=spiderman&orderBy=CreatedAt&orderDir=desc` |
| Limpiar con debounce pendiente | URL queda vacía e input vacío, el valor stale no pisa |
| Navegar dentro de la SPA con búsqueda pendiente | 0 requests, el timer se limpia en el unmount |
| Autocomplete "ma" (140ms) | 1 request de búsqueda, foco y texto conservados |
| Elegir opción con debounce pendiente | `?publisherId=3` e input "Marvel Comics" |

`npx tsc --noEmit` y `npm run build` pasan.

### Nota

`useCatalogUrlState` actualiza los search params con `{ replace: true }`, así que el historial del navegador no conserva los filtros previos: el botón "atrás" dentro del catálogo sale a la página anterior en lugar de volver a la búsqueda anterior. Es una decisión previa, ajena a esta task, y no se modificó. Vale la revisarla porque el criterio "back/forward funcionan correctamente" de `TASK-PUBLIC-WEB-0060` queda cumplido sólo a medias.
