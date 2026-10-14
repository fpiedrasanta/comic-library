# TASK-API-0166 — Implementar entidad y persistencia de Tag

## ID

TASK-API-0166

## Título

Implementar entidad y persistencia de Tag

## Descripción

Implementar la entidad `Tag` y su persistencia dentro del catálogo de Comic Library.

Una Etiqueta permite clasificar temáticamente o narrativamente los Números del catálogo.

Una misma Etiqueta puede estar asociada a múltiples Números y un Número puede tener múltiples Etiquetas.

La relación entre `Tag` y `Number` se realizará mediante la entidad `TagByNumber`, implementada en una Task específica.

Esta Task comprende exclusivamente:

- Entidad de dominio `Tag`.
- Configuración de Entity Framework.
- Persistencia.
- Migración de base de datos.
- Documentación del modelo.

La implementación de servicios, repositorios y endpoints administrativos de Etiquetas queda fuera del alcance de esta Task.

## Contexto

- Epic: EPIC-02 — Gestión del catálogo y contenido editorial
- User Story relacionada: US-0022 — Administrar etiquetas
- User Story principal: US-0017 — Administrar números
- Task relacionada:
  - TASK-API-0169 — Implementar administración de Etiquetas para Números

## Modelo de dominio

Crear la entidad:

```text
Tag
```

La entidad debe contener los datos propios de una Etiqueta definidos en `project/domain.md`.

Como mínimo debe permitir identificar la Etiqueta mediante su nombre.

Una Etiqueta representa un concepto reutilizable dentro del catálogo.

Ejemplos:

```text
Acción
Terror
Multiverso
Viajes en el tiempo
Magia
```

## Responsabilidad

`Tag` representa exclusivamente una clasificación temática o narrativa.

No debe contener:

- `NumberId`.
- Información específica de un Número.
- Información duplicada de un Número.

La relación entre Etiqueta y Número se representa mediante:

```text
Tag
   |
TagByNumber
   |
Number
```

## Relaciones

Una Etiqueta puede estar asociada a múltiples Números.

Un Número puede tener múltiples Etiquetas.

Ejemplo:

```text
Tag: Multiverso
    ├── Number #1
    ├── Number #15
    ├── Number #27
    └── Number #42
```

y:

```text
Number #15
    ├── Multiverso
    ├── Acción
    └── Viajes en el tiempo
```

Estas relaciones no deben almacenarse directamente en `Tag` como información duplicada.

Deben utilizar `TagByNumber`.

## Unicidad

El nombre de una Etiqueta debe ser único dentro del catálogo.

No deben existir dos entidades `Tag` que representen la misma Etiqueta mediante el mismo nombre.

La restricción de unicidad debe reforzarse mediante la configuración apropiada de persistencia.

La validación de negocio ante intentos de creación de etiquetas duplicadas será responsabilidad de la capa correspondiente.

## Normalización del nombre

La comparación para determinar si una Etiqueta ya existe debe contemplar las reglas de normalización definidas por el proyecto.

Por ejemplo, no debería ser posible crear accidentalmente dos etiquetas que representen:

```text
Terror
terror
```

La implementación concreta de normalización/case sensitivity debe respetar el comportamiento y las convenciones existentes de la base de datos y del proyecto.

No introducir en esta Task lógica de negocio adicional que corresponda a Application.

## Configuración de Entity Framework

Implementar la configuración de `Tag` utilizando el patrón de configuración existente en el proyecto.

Configurar:

- Clave primaria.
- Nombre obligatorio.
- Longitud máxima.
- Restricción de unicidad.
- Relaciones necesarias con `TagByNumber`, si se exponen mediante navegación.

La configuración debe respetar las convenciones existentes del proyecto.

## Integridad

Una Etiqueta puede existir aunque todavía no tenga Números asociados.

Por lo tanto:

```text
Tag
```

no requiere obligatoriamente una relación con `Number`.

Las referencias desde `TagByNumber` deben utilizar integridad referencial.

No deben existir referencias a Etiquetas inexistentes.

## Eliminación

La estrategia de eliminación debe respetar las reglas generales del catálogo.

Una Etiqueta que sea referenciada por `TagByNumber` no debe poder eliminarse físicamente si dicha eliminación rompe la integridad referencial.

La estrategia concreta de activación/desactivación será definida en la User Story correspondiente.

Esta Task no implementa la lógica administrativa de activación/desactivación.

## Persistencia

Incorporar `Tag` al modelo de Entity Framework y al contexto de persistencia utilizado por la aplicación.

No implementar en esta Task:

- `TagRepository`.
- `TagService`.
- Controller de Tags.
- GET de Tags.
- GET by ID de Tags.
- POST de Tags.
- PUT de Tags.
- PATCH de Tags.
- Gestión de etiquetas asociadas a un Número.

