# TASK-PUBLIC-WEB-0097 — Implementar favoritos en Public Web

## Objetivo

Implementar la gestión visual e interactiva de favoritos en Public Web, reutilizando `WorkCard` y `WorksPage`, e incorporando `/favorites` como contexto del catálogo.

## Fuentes obligatorias

Antes de implementar, leer:

- `US-0035.md`: definición funcional de favoritos.
- `pages.md`: páginas, rutas y convenciones de navegación.
- `components.md`: componentes existentes y responsabilidades.
- `endpoints.md`: contratos disponibles del Backend/API.
- `communication.md`: flujo de trabajo, estados y ubicación de las tasks.
- `frontend-coding-rules.md`.
- `frontend-public-web-agent.md`.
- `public-web-architecture.md`.
- Las tasks de Backend/API correspondientes a favoritos:
  - `TASK-API-0313`: endpoints.
  - `TASK-API-0314`: servicios.
  - `TASK-API-0315`: entidad y persistencia.
  - `TASK-API-0316`: filtro del catálogo e `isFavorite`.
  - `TASK-API-0317`: estado de favoritos en historial y recomendaciones.
  - `TASK-API-0318`: validación e integración.

Leer también los componentes y servicios actuales de catálogo, `WorkCard`, navegación, autenticación, manejo de errores y scroll infinito.

## Referencia visual

Utilizar como referencia el archivo local:

`C:/Users/fpiedrasanta/Desktop/read comics/partirtura read comics/ux_ui/favorito y lista.html`

Inspeccionar la sección correspondiente a favoritos para determinar ubicación, dimensiones, colores, estados y comportamiento visual de la estrella.

El HTML define la referencia visual; el comportamiento funcional se determina por `US-0035.md`, esta task y los contratos existentes.

## Implementación

### 1. Estrella de favoritos en WorkCard

Incorporar el control de favoritos en el componente reutilizable `WorkCard`, siguiendo la ubicación y el diseño definidos en el HTML de referencia.

Estados visuales:

- **Favorito:** estrella amarilla con fondo amarillo.
- **No favorito:** estrella sin fondo.

Comportamiento:

- Si `isFavorite` es `false`, permitir agregar el Work a favoritos.
- Si `isFavorite` es `true`, permitir quitarlo de favoritos.
- Obtener el estado inicial del atributo `isFavorite` devuelto por el Backend/API.
- Actualizar el estado visual después de completar correctamente la operación.
- Evitar que el clic en la estrella propague el evento y active la navegación u otra acción de la tarjeta.
- Evitar solicitudes duplicadas mientras la operación del mismo Work esté en curso.
- Comunicar errores mediante los mecanismos existentes del proyecto y mantener un estado coherente si la operación falla.

No duplicar la implementación de la estrella en las páginas que utilizan `WorkCard`.

### 2. Integración con Backend/API

Utilizar los contratos existentes documentados en `endpoints.md` y en las tareas del Backend/API.

Operaciones disponibles:

- `POST /api/favorites/{workId}`: agregar un favorito.
- `DELETE /api/favorites/{workId}`: quitar un favorito.

Requisitos:

- Utilizar el cliente HTTP, la autenticación y el manejo de errores existentes.
- No enviar una identidad de usuario en el request: el Backend/API la obtiene del contexto autenticado.
- No simular persistencia local ni reemplazar la API por datos ficticios.
- Conservar la compatibilidad con los mecanismos actuales de carga de datos y manejo de estado.

El estado `isFavorite` de los resultados es la fuente inicial para representar cada Work. No realizar una consulta individual por tarjeta para determinar si es favorito.

### 3. Página `/favorites`

Registrar `/favorites` en la navegación y en `pages.md` conforme a las convenciones existentes.

Debe reutilizar directamente `WorksPage` y el comportamiento del catálogo. No crear una página independiente que replique filtros, búsqueda, resultados o tarjetas.

La consulta debe utilizar el endpoint existente del catálogo con:

`isFavorite=true`

Mantener las funcionalidades existentes del catálogo:

- búsqueda;
- filtros estructurales y WorkType;
- ordenamiento;
- paginación y scroll infinito;
- estados de carga, error y ausencia de resultados;
- diseño responsive;
- `WorkCard` reutilizable.

El filtro debe aplicarse en el Backend/API. No descargar todos los Works para filtrar favoritos en el navegador.

### 4. Quitar favoritos desde `/favorites`

Cuando se quite un favorito desde esta página:

- completar la operación mediante `DELETE /api/favorites/{workId}`;
- actualizar el estado de la tarjeta sin recargar la página completa;
- retirar la tarjeta de los resultados de `/favorites` inmediatamente después de confirmar el éxito;
- conservar la posición y continuidad del scroll siempre que sea posible;
- mantener coherentes los resultados y metadatos de paginación con los mecanismos existentes.

