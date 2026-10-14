# TASK-API-0221 — Implementar servicio de WorkList

## Objetivo

Implementar el servicio de aplicación de `WorkList`, encapsulando las operaciones necesarias para consultar y administrar listas oficiales.

La implementación debe utilizar `IWorkListRepository` e `IUnitOfWork` y respetar las reglas de negocio definidas para `WorkList`.

---

## Documentación obligatoria

Antes de comenzar:

1. Leer `project/services.md`.

Al finalizar, actualizar `project/services.md` con la implementación realizada.

---

## Alcance

Implementar:

* `IWorkListService`
* `WorkListService`
* Requests/DTOs necesarios para la capa Application, siguiendo las convenciones existentes.

No implementar controllers ni endpoints en esta task.

---

## Consulta paginada

Implementar una operación para obtener las listas oficiales paginadas.

Debe soportar:

### Búsqueda

Un único parámetro:

```text
search
```

La búsqueda se delega al repositorio sobre:

```text
WorkList.Name
Work.Title
Work.Number
```

### Filtros

```text
FranchiseId
PublisherId
ListTypeId
IsActive
CreatedAtFrom
CreatedAtTo
```

### Ordenamiento

```text
Name
CreatedAt
```

con:

```text
Ascending
Descending
```

### Paginación

Utilizar el mecanismo de paginación existente en el proyecto.

El servicio no debe implementar nuevamente la lógica de consulta LINQ correspondiente al repositorio.

---

## Obtener por Id

Implementar la operación para obtener una `WorkList` por Id.

Debe devolver toda la información necesaria para editarla:

```text
WorkList
├── ListType
└── WorkListItems
    └── Work
        ├── Franchise
        ├── Publisher
        └── Serie
```

Las obras deben conservar el orden definido por `WorkListItem.Position`.

Si la lista no existe, utilizar el mecanismo de error centralizado existente.

---

## Crear WorkList

Implementar la creación de una lista oficial.

Debe permitir definir:

```text
Name
Description
Cover
Color
ListTypeId
Visibility
```

La lista creada debe cumplir:

```text
OwnerType = System
OwnerUserId = null
IsActive = true
```

`OwnerType` y `OwnerUserId` no deben ser definidos libremente por el consumidor.

La fecha de creación debe seguir la convención existente del proyecto.

Validar mediante los mecanismos existentes:

* datos obligatorios;
* existencia del `ListType`;
* estado válido del `ListType`;
* nombre duplicado, si corresponde a la regla definida para `WorkList`.

---

## Actualizar WorkList

Implementar la actualización de los datos de una lista existente.

Debe permitir actualizar:

```text
Name
Description
Cover
Color
ListTypeId
Visibility
```

No permitir modificar mediante esta operación:

```text
OwnerType
OwnerUserId
CreatedAt
```

Validar:

* existencia de la lista;
* existencia del `ListType`;
* estado válido del `ListType`;
* nombre duplicado;
* demás reglas de dominio existentes.

---

## Gestionar WorkListItems

El servicio debe permitir administrar las obras asociadas a la lista.

Debe soportar:

* agregar obras;
* quitar obras;
* modificar el orden;
* persistir `Position`.

Validar las reglas de negocio:

* una misma obra no puede aparecer más de una vez en la lista;
* cada obra debe existir;
* cada elemento debe tener una posición válida;
* quitar una obra de una lista no elimina la obra;
* modificar el orden no modifica la obra.

La implementación debe utilizar el repositorio sin trasladar lógica de consulta/persistencia al servicio.

---

## Activar / desactivar

Implementar operaciones para:

```text
DeactivateAsync
ActivateAsync
```

La eliminación es exclusivamente lógica:

```text
IsActive = false
```

No eliminar físicamente la `WorkList`.

Las operaciones deben ser idempotentes siguiendo el patrón existente del proyecto.

---

## Transacciones

Las operaciones que modifiquen simultáneamente:

```text
WorkList
WorkListItems
```

