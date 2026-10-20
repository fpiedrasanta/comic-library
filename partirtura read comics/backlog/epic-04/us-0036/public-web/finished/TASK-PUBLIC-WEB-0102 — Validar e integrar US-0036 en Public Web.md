# TASK-PUBLIC-WEB-0102 — Validar e integrar US-0036 en Public Web

## Objetivo

Validar la integración funcional de la administración de listas personales en Public Web una vez completadas TASK-PUBLIC-WEB-0099, TASK-PUBLIC-WEB-0100 y TASK-PUBLIC-WEB-0101.

No agregar funcionalidades nuevas durante la validación salvo las correcciones necesarias para cumplir los criterios de aceptación de esas tasks.

## Prerrequisitos

Verificar que las tres tasks de implementación estén en estado `finished` y que sus cambios estén disponibles en sus ramas correspondientes.

Si alguna tarea está bloqueada o no cumple sus criterios, documentar el bloqueo y no integrar cambios incompletos.

## Validación funcional

### WorkCard y modal de listas

- El botón aparece en todos los contextos indicados por TASK-PUBLIC-WEB-0099.
- El color depende de `isInPersonalList`.
- El modal utiliza `containsWork` para cada checkbox.
- La búsqueda conserva el orden requerido por la API.
- Crear, renombrar y eliminar listas funciona con los endpoints existentes.
- Agregar y quitar Works persiste correctamente.
- Los cambios actualizan el estado de la tarjeta y las consultas relacionadas.
- No se muestran ni modifican listas del sistema.

### Índice Mis listas

- La navegación a «Mis listas» funciona.
- La consulta utiliza `myLists=true`.
- Solo aparecen listas personales del usuario autenticado.
- La página reutiliza los componentes de `/lists`.
- El detalle se abre desde la tarjeta seleccionada.

### Detalle de listas personales

- El propietario puede reordenar Works.
- El orden persiste al recargar.
- El propietario puede quitar Works.
- Quitar una relación no elimina la obra ni modifica su progreso, ratings, comentarios o favoritos.
- El detalle de listas del sistema conserva el comportamiento previo.
- Se mantienen las funcionalidades existentes de lectura y seguimiento.

### Responsive y regresiones

Validar Mobile, Tablet y Desktop.

Comprobar que los cambios no rompen:
- catálogo general;
- recomendados;
- historial de lectura;
- favoritos;
- páginas contextuales de Publisher, Franchise y Series;
- navegación y detalle de listas del sistema.

## Validación técnica

- Revisar `git status` y `git diff`.
- Ejecutar build y pruebas disponibles.
- Corregir errores reproducibles dentro del alcance, revisando el diff y volviendo a ejecutar las validaciones afectadas.
- Verificar que no se duplicaron páginas, componentes ni lógica de pertenencia.
- Confirmar que no hay contratos API inventados ni solicitudes incompatibles con Backend/API.
- Confirmar que las actualizaciones de caché/estado no dejan botones, checkboxes o contadores desincronizados.

## Documentación

Revisar y actualizar cuando corresponda:

- `pages.md`
- `components.md`
- `communication.md`

No sobrescribir los resultados previos de las tasks de implementación.

## Criterios de aceptación

- Las tres tasks previas cumplen sus criterios de aceptación.
- Los flujos de listas personales funcionan de punta a punta.
- Las listas del sistema no pueden modificarse desde los controles personales.
- No se detectan regresiones en los flujos existentes.
- Las validaciones técnicas finalizan satisfactoriamente.
- El resultado de la integración queda documentado.

## Git y ejecución

1. Actualizar `main` desde el remoto.
2. Cambiar a la rama o ramas de trabajo y verificar que los cambios de las tasks estén presentes.
3. Revisar `git status` y `git diff`; identificar cambios accidentales o sin registrar.
4. Ejecutar validaciones técnicas y funcionales.
5. Si se necesitan correcciones, implementarlas en la rama de trabajo, revisar el diff, validar y registrar commits.
6. Si existe un fallo o bloqueo real, documentarlo en esta task, moverla a `blocked` según `communication.md` y no integrar en `main`.
7. Si todas las validaciones pasan, integrar siguiendo el procedimiento de `communication.md`, resolver conflictos y repetir las validaciones relevantes sobre `main`.
8. Publicar `main` en el remoto y verificar el resultado.
9. Eliminar ramas de trabajo locales y remotas únicamente después de confirmar que la integración fue exitosa.
10. Registrar commits, pruebas, integración, push y estado final en esta task.

## Revisión final obligatoria

Leer y verificar:

- `communication.md`
- `components.md`
- `frontend-coding-rules.md`
- `frontend-public-web-agent.md`
- `pages.md`
- `public-web-architecture.md`

