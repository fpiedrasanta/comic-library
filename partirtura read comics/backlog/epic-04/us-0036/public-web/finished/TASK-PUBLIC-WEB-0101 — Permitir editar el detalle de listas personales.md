# TASK-PUBLIC-WEB-0101 — Permitir editar el detalle de listas personales

## Objetivo

Permitir que el propietario de una lista personal reordene y quite Works desde la página de detalle existente, reutilizando la experiencia de lectura y visualización de las listas del sistema.

## Página

Reutilizar:

`/lists/:id`

El detalle debe conservar la presentación y las funcionalidades existentes, incluyendo lectura, progreso, ratings y comentarios. No duplicar la página ni implementar versiones separadas para listas personales y del sistema.

La capacidad de edición debe activarse únicamente cuando la lista sea personal y pertenezca al usuario autenticado.

Las listas del sistema deben conservar su comportamiento actual.

## Reordenamiento de Works

En el detalle de una lista personal, habilitar drag-and-drop para cambiar el orden de sus Works.

Al confirmar o finalizar el reordenamiento, persistir los cambios utilizando el contrato existente:

`PUT /api/users/me/lists/{listId}/works/order`

Enviar únicamente las obras afectadas y sus nuevas posiciones, respetando el formato de request definido por Backend/API.

Las posiciones son zero-based. El primer elemento debe tener posición `0`.

El backend conserva las posiciones de las obras no afectadas y admite huecos en la secuencia; el frontend no debe asumir que necesita renumerar todas las obras cuando el contrato no lo requiere.

Evitar guardar cambios en cada movimiento intermedio si el mecanismo existente permite persistir al finalizar el drag-and-drop.

Si la operación falla, recuperar el orden confirmado por el backend e informar el error.

## Quitar Works de una lista personal

Habilitar una acción para quitar cada Work de la lista personal.

Utilizar:

`DELETE /api/users/me/lists/{listId}/works/{workId}`

Tras recibir éxito:

- Quitar el elemento de la lista visible.
- Actualizar el contador de obras.
- Actualizar las consultas afectadas.
- Mantener el Work en el catálogo y en las demás listas.
- No eliminar el historial, progreso de lectura, ratings, comentarios ni favoritos de la obra.

La operación elimina únicamente la relación entre el Work y la lista.

Si la operación falla, conservar o recuperar el estado confirmado y mostrar el error.

## Funcionalidad existente que debe conservarse

La página debe seguir permitiendo las operaciones que ya funcionan para las listas del sistema:

- abrir y leer Works;
- consultar y mantener el progreso de lectura;
- utilizar ratings;
- consultar y publicar comentarios según las reglas actuales.

No duplicar estas funcionalidades ni cambiar su comportamiento como parte de esta task.

El propietario puede utilizar las funcionalidades existentes de ratings y comentarios sobre su propia lista si el backend ya lo permite. No crear nuevas reglas ni endpoints para ello.

## Seguridad y estado de lista

- Usar las operaciones personales de Backend/API para modificar listas personales.
- No permitir editar listas del sistema desde esta interfaz.
- No confiar en el estado visual como mecanismo de autorización.
- Si la API rechaza una operación, respetar el error y no simular que se guardó.
- Reutilizar los controles y patrones de confirmación existentes.

## Componentización y responsive

Reutilizar los componentes de detalle, las tarjetas de Work y los estados existentes.

El drag-and-drop y las acciones de quitar deben funcionar en Desktop y contar con una alternativa operable en dispositivos táctiles, siguiendo las convenciones del proyecto.

No modificar la estética general del detalle salvo lo necesario para mostrar las acciones de edición.

## Fuera de alcance

- Crear el índice «Mis listas».
- Crear, renombrar o eliminar listas.
- Implementar el modal de listas de WorkCard.
- Corregir la limpieza general del catálogo, ratings promedio o detalles estéticos generales.

## Criterios de aceptación

- El detalle de listas personales reutiliza `/lists/:id`.
- El propietario puede reordenar Works y el orden persiste al recargar.
- El propietario puede quitar Works de su lista.
- Quitar un Work no elimina la obra ni sus datos relacionados.
- Las listas del sistema no muestran controles de edición personal.
- Se conservan lectura, progreso, ratings y comentarios.
- Los errores no dejan la interfaz en un estado falso.
- Las acciones funcionan en Desktop y dispositivos táctiles.
- Build y validaciones disponibles finalizan satisfactoriamente.

## Git y ejecución

