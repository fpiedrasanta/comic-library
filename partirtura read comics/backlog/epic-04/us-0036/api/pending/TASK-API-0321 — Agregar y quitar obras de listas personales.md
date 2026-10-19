# TASK-API-0321 — Agregar y quitar obras de listas personales

## Objetivo

Implementar las operaciones para administrar la pertenencia de una obra a una lista personal.

## Operaciones

Implementar dos endpoints:

1. Agregar una obra a una lista personal, recibiendo `workId` y `workListId`.
2. Quitar una obra de una lista personal, recibiendo `workId` y `workListId`.

Las rutas, verbos HTTP y contratos deben respetar las convenciones actuales del backend.

## Agregar una obra

- Validar que la lista exista, sea personal y pertenezca al usuario autenticado.
- Validar que la obra exista y pueda incorporarse conforme a las reglas actuales del catálogo.
- Crear el `WorkListItem` correspondiente.
- Asignar una posición válida según el mecanismo de orden existente.
- Evitar relaciones duplicadas entre la misma obra y la misma lista.

## Quitar una obra

- Validar que la lista pertenezca al usuario autenticado.
- Validar la pertenencia de la obra a esa lista.
- Eliminar físicamente el `WorkListItem` correspondiente.
- No eliminar el `Work`, ni alterar sus relaciones con otras listas.
- Mantener un orden válido para los elementos restantes, si el modelo actual requiere posiciones consecutivas.

## Seguridad e integridad

- No confiar en que el frontend haya validado la propiedad de la lista.
- No permitir operaciones sobre listas del sistema mediante estos endpoints personales.
- No permitir que un usuario manipule listas ajenas cambiando los identificadores.
- Aplicar las restricciones de integridad existentes y utilizar transacciones cuando sean necesarias.

## Criterios de aceptación

- Una obra puede agregarse a una lista propia.
- No se crean relaciones duplicadas.
- Una obra puede quitarse de una lista propia mediante eliminación física del detalle.
- La obra continúa existiendo en el catálogo y en las demás listas.
- Las operaciones sobre listas ajenas o del sistema son rechazadas.
- Los errores y respuestas siguen los contratos existentes.

## Implementación

Reutilizar los servicios y repositorios existentes de `Work`, `WorkList` y `WorkListItem`. Evitar consultas por elemento que provoquen N+1.

## Git y ejecuciÃ³n

1. `git checkout main` â†’ `git pull`.
2. Comprobar la rama:
   `git branch --list "feature/us-0036-api"`

   Si existe: `git switch feature/us-0036-api` â†’ `git merge main`.

   Si no existe: `git switch -c feature/us-0036-api`.

3. Implementar los cambios de esta task.
4. Revisar `git diff`.
5. Ejecutar las validaciones disponibles y comprobar compilaciÃ³n y regresiones detectables.
6. Crear uno o mÃ¡s commits y publicar los cambios en la rama de trabajo.
7. Registrar el resultado en esta misma task mediante **append**, sin sobrescribir el contenido previo.
8. Mover el archivo a `finished` o `blocked` conforme a `communication.md`, documentando los resultados y los pendientes.