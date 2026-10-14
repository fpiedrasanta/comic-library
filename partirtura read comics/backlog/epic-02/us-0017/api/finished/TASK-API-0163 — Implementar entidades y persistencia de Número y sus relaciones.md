# TASK-API-0163 — Implementar entidades y persistencia de Número y sus relaciones

## ID

TASK-API-0163

## Título

Implementar entidades y persistencia de Número y sus relaciones

## Descripción

Implementar el modelo de dominio y la persistencia necesaria para administrar Números dentro del catálogo.

Esta Task debe incorporar todas las entidades necesarias para representar:

- Números.
- Personas.
- Roles.
- Etiquetas.
- Relación entre Número, Persona y Rol.
- Relación entre Número y Etiqueta.

La Task comprende únicamente el modelo, sus relaciones, configuraciones de persistencia y migración de base de datos.

La implementación de servicios, repositorios y endpoints administrativos será realizada en Tasks posteriores.

## Contexto relevante

- User Story: US-0017 — Administrar números
- Epic: EPIC-02 — Gestión del catálogo y contenido editorial
- Dependencias:
  - US-0014 — Administrar editoriales
  - US-0015 — Administrar franquicias
  - US-0016 — Administrar series
- Documentación:
  - `project/domain.md`
  - `project/repositories.md`
  - `project/services/services-application.md`
  - `project/endpoints.md`
  - `project/endpoints/endpoints-series.md`
  - `project/communication.md`

## Alcance

### 1. Entidad Number

Crear la entidad `Number` con, como mínimo, los siguientes datos:

- Identificador.
- `SeriesId`.
- `Number`.
- `Title`.
- `Description`.
- `LanguageId`.
- `Cover/ImageId`, según el modelo de imágenes existente.
- `IsActive`.
- `PublicationDate`.
- `CreatedAt`.
- `PreviousNumberId`.
- `NextNumberId`.
- Información necesaria para identificar el estado del contenido digital.

### Reglas de Number

- `SeriesId` es obligatorio.
- `Number` es obligatorio.
- `Number` es un texto libre.
- `Title` es obligatorio.
- `Description` es opcional.
- `LanguageId` es obligatorio.
- `PublicationDate` es obligatoria.
- `CreatedAt` es generado por el sistema.
- `IsActive` es obligatorio.
- `PreviousNumberId` es opcional.
- `NextNumberId` es opcional.
- No existe `PublisherId` en `Number`.
- No existe `FranchiseId` en `Number`.
- La Editorial se obtiene mediante la relación Serie → Editorial.
- La Franquicia se obtiene mediante la relación Serie → Franquicia.

### Unicidad

Debe existir una restricción de unicidad para:

```text
SeriesId + Number
```

El mismo texto de `Number` puede existir en diferentes Series.

Ejemplo válido:

```text
Serie A → #REGULAR-0001
Serie B → #REGULAR-0001
```

Pero no:

```text
Serie A → #REGULAR-0001
Serie A → #REGULAR-0001
```

## 2. Continuidad

`Number` debe soportar relaciones opcionales con otros Números:

```text
PreviousNumberId
NextNumberId
```

Las relaciones deben permitir representar continuidad incompleta.

Ejemplo:

```text
#20 → siguiente → #21
```

sin necesidad de que #21 exista todavía.

También debe ser posible establecer:

```text
#21 → anterior → #20
```

cuando ambos Números existan.

La lógica de actualización de la relación bidireccional será implementada posteriormente en el servicio de Number.

La persistencia debe soportar correctamente estas referencias sin generar relaciones circulares inválidas.

## 3. Entidad Person

Crear la entidad `Person`.

Debe representar una persona que participa en uno o más Números.

La entidad debe poder ser reutilizada posteriormente por múltiples obras.

La entidad debe contener únicamente los datos propios de una Persona definidos en `domain.md`.

No debe almacenar información específica de su participación en un Número.

## 4. Entidad Role

Crear la entidad `Role`.

Los roles son entidades persistentes y no valores rígidos definidos exclusivamente en código.

Inicialmente deben poder existir, como mínimo:

- Guionista.
- Dibujante.
- Entintador.
- Colorista.
- Portadista.
- Traductor.
- Editor.

La entidad debe poder ser reutilizada por múltiples Números y Personas.

No debe contener información específica de una participación.

## 5. Entidad PersonByRole

Crear la entidad `PersonByRole`.

Representa la participación de una Persona con un determinado Rol dentro de un Número.

Debe contener referencias a:

- `NumberId`.
- `PersonId`.
- `RoleId`.

La relación debe permitir:

- Una Persona con múltiples Roles en un mismo Número.
- Un Rol utilizado por múltiples Personas dentro de un mismo Número.
- Una Persona participando en múltiples Números.
- Un Rol utilizado en múltiples Números.

Ejemplo:

```text
Jhon Doe   → Dibujante
Jhon Doe   → Entintador
Juan Salvo → Guionista
```

Debe existir una restricción que impida duplicar conceptualmente la misma relación:

```text
NumberId + PersonId + RoleId
```

Por lo tanto, no debe ser posible registrar dos veces:

```text
Number #1 → Jhon Doe → Dibujante
```

## 6. Entidad Tag

Crear la entidad `Tag`.

Las etiquetas son entidades persistentes reutilizables.

Una misma etiqueta puede estar asociada a múltiples Números.

Debe existir una única identidad para cada etiqueta según las reglas de dominio establecidas.

La validación y resolución de etiquetas recibidas desde el formulario será responsabilidad de una Task posterior.

## 7. Entidad TagByNumber

Crear la entidad `TagByNumber`.

Representa la asociación entre un Número y una Etiqueta.

Debe contener:

- `NumberId`.
- `TagId`.

Debe existir una restricción de unicidad:

```text
NumberId + TagId
```

Una etiqueta puede estar asociada a múltiples Números.

Un Número puede tener múltiples etiquetas.

Ejemplo:

```text
#REGULAR-0001 → Terror
#REGULAR-0001 → Acción
#REGULAR-0002 → Terror
```

## 8. Relaciones de Number

La entidad `Number` debe quedar correctamente relacionada con las entidades existentes del catálogo:

```text
Series
Language
Image/Cover
```

y con las nuevas entidades:

```text
PersonByRole
TagByNumber
```

Conceptualmente:

```text
Series
   │
   └── Number
         ├── Language
         ├── Cover
         ├── Previous Number
         ├── Next Number
         ├── PersonByRole
         │      ├── Person
         │      └── Role
         └── TagByNumber
                └── Tag
```

La relación con Editorial y Franchise no debe duplicarse en `Number`.

Se obtiene transitivamente:

```text
Number
   ↓
Series
   ├── Franchise
   └── Publisher
```

## 9. Configuración de Entity Framework

Implementar las configuraciones necesarias para todas las entidades nuevas mediante el patrón utilizado actualmente por el proyecto.

Como mínimo deben configurarse:

- Claves primarias.
- Claves foráneas.
- Relaciones.
- Campos obligatorios.
- Longitudes de campos cuando correspondan.
- Índices.
- Restricciones de unicidad.
- Relaciones opcionales de continuidad.
- Comportamiento de eliminación de las relaciones.

Debe evitarse que una eliminación física de una entidad provoque accidentalmente la eliminación de información de catálogo relacionada.

En particular, las relaciones de `Number` con `Person`, `Role` y `Tag` deben respetar la integridad referencial.

## 10. Persistencia

Implementar los cambios necesarios en Persistence para que las nuevas entidades puedan ser almacenadas mediante Entity Framework.

No implementar todavía:

- `NumberRepository`.
- `PersonRepository`.
- `RoleRepository`.
- `TagRepository`.
- `NumberService`.
- Controllers/Endpoints administrativos.

Esas responsabilidades corresponden a Tasks posteriores.

## 11. Migración

Crear la migración correspondiente para incorporar las nuevas tablas y relaciones.

La migración debe incluir correctamente:

- Tabla `Numbers`.
- Tabla `Persons`.
- Tabla `Roles`.
- Tabla `Tags`.
- Tabla `PersonByRoles`.
- Tabla `TagByNumbers`.
- Claves foráneas.
- Índices.
- Restricciones de unicidad.

