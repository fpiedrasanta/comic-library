# TASK-API-0311 — Crear los tests de la US-0035

## Objetivo

Crear y ejecutar los tests automatizados necesarios para verificar el comportamiento de la US-0035 — Lectura secuencial de listas de Works.

Los tests deben comprobar las reglas de negocio y los contratos de los endpoints implementados en las tasks `TASK-API-0307` a `TASK-API-0310`.

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
- Las implementaciones realizadas en `TASK-API-0307`, `TASK-API-0308`, `TASK-API-0309` y `TASK-API-0310`.
- Los proyectos, convenciones, fixtures y utilidades de testing existentes.

## Alcance

### 1. Estrategia de tests

- Reutilizar los proyectos y convenciones de testing existentes.
- Priorizar tests unitarios para las reglas de servicio y tests de integración para los contratos HTTP y la persistencia cuando la infraestructura existente lo permita.
- Evitar crear infraestructura de testing duplicada.
- No cambiar la lógica de producción únicamente para facilitar tests.
- Si se detectan defectos en la implementación, documentarlos y corregirlos cuando corresponda a la US-0035.

### 2. Casos que deben verificarse

#### Consulta de lista

- La respuesta incluye `currentWorkId`.
- Se respeta un Work actual válido.
- Se utiliza el primer Work por `Position` cuando no existe progreso o el Work actual no es válido.
- Una lista vacía devuelve `currentWorkId: null`.
- La resolución de fallback no persiste cambios automáticamente.

#### Contexto del lector

- El endpoint devuelve la información requerida de la lista y sus Works.
- Los Works se ordenan por `WorkListItem.Position`.
- Se devuelve el progreso correspondiente al usuario autenticado.
- El progreso de páginas es compartido entre los distintos contextos de lectura del mismo Work.
- Se devuelven las valoraciones correspondientes al usuario.
- Se valida que el Work solicitado pertenece a la lista.
- Se contemplan listas vacías y ausencia de progreso.

#### Actualización del Work actual

- Se actualizan `CurrentWork` y `LastReadAt`.
- Se rechaza un Work que no pertenece a la lista.
- No se modifica el progreso de páginas del Work.
- No se modifica artificialmente el porcentaje de progreso de la lista.

#### Valoración de listas

- Se puede crear una valoración.
- Se puede actualizar una valoración existente.
- Se rechazan valores de estrellas fuera del rango de 1 a 5.
- Se admite una review opcional.
- Los agregados `AverageRating` y `RatingCount` se mantienen correctos.
- Editar una valoración no incrementa indebidamente el contador.
- Se verifican los errores y las respuestas de los endpoints según las convenciones del proyecto.

### 3. Documentación

- Actualizar `repositories.md`, `services.md` y `endpoints.md` si los tests o la revisión del código detectan diferencias entre la implementación y la documentación.
- No documentar comportamientos que no estén implementados.
- Registrar los cambios relevantes en los documentos específicos de repositorios, servicios o endpoints cuando corresponda.

## Restricciones

- No modificar el dominio.
- No duplicar la infraestructura de testing.
- No omitir un caso porque actualmente falle: registrar el defecto y resolverlo si corresponde al alcance.
- No declarar una validación exitosa si el test no se ejecutó.
- No cambiar el alcance de la US-0035.

## Criterios de aceptación

- Existen tests para las reglas y escenarios principales de la US-0035.
- Los tests cubren casos válidos, inválidos y límites relevantes.
- Se ejecutaron las suites de tests disponibles y se documentaron sus resultados.
- Los defectos detectados se corrigieron o quedaron documentados como bloqueos reales.
- La documentación refleja la implementación final.
- Los cambios están committeados y publicados en la rama de trabajo.

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