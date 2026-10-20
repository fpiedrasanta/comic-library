# TASK-PUBLIC-WEB-0102 — Validar e integrar US-0036 en Public Web

## Objetivo

Validar la integración funcional de la administración de listas personales en Public Web una vez completadas TASK-PUBLIC-WEB-0099, TASK-PUBLIC-WEB-0100 y TASK-PUBLIC-WEB-0101.

No agregar funcionalidades nuevas durante la validación salvo las correcciones necesarias para cumplir los criterios de aceptación de esas tasks.

## Prerrequisitos

Verificar que las tres tasks de implementación estén en estado `finished` y que sus cambios estén disponibles en sus ramas correspondientes.

Si alguna tarea está bloqueada o no cumple sus criterios, documentar el bloqueo y no integrar cambios incompletos.

## Validación funcional

### WorkCard y modal de listas

- El botón aparece en todos los contextos indicados por TASK-PUBLIC-WEB-0099.
- El color depende de `isInPersonalList`.
- El modal utiliza `containsWork` para cada checkbox.
- La búsqueda conserva el orden requerido por la API.
- Crear, renombrar y eliminar listas funciona con los endpoints existentes.
- Agregar y quitar Works persiste correctamente.
- Los cambios actualizan el estado de la tarjeta y las consultas relacionadas.
- No se muestran ni modifican listas del sistema.

### Índice Mis listas

- La navegación a «Mis listas» funciona.
- La consulta utiliza `myLists=true`.
- Solo aparecen listas personales del usuario autenticado.
- La página reutiliza los componentes de `/lists`.
- El detalle se abre desde la tarjeta seleccionada.

### Detalle de listas personales

- El propietario puede reordenar Works.
- El orden persiste al recargar.
- El propietario puede quitar Works.
- Quitar una relación no elimina la obra ni modifica su progreso, ratings, comentarios o favoritos.
- El detalle de listas del sistema conserva el comportamiento previo.
- Se mantienen las funcionalidades existentes de lectura y seguimiento.

### Responsive y regresiones

Validar Mobile, Tablet y Desktop.

Comprobar que los cambios no rompen:
- catálogo general;
- recomendados;
- historial de lectura;
- favoritos;
- páginas contextuales de Publisher, Franchise y Series;
- navegación y detalle de listas del sistema.

## Validación técnica

- Revisar `git status` y `git diff`.
- Ejecutar build y pruebas disponibles.
- Corregir errores reproducibles dentro del alcance, revisando el diff y volviendo a ejecutar las validaciones afectadas.
- Verificar que no se duplicaron páginas, componentes ni lógica de pertenencia.
- Confirmar que no hay contratos API inventados ni solicitudes incompatibles con Backend/API.
- Confirmar que las actualizaciones de caché/estado no dejan botones, checkboxes o contadores desincronizados.

## Documentación

Revisar y actualizar cuando corresponda:

- `pages.md`
- `components.md`
- `communication.md`

No sobrescribir los resultados previos de las tasks de implementación.

## Criterios de aceptación

- Las tres tasks previas cumplen sus criterios de aceptación.
- Los flujos de listas personales funcionan de punta a punta.
- Las listas del sistema no pueden modificarse desde los controles personales.
- No se detectan regresiones en los flujos existentes.
- Las validaciones técnicas finalizan satisfactoriamente.
- El resultado de la integración queda documentado.

## Git y ejecución

1. Actualizar `main` desde el remoto.
2. Cambiar a la rama o ramas de trabajo y verificar que los cambios de las tasks estén presentes.
3. Revisar `git status` y `git diff`; identificar cambios accidentales o sin registrar.
4. Ejecutar validaciones técnicas y funcionales.
5. Si se necesitan correcciones, implementarlas en la rama de trabajo, revisar el diff, validar y registrar commits.
6. Si existe un fallo o bloqueo real, documentarlo en esta task, moverla a `blocked` según `communication.md` y no integrar en `main`.
7. Si todas las validaciones pasan, integrar siguiendo el procedimiento de `communication.md`, resolver conflictos y repetir las validaciones relevantes sobre `main`.
8. Publicar `main` en el remoto y verificar el resultado.
9. Eliminar ramas de trabajo locales y remotas únicamente después de confirmar que la integración fue exitosa.
10. Registrar commits, pruebas, integración, push y estado final en esta task.

## Revisión final obligatoria

Leer y verificar:

- `communication.md`
- `components.md`
- `frontend-coding-rules.md`
- `frontend-public-web-agent.md`
- `pages.md`
- `public-web-architecture.md`

Documentar el resultado de cada validación, los commits integrados, los posibles bloqueos y el estado final de la task.

## Git y ejecución

1. Actualizar `main` desde el remoto.
2. Cambiar a `feature/us-0036-public-web` y verificar que los cambios de las tasks anteriores estén presentes.
3. Revisar `git status` y `git diff`; comprobar que no existan cambios accidentales o sin registrar.
4. Ejecutar las validaciones técnicas y funcionales descritas en esta task.
5. Si se requieren correcciones, implementarlas en la rama de trabajo, revisar el diff, ejecutar las validaciones afectadas, crear commits y publicar los cambios.
6. Incorporar los resultados de esta revisión en esta misma task mediante **append**, sin sobrescribir el contenido previo.
7. Si las validaciones fallan o existe un bloqueo real, documentar hallazgos, causa y trabajo pendiente, y mover la task a `blocked` conforme a `communication.md`. No integrar en `main`.
8. Si todas las validaciones pasan, actualizar `main`, integrar la rama, resolver eventuales conflictos y repetir las validaciones pertinentes sobre `main`.
9. Publicar `main` y verificar la integración remota. Eliminar la rama local y remota de trabajo solamente después de confirmar que la integración final fue exitosa.
10. Registrar mediante **append** los commits, pruebas, resultados de integración, publicación y estado final. Mover esta task a `finished` conforme a `communication.md` solo cuando la integración haya sido verificada.