Si la operación falla, no retirar definitivamente la tarjeta ni presentar el cambio como persistido.

### 5. Estado compartido

El estado de favoritos debe mantenerse coherente entre las distintas instancias de `WorkCard` y las páginas que muestran Works.

Si el proyecto dispone de un mecanismo compartido de caché o estado, reutilizarlo. Evitar incorporar una segunda solución global cuando la existente sea suficiente.

Al agregar o quitar un favorito, actualizar las vistas afectadas mediante los mecanismos existentes, sin introducir recargas completas ni solicitudes individuales innecesarias.

### 6. Componentización y documentación

- Reutilizar `WorkCard`, `WorksPage` y los servicios existentes.
- Evitar duplicación de lógica, estilos y markup.
- No introducir abstracciones innecesarias.
- Actualizar `pages.md` para documentar `/favorites`.
- Actualizar `components.md` si cambia la responsabilidad, API o composición de componentes existentes, o si se incorpora un componente reutilizable.
- Actualizar la documentación adicional que corresponda si cambian contratos internos, rutas o convenciones.
- No modificar documentación sin necesidad: mantener los cambios acotados a la funcionalidad.

## Restricciones

- Todas las páginas y funcionalidades requieren autenticación. No implementar comportamiento para usuarios no autenticados.
- No modificar el Backend/API salvo que se detecte una incompatibilidad real de contrato. En ese caso, documentarla y seguir `communication.md`.
- No implementar listas, ratings, historial ni progreso de lectura como parte de esta task.
- No duplicar `WorksPage` ni `WorkCard`.
- No introducir datos ficticios, persistencia local sustitutiva ni filtros de favoritos exclusivamente en el frontend.

## Criterios de aceptación

- La estrella coincide visualmente con la referencia HTML.
- El estado visual corresponde al `isFavorite` devuelto por la API.
- Agregar y quitar favoritos utiliza los endpoints existentes.
- El clic en la estrella no activa la navegación de la tarjeta.
- Los errores no dejan un estado visual que contradiga la persistencia.
- `/favorites` reutiliza `WorksPage` con `isFavorite=true`.
- La búsqueda, los filtros, el ordenamiento y el scroll infinito siguen funcionando.
- Al quitar un favorito desde `/favorites`, su tarjeta desaparece sin recarga completa.
- Las vistas reutilizan componentes y mecanismos de estado existentes.
- `pages.md` y `components.md` quedan actualizados si corresponde.
- La implementación funciona en mobile, tablet y desktop.
- No se introducen regresiones detectables en el catálogo ni en otras páginas que usan `WorkCard`.

## Git y ejecución

1. `git checkout main` → `git pull`.
2. Comprobar la rama:

   `git branch --list "feature/us-0035-public-web"`

   Si existe: cambiar a ella y ejecutar `git merge main`.

   Si no existe: crearla desde `main`.

3. Implementar los cambios de esta task.
4. Revisar `git diff`.
5. Ejecutar las validaciones disponibles y comprobar compilación y regresiones detectables.
6. Crear commits y publicar los cambios en la rama de trabajo.
7. Registrar el resultado en esta misma task mediante **append**, sin sobrescribir el contenido previo.
8. Mover el archivo a `finished` o `blocked` conforme a `communication.md`, documentando resultados y pendientes.

## Resultado de ejecución

**Estado**: Cumplido — favoritos implementados en Public Web; la validación y la integración en `main` quedan a cargo de `TASK-PUBLIC-WEB-0098`.

**Rama de trabajo**: `feature/us-0035-public-web`, creada desde `main` actualizado (`3b155a3`).

**Commits**:
- `7c9114b` — TASK-PUBLIC-WEB-0097: favoritos en las tarjetas y página `/favorites`.
- `98fb01d` — documentación de `/favorites`, de la estrella y del estado compartido.

**Qué se implementó**:

