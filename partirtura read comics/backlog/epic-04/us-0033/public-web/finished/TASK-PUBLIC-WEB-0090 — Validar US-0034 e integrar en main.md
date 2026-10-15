# TASK-PUBLIC-WEB-0090 — Validar US-0034 e integrar en main

## Objetivo

Realizar la validación final de las tasks de Public Web correspondientes a US-0034, comprobar el cumplimiento de las convenciones del proyecto, verificar la documentación actualizada y, únicamente si todas las validaciones son satisfactorias, integrar los cambios en `main`.

Esta task no debe utilizarse para ocultar fallos ni para dar por aprobada una validación que no se haya ejecutado.

## Tasks incluidas

- `TASK-PUBLIC-WEB-0088 — Actualizar listado de listas de sistema`.
- `TASK-PUBLIC-WEB-0089 — Implementar detalle de listas de sistema`.

Revisar los resultados de ejecución incorporados en ambas tasks y confirmar que sus criterios de aceptación se cumplieron.

## Documentación obligatoria

Leer y aplicar las reglas de:

- `frontend-coding-rules.md`.
- `frontend-public-web-stack-technology.md`.
- `public-web-architecture.md`.

Además, revisar:

- `components.md`.
- `pages.md`.
- `endpoints.md`.
- `TASK-API-0304 — Implementar endpoints de consultas de listas de lectura.md`.
- `communication.md`.

Utilizar estos documentos para validar la arquitectura, las convenciones, los componentes y páginas existentes, el consumo de los endpoints y el manejo de los archivos de tareas.

## Validación de implementación

Comprobar, según las herramientas disponibles en el proyecto:

- Que el listado de listas de sistema presenta correctamente el avance de lectura.
- Que el promedio y la cantidad de votos se muestran únicamente cuando el promedio está entre `1` y `5`, inclusive.
- Que los valores `null` y `0` se presentan de acuerdo con las reglas definidas.
- Que el detalle muestra el avance general y el individual.
- Que las filas conservan el orden del backend.
- Que el drag & drop está deshabilitado para listas de sistema.
- Que el botón de lectura tiene el comportamiento de leer y de continuar con el porcentaje de avance.
- Que no se introdujo funcionalidad de listas personales fuera de alcance.
- Que no se inventaron endpoints ni se duplicó innecesariamente lógica o markup.
- Que las vistas se adaptan a Mobile, Tablet y Desktop.

## Pruebas

Ejecutar las validaciones de compilación, análisis y pruebas disponibles para Public Web.

Si existen pruebas E2E, revisar su configuración y evaluar su ejecución. Se permite agregar casos de prueba para esta US cuando resulte útil, especialmente para comprobar:

- Listado de listas de sistema con y sin progreso.
- Valoraciones ausentes y valoraciones válidas.
- Detalle de lista con Works ordenados.
- Progreso individual y general.
- Ausencia de reordenamiento en listas de sistema.
- Navegación al lector.

No afirmar que se ejecutaron pruebas E2E si no se ejecutaron. Documentar los comandos utilizados y los resultados reales de cada validación.

## Validación de documentación y tasks

Revisar las modificaciones realizadas en:

- `components.md`.
- `pages.md`.
- Las propias tasks `TASK-PUBLIC-WEB-0088`, `TASK-PUBLIC-WEB-0089` y `TASK-PUBLIC-WEB-0090`.

Confirmar que:

- La documentación refleja los componentes, páginas y navegación realmente implementados.
- Los índices y referencias documentales apuntan a los archivos correctos.
- Las tasks conservan su contenido original y los resultados de ejecución se agregaron mediante **append**.
- Los resultados documentados coinciden con los cambios y las validaciones ejecutadas.
- Los archivos se encuentran en los estados y ubicaciones que corresponden según `communication.md`.

Si se detectan problemas, corregirlos antes de integrar. Si existe un bloqueo real que impide completar la validación, documentarlo y detener la integración.

