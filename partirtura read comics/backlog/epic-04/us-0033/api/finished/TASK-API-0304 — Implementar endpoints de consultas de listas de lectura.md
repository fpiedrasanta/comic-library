# TASK-API-0304 — Implementar endpoints de consultas de listas de lectura

## Objetivo

Implementar o adaptar los endpoints de consulta de listas de lectura correspondientes a la US-0034, respetando los contratos existentes, la arquitectura del proyecto y las responsabilidades de cada capa.

## Endpoints involucrados

- `GET /api/catalog/lists?currentPage=1&pageSize=24`
- `GET /api/catalog/lists/{id}`

## Análisis previo

Antes de implementar:

1. Identificar los Controllers y las acciones que atienden ambos endpoints.
2. Revisar los contratos HTTP, parámetros, DTOs, códigos de respuesta y mecanismos de autorización existentes.
3. Trazar las llamadas a los servicios reales y consultar `project/endpoints.md`, `project/services.md` y `project/repositories.md`.
4. Verificar los cambios realizados en las tasks de repositorios y servicios de esta US.

No inventar nombres de métodos, servicios, DTOs ni rutas. Reutilizar las implementaciones existentes y agregar o modificar elementos únicamente cuando sea necesario.

## Listado de listas

Para `GET /api/catalog/lists`:

- Respetar la paginación mediante `currentPage` y `pageSize`, conforme al contrato existente.
- Devolver la estructura de respuesta definida para el listado.
- Mantener los datos de cada lista, incluidos los indicadores de cantidad de Works, progreso de lectura y valoración que establezca el contrato.
- Preservar los códigos HTTP, las reglas de acceso y el manejo de errores existentes.
- No incorporar cálculos ni consultas de persistencia en el Controller.

## Detalle de una lista

Para `GET /api/catalog/lists/{id}`:

- Recibir e interpretar correctamente el identificador de la lista.
- Devolver el detalle con los Works y los datos de progreso y valoración definidos por el contrato.
- Mantener el comportamiento establecido para identificadores inválidos, listas inexistentes y errores.
- Delegar la obtención y transformación de datos a la capa de servicios.

## Responsabilidades y restricciones

- Los Controllers deben limitarse a recibir la solicitud, validar los parámetros de entrada según las convenciones del proyecto, invocar los servicios y construir la respuesta HTTP correspondiente.
- La lógica de negocio y los cálculos deben permanecer en la capa de servicios o en la capa que corresponda según la arquitectura.
- Las consultas a persistencia deben delegarse a los repositorios.
- No duplicar lógica entre los dos endpoints.
- No modificar contratos, DTOs ni códigos HTTP salvo que exista un incumplimiento comprobado de la US-0034.
- No introducir endpoints adicionales ni funcionalidades fuera del alcance de la US.
- Respetar los mecanismos existentes de autenticación, autorización, manejo de errores y respuestas.

## Documentación

Actualizar `project/endpoints.md` para reflejar las rutas, los parámetros, las respuestas, los códigos HTTP y los servicios invocados realmente por cada endpoint.

Actualizar otros documentos únicamente cuando corresponda por los cambios efectuados, manteniendo coherencia con `project/services.md` y `project/repositories.md`.

No documentar métodos o comportamientos que no existan en la implementación final.

## Validaciones

- Compilar la solución.
- Ejecutar las pruebas disponibles y las validaciones aplicables a esta etapa.
- Verificar ambos endpoints mediante las herramientas disponibles en el proyecto.
- Comprobar paginación, respuestas exitosas, listas inexistentes y errores de entrada.
- Verificar que los contratos de respuesta coincidan con los definidos para la US-0034.
- Confirmar que los Controllers deleguen correctamente en los servicios y no incorporen lógica de negocio.
- Comprobar que no se introduzcan regresiones detectables.

## Git y ejecución

1. `git checkout main` → `git pull`
2. `git branch --list "feature/us-0034-api-list-reading-and-ratings"`

   Si existe: `git switch feature/us-0034-api-list-reading-and-ratings` → `git merge main`.

   Si no existe: `git switch -c feature/us-0034-api-list-reading-and-ratings`.

3. Implementar los cambios de esta task.
4. Revisar los cambios con `git diff`.
5. Ejecutar las validaciones disponibles para comprobar que el dominio compila y que no se introdujeron regresiones detectables en esta etapa.
6. Crear uno o más commits y realizar el push de los cambios a la rama de trabajo.
7. Incorporar el resultado de ejecución en esta misma task mediante **append**, sin sobrescribir su contenido previo.
8. Mover el archivo según `communication.md` a `finished` si se cumplen los criterios, o a `blocked` si existe un bloqueo real, documentando la causa y el trabajo pendiente.

La integración final de la rama en `main` corresponde a las tasks de validación de la User Story.

## Criterios de aceptación

- Ambos endpoints cumplen los contratos definidos para la US-0034.
- Los Controllers reutilizan correctamente los servicios existentes.
- No se duplica lógica de negocio ni de persistencia en la capa HTTP.
- Los códigos HTTP, la autorización y el manejo de errores son coherentes con el proyecto.
- La documentación refleja las rutas y los comportamientos reales.
- La solución compila y las validaciones aplicables pasan.
- El resultado de ejecución queda incorporado mediante append.
- La task queda en `finished` o `blocked`, según `communication.md` y el resultado real de la ejecución.
---

## Resultado de ejecución (2026-10-14)

**Cambios implementados (endpoints / controller):**

- \CatalogController.GetLists\ y \GetList\ obtienen el \userId\ del claim \sub\ mediante \GetUserId()\ (mismo patrón que \WorksController\) y lo pasan a \IWorkListService\. Las firmas de acción y sus parámetros no cambiaron.
- Los endpoints \publishers\/\ranchises\/\series\ no fueron modificados.
- Único cambio de contrato: se agregan a la respuesta los campos que exige la US-0034 (\ReadingProgressPercentage\, \AverageRating\, \RatingCount\ en el card; y en el detalle esos tres a nivel lista más \ReadingProgressPercentage\ por Work). No se agregaron endpoints ni rutas nuevas; códigos HTTP, autorización (\[Authorize]\) y manejo de errores sin cambios.

**Validación:** \dotnet build\ 0 errores; contract tests (\CatalogControllerContractTests\) actualizados a la nueva forma y en verde; \dotnet test\ 370/370. \project/endpoints.md\ y \endpoints/endpoints-catalog.md\ actualizados.
