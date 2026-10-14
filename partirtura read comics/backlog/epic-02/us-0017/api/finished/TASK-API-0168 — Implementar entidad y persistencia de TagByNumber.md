# TASK-API-0168 — Implementar entidad y persistencia de TagByNumber

## ID

TASK-API-0168

## Título

Implementar entidad y persistencia de TagByNumber

## Descripción

Implementar la entidad `TagByNumber` y su persistencia para representar la asociación entre Etiquetas y Números del catálogo.

Una Etiqueta puede estar asociada a múltiples Números y un Número puede tener múltiples Etiquetas.

La relación no contiene información adicional: representa exclusivamente la pertenencia de una Etiqueta a un Número.

Esta Task comprende exclusivamente:

- Entidad de dominio `TagByNumber`.
- Configuración de Entity Framework.
- Persistencia.
- Relaciones con `Tag`.
- Relaciones con `Number`.
- Restricciones de integridad.
- Migración de base de datos.
- Documentación del modelo.

La administración de esta relación se realizará desde las operaciones de alta y edición de `Number`.

## Contexto

- Epic: EPIC-02 — Gestión del catálogo y contenido editorial
- User Story: US-0017 — Administrar números
- Tasks relacionadas:
  - TASK-API-0166 — Implementar entidad y persistencia de Tag
  - TASK-API-0163 — Implementar entidad y persistencia de Number
  - TASK-API-0169 — Implementar administración de Etiquetas para Números

## Modelo de dominio

Crear la entidad:

```text
TagByNumber
```

La entidad representa exclusivamente:

```text
Tag + Number
```

Ejemplo:

```text
Multiverso + Number #1
Acción + Number #1
Viajes en el tiempo + Number #1
```

No debe duplicar información de:

- `Tag`.
- `Number`.

## Propiedades

La entidad debe contener:

```text
TagId
NumberId
```

Ambas referencias son obligatorias.

No deben existir otros datos propios en `TagByNumber` mientras no sean definidos explícitamente por el dominio.

## Relaciones

### Tag

`TagByNumber` debe referenciar obligatoriamente una Etiqueta existente.

```text
Tag 1 ──── N TagByNumber
```

Una Etiqueta puede estar asociada a múltiples Números.

### Number

`TagByNumber` debe referenciar obligatoriamente un Número existente.

```text
Number 1 ──── N TagByNumber
```

Un Número puede tener múltiples Etiquetas.

Conceptualmente:

```text
Number #1
    ├── Acción
    ├── Terror
    └── Multiverso
```

## Regla de unicidad

No debe existir más de una asociación entre una misma Etiqueta y un mismo Número.

No debe ser válido:

```text
Number #1 + Terror
Number #1 + Terror
```

Sí debe ser válido:

```text
Number #1 + Terror
Number #1 + Acción
```

La restricción debe reforzarse mediante un índice único compuesto:

```text
TagId + NumberId
```

## Configuración de Entity Framework

Implementar la configuración de `TagByNumber` utilizando el patrón de configuración existente en el proyecto.

Configurar:

- Clave primaria.
- `TagId` obligatorio.
- `NumberId` obligatorio.
- Relación con `Tag`.
- Relación con `Number`.
- Índice único compuesto sobre `TagId` y `NumberId`.

Respetar las convenciones existentes del proyecto para nombres de tablas, claves, índices y relaciones.

## Integridad referencial

Toda asociación debe referenciar entidades existentes.

No debe ser posible persistir:

```text
TagByNumber.TagId
```

apuntando a una Etiqueta inexistente.

No debe ser posible persistir:

```text
TagByNumber.NumberId
```

apuntando a un Número inexistente.

No deben existir relaciones huérfanas.

## Eliminación

Eliminar una asociación `TagByNumber` debe eliminar únicamente la relación.

No debe eliminar:

- La Etiqueta.
- El Número.

La eliminación de una Etiqueta o de un Número deberá respetar las reglas de integridad definidas para las entidades principales.

Configurar las relaciones para evitar cascadas que puedan provocar eliminaciones no deseadas de entidades principales.

## Navegaciones

La relación debe permitir navegar conceptualmente:

```text
TagByNumber
    ├── Tag
    └── Number
```

Y, cuando corresponda según las convenciones del dominio:

```text
Tag
    └── TagByNumbers

Number
    └── TagByNumbers
```

No agregar navegaciones innecesarias únicamente para facilitar consultas puntuales.

## Persistencia

Incorporar `TagByNumber` al contexto de Entity Framework.

La entidad debe quedar preparada para ser utilizada posteriormente por:

