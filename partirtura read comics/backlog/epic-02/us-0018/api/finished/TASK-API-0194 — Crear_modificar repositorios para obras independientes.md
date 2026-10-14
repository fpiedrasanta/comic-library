# TASK-API-0194 — Crear_modificar repositorios para obras independientes

## ID

TASK-API-0194

## Título

Crear/modificar repositorios para obras independientes

## Descripción

Implementar y adaptar los repositorios necesarios para soportar la administración de **Novelas gráficas y otras obras independientes** definidas en US-0018.

Esta Task parte del modelo de dominio implementado en `TASK-API-0193` y debe adaptar la capa de repositorios para trabajar con la abstracción común de obras definida en el dominio.

El objetivo es que la capa de Application pueda posteriormente:

* Crear una obra independiente.
* Editar una obra independiente.
* Obtener una obra independiente por ID con todos sus detalles.
* Listar las obras independientes de una franquicia.
* Filtrar y ordenar las obras.
* Activar y desactivar obras.
* Reactivar obras.

La implementación debe reutilizar los repositorios existentes cuando sea correcto hacerlo y evitar duplicar consultas o lógica de acceso a datos.

Esta Task comprende únicamente:

* Interfaces de repositorios.
* Implementaciones de repositorios.
* Consultas Entity Framework necesarias.
* Adaptación de repositorios existentes cuando el nuevo modelo `Work` lo requiera.
* Actualización de `UnitOfWork`.
* Documentación de repositorios.

No implementar servicios de aplicación ni endpoints.

---

## Contexto relevante

* User Story: US-0018 — Administrar novelas gráficas
* Epic: EPIC-02 — Gestión del catálogo y contenido editorial
* Task anterior: TASK-API-0193 — Implementar dominio y persistencia de obras independientes

### Documentación obligatoria

Antes de realizar cualquier modificación, leer obligatoriamente:

1. `project/backend-agent.md`
2. `project/project.md`
3. `project/backend-architecture.md`
4. `project/backend-stack-technology.md`
5. `project/backend-coding-rules.md`
6. `project/domain.md`
7. `project/services.md`
8. `project/repositories.md`
9. `project/endpoints.md`

También revisar:

* `project/endpoints`
* `project/services`

La implementación debe respetar la documentación vigente.

---

# Alcance

## 1. Repository abstraction

Analizar el modelo resultante de `TASK-API-0193` y determinar qué operaciones deben exponerse mediante repositorios específicos.

Mantener el principio existente:

> Los repositorios representan acceso a persistencia y no contienen reglas de negocio propias de los servicios de aplicación.

No crear un repositorio genérico sobre Entity Framework para resolver el acceso a `Work`.

No introducir una abstracción genérica como:

```text
IRepository<T>
```

si no forma parte de la arquitectura existente.

Mantener repositorios específicos para las entidades que requieran operaciones específicas.

---

## 2. GraphicNovel Repository

Crear o adaptar el repositorio específico necesario para `GraphicNovel`, según la arquitectura resultante de `TASK-API-0193`.

Conceptualmente:

```text
IGraphicNovelRepository
        │
        └── EFGraphicNovelRepository
```

El nombre concreto debe respetar las convenciones existentes del proyecto.

El repositorio debe permitir las operaciones necesarias para que posteriormente Application pueda implementar:

* Existencia por ID.
* Obtención por ID.
* Alta.
* Modificación.
* Listado paginado.
* Activación.
* Desactivación.

No implementar estas operaciones como servicios dentro del repositorio.

---

## 3. Obtener Graphic Novel por ID

Implementar la consulta necesaria para obtener una obra independiente por su identificador.

La consulta debe poder recuperar toda la información necesaria para construir posteriormente el detalle de la obra.

Debe contemplar, según el modelo resultante:

```text
GraphicNovel
├── Publisher
├── Franchise
├── Language
├── Cover
├── Persons
│   └── Roles
├── Tags
├── File
├── Pages
└── ContentStatus
```

