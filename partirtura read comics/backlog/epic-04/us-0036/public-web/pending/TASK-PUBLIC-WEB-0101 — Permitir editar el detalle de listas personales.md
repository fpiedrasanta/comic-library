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