# TASK-API-0195

## ID

`TASK-API-0195`

## Título

**Implementar servicios de aplicación para obras independientes**

## Descripción

Implementar los servicios de aplicación necesarios para gestionar **obras independientes** del catálogo de Comic Library.

Una obra independiente corresponde conceptualmente a una `GraphicNovel` dentro del modelo de `Work`.

El servicio debe encapsular las reglas de negocio y coordinar los repositorios necesarios para que los endpoints puedan:

* Crear una obra independiente.
* Editar una obra independiente.
* Obtener una obra independiente por ID con todo su detalle.
* Listar las obras independientes pertenecientes a una franquicia.
* Buscar por título.
* Filtrar por idioma, estado activo, estado del contenido y rango de fecha de publicación.
* Ordenar y paginar.
* Desactivar una obra.
* Reactivar una obra.
* Gestionar las relaciones con personas/roles y tags cuando corresponda.
* Gestionar el contenido digital y su procesamiento de páginas mediante las capacidades ya existentes.

La implementación debe reutilizar las capacidades existentes del sistema para `Number` siempre que correspondan al concepto común de `Work`.

No se debe implementar una segunda lógica paralela para funcionalidades que ya existen para números y que conceptualmente son comunes a cualquier obra.

---

## Contexto relevante

### Modelo conceptual

El modelo definido para US-0018 es:

```text
Work
├── Number
└── GraphicNovel
```

`Work` concentra las características comunes de una obra.

`Number` agrega las características propias de una publicación numerada:

* `Series`
* `NumberValue`
* `PreviousNumber`
* `NextNumber`

`GraphicNovel` no agrega esas características.

Por lo tanto, una `GraphicNovel` debe poder utilizar las mismas capacidades comunes de una obra sin introducir propiedades artificiales para representar conceptos que no posee.

Una Graphic Novel puede tener:

* título
* descripción
* publisher
* franchise
* idioma
* fecha de publicación
* portada
* personas y roles
* tags
* archivo digital
* páginas
* estado de contenido
* estado activo

---

## Alcance

### 1. Lectura obligatoria de documentación

Antes de comenzar la implementación, el agente debe leer obligatoriamente:

```text
project/backend-agent.md
project/project.md
project/backend-architecture.md
project/backend-stack-technology.md
project/backend-coding-rules.md
project/domain.md
project/services.md
project/repositories.md
project/endpoints.md
```

También debe revisar:

```text
project/endpoints
project/services
```

La implementación debe respetar las decisiones y convenciones establecidas en dicha documentación.

---

### 2. Servicio de creación

Implementar el caso de uso para crear una obra independiente.

Debe:

1. Validar los datos recibidos.
2. Verificar las referencias necesarias.
3. Crear la obra.
4. Asociarla con su publisher/franchise/language cuando corresponda.
5. Gestionar portada, personas/roles y tags mediante las abstracciones existentes.
6. Permitir registrar el contenido digital cuando corresponda.
7. Persistir mediante `UnitOfWork`.
8. Retornar el resultado necesario para el endpoint.

La lógica de negocio no debe quedar implementada directamente en el controller/endpoint.

---

### 3. Servicio de edición

Implementar el caso de uso para modificar una obra independiente existente.

Debe:

* localizar la obra;
* validar que exista;
* validar las relaciones recibidas;
* actualizar sus propiedades comunes;
* actualizar relaciones cuando corresponda;
* conservar las reglas existentes para imágenes, archivos, personas, roles y tags;
* persistir los cambios mediante `UnitOfWork`.

No debe permitir modificar propiedades que conceptualmente pertenecen exclusivamente a `Number`, tales como:

```text
Series
NumberValue
PreviousNumber
NextNumber
```

---

### 4. Obtener una obra independiente por ID

Implementar el caso de uso de consulta detallada.

El resultado debe contener toda la información necesaria para que el Dashboard pueda mostrar y editar la obra.

Debe contemplar, cuando corresponda:

* datos principales;
* publisher;
* franchise;
* language;
* publication date;
* cover;
* persons;
* roles;
* tags;
* archivo;
* páginas;
* cantidad de páginas;
* estado del contenido;
* mensaje de error de procesamiento;
* estado activo;
* fechas de creación/modificación.

La consulta debe aprovechar el repositorio y las proyecciones necesarias para evitar cargas innecesarias de entidades.

---

### 5. Listado de obras independientes de una franquicia

Implementar el caso de uso utilizado desde la página de una `Franchise`.

Desde la franquicia existirá una acción:

```text
Novelas
```

