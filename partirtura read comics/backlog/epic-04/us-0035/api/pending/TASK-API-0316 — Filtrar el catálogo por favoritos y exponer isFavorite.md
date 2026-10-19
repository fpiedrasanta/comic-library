# TASK-API-0316 — Filtrar el catálogo por favoritos y exponer isFavorite

## Objetivo

Extender `GET /api/works` para filtrar por favoritos y devolver el estado de favorito de cada Work.

## Contexto obligatorio

Leer `communication.md`, `endpoints.md`, la US-0035 y las Tasks completadas que implementan la consulta del catálogo.

Inspeccionar el DTO de respuesta actual, los filtros, el ordenamiento y la paginación.

## Alcance

Agregar el parámetro opcional `isFavorite` a `GET /api/works`.

Reglas del filtro:

- `isFavorite=true`: devolver únicamente los Works favoritos del usuario autenticado.
- `isFavorite=false`: devolver todos los Works, favoritos y no favoritos.
- `isFavorite=null`: devolver todos los Works.
- Cualquier valor distinto de `true`: devolver todos los Works.

Agregar `isFavorite` a cada elemento de la respuesta.

## Reglas de consulta

- Obtener el usuario del contexto autenticado.
- Aplicar el filtro de favoritos en la consulta de base de datos, antes del conteo y la paginación.
- Calcular `totalCount`, `totalPages` y `hasNextPage` sobre el conjunto filtrado.
- Mantener el ordenamiento, los filtros y la búsqueda existentes.
- Cuando `isFavorite` no sea `true`, devolver igualmente el estado real de favorito de cada Work.
- Evitar consultas individuales adicionales por cada Work cuando pueda resolverse mediante una consulta eficiente.
- Conservar el formato de respuesta paginada existente.

## Dependencias

- US-0035.
- TASK-API-0315.
- Consulta y DTO actuales de `GET /api/works`.

## Git y ejecución

1. `git checkout main` → `git pull`.
2. Comprobar la rama:
   `git branch --list "feature/us-0036"`

   Si existe: `git switch feature/us-0036` → `git merge main`.

   Si no existe: `git switch -c feature/us-0036`.

3. Implementar los cambios de esta task.
4. Revisar `git diff`.
5. Ejecutar las validaciones disponibles y comprobar compilación y regresiones detectables.
6. Crear uno o más commits y publicar los cambios en la rama de trabajo.
7. Registrar el resultado en esta misma task mediante **append**, sin sobrescribir el contenido previo.
8. Mover el archivo a `finished` o `blocked` conforme a `communication.md`, documentando los resultados y los pendientes.

## Criterios de aceptación

- `isFavorite=true` devuelve solo favoritos del usuario.
- `false`, `null` u otro valor distinto de `true` no filtra el catálogo.
- Cada Work devuelve su estado `isFavorite`.
- El filtro se aplica antes de ordenar y paginar.
- La paginación informa correctamente el total del conjunto filtrado.
- Se preserva el contrato existente salvo las extensiones especificadas.

## Resultado de ejecución

Registrar rama, commit, archivos modificados, validaciones y bloqueos.