- Alta de Número.
- Edición de Número.
- Consulta del detalle de Número.
- Filtrado de Números por Etiquetas.
- Administración de Etiquetas desde Número.

La lógica para resolver etiquetas existentes y crear las que todavía no existen será implementada en:

```text
TASK-API-0169
```

## Migración

Crear la migración necesaria para incorporar la tabla de `TagByNumber`.

La migración debe incluir:

- Clave primaria.
- Foreign Key hacia `Tag`.
- Foreign Key hacia `Number`.
- Índice único compuesto `TagId + NumberId`.
- Restricciones necesarias de integridad.

## Documentación

Actualizar:

```text
project/domain.md
```

para documentar `TagByNumber`.

La documentación debe dejar explícito que:

- Representa la relación entre un Número y una Etiqueta.
- Un Número puede tener múltiples Etiquetas.
- Una Etiqueta puede estar asociada a múltiples Números.
- La combinación `TagId + NumberId` es única.
- La relación no duplica información de Tag ni Number.
- La administración de esta relación se realiza desde el Número.

Actualizar la documentación de Persistence correspondiente si el proyecto dispone de un artefacto específico.

## Fuera de alcance

Esta Task no comprende:

- Administración de Etiquetas.
- Alta de Etiquetas.
- Edición de Etiquetas.
- Búsqueda de Etiquetas.
- Endpoints de `TagByNumber`.
- Gestión de Números.
- Procesamiento CBR.
- Páginas.
- IA para sugerencia de Etiquetas.

## Criterios de aceptación

- [ ] Existe la entidad `TagByNumber`.
- [ ] Contiene `TagId`.
- [ ] Contiene `NumberId`.
- [ ] Ambas referencias son obligatorias.
- [ ] Existe relación con `Tag`.
- [ ] Existe relación con `Number`.
- [ ] Un Número puede tener múltiples Etiquetas.
- [ ] Una Etiqueta puede estar asociada a múltiples Números.
- [ ] No puede repetirse la combinación `TagId + NumberId`.
- [ ] Existe índice único compuesto para garantizar dicha restricción.
- [ ] La integridad referencial está correctamente configurada.
- [ ] Las eliminaciones de una relación no eliminan las entidades principales.
- [ ] La entidad forma parte correctamente del contexto de persistencia.
- [ ] La migración se genera correctamente.
- [ ] La documentación de dominio está actualizada.
- [ ] La solución compila correctamente.
- [ ] No se implementan endpoints ni servicios administrativos en esta Task.

## Resultado esperado

La aplicación dispone de una relación persistente y consistente entre Etiquetas y Números, preparada para administrar las etiquetas desde el formulario de Número y para permitir posteriormente búsquedas y filtros por Etiqueta.

## Resultado

### Entidad creada

| Entidad | Archivo | Descripción |
|---------|---------|-------------|
| TagByNumber | `api/Domain/Entities/TagByNumber.cs` | Relación Etiqueta + Número |

### Configuración de Entity Framework

| Configuración | Archivo |
|---------------|---------|
| TagByNumberConfiguration | `api/Infrastructure/Persistence/Configurations/TagByNumberConfiguration.cs` |

### Propiedades de TagByNumber

- Id (PK)
- TagId (obligatorio, FK a Tag)
- NumberId (obligatorio, FK a Number)
- Navegaciones: Tag, Number (virtual para Lazy Loading)

### Restricciones

- Índice único compuesto: TagId + NumberId

### Decisiones relevantes

- No duplica información de Tag ni Number
- Las eliminaciones de una relación no eliminan las entidades principales (DeleteBehavior.Restrict)
- Propiedades de navegación marcadas como `virtual` para Lazy Loading

### Build

- Exitoso: 0 errores, 0 warnings

### Criterios de aceptación cumplidos

- [x] Existe la entidad `TagByNumber`
- [x] Contiene `TagId`
- [x] Contiene `NumberId`
- [x] Ambas referencias son obligatorias
- [x] Existe relación con `Tag`
- [x] Existe relación con `Number`
- [x] Un Número puede tener múltiples Etiquetas
- [x] Una Etiqueta puede estar asociada a múltiples Números
- [x] No puede repetirse la combinación `TagId + NumberId`
- [x] Existe índice único compuesto para garantizar dicha restricción
- [x] La integridad referencial está correctamente configurada
- [x] Las eliminaciones de una relación no eliminan las entidades principales
- [x] La entidad forma parte correctamente del contexto de persistencia
- [x] La migración se genera correctamente
- [x] La documentación de dominio está actualizada
- [x] La solución compila correctamente
- [x] No se implementan endpoints ni servicios administrativos en esta Task