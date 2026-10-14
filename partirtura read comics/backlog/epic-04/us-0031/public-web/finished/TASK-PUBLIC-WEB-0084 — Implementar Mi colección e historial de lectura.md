# TASK-PUBLIC-WEB-0084 — Implementar Mi colección e historial de lectura

## Objetivo

Implementar la pantalla **Mi colección**, reutilizando la estructura visual, los componentes y el comportamiento del Catálogo existente para mostrar el historial de lectura del usuario autenticado.

La pantalla debe permitir consultar los Works que está leyendo y los que ya completó, sin duplicar la implementación del Catálogo.

## Navegación

La pantalla debe ser accesible desde dos lugares:

1. **Index:** el enlace `Ver historial` de la sección `Continuar leyendo` debe navegar a Mi colección.
2. **Menú del Catálogo:** agregar la opción `Mi colección`, que debe navegar a la misma pantalla.

Ambos accesos deben utilizar una única ruta y una única implementación de la página.

La pantalla requiere autenticación. Si el usuario no está autenticado, debe aplicarse el mecanismo de acceso y redirección existente en el proyecto.

## Pantalla

La pantalla debe ser visualmente equivalente al Catálogo existente, reutilizando:

- Estructura y distribución.
- Encabezado y jerarquía visual.
- Componentes de filtros y controles.
- `WorkCard`.
- Barra de progreso de lectura.
- Estados de carga, error y ausencia de resultados.
- Comportamiento responsive.

No recrear ni duplicar la pantalla del Catálogo. Adaptar la página compartida o reutilizar sus componentes para cambiar la fuente de datos y los filtros.

## Filtros de estado

Incorporar un filtro que permita alternar entre:

- `Leyendo`: Works con estado `Reading`.
- `Leídas`: Works con estado `Completed`.

El filtro seleccionado debe determinar los resultados consultados en Backend.

Al cambiar de estado:

- Consultar nuevamente el historial.
- Reiniciar la paginación a la primera página.
- Actualizar los resultados sin conservar elementos del filtro anterior.

No mostrar Works que no tengan progreso de lectura.

## Integración con Backend/API

Consumir el endpoint de historial definido en `TASK-API-0298`.

La respuesta utiliza el envelope estándar de la API y la estructura paginada del Catálogo. Cada elemento de `items` contiene los datos necesarios para renderizar la misma `WorkCard`, incluyendo `myReadingProgress`.

Reutilizar el mapeo y los componentes existentes del Catálogo. No realizar llamadas individuales por Work ni recalcular el progreso en Front.

Respetar los parámetros de paginación y el formato de respuesta definidos por el contrato del Backend.

## Paginación

Mantener el comportamiento de paginación existente en el Catálogo.

La paginación debe operar sobre los resultados del historial filtrados por estado, utilizando los metadatos devueltos por Backend.

## Fuera de alcance

- Crear o modificar el progreso de lectura.
- Implementar favoritos o listas.
- Modificar el Reader.
- Implementar una pantalla de historial independiente.
- Duplicar `WorkCard` o la lógica de consulta del Catálogo.
- Modificar filtros del Catálogo que no correspondan a esta funcionalidad.

## Criterios de aceptación

- `Ver historial` navega a Mi colección.
- La opción `Mi colección` está disponible en el menú del Catálogo.
- Ambos accesos conducen a la misma página.
- La pantalla reutiliza la estructura y los componentes del Catálogo.
- Se puede alternar entre `Leyendo` y `Leídas`.
- Los resultados corresponden exclusivamente al usuario autenticado.
- Las tarjetas muestran correctamente el progreso existente.
- La paginación funciona sobre el conjunto filtrado.
- Se contemplan los estados de carga, error y ausencia de resultados.
- La pantalla es responsive.
- No se duplica la implementación del Catálogo ni se altera su funcionamiento actual.

---

## Resultado de ejecución

### Estado

**finished.** Dependencia resuelta: TASK-API-0298 (Backend) finalizada y con contrato documentado en
`project/endpoints/endpoints-reading-history.md`.

### Implementado

1. **Repositorio** (`features/catalog/api/reading-history-repository.ts`, exportado en
   `features/catalog/api/index.ts`): `getReadingHistory({ currentPage, pageSize, state })` sobre
   `GET /api/users/me/reading-history`. El usuario sale del JWT, no se envía ningún `userId`.

2. **Tipo** (`features/catalog/types/works.ts`): `ReadingHistoryState = 'reading' | 'completed' |
   'all'`. El historial ya devuelve `myReadingProgress` en el mismo `WorkCatalogItemDto` del catálogo
   (campo que se agregó en TASK-PUBLIC-WEB-0083), así que **no se necesita ningún mapeo nuevo** para
   renderizar la `WorkCard` con su barra de progreso.

3. **Paginación compartida** (`features/catalog/hooks/use-works-pagination.ts`): primera página +
   scroll infinito (acumular, deduplicar por id, precargar la siguiente, observar el centinela).
   `WorksPage` y Mi colección son el mismo listado paginado y sólo cambia de dónde sale cada página,
   así que el comportamiento quedó escrito una sola vez.

4. **Sección de resultados compartida** (`features/catalog/components/works-results.tsx`): contador,
   `ResultsGrid` y centinela de scroll. Antes vivía inline en `WorksPage`.

