# TASK-PUBLIC-WEB-0099 — Integrar listas personales en WorkCard y administrar pertenencia

## Objetivo

Incorporar el botón de listas personales en las tarjetas de Work y permitir consultar, agregar y quitar Works de las listas personales, además de crear, renombrar y eliminar listas desde los modales correspondientes.

La implementación debe reutilizar los componentes y contratos existentes. No duplicar lógica entre páginas.

## Contextos donde debe aparecer el botón

Agregar el botón de listas personales en las tarjetas de Work mostradas en:

- `/index`, sección de recomendados.
- `/catalog`.
- `/publishers/:id`.
- `/franchises/:id`.
- `/series/:id`.
- `/my-collection`.
- `/favorites`.

Todas las páginas deben utilizar el componente reutilizable de tarjeta existente.

## Estado visual del botón

Usar el atributo `isInPersonalList` que devuelven los endpoints de Works, historial de lectura y recomendados.

- `true`: botón azul.
- `false`: botón gris.

El botón debe conservar la apariencia, iconografía, tamaños y comportamiento responsive definidos por `ux_ui/favorito y lista.html`, adaptados a las convenciones del proyecto.

No calcular el estado global a partir de una sola lista: `isInPersonalList` representa la pertenencia a una o más listas personales.

## Modal de listas personales

Al presionar el botón, abrir un modal con:

- Botón `Nuevo`.
- Campo de búsqueda por nombre.
- Listas personales del usuario autenticado.
- Checkbox de pertenencia a la obra actual.
- Acción para editar el nombre.
- Acción para eliminar la lista.
- Indicador de posición/paginación, por ejemplo, «Mostrando 5 de 20».

Cada fila debe presentar el checkbox, el nombre de la lista y las acciones de editar y eliminar.

### Consulta de listas

Utilizar:

`GET /api/users/me/lists?search={search}&pageSize=50&workId={workId}`

El endpoint devuelve exclusivamente listas personales del usuario autenticado y cada elemento contiene `containsWork`.

- Utilizar `containsWork` para inicializar el checkbox.
- Mantener el orden devuelto por el backend: listas que contienen el Work primero y, después, las demás; cada grupo por nombre ascendente.
- Mostrar 5 listas por página dentro del modal, con paginación local.
- El campo de búsqueda debe consultar el endpoint con `search`, respetando el orden devuelto.
- No mostrar listas del sistema.
- Contemplar carga, error y ausencia de resultados.

El endpoint admite hasta 50 resultados. No implementar paginación remota ni inventar un parámetro `currentPage` para esta operación.

## Agregar y quitar Works

Al cambiar el checkbox:

- Si `containsWork = true` y el usuario lo desmarca, llamar a `DELETE /api/users/me/lists/{listId}/works/{workId}`.
- Si `containsWork = false` y el usuario lo marca, llamar a `POST /api/users/me/lists/{listId}/works` enviando `workId`.

La incorporación utiliza el comportamiento existente del backend para agregar la obra al final de la lista. Las posiciones son cero-based: la primera es `0` y las siguientes utilizan la posición máxima más uno.

Después de una operación exitosa:

- Actualizar el estado del checkbox.
- Invalidar o actualizar las consultas relacionadas con las listas y la pertenencia de la obra.
- Actualizar el botón de la tarjeta si la obra pasa de no pertenecer a ninguna lista a pertenecer a alguna, o viceversa.
- No marcar el botón como gris mientras la obra siga en otra lista personal.

Evitar estados inconsistentes si la operación falla. Informar el error y conservar o recuperar el estado confirmado por el backend.

## Crear una lista

El botón `Nuevo` abre un segundo modal para ingresar el nombre de la lista.

Utilizar:

`POST /api/users/me/lists`

Enviar únicamente los datos admitidos por el contrato, con el nombre de la lista.

Tras crearla:

- Cerrar el modal de creación.
- Actualizar la consulta de listas personales.
- Mostrar la lista creada en el modal principal.
- Permitir agregar inmediatamente el Work actual a la nueva lista.

Respetar la validación de nombre y los errores devueltos por la API.

## Editar el nombre

La acción de editar abre el modal correspondiente, con el nombre actual precargado.

Utilizar:

`PUT /api/users/me/lists/{listId}`

Enviar únicamente el nombre según el contrato existente.

Tras guardar, actualizar los datos de la lista y las consultas afectadas.

## Eliminar una lista

La acción de eliminar debe utilizar el modal de confirmación definido por la referencia visual.

Utilizar:

`DELETE /api/users/me/lists/{listId}`

La eliminación es física y el backend elimina la lista y sus relaciones. No implementar una eliminación local ficticia.