La consulta debe utilizar las relaciones existentes y no duplicar datos.

Debe evitarse realizar múltiples consultas innecesarias desde Application cuando una consulta del repositorio pueda recuperar correctamente el agregado requerido.

---

## 4. Listado de obras independientes

Implementar la consulta paginada necesaria para obtener las obras independientes asociadas a una `Franchise`.

La consulta debe permitir posteriormente soportar los filtros definidos por US-0018.

### Información de franquicia

El resultado debe permitir obtener la información necesaria para mostrar:

```text
Franchise
```

y la información editorial asociada cuando corresponda.

No duplicar información de `Publisher` almacenándola nuevamente en la obra.

---

## 5. Buscador

El repositorio debe permitir filtrar obras independientes por título.

La búsqueda debe realizarse sobre:

```text
Title
```

La comparación debe respetar las capacidades y convenciones de búsqueda existentes en el proyecto.

No implementar lógica de búsqueda en controllers.

No realizar filtrado posterior en memoria si puede resolverse correctamente mediante SQL/Entity Framework.

---

## 6. Filtro por idioma

El listado debe permitir filtrar por:

```text
LanguageId
```

El filtro debe ser opcional.

Cuando no se proporciona idioma, deben poder recuperarse obras de todos los idiomas.

---

## 7. Filtro por estado activo

El listado debe permitir filtrar:

```text
Todas
Sí
No
```

Conceptualmente:

```text
null → todas
true → activas
false → inactivas
```

No utilizar un filtro global de Entity Framework que impida obtener obras inactivas.

El repositorio debe permitir explícitamente consultar ambos estados.

---

## 8. Filtro por ContentStatus

El listado debe permitir filtrar por:

```text
Todos
Missing
Processing
Completed
Error
```

El repositorio debe trabajar con el enum `ContentStatus` existente.

No duplicar los valores del enum como strings.

---

## 9. Filtro por fecha de publicación

Implementar soporte para:

```text
PublicationDateFrom
PublicationDateTo
```

Los filtros deben ser opcionales.

La consulta debe permitir:

* Solo fecha desde.
* Solo fecha hasta.
* Ambas fechas.
* Ninguna fecha.

La comparación debe ejecutarse en base de datos.

---

## 10. Ordenamiento

El repositorio debe permitir ordenar el listado por los criterios definidos para US-0018:

* Número.
* Título.
* Fecha de publicación.
* Fecha de subida.
* Idioma.

### Particularidad

Las obras independientes no tienen `NumberValue`.

Por lo tanto:

```text
Ordenar por Número
```

debe interpretarse según el contrato que defina el endpoint/listado para este tipo de obra.

El repositorio no debe inventar un número editorial para `GraphicNovel`.

Si el modelo resultante determina que el criterio "Número" no es aplicable a una obra independiente, debe respetarse esa limitación y documentarse claramente para que Application/Endpoint pueda resolver el contrato correctamente.

No introducir un campo ficticio únicamente para satisfacer el ordenamiento de Numbers.

---

## 11. Dirección de orden

Soportar:

```text
Asc
Desc
```

El ordenamiento debe ejecutarse en base de datos.

Evitar:

```text
ToListAsync()
OrderBy(...)
```

cuando esto implique ordenar todo el conjunto en memoria.

La consulta debe mantener la paginación eficiente.

---

## 12. Paginación

El listado debe utilizar la estrategia de paginación existente en el proyecto.

Debe respetar las convenciones actuales de:

* Página.
* Tamaño de página.
* Total de registros.
* Resultados.

No crear una estrategia de paginación paralela.

---

## 13. Create

El repositorio debe permitir persistir una nueva obra independiente.

Debe poder almacenar las relaciones necesarias con:

* Publisher.
* Franchise.
* Language.
* Cover.
* Persons/Roles.
* Tags.

Las relaciones que requieran sincronización deberán respetar el patrón utilizado actualmente por los repositorios del proyecto.

El repositorio no debe:

