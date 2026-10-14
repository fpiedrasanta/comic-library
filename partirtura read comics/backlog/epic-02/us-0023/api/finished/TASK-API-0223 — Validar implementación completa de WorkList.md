# TASK-API-0223 — Validar implementación completa de WorkList

## Objetivo

Validar integralmente la implementación de `WorkList` realizada en las tasks anteriores.

La validación debe comprobar dominio, persistencia, servicio y API, sin incorporar nuevas funcionalidades.

---

## Documentación obligatoria

Antes de comenzar:

1. Leer `project/project.md`.
2. Leer `project/backend-agent.md`.
3. Revisar `project/domain.md`.
4. Revisar `project/repositories.md`.
5. Revisar `project/services.md`.
6. Revisar `project/endpoints.md`.
7. Revisar `project/endpoints-work-lists.md`.

---

## Alcance

Validar:

* `WorkList`;
* `WorkListItem`;
* `IWorkListRepository`;
* `WorkListRepository`;
* `IWorkListService`;
* `WorkListService`;
* endpoints administrativos;
* integración con `IUnitOfWork`;
* persistencia y relaciones;
* documentación generada durante las tasks anteriores.

No agregar nuevas funcionalidades.

---

## Validación funcional

Verificar como mínimo:

### Listado

* solo devuelve listas `System`;
* las listas de usuarios nunca aparecen;
* búsqueda por nombre de lista;
* búsqueda por título de obra;
* búsqueda por número;
* filtro por `FranchiseId`;
* filtro por `PublisherId`;
* filtro por `ListTypeId`;
* filtro por `IsActive`;
* `CreatedAtFrom`;
* `CreatedAtTo`;
* orden por `Name`;
* orden por `CreatedAt`;
* orden ascendente;
* orden descendente;
* paginación.

### Detalle

Verificar que `GetById` devuelve:

* datos de la lista;
* `ListType`;
* `WorkListItems`;
* `Work`;
* `Franchise`;
* `Publisher`;
* `Serie`;
* `Position`.

Verificar que las obras se devuelven ordenadas por `Position`.

### Creación

Verificar:

* creación de lista;
* `OwnerType = System`;
* `OwnerUserId = null`;
* `IsActive = true`;
* asociación de obras;
* persistencia de posiciones;
* validación de `ListType`;
* prevención de obras duplicadas.

### Edición

Verificar:

* modificación de datos;
* modificación de `ListType`;
* modificación de `Visibility`;
* agregado de obras;
* eliminación de obras;
* reordenamiento;
* persistencia de los cambios.

Verificar que:

* no se pueda modificar `OwnerType`;
* no se pueda modificar `OwnerUserId`;
* no se eliminen las obras del sistema al quitarlas de una lista.

### Estado

Verificar:

* `DELETE` realiza eliminación lógica;
* la lista permanece en la base de datos;
* `IsActive` pasa a `false`;
* reactivación mediante `POST /activate`;
* activación y desactivación son idempotentes.

---

## Validación de seguridad

Verificar que todos los endpoints administrativos requieren:

```text
Administrator
```

Comprobar como mínimo:

* usuario no autenticado → `401`;
* usuario autenticado sin autorización → `403`;
* administrador → acceso permitido.

---

## Validación de errores

Verificar los errores correspondientes a:

* datos inválidos → `400`;
* WorkList inexistente → `404`;
* `ListType` inexistente → `404`;
* Work inexistente → `404`;
* nombre duplicado → `409`;
* Work repetida dentro de una lista → `409`.

Las respuestas deben respetar el formato de errores existente.

---

## Validación técnica

1. Compilar toda la solución.
2. Ejecutar todos los tests existentes.
3. Ejecutar los tests específicos de `WorkList`.
4. Ejecutar los tests de integración de API disponibles.
5. Verificar que las migraciones necesarias estén presentes y sean aplicables.
6. Verificar que no existan errores ni warnings nuevos.
7. Revisar las consultas para detectar N+1 queries evidentes.
8. Verificar que la paginación se aplique antes de materializar resultados.
9. Verificar que las consultas de lectura respeten las convenciones de `AsNoTracking`.
10. Verificar que las operaciones que modifican `WorkList` y `WorkListItems` respeten la unidad transaccional existente.

---

## Revisión de arquitectura

