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