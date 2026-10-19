# TASK-API-0323 — Validar e integrar la administración de listas personales

## Objetivo

Verificar la integración de las operaciones de listas personales y asegurar que las listas del sistema mantienen su comportamiento previo.

## Alcance de validación

Verificar conjuntamente:

- `GET /api/catalog/lists` con `myLists`.
- Creación de listas personales.
- Edición de nombres.
- Eliminación física de listas y sus detalles.
- Incorporación y eliminación de obras.
- Actualización del orden.
- Persistencia de la portada predeterminada.
- Asociación del propietario autenticado.
- Separación entre listas personales y listas del sistema.

## Casos funcionales y de seguridad

- Un usuario solo consulta y administra sus propias listas.
- No se pueden modificar listas del sistema con endpoints personales.
- Los valores de propietario, visibilidad y tipo no pueden falsificarse desde el cliente.
- Eliminar una lista o quitar una obra no elimina entidades `Work`.
- Los registros `WorkListItem` se eliminan físicamente en las operaciones correspondientes.
- La portada de una lista no comparte una referencia editable que provoque modificaciones en otras listas.
- La paginación y los conteos siguen siendo correctos.
- Las operaciones fallidas no dejan datos parcialmente modificados.

## Git y ejecución

1. Leer `communication.md` y las instrucciones vigentes del agente Backend/API.
2. Actualizar la rama principal desde el remoto.
3. Trabajar sobre la rama correspondiente a US-0036, respetando el flujo definido en `communication.md`.
4. Revisar los cambios mediante `git diff`.
5. Ejecutar las pruebas disponibles, validaciones de compilación y pruebas de regresión.
6. Corregir los problemas encontrados, revisar nuevamente el diff y repetir las validaciones afectadas.
7. Confirmar que las migraciones y restricciones de base de datos sean compatibles con los datos existentes.
8. Realizar commits y push según las convenciones del proyecto.
9. Agregar los resultados al final de esta task sin sobrescribir el contenido anterior.
10. Mover la task a `finished` o `blocked` según `communication.md`, documentando resultados y pendientes.

## Criterios de aceptación

- Los endpoints funcionan de manera integrada.
- Las pruebas cubren los casos exitosos, errores de validación, autorización y regresión.
- Las listas del sistema conservan su comportamiento anterior.
- La compilación y las validaciones aplicables finalizan correctamente.
- Los resultados, commits, pruebas y estado final quedan documentados en esta task.

## Integración final en main

**Realizar estos pasos únicamente cuando todas las validaciones sean satisfactorias y no existan bloqueos pendientes.**

1. Confirmar que todos los cambios de la US-0036 estén committeados y publicados en `feature/us-0036-api`.
2. Cambiar a `main` y actualizarla desde el remoto.
3. Integrar `feature/us-0036-api` en `main`.
4. Resolver cualquier conflicto, si existiera, y repetir las validaciones afectadas.
5. Confirmar que el resultado integrado en `main` compila y que las pruebas pasan.
6. Publicar `main` en el remoto.
7. Eliminar la rama de la US local y remota únicamente después de verificar que la integración fue exitosa y que no se perderán cambios.
8. Registrar los commits integrados, las validaciones ejecutadas y el resultado de la integración en esta misma task mediante **append**, sin sobrescribir el contenido previo.

Si las validaciones fallan, la integración no debe realizarse. Documentar los hallazgos y el trabajo pendiente y mover la task a `blocked` según `communication.md`.