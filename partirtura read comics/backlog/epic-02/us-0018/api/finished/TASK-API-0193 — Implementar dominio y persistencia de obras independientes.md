# TASK-API-0193 — Implementar dominio y persistencia de obras independientes

## ID

TASK-API-0193

## Título

Implementar dominio y persistencia de obras independientes

## Descripción

Implementar el modelo de dominio y la persistencia necesaria para administrar **Novelas gráficas y otras obras independientes** dentro del catálogo.

La implementación debe corregir y evolucionar el modelo actual de `Number` para identificar y reutilizar las características comunes de una obra del catálogo.

Conceptualmente, el modelo debe representar:

```text
Work
├── Number
└── GraphicNovel
```

`Work` representa las características comunes de una obra.

`Number` representa una obra perteneciente a una `Series` y agrega las características específicas de continuidad editorial.

`GraphicNovel` representa una obra independiente y no pertenece a una `Series`, pertenece a una Franquicia.

La `GraphicNovel` debe reutilizar las capacidades comunes de `Number` en lugar de duplicarlas.

La implementación concreta de la abstracción (`Work`) y su estrategia de persistencia debe respetar la arquitectura vigente del proyecto. No asumir una estrategia de herencia de Entity Framework si la arquitectura existente determina una alternativa más apropiada.

La Task comprende únicamente:

* Modelo de dominio.
* Relaciones entre entidades.
* Configuraciones de Entity Framework.
* Persistencia.
* Migración de base de datos.

La migración debe ser creada mediante `dotnet ef migrations add`.

**NO ejecutar `dotnet ef database update`.**

La implementación de repositorios, servicios y endpoints será realizada en Tasks posteriores.

---

## Contexto relevante

* User Story: US-0018 — Administrar novelas gráficas
* Epic: EPIC-02 — Gestión del catálogo y contenido editorial
* Dependencias:

  * US-0014 — Administrar editoriales
  * US-0015 — Administrar franquicias
  * US-0016 — Administrar series
  * US-0017 — Administrar números

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

La implementación debe respetar la documentación vigente y actualizarla cuando corresponda.

---

# Alcance

## 1. Modelo conceptual de Work

Introducir una abstracción de dominio que represente las características comunes de las obras del catálogo.

Conceptualmente:

```text
                     WORK
                      │
           ┌──────────┴──────────┐
           │                     │
        NUMBER              GRAPHIC NOVEL
           │
      ┌────┼─────┐
      │    │     │
   SERIES  #   CONTINUITY
```

La abstracción común debe contemplar las características compartidas por las obras:

* `Id`
* `Title`
* `Description`
* `Language`
* `PublicationDate`
* `Cover`
* `Persons/Roles`
* `Tags`
* `Content`
* `Pages`
* `IsActive`
* `ContentStatus`
* Información de error de procesamiento cuando corresponda
* Información de auditoría común

La implementación debe reutilizar las entidades y relaciones existentes siempre que conceptualmente representen la misma información.

No crear entidades duplicadas para:

* Personas.
* Roles.
* Tags.
* Imágenes.
* Archivos.
* Páginas.
* Idiomas.
* Editoriales.
* Relaciones de personas y roles.
* Relaciones de tags.

---

## 2. Entidad GraphicNovel

Crear la entidad `GraphicNovel`.

La entidad debe representar una obra independiente del catálogo.

Debe disponer de las características comunes de una `Work`.

Como mínimo debe poder representar:

* Identificador.
* Título.
* Descripción.
* Franquicia.
* Idioma.
* Fecha de publicación.
* Portada.
* Personas y roles.
* Tags.
* Archivo digital.
* Páginas.
* Estado del contenido.
* Mensaje de error de procesamiento.
* Estado activo/inactivo.
* Auditoría.

### Características específicas

Una `GraphicNovel`:

* **NO tiene `SeriesId`.**
* **NO tiene `NumberValue`.**
* **NO tiene `PreviousNumberId`.**
* **NO tiene `NextNumberId`.**
* **NO participa en la continuidad de Numbers.**

No deben crearse valores artificiales o ficticios para representar estas propiedades.

Por ejemplo, no debe utilizarse:

```text
Series = "Independent"
NumberValue = "0"
```

para poder almacenar una Graphic Novel.

La independencia de la obra debe estar representada por el modelo de dominio.

---

## 3. Modificación de Number

Modificar la entidad `Number` actual cuando sea necesario para introducir correctamente la abstracción común.

`Number` debe continuar representando:

* `SeriesId`
* `Series`
* `NumberValue`
* `PreviousNumberId`
* `NextNumberId`

