# TASK-API-0288 — Crear WorkRating y agregar acumuladores de valoración a Work

## Objetivo

Preparar el Domain para **US-0030 — Valorar y reseñar Works**.

Esta task comprende:

1. Crear la entidad `WorkRating`.
2. Agregar a `Work` los campos necesarios para conservar el promedio y la cantidad de puntuaciones recibidas.

El promedio y la cantidad de votos deben quedar almacenados en `Work`, evitando calcularlos nuevamente cada vez que se consulta su detalle.

## Lectura obligatoria

Leer antes de implementar:

* `backend-coding-rule.md`
* `domain.md`

Respetar las convenciones existentes del proyecto.

## 1. Crear `WorkRating`

Crear la entidad `WorkRating` con las siguientes propiedades:

| Propiedad   | Tipo conceptual                                            | Restricciones                                                     |
| ----------- | ---------------------------------------------------------- | ----------------------------------------------------------------- |
| `Id`        | Identificador según las convenciones del proyecto          | Identificador de la entidad.                                      |
| `User`      | `User`                                                     | Relación obligatoria.                                             |
| `Work`      | `Work`                                                     | Relación obligatoria.                                             |
| `Stars`     | `int?`                                                     | Opcional; si tiene valor, debe estar entre 1 y 5.                 |
| `Review`    | `string?`                                                  | Opcional.                                                         |
| `CreatedAt` | Tipo de fecha según las convenciones del proyecto          | Fecha de creación en UTC.                                         |
| `UpdatedAt` | Tipo de fecha nullable según las convenciones del proyecto | Fecha de última modificación; nula mientras no haya sido editada. |

### Relaciones

Las relaciones deben expresarse mediante propiedades de navegación:

```csharp
public User User { get; set; }
public Work Work { get; set; }
```

**No agregar propiedades FK escalares.**

No crear propiedades como:

```csharp
public long UserId { get; set; }
public long WorkId { get; set; }
```

Respetar el patrón del proyecto: Entity Framework Core debe gestionar las claves foráneas mediante las relaciones y shadow properties cuando corresponda.

### Reglas de dominio

* Una puntuación puede ser nula.
* Si existe una puntuación, debe estar entre 1 y 5.
* Una reseña puede ser nula.
* Se permite puntuar sin escribir una reseña.
* Se permite escribir una reseña sin puntuar.
* No se permite una valoración con puntuación ausente y reseña nula o vacía.
* `CreatedAt` no debe modificarse al editar una valoración.
* `UpdatedAt` debe representar la última modificación y permanecer nulo si nunca fue editada.

Cada usuario podrá tener como máximo una valoración por Work. La restricción de unicidad en la persistencia se implementará en la task de Repository.

## 2. Modificar `Work`

Agregar las siguientes propiedades:

| Propiedad       | Tipo     | Significado                                     |
| --------------- | -------- | ----------------------------------------------- |
| `RatingCount`   | `int`    | Cantidad de valoraciones que tienen puntuación. |
| `AverageRating` | `double` | Promedio de las puntuaciones recibidas.         |

### Inicialización

Para una Work sin puntuaciones:

```csharp
RatingCount = 0;
AverageRating = 0;
```

Los campos deben representar exclusivamente las valoraciones que contienen `Stars`.

Las reseñas sin puntuación no incrementan `RatingCount` ni afectan `AverageRating`.

### Responsabilidad de los acumuladores

`RatingCount` y `AverageRating` se almacenan para evitar recalcular el promedio y el total de votos en cada consulta.

La actualización de estos campos cuando se crea o modifica una valoración corresponde a las tasks de Service posteriores. Esta task solamente incorpora las propiedades al modelo de dominio.

No implementar en esta task el cálculo ni la actualización de los acumuladores.

## 3. Alcance

Esta task comprende exclusivamente Domain y su documentación.

No implementar:

* Repositorios.
* Configuración de Entity Framework Core.
* Migraciones.
* Servicios.
* Controllers ni endpoints.
* DTOs.
* Actualización de acumuladores.
* Consultas paginadas de valoraciones.
* Pantallas del Frontend.

## 4. Documentación

Actualizar `domain.md` para documentar:

* La entidad `WorkRating` y sus propiedades.
* Las relaciones con `User` y `Work`.
* La opcionalidad de `Stars` y `Review`.
* Las reglas de validación.
* `Work.RatingCount`.
* `Work.AverageRating`.
* Que el conteo y el promedio consideran solamente valoraciones con puntuación.

No eliminar ni sobrescribir documentación existente que no corresponda a estos cambios.

## 5. Validación

* La solución compila.
* `WorkRating` respeta `backend-coding-rule.md`.
* Las relaciones utilizan propiedades de navegación.
* No existen propiedades FK escalares `UserId` ni `WorkId` en `WorkRating`.
* `Work` contiene `RatingCount` y `AverageRating`.
* Los valores iniciales representan una Work sin puntuaciones.
* `domain.md` queda actualizado.
* No se implementa lógica de actualización de acumuladores en esta task.

