
# TASK-API-0296 — Incorporar progreso de lectura al detalle de Work

## Objetivo

Incorporar al detalle de Work la información de progreso de lectura del usuario autenticado, para que Public Web pueda mostrar el avance y determinar la acción principal correspondiente.

## Contexto obligatorio

Leer antes de implementar:

- `backend-agent.md`
- `project.md`
- `backend-architecture.md`
- `backend-stack-technology.md`
- `backend-coding-rules.md`
- `communication.md`
- `project/domain/domain.md`
- `project/repositories.md`
- `project/services.md`
- `project/endpoints.md`

Revisar `WorkService`, `WorkReadingProgress`, el repositorio de progreso y el contrato de `GET /api/works/{id}`.

## Endpoint

Mantener el endpoint existente:

`GET /api/works/{id}`

Extender su respuesta para incluir un objeto `myReadingProgress` correspondiente exclusivamente al usuario autenticado.

No crear un endpoint nuevo para esta consulta, salvo que las convenciones actuales del proyecto hagan inviable extender el contrato existente.

## Contrato de respuesta

Agregar `myReadingProgress`, con estos campos:

- `currentPage`: posición persistida del usuario.
- `totalPages`: cantidad total de páginas del Work.
- `percentage`: porcentaje de avance calculado con las reglas existentes de lectura.
- `lastReadAt`: fecha de la última actualización del progreso.
- `status`: estado de lectura, `Reading` o `Completed`.

Si el usuario no tiene progreso, devolver `myReadingProgress: null`.

La posición final `CurrentPage = TotalPages + 1` representa el estado `Completed` y corresponde al 100 % de avance.

El porcentaje debe calcularse siguiendo las reglas ya establecidas para `WorkReadingProgress`; no introducir una fórmula alternativa.

## Comportamiento según autenticación

- Usuario autenticado con progreso: devolver su progreso.
- Usuario autenticado sin progreso: devolver `null`.
- Usuario anónimo: devolver `null`, sin exponer información personal.
- No permitir que el cliente indique el `UserId` para consultar el progreso.

Mantener la visibilidad pública del Work según las reglas actuales del endpoint. No alterar la autorización existente ni revelar progreso ajeno.

## Implementación

- Reutilizar el repositorio y los servicios existentes de `WorkReadingProgress`.
- Extender el DTO de detalle existente sin duplicar consultas ni lógica de cálculo.
- Obtener la identidad desde el contexto autenticado/JWT mediante los mecanismos ya implementados.
- No crear ni modificar registros de progreso al consultar el detalle.
- Evitar consultas innecesarias cuando el usuario sea anónimo.
- Documentar el contrato actualizado en `project/endpoints/endpoints-works.md` y el índice `project/endpoints.md` si corresponde.

## Responsabilidad del Front

Public Web utilizará `myReadingProgress` para decidir la presentación:

- `null`: no mostrar barra de progreso; botón **Leer**.
- `status = Reading`: mostrar barra; botón **Continuar**.
- `status = Completed`: mostrar barra; botón **Recomenzar**.

El botón **Recomenzar** no debe reiniciar automáticamente el progreso persistido. La navegación debe respetar el comportamiento existente del Reader, que presenta el formulario de valoración al llegar a la posición final.

## Fuera de alcance

- No modificar el endpoint de progreso.
- No alterar las reglas de persistencia ni cálculo del avance.
- No reiniciar automáticamente obras completadas.
- No modificar los contratos HTTP existentes, excepto la ampliación del DTO de detalle.
- No implementar nuevas funcionalidades de historial.

## Validación

- Compilar Backend/API.
- Agregar pruebas para usuario anónimo, usuario autenticado sin progreso y usuario con progreso.
- Verificar los estados `Reading` y `Completed`.
- Verificar el porcentaje, incluida la posición final `TotalPages + 1`.
- Confirmar que la consulta no modifica el progreso.
- Ejecutar la suite completa y documentar los resultados.

## Resultado de ejecución

Al finalizar, agregar un resumen de los archivos modificados, decisiones tomadas, validaciones y resultados, sin eliminar el contenido original de esta task.

Mover la task a `finished` o `blocked`, según corresponda, siguiendo `communication.md`.

---

## Resultado de ejecución

