# TASK-API-0165 — Implementar entidad y persistencia de Role

## ID

TASK-API-0165

## Título

Implementar entidad y persistencia de Role

## Descripción

Implementar la entidad `Role` y su persistencia dentro del catálogo de Comic Library.

Un Rol representa la función desempeñada por una Persona dentro de una obra.

Los Roles son entidades administrables y no deben estar definidos exclusivamente como valores rígidos dentro del código.

La relación entre un Rol, una Persona y un Número se realizará mediante la entidad `PersonByRole`, implementada en una Task específica.

Esta Task comprende exclusivamente:

- Entidad de dominio `Role`.
- Configuración de Entity Framework.
- Persistencia.
- Migración de base de datos.
- Documentación del modelo.

La implementación de servicios, repositorios y endpoints administrativos de Roles queda fuera del alcance de esta Task y será realizada posteriormente.

## Contexto

- Epic: EPIC-02 — Gestión del catálogo y contenido editorial
- User Story relacionada: US-0020 — Administrar roles
- User Story principal: US-0017 — Administrar números
- Task relacionada:
  - TASK-API-0164 — Implementar entidad y persistencia de Person
  - TASK-API-0168 — Implementar servicios, repositorios y endpoints administrativos de Person y Role

## Modelo de dominio

Crear la entidad:

```text
Role
```

La entidad debe contener los datos propios de un Rol definidos en `project/domain.md`.

Como mínimo debe permitir identificar el Rol mediante su nombre.

Los Roles deben ser datos persistentes y administrables.

Ejemplos iniciales:

```text
Guionista
Dibujante
Entintador
Colorista
Portadista
Traductor
Editor
```

Estos valores representan datos iniciales del catálogo y no deben implementarse como un `enum` rígido que impida administrar nuevos Roles.

## Responsabilidad

`Role` representa exclusivamente el rol o función que una Persona puede desempeñar.

No debe contener:

- `PersonId`.
- `NumberId`.
- Información específica de una participación.
- Información duplicada de una Persona.
- Información duplicada de un Número.

La relación entre Persona, Rol y Número se representa mediante:

```text
Person
   \
    PersonByRole
   /
Role
   |
 Number
```

## Relaciones

Un Rol puede estar asociado a:

- Múltiples Personas.
- Múltiples Números.
- Múltiples combinaciones Persona/Número.

Ejemplo:

```text
Dibujante
    ├── Jhon Doe → Number #1
    ├── Jhon Doe → Number #2
    ├── Juan Salvo → Number #3
    └── Jane Doe → Number #4
```

Estas relaciones no deben almacenarse directamente en `Role`.

Deben utilizar `PersonByRole`.

## Configuración de Entity Framework

Implementar la configuración de `Role` utilizando el patrón de configuración existente en el proyecto.

Configurar:

- Clave primaria.
- Campos obligatorios.
- Longitudes de campos cuando correspondan.
- Índices que correspondan al modelo.
- Relaciones necesarias con `PersonByRole`, si se exponen mediante navegación.

La configuración debe respetar las convenciones existentes del proyecto.

## Unicidad

El nombre de un Rol debe ser único dentro del catálogo.

No deben existir dos entidades `Role` que representen el mismo Rol mediante el mismo nombre.

La restricción de unicidad debe reforzarse mediante la configuración apropiada de persistencia.

La validación de negocio y la respuesta ante intentos de duplicación serán responsabilidad de la capa correspondiente cuando se implementen los servicios administrativos.

## Integridad

Un `Role` puede existir aunque todavía no tenga Personas asociadas.

Por lo tanto:

```text
Role
```

no requiere obligatoriamente una relación con `PersonByRole`.

Las referencias desde `PersonByRole` deben utilizar integridad referencial.

No deben existir referencias a Roles inexistentes.

## Eliminación

La estrategia de eliminación debe respetar las reglas generales del catálogo.

Un Rol que sea referenciado por `PersonByRole` no debe poder eliminarse físicamente si dicha eliminación rompe la integridad referencial.

La estrategia concreta de activación/desactivación será definida en la User Story correspondiente.

Esta Task no implementa la lógica administrativa de activación/desactivación.

## Persistencia

Incorporar `Role` al modelo de Entity Framework y al contexto de persistencia utilizado por la aplicación.

No implementar en esta Task:

- `RoleRepository`.
- `RoleService`.
- Controller de Roles.
- GET de Roles.
- GET by ID de Roles.
- POST de Roles.
- PUT de Roles.
- PATCH de Roles.

Estas capacidades serán implementadas posteriormente en:

```text
TASK-API-0168
```

## Datos iniciales

Los Roles iniciales definidos por la Epic deberán quedar contemplados para su incorporación mediante el mecanismo de datos iniciales utilizado por el proyecto.

Roles iniciales:

```text
Guionista
Dibujante
Entintador
Colorista
Portadista
Traductor
Editor
```

No implementar los Roles como valores constantes que impidan posteriormente su administración.

Si el proyecto utiliza Seed para datos iniciales, utilizar dicho mecanismo.

## Migración

Crear la migración necesaria para incorporar la tabla de Roles.

La migración debe respetar:

- Convenciones de nombres existentes.
- Clave primaria.
- Tipos de datos.
- Longitudes.
- Índices.
- Restricción de unicidad del nombre.
- Restricciones necesarias para futuras referencias desde `PersonByRole`.

## Documentación

Actualizar:

```text
project/domain.md
```

para documentar la entidad `Role` y su responsabilidad dentro del dominio.

La documentación debe dejar explícito que:

- Un Rol representa una función desempeñada por una Persona en una obra.
- Los Roles son entidades administrables.
- Los Roles no deben modelarse exclusivamente mediante un `enum`.
- Un Rol puede ser utilizado por múltiples Personas.
- Una Persona puede desempeñar múltiples Roles.
- La relación entre Persona, Rol y Número se representa mediante `PersonByRole`.

Actualizar la documentación de Persistence correspondiente si el proyecto dispone de un artefacto específico para ella.

## Fuera de alcance

Esta Task no comprende:

- Administración de Roles.
- Alta de Roles mediante API.
- Edición de Roles.
- Desactivación de Roles.
- Reactivación de Roles.
- Búsqueda de Roles.
- Endpoint de detalle de Role.
- Gestión de Personas.
- Gestión de `PersonByRole`.
- Gestión de Números.
- Gestión de Etiquetas.
- Procesamiento CBR.
- Páginas.
- IA.

## Criterios de aceptación

- [ ] Existe la entidad `Role`.
- [ ] La entidad contiene únicamente información propia del Rol.
- [ ] No contiene `PersonId`.
- [ ] No contiene `NumberId`.
- [ ] Los Roles son entidades persistentes y administrables.
- [ ] El nombre del Rol es obligatorio.
- [ ] El nombre del Rol posee restricción de unicidad.
- [ ] La relación Persona/Rol/Número se modela mediante `PersonByRole`.
- [ ] La configuración de Entity Framework está implementada.
- [ ] La entidad forma parte correctamente del contexto de persistencia.
- [ ] Los Roles iniciales están contemplados mediante el mecanismo de seed existente.
- [ ] La migración de base de datos se genera correctamente.
- [ ] La integridad referencial queda preparada para `PersonByRole`.
- [ ] La documentación de dominio está actualizada.
- [ ] La solución compila correctamente.
- [ ] No se implementan servicios ni endpoints administrativos en esta Task.

## Resultado esperado

La aplicación dispone de una entidad `Role` correctamente integrada al dominio y a la persistencia, con los Roles iniciales disponibles y preparada para ser utilizada por `PersonByRole` y por los servicios administrativos de Roles.

## Resultado

### Entidad creada

| Entidad | Archivo | Descripción |
|---------|---------|-------------|
| Role | `api/Domain/Entities/Role.cs` | Entidad para roles/functions desempeñadas por personas |

### Configuración de Entity Framework

| Configuración | Archivo |
|---------------|---------|
| RoleConfiguration | `api/Infrastructure/Persistence/Configurations/RoleConfiguration.cs` |

### Propiedades de Role

- Id (PK)
- Name (obligatorio, único, max length)
- IsActive (objetivo)
- CreatedAt (generado por sistema)
- Navegación: PersonByRoles (virtual para Lazy Loading)

### Restricciones

- Name único mediante índice único compuesto

### Decisiones relevantes

- Entidad independiente de Person y Number
- No contiene PersonId ni NumberId directamente
- Los Roles son entidades administrables, no un enum rígido
- Propiedades de navegación marcadas como `virtual` para Lazy Loading

### Build

- Exitoso: 0 errores, 0 warnings

### Criterios de aceptación cumplidos

- [x] Existe la entidad `Role`
- [x] La entidad contiene únicamente información propia del Rol
- [x] No contiene `PersonId`
- [x] No contiene `NumberId`
- [x] Los Roles son entidades persistentes y administrables
- [x] El nombre del Rol es obligatorio
- [x] El nombre del Rol posee restricción de unicidad
- [x] La relación Persona/Rol/Número se modela mediante `PersonByRole`
- [x] La configuración de Entity Framework está implementada
- [x] La entidad forma parte correctamente del contexto de persistencia
- [x] Los Roles iniciales están contemplados mediante el mecanismo de seed existente
- [x] La migración de base de datos se genera correctamente
- [x] La integridad referencial queda preparada para `PersonByRole`
- [x] La documentación de dominio está actualizada
- [x] La solución compila correctamente
- [x] No se implementan servicios ni endpoints administrativos en esta Task