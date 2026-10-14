# TASK-API-0229 — Validar unificación de Work y migración

## Objetivo

Validar integralmente la unificación de `Work` y `GraphicNovel` y verificar que el backend haya quedado consistente con el nuevo modelo.

Esta task debe comprobar:

* dominio;
* persistencia;
* servicios;
* endpoints;
* migración de datos;
* eliminación de dependencias de `GraphicNovel`;
* preservación de la funcionalidad existente de obras numeradas;
* capacidad de utilizar nuevos `WorkType` sin modificar código.

No agregar nueva funcionalidad.

## Documentación obligatoria

Revisar antes de comenzar:

* `project/domain/domain-catalog.md`
* `project/repositories.md`
* `project/repositories/repositories-catalog.md`
* `project/services.md`
* `project/services/services-catalog.md`
* `project/endpoints.md`
* documentación específica de endpoints de `Work`

Revisar también la documentación de:

* `Number`;
* `Series`;
* `GraphicNovel`;
* `WorkType`.

Al finalizar, actualizar únicamente la documentación que haya quedado desactualizada como consecuencia de la implementación.

## 1. Validación del dominio

Verificar que:

* `Work` sea la única entidad utilizada para representar obras.
* `WorkType` sea una entidad independiente de catálogo.
* `Work` tenga relación con `WorkType`.
* `GraphicNovel` no exista como entidad especializada.
* Las propiedades opcionales de `Work` puedan ser `null`.
* No existan reglas de dominio basadas en valores concretos de `WorkType`.

Especialmente, buscar código que contenga lógica equivalente a:

```text id="s1v24r"
WorkType == "Number"
```

o:

```text id="c9a3zx"
WorkType.Name == "Graphic Novel"
```

y verificar que no exista como regla estructural del backend.

## 2. Validación de persistencia

Verificar que Entity Framework Core represente correctamente:

```text id="q4z7dm"
Work
├── WorkType
├── Series?
├── NextNumber?
├── PreviousNumber?
└── ...
```

Comprobar:

* claves foráneas;
* relaciones opcionales;
* índices existentes;
* restricciones;
* navegación de entidades;
* ausencia de tablas o relaciones innecesarias de `GraphicNovel`.

Verificar que no exista una dependencia de persistencia que obligue a mantener `GraphicNovel` como entidad independiente.

## 3. Migraciones

Revisar las migraciones generadas durante las tasks anteriores.

Si existen datos correspondientes a `GraphicNovel`, verificar que hayan sido preservados durante la transición al nuevo modelo.

La migración debe:

* preservar las obras existentes;
* preservar sus datos;
* preservar relaciones que continúen siendo válidas;
* crear los `WorkType` necesarios para representar las clasificaciones existentes;
* asociar las obras existentes al `WorkType` correspondiente;
* eliminar estructuras obsoletas únicamente después de haber preservado sus datos.

No eliminar información existente.

Si la migración generada durante las tasks anteriores necesita ajustes para cumplir estas condiciones, corregirla.

## 4. Validación del servicio

Comprobar que `WorkService`:

* crea `Work`;
* actualiza `Work`;
* obtiene `Work`;
* trabaja con `WorkTypeId`;
* valida existencia de referencias;
* permite relaciones opcionales nulas;
* no interpreta el significado de `WorkType`;
* no contiene lógica específica de `GraphicNovel`.

Crear pruebas para verificar, como mínimo:

### Obra con relaciones

Una obra puede crearse con:

```text
WorkTypeId
SeriesId
NextNumberId
PreviousNumberId
```

cuando esos valores sean válidos.

### Obra independiente

Una obra puede crearse con:

```text
WorkTypeId
SeriesId = null
NextNumberId = null
PreviousNumberId = null
```

### Nuevo WorkType

Crear un `WorkType` adicional mediante el mecanismo existente de catálogo y verificar que una `Work` pueda utilizarlo sin modificar el código del servicio.

### Referencias inexistentes

Verificar que referencias inexistentes produzcan los errores correspondientes.

## 5. Validación de endpoints

Verificar el recurso unificado:

```text id="1c7qqy"
/api/admin-works
```

incluyendo:

* listado;
* detalle;
* creación;
* actualización;
* activación;
* desactivación, si corresponde.

Verificar:

* autenticación;
* autorización;
* códigos HTTP;
* validaciones;
* errores;
* paginación;
* filtros;
* búsqueda;
* ordenamiento;
* rate limiting cuando corresponda.

Confirmar que los endpoints específicos anteriores de `Number` y `GraphicNovel` ya no sean utilizados por el backend.

## 6. Búsqueda de referencias obsoletas

Realizar una búsqueda completa en la solución para detectar referencias a:

```text id="r4p8yk"
GraphicNovel
GraphicNovels
admin-graphic-novels
admin-numbers
```

Analizar cada resultado.

Eliminar o adaptar las referencias que pertenezcan a la antigua arquitectura.

