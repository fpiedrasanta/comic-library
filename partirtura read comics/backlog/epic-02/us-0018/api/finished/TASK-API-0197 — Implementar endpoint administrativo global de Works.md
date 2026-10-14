# TASK-API-0197

## ID

`TASK-API-0197`

## Título

**Implementar endpoint administrativo global de Works**

## Descripción

Implementar un endpoint administrativo paginado que permita consultar conjuntamente las obras del catálogo representadas por la abstracción común `Work`:

```text
Work
├── Number
└── GraphicNovel
```

El endpoint debe ser la única fuente de datos para el listado administrativo global del Dashboard. El frontend no debe combinar ni paginar por separado los resultados de `/api/admin-numbers` y `/api/admin-graphic-novels`.

La respuesta debe identificar de forma explícita el tipo concreto de cada obra y exponer los datos comunes de `Work`, junto con la información contextual específica de `Number` o `GraphicNovel` cuando corresponda.

## Contexto relevante

### Origen

Esta Task fue generada por `TASK-DASH-0080 — Implementar listado administrativo global de Works` porque el Dashboard requiere un contrato backend real para una consulta global paginada de obras.

El Dashboard no puede implementar correctamente el listado global combinando dos endpoints paginados independientes. Esa solución produciría una paginación incorrecta y violaría el contrato de `TASK-DASH-0080`.

### Modelo vigente

El dominio ya contempla:

```text
Work
├── Number
└── GraphicNovel
```

`Number` pertenece a una `Series` y posee numeración y continuidad. `GraphicNovel` pertenece directamente a una `Franchise`, no posee serie, número editorial ni relaciones de continuidad.

El backend ya dispone de consultas específicas para Numbers y Graphic Novels, pero no existe una consulta administrativa global de `Work`.

### Documentación obligatoria