y las demás características específicas de los números.

Conceptualmente:

```text
Number
├── Work common data
├── Series
├── NumberValue
├── PreviousNumber
└── NextNumber
```

Las características comunes no deben quedar duplicadas entre `Number` y `GraphicNovel`.

Si para introducir correctamente `Work` es necesario modificar la estructura actual de `Number`, realizar dicha modificación en esta Task.

**No crear una segunda implementación paralela de las capacidades existentes de Number simplemente para evitar modificar Number.**

---

## 4. Franchise

Las obras deben poder estar asociadas a una `Franchise`.

La Franquicia debe reutilizar la entidad `Franchise` existente.

No crear:

```text
GraphicNovelFranchise
```

ni ninguna entidad equivalente específica para Graphic Novels.

La Franquicia de una obra independiente debe ser una relación directa con la obra común cuando el modelo lo requiera.

En el caso de `Number`, debe conservarse la regla existente:

```text
Number
   ↓
Series
   ↓
Franchise
```

No agregar `FranchiseId` a `Number` si no es necesario para el modelo común definido.

La implementación debe evitar duplicar la información de Franquicia.

---

## 5. Language

`GraphicNovel` debe referenciar la entidad `Language` existente.

La relación debe ser equivalente conceptualmente a la utilizada por `Number`.

El idioma es obligatorio para una obra.

No crear una entidad de idioma específica para Graphic Novels.

---

## 6. Cover

La obra debe poder tener una portada mediante el modelo existente de `Image`.

La portada debe reutilizar:

```text
Image
```

y el mecanismo existente de asociación de portada.

No agregar:

```text
Image.IsCover
```

ni:

```text
Image.OwnerEntityType
Image.OwnerEntityId
```

ni ninguna forma de ownership polimórfico que no exista en el modelo vigente.

La portada pertenece conceptualmente a la obra mediante la relación definida por el modelo de persistencia.

Debe conservarse la regla vigente:

* `Image` no tiene `IsActive`.
* `Image` no tiene un flag `Cover`.
* El tipo de imagen se determina mediante `ImageType`.

---

## 7. Personas y Roles

Las obras independientes deben poder tener participantes mediante el modelo existente de personas y roles.

Debe reutilizarse el modelo existente de:

```text
Person
Role
PersonByRole
```

No crear:

```text
PersonByGraphicNovel
GraphicNovelRole
```

ni entidades equivalentes duplicadas.

Debe mantenerse la capacidad de representar:

* Una persona con múltiples roles en una obra.
* Múltiples personas con el mismo rol.
* Una persona participando en múltiples obras.

Si la abstracción `Work` requiere generalizar `PersonByRole` para permitir su utilización tanto por `Number` como por `GraphicNovel`, realizar dicha modificación en esta Task.

La integridad de las relaciones debe mantenerse.

---

## 8. Tags

Las obras independientes deben poder utilizar el modelo existente de tags.

Debe reutilizarse:

```text
Tag
```

y la relación correspondiente.

No crear:

```text
TagByGraphicNovel
```

si la relación común puede reutilizarse mediante el modelo de `Work`.

Debe mantenerse:

* Una obra puede tener múltiples tags.
* Un tag puede utilizarse en múltiples obras.
* No se pueden duplicar relaciones conceptualmente iguales.

Si `TagByNumber` debe ser generalizado para representar una relación con `Work`, realizar dicha modificación en esta Task.

---

## 9. Digital Content

Una `GraphicNovel` debe soportar contenido digital mediante las mismas capacidades existentes para `Number`.

Debe poder representar:

* Archivo digital.
* Cantidad de páginas.
* Estado del contenido.
* Mensaje de error.
* Páginas procesadas.

Debe reutilizarse la infraestructura conceptual existente.

No implementar en esta Task:

* Upload API.
* Procesamiento CBR/CBZ.
* Hangfire Jobs.
* Conversión de imágenes.
* Procesamiento de páginas.

Esas capacidades serán adaptadas posteriormente para trabajar con el nuevo modelo común.

---

## 10. Pages

Las páginas deben poder pertenecer a una obra.

El modelo actual de `Page` referencia directamente a `Number`.

Si la nueva abstracción `Work` requiere modificar esta relación para permitir que una página pertenezca tanto a un `Number` como a una `GraphicNovel`, realizar la modificación en esta Task.

Conceptualmente:

```text
Work
 │
 └── Pages
       ├── Page 1
       ├── Page 2
       └── Page N
```

Las páginas deben conservar:

* Orden.
* Imagen asociada.
* Integridad referencial.
* Unicidad del orden dentro de una obra.

