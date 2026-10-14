# TASK-API-0199 — Implementar persistencia y repositorio de Personas

## ID

TASK-API-0199

## Título

Implementar persistencia y repositorio de Personas

## Descripción

Implementar o completar la persistencia de la entidad `Person` y su repositorio específico, de acuerdo con `US-0019 — Administrar personas`.

Esta Task debe dejar disponible para las capas superiores una implementación de Persistence capaz de consultar, crear y modificar personas, incluyendo su estado de actividad.

La entidad `Person` debe mantenerse simple:

```text
Person
├── Id
├── Name
└── IsActive
```

Las relaciones existentes entre `Person`, `Work` y `Role` deben conservarse sin modificación funcional.

Esta Task no implementa servicios ni endpoints.

---

## Contexto relevante

- User Story: `US-0019 — Administrar personas`.
- Epic: `EPIC-02 — Gestión del catálogo y contenido editorial`.
- `Person` es una entidad independiente del concepto `Work`.
- `Person` ya participa en las relaciones existentes mediante `PersonByRole`.
- La gestión de dichas relaciones no forma parte de esta User Story.
- El nombre de una persona no debe considerarse automáticamente único.
- La eliminación física de personas no forma parte del alcance.
- La desactivación se representa mediante `IsActive`.

### Documentación obligatoria

