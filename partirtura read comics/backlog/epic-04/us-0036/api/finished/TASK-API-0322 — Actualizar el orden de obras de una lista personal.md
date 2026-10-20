# TASK-API-0322 — Actualizar el orden de obras de una lista personal

## Objetivo

Permitir que el frontend persista el orden resultante de una operación drag & drop sobre las obras de una lista personal.

## Contrato de entrada

Recibir el identificador de la lista y una colección de pares con esta estructura conceptual:

`[{ "workId": "...", "position": 1 }]`

Los tipos concretos de los identificadores y la ruta del endpoint deben seguir los contratos existentes del proyecto.

## Reglas de negocio

- La lista debe existir, ser personal y pertenecer al usuario autenticado.
- Cada `workId` debe corresponder a una obra perteneciente a esa lista.
- Cada obra debe aparecer una sola vez en la solicitud.
- Las posiciones no deben repetirse.
- La solicitud debe representar un orden válido para el conjunto de elementos que se pretende reordenar.
- Si la colección está incompleta o contiene identificadores ajenos a la lista, rechazar la operación sin dejar un orden parcial.
- Persistir los cambios de forma transaccional.
- No modificar el orden de otras listas ni ningún dato de las obras.

## Criterios de aceptación

- Una solicitud válida actualiza las posiciones de los elementos.
- El orden persiste después de consultar nuevamente la lista.
- Los identificadores duplicados, posiciones inválidas y obras que no pertenecen a la lista son rechazados.
- Un usuario no puede reordenar listas de otro usuario ni listas del sistema mediante este endpoint.
- Ante un error de validación o persistencia no queda aplicado un orden parcial.
- La respuesta y los errores respetan las convenciones actuales de la API.

## Implementación

Revisar el modelo actual de `WorkListItem` y el mecanismo existente de ordenamiento antes de definir si las posiciones comienzan en cero o en uno. No introducir una convención nueva si el proyecto ya tiene una definida.

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

## Resultado de ejecución

**Estado**: Cumplido — criterios de aceptación verificados.

**Qué se implementó**:
- Persistencia del orden resultante de un drag & drop: `PUT /api/users/me/lists/{listId}/works/order` con el
  cuerpo `[{ "workId": 17, "position": 1 }, ...]`.
- El cuerpo contiene **solo las obras cuya posición cambió**. Ejemplo del criterio: con el orden
  `{0, a} {1, b} {2, c} {3, d}`, mover `d` al lugar de `c` deja `{0, a} {1, d} {2, b} {3, c}`, por lo que el
  cliente envía `{1, d} {2, b} {3, c}`.
- Cada `workId` debe pertenecer a la lista; una obra ajena se rechaza con 404 y la operación no deja un orden
  parcial (transaccional).
- La actualización se hace en **dos fases** dentro de una transacción: primero las filas afectadas se mueven a
  un offset temporal negativo y después a su posición final. Así se respeta el índice único
  `(WorkListId, Position)` mientras las obras intercambian lugares y el orden nunca queda aplicado a medias.
- Las posiciones son 0-based y pueden tener huecos: la posición solo determina el orden, y las obras que no
  forman parte de la solicitud conservan la suya.

**Qué se cambió**:
- `api/Application/Services/PersonalListService.cs`: `ReorderWorksAsync`.
- `api/Application/Interfaces/IPersonalListService.cs` y `api/Application/DTOs/PersonalListDtos.cs`
  (`ReorderPersonalListWorksRequest`, `PersonalListWorkPositionRequest`).
- `api/Api/Controllers/MyListsController.cs`: `PUT {listId}/works/order`.
- `project/endpoints/endpoints-personal-lists.md` (nuevo), `project/domain/domain-catalog.md`.

**Decisiones relevantes**:
- El modelo de la proyecto ya define las posiciones en base 0 (`WorkListService.MinimumPosition = 0` y las
  listas del sistema se guardan con las posiciones que envía el cliente), por lo que no se introduce una
  convención nueva.
- Se validan únicamente dos cosas, que son las que protectan la integridad: que la obra pertenezca a la lista y
  que no se repitan posiciones (ni se pise una posición que sigue ocupada por una obra que no viene en la
  solicitud). Ambas devuelven 404/409 en lugar de un error de base de datos. El resto de las validaciones
  (conjunto completo, orden contiguo) se descartan a pedido explícito: la posición solo ordena.
- No se modifica el orden de otras listas ni ningún dato de las obras.

**Notas**:
- Commit: `8f989cd`. Branch: `feature/us-0036-api`.
- Tests: `ReorderWorks_PersistsTheNewOrderOfTheAffectedWorks` (replica el ejemplo del criterio: `{0, a} {1, b}
  {2, c} {3, d}` → `{0, a} {1, d} {2, b} {3, c}`) y `ReorderWorks_RejectsAWorkThatDoesNotBelongToTheList`.