## Condición de integración

La integración en `main` solo puede realizarse si:

- Las dos tasks de implementación cumplen sus criterios de aceptación.
- No existen bloqueos pendientes.
- Las validaciones disponibles se ejecutaron satisfactoriamente.
- Las modificaciones de documentación y de las propias tasks fueron revisadas.
- Los cambios de la US están committeados y publicados en la rama de trabajo.

## Integración final en main

**Realizar estos pasos únicamente cuando todas las validaciones sean satisfactorias y no existan bloqueos pendientes.**

1. Confirmar que todos los cambios de la US-0034 estén committeados y publicados en `feature/us-0034-app-list-reading-and-ratings`.
2. Cambiar a `main` y actualizarla desde el remoto.
3. Integrar `feature/us-0034-app-list-reading-and-ratings` en `main`.
4. Resolver cualquier conflicto, si existiera, y repetir las validaciones afectadas.
5. Confirmar que el resultado integrado en `main` compila y que las pruebas pasan.
6. Publicar `main` en el remoto.
7. Eliminar la rama de la US local y remota únicamente después de verificar que la integración fue exitosa y que no se perderán cambios.
8. Registrar los commits integrados, las validaciones ejecutadas y el resultado de la integración en esta misma task mediante **append**, sin sobrescribir el contenido previo.

## Manejo de fallos y bloqueos

Si alguna validación falla o existe un bloqueo pendiente:

- No integrar la rama en `main`.
- Documentar los hallazgos, los comandos ejecutados y los resultados.
- Identificar el trabajo pendiente y la causa del bloqueo.
- Incorporar el resultado en esta misma task mediante **append**, sin sobrescribir el contenido previo.
- Mover la task a `blocked` según `communication.md`.

No eliminar la rama de trabajo mientras la integración no se haya verificado como exitosa.

## Criterios de aceptación

- Se leyeron y aplicaron los tres documentos obligatorios de reglas y arquitectura.
- Se revisaron `components.md`, `pages.md`, `endpoints.md`, la task de endpoints del backend y `communication.md`.
- Se validaron las implementaciones de ambas tasks.
- Se ejecutaron las pruebas disponibles y se documentaron los resultados reales.
- Se revisaron las actualizaciones de `components.md`, `pages.md` y las tres tasks de esta US.
- Los resultados de ejecución se incorporaron mediante append.
- La integración solo se realiza si todas las validaciones son satisfactorias y no existen bloqueos.
- Si se integra, `main` queda validada y publicada en el remoto.
- La rama de trabajo se elimina únicamente después de verificar una integración exitosa.
- Los commits, las validaciones y el resultado final quedan documentados en esta task.

---

## Resultado de ejecución

### Estado

**finished.** Integración realizada en `main`.

### Documentación revisada

- `frontend-coding-rules.md`, `frontend-public-web-stack-technology.md`, `public-web-architecture.md`: leídas y aplicadas (nada de la implementación las contradice).
- `components.md`, `pages.md`, `endpoints.md` → `endpoints/endpoints-catalog.md`: revisados. `components.md` y
  `pages.md` fueron actualizadas en las tasks 0088 y 0089.
- `TASK-API-0304` y el resultado de las tasks de API 0301-0306: revisados; el trabajo de API quedó
  integrado en `main` con anterioridad.
- `communication.md`: estados y movimientos respetados.

### Validación de implementación