1. Leer `communication.md`, `components.md`, `frontend-coding-rules.md`, `frontend-public-web-agent.md`, `pages.md` y `public-web-architecture.md`.
2. Revisar el detalle actual de listas, los componentes de Works y los contratos de reordenamiento y eliminación de relaciones.
3. Actualizar `main` desde el remoto.
4. Crear o recuperar la rama de trabajo correspondiente según las convenciones del proyecto.
5. Implementar y revisar `git diff`.
6. Ejecutar build, pruebas y validaciones disponibles, incluyendo persistencia del orden y regresiones del detalle del sistema.
7. Actualizar `components.md` y `pages.md` si corresponde.
8. Registrar los resultados en esta task sin sobrescribir contenido previo.
9. Mover la task a `finished` o `blocked` según `communication.md`, y realizar commit y push conforme al flujo establecido.

## Revisión final

Verificar expresamente:

- `communication.md`
- `components.md`
- `frontend-coding-rules.md`
- `frontend-public-web-agent.md`
- `pages.md`
- `public-web-architecture.md`

Confirmar persistencia del orden, eliminación exclusiva de relaciones, protección de listas del sistema, preservación de funcionalidades existentes y documentación del resultado.

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

**Estado**: Cumplido — el propietario de una lista personal puede reordenar y quitar sus obras desde el detalle, y las listas del sistema conservan su comportamiento.

**Commits**: `41aa806` (implementación), `7433216` (documentación).

**Qué se implementó**:

1. **Detalle único** — `/lists/:id` sigue siendo la única página de detalle. `ListDetailPage` pasó a usar `useCatalogListDetail` (React Query) en lugar de una consulta manual, para que los cambios puedan invalidar el detalle; la consulta que ya existía y no se usaba quedó en uso.
2. **Identificación de la lista personal** — `useIsPersonalList` consulta `GET /api/users/me/lists/{listId}`, que responde 404 para una lista del sistema o de otro usuario. Solo las listas personales del usuario autenticado ofrecen los controles de edición.
3. **Reordenamiento** — `SortableListWorkRow` con dnd-kit: arrastre con el puntero (con distancia de activación, para que el scroll del táctil siga funcionando) y sensor de teclado. Además, los botones que mueven la obra un lugar hacia arriba o hacia abajo, que son la alternativa operable con el dedo y con el teclado. El orden se persiste con `PUT /api/users/me/lists/{listId}/works/order` enviando **solo las obras que cambian de posición**; las que conservan su lugar no viajan y el backend las mantiene donde están.
4. **Quitar una obra** — `DELETE /api/users/me/lists/{listId}/works/{workId}`. Al confirmarse, la obra sale de la lista y el contador se actualiza sin recargar la página; la obra conserva su progreso, sus valoraciones, sus comentarios y sus favoritos, y sigue en el catálogo.
5. **Filas** — `ListWorkRow` acepta de forma opcional los controles de reordenamiento y la acción de quitar, así que la misma fila sirve para las listas del sistema (sin controles) y para las personales.
6. **Estados** — el error de una operación se muestra junto a las obras y el orden confirmado es siempre el del backend: si el reordenamiento falla, se descarta el orden pendiente.
7. **Documentación** — `project/pages.md` y `project/components/public-web-components.md`.

**Decisiones durante la ejecución**:

- **La propiedad de la lista se resuelve con los contratos existentes**: `GET /api/users/me/lists/{listId}` responde 404 para todo lo que no sea una lista personal del usuario, así que no hace falta un campo nuevo en el contrato de las listas.
- **Solo se envían las obras que cambian de lugar**: es lo que exige el contrato del backend, y evita que una posición solicitada siga ocupada por una obra que no viaja en la solicitud.
- **El número de orden de una lista personal es su posición en el orden actual**, no la posición cruda del backend: las posiciones pueden quedar con huecos después de un reordenamiento, y el número que se ve es el orden de lectura.
- **El reordenamiento se persiste al soltar, no en cada movimiento intermedio**: el orden se muestra al instante y se confirma al terminar.

**Validaciones ejecutadas**:

- `npm run typecheck` → 0 errores. `npm run build` → compila sin errores.
- `qa-personal-list-detail.mjs` (Playwright): el detalle de una lista personal ofrece 3 filas ordenables, 3 acciones de quitar y 3 de subir; el reordenamiento con los botones cambia el orden y **persiste al recargar**; el arrastre con el puntero también cambia el orden y persiste; quitar una obra la saca de la lista (3 → 2 obras) y la obra sigue en el catálogo; una lista del sistema no ofrece ningún control de edición (`GET /api/users/me/lists/{id}` → 404 en la lista del sistema y 200 en la personal). Sin errores de página.

**Notas**:

- Las listas personales no se pueden valorar: el Backend/API rechaza la valoración de una lista que no es del sistema, así que la interfaz no ofrece esa acción. El detalle solo muestra la valoración cuando existe.
- La lectura de una lista personal funciona como la de una lista del sistema: el contexto del reader resuelve la lista con el usuario autenticado.