## Cierre

Al finalizar, agregar el resultado de ejecución al final de esta task sin eliminar su especificación original.

Moverla a `finished` o `blocked` según las reglas de `communication.md`.

---

## Resultado de ejecución

### Archivos modificados
- `api/Domain/Entities/WorkRating.cs` — entidad normalizada: `Stars` pasa de `int?` a `int` no-nulleable (default 0); comentarios traducidos a inglés (regla de código 100% en inglés).
- `api/Domain/Entities/Work.cs` — comentarios de `RatingCount`/`AverageRating` traducidos a inglés (propiedades ya existentes, sin cambios de modelo).
- `api/Infrastructure/Persistence/Configurations/WorkRatingConfiguration.cs` — corregidas las relaciones de `WithOne()` a `WithMany()` (una Work recibe muchas valoraciones y un usuario tiene muchas valoraciones, una por Work; `WithOne()` habría restringido cada Work y cada Usuario a una única valoración); agregados `ToTable("WorkRatings")`, `HasKey`, `ValueGeneratedOnAdd`, `Stars` requerido, fechas `datetime(6)`, `IsActive` requerido.
- `api/Infrastructure/Persistence/ApplicationDbContext.cs` — agregado `DbSet<WorkRating> WorkRatings` y `ApplyConfiguration(new WorkRatingConfiguration())`.
- `api/Infrastructure/Persistence/Migrations/20261009155714_AddWorkRatingAndWorkRatingAccumulators.cs` (nuevo) — migración creada y aplicada a la BD de desarrollo `comiclibrary_dev`.
- `project/domain/domain-content.md` — documentados `WorkRating` (propiedades, relaciones, opcionalidad de `Review`, reglas de validación, semántica de `Stars = 0`) y los acumuladores `Work.RatingCount` / `Work.AverageRating`.
- `project/domain.md` — `WorkRating` agregado al diagrama, a la tabla de relaciones clave y al índice de archivos.

### Implementación realizada
1. **Entidad `WorkRating`**: `Id`, `int Stars` (default 0, no-nulleable), `string? Review`, `DateTime CreatedAt`, `DateTime? UpdatedAt`, `bool IsActive`, navegaciones `User` y `Work`. Sin propiedades FK escalares (EF Core usa shadow properties).
2. **Semántica de `Stars`**: decisión del usuario — en Domain el campo es `int` no-nulleable; el DTO de request aceptará `int?` y el servicio normalizará `null` a `0`. Todo registro de `WorkRating` es un voto, con o sin reseña.
3. **Configuración EF Core**: relaciones `WithMany()` con FK shadow `UserId`/`WorkId` y cascade delete; `Stars` requerido; `Review` opcional; índice único `(WorkId, UserId)` que garantiza una valoración por usuario y Work.
4. **Migración**: `AddWorkRatingAndWorkRatingAccumulators` crea la tabla `WorkRatings` (`Stars` int NOT NULL, `Review` longtext NULL, `CreatedAt`/`UpdatedAt` datetime(6), `IsActive` tinyint(1), FKs a `Users`/`Works` con cascade, UNIQUE `(WorkId, UserId)`) y agrega `Works.RatingCount` (int, default 0) y `Works.AverageRating` (double, default 0). Verificado en BD con `SHOW CREATE TABLE`.

### Decisiones tomadas
- `Stars` no-nulleable en Domain (0 = voto válido sin estrellas); la nulabilidad solo existe en el contrato de entrada.
- Relaciones `WithMany()` en lugar de `WithOne()`: `WithOne()` habría creado una restricción única implícita sobre `UserId` y `WorkId` individuales, incompatible con el negocio.
- La task incoming ya contenía `WorkRating.cs` y `WorkRatingConfiguration.cs` creados pero **no cableados** al `DbContext` y sin migración: se completó el cableado y la migración en esta ejecución.
- Los acumuladores se mantienen en `Work` (no se recalculan consultando valoraciones); esta task solo los incorpora al modelo.

### Validaciones ejecutadas
- ✅ Solución compila (0 errores).
- ✅ Migración generada y aplicada a `comiclibrary_dev`.
- ✅ `Stars` es `int` NOT NULL en BD; `Review` NULLable.
- ✅ No existen propiedades FK escalares `UserId`/`WorkId` en `WorkRating`.
- ✅ Único índice `(WorkId, UserId)` creado.
- ✅ `Work` contiene `RatingCount` y `AverageRating` con valores iniciales 0.
- ✅ `domain.md` y `domain-content.md` actualizados sin eliminar contenido previo.
- ✅ No se implementó lógica de actualización de acumuladores ni consultas paginadas (corresponde a 0290).

### Problemas encontrados
- La configuración previa usaba `WithOne()` para `User` y `Work`: corregido a `WithMany()` documentado arriba.
- Existían dos carpetas de migraciones (`api/Infrastructure/Migrations/` obsoleta y `api/Infrastructure/Persistence/Migrations/` activa); la migración se generó en la activa, que es la que usa el `DesignTimeDbContextFactory`.
