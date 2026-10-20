# TASK-PUBLIC-WEB-0103 — Corregir el estado del detalle de listas personales y quitar la caché de TanStack Query de las listas

## Objetivo

Corregir el estado obsoleto que mostraba el detalle de una lista personal después de cambiar sus obras desde otra pantalla, y quitar la caché de TanStack Query de las listas, para que lo que se ve sea siempre lo último que respondió el Backend/API.

## Contexto

La operación de US-0036 quedó integrada en `main` (`b6c09ab`). Al usarla se detectó un defecto: al quitar todas las obras de una lista personal y volver a agregarle una obra desde el catálogo, el detalle de la lista seguía diciendo que no tenía obras, y solo al recargar la página aparecía.

## Causa

El detalle de la lista se guardaba en la caché de TanStack Query con `staleTime` de 5 minutos, así que al volver a la lista se mostraba la copia cacheada —que ya no correspondía con el backend— y no se volvía a consultar. La operación que agregaba la obra a la lista, además, no invalidaba esa caché.

## Alcance

- Quitar la caché de TanStack Query de las listas: el detalle de una lista, el listado de `/lists` y `/my-lists`, el selector de listas personales del modal y las operaciones sobre las listas personales.
- Corregir el estado obsoleto del detalle.
- Revisar las invalidaciones que quedan sin objeto y el código que dejó de usarse.

Fuera de alcance: quitar TanStack Query del resto de la aplicación (catálogo de obras, historial, favoritos, recomendados, reader), que es un cambio mucho mayor y queda como camino abierto.

## Criterios de aceptación

- Volver a una lista personal después de cambiar sus obras desde otra pantalla muestra el estado del backend, sin recargar.
- El estado que se ve es el mismo con y sin recarga.
- Las listas no consultan su cache de TanStack Query: cada pantalla pregunta al backend al abrirse.
- El listado de listas conserva la búsqueda, los filtros, el scroll infinito y los estados.
- El modal de listas personales conserva la creación, el renombrado, el borrado y la pertenencia de las obras.
- El detalle conserva el reordenamiento, la eliminación de obras y la lectura.
- Las listas del sistema y el resto de la aplicación no cambian de comportamiento.
- Build y validaciones disponibles finalizan satisfactoriamente.

## Git y ejecución

1. Leer `communication.md`, `components.md`, `frontend-coding-rules.md`, `frontend-public-web-agent.md`, `pages.md` y `public-web-architecture.md`.
2. Actualizar `main` desde el remoto.
3. Implementar los cambios en `main`, revisando el `git diff`.
4. Ejecutar build, pruebas y validaciones disponibles.
5. Actualizar la documentación frontend pertinente.
6. Registrar el resultado en esta misma task mediante **append**, sin sobrescribir el contenido previo.
7. Mover la task a `finished` o `blocked` según `communication.md`, y realizar commit y push.

## Resultado de ejecución

**Estado**: Cumplido — el defecto está corregido y las listas ya no usan la caché de TanStack Query.

**Commits**: `fix(public-web): refresh the personal list detail and take the lists out of the query cache` (implementación) y `docs: document the lists without the query cache` (documentación).

**Qué se implementó**:

1. **Carga explícita sin caché** (`features/catalog/hooks/use-remote-data.ts`) — un hook que pregunta al backend cuando la pantalla se abre y cuando cambian sus dependencias, y que no guarda nada entre pantallas. Lo que se ve es siempre la última respuesta.
2. **El detalle de una lista** (`use-list-detail.ts`) — usa la carga explícita en lugar de la caché de la consulta. Un 404 sigue siendo una respuesta legítima y se informa aparte de un error real.
3. **El listado de listas** (`use-catalog-lists.ts`) — las páginas se piden de a una y se acumulan en el estado de la pantalla, con la deduplicación por id y sin peticiones duplicadas mientras una página está en vuelo. Se conserva la búsqueda, los filtros, el scroll infinito y los estados.
4. **El selector de listas personales y su administración** (`use-personal-lists.ts`) — la consulta y las operaciones (agregar y quitar la obra, crear, renombrar y eliminar listas) son explícitas. La pertenencia se escribe en el estado de la pantalla y en el de las obras, y el error de una operación no cambia el estado confirmado.
5. **La edición del detalle** (`use-personal-list-editing.ts`) — el reordenamiento y la eliminación de obras son operaciones explícitas; al confirmarse, el detalle se vuelve a consultar.
6. **Código muerto** — se quitaron las invalidaciones del detalle de lista que ya no tenían objeto (las valoraciones de lista y el contexto del reader) y la clave de caché de las listas.

**Decisiones durante la ejecución**:

- **El backend sigue siendo la autoridad**: el estado local solo se escribe después de que la operación responde, y el detalle se vuelve a consultar para mostrar el orden confirmado.
- **La pertenencia de la obra se sigue escribiendo en la caché de los listados de obras**: esa caché es la del catálogo, de los favoritos y del historial, que siguen usando TanStack Query. Es la única dependencia de las listas con la caché de consultas, y no es del estado de las listas.
- **Se mantiene la deduplicación por id** en el listado de listas: el backend pagina por nombre y una lista puede caer en dos páginas.

**Validaciones ejecutadas**:

- `npm run typecheck` (`tsc --noEmit`) → 0 errores. `npm run build` (`tsc -b && vite build`) → compila sin errores.
- `qa-lists-state.mjs` (Playwright), que reproduce el flujo reportado: se crea una lista con tres obras, se borran todas desde el detalle, se agrega otra obra desde el catálogo y se vuelve a la lista → **la obra aparece sin recargar**, y el estado con y sin recarga es idéntico. Sin errores de página.
- `qa-personal-lists.mjs` → el botón en los siete contextos, el modal, el alta y la baja de la pertenencia, el botón de la tarjeta en azul, la creación, el renombrado y el borrado con su confirmación: en verde.
- `qa-my-lists.mjs` → `/my-lists` consulta `myLists=true`, muestra la tarjeta, abre el detalle y `/lists` conserva las listas del sistema: en verde.
- `qa-personal-list-detail.mjs` → los controles de edición, el reordenamiento con botones y con arrastre (que persiste al recargar), la eliminación de una obra (que sigue en el catálogo) y la ausencia de controles en las listas del sistema: en verde.
- `qa-favorites.mjs` → sin regresiones en los favoritos, el catálogo, el historial y el scroll infinito.

**Notas**: la API de desarrollo limita los inicios de sesión (10 por 15 minutos por IP), lo que obliga a espaciar las corridas de QA; es una restricción del entorno de pruebas, no de la implementación. La base de desarrollo queda sin listas personales de prueba.