Debe evitarse crear una segunda entidad de página específica para Graphic Novels.

---

## 11. ContentStatus

El estado del contenido debe continuar utilizando el enum existente:

```text
ContentStatus
```

con los valores:

```text
Missing = 0
Processing = 1
Completed = 2
Error = 3
```

El estado del contenido es independiente de `IsActive`.

Una obra puede estar:

```text
IsActive = true
ContentStatus = Missing
```

o:

```text
IsActive = false
ContentStatus = Completed
```

No modificar esta regla.

---

## 12. IsActive

`GraphicNovel` debe soportar activación y desactivación lógica mediante:

```text
IsActive
```

No introducir:

```text
DeletedAt
```

ni otro mecanismo paralelo de soft-delete.

La eliminación física de la obra no forma parte de esta Task.

---

## 13. Relaciones de GraphicNovel

Conceptualmente, una obra independiente debe quedar relacionada de la siguiente forma:

```text
GraphicNovel
│
├── Franchise
├── Language
├── Cover
├── Persons / Roles
├── Tags
├── File
├── Pages
└── ContentStatus
```

Y **no** debe tener:

```text
Series
NumberValue
PreviousNumber
NextNumber
```

---

## 14. Continuidad

Las relaciones:

```text
PreviousNumberId
NextNumberId
```

son características exclusivas de `Number`.

Una `GraphicNovel` no debe participar en la continuidad de números.

No deben crearse:

```text
PreviousGraphicNovelId
NextGraphicNovelId
```

ni ninguna relación equivalente.

La continuidad continuará siendo responsabilidad de los Numbers.

---

## 15. Franquicia

Una `GraphicNovel` debe poder asociarse conceptualmente a una `Franchise`.

La franquicia representa el agrupamiento editorial al que pertenece la obra independiente.

La relación debe evitar duplicar información de Franchise.

Conceptualmente:

```text
GraphicNovel
      │
      └── Franchise
             │
             └── Publisher
```

No crear una entidad de franquicia específica para Graphic Novels.

---

## 16. Configuración de Entity Framework

Implementar o modificar las configuraciones necesarias mediante el patrón utilizado actualmente por el proyecto.

Configurar correctamente:

* Claves primarias.
* Claves foráneas.
* Relaciones.
* Relaciones opcionales.
* Campos obligatorios.
* Longitudes.
* Índices.
* Restricciones de unicidad.
* Comportamiento de eliminación.
* Herencia/composición si corresponde.

La estrategia de persistencia de `Work`, `Number` y `GraphicNovel` debe ser coherente con:

```text
project/backend-architecture.md
```

y con las convenciones existentes del proyecto.

No introducir una estrategia de persistencia arbitraria únicamente para resolver esta Task.

---

## 17. Integridad

La persistencia debe impedir:

* Una Graphic Novel sin título.
* Una Graphic Novel sin idioma.
* Una referencia inválida a Franchise.
* Una referencia inválida a Language.
* Una referencia inválida a Cover.
* Relaciones duplicadas de personas y roles.
* Relaciones duplicadas de tags.
* Páginas asociadas a una obra inexistente.
* Órdenes de página duplicados dentro de una obra.

La persistencia debe permitir:

* Graphic Novels sin Series.
* Graphic Novels sin NumberValue.
* Graphic Novels sin Previous.
* Graphic Novels sin Next.
* Graphic Novels sin contenido digital todavía procesado.

---

## 18. Persistencia

Implementar los cambios necesarios en Persistence para que el modelo pueda almacenar:

* Works.
* Numbers.
* Graphic Novels.
* Relaciones comunes.
* Páginas.
* Contenido digital.
* Portadas.
* Personas/Roles.
* Tags.

Reutilizar las entidades existentes cuando representen correctamente el concepto.

No crear modelos paralelos para evitar refactorizar código existente.

---

## 19. Migración

Crear una nueva migración mediante:

```text
dotnet ef migrations add <MigrationName>
```

El nombre concreto debe respetar la convención utilizada por el proyecto.

La migración debe reflejar correctamente la evolución del modelo.

Debe incluir, según corresponda:

* Nuevas tablas.
* Nuevas columnas.
* Modificación de columnas existentes.
* Nuevas claves foráneas.
* Eliminación de relaciones que hayan quedado obsoletas.
* Índices.
* Restricciones de unicidad.
* Cambios necesarios para `Work`, `Number` y `GraphicNovel`.

### Importante

**Crear la migración pero NO ejecutarla contra la base de datos.**

No ejecutar:

```text
dotnet ef database update
```

La base de datos será actualizada en una etapa posterior y controlada.

