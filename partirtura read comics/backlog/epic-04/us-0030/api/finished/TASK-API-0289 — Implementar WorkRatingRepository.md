# TASK-API-0289 — Implementar WorkRatingRepository

## Objetivo

Implementar el repositorio de `WorkRating` para crear, editar, consultar y listar las valoraciones de Works.

La implementación debe respetar la arquitectura, las convenciones de persistencia y los patrones existentes del Backend/API.

## Contexto obligatorio

Leer antes de implementar:

* `backend-agent.md`
* `project.md`
* `backend-architecture.md`
* `backend-stack-technology.md`
* `backend-coding-rules.md`
* `project/domain/domain.md`
* `project/repositories.md`

Revisar los repositorios existentes para mantener sus convenciones de implementación, consultas, paginación, filtrado y ordenamiento.

## Alcance

### 1. Crear WorkRating

Implementar la operación para agregar una entidad `WorkRating` al contexto de persistencia.

### 2. Editar WorkRating

Implementar la operación para actualizar una entidad `WorkRating` existente.

La entidad debe permanecer vinculada al contexto de persistencia para que EF Core registre sus modificaciones.

### 3. Obtener WorkRating por Id

Implementar la consulta por identificador.

Requisitos:

* Retornar una entidad `WorkRating`.
* No utilizar `AsNoTracking()`.
* No utilizar `Include()`.
* Aprovechar el Lazy Loading existente.

### 4. Obtener WorkRating por usuario y Work

Implementar la consulta que permita obtener la valoración de un usuario para una Work determinada.

Requisitos:

* Buscar por la combinación de usuario y Work.
* Retornar una entidad `WorkRating`.
* No utilizar `AsNoTracking()`.
* No utilizar `Include()`.
* Aprovechar el Lazy Loading existente.
* Respetar la restricción de una única valoración por usuario y Work definida por el modelo y la configuración de persistencia.

### 5. Obtener listado paginado de WorkRating

Implementar una consulta para listar valoraciones con paginación, filtros y ordenamiento.

**Filtros:**

* Por `Work`.

**Ordenamiento:**

* `Stars`.
* `CreatedAt`.
* Dirección ascendente o descendente.

Requisitos:

* Utilizar `AsNoTracking()`.
* Incluir mediante `Include()` las relaciones necesarias para construir los resultados del listado, como el usuario y los datos requeridos para mostrar su identidad.
* Aplicar filtros y ordenamiento en la consulta antes de materializar los resultados.
* Implementar la paginación siguiendo las convenciones existentes del proyecto.
* Garantizar un orden determinista cuando existan valores iguales en el campo principal de ordenamiento.
* Devolver la información de paginación según los contratos existentes del proyecto.

Los votos con `Stars = 0` deben incluirse en los resultados. No deben tratarse como valoraciones inexistentes.

## Restricciones

* No modificar `WorkRepository`.
* No modificar entidades ni reglas de negocio en esta task.
* No implementar lógica de cálculo o actualización de `RatingCount` o `AverageRating`.
* No implementar servicios ni endpoints.
* No modificar contratos HTTP.
* No duplicar mecanismos de paginación existentes.
* No agregar `Include()` a las consultas individuales que deben utilizar Lazy Loading.

## Documentación

Actualizar `project/repositories.md` con el repositorio y sus operaciones.

Si la documentación del proyecto mantiene catálogos específicos de repositorios, actualizar también el catálogo correspondiente a `WorkRating`, siguiendo la estructura existente.

## Validación

* Compilar el Backend/API.
* Verificar que las operaciones de creación y edición sigan los patrones de persistencia existentes.
* Verificar que las consultas individuales sean rastreadas y no utilicen `Include()`.
* Verificar que el listado utilice `AsNoTracking()` e incluya las relaciones necesarias.
* Verificar filtros, paginación, ambos campos de ordenamiento y ambas direcciones.
* Verificar que los votos de cero estrellas no sean excluidos.
* Confirmar que `WorkRepository` no haya sido modificado.

