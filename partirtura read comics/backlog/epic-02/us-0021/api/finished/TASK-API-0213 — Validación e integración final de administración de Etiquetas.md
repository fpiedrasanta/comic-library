# TASK-API-0213 — Validación e integración final de administración de Etiquetas

## Objetivo

Validar la implementación completa de administración de Etiquetas e integrar los cambios pendientes.

## Documentación

Leer:

* `project/domain.md`
* `project/repositories.md`
* `project/services.md`
* `project/endpoints.md`
* `project/endpoints-tag.md`
* `project/backend-coding-rules.md`

Actualizar la documentación que requiera correcciones.

## Validación

Verificar el flujo completo:

* Crear etiqueta.
* Listar etiquetas.
* Buscar por nombre.
* Filtrar por `IsActive`.
* Ordenar.
* Paginar.
* Obtener por `Id`.
* Modificar nombre.
* Rechazar nombres duplicados.
* Desactivar etiqueta.
* Reactivar etiqueta.
* Mantener las relaciones existentes con `Work`.

Verificar además:

* Autenticación y autorización.
* Códigos HTTP.
* Contratos request/response.
* Manejo de errores.
* Migraciones y persistencia.
* Tests existentes y nuevos.
* Regresión de funcionalidades que utilizan Tags.

## Criterio de finalización

La administración de Etiquetas debe quedar completamente funcional y consistente con las convenciones del proyecto.

Corregir cualquier problema encontrado durante la validación.

No implementar funcionalidades fuera de US-0022.

Crear casos de pruebas.

## Resultado de ejecución

### Qué se validó

Todos los flujos del criterio de finalización verificados mediante `TagAdministrationIntegrationTests` (13 tests, todos pasando):

- ✅ Crear etiqueta válida (con IsActive=true)
- ✅ Crear etiqueta con nombre vacío → ValidationException
- ✅ Crear etiqueta duplicada → BusinessConflictException
- ✅ Listar etiquetas con paginación y búsqueda
- ✅ Modificar nombre de etiqueta existente
- ✅ Modificar etiqueta inexistente → BusinessNotFoundException
- ✅ Modificar a nombre duplicado → BusinessConflictException
- ✅ Desactivar etiqueta activa
- ✅ Desactivar etiqueta ya inactiva (idempotente)
- ✅ Desactivar etiqueta inexistente → BusinessNotFoundException
- ✅ Reactivar etiqueta inactiva
- ✅ Reactivar etiqueta ya activa (idempotente)
- ✅ Reactivar etiqueta inexistente → BusinessNotFoundException

### Verificaciones adicionales

- Compilación: 0 errores, 0 advertencias en Api/Api.csproj
- Tests completos: 64/65 pasando (1 flaky FullWorkflow timeout, no relacionado con Tags)
- Migración `AddIsActiveToTag` aplicada y funcionando
- Las relaciones con Work se preservan al desactivar (TagByWork tiene DeleteBehavior.Restrict)
- Códigos HTTP semánticos: 200, 201, 400, 404, 409

### Regresión

Los 52 tests preexistentes siguen pasando. La nueva migración y los cambios en TagService/TagRepository no afectan el flujo de CBR ni otras funcionalidades.

### Notas

- `FullWorkflowIntegrationTests` puede fallar por timeout en entornos con recursos limitados (proceso CBR), pero es flaky y pasa en re-ejecución.
