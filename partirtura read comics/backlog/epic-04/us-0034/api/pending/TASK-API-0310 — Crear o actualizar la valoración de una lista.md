# TASK-API-0310 — Crear o actualizar la valoración de una lista

## Objetivo

Implementar el endpoint para que el usuario autenticado pueda crear o actualizar su valoración de una lista de lectura utilizando la entidad `ListRating` existente.

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
- La entidad `ListRating`.
- El flujo existente de valoración de Works, incluidos sus repositorios, servicios, endpoints y reglas para actualizar agregados.

## Alcance

### 1. Repositorios

- Revisar los repositorios existentes para `ListRating` y `WorkList`.
- Reutilizar las operaciones existentes para consultar una valoración por usuario y lista.
- Permitir crear o recuperar la valoración que se actualizará.
- Utilizar las operaciones existentes para persistir los cambios y actualizar los agregados.
- Crear métodos nuevos únicamente cuando sean necesarios.
- Actualizar `repositories.md` si corresponde.

### 2. Servicios

Implementar el servicio de creación o actualización de la valoración.

Reglas:

- Cada usuario puede tener una única valoración activa por lista, de acuerdo con las convenciones del proyecto.
- `Stars` debe respetar el rango de 1 a 5.
- `Review` es opcional.
- Registrar `CreatedAt` al crear una valoración.
- Actualizar `UpdatedAt` al modificar una valoración existente.
- Respetar el comportamiento de `IsActive` definido en el proyecto.
- Calcular o actualizar `AverageRating` y `RatingCount` correctamente.
- Al editar una valoración existente, no incrementar `RatingCount` como si fuera una nueva.
- Si una valoración existente se reemplaza, considerar su valor anterior al actualizar el promedio.
- Reutilizar las reglas de negocio del flujo de valoración de Works, sin duplicar innecesariamente su implementación.
- Mantener la consistencia de los datos ante errores de persistencia.

Actualizar `services.md` y la documentación específica del servicio, si corresponde.

### 3. Endpoints

Crear el endpoint de valoración de listas siguiendo las convenciones de rutas, verbos HTTP, validación y respuestas utilizadas por el endpoint existente de valoración de Works.

- No inventar un patrón alternativo si ya existe uno establecido.
- Aplicar autenticación y autorización existentes.
- Validar el identificador de la lista y los datos recibidos.
- Devolver los errores mediante el mecanismo estándar del proyecto.
- Actualizar `endpoints.md` y la documentación específica del endpoint, si corresponde.

## Restricciones

- No crear otra entidad para las valoraciones de listas.
- No modificar el dominio.
- No alterar el flujo existente de valoración de Works.
- No contar dos veces una valoración cuando se edita.
- No permitir estrellas fuera del rango de 1 a 5.
- No actualizar agregados de forma que produzcan resultados inconsistentes.

## Criterios de aceptación

- El usuario puede crear su valoración de una lista.
- El usuario puede actualizar su valoración existente.
- Se validan estrellas y review.
- `CreatedAt` y `UpdatedAt` se gestionan correctamente.
- `AverageRating` y `RatingCount` quedan consistentes.
- La edición no incrementa indebidamente el contador.
- Se reutilizan las convenciones del proyecto.
- La documentación queda actualizada y la implementación compila.

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