## Resultado de ejecución

Al finalizar, agregar a esta task un resumen de los archivos modificados, las decisiones tomadas, las validaciones ejecutadas y sus resultados, sin eliminar el contenido original.

Mover la task a `finished` o `blocked`, según corresponda, siguiendo `communication.md`.

---

## Resultado de ejecución

### Archivos modificados
- `api/Application/Interfaces/IWorkRatingRepository.cs` (nuevo) — contrato del repositorio.
- `api/Application/Constants/WorkRatingSortFields.cs` (nuevo) — constantes de ordenamiento admitidas (`Stars`, `CreatedAt`), evitando strings mágicos.
- `api/Infrastructure/Repositories/WorkRatingRepository.cs` (nuevo) — implementación.
- `api/Application/Interfaces/IUnitOfWork.cs` — agregada la propiedad `WorkRatingRepository`.
- `api/Infrastructure/Repositories/UnitOfWork.cs` — resolución del repositorio sobre el `ApplicationDbContext` compartido (mismo patrón que `WorkReadingProgressRepository`).
- `project/repositories.md` — `WorkRatingRepository` agregado a la tabla de referencia rápida.
- `project/repositories/repositories-catalog.md` — documentada la sección `WorkRatingRepository`.

### Implementación realizada
- **`GetByIdAsync` / `GetByUserIdAndWorkIdAsync`**: consultas individuales **rastreadas** (sin `AsNoTracking`, sin `Include`) para que el servicio pueda mutar la entidad y usar Lazy Loading en las navegaciones `User`/`Work`. La búsqueda por usuario + Work se resuelve por las navegaciones (`wr.User.Id`, `wr.Work.Id`), igual que `WorkReadingProgressRepository`, porque las FKs son shadow properties.
- **`GetPagedByWorkIdAsync`**: `AsNoTracking()`, filtro por Work y por `IsActive`, `Include(wr => wr.User).ThenInclude(user => user.Avatar)` para construir la identidad del votante sin N+1, ordenamiento por `Stars` o `CreatedAt` ascendente/descendente con `ThenBy(Id)` como desempate determinista, y paginación (`Skip`/`Take`) aplicada en la consulta antes de materializar. Devuelve `(items, totalCount)` como los repositorios paginados existentes. Los votos con `Stars = 0` son filas ordinarias y nunca se excluyen.
- **`AddAsync` / `UpdateAsync`**: siguen el patrón de `WorkTypeRepository` (`AddAsync` asíncrono; `UpdateAsync` marca la entidad para que EF Core registre sus modificaciones).

### Decisiones tomadas
- Solo se documenta el filtro por `Work` (y ratings activos) porque la task 0289 no define un filtro por `Stars`; la opcionalidad de ese filtro queda fuera del contrato del repositorio.
- El listado incluye `Avatar` del usuario vía `ThenInclude` porque la US requiere mostrar avatar y nombre en cada valoración.
- `WorkRatingRepository` se expone a través de `IUnitOfWork` (no se registra por separado en DI), igual que el resto de los repositorios.
- `WorkRepository` no fue modificado.

### Validaciones ejecutadas
- ✅ Compilación de la solución: 0 errores.
- ✅ Las consultas individuales son rastreadas y no usan `Include()` (revisión de código; la comprobación conductual con BD real se ejecuta en los tests de integración de TASK-API-0292).
- ✅ El listado usa `AsNoTracking()` e incluye las relaciones necesarias.
- ✅ Ordenamiento por ambos campos y ambas direcciones, con desempate determinista por `Id`.
- ✅ Votos de cero estrellas no excluidos (no existe ningún filtro por puntuación).
- ✅ `WorkRepository` sin modificaciones.

### Problemas encontrados
- Error de compilación inicial por usar una llamada a método como patrón constante en un `switch` expression (`WorkRatingSortFields.Stars.ToLowerInvariant()`); corregido usando `string.Equals` con `StringComparison.OrdinalIgnoreCase`.
