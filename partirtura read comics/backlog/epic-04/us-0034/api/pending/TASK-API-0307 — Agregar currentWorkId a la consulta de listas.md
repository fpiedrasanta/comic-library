# TASK-API-0307 — Agregar currentWorkId a la consulta de listas

## Objetivo

Modificar el endpoint existente `GET /api/catalog/lists/{id}` para incluir `currentWorkId`, permitiendo que el Public Web identifique el Work desde el cual el usuario debe continuar la lectura de una lista.

El dominio ya está implementado. No crear entidades ni modificar el modelo de dominio para resolver esta task.

## Contexto obligatorio

Leer y revisar:

- `project/backend-agent.md`
- `project/project.md`
- `backend-architecture.md`
- `backend-coding-rules.md`
- `backend-stack-technology.md`
- `domain.md`
- `repositories.md`
- `services.md`
- `endpoints.md`
- `us-0035.md`
- `communication.md`
- Las implementaciones existentes de consulta de listas y progreso de lectura.

## Alcance

### 1. Repositorios

- Revisar los repositorios existentes para consultar el progreso de lectura de una lista por usuario.
- Reutilizar los repositorios existentes siempre que sea posible.
- Crear o ampliar los métodos necesarios únicamente si no existe una operación equivalente.
- Consultar el Work actual asociado a `ListReadingProgress` para el usuario autenticado.
- Actualizar `repositories.md` si cambia el contrato o se agrega un método público relevante.

### 2. Servicios

- Revisar el servicio que implementa `GET /api/catalog/lists/{id}`.
- Incluir `currentWorkId` en la respuesta.
- Resolver el Work actual según las reglas de US-0035:
  - Si `ListReadingProgress.CurrentWork` pertenece a la lista, utilizarlo.
  - Si el progreso no existe, el Work actual es nulo, no pertenece a la lista o no puede resolverse, utilizar el primer Work de la lista según `WorkListItem.Position`.
  - Si la lista no tiene Works, devolver `currentWorkId: null`.
- Resolver el fallback no debe persistir automáticamente un nuevo `CurrentWork`.
- Mantener intactos los demás datos y comportamientos del endpoint.
- Actualizar `services.md` si corresponde.

### 3. Endpoints

- Modificar el endpoint existente, sin crear otro endpoint equivalente.
- Agregar `currentWorkId` al contrato de respuesta.
- Mantener la autenticación y las reglas de acceso existentes.
- Actualizar `endpoints.md` y la documentación específica relacionada, si corresponde.

## Restricciones

- No modificar el dominio.
- No crear una implementación duplicada de consulta de listas.
- No modificar el progreso de páginas de un Work.
- No cambiar la composición ni el orden de las listas.
- No persistir el fallback de `CurrentWork`.
- No introducir cambios incompatibles en la respuesta existente.

## Criterios de aceptación

- La respuesta incluye `currentWorkId`.
- Se respeta el Work actual válido del usuario.
- Se aplica correctamente el fallback al primer Work por `Position`.
- Una lista vacía devuelve `currentWorkId: null`.
- El fallback no modifica datos persistidos.
- Se reutilizan las capas y convenciones existentes.
- La documentación modificada queda actualizada.
- La implementación compila y las validaciones disponibles pasan.

## Git y ejecución

1. `git checkout main` → `git pull`
2. `git branch --list "feature/us-0035-api-sequential-list-reading"`

   Si existe: `git switch feature/us-0035-api-sequential-list-reading` → `git merge main`.

   Si no existe: `git switch -c feature/us-0035-api-sequential-list-reading`.

3. Implementar los cambios de esta task.
4. Revisar los cambios con `git diff`.
5. Ejecutar las validaciones disponibles para comprobar que el dominio compila y que no se introdujeron regresiones detectables en esta etapa.
6. Crear uno o más commits y realizar el push de los cambios a la rama de trabajo.
7. Incorporar el resultado de ejecución en esta misma task mediante **append**, sin sobrescribir su contenido previo.
8. Mover el archivo según `communication.md` a `finished` si se cumplen los criterios, o a `blocked` si existe un bloqueo real, documentando la causa y el trabajo pendiente.