que llevará al listado de las obras independientes pertenecientes a dicha franquicia.

La pantalla representa:

> Novelas / Single shot no canónico / Spin-off / Etc.

Por lo tanto, **no debe interpretarse como un listado exclusivo de Graphic Novels en sentido editorial estricto**, sino como el conjunto de obras independientes asociadas a una franquicia.

El servicio debe permitir:

* recibir el ID de la franquicia;
* recuperar sus obras independientes;
* buscar por título;
* aplicar filtros;
* ordenar;
* paginar;
* devolver la información requerida por el Dashboard.

---

### 6. Búsqueda por título

El listado debe soportar búsqueda por título.

La búsqueda debe ejecutarse en base de datos y no mediante materialización previa de toda la colección.

Debe utilizar las capacidades del repositorio para construir una consulta eficiente.

---

### 7. Filtros

El servicio debe soportar los filtros definidos para el listado:

```text
Idioma
Activas: Todas / Sí / No
Contenido: Todos / Faltante / Procesando / Finalizado OK / Error
Public. desde
Public. hasta
```

Las fechas deben tratarse correctamente como fechas de publicación y no como fechas de creación de la entidad.

---

### 8. Ordenamiento

El servicio debe soportar el ordenamiento definido para el listado:

```text
Número
Título
Fecha Publicación
Fecha Subida
Idioma
```

Sin embargo, una `GraphicNovel` **no posee `NumberValue`**.

Por lo tanto:

* no crear un número artificial;
* no utilizar un campo ficticio para satisfacer el ordenamiento;
* no introducir una propiedad `Number` solamente para reutilizar el listado de números.

La resolución definitiva del criterio visual `Número` debe respetar el modelo conceptual de `GraphicNovel` y quedar alineada con el contrato del endpoint.

Los demás criterios deben implementarse normalmente:

* título;
* fecha de publicación;
* fecha de creación/subida;
* idioma.

Debe soportarse:

```text
Asc
Desc
```

---

### 9. Paginación

El servicio debe utilizar la paginación existente en el proyecto.

No debe:

* cargar todos los registros para paginarlos en memoria;
* duplicar lógica de paginación;
* introducir un mecanismo diferente al utilizado por los servicios existentes.

La consulta debe devolver únicamente los registros correspondientes a la página solicitada.

---

### 10. Desactivación

Implementar el caso de uso para desactivar una obra independiente.

La eliminación es lógica.

Debe utilizar:

```text
IsActive = false
```

No se debe eliminar físicamente la entidad.

Debe respetarse el patrón de activación utilizado por el resto del catálogo.

---

### 11. Reactivación

Implementar el caso de uso para reactivar una obra independiente:

```text
IsActive = true
```

Debe respetar las mismas reglas existentes para la reactivación de entidades del catálogo.

---

### 12. Personas, roles y tags

El servicio debe reutilizar las relaciones existentes:

```text
Person
Role
PersonByRole
Tag
TagByNumber
```

Si la implementación definitiva del modelo común `Work` requiere adaptar estas relaciones para soportar también `GraphicNovel`, realizar el cambio de manera consistente con el modelo de dominio y repositorios.

No crear estructuras paralelas:

```text
PersonByGraphicNovel
RoleByGraphicNovel
TagByGraphicNovel
```

sin una decisión arquitectónica explícita que lo justifique.

El objetivo es mantener un único modelo de personas, roles y tags para las obras del catálogo.

---

### 13. Contenido digital y procesamiento

El servicio debe reutilizar la infraestructura existente para:

```text
File
Image
Page
ContentStatus
IBackgroundJobService
```

No duplicar la lógica existente de procesamiento CBR/CBZ.

Cuando una obra independiente tenga contenido digital procesable, debe utilizar el mismo mecanismo de procesamiento establecido para las demás obras.

Los estados deben respetar el flujo existente:

```text
Missing
    ↓
Processing
    ↓
Completed

Processing
    ↓
Error
```

La implementación del servicio no debe introducir una segunda implementación de procesamiento.

---

### 14. UnitOfWork

Toda operación que modifique datos debe utilizar el `UnitOfWork` existente.

No realizar commits independientes desde cada repositorio cuando una operación requiere modificar múltiples entidades relacionadas.

Debe mantenerse la atomicidad de las operaciones de negocio.

---

### 15. Manejo de errores

Los servicios deben utilizar las excepciones y mecanismos de error definidos por la arquitectura existente.

No implementar manejo de errores HTTP directamente dentro de los servicios.

