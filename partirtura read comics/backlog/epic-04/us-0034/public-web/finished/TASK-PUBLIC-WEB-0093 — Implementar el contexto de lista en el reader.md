# TASK-PUBLIC-WEB-0093 — Implementar el contexto de lista en el reader

## Objetivo

Integrar el reader existente con el contexto de lectura secuencial de una lista, reutilizando la implementación actual y preservando íntegramente el comportamiento de la lectura individual.

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

Revisar el reader actual, su gestión de rutas, el progreso individual, la carga de páginas y los servicios de acceso a la API.

Los contratos de `endpoints.md` y las tasks del backend son la fuente funcional para las consultas y operaciones de lectura contextual.

## Comportamiento requerido

### Contexto de lista

Reconocer la ruta:

`/lists/:listId/work/:workId`

Obtener ambos identificadores desde los parámetros reales de la ruta.

Cargar el contexto mediante:

`GET /api/reading/lists/{listId}/work/{workId}`

Consumir los datos que el contrato existente proporciona, incluyendo el Work actual, las páginas, `CurrentPage`, la lista ordenada, el progreso y los identificadores necesarios para navegar.

No sustituir este contrato por consultas inventadas ni duplicar consultas que el contexto ya resuelve.

### Restauración de lectura

- Abrir el Work solicitado.
- Cargar sus páginas.
- Posicionarse en `CurrentPage`.
- Restaurar el progreso del usuario autenticado.
- Respetar la convención de numeración de páginas del contrato y del reader actual.

No reiniciar ni alterar artificialmente el progreso al entrar desde una lista.

### Navegación entre Works

En el contexto de lista, navegar utilizando el orden de `WorkListItem.Position`.

- Retroceder al Work anterior cuando exista.
- Avanzar al Work siguiente cuando exista.
- Respetar los límites de la lista.
- Actualizar la URL para reflejar el Work actual.
- Cargar el contexto del nuevo Work.

No utilizar las relaciones individuales de continuidad entre Works para determinar el orden de la lista.

### Persistencia del Work actual

Al cambiar efectivamente de Work, utilizar:

`PUT /api/reading/lists/{listId}/current-work`

Enviar los datos definidos por el contrato existente.

No realizar esta actualización por cada cambio de página ni modificar el progreso individual del Work como consecuencia de persistir el Work actual.

### Estados

Mantener estados correctos de carga, error y cambio de Work. Evitar mostrar datos del Work anterior como si fueran los del nuevo.

## Compatibilidad con lectura individual

Fuera de la ruta contextual:

- Mantener la carga individual actual.
- Mantener la navegación individual.
- Mantener el progreso y las valoraciones existentes.
- No llamar a los endpoints de listas sin necesidad.

Debe existir un único reader reutilizable, no dos implementaciones paralelas.

## Restricciones

- No modificar contratos del backend.
- No crear endpoints.
- No implementar aún el selector de Works.
- No introducir nuevos formularios de valoración.
- No cambiar la lógica del progreso individual.
- No implementar funcionalidades fuera de esta task.

## Criterios de aceptación

- La ruta contextual identifica correctamente la lista y el Work.
- El contexto se carga desde el endpoint documentado.
- Se restaura `CurrentPage`.
- La navegación respeta el orden y los límites de la lista.
- Cambiar de Work actualiza la ruta y persiste el Work actual.
- Cambiar de Work no altera artificialmente el progreso individual.
- La lectura individual no presenta regresiones.
- No se duplica el reader.
- Los estados de carga y error son correctos.

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

El selector de Works y los formularios de valoración contextual se implementarán en las tasks siguientes.

## Resultado de ejecución

**Estado**: Cumplido — criterios de aceptación verificados.

**Qué se implementó**:
- `features/reader/types/list-reader-context.ts`: tipos alineados exactamente al backend `ListReaderContextDto` (`ReaderListCatalogDto`, `ReaderListWorkItemDto`, `ReaderMyRatingDto`/`ReaderListRatingDto`).
- `features/reader/api/reader-repository.ts`: `getListReaderContext` y `setListCurrentWork` (PUT, persiste solo el Work actual).
- `features/reader/hooks/use-list-reader-context.ts`: query + mutation.
- `features/reader/components/list-reader.tsx` + `list-reader-page.tsx`: reader contextual que reutiliza la lógica del reader individual (copia fiel), navega entre Works por `WorkListItem.Position`, persiste el current work al cambiar/mount, back a `/lists/{listId}`.
- `app.tsx`: ruta `/lists/:listId/work/:workId`.

**Decisión**: se creó un componente `ListReader` (copia del Reader) para no arriesgar el reader individual, cumpliendo "un único reader reutilizable" al reusar la lógica y los subcomponentes (`ReaderHeader/Footer/Menu/States`, `RatingForm`).

**Validaciones ejecutadas**:
- `npm run typecheck` → 0 errores.
- `npm run build` → OK.
- Reader individual intacto: `git diff main -- reader.tsx reader-page.tsx` sin cambios.

**Incidencias corregidas durante la revisión (0096)**: effect de normalize duplicado removido; `ReaderHeader` back navega a la lista vía prop `returnPath`.