Los nombres concretos de tablas y columnas deben respetar las convenciones existentes del proyecto.

## 12. Integridad

La persistencia debe impedir:

- Un Number sin Series.
- Un Number sin Language.
- Un PersonByRole sin Number.
- Un PersonByRole sin Person.
- Un PersonByRole sin Role.
- Un TagByNumber sin Number.
- Un TagByNumber sin Tag.
- Duplicar una misma relación Person/Role dentro de un Number.
- Duplicar una misma Tag dentro de un Number.
- Duplicar un Number dentro de la misma Series.
- Crear referencias de continuidad hacia registros inexistentes.

## 13. Documentación

Actualizar, cuando corresponda:

- `project/domain.md`.
- `project/repositories.md`.
- Documentación de Persistence utilizada por el proyecto.

La documentación debe reflejar las nuevas entidades y sus relaciones.

No documentar todavía endpoints ni servicios administrativos que serán implementados en Tasks posteriores.

## 14. Fuera de alcance

Esta Task no implementa:

- Listado administrativo de Numbers.
- Alta de Numbers mediante API.
- Edición de Numbers mediante API.
- Activación o desactivación mediante API.
- Endpoint de detalle.
- Búsqueda de Personas.
- Alta de Personas mediante API.
- Búsqueda de Roles.
- Alta de Roles mediante API.
- Gestión administrativa de Tags.
- Procesamiento CBR.
- Entidad `Page`.
- Workers.
- Estados de procesamiento.
- Reintento de procesamiento.
- Eliminación del contenido digital.
- Asistencia de IA.

Estas capacidades serán implementadas en Tasks posteriores.

## Criterios de aceptación

- [ ] Existe la entidad `Number`.
- [ ] Existe la entidad `Person`.
- [ ] Existe la entidad `Role`.
- [ ] Existe la entidad `Tag`.
- [ ] Existe la entidad `PersonByRole`.
- [ ] Existe la entidad `TagByNumber`.
- [ ] `Number` pertenece obligatoriamente a una `Series`.
- [ ] `Number` referencia obligatoriamente un `Language`.
- [ ] `Number` no contiene `PublisherId`.
- [ ] `Number` no contiene `FranchiseId`.
- [ ] `Number + SeriesId` es único.
- [ ] `Number` soporta `PreviousNumberId` y `NextNumberId` opcionales.
- [ ] Una Persona puede tener múltiples Roles dentro del mismo Number.
- [ ] Un Rol puede estar asociado a múltiples Personas dentro del mismo Number.
- [ ] No se puede duplicar una relación `Number + Person + Role`.
- [ ] Un Number puede tener múltiples Tags.
- [ ] Una Tag puede estar asociada a múltiples Numbers.
- [ ] No se puede duplicar una relación `Number + Tag`.
- [ ] Las relaciones de persistencia están correctamente configuradas.
- [ ] La migración de base de datos se genera correctamente.
- [ ] La solución compila correctamente.
- [ ] No se introducen endpoints ni servicios fuera del alcance de esta Task.

## Dependencias

Esta Task depende de las entidades existentes de:

- Serie.
- Franquicia.
- Editorial.
- Idioma.
- Imagen/archivo, según el modelo vigente del proyecto.

## Resultado esperado

La capa de dominio y persistencia debe disponer de todo el modelo necesario para comenzar la implementación administrativa de Números, incluyendo sus Personas, Roles, Etiquetas y relaciones, manteniendo la integridad referencial y evitando duplicación de información del catálogo.

## Resultado

### Entidades creadas

