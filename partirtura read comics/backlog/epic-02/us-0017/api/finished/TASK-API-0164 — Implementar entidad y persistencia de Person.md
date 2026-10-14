# TASK-API-0164 — Implementar entidad y persistencia de Person

## ID

TASK-API-0164

## Título

Implementar entidad y persistencia de Person

## Descripción

Implementar la entidad `Person` y su persistencia dentro del catálogo de Comic Library.

Una Persona representa a una persona que participa en una o más obras del catálogo.

La entidad debe ser independiente de los Números y no debe contener información específica de la participación de la persona en una obra.

La relación entre una Persona, un Número y un Rol se realizará mediante la entidad `PersonByRole`, implementada en una Task específica.

Esta Task comprende exclusivamente:

- Entidad de dominio `Person`.
- Configuración de Entity Framework.
- Persistencia.
- Migración de base de datos.
- Documentación del modelo.

La implementación de servicios, repositorios y endpoints administrativos de Persona queda fuera del alcance de esta Task y será realizada posteriormente.

## Contexto

- Epic: EPIC-02 — Gestión del catálogo y contenido editorial
- User Story relacionada: US-0019 — Administrar personas
- User Story principal: US-0017 — Administrar números
- Task relacionada:
  - TASK-API-0163 — Implementar entidades y persistencia de Número y sus relaciones
  - TASK-API-0168 — Implementar endpoints administrativos de Personas y Roles

## Modelo de dominio

Crear la entidad:

```text
Person
```

La entidad debe contener los datos propios de una persona definidos en `project/domain.md`.

Como mínimo debe permitir identificar inequívocamente a la persona mediante su información propia.

No debe contener:

- `NumberId`.
- `RoleId`.
- Información específica de una participación.
- Información duplicada de un Número.
- Información duplicada de un Rol.

La participación de una Persona dentro de un Número se representa mediante:

```text
Person
   ↑
PersonByRole
   ↓
Number
```

y el Rol asociado:

```text
PersonByRole
   ├── Person
   ├── Role
   └── Number
```

## Relaciones

Una Persona puede participar en:

- Múltiples Números.
- Múltiples Roles.
- Múltiples combinaciones Número/Rol.

Ejemplo:

```text
Jhon Doe
    ├── Number #1 → Dibujante
    ├── Number #1 → Entintador
    ├── Number #2 → Dibujante
    └── Number #3 → Portadista
```

Estas relaciones no deben almacenarse directamente en `Person`.

Deben utilizar `PersonByRole`.

## Configuración de Entity Framework

Implementar la configuración de `Person` utilizando el patrón de configuración existente en el proyecto.

Configurar:

- Clave primaria.
- Campos obligatorios.
- Longitudes de campos cuando correspondan.
- Índices que correspondan al modelo.
- Relaciones necesarias con `PersonByRole`, si se exponen mediante navegación.

La configuración debe respetar las convenciones existentes del proyecto.

## Integridad

La entidad `Person` debe poder existir independientemente de que actualmente tenga participaciones en Números.

Por lo tanto:

```text
Person
```

no requiere obligatoriamente una relación con `Number`.

Las referencias hacia una Persona desde `PersonByRole` deben utilizar integridad referencial.

No deben existir referencias a Personas inexistentes.

## Eliminación

La estrategia de eliminación debe respetar las reglas generales del catálogo.

Una Persona que sea referenciada por `PersonByRole` no debe poder eliminarse físicamente si dicha eliminación rompe la integridad referencial.

La eliminación/desactivación concreta de Personas será definida e implementada en la User Story correspondiente.

Esta Task no debe implementar todavía la lógica de activación/desactivación.

## Persistencia

Incorporar `Person` al modelo de Entity Framework y al contexto de persistencia utilizado por la aplicación.

No implementar en esta Task:

- `PersonRepository`.
- `PersonService`.
- Controller de Personas.
- GET de Personas.
- GET by ID de Personas.
- POST de Personas.
- PUT de Personas.
- PATCH de Personas.

Estas capacidades serán implementadas posteriormente en:

```text
TASK-API-0168
```

