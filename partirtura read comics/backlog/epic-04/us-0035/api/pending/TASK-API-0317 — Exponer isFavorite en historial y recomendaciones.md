# TASK-API-0317 — Exponer isFavorite en historial y recomendaciones

## Objetivo

Incorporar el estado de favorito del usuario autenticado en las respuestas de historial de lectura y Works recomendados.

## Contexto obligatorio

Leer `communication.md`, `endpoints.md`, la US-0035 y las Tasks completadas que implementan:

- `GET /api/users/me/reading-history`
- `GET /api/works/recommended`

Inspeccionar sus DTO, consultas, servicios, ordenamiento y paginación.

## Alcance

Agregar `isFavorite` a cada Work devuelto por:

- `GET /api/users/me/reading-history`
- `GET /api/works/recommended`

**El atributo es exclusivamente de respuesta.** No agregar `isFavorite` al request ni modificar los parámetros existentes de estos endpoints.

## Reglas

- Calcular el estado para el usuario autenticado.
- No aceptar una identidad de usuario enviada por el cliente para determinar los favoritos.
- Mantener los filtros, parámetros, ordenamiento, paginación y demás campos actuales.
- Evitar consultas individuales adicionales por cada Work.
- No modificar las reglas de progreso de lectura ni las de recomendación.
- Mantener el formato de respuesta existente.

## Dependencias

- US-0035.
- TASK-API-0315.
- DTO y consultas existentes de historial y recomendaciones.

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

- Ambos endpoints devuelven `isFavorite` por Work.
- El atributo no se incorpora a sus requests.
- El valor corresponde al usuario autenticado.
- Se conservan los contratos y comportamientos restantes.
- No se introduce una consulta individual por Work que degrade el rendimiento.

## Resultado de ejecución

Registrar rama, commit, archivos modificados, validaciones y bloqueos.