La administración de las etiquetas utilizadas por los Números será implementada posteriormente en:

```text
TASK-API-0169
```

## Migración

Crear la migración necesaria para incorporar la tabla de Etiquetas.

La migración debe respetar:

- Convenciones de nombres existentes.
- Clave primaria.
- Tipos de datos.
- Longitudes.
- Índices.
- Restricción de unicidad.
- Restricciones necesarias para futuras referencias desde `TagByNumber`.

## Documentación

Actualizar:

```text
project/domain.md
```

para documentar la entidad `Tag` y su responsabilidad dentro del dominio.

La documentación debe dejar explícito que:

- Una Etiqueta permite clasificar Números.
- Una Etiqueta puede estar asociada a múltiples Números.
- Un Número puede tener múltiples Etiquetas.
- La relación entre Etiqueta y Número se representa mediante `TagByNumber`.
- Las Etiquetas son entidades persistentes y administrables.
- No deben duplicarse Etiquetas conceptualmente equivalentes.

Actualizar la documentación de Persistence correspondiente si el proyecto dispone de un artefacto específico para ella.

## Fuera de alcance

Esta Task no comprende:

- Administración de Etiquetas.
- Alta de Etiquetas mediante API.
- Edición de Etiquetas.
- Desactivación de Etiquetas.
- Reactivación de Etiquetas.
- Búsqueda de Etiquetas.
- Gestión de `TagByNumber`.
- Gestión de Números.
- Personas.
- Roles.
- Procesamiento CBR.
- Páginas.
- IA.
- Sugerencia de Etiquetas mediante IA.

## Criterios de aceptación

- [ ] Existe la entidad `Tag`.
- [ ] La entidad contiene únicamente información propia de la Etiqueta.
- [ ] No contiene `NumberId`.
- [ ] El nombre de la Etiqueta es obligatorio.
- [ ] El nombre posee restricción de unicidad.
- [ ] La relación Etiqueta/Número queda preparada para implementarse mediante `TagByNumber`.
- [ ] Una Etiqueta puede existir sin estar asociada a un Número.
- [ ] La configuración de Entity Framework está implementada.
- [ ] La entidad forma parte correctamente del contexto de persistencia.
- [ ] La migración de base de datos se genera correctamente.
- [ ] La integridad referencial queda preparada para `TagByNumber`.
- [ ] La documentación de dominio está actualizada.
- [ ] La solución compila correctamente.
- [ ] No se implementan servicios ni endpoints administrativos en esta Task.

## Resultado esperado

La aplicación dispone de una entidad `Tag` correctamente integrada al dominio y a la persistencia, preparada para ser utilizada por `TagByNumber`, por la administración de etiquetas de los Números y posteriormente por la asistencia de IA para sugerencia de etiquetas.

## Resultado

### Entidad creada

| Entidad | Archivo | Descripción |
|---------|---------|-------------|
| Tag | `api/Domain/Entities/Tag.cs` | Entidad para etiquetas de clasificación temática/narrativa |

### Configuración de Entity Framework

| Configuración | Archivo |
|---------------|---------|
| TagConfiguration | `api/Infrastructure/Persistence/Configurations/TagConfiguration.cs` |

### Propiedades de Tag

- Id (PK)
- Name (obligatorio, único, max length)
- IsActive (objetivo)
- CreatedAt (generado por sistema)
- Navegación: TagByNumbers (virtual para Lazy Loading)

### Restricciones

- Name único mediante índice único compuesto

### Decisiones relevantes

- Entidad independiente de Number
- No contiene NumberId directamente
- Las etiquetas son entidades administrables, no un enum rígido
- Propiedades de navegación marcadas como `virtual` para Lazy Loading

### Build

- Exitoso: 0 errores, 0 warnings

### Criterios de aceptación cumplidos

- [x] Existe la entidad `Tag`
- [x] La entidad contiene únicamente información propia de la Etiqueta
- [x] No contiene `NumberId`
- [x] El nombre de la Etiqueta es obligatorio
- [x] El nombre posee restricción de unicidad
- [x] La relación Etiqueta/Número queda preparada para implementarse mediante `TagByNumber`
- [x] Una Etiqueta puede existir sin estar asociada a un Número
- [x] La configuración de Entity Framework está implementada
- [x] La entidad forma parte correctamente del contexto de persistencia
- [x] La migración de base de datos se genera correctamente
- [x] La integridad referencial queda preparada para `TagByNumber`
- [x] La documentación de dominio está actualizada
- [x] La solución compila correctamente
- [x] No se implementan servicios ni endpoints administrativos en esta Task