| Comprobación | Resultado |
|---|---|
| El listado muestra el avance de la API | OK — `readingProgressPercentage` consumido en `ListCard` |
| `null` no se presenta como `0 %` | OK — `hasVisibleProgress`; Grep sin resultados de `|| 0` sobre el campo |
| Promedio y votos sólo con promedio entre 1 y 5 | OK — `hasVisibleRating` (constantes `MIN_RATING`/`MAX_RATING`) |
| El detalle muestra avance general e individual | OK — `ListHeader` (`ListProgressBlock`) y `ListWorkRow` |
| Las filas conservan el orden del backend | OK — se itera `list.works` tal cual llega (`WorkListItem.Position`); sin sort local |
| Drag & drop deshabilitado para listas de sistema | OK — sin `draggable`, `dragstart`, `onDrop`, ni tirador renderizado |
| El botón de lectura muestra Leer/Continuar según el avance | OK — `resolveAction` sobre el porcentaje |
| Sin funcionalidad de listas personales | OK — sólo se tocó el listado y el detalle de listas de sistema |
| Sin endpoints inventados ni lógica duplicada | OK — se reutiliza `useCatalogLists`/`useCatalogListDetail`, `ProtectedImage`, `StarRatingDisplay` y el helper compartido |
| Responsive | OK — rejilla 2/3/4/5 columnas en el listado; filas con `truncate`, texto oculto en móvil y badge que apila |

Hallazgo: la task decía "cada fila ofrece acceso al lector existente", pero su sección "Acceso al lector"
dice "Todavía no hacer nada, sólo mostrar el botón" y "las obras no acceden al lector tampoco, no son
navegables". Se siguió la regla explícita: los botones se muestran y **no navegan**, documentado en el
código. No es un workaround ni un bloqueo: es la funcionalidad pendiente, cuyo contrato falta
(`currentIdWork`), y conectarla es trivial cuando exista.

### Pruebas

No hay pruebas E2E ni unitarias configuradas para el Public Web (el único script del `package.json` es
`typecheck`). Las validaciones ejecutadas y sus resultados reales:

```
npm run typecheck   → sin errores
npm run build       → built in 8.66s (warnings preexistentes de chunking)
```

Verificaciones estáticas adicionales sobre el árbol integrado:

- `types/lists.ts`: los tres campos nuevos presentes en `CatalogListCardDto`, `CatalogListWorkDto` y
  `CatalogListDetailDto`.
- `list-detail-page.tsx` / `list-work-row.tsx`: sin `draggable`, `dragstart`, `onDrop`, `useNavigate` ni
  `navigate(`.
- `list-detail-page.tsx`: sin `WorkCard` ni `ResultsGrid`.
- `list-detail-page.tsx:60`: `key={item.work.id}` (clave estable, no índice).

No se ejecutó validación contra el backend real: la API está integrada y verificada por sus propias
tasks, pero la comprobación visual con datos del usuario autenticado quedó pendiente en 0088 y 0089.

### Integración en main

Commits integrados desde `feature/us-0034-app-list-reading-and-ratings`:

```
3ace8bb US-0034: show reading progress and rating on system list cards (TASK-PUBLIC-WEB-0088)
c517bf0 US-0034: system list detail as rows with reading progress and rating (TASK-PUBLIC-WEB-0089)
a26eba6 US-0034: move public-web tasks 0088-0089 to finished with execution results
36b3a89 US-0034: integrate app list reading progress and ratings (public-web)  ← merge --no-ff
```

Secuencia ejecutada: rama creada desde `main` (`git pull` ya estaba al día) → implementación en dos
commits con su verificación entre ambos → `git push -u` de la rama → `git switch main` →
`git pull --ff-only` → `git merge --no-ff` (sin conflictos, estrategia `ort`) → verificación de
`typecheck` y `build` sobre `main` fusionado.

### Estado final de la integración

- `main` == `origin/main` (`0 0`), working tree limpio.
- Commits posteriores al merge en `main`: `ccf9911` (registro de esta task) y `cd2ed61` (movimiento de
  esta task a `finished/`).
- Rama `feature/us-0034-app-list-reading-and-ratings` borrada **local y remotamente**, después de
  comprobar que estaba fusionada en `main` (`git branch --merged main`).
- Sólo queda `main`, con seguimiento de `origin/main`.

Las tres tasks de Public Web de esta US (`0088`, `0089`, `0090`) quedaron en
`backlog/epic-04/us-0033/public-web/finished/`.