* Validar reglas de negocio.
* Crear Tags por nombre.
* Resolver Personas por nombre.
* Determinar roles.
* Decidir si una obra puede ser creada.

Estas responsabilidades pertenecen a Application.

---

## 14. Update

El repositorio debe permitir modificar una obra independiente existente.

Debe poder actualizar las propiedades persistentes correspondientes.

No incorporar reglas de negocio en el repositorio.

La sincronización de relaciones será implementada posteriormente por Application/Services siguiendo el patrón existente para `Number`.

---

## 15. Activation / Deactivation

El repositorio debe permitir persistir los cambios de:

```text
IsActive
```

Debe respetarse el mecanismo de desactivación lógica existente.

No implementar:

```text
DELETE FROM ...
```

para eliminar una obra.

La eliminación conceptual de una obra independiente se realizará posteriormente mediante:

```text
IsActive = false
```

---

## 16. Person / Role relations

Adaptar los repositorios existentes, si es necesario, para que las relaciones de personas y roles puedan utilizarse tanto por `Number` como por `GraphicNovel`.

Debe evitarse crear:

```text
GraphicNovelPerson
GraphicNovelRole
```

si el modelo de `Work` permite reutilizar las relaciones existentes.

La consulta de detalle debe poder recuperar:

```text
Person
Role
```

asociados a la obra.

---

## 17. Tag relations

Adaptar el acceso a Tags cuando sea necesario para soportar la relación con obras independientes.

Debe reutilizarse la entidad `Tag`.

No crear:

```text
GraphicNovelTag
```

si el modelo común permite reutilizar la relación existente.

La consulta de detalle debe poder recuperar los Tags de la obra.

---

## 18. Pages

Adaptar el acceso a páginas si el modelo de `TASK-API-0193` generalizó `Page` para trabajar con `Work`.

Debe poder recuperarse:

* Identificador.
* Orden.
* Imagen.
* Referencia de almacenamiento.

La consulta debe mantener el orden natural de las páginas.

No implementar procesamiento de páginas en esta Task.

---

## 19. Content

Adaptar el acceso a:

* `File`.
* `Page`.
* `Image`.
* `ContentStatus`.

cuando el nuevo modelo lo requiera.

No implementar:

* Upload.
* CBR/CBZ processing.
* Hangfire.
* Conversión de imágenes.
* Retry.
* Delete physical content.

Estas capacidades pertenecen a Tasks posteriores.

---

## 20. UnitOfWork

Modificar `IUnitOfWork` y `EFUnitOfWork` cuando sea necesario para exponer los nuevos repositorios.

Debe respetarse el patrón existente.

Conceptualmente:

```text
IUnitOfWork
├── PublisherRepository
├── FranchiseRepository
├── SeriesRepository
├── NumberRepository
├── GraphicNovelRepository
├── PersonRepository
├── RoleRepository
└── TagRepository
```

La estructura concreta debe respetar el código vigente.

No convertir `EFUnitOfWork` en un contenedor genérico de repositorios.

Los repositorios deben ser específicos.

---

## 21. Consultas eficientes

Las consultas de listado deben ejecutarse de forma eficiente sobre MySQL.

Cuando corresponda:

* Utilizar `AsNoTracking()` para consultas de solo lectura.
* Ejecutar filtros antes de la paginación.
* Ejecutar ordenamiento antes de la paginación.
* Evitar materialización prematura.
* Evitar consultas N+1.
* Utilizar proyecciones cuando el patrón actual del proyecto las utilice.
* Utilizar `Include` únicamente cuando corresponda al patrón actual.

No modificar arbitrariamente las convenciones existentes.

---

## 22. Integridad

Los repositorios deben respetar las restricciones definidas en el dominio.

No deben permitir mediante operaciones de persistencia:

* Relaciones hacia obras inexistentes.
* Relaciones hacia entidades inexistentes.
* Relaciones duplicadas.
* Páginas duplicadas dentro de una obra.
* Asociaciones inválidas.

Las validaciones de negocio deben permanecer en Application.

