# TASK-PUBLIC-WEB-0096 — Revisar, validar e integrar la lectura secuencial de listas

## Objetivo

Realizar la revisión técnica y funcional integral de `TASK-PUBLIC-WEB-0091` a `TASK-PUBLIC-WEB-0095`, comprobar que la implementación respeta la arquitectura y los contratos del proyecto, ejecutar las validaciones disponibles e integrar los cambios en `main` únicamente cuando todos los criterios estén satisfechos.

Esta task no debe utilizarse para ocultar fallos de las tareas anteriores ni para declarar una integración exitosa sin evidencia.

## Contexto y documentación obligatoria

Leer íntegramente:

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

Leer también las cinco tasks de Public Web de esta US y sus registros de ejecución agregados mediante append.

## Revisión técnica

Revisar la implementación completa, incluyendo:

- Progreso de lectura en `/lists`.
- Valoración agregada y navegación desde `/lists/:id`.
- Carga del contexto del reader.
- Restauración de la página actual.
- Navegación anterior/siguiente según el orden de la lista.
- Persistencia del Work actual.
- Selector de Works y colores de progreso.
- Valoraciones de Works.
- Valoración de lista al finalizar el último Work.
- Manejo de estados de carga, error y ausencia de datos.
- Navegación de regreso al origen.
- Compatibilidad con el reader individual.

Verificar además:

- Correspondencia exacta entre las llamadas del frontend y `endpoints.md`.
- Compatibilidad de tipos y payloads con los contratos existentes.
- Ausencia de endpoints o propiedades inventados.
- Cumplimiento de `frontend-coding-rules.md`.
- Reutilización de componentes y ausencia de duplicación innecesaria.
- Coherencia entre `pages.md`, `components.md` y la implementación.
- Responsive en Mobile, Tablet y Desktop.
- Ausencia de secretos, información privada indebida o datos ficticios.
- Ausencia de cambios accidentales fuera del alcance.

Corregir los defectos encontrados si pueden resolverse dentro del alcance y sin modificar contratos del backend. Si un defecto depende de un cambio de backend o de una decisión funcional pendiente, documentarlo y bloquear la integración hasta resolverlo.

## Validación funcional integrada

Ejecutar las validaciones disponibles y comprobar, como mínimo:

1. Listas sin progreso, parcialmente leídas y completadas.
2. Listas con y sin valoraciones.
3. Continuación de lectura con Work actual válido.
4. Lista vacía o sin Work actual válido.
5. Restauración de `CurrentPage`.
6. Navegación anterior/siguiente respetando `WorkListItem.Position`.
7. Persistencia del Work actual.
8. Selector con Works sin progreso, parcialmente leídos y completados.
9. Valoración de Works intermedios.
10. Valoración de lista al terminar el último Work.
11. Edición de valoraciones existentes sin duplicación.
12. Regresión del reader individual.
13. Errores de carga, validación y guardado.
14. Build y tests definidos por el proyecto.

Registrar los comandos ejecutados y sus resultados reales. No afirmar que se ejecutó una validación si no se ejecutó.

## Criterios de aceptación

- Las cinco tasks funcionales cumplen sus criterios.
- La revisión documental y técnica está completada.
- Las llamadas del frontend respetan los contratos del backend.
- No quedan defectos conocidos que impidan la integración.
- Las validaciones obligatorias son satisfactorias.
- El reader individual no presenta regresiones detectables.
- Los cambios están committeados y publicados en la rama de trabajo.
- La integración en `main` se realiza únicamente si no existen bloqueos.

## Git y ejecución

1. Actualizar `main` desde el remoto.
2. Cambiar a `feature/us-0035-public-web-sequential-list-reading` y verificar que los cambios de las tasks anteriores estén presentes.
3. Revisar `git status` y `git diff`; comprobar que no existan cambios accidentales o sin registrar.
4. Ejecutar las validaciones técnicas y funcionales descritas en esta task.
5. Si se requieren correcciones, implementarlas en la rama de trabajo, revisar el diff, ejecutar las validaciones afectadas, crear commits y publicar los cambios.
6. Incorporar los resultados de esta revisión en esta misma task mediante **append**, sin sobrescribir el contenido previo.
7. Si las validaciones fallan o existe un bloqueo real, documentar hallazgos, causa y trabajo pendiente, y mover la task a `blocked` conforme a `communication.md`. No integrar en `main`.

## Integración final en main

**Realizar estos pasos únicamente cuando todas las validaciones sean satisfactorias y no existan bloqueos pendientes.**

1. Confirmar que todos los cambios de la US estén committeados y publicados en `feature/us-0035-public-web-sequential-list-reading`.
2. Cambiar a `main` y actualizarla desde el remoto.
3. Integrar `feature/us-0035-public-web-sequential-list-reading` en `main`.
4. Resolver cualquier conflicto, si existiera, y repetir las validaciones afectadas.
5. Confirmar que el resultado integrado en `main` compila y que las pruebas pasan.
6. Publicar `main` en el remoto.
7. Eliminar la rama de la US local y remota únicamente después de verificar que la integración fue exitosa y que no se perderán cambios.
8. Registrar los commits integrados, las validaciones ejecutadas y el resultado de la integración en esta misma task mediante **append**, sin sobrescribir el contenido previo.
9. Mover esta task a `finished` según `communication.md` solo después de confirmar la integración y su publicación.

Si las validaciones fallan, no realizar la integración. Documentar los hallazgos y el trabajo pendiente y mover la task a `blocked` según `communication.md`.

## Registro final

El append de cierre debe incluir:

- Resumen de la revisión técnica y documental.
- Validaciones ejecutadas y resultados.
- Incidencias encontradas y resolución.
- Identificadores de los commits integrados.
- Resultado del merge y publicación de `main`.
- Confirmación de eliminación de la rama, si corresponde.
- Estado final de la task.
