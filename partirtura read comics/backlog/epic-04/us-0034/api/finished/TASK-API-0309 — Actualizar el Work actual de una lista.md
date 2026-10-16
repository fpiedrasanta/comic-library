# TASK-API-0309 — Actualizar el Work actual de una lista

## Objetivo

Implementar `PUT /api/reading/lists/{listId}/current-work` para registrar el Work al que el usuario cambia dentro de una lista.

El progreso de páginas continúa perteneciendo al Work y se administra mediante el mecanismo existente.

## Contexto obligatorio

Leer y revisar:

- `project/backend-agent.md`
- `project/project.md`
- `backend-architecture.md`
- `backend-coding-rules.md`
- `backend-stack-technology.md`
- `domain.md`
- `repositories.md`
- `services.md`
- `endpoints.md`
- `us-0035.md`
- `communication.md`
- La entidad `ListReadingProgress`.
- Las implementaciones existentes de progreso de lectura y consulta de listas.

## Alcance

### 1. Repositorios

- Revisar los métodos existentes para consultar y persistir `ListReadingProgress` por usuario y lista.
- Reutilizar las operaciones existentes.
- Agregar métodos solamente cuando sean necesarios para implementar la actualización.
- Actualizar `repositories.md` si corresponde.

### 2. Servicios

Implementar la operación de aplicación que:

- Obtenga el usuario autenticado mediante los mecanismos existentes.
- Compruebe que la lista existe y es accesible.
- Compruebe que el Work existe y pertenece a la lista.
- Actualice `ListReadingProgress.CurrentWork`.
- Actualice `ListReadingProgress.LastReadAt`.
- Persista los cambios utilizando los mecanismos transaccionales existentes.

Si el usuario no tiene un registro de progreso de lista, aplicar el comportamiento de creación o inicialización establecido por el proyecto y por US-0035.

Actualizar `services.md` y la documentación específica del servicio, si corresponde.

### 3. Endpoints

Crear:

`PUT /api/reading/lists/{listId}/current-work`

- Recibir el identificador del Work seleccionado mediante el contrato definido para el endpoint.
- Aplicar autenticación y autorización existentes.
- Devolver el formato estándar del proyecto.
- Aplicar el manejo de errores existente para listas o Works inexistentes y para Works que no pertenecen a la lista.
- Actualizar `endpoints.md` y la documentación específica del endpoint, si corresponde.

## Restricciones

- No modificar el dominio.
- No modificar `WorkReadingProgress`.
- No actualizar `CurrentPage`, `TotalPages`, `PercentageReading` ni `State` como efecto secundario de cambiar de Work.
- No recalcular artificialmente el progreso porcentual de la lista.
- No permitir que el usuario establezca como actual un Work que no pertenece a la lista.
- No duplicar la lógica existente de persistencia o autenticación.

## Criterios de aceptación

- El endpoint actualiza el Work actual del usuario en la lista indicada.
- `LastReadAt` se actualiza correctamente.
- La pertenencia del Work a la lista se valida.
- El progreso de páginas del Work no cambia.
- El progreso porcentual de la lista no se altera por cambiar de Work.
- Se respetan las convenciones de autenticación, persistencia y errores.
- La documentación queda actualizada y la implementación compila.

## Git y ejecución

1. `git checkout main` → `git pull`
2. `git branch --list "feature/us-0035-api-sequential-list-reading"`

   Si existe: `git switch feature/us-0035-api-sequential-list-reading` → `git merge main`.

   Si no existe: `git switch -c feature/us-0035-api-sequential-list-reading`.

3. Implementar los cambios de esta task.
4. Revisar los cambios con `git diff`.
5. Ejecutar las validaciones disponibles para comprobar que el dominio compila y que no se introdujeron regresiones detectables en esta etapa.
6. Crear uno o más commits y realizar el push de los cambios a la rama de trabajo.
7. Incorporar el resultado de ejecución en esta misma task mediante **append**, sin sobrescribir su contenido previo.
8. Mover el archivo según `communication.md` a `finished` si se cumplen los criterios, o a `blocked` si existe un bloqueo real, documentando la causa y el trabajo pendiente.

## Resultado de ejecución

**Estado**: Cumplido — criterios de aceptación verificados.

**Qué se implementó**:
- Endpoint `PUT /api/reading/lists/{listId}/current-work` (controller `ListReaderController`) que registra el Work al que el usuario cambia dentro de una lista.
- Operation `WorkListService.SetCurrentWorkAsync(listId, workId, userId)` que realiza un upsert de `ListReadingProgress` (setea `CurrentWorkId` y `LastReadAt`) dentro de una transacción.

**Qué se cambió**:
- `api/Api/Controllers/ListReaderController.cs`: endpoint + validaciones 404 (lista/work/inexistencia o work que no pertenece a la lista).
- `api/Application/Services/WorkListService.cs` (`SetCurrentWorkAsync`) + `IWorkListService.cs`.
- `api/Application/DTOs/SetListCurrentWorkRequest.cs`: contrato de entrada `workId`.
- `IListReadingProgressRepository`/`ListReadingProgressRepository` ampliados con upsert de `ListReadingProgress`; registrados en `IUnitOfWork`/`UnitOfWork` (`Infrastructure/Repositories`).
- `endpoints.md`, `services.md`, `repositories.md` actualizados (ruta/verbo/contratos/errores).

**Decisiones relevantes**:
- `userId` resuelto exclusivamente del claim `sub` (auth obligatoria).
- No se persiste ni modifica `WorkReadingProgress`, `CurrentPage`/`TotalPages`/`PercentageReading`/`State` de la lista: el cambio de Work no altera el progreso de páginas ni el %.
- Transaccional con mecanismo existiente (`IDbContextTransaction`).

**Notas**:
- Validaciones: build 0 errores; `WorkListReaderIntegrationTests.SetCurrentWork_*` cubren upsert, `CurrentWork`/`LastReadAt`, 404 work-not-in-list, inmutabilidad de page-progress y percentage.
- Suite `tests/Infrastructure.Tests` 389/389 pass.
- Integrado en `main` (commit `77c8c73`, fast-forward; branch `feature/us-0035-api-sequential-list-reading` integrada y borrada).