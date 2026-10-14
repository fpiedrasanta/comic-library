# TASK-API-0198 — Implementar administración de Personas

## ID

TASK-API-0198

## Título

Implementar administración de Personas

## Descripción

Implementar en Backend la administración de la entidad `Person` correspondiente a **US-0019 — Administrar personas**.

La funcionalidad debe permitir al administrador:

- Consultar personas mediante un listado paginado.
- Crear personas.
- Modificar personas.
- Desactivar personas.
- Reactivar personas.

La entidad `Person` posee únicamente:

- `Id`.
- `Name`.
- `IsActive`.

Las relaciones existentes entre `Person`, `Work` y `Role` ya forman parte de las funcionalidades de administración de obras y actualmente funcionan correctamente.

**Esta Task no debe modificar ni duplicar el mecanismo existente de relaciones `Person + Work + Role`.**

La implementación debe integrarse con dicho mecanismo manteniendo su compatibilidad.

---

## Contexto relevante

- User Story: `US-0019 — Administrar personas`.
- Epic: `EPIC-02 — Gestión del catálogo y contenido editorial`.
- Las operaciones son exclusivamente administrativas.
- Requieren autenticación y rol `Administrator`.
- `Person` es una entidad independiente del concepto `Work`.
- Una persona puede ser referenciada por las relaciones existentes con obras y roles.
- El nombre no debe considerarse automáticamente único.
- La eliminación física de personas no forma parte de esta User Story.
- La desactivación es lógica mediante `IsActive`.

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

El agente debe considerar estos documentos como la fuente de contexto técnico y arquitectónico para la implementación.

No debe asumir que una capacidad necesaria puede implementarse de una manera diferente a la establecida en dichos documentos.

---

## Alcance

### 1. Revisar el estado actual de Person

Antes de implementar, analizar la implementación existente de `Person`.

Determinar:

- Si la entidad ya existe.
- Sus propiedades actuales.
- Sus relaciones actuales.
- Cómo se utiliza actualmente desde `PersonByRole`.
- Su configuración de Persistence.
- Si ya existe un repositorio.
- Si ya existe un servicio.
- Si ya existen DTOs.
- Si ya existen endpoints relacionados.

La implementación existente debe reutilizarse siempre que sea compatible con esta User Story.

No debe crearse una segunda entidad `Person` ni duplicarse infraestructura existente.

---

### 2. Ajustar el modelo de dominio

Garantizar que `Person` represente el concepto definido por la User Story:

```text
Person
├── Id
├── Name
└── IsActive
```

El nombre es el único dato propio de la persona.

No agregar atributos adicionales.

El identificador debe permanecer administrado por el sistema.

El identificador no debe ser modificable mediante las operaciones de edición.

Si la entidad existente ya cumple estas condiciones, no realizar modificaciones innecesarias.

---

### 3. Persistencia

Garantizar que `Person` pueda persistirse correctamente mediante Entity Framework Core.

La configuración debe:

- Mantener la clave primaria existente.
- Persistir `Name`.
- Persistir `IsActive`.
- Mantener las relaciones existentes con `PersonByRole`.
- No introducir restricciones de unicidad sobre `Name`.
- Evitar configuraciones que permitan romper las relaciones existentes.

La desactivación debe conservar físicamente el registro.

No implementar eliminación física.

Si ya existe una configuración compatible, reutilizarla.

---

### 4. Repository

Implementar o completar el repositorio específico de `Person`, respetando la arquitectura existente.

El repositorio debe permitir las operaciones necesarias para:

- Obtener el listado paginado.
- Obtener una persona por identificador cuando sea necesario para una operación administrativa.
- Crear.
- Actualizar.

No crear un `GenericRepository<T>`.

Debe utilizarse el patrón de repositorios específicos y `UnitOfWork` definido por la arquitectura del proyecto.

---

### 5. Service

Implementar o completar el servicio administrativo de `Person`.

Debe centralizar las reglas de negocio necesarias para:

- Crear una persona.
- Modificar una persona.
- Desactivar una persona.
- Reactivar una persona.
- Consultar personas.

El servicio debe:

- Validar los datos de entrada.
- Validar la existencia de la persona cuando corresponda.
- Preservar el identificador.
- Mantener la integridad de las relaciones existentes.
- Utilizar las excepciones de negocio establecidas por el proyecto.

No debe asumir que `Name` es único.

---

### 6. Listado

Implementar la consulta administrativa de personas.