La integridad referencial debe quedar respaldada por Entity Framework y la base de datos.

---

## 23. Documentación

Actualizar:

```text
project/repositories.md
```

La documentación debe reflejar:

* Nuevo repositorio de obras independientes.
* Operaciones disponibles.
* Relación con `Work`.
* Reutilización de repositorios existentes.
* Consultas de listado.
* Filtros.
* Ordenamiento.
* Paginación.
* Obtención de detalle.
* Integración con UnitOfWork.

No documentar servicios ni endpoints nuevos en esta Task.

---

## Fuera de alcance

Esta Task no implementa:

* Services.
* Controllers.
* Endpoints.
* DTOs de API.
* Validaciones de formularios.
* Autorización.
* CBR/CBZ.
* Hangfire.
* Procesamiento de imágenes.
* Upload de archivos.
* IA.
* Dashboard.
* UI.

Estas responsabilidades serán implementadas en Tasks posteriores.

---

## Criterios de aceptación

* [x] Existe el repositorio específico necesario para `GraphicNovel`.

* [x] El repositorio respeta la arquitectura existente.

* [x] No se introduce un Repository genérico sobre Entity Framework.

* [x] El repositorio permite obtener una Graphic Novel por ID.

* [x] El detalle puede recuperar la información necesaria de la obra y sus relaciones.

* [x] El repositorio permite listar obras independientes asociadas a una Franchise.

* [x] El listado soporta búsqueda por título.

* [x] El listado soporta filtro por Language.

* [x] El listado soporta filtro por `IsActive`: todas, activas e inactivas.

* [x] El listado soporta filtro por `ContentStatus`.

* [x] El listado soporta filtro por fecha de publicación desde.

* [x] El listado soporta filtro por fecha de publicación hasta.

* [x] El listado soporta paginación.

* [x] El listado soporta los criterios de ordenamiento aplicables.

* [x] El listado soporta Asc/Desc.

* [x] Los filtros, ordenamiento y paginación se ejecutan en base de datos.

* [x] Las consultas de solo lectura utilizan `AsNoTracking()` cuando corresponde.

* [x] No se introducen consultas N+1 evitables.

* [x] El repositorio permite persistir una nueva obra independiente.

* [x] El repositorio permite modificar una obra independiente.

* [x] El repositorio permite modificar `IsActive`.

* [x] La desactivación no realiza eliminación física.

* [x] Las relaciones con Publisher, Franchise y Language se soportan correctamente.

* [x] Las relaciones de Persons/Roles se reutilizan correctamente.

* [x] Las relaciones de Tags se reutilizan correctamente.

* [x] Las relaciones de Pages se reutilizan correctamente.

* [x] `IUnitOfWork` queda actualizado cuando corresponda.

* [x] `EFUnitOfWork` queda actualizado cuando corresponda.

* [x] `project/repositories.md` queda actualizado.

* [x] La solución compila correctamente.

* [x] No se implementan Services ni Endpoints.

---

## Dependencias

Esta Task depende de:

* TASK-API-0193 — Implementar dominio y persistencia de obras independientes.
* Publisher.
* Franchise.
* Series.
* Number.
* Language.
* Image.
* File.
* Page.
* Person.
* Role.
* PersonByRole.
* Tag.
* TagByWork.
* UnitOfWork existente.

---

## Resultado esperado

La capa de repositorios debe quedar preparada para que las Tasks posteriores puedan implementar la administración completa de obras independientes.

Debe ser posible acceder a una `GraphicNovel` y a su información relacionada, listar las obras de una franquicia aplicando filtros, ordenamiento y paginación, y persistir altas, modificaciones y cambios de estado.

La implementación debe reutilizar el modelo existente de catálogo y evitar duplicar repositorios, entidades o lógica de acceso a datos innecesariamente.

---

## Resultado de ejecución

### Qué se implementó