---

## 20. Documentación

Actualizar:

```text
project/domain.md
```

La documentación debe reflejar el modelo resultante y eliminar cualquier descripción que haya quedado obsoleta.

Debe documentarse claramente:

```text
Work
├── Number
└── GraphicNovel
```

y las diferencias entre ambos.

En particular, `domain.md` debe dejar explícito que:

### Work

Contiene las características comunes de una obra.

### Number

Además de las características comunes, posee:

* Series.
* NumberValue.
* PreviousNumber.
* NextNumber.

### GraphicNovel

Es una obra independiente y no posee:

* Series.
* NumberValue.
* PreviousNumber.
* NextNumber.

La documentación no debe afirmar una estrategia concreta de herencia de Entity Framework si dicha decisión corresponde a la implementación arquitectónica.

---

## 21. Fuera de alcance

Esta Task no implementa:

* Repositorios.
* Services.
* Controllers.
* Endpoints.
* Listado administrativo.
* Alta mediante API.
* Edición mediante API.
* Detalle mediante API.
* Activación mediante API.
* Desactivación mediante API.
* Procesamiento CBR/CBZ.
* Jobs de Hangfire.
* Upload de contenido.
* Procesamiento de páginas.
* Selección de portada mediante API.
* Análisis mediante IA.
* Generación de descripción mediante IA.
* Sugerencia de Tags mediante IA.
* Cambios en el Dashboard.

Estas capacidades serán implementadas en Tasks posteriores.

---

## Criterios de aceptación

* [x] Se introduce una abstracción de dominio para representar las características comunes de las obras.

* [x] El modelo permite representar conceptualmente `Work → Number` y `Work → GraphicNovel`.

* [x] Existe una entidad/modelo persistente para `GraphicNovel`.

* [x] `GraphicNovel` posee las características comunes de una obra.

* [x] `GraphicNovel` no requiere `Series`.

* [x] `GraphicNovel` no requiere `NumberValue`.

* [x] `GraphicNovel` no posee `PreviousNumberId`.

* [x] `GraphicNovel` no posee `NextNumberId`.

* [x] `Number` conserva sus características específicas de Series, NumberValue y continuidad.

* [x] Las características comunes no se duplican entre `Number` y `GraphicNovel`.

* [x] Franchise puede asociarse correctamente a una obra independiente.

* [x] Language puede asociarse correctamente a una obra independiente.

* [x] Cover reutiliza el modelo existente de `Image`.

* [x] Persons/Roles reutilizan el modelo existente.

* [x] Tags reutilizan el modelo existente.

* [x] Pages pueden representar correctamente páginas de una obra independiente.

* [x] El estado de contenido utiliza `ContentStatus`.

* [x] `IsActive` continúa siendo el mecanismo de desactivación lógica.

* [x] Graphic Novel no participa en continuidad de Numbers.

* [x] Las relaciones existentes de Number continúan funcionando correctamente.

* [x] No se crean entidades duplicadas innecesarias para Persons, Roles, Tags, Images, Files o Pages.

* [x] Las configuraciones de Entity Framework reflejan correctamente el nuevo modelo.

* [x] Las relaciones y restricciones de integridad están correctamente configuradas.

* [x] La solución compila correctamente.

* [x] La migración se crea correctamente mediante `dotnet ef migrations add`.

* [x] **No se ejecuta `dotnet ef database update`.**

* [x] `project/domain.md` queda actualizado con el modelo resultante.

* [x] No se implementan repositorios, servicios ni endpoints en esta Task.

---

## Dependencias

Esta Task depende de las entidades y persistencia existentes de:

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
* TagByNumber.
* ContentStatus.

---

## Resultado esperado

El backend debe disponer de un modelo de dominio y persistencia capaz de representar correctamente las obras del catálogo mediante una estructura común:

```text
                     WORK
                      │
           ┌──────────┴──────────┐
           │                     │
        NUMBER              GRAPHIC NOVEL
           │
      ┌────┼─────┐
      │    │     │
   SERIES  #   CONTINUITY
```

`Number` y `GraphicNovel` deben compartir las características comunes de una obra sin duplicar lógica ni entidades.

`GraphicNovel` debe poder existir independientemente de cualquier `Series` y sin utilizar números ficticios para representar su existencia.

La migración debe quedar **creada pero no aplicada** a la base de datos.

La documentación `project/domain.md` debe reflejar fielmente el nuevo modelo.

---

## Resultado de ejecución

### Qué se implementó