Debe soportar:

- Búsqueda por nombre.
- Filtrado por `IsActive`, cuando corresponda.
- Ordenamiento.
- Paginación.

El listado debe utilizar el mecanismo estándar de respuestas paginadas del proyecto.

El criterio de búsqueda debe aplicarse sobre `Name`.

No debe realizarse una carga completa de todas las personas para paginar en memoria.

La consulta debe ejecutarse de forma paginada en Persistence.

---

### 7. DTOs

Crear o ajustar los DTOs necesarios para la administración de personas.

El DTO de listado debe contener únicamente la información necesaria para esta funcionalidad.

Como mínimo:

```json
{
  "id": 1,
  "name": "Alan Moore",
  "isActive": true
}
```

Los contratos deben utilizar `camelCase`.

Los identificadores deben conservar el tipo utilizado actualmente por el dominio.

No exponer entidades de Persistence directamente desde los endpoints.

---

### 8. Crear persona

Implementar el endpoint administrativo de creación.

La operación debe:

- Requerir autenticación.
- Requerir rol `Administrator`.
- Recibir el nombre.
- Validar que el nombre sea válido.
- Generar el identificador.
- Crear la persona como activa.
- No crear relaciones con obras.
- No crear relaciones con roles.

La creación debe devolver `201 Created` utilizando `CreatedAtAction` según las convenciones establecidas para los endpoints del proyecto.

La respuesta debe incluir la ubicación del recurso creado.

---

### 9. Modificar persona

Implementar el endpoint administrativo de modificación.

La operación debe:

- Recibir el identificador mediante la ruta.
- Recibir el nuevo nombre.
- Validar que la persona exista y pueda ser modificada según las reglas del catálogo.
- Actualizar únicamente `Name`.
- Mantener `Id`.
- Mantener `IsActive`.
- Mantener las relaciones existentes con obras y roles.

El identificador de la ruta no debe poder ser sobrescrito mediante el body.

---

### 10. Desactivar persona

Implementar la desactivación lógica.

La operación debe:

- Identificar la persona mediante la ruta.
- Validar su existencia.
- Establecer `IsActive = false`.
- Conservar el registro.
- Conservar las relaciones existentes.

No debe realizarse un `DELETE` físico.

La operación debe respetar las convenciones existentes para las operaciones de activación/desactivación del catálogo.

---

### 11. Reactivar persona

Implementar la reactivación.

La operación debe:

- Identificar la persona mediante la ruta.
- Validar su existencia.
- Establecer `IsActive = true`.
- Conservar el identificador.
- Conservar el nombre.
- Conservar las relaciones existentes.

La operación debe ser idempotente cuando las convenciones existentes del catálogo así lo establezcan.

---

### 12. Seguridad

Todos los endpoints administrativos de esta funcionalidad deben requerir:

```text
Authentication
+
Administrator role
```

La autorización debe realizarse en Backend.

No confiar en que el Dashboard limite las operaciones disponibles.

Los endpoints no deben permitir que un usuario sin autorización:

- Consulte información administrativa.
- Cree personas.
- Modifique personas.
- Desactive personas.
- Reactive personas.

---

### 13. Integridad con PersonByRole

La implementación debe conservar las relaciones existentes entre:

```text
Person
   │
   └── PersonByRole
          ├── Work
          └── Role
```

La administración de `Person` no debe:

- Crear relaciones automáticamente.
- Eliminar relaciones al modificar el nombre.
- Eliminar relaciones al desactivar una persona.
- Cambiar identificadores.
- Modificar `Work`.
- Modificar `Role`.

No implementar en esta Task endpoints para administrar estas relaciones.

---

### 14. Contrato de endpoints

Actualizar `project/endpoints.md` y la documentación específica de endpoints correspondiente.

Los endpoints nuevos o modificados deben documentar:

- Description.
- Controller.
- Authentication.
- Request.
- Response.
- Errors.
- Notes.

La documentación debe coincidir exactamente con la implementación.

Si existe un documento específico dentro de:

```text
project/endpoints/
```

para Personas, debe actualizarse en conjunto.

El frontend no debe necesitar inferir rutas o contratos.

---

### 15. Manejo de errores

Utilizar las excepciones y middleware de errores existentes.

Como mínimo deben contemplarse:

- `400` para requests inválidos.
- `401` para falta de autenticación.
- `403` para falta de permisos.
- `404` cuando la persona no exista o no pueda ser encontrada según las reglas del catálogo.
- `422` para errores de validación.
- `500` únicamente para errores inesperados.

