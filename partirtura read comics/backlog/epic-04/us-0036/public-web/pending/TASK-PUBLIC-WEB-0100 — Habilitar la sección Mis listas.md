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