### Archivos modificados
- `api/Application/DTOs/WorkContentDtos.cs` — nuevo `ReaderMyProgressDto(CurrentPage, TotalPages, Percentage, LastReadAt, Status)`.
- `api/Application/DTOs/WorkCatalogDtos.cs` — `CatalogWorkDetailDto` gana `MyReadingProgress` (última posición).
- `api/Application/Services/WorkService.cs` — `GetCatalogByIdAsync(long id, long? userId, CancellationToken)`; consulta el progreso del usuario vía `IWorkReadingProgressRepository.GetByWorkIdAndUserIdAsync` y `MapCatalogDetail` mapea `ReaderMyProgressDto`.
- `api/Application/Interfaces/IWorkService.cs` — firma actualizada.
- `api/Api/Controllers/WorksController.cs` — `GetById` extrae el claim `sub` del JWT (mismo patrón que `GetPages`); claim ausente → `userId = null`.
- `tests/Infrastructure.Tests/Integration/WorkDetailReadingProgressIntegrationTests.cs` (nuevo) — 5 tests.
- `tests/Infrastructure.Tests/Integration/CatalogWorkDetailIntegrationTests.cs` y `WorkRatingDetailIntegrationTests.cs` — call sites actualizados con `null` para el nuevo parámetro.
- `project/endpoints/endpoints-works.md` — contrato de `GET /api/works/{id}` con `myReadingProgress` (ejemplo, DTO y notas).
- `project/services/services-catalog.md` — `GetCatalogByIdAsync` documenta `MyReadingProgress` y su origen.

### Implementación realizada
- El detalle existe sobre `GET /api/works/{id}` (sin endpoint nuevo). `myReadingProgress` se arma **exclusivamente con los valores persistidos** en `WorkReadingProgress`: `CurrentPage`, `TotalPages`, `PercentageReading`, `LastReadAt` y `State` (`"Reading"`/`"Completed"`). No se recalcula nada: el porcentaje es la columna ya calculada por `PUT /api/works/{id}/progress` con la regla existente `(CurrentPage - 1) * 100 / TotalPages` (0 si no hay páginas), y la posición final `CurrentPage = TotalPages + 1` queda con 100 y `Completed` (verificado en HTTP).
- Solo para autenticados: el `[Authorize]` del controlador se mantiene intacto (anónimo → 401) y la identidad sale del claim `sub`; el cliente no puede indicar `UserId` (el test de contrato existente de `GetById` verifica que la acción solo recibe `id` y `CancellationToken`; `?userId=...` se ignora, comprobado por HTTP).
- `myReadingProgress` es `null` cuando el usuario no tiene progreso o cuando no hay usuario autenticado; en ese caso no se ejecuta la consulta de progreso.
- La consulta es de solo lectura: no crea ni modifica progreso (verificado por test comparando la entidad antes y después).

### Decisiones tomadas
- Los 5 campos salen de la entidad persistida (decisión del usuario): el porcentaje ya está guardado y calculado; no se recalcula ni se consulta el conteo de páginas.
- `long? userId` como parámetro requerido del servicio, siguiendo el precedente de `GetReaderPagesAsync(long workId, long? userId, ...)`; se actualizaron los ~10 call sites de tests existentes.
- Los tests no limpian el progreso creado (decisión del usuario): queda como dato real de desarrollo.

### Validaciones ejecutadas
- ✅ Compilación de la solución: 0 errores.
- ✅ Suite completa: **314/314** (309 previas + 5 nuevas).
- ✅ Tests nuevos: anónimo → `null`; autenticado sin progreso → `null`; con progreso → valores persistidos exactos (currentPage, totalPages, percentage, lastReadAt, status `Reading`); posición final → `Completed` con 100%; la consulta no modifica el progreso.
- ✅ Smoke test HTTP real (usuario 4, obra 3): sin progreso → `null`; `PUT /api/works/3/progress {currentPage:3}` → detalle con `{currentPage:3, totalPages:86, percentage:2, lastReadAt, status:"Reading"}`; `PUT` con desborde (clamp a `TotalPages+1 = 87`) → detalle `{currentPage:87, totalPages:86, percentage:100, status:"Completed"}`; sin token → 401; el mismo request como usuario 5 (sin progreso) → `myReadingProgress: null` (no se expone progreso ajeno).

### Problemas encontrados
- Un 404 transitorio durante el smoke test HTTP fue causado por la API deteniéndose a mitad de la prueba (no por el cambio); al reiniciar se verificó `?userId=4` → 200 con el progreso del usuario autenticado, ignorando el parámetro.
- La compilación quedó bloqueada por un proceso `Api` previo que retenía los DLLs; se detuvo y se recompiló sin problema.