Documentar el resultado de cada validación, los commits integrados, los posibles bloqueos y el estado final de la task.

## Git y ejecución

1. Actualizar `main` desde el remoto.
2. Cambiar a `feature/us-0036-public-web` y verificar que los cambios de las tasks anteriores estén presentes.
3. Revisar `git status` y `git diff`; comprobar que no existan cambios accidentales o sin registrar.
4. Ejecutar las validaciones técnicas y funcionales descritas en esta task.
5. Si se requieren correcciones, implementarlas en la rama de trabajo, revisar el diff, ejecutar las validaciones afectadas, crear commits y publicar los cambios.
6. Incorporar los resultados de esta revisión en esta misma task mediante **append**, sin sobrescribir el contenido previo.
7. Si las validaciones fallan o existe un bloqueo real, documentar hallazgos, causa y trabajo pendiente, y mover la task a `blocked` conforme a `communication.md`. No integrar en `main`.
8. Si todas las validaciones pasan, actualizar `main`, integrar la rama, resolver eventuales conflictos y repetir las validaciones pertinentes sobre `main`.
9. Publicar `main` y verificar la integración remota. Eliminar la rama local y remota de trabajo solamente después de confirmar que la integración final fue exitosa.
10. Registrar mediante **append** los commits, pruebas, resultados de integración, publicación y estado final. Mover esta task a `finished` conforme a `communication.md` solo cuando la integración haya sido verificada.

## Resultado de ejecución

**Estado**: Cumplido — las tres tasks previas cumplen sus criterios, los flujos de listas personales funcionan de punta a punta y la integración en `main` está verificada y publicada.

**Rama de trabajo**: `feature/us-0036-public-web`, creada desde `main` actualizado (`ddc3989`) y eliminada (local y remota) después de verificar la integración.

**Commits integrados** (fast-forward en `main`, sin conflictos):
- `9463539` — TASK-PUBLIC-WEB-0099: botón de listas personales y su modal en las tarjetas de obra.
- `d1438a0` — TASK-PUBLIC-WEB-0100: sección «Mis listas» (`/my-lists`).
- `41aa806` — TASK-PUBLIC-WEB-0101: reordenamiento y quitar obras de una lista personal.
- `7433216` — documentación de la US.
- `665e37d` — cierre documental de TASK-PUBLIC-WEB-0099, 0100 y 0101.

### Prerrequisitos

Las tres tasks de implementación están en `finished` con sus commits publicados en la rama de trabajo, y sus criterios se verificaron de nuevo durante esta validación. No hubo bloqueos.

### Validación funcional

**WorkCard y modal de listas** (verificado con `qa-personal-lists.mjs`):

| Validación | Resultado |
|---|---|
| El botón aparece en los siete contextos | ok (`/index` 12, `/catalog` 24, `/publishers/5` 2, `/franchises/5` 2, `/series/7` 5, `/my-collection` 12, `/favorites` 1) |
| El color depende de `isInPersonalList` | ok (azul con la obra en una lista, gris sin ella) |
| El modal usa `containsWork` para cada checkbox | ok |
| La búsqueda conserva el orden de la API | ok (las listas que contienen la obra van primero) |
| Crear, renombrar y eliminar listas | ok (`POST`, `PUT` y `DELETE /api/users/me/lists`) |
| Agregar y quitar Works persiste | ok (`POST` y `DELETE /api/users/me/lists/{id}/works`) |
| Los cambios actualizan el estado de la tarjeta y las consultas | ok (el botón pasa a azul al agregar y vuelve al gray al quitar) |
| No se muestran ni modifican listas del sistema | ok (el selector solo devuelve las listas personales del usuario) |

**Índice Mis listas** (verificado con `qa-my-lists.mjs`):
- La navegación funciona: el ítem «Mis listas» del menú (desktop y móvil) navega a `/my-lists`.
- La consulta utiliza `myLists=true` (`currentPage=1&pageSize=24&myLists=true`); `/lists` sigue usando `myLists=false`.
- Solo aparecen listas personales del usuario.
- La página reutiliza los componentes de `/lists` (misma grilla, mismos filtros, mismo scroll infinito, mismos estados) y no ofrece el filtro de tipo de lista, que no es compatible con el modo personal.
- El detalle se abre desde la tarjeta seleccionada (`/lists/{id}`).