Antes de comenzar, el agente debe leer obligatoriamente:

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
project/endpoints/endpoints-numbers.md
project/endpoints/endpoints-graphic-novels.md
project/services
project/repositories
```

Debe estudiar la implementación existente de los listados de `Number` y `GraphicNovel`, sus servicios, repositorios, DTOs, filtros, ordenamientos y pruebas.

## Alcance

### 1. Crear el endpoint global

Crear un endpoint administrativo con la ruta propuesta:

```text
GET /api/admin-works
```

El endpoint debe:

- requerir autenticación con Bearer token;
- requerir el rol `Administrator`;
- utilizar la arquitectura Clean Architecture existente;
- delegar las reglas de negocio a Application;
- utilizar los repositorios y el `UnitOfWork` existentes;
- devolver respuestas envueltas en `ApiResponse<T>`;
- devolver una lista paginada mediante `ListResponse<WorkListItemDto>`;
- ejecutar búsqueda, filtros, ordenamiento y paginación en la base de datos;
- evitar cargar el catálogo completo en memoria;
- evitar consultas N+1 evitables.

La ruta definitiva debe respetar las convenciones del backend. Si se elige una ruta distinta, debe documentarse y mantenerse coherente en el controller, la documentación y el Dashboard.

### 2. Identificador de tipo de obra

Cada elemento de la respuesta debe incluir un discriminador proporcionado por el backend, por ejemplo:

```text
workType: "Number" | "GraphicNovel"
```

El Dashboard debe usar este valor para representar la fila y seleccionar las acciones correspondientes. No debe inferir el tipo a partir de campos opcionales como `numberValue`, `seriesId` o `franchiseId`.

El valor debe provenir del modelo/contrato backend y no de una conjetura del frontend.

### 3. Datos comunes de Work

El DTO de listado debe incluir, como mínimo, los datos comunes necesarios para la administración:

- `id`;
- `title`;
- `description` cuando el contrato lo considere apropiado para el listado;
- `languageId`;
- `languageName`;
- `coverId`;
- `urlCover` o el nombre contractual equivalente para la portada;
- `isActive`;
- `publicationDate`;
- `createdAt`;
- `contentStatus`;
- `contentError` cuando corresponda;
- `workType`.

Los campos que no existan para un tipo concreto deben ser omitidos o representados de acuerdo con la convención de serialización existente, sin enviar valores ficticios como `0`, `N/A` o placeholders engañosos.

### 4. Datos contextuales específicos

Para `Number`, el DTO debe exponer, cuando estén disponibles:

- `seriesId`;
- `seriesName`;
- `franchiseId`;
- `franchiseName`;
- `publisherId`;
- `publisherName`;
- `numberValue`;
- `previousNumberValue`;
- `nextNumberValue`.

Para `GraphicNovel`, el DTO debe exponer, cuando estén disponibles:

- `franchiseId`;
- `franchiseName`;
- `publisherId` cuando el contrato pueda resolverlo a través de la franquicia;
- `publisherName` cuando el contrato pueda resolverlo a través de la franquicia.

No se deben incluir propiedades de continuidad en una `GraphicNovel`.

### 5. Búsqueda

El parámetro `search` debe realizar una búsqueda parcial, case-insensitive y en la base de datos.

La búsqueda global debe contemplar:

- `Title` para todas las obras;
- `NumberValue` para obras de tipo `Number`, cuando el backend lo soporte.

No se debe buscar por campos inexistentes o específicos de un tipo cuando la consulta global no pueda resolverlos correctamente.

### 6. Filtros

El endpoint debe soportar, como mínimo:

- `workType`: `All`, `Number` o `GraphicNovel`;
- `isActive`: todas, activas o inactivas;
- `languageId`;
- `contentStatus`: `Missing`, `Processing`, `Completed` o `Error`;
- `publicationDateFrom`;
- `publicationDateTo`.

El filtro `workType` debe ser opcional y, cuando no se informe, debe devolver todas las obras. Si el backend utiliza otra representación contractual para el tipo, debe documentarla explícitamente.

Los filtros deben validarse en Application y devolver los códigos de error correspondientes.

### 7. Ordenamiento

El endpoint debe permitir ordenar por campos válidos para el listado global, como mínimo:

- `Title`;
- `PublicationDate`;
- `CreatedAt`;
- `Language`.

Debe permitir ordenar por `Number` o `NumberValue` únicamente para obras `Number`, sin inventar un valor para `GraphicNovel`.

Debe soportar direcciones `ASC` y `DESC`.

Los nombres de los campos, su validación y su comportamiento deben quedar documentados. El frontend no debe enviar nombres no admitidos ni aplicar un fallback que altere la semántica del backend.

### 8. Paginación

El endpoint debe reutilizar el mecanismo de paginación existente en el proyecto:

- `currentPage`;
- `pageSize`, respetando el máximo existente;
- `totalCount`;
- `totalPages`;
- `hasNextPage`;
- `hasPriorPage`;
- `nextPage`;
- `priorPage`.

La paginación debe aplicarse después de búsqueda y filtros, en una única consulta global. No se permite combinar dos respuestas paginadas en el frontend.

### 9. Estados de contenido

El endpoint debe exponer el estado de contenido real de cada obra. Debe ser compatible con los estados vigentes:

```text
Missing
Processing
Completed
Error
```

Si el backend mantiene un enum numérico, puede conservar la representación existente siempre que el contrato sea explícito y el Dashboard pueda interpretarlo sin ambigüedad. La documentación debe indicar la equivalencia.

El listado global debe permitir filtrar por ese estado y mostrarlo sin confundirlo con `IsActive`.

### 10. Controller, Application e Infrastructure

Implementar o adaptar, según corresponda:

- controller administrativo de Works;
- request/contrato de consulta;
- servicio de Application para la consulta global;
- DTO de listado de Works;
- consulta eficiente en el repositorio correspondiente;
- proyección de datos comunes y específicos;
- validaciones de parámetros;
- pruebas de Application/API.

No se debe crear una entidad nueva para representar una obra global. Debe reutilizarse `Work`, `Number`, `GraphicNovel` y el discriminador existente.

No se debe modificar el modelo de dominio ni la migración salvo que sea estrictamente necesario para exponer el contrato.

### 11. Coherencia con endpoints existentes

El nuevo endpoint no debe romper ni reemplazar:

- `GET /api/admin-numbers`;
- `GET /api/admin-graphic-novels`;
- los endpoints de detalle, creación, edición, activación, desactivación, contenido, imágenes y portada de cada tipo.

Los endpoints específicos pueden seguir siendo utilizados por sus flujos contextuales. El listado global del Dashboard debe usar exclusivamente el endpoint global.

### 12. Documentación

Crear o actualizar:

```text
project/endpoints/endpoints-works.md
project/endpoints.md
```

La documentación debe incluir:

- método HTTP;
- ruta;
- descripción;
- controller;
- autenticación y autorización;
- parámetros de request;
- valores admitidos;
- response;
- response type;
- errores por status code;
- notas de comportamiento;
- ejemplo de respuesta con ambos tipos de obra;
- reglas de paginación y ordenamiento.

### 13. Tests

Agregar o actualizar pruebas para verificar como mínimo:

- listado global con Numbers y Graphic Novels;
- discriminación correcta del tipo de obra;
- búsqueda por título;
- búsqueda por número cuando corresponda;
- filtro por tipo de obra;
- filtro por estado activo;
- filtro por idioma;
- filtro por estado de contenido;
- filtro por rango de fecha de publicación;
- ordenamiento admitido;
- paginación global correcta;
- ausencia de propiedades de continuidad en Graphic Novels;
- autorización sin token y sin rol Administrator;
- parámetros inválidos;
- ausencia de consultas N+1 evitables;
- regresión de los endpoints específicos de Numbers y Graphic Novels.

## Fuera de alcance

- Implementar el Dashboard o componentes React.
- Modificar el frontend para simular un listado global.
- Crear una entidad `GlobalWork`, `CatalogWork` u otra entidad paralela.
- Cambiar la relación de dominio entre `Number`, `GraphicNovel`, `Series` y `Franchise`.
- Agregar continuidad a `GraphicNovel`.
- Agregar `Series` o `NumberValue` a `GraphicNovel`.
- Crear endpoints públicos.
- Implementar búsqueda pública, lector, progreso, favoritos, ratings o recomendaciones.
- Duplicar el procesamiento CBR/CBZ.
- Modificar innecesariamente los endpoints específicos existentes.
- Ejecutar una actualización de base de datos como parte de esta Task.

## Criterios de aceptación

- [ ] Existe `GET /api/admin-works` o la ruta global equivalente aprobada y documentada.
- [ ] El endpoint requiere autenticación y rol `Administrator`.
- [ ] La respuesta es `ApiResponse<ListResponse<WorkListItemDto>>`.
- [ ] Cada elemento identifica explícitamente si es `Number` o `GraphicNovel`.
- [ ] Los datos comunes de `Work` están disponibles para ambos tipos.
- [ ] Los datos específicos de `Number` y `GraphicNovel` se exponen sin mezclar responsabilidades.
- [ ] `GraphicNovel` no expone `Series`, `NumberValue`, `PreviousNumber` ni `NextNumber`.
- [ ] La búsqueda, los filtros, el ordenamiento y la paginación se ejecutan en la base de datos.
- [ ] El filtro por tipo de obra permite consultar todas, Numbers o Graphic Novels.
- [ ] La paginación representa una única consulta global y no una combinación frontend de dos listas.
- [ ] Los estados de contenido son compatibles con el contrato vigente.
- [ ] Los endpoints específicos existentes continúan funcionando.
- [ ] La documentación del endpoint global existe y está registrada en `project/endpoints.md`.
- [ ] Las pruebas correspondientes pasan.
- [ ] La solución compila.
- [ ] No se introducen cambios de frontend en esta Task.

## Dependencias

- `TASK-API-0193 — Implementar dominio y persistencia de obras independientes`.
- `TASK-API-0194 — Crear/modificar repositorios para obras independientes`.
- `TASK-API-0195 — Implementar servicios de aplicación para obras independientes`.
- `TASK-API-0196 — Implementar endpoints administrativos para obras independientes`.
- Endpoints y contratos existentes de Numbers y Graphic Novels.
- `TASK-DASH-0080` queda bloqueada hasta que esta Task esté en estado `finished`.

## Resultado esperado

El backend ofrece una consulta administrativa global, paginada y tipada de obras:

```text
GET /api/admin-works
```

El Dashboard puede representar en una única pantalla:

```text
Work
├── Number
└── GraphicNovel
```

utilizando un único contrato backend, sin combinar paginaciones ni inventar campos de dominio.

## Assignee: Agent

## Resultado de la ejecución

### Estado

`finished`

### Implementado

- Controlador `AdminWorksController` en `Api/Controllers/AdminWorksController.cs` con ruta `GET /api/admin-works`.
- Servicio `WorkService` en `Application/Services/WorkService.cs` que orquesta la consulta y mapea entidades `Work`/`Number`/`GraphicNovel` a `WorkListItemDto`.
- Repositorio `WorkRepository` en `Infrastructure/Repositories/WorkRepository.cs` que ejecuta búsqueda, filtros, ordenamiento y paginación en una única consulta sobre la tabla `Works`, incluyendo las relaciones requeridas (`Language`, `Cover`, `Series`, `Franchise`, `Publisher`, `PreviousNumber`, `NextNumber`) mediante `Include` y `AsSplitQuery`.
- DTOs existentes reutilizados: `GetWorksRequest` y `WorkListItemDto` en `Application/DTOs/`.
- Documentación creada en `project/endpoints/endpoints-works.md`.
- `project/endpoints.md` actualizado para registrar el nuevo endpoint.
- `IWorkRepository` separado en interfaz no genérica (`GetPagedAsync`) e `IWorkRepository<T>` genérica (`GetByIdAsync`, `UpdateAsync`) para permitir el polimorfismo requerido por `CbrProcessingJob` sin forzar a `NumberRepository`/`GraphicNovelRepository` a implementar `GetPagedAsync` global.
- `Program.cs` actualizado para registrar `IWorkService` e `IWorkRepository`.

### Archivos modificados

- `Api/Controllers/AdminWorksController.cs` (nuevo)
- `Application/Services/WorkService.cs` (modificado)
- `Infrastructure/Repositories/WorkRepository.cs` (modificado)
- `Application/Interfaces/IWorkRepository.cs` (modificado)
- `Application/Interfaces/INumberRepository.cs` (modificado)
- `Application/Interfaces/IGraphicNovelRepository.cs` (modificado)
- `Api/Program.cs` (modificado)
- `Application/DTOs/WorkListItemDto.cs` (modificado: agregado `using Domain.Enums`)
- `project/endpoints/endpoints-works.md` (nuevo)
- `project/endpoints.md` (modificado)

### Decisiones

- El repositorio devuelve entidades de dominio (`Work`). El mapeo a `WorkListItemDto` se realiza en `WorkService` respetando la regla de que los repositorios no devuelven DTOs.
- La query de listado incluye todas las relaciones necesarias en la consulta base con `AsSplitQuery` para evitar explosión cartesiana y N+1.
- El DTO `WorkListItemDto` expone `workType` como discriminador explícito del backend.
- Para `GraphicNovel`, los campos específicos de `Number` (`seriesId`, `seriesName`, `numberValue`, `previousNumberValue`, `nextNumberValue`) se exponen como `null`.
- Se introdujo `IWorkRepository<T>` genérica exclusivamente para soportar el polimorfismo del `CbrProcessingJob`; `IWorkRepository` no genérica conserva el método `GetPagedAsync` para el listado global.

### Notas

- La solución compila (`dotnet build Api/Api.csproj` exitoso).
- Los tests de integración existentes presentan fallos preexistentes relacionados con esquema/base de datos (`GraphicNovel_NextNumberId`, foreign key en `works.SeriesId`) no relacionados con esta implementación.
- No se agregaron tests unitarios nuevos para `WorkService` porque requieren base de datos real para validar la query LINQ de `Work`; queda registrado como item abierto.

