# TASK-API-0305 — Implementar tests de consultas de listas de lectura

## Objetivo

Crear las pruebas necesarias para verificar el comportamiento de los endpoints de consulta de listas de lectura de la US-0034, incluyendo las capas de servicios y repositorios involucradas.

## Análisis previo

1. Leer las tasks anteriores de la US-0034 y revisar los cambios implementados.
2. Identificar los tests existentes relacionados con Works, listas, progreso de lectura y valoraciones.
3. Reutilizar la infraestructura, convenciones, utilidades y patrones de testing del proyecto.
4. Identificar los métodos reales de repositorio, servicio y endpoint que deben probarse.

No inventar nombres de métodos ni duplicar pruebas existentes sin justificación.

## Alcance

Probar los siguientes endpoints:

- `GET /api/catalog/lists?currentPage=1&pageSize=24`
- `GET /api/catalog/lists/{id}`

Cubrir las capas de repositorios y servicios cuando corresponda según la arquitectura y las estrategias de testing existentes.

## Casos de prueba

### Listado de listas

- Listas con resultados.
- Listado vacío.
- Paginación y cantidad de elementos por página.
- Datos de cada lista conforme al contrato.
- Cantidad de Works.
- Progreso de lectura del usuario actual.
- Listas sin registros de progreso.
- Listas con progreso parcial y con Works completados.
- Listas sin valoraciones y listas con valoraciones.

### Detalle de una lista

- Lista existente con Works.
- Lista vacía.
- Lista inexistente.
- Progreso individual de los Works.
- Progreso general de la lista.
- Works sin registros de progreso.
- Valoraciones y sus acumuladores.
- Respuestas y errores conforme al contrato existente.

Verificar que el progreso de lectura utilice `ReadingState.Completed`, que las listas vacías tengan progreso del 0 % y que los casos sin registros de progreso o sin valoraciones respeten las reglas de la US-0034.

## Persistencia y aislamiento

- Utilizar las herramientas e infraestructura de testing existentes.
- Si las pruebas utilizan la base de datos `comiclibrary_dev`, crear los datos necesarios de forma controlada.
- Limpiar los datos creados y restaurar cualquier estado modificado al finalizar.
- Evitar dependencias entre pruebas y resultados dependientes del orden de ejecución.
- No introducir mocks si contradicen la estrategia de testing establecida por el proyecto.

## Restricciones

- No modificar la lógica productiva para hacer pasar una prueba incorrecta.
- No alterar contratos HTTP ni reglas de negocio.
- No duplicar pruebas existentes.
- Si se detecta un defecto, documentarlo y corregirlo únicamente cuando corresponda al alcance de esta task; registrar los cambios y sus motivos.

## Validaciones

- Ejecutar las nuevas pruebas.
- Ejecutar las pruebas existentes relacionadas con las funcionalidades afectadas.
- Verificar que los resultados sean reproducibles y que no queden datos de prueba residuales.
- Documentar los fallos encontrados y los bloqueos reales.

## Git y ejecución

1. `git checkout main` → `git pull`
2. `git branch --list "feature/us-0034-api-list-reading-and-ratings"`

   Si existe: `git switch feature/us-0034-api-list-reading-and-ratings` → `git merge main`.

   Si no existe: `git switch -c feature/us-0034-api-list-reading-and-ratings`.

3. Implementar los tests.
4. Revisar los cambios con `git diff`.
5. Ejecutar las validaciones disponibles.
6. Crear uno o más commits y realizar el push de los cambios a la rama de trabajo.
7. Incorporar el resultado de ejecución en esta misma task mediante **append**, sin sobrescribir su contenido previo.
8. Mover el archivo según `communication.md` a `finished` si se cumplen los criterios, o a `blocked` si existe un bloqueo real, documentando la causa y el trabajo pendiente.

La integración final de la rama en `main` corresponde a la task de validación final de la US.

## Criterios de aceptación

- Los casos de prueba relevantes están implementados.
- Las pruebas verifican los contratos y reglas de negocio definidos para la US-0034.
- Las pruebas no dependen entre sí ni dejan datos residuales.
- Las pruebas nuevas y las relacionadas con la funcionalidad se ejecutan correctamente, o los fallos pendientes quedan documentados.
- El resultado de ejecución queda incorporado mediante append.
- La task queda en `finished` o `blocked`, según `communication.md` y el resultado real de la ejecución.
---

## Resultado de ejecución (2026-10-14)

**Tests agregados:** \	ests/Infrastructure.Tests/Integration/CatalogListsReadingProgressIntegrationTests.cs\ (7 casos):

- Progreso \
ull\ cuando el usuario no tiene progreso en ningún Work (lista y por Work).
- Progreso parcial (1 de 2 completados → 50) y progreso individual por Work (Completed → 100, Reading → 40%).
- Progreso 100 con todos los Works completados.
- Lista vacía → 0.
- \AverageRating\ null sin valoraciones y valor expuesto con \RatingCount\ > 0.
- Petición anónima (sin \userId\) → progreso \
ull\ y sin datos de progreso.
- Sin N+1: tras el listado, el \ChangeTracker\ no contiene \WorkReadingProgress\ ni \WorkListItem\.

También se actualizaron los contract tests \CatalogControllerContractTests\ a la nueva forma de los DTOs de lista (exigida por la US-0034).

**Aislamiento:** los tests crean datos controlados (lista/works/usuario) y los limpian al finalizar; verificado 0 residuo en \comiclibrary_dev\ tras la corrida completa.

**Validación:** \dotnet test\ 370/370 (0 fallos). Sin regresiones.