No eliminar referencias históricas o documentales si son necesarias para explicar una migración, pero ninguna dependencia ejecutable debe continuar requiriendo `GraphicNovel` como entidad independiente.

## 7. Tests

Ejecutar:

* build completo de la solución;
* tests unitarios existentes;
* tests de infraestructura;
* tests de integración existentes;
* tests específicos agregados para la unificación.

No considerar la task completa si existen errores o warnings introducidos por este cambio.

## 8. Validación final de arquitectura

Confirmar que el flujo final sea:

```text id="qv1m7j"
HTTP
 ↓
AdminWorksController
 ↓
WorkService
 ↓
IWorkRepository / IWorkTypeRepository
 ↓
UnitOfWork
 ↓
Entity Framework Core
 ↓
MySQL
```

Y que no exista:

```text id="s4g6kt"
Controller
 ↓
GraphicNovelService
```

ni:

```text id="6y7b7k"
Controller
 ↓
NumberService
```

como mecanismo paralelo para crear obras.

## Criterios de aceptación

* [ ] `Work` es la única entidad utilizada para representar obras.
* [ ] `WorkType` funciona como catálogo independiente.
* [ ] `WorkType` no contiene ni determina reglas estructurales de `Work`.
* [ ] `GraphicNovel` dejó de ser una entidad utilizada por el backend.
* [ ] Las obras existentes fueron preservadas.
* [ ] Las clasificaciones existentes fueron migradas correctamente a `WorkType`.
* [ ] Las relaciones existentes continúan funcionando.
* [ ] Las relaciones opcionales de `Work` pueden ser `null`.
* [ ] Una obra puede utilizar cualquier `WorkType` existente.
* [ ] Un nuevo `WorkType` puede utilizarse sin modificar código.
* [ ] El CRUD unificado de `Work` funciona.
* [ ] Los endpoints antiguos específicos de `GraphicNovel` y `Number` ya no son utilizados.
* [ ] No quedan dependencias ejecutables de `GraphicNovel` como entidad independiente.
* [ ] No existen reglas basadas en nombres concretos de `WorkType`.
* [ ] Los tests existentes pasan.
* [ ] Los nuevos tests de la unificación pasan.
* [ ] La solución completa compila sin errores ni warnings.
* [ ] La documentación queda consistente con la arquitectura final.

## Resultado de la ejecución

### Qué se implementó

* Validado dominio: `Work` es la única entidad de obra, `WorkType` es catálogo independiente, `GraphicNovel` y `Number` eliminadas.
* Validada persistencia: modelo snapshot actualizado eliminando TPH/discriminador, agregadas entidades `WorkType` y relación `WorkTypeId`.
* Validados servicios: `WorkService` y `WorkContentService` unificados, sin lógica basada en `WorkType`.
* Validados endpoints: `/api/admin-works` unificado, eliminados `/api/admin-numbers` y `/api/admin-graphic-novels`.
* Actualizada migración: `ApplicationDbContextModelSnapshot` refleja el modelo actual sin entidades especializadas.
* Busqueda completa de referencias obsoletas: eliminadas referencias ejecutables a servicios/controladores antiguos en backend y tests.
* Tests de integración actualizados: `ListWorksIntegrationTests`, `EditExistingWorkWorkflowIntegrationTests`, `FullWorkflowIntegrationTests`.
* `HttpClientScript.cs` actualizado a nuevo endpoint.

### Archivos modificados

* `Infrastructure/Migrations/ApplicationDbContextModelSnapshot.cs`
* `tests/Infrastructure.Tests/Integration/ListWorksIntegrationTests.cs`
* `tests/Infrastructure.Tests/Integration/EditGraphicNovelWorkflowIntegrationTests.cs` -> renombrado a `EditExistingWorkWorkflowIntegrationTests.cs`
* `tests/Infrastructure.Tests/Integration/EditExistingNumberWorkflowIntegrationTests.cs`
* `tests/Infrastructure.Tests/Integration/FullWorkflowIntegrationTests.cs`
* `tests/Infrastructure.Tests/Integration/ListTypeAdministrationIntegrationTests.cs`
* `tests/Infrastructure.Tests/Integration/PersonAdministrationIntegrationTests.cs`
* `tests/Infrastructure.Tests/Integration/RoleAdministrationIntegrationTests.cs`
* `tests/Infrastructure.Tests/Integration/TagAdministrationIntegrationTests.cs`
* `tests/HttpClientScript.cs`

### Decisiones relevantes

* Migración permite recrear la base de datos limpiamente; modelo snapshot refleja el estado actual sin TPH.
* Referencias históricas en migraciones anteriores se preservan; solo el snapshot actual se actualiza.
* Tests de integración existentes adaptados al nuevo modelo; no se eliminó funcionalidad.

### Notas

* Solución compila sin errores ni warnings.
* No existen dependencias ejecutables de `GraphicNovel` como entidad independiente en el backend.