1. **Entidad base abstracta `Work`** (`Domain/Entities/Work.cs`): Contiene todas las características comunes:
   - Identity (Id, Title, Description, IsActive, CreatedAt)
   - Editorial (Language, PublicationDate, Cover, File)
   - Content (ContentStatus, ContentErrorMessage)
   - Relaciones: PersonByRoles, Tags, Pages
   - Herencia TPH con discriminador `WorkType`

2. **Entidad `Number` refactorizada** (`Domain/Entities/Number.cs`): Hereda de `Work`, agrega:
   - `NumberValue` (string)
   - `Series` (FK requerido)
   - `PreviousNumber` / `NextNumber` (continuidad)

3. **Entidad `GraphicNovel`** (`Domain/Entities/GraphicNovel.cs`): Hereda de `Work`, agrega:
   - `Franchise` (FK requerido)
   - Sin Series, NumberValue, Previous/Next

4. **Entidades de relación generalizadas**:
   - `PersonByRole` → referencia `Work` (FK WorkId) + compatibilidad `Number`
   - `TagByNumber` → referencia `Work` (FK WorkId) + compatibilidad `Number` + opcional `PersonByRoleId`
   - `Page` → referencia `Work` (FK WorkId) + compatibilidad `Number`

5. **Configuraciones EF** (`Infrastructure/Persistence/Configurations/`):
   - `WorkConfiguration`: TPH, discriminador, FKs comunes, índices
   - `NumberConfiguration`: Propiedades específicas, FK Series, índices únicos
   - `GraphicNovelConfiguration`: FK Franchise requerida
   - `PersonByRoleConfiguration`: FK WorkId (Cascade) + NumberId (compatibilidad)
   - `TagByNumberConfiguration`: FK WorkId (Cascade) + NumberId + PersonByRoleId opcional
   - `PageConfiguration`: FK WorkId (Cascade), índice único (WorkId, Order)

6. **DbContext actualizado** (`ApplicationDbContext.cs`):
   - DbSets: `Works`, `Numbers`, `GraphicNovels`
   - Configuraciones registradas

7. **Migración** (`20260908202352_AddWorkAndGraphicNovel.cs`):
   - Renombra `Numbers` → `Works`
   - Agrega discriminador `WorkType` (Number/GraphicNovel)
   - Columnas específicas nullable para cada tipo
   - FKs WorkId en relaciones + NumberId compatibilidad
   - Índices y restricciones

8. **Documentación** (`project/domain.md`):
   - Secciones completas para Work, Number, GraphicNovel
   - Diagrama de jerarquía
   - Notas de auditoría 2026-09-08

### Archivos creados/modificados

**Nuevos:**
- `Domain/Entities/Work.cs`
- `Domain/Entities/GraphicNovel.cs`
- `Infrastructure/Persistence/Configurations/WorkConfiguration.cs`
- `Infrastructure/Persistence/Configurations/GraphicNovelConfiguration.cs`
- `Infrastructure/Migrations/20260908202352_AddWorkAndGraphicNovel.cs`

**Modificados:**
- `Domain/Entities/Number.cs` (hereda de Work)
- `Domain/Entities/PersonByRole.cs` (FK WorkId + compat Number)
- `Domain/Entities/TagByNumber.cs` (FK WorkId + compat Number + PersonByRoleId opcional)
- `Domain/Entities/Page.cs` (FK WorkId + compat Number)
- `Infrastructure/Persistence/Configurations/NumberConfiguration.cs`
- `Infrastructure/Persistence/Configurations/PersonByRoleConfiguration.cs`
- `Infrastructure/Persistence/Configurations/TagByNumberConfiguration.cs`
- `Infrastructure/Persistence/Configurations/PageConfiguration.cs`
- `Infrastructure/Persistence/ApplicationDbContext.cs`
- `project/domain.md`

### Decisiones relevantes

- **TPH (Table-Per-Hierarchy)**: Una sola tabla `Works` con discriminador `WorkType`. Columnas específicas por tipo son nullable. Simplifica consultas y evita JOINs.
- **Compatibilidad hacia atrás**: `PersonByRole`, `TagByNumber`, `Page` mantienen propiedad `Number` (get/set → Work) para que servicios existentes sigan compilando.
- **FKs duales**: Relaciones usan `WorkId` (Cascade) + `NumberId` (compatibilidad) para migración gradual.
- **TagByNumber → TagByWork**: Conceptualmente renombrado a TagByWork (FK WorkId), mantiene nombre de tabla/entidad por compatibilidad.

### Pendiente para tasks posteriores

- Repositorios (TASK-API-0194)
- Services (TASK-API-0195)
- Controllers/Endpoints (TASK-API-0196)
- DTOs y validaciones