1. **Contrato** — `isFavorite` en `WorkCatalogItemDto` (`features/catalog/types/works.ts`), que el Backend/API ya devuelve en el catálogo, el historial y los recomendados. `isFavorite` en `GetCatalogWorksParams` y en el `useInfiniteWorks`, que viaja como query param a `GET /api/works`.
2. **Repositorio de favoritos** (`features/catalog/api/favorites-repository.ts`) — `POST /api/favorites/{workId}` y `DELETE /api/favorites/{workId}` a través del cliente HTTP centralizado. No se envía identidad de usuario: la toma el Backend/API del token.
3. **Estrella de favoritos** (`features/catalog/components/favorite-button.tsx`) — control reutilizable con `aria-pressed`, nombre accesible con el título de la obra, foco visible y deshabilitado mientras la operación de esa obra está en curso. Favorito: estrella amarilla con fondo amarillo. No favorito: estrella sin fondo. La geometría sigue la referencia `ux_ui/favorito y lista.html` (fila del número, a la derecha).
4. **Integración en las tarjetas** — `WorkCard` y `RecommendedWorkCard` (Recomendados del Catálogo del Index). En ambos, la tarjeta abre el detalle mediante un link que la cubre, con el contenido por encima: la estrella nunca queda dentro del link, así que no navega y el teclado la alcanza como botón. Antes la tarjeta entera era un `<Link>` y un `<button>` anidado habría sido HTML inválido.
5. **Estado compartido** (`features/catalog/hooks/use-favorite.ts`) — la mutación propaga el estado confirmado a todos los listados cacheados (catálogo, historial, recomendados) y saca la obra del listado de favoritos cuando se quita, sin recargar la página. La estrella de una misma obra queda igual en todas las pantallas. El estado en vuelo se cuenta sobre todas las mutaciones de la obra, así que no hay dos operaciones simultáneas para la misma obra.
6. **Página `/favorites`** (`features/catalog/pages/favorites-page.tsx`) — reutiliza `WorksPage` con el criterio `isFavorite=true` y su propio namespace de caché. Hereda búsqueda, filtros de Editorial/Franquicia/Serie, Tipo de obra, ordenamiento, scroll infinito, estado de URL y estados de carga, error y vacío. Sin catálogo duplicado y sin filtrar en el navegador.
7. **Ruta y navegación** — `/favorites` en `protectedRoutes`; el ítem `Favoritos` del menú del header (desktop y mobile) deja de estar deshabilitado y navega a la nueva ruta; `isCatalogPath` la incluye.
8. **Documentación** — `project/pages.md` (ruta, tabla de páginas y navegación del header) y `project/components/public-web-components.md` (`WorkCard`, `RecommendedWorkCard`, `WorksPage`, `FavoriteButton`, `useToggleFavorite`, `useWorksPagination` y los namespaces de caché).

**Decisiones durante la ejecución**:

- **Todo vive en `features/catalog`**: la estrella se implementa dentro de `WorkCard` y la página reusa `WorksPage`, así que una feature nueva obligaría a una importación entre features o a duplicar la estrella. No hay imports cruzados.
- **`useWorksPagination` pasó a leer el acumulado de la caché de cada página cargada** (`useQueries`) en vez de mantenerlo en estado local. Motivo: al confirmar un favorito la caché de la página se actualiza, y con el estado local la lista se reiniciaba en la primera página y se perdía el scroll. Ahora la lista refleja el estado cacheado de sus obras sin perder las páginas ya cargadas. El número de páginas cargadas se lleva explícito (antes se deducía del largo acumulado), y una página que falla se reintenta en vez de saltearse.
- **Namespace de caché propio para los favoritos** (`favorites`): el listado de favoritos es el catálogo con `isFavorite=true` y contiene un conjunto distinto de obras, así que necesita un namespace propio para distinguirlos al propagar el estado de favorito.
- **Alta de un favorito**: se invalidan las consultas del listado de favoritos, porque solo el Backend/API sabe en qué posición de orden y paginación entra la obra nueva.
- **Errores**: el mensaje de la API se muestra junto a la estrella y el estado visual no cambia: una operación fallida nunca se presenta como persistida. No hay sistema de toasts en Public Web, así que se sigue el mecanismo existente de estado local con el mensaje del `ApiError`.

**Validaciones ejecutadas**:

- `npm run typecheck` (`tsc --noEmit`) → 0 errores.
- `npm run build` (`tsc -b && vite build`) → compila sin errores (los avisos de `use client` y de tamaño de chunk son preexistentes).
- `qa-favorites.mjs` (Playwright, contra la API y el dev server locales): la estrella aparece en `/index` (Recomendados del Catálogo), `/catalog`, `/publishers/5`, `/franchises/5`, `/series/7`, `/my-collection` y `/favorites`; el estilo distingue favorito (ámbar con fondo ámbar) de no favorito (sin fondo); el clic no navega; la estrella se opera con el teclado (`aria-pressed` alterna con Enter); `/favorites` consulta con `isFavorite=true` junto a la búsqueda; el estado vacío propio aparece; el scroll infinito carga páginas (24 → 72 tarjetas); quitar un favorito desde `/favorites` saca la tarjeta y actualiza el contador sin recargar, y el catálogo refleja el cambio; ante un error de API el estado no cambia y se muestra el mensaje.

**Notas**:

- Public Web no tiene infraestructura de tests unitarios (no hay Vitest/RTL y `test:e2e` no tiene configuración ni casos), así que la verificación automatizada de esta task es `typecheck` + `build` + el script de QA siguiendo la convención de los `qa-*.mjs` que ya había en el repositorio.
- La estrella no se agregó al detalle de la obra (`/works/:id`), que no muestra `WorkCard`, ni a `ContinueReadingCard` ni a las filas de lista, que son componentes distintos.
