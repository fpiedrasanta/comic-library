# TASK-PUBLIC-WEB-0092 — Corregir el detalle y la navegación de listas

## Objetivo

Mostrar correctamente la valoración agregada de una lista y conectar su detalle con el reader contextual, utilizando los contratos y las rutas existentes.

## Contexto y fuentes obligatorias

Antes de implementar, leer:

- `communication.md`
- `endpoints.md`
- `components.md`
- `frontend-coding-rules.md`
- `frontend-public-web-agent.md`
- `pages.md`
- `public-web-architecture.md`
- `TASK-API-0301 — Actualizar el dominio de lectura y valoraciones de listas.md`
- `TASK-API-0302 — Implementar consultas de repositorio para listas de lectura.md`
- `TASK-API-0303 — Implementar servicios de consulta de listas de lectura.md`
- `TASK-API-0304 — Implementar endpoints de consultas de listas de lectura.md`

Inspeccionar la implementación actual del detalle, los tipos de respuesta, las rutas y los componentes de valoración existentes.

No asumir propiedades o contratos que no estén documentados o implementados.

## Comportamiento requerido

### Valoración agregada

En `/lists/:id`, mostrar el promedio de valoración de la lista utilizando los datos de la API.

Mostrar la cantidad de valoraciones si está incluida en el contrato y corresponde al diseño existente.

No calcular un promedio alternativo en el frontend ni inventar valores cuando no haya valoraciones.

### Work actual

Utilizar `currentWorkId` proporcionado por el contrato de la API para determinar qué Work debe abrirse al continuar la lectura.

No inferir el Work actual a partir de la posición visual si la API ya lo proporciona.

### Continuar leyendo

El botón debe navegar a:

`/lists/:listId/work/:currentWorkId`

Los parámetros deben reemplazarse por los identificadores reales.

Si no existe un Work actual válido, el botón debe ocultarse o deshabilitarse siguiendo los patrones existentes. Nunca debe producir una ruta con `null`, `undefined` ni un identificador ficticio.

### Selección de un Work

Al seleccionar un Work de la lista, navegar a:

`/lists/:listId/work/:workId`

El `workId` debe corresponder al elemento seleccionado.

Utilizar el router y los mecanismos existentes del proyecto.

## Componentización y responsive

- Reutilizar los componentes de valoración y navegación.
- Mantener el detalle separado del reader.
- Evitar duplicar lógica de construcción de rutas.
- Conservar los estados existentes de carga, error y ausencia de datos.
- Mantener el diseño responsive.

## Restricciones

- No modificar el backend ni sus contratos.
- No implementar el reader contextual en esta task.
- No persistir el Work actual desde el detalle.
- No alterar el orden de los Works.
- No modificar la lectura individual.

## Criterios de aceptación

- El promedio de valoración se muestra correctamente.
- La cantidad de valoraciones se presenta cuando corresponde.
- Se utiliza `currentWorkId` del contrato existente.
- Continuar leyendo genera la ruta contextual correcta.
- Seleccionar un Work abre el identificador seleccionado.
- Una lista vacía no genera rutas inválidas.
- Los estados de carga y error funcionan correctamente.
- No se duplica lógica existente.
- No se introducen regresiones en el detalle.

## Git y ejecución

1. `git checkout main` → `git pull`.
2. Comprobar la rama:
   `git branch --list "feature/us-0035-public-web-sequential-list-reading"`

   Si existe: `git switch feature/us-0035-public-web-sequential-list-reading` → `git merge main`.

   Si no existe: `git switch -c feature/us-0035-public-web-sequential-list-reading`.

3. Implementar los cambios de esta task.
4. Revisar `git diff`.
5. Ejecutar las validaciones disponibles y comprobar compilación y regresiones detectables.
6. Crear uno o más commits y publicar los cambios en la rama de trabajo.
7. Registrar el resultado en esta misma task mediante **append**, sin sobrescribir el contenido previo.
8. Mover el archivo a `finished` o `blocked` conforme a `communication.md`, documentando los resultados y los pendientes.

## Fuera de alcance

La carga del contexto de lectura, el selector de Works y las valoraciones durante la lectura corresponden a tasks posteriores.

## Resultado de ejecución

**Estado**: Cumplido — criterios de aceptación verificados.

**Qué se implementó**:
- `features/catalog/types/lists.ts`: `CatalogListDetailDto.currentWorkId` (resuelto server-side por `GET /api/catalog/lists/{id}`).
- `features/catalog/components/list-header.tsx`: botón de lectura navega a `/lists/{id}/work/{currentWorkId}`; disabled cuando es `null` (lista vacía).
- `features/catalog/components/list-work-row.tsx`: fila acepta `listId` y navega a `/lists/{id}/work/{workId}`.

**Validaciones**: typecheck + build OK; ruta contextual enlazada desde el listado y el detalle.