Antes de realizar cualquier modificación, el agente **debe leer obligatoriamente y en su totalidad**:

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
project/endpoints/
project/services/
```

El agente debe utilizar estos documentos como fuente de verdad para la arquitectura, tecnología, convenciones y estructura existente.

---

## Alcance

### 1. Revisar la entidad Person existente

Analizar la implementación actual de `Person`.

Determinar:

- Ubicación de la entidad.
- Propiedades existentes.
- Clave primaria.
- Relaciones existentes.
- Uso desde `PersonByRole`.
- Configuración actual de Entity Framework Core.
- Existencia de `DbSet<Person>`.
- Existencia de repositorio.
- Existencia de configuración específica de Persistence.

Antes de crear nuevos elementos, reutilizar los existentes cuando sean compatibles.

No crear una segunda entidad `Person`.

---

### 2. Modelo de Persistence

Garantizar que Persistence pueda almacenar:

```text
Id
Name
IsActive
```

La configuración debe respetar el modelo de dominio existente.

`Name` debe ser obligatorio según las reglas definidas para `Person`.

No agregar una restricción de unicidad sobre `Name`.

El identificador debe mantenerse como clave primaria y no debe modificarse mediante operaciones normales de actualización.

---

### 3. Relaciones existentes

La configuración de Entity Framework Core debe conservar las relaciones existentes de `Person` con `PersonByRole`.

La implementación de esta Task no debe:

- Crear un nuevo mecanismo de relación.
- Duplicar `PersonByRole`.
- Modificar la relación existente entre Person, Work y Role salvo que sea estrictamente necesario para corregir una inconsistencia detectada.
- Eliminar relaciones al modificar una persona.
- Eliminar relaciones al desactivar una persona.

Si se detecta una inconsistencia estructural existente, documentarla antes de realizar un cambio que exceda el alcance.

---

### 4. DbContext

Garantizar que `Person` esté correctamente integrada en el `DbContext`.

Reutilizar la configuración existente del proyecto.

No duplicar configuraciones en `OnModelCreating` cuando exista una configuración específica de entidad.

La configuración debe seguir el patrón utilizado por las demás entidades del catálogo.

---

### 5. Migración

Si los cambios de Persistence requieren modificaciones del esquema de base de datos, crear la migración correspondiente utilizando la estrategia establecida por el proyecto.

La migración debe ser consistente con el modelo actual y no debe eliminar información existente.

Si `Person` ya está correctamente persistida y no requiere cambios de esquema, no crear una migración innecesaria.

---

### 6. Repository

Implementar o completar el repositorio específico de `Person`.

Debe respetarse el patrón de repositorios utilizado actualmente por el proyecto.

No implementar:

```text
GenericRepository<T>
```

El repositorio específico debe permitir las operaciones requeridas por las capas superiores:

- Consulta paginada.
- Consulta por identificador.
- Inserción.
- Actualización.

No debe contener reglas de negocio que correspondan al Service.

---

### 7. Consulta paginada

El repositorio debe permitir consultar personas de forma paginada.

La consulta debe poder recibir los parámetros definidos por la capa superior para:

- Página.
- Tamaño de página.
- Búsqueda por nombre.
- Estado de actividad.
- Ordenamiento.

La paginación debe ejecutarse en base de datos.

No debe:

1. Obtener todas las personas.
2. Materializar la colección completa.
3. Filtrar y paginar en memoria.

La consulta debe permanecer como `IQueryable` hasta aplicar los operadores necesarios para ejecutar la consulta.

---

### 8. Búsqueda

La búsqueda debe realizarse sobre `Name`.

Debe utilizarse el mecanismo de comparación establecido por el proyecto y compatible con el proveedor MySQL utilizado.

No introducir una estrategia específica de búsqueda que contradiga las convenciones existentes del proyecto.

La búsqueda no debe convertir toda la tabla en memoria.

---

### 9. Ordenamiento

El repositorio debe permitir ordenar el listado según los criterios que establezca el contrato administrativo.

La implementación debe evitar concatenar SQL manualmente.

Los criterios deben resolverse mediante expresiones LINQ seguras.

No utilizar nombres de propiedades proporcionados directamente por el cliente para construir SQL dinámico.

---

### 10. Estado de actividad

El repositorio debe permitir modificar `IsActive`.

La desactivación debe conservar físicamente el registro.

La reactivación debe volver a establecer:

```text
IsActive = true
```

No implementar eliminación física.

---

### 11. UnitOfWork

Integrar el repositorio con `IUnitOfWork` y su implementación concreta según la arquitectura existente.

No crear una instancia independiente de `DbContext` dentro del repositorio.

El repositorio debe utilizar la instancia de contexto administrada por la infraestructura existente.

Las operaciones de persistencia deben respetar el mecanismo de transacciones y `SaveChangesAsync` definido por `UnitOfWork`.

---

### 12. Integridad con PersonByRole

Las operaciones de Persistence sobre `Person` deben preservar las relaciones existentes.

Modificar:

```text
Person.Name
```

no debe modificar:

```text
PersonByRole
```

Modificar:

```text
Person.IsActive
```

tampoco debe eliminar relaciones existentes.

La eliminación física no debe implementarse.

---

### 13. Testing de Persistence

Agregar o completar pruebas automatizadas para la persistencia de `Person`.

Como mínimo deben verificarse:

- Creación de una persona.
- Persistencia de `Name`.
- Persistencia de `IsActive`.
- Consulta por identificador.
- Consulta paginada.
- Búsqueda por nombre.
- Filtrado por estado.
- Ordenamiento.
- Actualización del nombre.
- Desactivación.
- Reactivación.
- Conservación de relaciones existentes con `PersonByRole`.
- Ausencia de restricción artificial de unicidad sobre `Name`.

Las pruebas deben utilizar las herramientas y patrones de testing ya establecidos en el proyecto.

---

## Fuera de alcance

Esta Task no comprende:

- Servicios de Application.
- DTOs.
- Mappers.
- Controllers.
- Endpoints HTTP.
- Autorización.
- Validación de requests HTTP.
- Gestión de errores HTTP.
- Administración de relaciones Person/Work/Role.
- Administración de Roles.
- Consulta de obras de una persona.
- Consulta de detalle administrativo.
- Eliminación física.
- Funcionalidades de Dashboard.
- Funcionalidades de UX/UI.

---

## Criterios de aceptación

### CA-01 — Persistencia

`Person` puede persistirse correctamente con sus propiedades:

```text
Id
Name
IsActive
```

### CA-02 — Identificador

El identificador funciona como clave primaria y no requiere modificación durante las operaciones normales de actualización.

### CA-03 — Nombre

`Name` se persiste correctamente y no posee una restricción de unicidad artificial.

### CA-04 — Estado

`IsActive` se persiste correctamente y puede actualizarse.

### CA-05 — Relaciones

Las relaciones existentes con `PersonByRole` se conservan al modificar o desactivar una persona.

### CA-06 — Repositorio específico

Existe un repositorio específico para `Person` integrado con `IUnitOfWork`.

### CA-07 — Sin Generic Repository

No se introduce un `GenericRepository<T>` para resolver esta funcionalidad.

### CA-08 — Paginación

La consulta de personas utiliza paginación ejecutada en base de datos.

### CA-09 — Búsqueda

El repositorio permite filtrar por nombre sin materializar previamente toda la colección.

### CA-10 — Estado

El repositorio permite filtrar por `IsActive`.

### CA-11 — Ordenamiento

El repositorio permite ordenar utilizando LINQ y sin SQL dinámico inseguro.

### CA-12 — Sin eliminación física

El repositorio no implementa eliminación física como mecanismo de administración de personas.

### CA-13 — UnitOfWork

El repositorio utiliza el `DbContext` administrado por la infraestructura existente y respeta `UnitOfWork`.

### CA-14 — Testing

Las operaciones de Persistence relevantes cuentan con pruebas automatizadas.

### CA-15 — Compatibilidad

La implementación mantiene funcionando las relaciones existentes entre `Person`, `Work` y `Role`.

---

## Dependencias

### Requeridas

- `US-0019 — Administrar personas`.
- Modelo de dominio existente de `Person`.
- `PersonByRole` existente.
- Infraestructura actual de Entity Framework Core.
- `IUnitOfWork` y su implementación concreta.

### Predecesora

- `TASK-API-0198 — Implementar administración de Personas`.

---

## Resultado esperado

Persistence debe proporcionar una implementación completa y coherente para almacenar y consultar `Person`, sin alterar las relaciones existentes con las obras.

El resultado debe permitir a las capas superiores trabajar con:

```text
Person
├── Id
├── Name
└── IsActive
```

mediante un repositorio específico integrado al `UnitOfWork`.

La persistencia debe estar preparada para que las siguientes Tasks implementen las reglas de Application y los endpoints administrativos sin necesidad de acceder directamente al `DbContext`.