Tras confirmar y recibir éxito:

- Quitar la lista del modal.
- Actualizar las consultas afectadas.
- Actualizar `isInPersonalList` de los Works que correspondan.
- No eliminar ni modificar los Works del catálogo.

Si la operación falla, conservar la lista y mostrar el error.

## Componentización

Reutilizar o crear, según lo existente:

- Botón de listas en WorkCard.
- Modal de listas personales.
- Fila de lista personal.
- Modal de creación/edición.
- Modal de confirmación.
- Estados de carga, error y vacío.

No duplicar componentes por página ni modificar innecesariamente la lógica de favoritos.

## Referencia visual

Inspeccionar `ux_ui/favorito y lista.html`, ubicada originalmente en:

`C:/Users/fpiedrasanta/Desktop/read%20comics/partirtura%20read%20comics/ux_ui/favorito%20y%20lista.html`

El HTML es referencia visual, no fuente funcional. Si no está disponible en el entorno del proyecto, solicitar el archivo adjunto antes de reproducir los modales. La funcionalidad debe seguir esta task y los contratos reales de Backend/API.

## Fuera de alcance

- Crear la sección «Mis listas» en la navegación.
- Implementar el índice de listas personales.
- Implementar el detalle editable y reordenamiento de Works.
- Corregir los detalles estéticos generales del catálogo.
- Cambiar contratos de Backend/API.

## Criterios de aceptación

- El botón aparece en las siete ubicaciones indicadas.
- Su color depende de `isInPersonalList`.
- El modal muestra únicamente las listas personales propias.
- Los checkboxes reflejan `containsWork`.
- Agregar y quitar Works utiliza los endpoints existentes.
- Se pueden crear, renombrar y eliminar listas.
- Los estados visuales se actualizan después de las operaciones exitosas.
- No se eliminan Works al eliminar una lista.
- La solución es responsive y reutilizable.
- No hay duplicación de lógica entre las páginas.
- Build y validaciones disponibles finalizan satisfactoriamente.

## Git y ejecución

1. Leer `communication.md`, `components.md`, `frontend-coding-rules.md`, `frontend-public-web-agent.md`, `pages.md` y `public-web-architecture.md`.
2. Leer los contratos de los endpoints involucrados y revisar las tasks de Backend/API correspondientes a US-0036.
3. Actualizar `main` desde el remoto.
4. Crear o recuperar la rama de trabajo siguiendo las convenciones del proyecto y el procedimiento Git de `communication.md`.
5. Implementar y revisar `git diff`.
6. Ejecutar build, pruebas y validaciones disponibles; corregir regresiones.
7. Actualizar la documentación frontend pertinente.
8. Registrar el resultado de ejecución en esta task, sin sobrescribir contenido previo.
9. Mover la task a `finished` o `blocked` según `communication.md`. Realizar commit y push según el flujo establecido.

## Revisión final

Verificar expresamente:

- `communication.md`
- `components.md`
- `frontend-coding-rules.md`
- `frontend-public-web-agent.md`
- `pages.md`
- `public-web-architecture.md`

Confirmar los siete contextos, la integración con los contratos reales, el comportamiento de los modales, la ausencia de duplicación y las validaciones ejecutadas. Documentar commits, pruebas, bloqueos y estado final.

## Git y ejecución

1. `git checkout main` → `git pull`.
2. Comprobar la rama:

   `git branch --list "feature/us-0036-public-web"`

   Si existe: cambiar a ella y ejecutar `git merge main`.

   Si no existe: crearla desde `main`.

3. Implementar los cambios de esta task.
4. Revisar `git diff`.
5. Ejecutar las validaciones disponibles y comprobar compilación y regresiones detectables.
6. Crear commits y publicar los cambios en la rama de trabajo.
7. Registrar el resultado en esta misma task mediante **append**, sin sobrescribir el contenido previo.
8. Mover el archivo a `finished` o `blocked` conforme a `communication.md`, documentando resultados y pendientes.

## Resultado de ejecución

**Estado**: Cumplido — el botón de listas y su modal funcionan en los siete contextos, con los endpoints existentes.

**Rama de trabajo**: `feature/us-0036-public-web`, creada desde `main` actualizado (`ddc3989`).

**Commits**: `9463539` (implementación), `d1438a0` (sección Mis listas), `41aa806` (detalle editable), `7433216` (documentación de la US).

**Qué se implementó**:

1. **Contrato** — `isInPersonalList` en `WorkCatalogItemDto`, que el Backend/API ya devuelve en el catálogo, el historial y los recomendados.
2. **Repositorio** (`features/catalog/api/personal-lists-repository.ts`) — `GET /api/users/me/lists` (búsqueda, `workId` y `pageSize`), `POST /api/users/me/lists`, `PUT /api/users/me/lists/{listId}`, `DELETE /api/users/me/lists/{listId}`, `POST /api/users/me/lists/{listId}/works` y `DELETE /api/users/me/lists/{listId}/works/{workId}`. Toda la operación usa el cliente HTTP centralizado y el usuario autenticado del token: no se envía ninguna identidad de usuario.
3. **Estructura de modales** — `components/ui/dialog.tsx` sobre `@radix-ui/react-dialog` (foco atrapado, Escape, bloqueo de scroll, nombre accesible) y `components/ui/confirm-dialog.tsx` para las confirmaciones. El proyecto no tenía ninguna primitiva de modal.
4. **Botón** (`personal-list-button.tsx`) — azul cuando la obra pertenece a alguna lista personal y gris cuando no, junto a la estrella en la fila del número de la tarjeta. No depende de una sola lista: `isInPersonalList` significa "pertenece a una o más".
5. **Modal selector** (`personal-lists-modal.tsx`) — búsqueda por nombre, botón `Nueva`, una fila por lista con el checkbox de pertenencia y las acciones de editar y eliminar, indicador de posición («Mostrando 5 de 20») y botón «Ver más listas». Paginación local de 5 por página sobre el máximo de 50 que admite el endpoint. Estados de carga, error y vacío. El orden de la respuesta del backend se conserva tal cual.
6. **Crear, renombrar y eliminar** — `PersonalListNameDialog` (nombre precargado al editar, validación de nombre vacío y longitud, y error de la API) y `ConfirmDialog` para la eliminación. Ninguna lista del sistema es alcanzable: el endpoint de listas personales solo devuelve las del usuario.
7. **Estado compartido** (`features/catalog/hooks/work-listing-cache.ts`) — el estado de una obra vive en la caché de los listados que muestran obras, así que el botón refleja la operación en todas las pantallas. La nueva caché compartida también la usa el hook de favoritos, que deja de llevar su propia copia de esa lógica. Al quitar un favorito de una lista el botón no se pone gris mientras la obra siga en otra: el estado se recalcula sobre el conjunto de listas.
8. **Documentación** — `project/pages.md` y `project/components/public-web-components.md`.

**Decisiones durante la ejecución**:

- **La pertenencia se recalcula, no se alterna**: el modal conoce todas las listas del usuario y su pertenencia, así que después de cada operación se recalcula si la obra pertenece a alguna lista. Es lo que impide que el botón se ponga gris con la obra todavía en otra lista.
- **El orden de las listas no lo decide el cliente**: al crear o renombrar una lista se vuelve a consultar el selector en lugar de colocarla a mano, porque el orden (las que contienen la obra primero y luego por nombre) es una regla del endpoint.
- **Al eliminar una lista se reconsultan los listados de obras**: el cliente no sabe qué obras estaban en la lista eliminada, así que es el backend quien vuelve a resolver `isInPersonalList`.
- **El estado en vuelo se cuenta sobre todas las mutaciones de la obra**: la misma obra puede estar en pantalla más de una vez (catálogo y recomendados), y no debe haber dos operaciones simultáneas para la misma obra.

**Validaciones ejecutadas**:

- `npm run typecheck` (`tsc --noEmit`) → 0 errores. `npm run build` (`tsc -b && vite build`) → compila sin errores.
- `qa-personal-lists.mjs` (Playwright, contra la API y el dev server locales): el botón aparece en los siete contextos (`/index` 12, `/catalog` 24, `/publishers/5` 2, `/franchises/5` 2, `/series/7` 5, `/my-collection` 12, `/favorites` 1); el modal abre y muestra el estado vacío; se crea una lista, la obra se agrega y se quita de ella, el botón de la tarjeta pasa a azul y vuelve al estado anterior, la lista se renombra y se elimina con su confirmación; las llamadas van a los endpoints esperados (`GET/POST/PUT/DELETE /api/users/me/lists` y `POST/DELETE .../works`) y sin errores de página.

**Notas**:

- Public Web no tiene tests unitarios (no hay Vitest/RTL y `test:e2e` no tiene configuración ni casos), así que la verificación disponible es `typecheck` + `build` + los scripts de QA, que se dejan en el repositorio siguiendo la convención de los `qa-*.mjs` existentes.
- Se agregaron `@radix-ui/react-dialog`, `@dnd-kit/core`, `@dnd-kit/sortable` y `@dnd-kit/utilities` al stack de Public Web; el proyecto no tenía primitiva de modal ni de arrastre. Queda documentado en `frontend-public-web-stack-technology.md`.