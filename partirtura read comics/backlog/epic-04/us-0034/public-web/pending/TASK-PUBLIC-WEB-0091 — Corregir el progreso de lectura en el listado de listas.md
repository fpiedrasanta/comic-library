# TASK-PUBLIC-WEB-0091 — Corregir el progreso de lectura en el listado de listas

## Objetivo

Corregir el indicador de progreso de lectura en `/lists`, reutilizando el comportamiento visual y los componentes existentes en `WorkCard` siempre que resulte compatible con la arquitectura actual.

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

Consultar también la implementación actual de `WorkCard`, la página `/lists`, sus componentes y los contratos de datos utilizados.

Las tasks del Backend/API y `endpoints.md` definen los contratos funcionales que debe consumir el frontend. No inventar endpoints, propiedades ni reglas de cálculo.

## Comportamiento requerido

El indicador debe aparecer en la parte inferior de la portada de cada lista, siguiendo el criterio visual utilizado por `WorkCard`.

Estados:

- **Completado:** mostrar `Leído`.
- **Parcialmente leído:** mostrar el porcentaje de lectura.
- **Sin progreso:** no mostrar indicador.

Utilizar los datos existentes de progreso de la lista. No confundir el progreso global de una lista con el progreso individual de uno de sus Works.

Si el frontend ya dispone de un componente o mecanismo reutilizable para representar este indicador, utilizarlo en lugar de duplicar su implementación.

## Componentización y responsive

- Mantener la estructura existente de la página.
- Reutilizar componentes y estilos.
- No duplicar la lógica de presentación del progreso.
- Preservar la jerarquía visual en Mobile, Tablet y Desktop.
- Respetar los estados de carga, error y ausencia de datos.

## Restricciones

- No modificar contratos ni endpoints del backend.
- No modificar el detalle de las listas.
- No modificar el reader.
- No implementar navegación contextual nueva.
- No inventar porcentajes ni valores por defecto.
- No implementar funcionalidades fuera del alcance de esta task.

## Criterios de aceptación

- El indicador aparece en la parte inferior de la portada.
- El estado completado muestra `Leído`.
- El estado parcial muestra el porcentaje correcto.
- La ausencia de progreso no muestra un indicador ficticio.
- Se reutiliza la implementación visual existente cuando corresponde.
- La página continúa funcionando en los tres tamaños de pantalla.
- No se introducen regresiones en el resto del listado.

## Git y ejecución

1. `git checkout main` → `git pull`.
2. Comprobar la rama de trabajo:
   `git branch --list "feature/us-0035-public-web-sequential-list-reading"`

   Si existe: cambiar a ella y ejecutar `git merge main`.

   Si no existe: crearla desde `main` con `git switch -c feature/us-0035-public-web-sequential-list-reading`.

3. Implementar los cambios de esta task.
4. Revisar los cambios mediante `git diff`.
5. Ejecutar las validaciones disponibles para comprobar que el frontend compila y que no se introdujeron regresiones detectables en esta etapa.
6. Crear uno o más commits y publicar los cambios mediante `git push -u origin feature/us-0035-public-web-sequential-list-reading` o `git push`, según corresponda.
7. Incorporar el resultado de ejecución en esta misma task mediante **append**, sin sobrescribir su contenido previo.
8. Mover el archivo según `communication.md` a `finished` si se cumplen los criterios, o a `blocked` si existe un bloqueo real, documentando la causa y el trabajo pendiente.

No marcar la task como finalizada si las validaciones obligatorias fallan o si existe un bloqueo que impide cumplir los criterios.

## Fuera de alcance

El detalle de las listas, la navegación contextual del reader, el selector de Works y las valoraciones se implementarán en tasks posteriores.