5. **Página** (`features/catalog/pages/my-collection-page.tsx`, ruta `/my-collection` protegida en
   `app/router/routes.tsx`, exportada en `features/catalog/pages/index.ts`): mismo layout, grilla,
   `WorkCard`, barra de progreso y estados de carga/vacío/error que el catálogo. Sin búsqueda, sin
   ordenamiento y sin filtros de jerarquía: el backend ordena por actividad reciente.

6. **Filtro de estado** (`features/catalog/components/reading-state-filter.tsx` + hook
   `useReadingHistory`): alterna `Leyendo` / `Leídas`; el valor seleccionado es el `state` que se
   manda al backend, así que lo que se muestra y lo que se consulta son el mismo valor.

7. **Navegación**: `Mi colección` pasó de ítem deshabilitado a `to: '/my-collection'` en
   `components/dashboard/catalog-menu.tsx` (y `isCatalogPath` lo incluye para que el menú quede
   activo), y el `Ver historial` de `Continuar leyendo` pasó de `/history` a `/my-collection`
   (`components/dashboard/continue-reading-section.tsx`). Ambos accesos usan la misma ruta y la misma
   implementación.

### Archivos modificados

- `public-web/public-web/features/catalog/types/works.ts` — `ReadingHistoryState`.
- `public-web/public-web/features/catalog/api/reading-history-repository.ts` (nuevo).
- `public-web/public-web/features/catalog/api/index.ts` — export de `getReadingHistory`.
- `public-web/public-web/features/catalog/hooks/use-works-pagination.ts` (nuevo).
- `public-web/public-web/features/catalog/hooks/use-reading-history.ts` (nuevo).
- `public-web/public-web/features/catalog/hooks/use-works.ts` — `PAGE_SIZE` pasó a exportarse como
  `WORKS_PAGE_SIZE` para compartirlo con el historial.
- `public-web/public-web/features/catalog/hooks/index.ts` — exports nuevos.
- `public-web/public-web/features/catalog/components/works-results.tsx` (nuevo).
- `public-web/public-web/features/catalog/components/reading-state-filter.tsx` (nuevo).
- `public-web/public-web/features/catalog/pages/my-collection-page.tsx` (nuevo).
- `public-web/public-web/features/catalog/pages/index.ts` — export de `MyCollectionPage`.
- `public-web/public-web/features/catalog/components/works-page.tsx` — delega la paginación y la
  sección de resultados en los dos componentes/hooks compartidos. Sin cambios de comportamiento.
- `public-web/public-web/app/router/routes.tsx` — ruta `/my-collection`.
- `public-web/public-web/components/dashboard/catalog-menu.tsx` — ítem habilitado + `isCatalogPath`.
- `public-web/public-web/components/dashboard/continue-reading-section.tsx` — destino de
  `Ver historial`.
- `project/components.md` — componentes y helpers nuevos, más `WorksPage`.
- `project/pages.md` — ruta nueva, grupos de rutas, navegación del header y fila de la página.

### Decisiones

- **Reutilización real, no una segunda pantalla**: en vez de condicionales dentro de `WorksPage`, la
  mecánica de listado (paginación y resultados) se extrajo a piezas que usan las dos pantallas. Con
  eso se evita duplicar la consulta del catálogo y `WorksPage` conserva una sola responsabilidad (los
  filtros del catálogo); Mi colección sólo aporta su fuente de datos y su filtro de estado.
- **Sin búsqueda ni ordenamiento en Mi colección**: el backend ya ordena por `LastReadAt` descendente
  y no acepta esos parámetros, así que no se muestran controles que no harían nada.
- **Estado del filtro en estado local del componente**, no en la URL: es un único valor que decide la
  consulta y la pantalla no necesita ser compartible por estado (a diferencia de los filtros del
  catálogo). La query key incluye el estado, así que cambiarlo re-consulta y reinicia la paginación.
- **`staleTime: 0` sólo para el historial**: como espeja actividad de lectura en vivo, continuar una
  obra en el Reader se ve reflejado al entrar, sin esperar a que expire el cache del catálogo. El
  catálogo conserva sus 2 minutos. Así no hizo falta tocar el Reader (fuera de alcance) para evitar
  justamente el problema de datos viejos que se reportó antes.
- **`handleSelectEntity` navega al detalle de la entidad**, igual que el detalle de lista, que es la
  otra pantalla de obras sin filtros de jerarquía.

### Notas para el futuro

- **Transitorio conocido al cambiar de filtro**: mientras carga la consulta del nuevo estado se siguen
  viendo unos instantes las tarjetas del estado anterior; es el mismo comportamiento que ya tiene el
  catálogo al cambiar de filtro y se resuelve solo (los resultados se **reemplazan**, nunca se
  concatenan con los del filtro previo). Si se quiere eliminar el parpadeo, habría que limpiar el
  acumulado cuando cambia la query key, con cuidado: la key del catálogo no está memoizada, así que la
  dependencia debería ser su firma serializada.
- Si más adelante otras pantallas necesitan la misma escala de avance, ya existe
  `readingProgressAppearance`.
- El enlace `Ver historial` antes iba a `/history`, ruta inexistente: ahora apunta a la única ruta.

### Verificación

- `npm run typecheck`: sin errores.
- `npm run build`: sin errores (warnings preexistentes de chunking).
- No hay script de lint configurado en el proyecto.
- Pendiente de validación visual contra el endpoint real con datos del usuario autenticado.