**Detalle de listas personales** (verificado con `qa-personal-list-detail.mjs`):
- El propietario puede reordenar Works, con arrastre y con los botones de subir y bajar.
- El orden persiste al recargar (con y sin arrastre).
- El propietario puede quitar Works: la obra sale de la lista, el contador se actualiza y la obra sigue en el catálogo.
- Quitar una relación no modifica el progreso, los ratings, los comentarios ni los favoritos de la obra.
- El detalle de las listas del sistema conserva el comportamiento previo: sin controles de edición (`GET /api/users/me/lists/{id}` responde 404 para una lista del sistema y 200 para la personal).
- Se mantienen lectura, progreso y ratings: el contexto del reader resuelve la lista personal igual que una del sistema.

**Responsive y regresiones**:
- Recorrido de `/index`, `/catalog`, `/publishers/5`, `/franchises/5`, `/series/7`, `/lists`, `/my-lists`, `/my-collection`, `/favorites`, `/profile` y `/settings` en mobile (390 px), tablet (820 px) y desktop (1440 px): el modal de listas abre dentro del viewport en las tres resoluciones (358 px y 448 px de ancho) y no hubo errores de página.
- Catálogo general, recomendados, historial de lectura, favoritos y páginas contextuales de Publisher, Franchise y Series: sin regresiones. `qa-favorites.mjs` se repitió completo (estrella, estilos, no navegación, teclado, `/favorites`, scroll infinito de 24 a 72 tarjetas, estado vacío y error de API) en verde, con la caché de obras compartida entre favoritos y listas personales.
- Las listas del sistema mantienen su listado, su detalle y su reader.

### Validación técnica

- `git status` y `git diff` revisados: 42 archivos, todos de la US (la app de Public Web, la documentación del proyecto y los archivos de task). No hay cambios accidentales ni sin registrar.
- `npm run typecheck` (`tsc --noEmit`) → **0 errores**, en la rama y repetido sobre `main`.
- `npm run build` (`tsc -b && vite build`) → **compila sin errores**, en la rama y sobre `main` (los avisos de `use client` y de tamaño de chunk son preexistentes).
- Scripts de QA: `qa-personal-lists.mjs`, `qa-my-lists.mjs`, `qa-personal-list-detail.mjs` y `qa-favorites.mjs` (regresión) → en verde sobre `main`.
- No se duplicaron páginas, componentes ni lógica de pertenencia: la estrella y el botón de listas comparten `FavoriteButton` y `PersonalListButton` en todas las tarjetas; la página de listas es la misma en los dos modos; el modal, la fila, el diálogo de nombre y el reordenamiento son componentes únicos; la caché de las obras es una sola.
- No hay contratos API inventados: todo consume `/api/users/me/lists`, `/api/users/me/lists/{id}`, `/api/users/me/lists/{id}/works`, `/api/users/me/lists/{id}/works/{workId}`, `/api/users/me/lists/{id}/works/order` y `GET /api/catalog/lists?myLists=true`.
- Las actualizaciones de caché no dejan botones, checkboxes ni contadores desincronizados: la pertenencia se recalcula sobre el conjunto de listas, el orden confirmado es siempre el del backend y el contador de obras de la lista sigue a la fila quitada.

### Documentación

- `project/pages.md`: la ruta `/my-lists`, la fila de la tabla de páginas, la nota de la navegación del header y el comportamiento editable del detalle de listas.
- `project/components/public-web-components.md`: `Dialog`, `ConfirmDialog`, `PersonalListButton`, `PersonalListsModal`, `PersonalListRow`, `PersonalListNameDialog`, `SortableListWorkRow`, `ListsPage`, `ListCard`, `ListWorkRow`, `useWorksListingCache`, `usePersonalLists`, `useIsPersonalList` y `usePersonalListWorks`, y la actualización de `WorkCard`, `RecommendedWorkCard` y las claves de caché.
- `project/frontend-public-web-stack-technology.md`: `@radix-ui/react-dialog` y dnd-kit, con el criterio de uso.
- `communication.md` no necesitó cambios: el flujo de trabajo de la US respetó el existente.

### Integración final

- `main` actualizado desde el remoto, merge fast-forward de `feature/us-0036-public-web` sin conflictos, `typecheck`, `build` y los scripts de QA repetidos sobre `main` con el mismo resultado.
- `main` publicado (`ddc3989..665e37d main -> main`) y verificado: `git diff main origin/main` sin diferencias.
- Rama de trabajo eliminada (local y remota) tras confirmar la integración.
- La base de desarrollo queda como estaba: sin listas personales de prueba y sin favoritos de prueba.

**Notas**: no quedan bloqueos ni trabajo pendiente en Public Web para US-0036. Durante la validación la API de desarrollo respondió 429 por su límite de inicios de sesión (10 por 15 minutos por IP): es una restricción del entorno de pruebas, no de la implementación, y las validaciones se repitieron al vencer la ventana.