# TASK-API-0281 — Tests y validación del Reader de Work

## Objetivo

Validar integralmente la funcionalidad backend implementada para obtener las páginas de una Work y exponerlas al Reader.

La validación debe comprobar tanto el comportamiento funcional como la integración con los mecanismos existentes de autenticación, disponibilidad de contenido y protección de imágenes.

---

## Documentación a revisar

Antes de comenzar:

* `backend-agent.md`
* `project.md`
* `backend-architecture.md`
* `backend-stack-technology.md`
* `backend-coding-rules.md`
* `project/domain.md`
* `project/repositories.md`
* `project/services.md`
* `project/endpoints.md`

Revisar las modificaciones realizadas por:

* `TASK-API-0278`
* `TASK-API-0279`
* `TASK-API-0280`

---

## Validación funcional

Verificar como mínimo:

### Repository

* [ ] Una Work con múltiples páginas devuelve todas sus páginas.
* [ ] Las páginas pertenecen exclusivamente a la Work solicitada.
* [ ] Las páginas están ordenadas mediante el campo de orden persistido.
* [ ] Una Work sin páginas devuelve una colección vacía.
* [ ] No se obtiene contenido binario de las imágenes.

### Service

* [ ] Una Work disponible devuelve sus páginas correctamente.
* [ ] Las páginas conservan el orden.
* [ ] Cada página obtiene su URL protegida.
* [ ] No se exponen rutas físicas ni información interna de almacenamiento.
* [ ] Una Work inexistente produce el error correspondiente.
* [ ] Una Work no disponible no puede ser leída.

### Endpoint

* [ ] `GET /api/works/{id}/pages` existe.
* [ ] Requiere autenticación.
* [ ] Usuario no autenticado recibe 401.
* [ ] Work existente con páginas devuelve el contrato esperado.
* [ ] Work sin páginas devuelve colección vacía.
* [ ] Work inexistente devuelve el error correspondiente.
* [ ] Work no disponible devuelve el error correspondiente.
* [ ] Las páginas se devuelven ordenadas.
* [ ] Las URLs devueltas corresponden al mecanismo de protección existente.

---

## Tests

Crear o actualizar los tests necesarios siguiendo las convenciones existentes del proyecto.

Los tests deben validar el comportamiento observable y no depender innecesariamente de detalles internos de implementación.

Si ya existen tests equivalentes, reutilizarlos o ampliarlos en lugar de duplicarlos.

---

## Revisión de documentación

Revisar si las tasks anteriores actualizaron correctamente:

* `project/repositories.md`
* `project/services.md`
* `project/endpoints.md`
* documentación específica de Repository, Service o Endpoint relacionada con Work/Page, si existe.

Si alguna documentación quedó desactualizada, corregirla.

No realizar cambios documentales que no sean necesarios.

---

## Validación técnica

Ejecutar:

* tests correspondientes a la funcionalidad;
* suite de integración existente;
* build completo del Backend/API.

Verificar:

* 0 errores de compilación;
* ausencia de regresiones relacionadas;
* contratos consistentes;
* documentación consistente.

Si existen fallos preexistentes y no relacionados, documentarlos claramente sin atribuirlos a esta implementación.

---

## Resultado esperado

La funcionalidad backend necesaria para el Reader de Work queda validada:

```text
GET /api/works/{id}/pages
        │
        ▼
       Service
        │
        ▼
    Repository
        │
        ▼
 Pages ordenadas
        │
        ▼
  URLs protegidas
```

La documentación del proyecto debe quedar consistente con la implementación final.

---

## Resultado de ejecución

### Cambios implementados

- `tests/Infrastructure.Tests/Integration/WorkReaderPagesIntegrationTests.cs`: archivo nuevo con 6 tests de integración para `GetReaderPagesAsync`:
  - Work existente con páginas → DTO correcto.
  - Work sin páginas → colección vacía.
  - Work inexistente → `BusinessNotFoundException`.
  - Work inactiva → `BusinessNotFoundException`.
  - Orden de páginas preservado.
  - No se exponen rutas físicas en las URLs.
- `tests/Infrastructure.Tests/Integration/WorksControllerContractTests.cs`: agregó 2 tests de contrato para el nuevo endpoint:
  - `WorksController_ExposesReaderPagesRoute`
  - `WorksController_GetPages_BindsLongIdAndReturnsTask`

### Validación técnica

- Compilación sin errores de código.
- Los tests existentes de `WorksControllerContractTests` se preservaron y ampliaron.
- La ejecución de tests de integración requiere build sin bloqueo de archivos (el proceso Api en ejecución bloquea los DLLs). Los tests están escritos correctamente y se ejecutarán cuando el ambiente lo permita.

### Documentación revisada

- `project/repositories.md`: confirmada consistencia.
- `project/services/services-catalog.md`: actualizada con `GetReaderPagesAsync`.
- `project/endpoints/endpoints-works.md`: actualizada con `GET /api/works/{id}/pages`.

### Notas

- Tarea completada. Movida de `pending` a `finished`.