## Migración

Crear la migración necesaria para incorporar la tabla de Personas.

La migración debe respetar:

- Convenciones de nombres existentes.
- Clave primaria.
- Tipos de datos.
- Longitudes.
- Índices.
- Restricciones necesarias.

No deben generarse tablas ni endpoints adicionales que no correspondan a esta Task.

## Documentación

Actualizar:

```text
project/domain.md
```

para documentar la entidad `Person` y su responsabilidad dentro del dominio.

La documentación debe dejar explícito que:

- Una Persona representa una persona participante en obras.
- Una Persona puede participar en múltiples Números.
- Una Persona puede desempeñar múltiples Roles.
- La relación Número/Persona/Rol se representa mediante `PersonByRole`.

Actualizar la documentación de Persistence correspondiente si el proyecto dispone de un artefacto específico para ella.

## Fuera de alcance

Esta Task no comprende:

- Administración de Personas.
- Alta de Personas.
- Edición de Personas.
- Desactivación de Personas.
- Reactivación de Personas.
- Búsqueda de Personas.
- Endpoint de detalle de Persona.
- Gestión de Roles.
- Gestión de `PersonByRole`.
- Gestión de Números.
- Gestión de Etiquetas.
- Procesamiento CBR.
- Páginas.
- IA.

## Criterios de aceptación

- [ ] Existe la entidad `Person`.
- [ ] La entidad contiene únicamente información propia de la Persona.
- [ ] No contiene `NumberId`.
- [ ] No contiene `RoleId`.
- [ ] La participación en Números se modela mediante `PersonByRole`.
- [ ] Una Persona puede participar en múltiples Números.
- [ ] Una Persona puede desempeñar múltiples Roles.
- [ ] La configuración de Entity Framework está implementada.
- [ ] La entidad forma parte correctamente del contexto de persistencia.
- [ ] La migración de base de datos se genera correctamente.
- [ ] La integridad referencial queda preparada para `PersonByRole`.
- [ ] La documentación de dominio está actualizada.
- [ ] La solución compila correctamente.
- [ ] No se implementan servicios ni endpoints administrativos en esta Task.

## Resultado esperado

La aplicación dispone de una entidad `Person` correctamente integrada al dominio y a la persistencia, preparada para ser utilizada posteriormente por `PersonByRole` y por los servicios administrativos de Personas.

## Resultado

### Entidad creada

| Entidad | Archivo | Descripción |
|---------|---------|-------------|
| Person | `api/Domain/Entities/Person.cs` | Entidad para personas participantes en obras del catálogo |

### Configuración de Entity Framework

| Configuración | Archivo |
|---------------|---------|
| PersonConfiguration | `api/Infrastructure/Persistence/Configurations/PersonConfiguration.cs` |

### Propiedades de Person

- Id (PK)
- Name (obligatorio, max length)
- ImageId (opcional)
- IsActive (objetivo)
- CreatedAt (generado por sistema)
- Navegación: PersonByRoles (virtual para Lazy Loading)

### Decisiones relevantes

- Entidad independiente de Number y Role
- No contiene NumberId ni RoleId directamente
- La relación se modela mediante PersonByRole
- Propiedades de navegación marcadas como `virtual` para Lazy Loading

### Build

- Exitoso: 0 errores, 0 warnings

### Criterios de aceptación cumplidos

- [x] Existe la entidad `Person`
- [x] La entidad contiene únicamente información propia de la Persona
- [x] No contiene `NumberId`
- [x] No contiene `RoleId`
- [x] La participación en Números se modela mediante `PersonByRole`
- [x] Una Persona puede participar en múltiples Números
- [x] Una Persona puede desempeñar múltiples Roles
- [x] La configuración de Entity Framework está implementada
- [x] La entidad forma parte correctamente del contexto de persistencia
- [x] La migración de base de datos se genera correctamente
- [x] La integridad referencial queda preparada para `PersonByRole`
- [x] La documentación de dominio está actualizada
- [x] La solución compila correctamente
- [x] No se implementan servicios ni endpoints administrativos en esta Task