1. **IGraphicNovelRepository** (`Application/Interfaces/IGraphicNovelRepository.cs`):
   - `GetPagedAsync`: Listado paginado con filtros (búsqueda por título, franchiseId, isActive, languageId, contentStatus, fechas)
   - `GetByIdAsync`: Obtener por ID
   - `GetDetailByIdAsync`: Detalle completo con todas las relaciones (AsSplitQuery + AsNoTracking, 7 includes)
   - `AddAsync` / `UpdateAsync`: Persistencia

2. **GraphicNovelRepository** (`Infrastructure/Repositories/GraphicNovelRepository.cs`):
   - Implementación completa con ordenamiento por Title, PublicationDate, CreatedAt, Language
   - Carga de relaciones: Franchise→Publisher, Language, Cover, File, PersonByRoles, Tags, Pages
   - `AsNoTracking` para lecturas, `AsSplitQuery` para detalle

3. **IPageRepository actualizado** (`Application/Interfaces/IPageRepository.cs`):
   - `GetByWorkIdAsync` / `GetByNumberIdAsync` (compatibilidad)
   - `DeleteByWorkIdAsync` / `DeleteByNumberIdAsync` (compatibilidad)
   - Funciona con cualquier `Work` (Number o GraphicNovel)

4. **PageRepository actualizado** (`Infrastructure/Repositories/PageRepository.cs`):
   - Métodos delegados para compatibilidad hacia atrás

5. **IUnitOfWork actualizado** (`Application/Interfaces/IUnitOfWork.cs`):
   - Propiedades: `NumberRepository`, `GraphicNovelRepository`, `SeriesRepository`, `FranchiseRepository`, `PublisherRepository`, `PersonRepository`, `RoleRepository`, `TagRepository`, `LanguageRepository`, `ImageRepository`, `PageRepository`

6. **UnitOfWork implementación** (`Infrastructure/Repositories/UnitOfWork.cs`):
   - Lazy loading de repositorios

7. **Documentación** (`project/repositories.md`):
   - Nueva sección **GraphicNovelRepository**
   - Actualizada **PageRepository** (trabaja con Work)
   - Actualizada **UnitOfWork** (propiedades de repositorios)

### Archivos creados/modificados

**Nuevos:**
- `Application/Interfaces/IGraphicNovelRepository.cs`
- `Infrastructure/Repositories/GraphicNovelRepository.cs`

**Modificados:**
- `Application/Interfaces/IPageRepository.cs` (agregado GetByWorkIdAsync, DeleteByWorkIdAsync)
- `Application/Interfaces/IUnitOfWork.cs` (agregado GraphicNovelRepository, PageRepository)
- `Infrastructure/Repositories/PageRepository.cs` (compatibilidad Work + Number)
- `Infrastructure/Repositories/UnitOfWork.cs` (lazy loading de todos los repositorios)
- `project/repositories.md` (nueva sección GraphicNovelRepository, actualizadas PageRepository y UnitOfWork)

### Decisiones relevantes

- **Repositorio específico, no genérico**: `IGraphicNovelRepository` separado, no `IRepository<Work>`. Respeta arquitectura existente.
- **Filtro por FranchiseId obligatorio**: El listado requiere `franchiseId` (obras independientes pertenecen a franquicia).
- **Ordenamiento sin "Number"**: GraphicNovel no tiene NumberValue; ordenamiento por Title, PublicationDate, CreatedAt, Language. Documentado en repositorio.
- **Compatibilidad PageRepository**: Métodos `GetByNumberIdAsync`/`DeleteByNumberIdAsync` delegan a `GetByWorkIdAsync`/`DeleteByWorkIdAsync`.
- **UnitOfWork lazy loading**: Propiedades solo instancian repositorio al primer acceso, patrón existente.

### Pendiente para tasks posteriores

- Services (TASK-API-0195): GraphicNovelService, adaptación NumberRelationsService para GraphicNovel
- Controllers/Endpoints (TASK-API-0196): AdminGraphicNovelsController
- DTOs: CreateGraphicNovelRequest, UpdateGraphicNovelRequest, GraphicNovelDetailDto, GetGraphicNovelsRequest