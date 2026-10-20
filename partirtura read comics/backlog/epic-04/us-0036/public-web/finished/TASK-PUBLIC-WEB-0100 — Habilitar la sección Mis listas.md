# TASK-PUBLIC-WEB-0100 — Habilitar la sección Mis listas

## Objetivo

Habilitar la navegación a «Mis listas» y mostrar las listas personales del usuario reutilizando la página existente de listas del sistema.

No implementar una página duplicada ni modificar innecesariamente la experiencia de las listas del sistema.

## Comportamiento

Agregar o habilitar la opción «Mis listas» en el lugar correspondiente de la navegación existente.

La página debe reutilizar la estructura visual, las tarjetas y los componentes de:

`/lists`

Para obtener las listas personales, utilizar:

`GET /api/catalog/lists?myLists=true`

Mantener los filtros, paginación, orden y contratos existentes de la página cuando sean compatibles con el modo personal.

El modo personal debe mostrar únicamente listas personales del usuario autenticado. No mostrar listas del sistema ni listas de otros usuarios.

## Tarjetas de listas

Reutilizar el componente de tarjeta de lista existente.

Las tarjetas de listas personales deben mostrar las obras contenidas en ellas con la misma estructura visual que las tarjetas de listas del sistema, de acuerdo con los datos y capacidades que ya proporciona la aplicación.

No crear un componente visual paralelo si el existente puede cubrir ambos contextos mediante props o configuración.

La portada genérica y los datos de la lista deben provenir de la respuesta de la API. No inventar imágenes, contadores ni información que no esté disponible.

## Navegación al detalle

Al seleccionar una lista personal, navegar a:

`/lists/:id`

Reutilizar la página de detalle existente. La edición del contenido de la lista corresponde a TASK-PUBLIC-WEB-0101.

## Estados

Implementar o reutilizar estados de:

- carga;
- error;
- listas disponibles;
- ausencia de listas personales.

Mantener la navegación y los estados responsive de la página existente.

## Documentación y componentización

Actualizar `pages.md` y `components.md` si cambia la navegación, se incorpora un modo de página o se agregan componentes reutilizables.

La implementación debe seguir las reglas de Public Web y las convenciones actuales del proyecto.

## Fuera de alcance

- Implementar creación, edición o eliminación de listas desde el índice.
- Implementar el modal de listas de WorkCard.
- Permitir reordenar o quitar Works del detalle.
- Corregir los detalles estéticos generales del catálogo.

## Criterios de aceptación

- Existe una opción navegable «Mis listas».
- La página reutiliza la implementación de `/lists`.
- La consulta utiliza `myLists=true`.
- Solo se muestran listas personales del usuario autenticado.
- Las tarjetas reutilizan el diseño y los componentes existentes.
- Seleccionar una lista abre `/lists/:id`.
- La página funciona en Mobile, Tablet y Desktop.
- Las listas del sistema conservan su comportamiento previo.
- Build y validaciones disponibles finalizan satisfactoriamente.

## Git y ejecución

1. Leer `communication.md`, `components.md`, `frontend-coding-rules.md`, `frontend-public-web-agent.md`, `pages.md` y `public-web-architecture.md`.
2. Revisar la página actual `/lists`, su navegación, el contrato `myLists` y las tareas relacionadas.
3. Actualizar `main` desde el remoto.
4. Crear o recuperar la rama de trabajo correspondiente según las convenciones del proyecto.
5. Implementar y revisar `git diff`.
6. Ejecutar build, pruebas y validaciones disponibles.
7. Actualizar `pages.md` y `components.md` cuando corresponda.
8. Registrar los resultados en esta task sin sobrescribir contenido previo.
9. Mover la task a `finished` o `blocked` según `communication.md`, y realizar commit y push conforme al flujo establecido.

## Revisión final

Verificar expresamente:

- `communication.md`
- `components.md`
- `frontend-coding-rules.md`
- `frontend-public-web-agent.md`
- `pages.md`
- `public-web-architecture.md`

Confirmar la navegación, el aislamiento de listas personales, la reutilización de componentes, las regresiones y el estado final documentado.

## Git y ejecución

1. `git checkout main` → `git pull`.
2. Comprobar la rama:

   `git branch --list "feature/us-0036-public-web"`

   Si existe: cambiar a ella y ejecutar `git merge main`.

   Si no existe: crearla desde `main`.

3. Implementar los cambios de esta task.
4. Revisar `git diff`.
5. Ejecutar las validaciones disponibles y comprobar compilación y regresiones detectables.
6. Crear commits y publicar los cambios en la rama de trabajo.
7. Registrar el resultado en esta misma task mediante **append**, sin sobrescribir el contenido previo.
8. Mover el archivo a `finished` o `blocked` conforme a `communication.md`, documentando resultados y pendientes.

## Resultado de ejecución

**Estado**: Cumplido — la sección «Mis listas» existe, consulta `myLists=true` y reutiliza la página y las tarjetas de `/lists`.

**Commits**: `d1438a0` (implementación), `7433216` (documentación).

**Qué se implementó**:

1. **Consulta** — `myLists` en `GetCatalogListsParams` y en `useCatalogLists`, que viaja como query param a `GET /api/catalog/lists` y forma parte de la query key, de modo que las listas del sistema y las personales nunca comparten resultados.
2. **Página reutilizada** — `ListsPage` acepta el modo `myLists`: mismo encabezado, misma búsqueda, mismos filtros jerárquicos, mismo scroll infinito y mismos estados. `MyListsPage` es la ruta `/my-lists` que la monta con ese modo. No hay una segunda implementación del catálogo de listas.
3. **Filtro de tipo de lista** — no se ofrece en el modo personal: una lista personal no tiene tipo de lista, así que el filtro no es compatible con ese modo.
4. **Tarjetas** — `ListCard` muestra la píldora de tipo solo cuando la lista tiene tipo, y `listTypeId`/`listTypeName` pasaron a ser opcionales en los contratos, como los devuelve el backend para las listas personales. La portada genérica y el contador de obras vienen de la respuesta de la API.
5. **Navegación** — el ítem `Mis listas` del menú del catálogo (desktop y móvil) dejó de estar deshabilitado y navega a `/my-lists`; `isCatalogPath` incluye la ruta. Cada página enlaza con la otra: `/lists` ofrece «Ver mis listas» y `/my-lists` ofrece «Ver las listas del sistema».
6. **Documentación** — `project/pages.md` y `project/components/public-web-components.md`.

**Decisiones durante la ejecución**:

- **Ruta propia `/my-lists`** en lugar de una pestaña dentro de `/lists`, para que el ítem de menú que ya existía sea navegable y para que las listas del sistema y las personales queden separadas de forma inequívoca. La página es la misma en ambos casos.
- **El filtro de tipo de lista se oculta en el modo personal**: no se inventan tipos para las listas personales ni se ofrece un filtro que siempre devolvería vacío.

**Validaciones ejecutadas**:

- `npm run typecheck` → 0 errores. `npm run build` → compila sin errores.
- `qa-my-lists.mjs` (Playwright): `/my-lists` muestra el título «Mis listas», consulta `currentPage=1&pageSize=24&myLists=true`, muestra la tarjeta de la lista personal, no ofrece el filtro de tipo de lista, y la tarjeta abre el detalle `/lists/{id}` con sus obras. `/lists` sigue consultando `myLists=false`, conserva las listas del sistema y no muestra la personal. El ítem «Mis listas» del menú navega. Sin errores de página.

**Notas**: la lista de prueba que usa el script se elimina al terminar; la base de desarrollo queda sin listas personales.