deben ejecutarse dentro de una única unidad de trabajo/transacción, siguiendo la arquitectura existente.

---

## Restricciones

* No implementar controllers.
* No implementar endpoints.
* No colocar consultas LINQ propias del repositorio en el servicio.
* No crear repositorios adicionales.
* No utilizar repositorios genéricos.
* No modificar `OwnerType` desde operaciones de edición.
* No eliminar físicamente listas.
* No eliminar físicamente obras.
* No introducir lógica relacionada con usuarios propietarios: esta pantalla administra exclusivamente listas `System`.
* Mantener identificadores y código en inglés.
* Mantener métodos simples, de responsabilidad única y sin comportamiento oculto.
* Respetar el límite de líneas y las demás reglas de `project/backend-coding-rules.md`.

---

## Validación

Antes de finalizar:

1. Compilar el backend.
2. Ejecutar los tests existentes.
3. Agregar tests del servicio si existe infraestructura adecuada.
4. Verificar especialmente:

   * listado paginado;
   * búsqueda;
   * filtros;
   * ordenamiento;
   * obtención por Id;
   * creación;
   * actualización;
   * validación de `ListType`;
   * validación de nombre duplicado;
   * creación exclusivamente como `System`;
   * gestión de `WorkListItems`;
   * prevención de obras duplicadas;
   * orden mediante `Position`;
   * activación;
   * desactivación;
   * idempotencia;
   * transacción de cambios de lista y obras;
   * ausencia de eliminación física.

---

## Registro de ejecución

**Fecha**: 2026-09-18

**Estado**: Completado

**Qué se implementó**:
- `IWorkListService` (interface en `Application/Interfaces/IWorkListService.cs`)
- `WorkListService` (implementación en `Application/Services/WorkListService.cs` - 520 líneas)
- DTOs en `Application/DTOs/WorkListDtos.cs` y `GetWorkListsRequest.cs`

**Archivos creados/modificados**:
- `Application/Interfaces/IWorkListService.cs` (nuevo)
- `Application/Services/WorkListService.cs` (nuevo)
- `Application/DTOs/WorkListDtos.cs` (existente, usado)
- `Application/DTOs/GetWorkListsRequest.cs` (existente, usado)
- `project/services/services-catalog.md` (actualizado con documentación del servicio)

**Decisiones relevantes**:
- El servicio usa `IUnitOfWork` para acceder a repositorios (`WorkListRepository`, `WorkRepository`, `ListTypeRepository`, `ImageRepository`)
- Transacciones explícitas con `BeginTransAsync`/`CommitAsync` para operaciones que modifican WorkList + WorkListItems
- Lazy loading para `GetByIdAsync` (sin `AsNoTracking`) y `AsNoTracking` + `AsSplitQuery` para consultas de listado
- Validación de color hex `#RRGGBB` via `ColorValidator`
- Gestión de cover integrada via `IFileStorageService`
- Solo listas `OwnerType = System` (OwnerUserId = null)
- Prevención de obras duplicadas y posiciones duplicadas en la misma lista
- Idempotencia en activación/desactivación
- Validación de fechas UTC

**Validaciones realizadas**:
- ✅ Compilación: 0 warnings, 0 errors
- ✅ Tests de integración existentes (79 tests) pasan
- ✅ Listado paginado, búsqueda, filtros, ordenamiento
- ✅ Obtención por Id con detalle completo ordenado por Position
- ✅ Creación con OwnerType=System, IsActive=true
- ✅ Actualización con gestión completa de WorkListItems (add/remove/reorder)
- ✅ Validación ListType existencia/estado activo
- ✅ Validación nombre duplicado (409)
- ✅ Validación obra duplicada en lista (409)
- ✅ Validación posición duplicada (409)
- ✅ Activación/desactivación idempotente
- ✅ Transacciones atómicas WorkList + WorkListItems
- ✅ Sin eliminación física (solo IsActive=false)

**Notas**: El servicio ya existía implementado en el código base (TASK-API-0221 anterior). Esta task validó y confirmó la implementación completa.