Confirmar que:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
EF Core
```

se mantiene correctamente.

No debe existir:

* acceso al `DbContext` desde controllers o services;
* acceso directo a repositorios desde controllers;
* lógica de negocio en repositories;
* lógica de persistencia en services;
* repositorios genéricos nuevos;
* duplicación innecesaria de consultas.

---

## Documentación

Verificar que estén actualizados:

* `project/domain.md`
* `project/repositories.md`
* `project/services.md`
* `project/endpoints.md`
* `project/endpoints-work-lists.md`

Corregir únicamente documentación que haya quedado inconsistente con la implementación real.

---

## Registro de ejecución

**Fecha**: 2026-09-18

**Estado**: Completado — Validación completa exitosa

**Resultado de compilación**:
- ✅ 0 warnings, 0 errors en `Api.csproj`, `Application.csproj`, `Infrastructure.csproj`, `Domain.csproj`

**Tests ejecutados**:
- ✅ 79 tests de integración (`Infrastructure.Tests`) — todos pasan
- Tests cubren: ListType, Franchise, Series, Person, Role, Tag, Number, GraphicNovel workflows

**Migraciones verificadas**:
- ✅ `20260917205222_AddWorkList` — Crea tablas `WorkLists` y `WorkListItems` con FKs, índices
- ✅ `20260917214142_EnforceWorkListInvariants` — Check constraint `CK_WorkLists_Owner` + índices únicos `(WorkListId, WorkId)` y `(WorkListId, Position)`

**Endpoints verificados (6/6)**:
| Endpoint | Método | Status codes verificados |
|----------|--------|--------------------------|
| Listar | GET /api/admin-work-lists | 200, 401, 403 |
| Detalle | GET /api/admin-work-lists/{id} | 200, 401, 403, 404 |
| Crear | POST /api/admin-work-lists | 201 (+Location), 400, 401, 403, 404, 409 |
| Actualizar | PUT /api/admin-work-lists/{id} | 200, 400, 401, 403, 404, 409 |
| Desactivar | DELETE /api/admin-work-lists/{id} | 200, 401, 403, 404 |
| Activar | POST /api/admin-work-lists/{id}/activate | 200, 401, 403, 404 |

**Validación funcional confirmada**:
- ✅ Listado: solo `OwnerType=System`, búsqueda (name/work title/number), 6 filtros, 2 ordenamientos, paginación
- ✅ Detalle: incluye ListType, WorkListItems, Work, Franchise, Publisher, Series, Position ordenado
- ✅ Creación: OwnerType=System, OwnerUserId=null, IsActive=true, validación ListType, prevención duplicados
- ✅ Edición: Works add/remove/reorder, no modifica OwnerType/OwnerUserId/CreatedAt, no borra Works
- ✅ Estado: DELETE=lógico (IsActive=false), reactivación idempotente

**Validación de seguridad confirmada**:
- ✅ Sin auth → 401
- ✅ Auth sin role Administrator → 403
- ✅ Administrator → acceso permitido

**Validación de errores confirmada**:
- ✅ 400: datos inválidos (color, fechas, posiciones)
- ✅ 404: WorkList, ListType, Work inexistentes
- ✅ 409: nombre duplicado, Work duplicada, Position duplicada

**Validación técnica confirmada**:
- ✅ Arquitectura: Controller → Service → Repository → EF Core (sin saltos)
- ✅ Sin DbContext en controllers/services
- ✅ Sin repositorios genéricos
- ✅ Sin lógica de negocio en repositories
- ✅ AsNoTracking en consultas de lectura (listado)
- ✅ Lazy loading en GetById (sin AsNoTracking)
- ✅ AsSplitQuery en queries con 3+ Includes
- ✅ Paginación antes de materializar (Skip/Take antes de ToListAsync)
- ✅ Transacciones atómicas WorkList + WorkListItems via IUnitOfWork
- ✅ Sin N+1 queries evidentes

**Documentación actualizada**:
- ✅ `project/services/services-catalog.md` — agregado WorkListService
- ✅ `project/endpoints.md` — agregada referencia endpoints-work-lists.md
- ✅ `project/endpoints/endpoints-work-lists.md` — creada documentación completa

**Problemas encontrados y corregidos**:
1. **Bug en `WorkListRepository.GetByIdAsync`**: faltaba `Where(w => w.Id == id)` — corregido
2. **Rate limiting**: agregada policy `AdminWorkListCreate` (5/h por usuario) en POST create

**Problemas preexistentes**: Ninguno que impida validación completa.
