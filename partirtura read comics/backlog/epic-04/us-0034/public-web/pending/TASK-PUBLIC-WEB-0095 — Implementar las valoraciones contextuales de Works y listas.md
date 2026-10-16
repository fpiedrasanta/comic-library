# TASK-PUBLIC-WEB-0095 — Implementar las valoraciones contextuales de Works y listas

## Objetivo

Integrar las valoraciones de Works y listas con el reader contextual, permitiendo valorar un Work al finalizar su lectura y valorar la lista al terminar el último Work.

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

Revisar los formularios de valoración actuales, los contratos de la API, los servicios y la integración del reader contextual.

No inventar endpoints, payloads, límites de campos ni reglas de persistencia.

## Valoración de un Work

Al llegar al final de las páginas de un Work en una lista, permitir valorar el Work mediante el flujo existente.

- Puntuación de 1 a 5 estrellas.
- Comentario opcional cuando esté admitido por el contrato.
- Recuperación de la valoración existente.
- Edición y guardado mediante los mecanismos existentes.

La valoración debe corresponder al Work actual, no a la lista.

## Continuación al siguiente Work

Si existen más Works, permitir continuar al siguiente según `WorkListItem.Position`.

La acción debe conservar el contexto de lista, actualizar la ruta y cargar el nuevo Work con su progreso.

No usar relaciones individuales de continuidad para determinar el siguiente elemento.

La valoración del Work no debe marcarlo automáticamente como completado.

## Valoración de la lista

Al finalizar el último Work, presentar el formulario de valoración de la lista con el mensaje:

> Valora esta lista, que fue hecha con mucho amor por {userName} para vos.

Reemplazar `{userName}` por el nombre disponible del creador. Si el nombre no está disponible, no mostrar el placeholder ni inventar un nombre; utilizar un tratamiento alternativo coherente con los patrones existentes.

El formulario debe permitir:

- Puntuación de 1 a 5 estrellas.
- Reseña opcional.
- Guardado de la valoración.

Utilizar el contrato existente para crear o actualizar `ListRating`.

Si ya existe una valoración del usuario, recuperarla y permitir su edición. No generar una nueva valoración ni duplicar contadores al editar.

## Integración con el reader

- Reutilizar los formularios y componentes existentes.
- Mostrar la valoración de lista solamente al terminar el último Work.
- Mantener la valoración de Work asociada al Work correcto.
- Conservar el origen contextual al regresar.
- Preservar el flujo de valoración individual existente.

## Estados y errores

Manejar carga, guardado, éxito, errores de validación y errores de comunicación mediante los mecanismos existentes.

Evitar envíos duplicados mientras una operación está en curso. No mostrar un guardado como exitoso antes de recibir la confirmación de la API.

## Restricciones

- No modificar contratos del backend.
- No crear endpoints.
- No duplicar formularios ni lógica de valoración.
- No alterar la lectura individual.
- No cambiar el progreso de lectura como consecuencia de valorar.
- No mostrar la valoración de lista al finalizar un Work intermedio.

## Criterios de aceptación

- Se puede valorar y editar la valoración del Work actual.
- Se puede continuar al siguiente Work respetando el orden de la lista.
- La valoración de la lista aparece al finalizar el último Work.
- Se utiliza el nombre real del creador cuando está disponible.
- La valoración de lista permite puntuación y reseña opcional.
- Las valoraciones existentes se recuperan y editan sin duplicación.
- Los estados de carga, guardado y error son correctos.
- El reader individual conserva su comportamiento anterior.
- Se reutilizan los componentes existentes.

## Git y ejecución

1. `git checkout main` → `git pull`.
2. Comprobar la rama:
   `git branch --list "feature/us-0035-public-web-sequential-list-reading"`

   Si existe: cambiar a ella y ejecutar `git merge main`.

   Si no existe: crearla desde `main`.

3. Implementar los cambios de esta task.
4. Revisar `git diff`.
5. Ejecutar las validaciones disponibles y comprobar compilación y regresiones detectables.
6. Crear commits y publicar los cambios en la rama de trabajo.
7. Registrar el resultado en esta misma task mediante **append**, sin sobrescribir el contenido previo.
8. Mover el archivo a `finished` o `blocked` conforme a `communication.md`, documentando resultados y pendientes.

## Fuera de alcance

No incorporar funcionalidades ajenas a la lectura secuencial y las valoraciones contempladas en los contratos existentes.
