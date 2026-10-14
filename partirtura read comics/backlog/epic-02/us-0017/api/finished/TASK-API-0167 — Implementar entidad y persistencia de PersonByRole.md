# TASK-API-0167 — Implementar entidad y persistencia de PersonByRole

## ID

TASK-API-0167

## Título

Implementar entidad y persistencia de PersonByRole

## Descripción

Implementar la entidad `PersonByRole` y su persistencia para representar la participación de una Persona en un Número desempeñando un Rol determinado.

La relación permite representar correctamente las participaciones editoriales y creativas de las personas involucradas en una obra.

Una misma Persona puede desempeñar múltiples Roles dentro del mismo Número.

Un mismo Rol puede ser desempeñado por múltiples Personas dentro del mismo Número.

Por lo tanto, la identidad de la relación está determinada por:

```text
PersonId + NumberId + RoleId
```

y no únicamente por:

```text
PersonId + NumberId
```

Esta Task comprende exclusivamente:

- Entidad de dominio `PersonByRole`.
- Configuración de Entity Framework.
- Persistencia.
- Relaciones con `Person`.
- Relaciones con `Role`.
- Relaciones con `Number`.
- Restricciones de integridad.
- Migración de base de datos.
- Documentación del modelo.

La administración de esta relación mediante endpoints será realizada como parte de la administración de `Number`.

## Contexto

- Epic: EPIC-02 — Gestión del catálogo y contenido editorial
- User Story: US-0017 — Administrar números
- Tasks relacionadas:
  - TASK-API-0164 — Implementar entidad y persistencia de Person
  - TASK-API-0165 — Implementar entidad y persistencia de Role
  - TASK-API-0163 — Implementar entidad y persistencia de Number

## Modelo de dominio

Crear la entidad:

```text
PersonByRole
```

La entidad representa una participación concreta:

```text
Persona + Número + Rol
```

Ejemplo:

```text
Jhon Doe + Number #1 + Entintador
Jhon Doe + Number #1 + Dibujante
Juan Salvo + Number #1 + Guionista
```

## Propiedades

La entidad debe contener las referencias necesarias para identificar la participación:

```text
PersonId
NumberId
RoleId
```

No debe duplicar información de:

- Persona.
- Número.
- Rol.

Los datos propios de esas entidades deben permanecer en sus respectivas tablas.

## Relaciones

### Person

`PersonByRole` debe referenciar obligatoriamente una Persona existente.

```text
Person 1 ──── N PersonByRole
```

Una Persona puede tener múltiples participaciones.

### Number

`PersonByRole` debe referenciar obligatoriamente un Número existente.

```text
Number 1 ──── N PersonByRole
```

Un Número puede tener múltiples personas y roles.

### Role

`PersonByRole` debe referenciar obligatoriamente un Rol existente.

```text
Role 1 ──── N PersonByRole
```

Un Rol puede utilizarse en múltiples participaciones.

## Regla de unicidad

No debe existir más de una participación idéntica para la misma combinación:

```text
PersonId + NumberId + RoleId
```

Por ejemplo, esto no debe ser válido:

```text
Jhon Doe + Number #1 + Dibujante
Jhon Doe + Number #1 + Dibujante
```

Pero sí debe ser válido:

```text
Jhon Doe + Number #1 + Dibujante
Jhon Doe + Number #1 + Entintador
```

Y también:

```text
Jhon Doe + Number #1 + Dibujante
Juan Salvo + Number #1 + Dibujante
```

La restricción de unicidad debe reforzarse mediante un índice único compuesto:

```text
PersonId
NumberId
RoleId
```

## Configuración de Entity Framework

Implementar la configuración de `PersonByRole` utilizando el patrón de configuración existente en el proyecto.

Configurar:

- Clave primaria.
- `PersonId` obligatorio.
- `NumberId` obligatorio.
- `RoleId` obligatorio.
- Relación con `Person`.
- Relación con `Number`.
- Relación con `Role`.
- Índice único compuesto sobre `PersonId`, `NumberId` y `RoleId`.

Respetar las convenciones existentes del proyecto para nombres de tablas, claves, índices y relaciones.

## Integridad referencial

Todas las participaciones deben referenciar entidades existentes.

No debe ser posible persistir:

```text
PersonByRole.PersonId
```

apuntando a una Persona inexistente.

No debe ser posible persistir:

```text
PersonByRole.NumberId
```

apuntando a un Número inexistente.

No debe ser posible persistir:

```text
PersonByRole.RoleId
```

apuntando a un Rol inexistente.

La integridad debe estar reforzada tanto por el modelo de persistencia como por las reglas de Application cuando corresponda.

## Eliminación

Las relaciones existentes en `PersonByRole` no deben provocar la eliminación accidental de:

- Personas.
- Roles.
- Números.

Eliminar una participación debe eliminar únicamente la relación.

No debe eliminarse ninguna de las entidades relacionadas.

La estrategia concreta de eliminación de Personas, Roles y Números deberá respetar las reglas de cada entidad.

Configurar las relaciones para evitar cascadas que puedan provocar eliminaciones de entidades principales no deseadas.

## Navegaciones

Las entidades pueden exponer las navegaciones necesarias para trabajar con las relaciones del dominio y de persistencia, respetando las convenciones arquitectónicas existentes.

Como mínimo, la relación debe permitir navegar conceptualmente:

```text
PersonByRole
    ├── Person
    ├── Role
    └── Number
```

y desde las entidades principales, cuando corresponda:

```text
Person
    └── PersonByRoles

Role
    └── PersonByRoles

Number
    └── PersonByRoles
```

No agregar navegaciones innecesarias únicamente para facilitar consultas puntuales.

## Persistencia

Incorporar `PersonByRole` al contexto de Entity Framework.

La entidad debe quedar preparada para ser utilizada posteriormente por:

- Consulta del detalle de un Número.
- Alta de un Número.
- Edición de un Número.
- Consulta de personas y roles asociados.
- Filtrado del catálogo por Personas y Roles.

No implementar en esta Task los endpoints ni la lógica de Application para administrar las relaciones.

## Migración

Crear la migración necesaria para incorporar la tabla de `PersonByRole`.

La migración debe incluir:

- Clave primaria.
- Foreign Key hacia `Person`.
- Foreign Key hacia `Number`.
- Foreign Key hacia `Role`.
- Índice único compuesto `PersonId + NumberId + RoleId`.
- Restricciones necesarias de integridad.

## Documentación

Actualizar:

```text
project/domain.md
```

para documentar `PersonByRole`.

La documentación debe dejar explícito que:

- Representa la participación de una Persona en un Número mediante un Rol.
- Una Persona puede tener múltiples Roles dentro del mismo Número.
- Un Rol puede corresponder a múltiples Personas dentro del mismo Número.
- La misma combinación Persona/Número/Rol no puede repetirse.
- La relación no duplica información de Persona, Número ni Rol.

Actualizar la documentación de Persistence correspondiente si el proyecto dispone de un artefacto específico.

## Fuera de alcance

Esta Task no comprende:

- Alta de Personas.
- Edición de Personas.
- Búsqueda de Personas.
- Alta de Roles.
- Edición de Roles.
- Búsqueda de Roles.
- Endpoints de `PersonByRole`.
- Administración de participaciones desde el Dashboard.
- Gestión de Números.
- Gestión de Etiquetas.
- Procesamiento CBR.
- Páginas.
- IA.

La administración de las participaciones se realizará desde la administración del Número.

## Criterios de aceptación

- [ ] Existe la entidad `PersonByRole`.
- [ ] Contiene `PersonId`.
- [ ] Contiene `NumberId`.
- [ ] Contiene `RoleId`.
- [ ] Las tres referencias son obligatorias.
- [ ] Existe relación con `Person`.
- [ ] Existe relación con `Number`.
- [ ] Existe relación con `Role`.
- [ ] Una Persona puede tener múltiples Roles dentro del mismo Número.
- [ ] Un Rol puede ser utilizado por múltiples Personas dentro del mismo Número.
- [ ] No puede repetirse la combinación `PersonId + NumberId + RoleId`.
- [ ] Existe índice único compuesto para garantizar dicha restricción.
- [ ] La integridad referencial está correctamente configurada.
- [ ] Las eliminaciones de una participación no eliminan las entidades principales.
- [ ] La entidad forma parte correctamente del contexto de persistencia.
- [ ] La migración se genera correctamente.
- [ ] La documentación de dominio está actualizada.
- [ ] La solución compila correctamente.
- [ ] No se implementan endpoints ni servicios administrativos en esta Task.

## Resultado esperado

La aplicación dispone de una relación persistente y consistente entre Personas, Roles y Números, permitiendo representar múltiples personas por rol y múltiples roles por persona dentro de un mismo Número sin duplicar información ni generar relaciones inconsistentes.

## Resultado

### Entidad creada

| Entidad | Archivo | Descripción |
|---------|---------|-------------|
| PersonByRole | `api/Domain/Entities/PersonByRole.cs` | Relación Persona + Número + Rol |

### Configuración de Entity Framework

| Configuración | Archivo |
|---------------|---------|
| PersonByRoleConfiguration | `api/Infrastructure/Persistence/Configurations/PersonByRoleConfiguration.cs` |

### Propiedades de PersonByRole

- Id (PK)
- PersonId (obligatorio, FK a Person)
- NumberId (obligatorio, FK a Number)
- RoleId (obligatorio, FK a Role)
- Navegaciones: Person, Number, Role (virtual para Lazy Loading)

### Restricciones

- Índice único compuesto: PersonId + NumberId + RoleId

### Decisiones relevantes

- No duplica información de Person, Number ni Role
- Las eliminaciones de una participación no eliminan las entidades principales (DeleteBehavior.Restrict)
- Propiedades de navegación marcadas como `virtual` para Lazy Loading

### Build

- Exitoso: 0 errores, 0 warnings

### Criterios de aceptación cumplidos

- [x] Existe la entidad `PersonByRole`
- [x] Contiene `PersonId`
- [x] Contiene `NumberId`
- [x] Contiene `RoleId`
- [x] Las tres referencias son obligatorias
- [x] Existe relación con `Person`
- [x] Existe relación con `Number`
- [x] Existe relación con `Role`
- [x] Una Persona puede tener múltiples Roles dentro del mismo Número
- [x] Un Rol puede ser utilizado por múltiples Personas dentro del mismo Número
- [x] No puede repetirse la combinación `PersonId + NumberId + RoleId`
- [x] Existe índice único compuesto para garantizar dicha restricción
- [x] La integridad referencial está correctamente configurada
- [x] Las eliminaciones de una participación no eliminan las entidades principales
- [x] La entidad forma parte correctamente del contexto de persistencia
- [x] La migración se genera correctamente
- [x] La documentación de dominio está actualizada
- [x] La solución compila correctamente
- [x] No se implementan endpoints ni servicios administrativos en esta Task