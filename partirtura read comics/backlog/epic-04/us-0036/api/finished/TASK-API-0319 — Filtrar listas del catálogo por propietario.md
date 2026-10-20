# TASK-API-0319 — Filtrar listas del catálogo por propietario

## Objetivo

Extender `GET /api/catalog/lists` con el parámetro opcional `myLists`, sin modificar el comportamiento actual de las listas del sistema.

## Contrato

Request existente:

`GET /api/catalog/lists?currentPage=1&pageSize=24`

Nuevo parámetro:

`myLists` (boolean, opcional).

Reglas:

- `myLists=true`: devolver únicamente listas personales del usuario autenticado.
- Cualquier otro caso (`false`, omitido, `null` o valor no reconocido): devolver únicamente listas del sistema.
- Mantener los parámetros de paginación existentes y el contrato actual de respuesta.

## Reglas de negocio

- Las listas personales deben filtrarse por el usuario autenticado, no por un identificador de propietario enviado por el cliente.
- Las listas del sistema deben seguir identificándose mediante `OwnerType` y los criterios existentes del proyecto.
- Aplicar el filtro en la consulta a base de datos antes de contar resultados y paginar.
- No mezclar listas personales y del sistema en una misma respuesta.

## Criterios de aceptación

- `myLists=true` devuelve solamente las listas personales del usuario autenticado.
- `myLists=false` devuelve solamente listas del sistema.
- Sin el parámetro se conserva el comportamiento actual.
- Un valor no reconocido no habilita la consulta de listas personales ni produce un error de conversión.
- El total de resultados y la paginación corresponden al conjunto filtrado.
- Los contratos existentes continúan funcionando sin cambios incompatibles.

## Implementación

Revisar los endpoints, servicios, repositorios y contratos existentes antes de modificar código. Reutilizar la consulta y los mecanismos de paginación actuales.

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