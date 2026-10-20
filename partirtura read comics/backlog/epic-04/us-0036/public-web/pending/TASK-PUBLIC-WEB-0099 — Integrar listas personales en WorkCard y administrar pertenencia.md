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