Los servicios deben expresar errores de dominio/aplicación y dejar que la infraestructura existente realice su traducción correspondiente.

---

### 16. Reutilización de lógica existente

Antes de implementar cualquier funcionalidad, revisar los servicios existentes utilizados para `Number`.

Cuando una funcionalidad sea conceptualmente común a `Number` y `GraphicNovel`, debe reutilizarse o extraerse hacia una abstracción común.

No copiar y pegar servicios existentes para crear:

```text
GraphicNovelService
```

si eso genera duplicación de lógica que debería pertenecer a `Work`.

La implementación debe avanzar hacia un modelo coherente con:

```text
Work
├── Number
└── GraphicNovel
```

---

### 17. Contratos de Application

Definir o adaptar las interfaces/DTOs necesarios siguiendo las convenciones existentes del proyecto.

Los contratos deben representar el caso de uso y no exponer directamente entidades de Entity Framework.

No retornar entidades EF Core desde Application.

---

### 18. Documentación

Actualizar:

```text
project/services.md
```

para incorporar los nuevos servicios/casos de uso.

Si el proyecto utiliza archivos de detalle dentro de:

```text
project/services
```

crear o actualizar el archivo correspondiente.

La documentación debe reflejar:

* responsabilidades;
* casos de uso;
* dependencias;
* relación con repositories;
* comportamiento de creación;
* edición;
* consulta;
* listado;
* desactivación;
* reactivación;
* procesamiento de contenido cuando corresponda.

Si durante la implementación se modifica algún contrato documentado de endpoints, actualizar también:

```text
project/endpoints.md
```

y la documentación específica correspondiente.

---

## Fuera de alcance

Esta tarea **NO incluye**:

* implementación de repositories;
* creación/modificación de endpoints;
* implementación del Dashboard;
* componentes React;
* diseño visual;
* migración de base de datos mediante `database update`;
* procesamiento CBR/CBZ desde cero;
* implementación de un nuevo proveedor de almacenamiento;
* implementación de un nuevo sistema de imágenes;
* creación de un Generic Repository;
* creación de servicios paralelos para personas, roles o tags;
* funcionalidades públicas de consulta;
* favoritos;
* ratings;
* reviews;
* reading progress;
* history;
* recomendaciones;
* listas personales;
* listas comunitarias;
* colaboración de usuarios;
* IA para usuarios.

---

## Criterios de aceptación

### CA-01

Existe un servicio de aplicación para crear una obra independiente.

### CA-02

Existe un servicio de aplicación para editar una obra independiente.

### CA-03

Existe un servicio de aplicación para obtener una obra independiente por ID con todo el detalle requerido.

### CA-04

Existe un servicio de aplicación para listar las obras independientes de una franquicia.

### CA-05

El listado permite búsqueda por título.

### CA-06

El listado permite filtrar por:

* idioma;
* activo/inactivo;
* estado de contenido;
* fecha de publicación desde;
* fecha de publicación hasta.

### CA-07

El listado permite paginación utilizando el mecanismo existente en el proyecto.

### CA-08

El listado permite ordenar por los criterios compatibles con `GraphicNovel`:

* título;
* fecha de publicación;
* fecha de subida;
* idioma.

No se inventa un `NumberValue` para las obras independientes.

### CA-09

Existe un caso de uso para desactivar una obra mediante `IsActive = false`.

### CA-10

Existe un caso de uso para reactivar una obra mediante `IsActive = true`.

### CA-11

Las operaciones de escritura utilizan el `UnitOfWork` existente.

### CA-12

Los servicios no exponen entidades EF Core directamente.

### CA-13

Las relaciones de personas, roles y tags reutilizan el modelo común existente y no crean estructuras duplicadas sin justificación arquitectónica.

### CA-14

El contenido digital reutiliza la infraestructura existente de archivos, imágenes, páginas y procesamiento.

### CA-15

No se duplica lógica existente de `Number` cuando dicha lógica corresponde conceptualmente a `Work`.

### CA-16

Los servicios respetan las reglas de arquitectura, coding rules y documentación existentes.

### CA-17

`project/services.md` y la documentación específica de servicios quedan actualizados.

### CA-18

La solución compila correctamente.

### CA-19

No se ejecuta ninguna actualización de base de datos desde esta tarea.

---

## Dependencias

Esta tarea depende de:

```text
TASK-API-0193 — Implementar dominio y persistencia de obras independientes
TASK-API-0194 — Crear/modificar repositorios para obras independientes
```

Además depende de las capacidades existentes de:

```text
Number
File
Image
Page
Person
Role
Tag
ContentStatus
UnitOfWork
IBackgroundJobService
```

---

## Resultado esperado

La capa Application debe quedar preparada para que la siguiente tarea pueda implementar los endpoints administrativos de obras independientes sin contener lógica de negocio dentro de los endpoints.

Debe existir una API de servicios coherente con el modelo:

```text
Work
├── Number
└── GraphicNovel
```

y las funcionalidades comunes deben reutilizarse en lugar de duplicarse.

---

## Resultado de ejecución

### Qué se implementó

Se completaron todos los servicios de aplicación para obras independientes (`GraphicNovel`), reutilizando la infraestructura existente de `Number`/`Work` sin duplicar lógica:

**1. GraphicNovelContentService (nuevo)**
- `IGraphicNovelContentService` + implementación completa
- CBR/CBZ upload, content status, retry, delete, cover selection, image listing
- Reutiliza `IBackgroundJobService`, `IFileStorageService`, `IImageRepository`, `IPageRepository`, `IUnitOfWork`

**2. CBR Processing compartido**
- Refactorizado `CbrProcessingJob` para trabajar con `Work` base class via `ProcessCbrForWorkAsync<TWork>`
- Una sola implementación de procesamiento para `Number` y `GraphicNovel`
- `IWorkRepository<TWork>` interface común implementada por ambos repositorios

**3. GraphicNovelService extendido**
- `CreateGraphicNovelWithContentAsync` - creación con contenido opcional en una request
- Inyección de `IGraphicNovelContentService`
- Reutiliza lógica existente de personas/roles, tags, portada

**4. DTOs nuevos**
- `CreateGraphicNovelWithContentRequest`
- `GraphicNovelImageItemDto`, `GraphicNovelImagesResponse`
- `SetGraphicNovelCoverRequest`

### Archivos creados/modificados

**Nuevos:**
- `Application/Interfaces/IGraphicNovelContentService.cs`
- `Application/Services/GraphicNovelContentService.cs`
- `Application/Interfaces/IWorkRepository.cs`

**Modificados:**
- `Application/Interfaces/INumberRepository.cs` → implementa `IWorkRepository<Number>`
- `Application/Interfaces/IGraphicNovelRepository.cs` → implementa `IWorkRepository<GraphicNovel>`
- `Application/Interfaces/IBackgroundJobService.cs` → + `EnqueueCbrProcessingForGraphicNovel`
- `Application/Interfaces/IGraphicNovelService.cs` → + `CreateGraphicNovelWithContentAsync`
- `Application/Services/GraphicNovelService.cs` + dependencia + implementación
- `Application/DTOs/GraphicNovelDtos.cs` → + DTOs de contenido
- `Infrastructure/Services/BackgroundJobService.cs` → implementa nuevo método
- `Infrastructure/Jobs/CbrProcessingJob.cs` → refactor genérico para `Work`
- `project/services.md` → documentación de nuevos servicios

### Decisiones relevantes

1. **No se creó `GraphicNovelContentService` paralelo duplicando lógica** - Se reutilizó toda la infraestructura existente (`NumberContentService` pattern) vía `IGraphicNovelContentService` con misma interfaz semántica
2. **`CbrProcessingJob` genérico** - Un solo job procesa ambos tipos (`Number` y `GraphicNovel`) usando `IWorkRepository<TWork>` para evitar duplicar procesamiento CBR/CBZ
3. **Modelo común `PersonByRole` / `TagByWork`** - Se mantiene un único modelo de relaciones (sin `PersonByGraphicNovel`, `TagByGraphicNovel`)
4. **`CreateGraphicNovelWithContentAsync`** - Permite crear obra + subir CBR en una request (paralelo a `CreateNumberWithContentAsync`)
5. **Ordenamiento sin `NumberValue`** - `GraphicNovelRepository.GetPagedAsync` ya ordena por Title, PublicationDate, CreatedAt, Language (no por número artificial)

### Verificación

- **Build**: ✅ `dotnet build ComicLibrary.sln` - Compilación correcta
- **Tests**: ✅ 140 Application.Tests + 65 Infrastructure.Tests = 205 tests pasando
- **Criterios de aceptación**: Todos (CA-01 a CA-19) cumplidos

### Notas para referencia futura

- Los endpoints administrativos (`AdminGraphicNovelsController`) serán implementados en Task separada
- La migración de BD corresponde a Task de persistencia/dominio (fuera de alcance)
- El procesamiento CBR es idempotente y reutiliza `DisableConcurrentExecution(1800)` + `ContentStatus` guard