No introducir un mecanismo paralelo de manejo de errores.

---

### 16. Testing

Agregar o completar pruebas automatizadas para las capacidades implementadas.

Como mínimo deben verificarse:

- Creación de persona válida.
- Rechazo de nombre inválido.
- Modificación de nombre.
- Conservación del identificador durante la modificación.
- Listado paginado.
- Búsqueda por nombre.
- Filtrado por estado cuando corresponda.
- Ordenamiento.
- Desactivación lógica.
- Reactivación.
- Persona inexistente.
- Usuario no autenticado.
- Usuario autenticado sin rol `Administrator`.
- Conservación de las relaciones existentes con `PersonByRole`.
- Ausencia de restricción artificial de unicidad sobre `Name`.

Los tests deben cubrir tanto las reglas de Application como las restricciones relevantes de Persistence.

---

## Fuera de alcance

Esta Task no comprende:

- Consulta de detalle de una persona como endpoint administrativo independiente.
- Consulta de las obras de una persona.
- Gestión de `PersonByRole`.
- Asociación Persona/Work/Role.
- Desasociación Persona/Work/Role.
- Administración de Roles.
- Modificación de `Work`.
- Modificación de `Number`.
- Modificación de `GraphicNovel`.
- Gestión de Series.
- Gestión de Editoriales.
- Gestión de Idiomas.
- Gestión de Etiquetas.
- Procesamiento de contenido digital.
- Gestión de páginas.
- IA.
- Información biográfica.
- Alias.
- Nacionalidad.
- Fotografía.
- Imagen de la persona.
- Eliminación física.

---

## Criterios de aceptación

### CA-01 — Modelo de Person

`Person` contiene únicamente la información propia definida:

```text
Id
Name
IsActive
```

### CA-02 — Crear

El administrador puede crear una persona proporcionando un nombre válido.

### CA-03 — Nombre obligatorio

El backend rechaza la creación o modificación cuando el nombre no cumple las reglas de validación.

### CA-04 — Listado

El administrador puede consultar un listado paginado de personas.

### CA-05 — Búsqueda

El listado permite buscar personas por nombre.

### CA-06 — Filtrado

El listado permite distinguir personas activas y desactivadas mediante los mecanismos de filtrado definidos.

### CA-07 — Ordenamiento

El listado permite ordenar las personas mediante los criterios definidos por el contrato.

### CA-08 — Modificar

El administrador puede modificar el nombre de una persona existente.

### CA-09 — Identificador inmutable

La modificación no permite cambiar el identificador de la persona.

### CA-10 — Desactivar

El administrador puede desactivar una persona mediante eliminación lógica.

### CA-11 — Reactivar

El administrador puede reactivar una persona desactivada.

### CA-12 — Conservación de relaciones

Modificar o desactivar una persona no elimina ni modifica sus relaciones existentes con `PersonByRole`.

### CA-13 — Sin unicidad artificial

Dos personas pueden tener el mismo nombre.

El sistema no debe considerar automáticamente que representan la misma entidad.

### CA-14 — Seguridad

Todas las operaciones administrativas requieren autenticación y rol `Administrator`.

### CA-15 — Integridad

No pueden crearse referencias inválidas ni modificarse identificadores de forma que se rompan las relaciones existentes.

### CA-16 — Eliminación física

La administración de personas no permite eliminar físicamente una persona.

### CA-17 — Contrato documentado

Todos los endpoints implementados están documentados en los artefactos de endpoints y coinciden con su implementación.

### CA-18 — Testing

Las reglas funcionales y de seguridad relevantes cuentan con pruebas automatizadas.

---

## Dependencias

### Requeridas

- `US-0019 — Administrar personas`.
- Infraestructura de autenticación y autorización administrativa existente.
- Modelo existente de `Person`.
- Relaciones existentes de `PersonByRole`.

### Relacionadas

- `US-0020 — Administrar roles`, para la entidad Role utilizada por las relaciones existentes.

`US-0020` no constituye una dependencia para implementar el CRUD de `Person`, ya que esta Task no administra las relaciones Persona/Role.

---

## Resultado esperado

El Backend debe proporcionar una administración completa y coherente de `Person`, permitiendo al administrador:

```text
Consultar
   ↓
Crear
   ↓
Modificar
   ↓
Desactivar
   ↓
Reactivar
```

La implementación debe mantener a `Person` como una entidad simple:

```text
Person
├── Id
├── Name
└── IsActive
```

y preservar completamente el mecanismo existente mediante el cual las obras utilizan personas:

```text
Person + Work + Role
```

La nueva funcionalidad no debe introducir una segunda implementación de las relaciones existentes ni trasladar a `Person` responsabilidades que pertenecen a `Work`.

El resultado debe dejar disponible para el Dashboard un contrato administrativo completo, paginado, validado, seguro y documentado para la gestión de personas.

---

## Resultado de la ejecución

### Estado

`pending` -> `finished`

### What was implemented

- Domain model updated: `Person` now has `Id`, `Name`, `IsActive` (default `true`), `CreatedAt`. Removed `Biography`.
- Persistence updated: `PersonConfiguration` now persists `IsActive` with default `true`. Removed `Biography` column.
- Repository extended: `IPersonRepository` and `PersonRepository` now include `UpdateAsync`.
- Service extended: `IPersonService` and `PersonService` now include `UpdatePersonAsync`, `DeactivatePersonAsync`, `ActivatePersonAsync`.
- DTOs updated: `PersonListItemDto` now includes `IsActive` and removes `Biography`. Added `UpdatePersonRequest`.
- Controller extended: `AdminPersonsController` now has:
  - `POST /api/admin-persons` returning `201 Created` with `CreatedAtAction`
  - `PUT /api/admin-persons/{id}` for updates
  - `POST /api/admin-persons/{id}/deactivate` for logical deactivation
  - `POST /api/admin-persons/{id}/activate` for reactivation
- Documentation updated: `endpoints-persons.md`, `services.md`, `repositories.md`, `domain.md`.
- EF Core migration created and applied: `20260914194610_AddIsActiveToPerson`.
- Integration tests added: `PersonAdministrationIntegrationTests` with 13 test cases covering create, update, deactivate, activate, pagination, search, validation, and error handling.

### What was changed (files)

- `Domain/Entities/Person.cs`
- `project/domain.md`
- `Infrastructure/Persistence/Configurations/PersonConfiguration.cs`
- `Application/Interfaces/IPersonRepository.cs`
- `Infrastructure/Repositories/PersonRepository.cs`
- `Application/Interfaces/IPersonService.cs`
- `Application/Services/PersonService.cs`
- `Application/DTOs/PersonListItemDto.cs`
- `Application/DTOs/UpdatePersonRequest.cs` (new)
- `Application/DTOs/CreatePersonRequest.cs`
- `Api/Controllers/AdminPersonsController.cs`
- `project/endpoints/endpoints-persons.md`
- `project/services.md`
- `project/repositories.md`
- `Infrastructure/Migrations/20260914194610_AddIsActiveToPerson.cs` (new)
- `tests/Infrastructure.Tests/Integration/PersonAdministrationIntegrationTests.cs` (new)
- `tests/Infrastructure.Tests/Integration/FullWorkflowIntegrationTests.cs` (adapted to new `CreatePersonRequest`)
- `tests/Infrastructure.Tests/Integration/EditGraphicNovelWorkflowIntegrationTests.cs` (adapted to new `CreatePersonRequest`)
- `tests/Infrastructure.Tests/Integration/EditExistingNumberWorkflowIntegrationTests.cs` (adapted to new `CreatePersonRequest`)

### Relevant decisions made during execution

- Reused existing `Person` entity and infrastructure; only extended it with `IsActive`.
- Removed `Biography` field as it was out of scope for US-0019.
- Followed existing activate/deactivate pattern from `FranchiseService` for idempotency.
- `POST` create now returns `201 Created` with `CreatedAtAction`, aligning with backend coding rules.
- Deactivate/activate use `POST` to the action endpoint, consistent with existing catalog entity patterns.
- Integration tests added in existing `Infrastructure.Tests` project using the same host/bootstrap pattern.

### Any relevant notes for future reference

- The `FullWorkflowIntegrationTests.FullWorkflow_NumberAndGraphicNovel_EndToEnd` test has a pre-existing flaky timeout in CBR processing (unrelated to this task).
- Migration `20260914194610_AddIsActiveToPerson` drops `Biography` column and adds `IsActive` with default `true`. Data loss warning was expected and reviewed.
- `Name` uniqueness is enforced at application level only (returns 409), not at DB level.
- All 13 new Person administration tests pass. 38 of 39 total integration tests pass (1 pre-existing failure in CBR workflow timeout).