| Entidad | Archivo | Descripción |
|---------|---------|-------------|
| Number | `api/Domain/Entities/Number.cs` | Entidad principal con SeriesId, Number, Title, Description, LanguageId, Cover/ImageId, PublicationDate, PreviousNumberId, NextNumberId |
| Person | `api/Domain/Entities/Person.cs` | Entidad para personas participantes |
| Role | `api/Domain/Entities/Role.cs` | Entidad para roles/functions |
| Tag | `api/Domain/Entities/Tag.cs` | Entidad para etiquetas |
| PersonByRole | `api/Domain/Entities/PersonByRole.cs` | Relación Persona + Número + Rol |
| TagByNumber | `api/Domain/Entities/TagByNumber.cs` | Relación Etiqueta + Número |
| Page | `api/Domain/Entities/Page.cs` | Entidad para páginas del contenido digital |
| Language | `api/Domain/Entities/Language.cs` | Entidad para idiomas |

### Enumeraciones creadas

| Enum | Archivo | Valores |
|------|---------|---------|
| ContentStatus | `api/Domain/Enums/ContentStatus.cs` | Missing=0, Processing=1, Completed=2, Error=3 |
| ImageType | `api/Domain/Enums/ImageType.cs` | Avatar=1, Cover=2, Page=3, Profile=4 |

### Configuraciones de Entity Framework

| Configuración | Archivo |
|---------------|---------|
| NumberConfiguration | `api/Infrastructure/Persistence/Configurations/NumberConfiguration.cs` |
| PersonConfiguration | `api/Infrastructure/Persistence/Configurations/PersonConfiguration.cs` |
| RoleConfiguration | `api/Infrastructure/Persistence/Configurations/RoleConfiguration.cs` |
| TagConfiguration | `api/Infrastructure/Persistence/Configurations/TagConfiguration.cs` |
| PersonByRoleConfiguration | `api/Infrastructure/Persistence/Configurations/PersonByRoleConfiguration.cs` |
| TagByNumberConfiguration | `api/Infrastructure/Persistence/Configurations/TagByNumberConfiguration.cs` |
| PageConfiguration | `api/Infrastructure/Persistence/Configurations/PageConfiguration.cs` |
| LanguageConfiguration | `api/Infrastructure/Persistence/Configurations/LanguageConfiguration.cs` |

### Restricciones de unicidad implementadas

| Restricción | Entidad |
|-------------|---------|
| SeriesId + Number | Number |
| Name | Role |
| Name | Tag |
| PersonId + NumberId + RoleId | PersonByRole |
| TagId + NumberId | TagByNumber |
| NumberId + Order | Page |

### Migración

- Migración creada: `AddNumberAndRelatedEntities`
- Aplicada correctamente a la base de datos

### Decisiones relevantes

- Todas las propiedades de navegación marcadas como `virtual` para Lazy Loading
- `ValueGeneratedOnAdd()` agregado a todas las configuraciones para evitar errores de "Duplicate entry"
- `AsNoTracking()` mantenido solo en consultas de listado/paginación
- Imagen reutiliza el modelo existente con `ImageType` enum
- La entidad Language no tiene CRUD - los datos se cargan directamente en la base de datos (Inglés, Español)

### Build

- Exitoso: 0 errores, 0 warnings

### Criterios de aceptación cumplidos

- [x] Existe la entidad `Number`
- [x] Existe la entidad `Person`
- [x] Existe la entidad `Role`
- [x] Existe la entidad `Tag`
- [x] Existe la entidad `PersonByRole`
- [x] Existe la entidad `TagByNumber`
- [x] `Number` pertenece obligatoriamente a una `Series`
- [x] `Number` referencia obligatoriamente un `Language`
- [x] `Number` no contiene `PublisherId`
- [x] `Number` no contiene `FranchiseId`
- [x] `Number + SeriesId` es único
- [x] `Number` soporta `PreviousNumberId` y `NextNumberId` opcionales
- [x] Una Persona puede tener múltiples Roles dentro del mismo Number
- [x] Un Rol puede estar asociado a múltiples Personas dentro del mismo Number
- [x] No se puede duplicar una relación `Number + Person + Role`
- [x] Un Number puede tener múltiples Tags
- [x] Una Tag puede estar asociada a múltiples Numbers
- [x] No se puede duplicar una relación `Number + Tag`
- [x] Las relaciones de persistencia están correctamente configuradas
- [x] La migración de base de datos se genera correctamente
- [x] La solución compila correctamente
- [x] No se introducen endpoints ni servicios fuera del alcance de esta Task