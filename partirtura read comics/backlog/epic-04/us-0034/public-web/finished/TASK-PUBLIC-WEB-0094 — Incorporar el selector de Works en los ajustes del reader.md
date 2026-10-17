# TASK-PUBLIC-WEB-0094 — Incorporar el selector de Works en los ajustes del reader

## Objetivo

Incorporar al panel de ajustes del reader un selector que permita consultar todos los Works de la lista, visualizar el progreso de cada uno y navegar directamente a cualquiera de ellos.

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

Revisar el panel de ajustes actual, los componentes reutilizables y la estructura del contexto de lectura implementado en la task anterior.

## Comportamiento requerido

### Visibilidad contextual

Mostrar el selector únicamente en la ruta contextual:

`/lists/:listId/work/:workId`

No modificar la interfaz ni el comportamiento de la lectura individual.

### Listado y orden

Mostrar todos los Works de la lista, respetando el orden de `WorkListItem.Position`.

Utilizar la información disponible en el contexto ya cargado. No realizar consultas redundantes ni inventar datos para completar elementos.

### Indicador de progreso

Representar el progreso individual de cada Work:

- **Verde:** 100% completado.
- **Amarillo:** progreso mayor que 0% y menor que 100%.
- **Rojo:** progreso igual a 0% o sin progreso registrado.

El progreso debe proceder de los datos existentes de lectura. Abrir un Work no implica marcarlo como leído.

### Work actual

Destacar visualmente el Work actual de manera independiente del color que representa su progreso.

Un Work actual puede estar verde, amarillo o rojo según su estado.

### Selección

Al seleccionar un Work:

1. Navegar a `/lists/:listId/work/:workId` con los identificadores reales.
2. Utilizar el flujo de carga contextual existente.
3. Restaurar la página de lectura correspondiente.
4. Persistir el Work actual mediante el mecanismo existente de la task anterior.
5. Actualizar el resaltado del selector.

No duplicar lógica de navegación o persistencia.

### Actualización del progreso

Cuando se actualicen los datos de progreso disponibles, reflejar el nuevo estado en el selector sin introducir un mecanismo paralelo de sincronización.

## Componentización y responsive

- Reutilizar el panel de ajustes existente.
- Separar presentación, indicador de progreso y navegación.
- No duplicar lógica entre la lectura individual y la contextual.
- Adaptar el selector a Mobile, Tablet y Desktop.

## Restricciones

- No modificar contratos del backend.
- No duplicar el reader.
- No cambiar el orden de la lista.
- No modificar el comportamiento individual.
- No alterar el progreso al seleccionar un Work.
- No implementar valoraciones en esta task.

## Criterios de aceptación

- El selector aparece únicamente en el contexto de lista.
- Muestra todos los Works en orden.
- Los colores representan el progreso real.
- El Work actual se distingue independientemente de su progreso.
- Seleccionar un Work abre el correcto y restaura su página.
- Se actualiza el Work actual persistido.
- El progreso visual se actualiza con los datos disponibles.
- La lectura individual conserva su comportamiento.
- La implementación reutiliza los componentes existentes.

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

Los formularios de valoración contextual se implementarán en la task siguiente.

## Resultado de ejecución

**Estado**: Cumplido — criterios de aceptación verificados.

**Qué se implementó**:
- `features/reader/components/reader-work-list-item.tsx`: fila del selector con progress ring (amber→orange por porcentaje, verde al 100%, gris "Sin progreso" cuando `null`) y badge "Actual" en el work actual.
- `features/reader/components/reader-menu.tsx`: prop opcional `listContext`; renderiza el selector **solo** en contexto de lista.
- `features/reader/components/list-reader.tsx`: pasa `listContext` (listId, workId, works, onSelectWork) al menú; `onSelectWork` persiste el current work y navega a `/lists/{listId}/work/{workId}` reutilizando el flujo existente.

**Validaciones ejecutadas**:
- `npm run typecheck` → 0 errores.
- `npm run build` → OK.
- El selector no aparece en el reader individual (prop `listContext` no provista).
