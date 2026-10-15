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
