# TASK-API-0287 — Completar la persistencia y cálculo del progreso de lectura de una Work

## Objetivo

Completar la persistencia y cálculo del progreso de lectura de una `Work`.

La entidad `WorkReadingProgress` ya permite almacenar la última posición (`CurrentPage`) de un usuario sobre una Work. Esta task debe ampliar el dominio y adaptar el servicio para almacenar también:

* cantidad total de páginas;
* porcentaje de lectura;
* fecha de última lectura;
* estado de lectura.

La funcionalidad continúa formando parte de **US-0029 — Reader de una Work**.

Esta task modifica únicamente **Domain** y **Service**. No modificar endpoints ni contratos HTTP en esta task.

---

## Contexto

`CurrentPage` representa la **posición del Reader**, utilizando numeración 1-based.

Una Work de `10` páginas tiene `11` posiciones posibles en el Reader:

```text
CurrentPage = 1  → página 1       → 0%
CurrentPage = 2  → página 2      → 10%
CurrentPage = 3  → página 3      → 20%
...
CurrentPage = 10 → página 10     → 90%
CurrentPage = 11 → formulario final → 100%
```

La posición `TotalPages + 1` no corresponde a una página física. Representa el estado final del Reader, donde posteriormente se podrá mostrar el formulario de evaluación/comentarios.

Por lo tanto:

```text
Reader positions = 1 .. TotalPages + 1
```

y:

```text
PercentageReading = (CurrentPage - 1) * 100 / TotalPages
```

El porcentaje debe representar cuánto contenido físico de la Work fue leído, no la posición relativa dentro del Reader.

---

# Domain

## Entidad `WorkReadingProgress`

Actualizar `WorkReadingProgress` para incluir:

* `CurrentPage`
* `TotalPages`
* `PercentageReading`
* `LastReadAt`
* `State`
* `Work`
* `User`

Mantener la relación existente:

```text
WorkReadingProgress
 ├── Work
 └── User
```

La entidad debe continuar siguiendo las convenciones existentes del proyecto.

No agregar propiedades escalares de FK para `Work` o `User` si el proyecto utiliza las relaciones mediante navigation properties y shadow properties de EF Core.

---

## Valores iniciales

Cuando se crea por primera vez un `WorkReadingProgress`:

```csharp
var progress = new WorkReadingProgress
{
    Work = work,
    User = user,
    CurrentPage = 0,
    TotalPages = work.Pages.Count,
    PercentageReading = 0,
    LastReadAt = DateTimeOffset.UtcNow
};
```

El estado inicial debe representar que la Work está siendo leída.

No persistir un estado `NotStarted`.

---

## Estado de lectura

El dominio debe contemplar únicamente los estados:

```text
Reading
Completed
```

Reglas:

* `CurrentPage < TotalPages + 1` → `Reading`.
* `CurrentPage >= TotalPages + 1` → `Completed`.
* La posición `TotalPages + 1` representa el formulario final y corresponde a `100%`.

No utilizar `WorkType` para determinar el estado.

---

# Service

Actualizar la lógica de `UpdateReadingProgressAsync`.

## Creación

Si no existe un `WorkReadingProgress` para la combinación:

```text
User + Work
```

el servicio debe:

1. Obtener la Work.
2. Validar que exista y esté activa.
3. Obtener el User.
4. Obtener la cantidad actual de páginas de la Work.
5. Crear `WorkReadingProgress`.
6. Inicializar:

```text
CurrentPage = 0
TotalPages = Work.Pages.Count
PercentageReading = 0
LastReadAt = UtcNow
State = Reading
```

7. Agregar la entidad mediante el repositorio existente.

---

## Actualización

Si el progreso ya existe:

* actualizar `CurrentPage`;
* conservar `TotalPages` según la cantidad de páginas de la Work;
* recalcular `PercentageReading`;
* actualizar `LastReadAt`;
* recalcular `State`.

La fórmula del porcentaje es:

```csharp
PercentageReading =
    TotalPages == 0
        ? 0
        : (CurrentPage - 1) * 100 / TotalPages;
```

Ejemplo para una Work de 10 páginas:

```text
CurrentPage  PercentageReading
-----------  -----------------
1            0%
2            10%
3            20%
4            30%
5            40%
6            50%
7            60%
8            70%
9            80%
10           90%
11           100%
```

---

## Fecha de última lectura

Cada actualización válida del progreso debe actualizar:

```csharp
LastReadAt = DateTimeOffset.UtcNow;
```

La fecha debe representar la última interacción del usuario con la lectura de esa Work.

No almacenar una fecha calculada ni una fecha proveniente del cliente.

---

## Estado

Determinar el estado a partir de la posición actual:

```text
CurrentPage < TotalPages + 1
    → Reading

CurrentPage >= TotalPages + 1
    → Completed
```

Una Work pasa a `Completed` cuando el usuario avanza desde la última página física hacia la posición final.

Al volver a abrir una Work completada, el progreso debe conservar:

```text
CurrentPage = TotalPages + 1
PercentageReading = 100
State = Completed
```

No reiniciar automáticamente la lectura.

Si posteriormente el usuario navega nuevamente hacia una página anterior, el servicio debe permitir actualizar el progreso normalmente, por lo que el estado puede volver a `Reading` y el porcentaje debe recalcularse.

---

## Validaciones

Mantener las validaciones existentes y agregar las necesarias para garantizar:

* `WorkId > 0`;
* `UserId > 0`;
* `CurrentPage >= 1` cuando el valor representa una posición enviada por el Reader;
* `CurrentPage` no debe superar indefinidamente la posición final válida;
* `TotalPages` debe obtenerse desde la Work y no desde el cliente;
* la Work debe existir y estar activa;
* el User debe existir.

La posición final válida es:

```text
TotalPages + 1
```

Si se recibe un valor superior, normalizarlo a la posición final o rechazarlo según la convención de validación ya utilizada por el servicio. No permitir estados inconsistentes como porcentajes superiores al 100%.

---

# Restricciones

* No modificar endpoints en esta task.
* No modificar contratos HTTP en esta task.
* No agregar lógica de progreso al Controller.
* No obtener `TotalPages` desde el Frontend.
* No recibir `TotalPages` desde el cliente.
* No recibir `PercentageReading` desde el cliente.
* No recibir `LastReadAt` desde el cliente.
* No recibir `State` desde el cliente.
* No inferir el progreso mediante `Number`, `PublicationDate` u otros datos de la Work.
* No utilizar `WorkType` para determinar el estado.
* No crear un mecanismo separado de `NotStarted`.
* Mantener `WorkReadingProgress` como relación única entre User y Work.

---

# Documentación

Actualizar:

* `project/domain/domain.md`
* `project/services/services.md`
* documentación específica de servicios si corresponde.

La documentación debe reflejar:

* nuevos campos de `WorkReadingProgress`;
* estados `Reading` y `Completed`;
* significado de `CurrentPage`;
* relación entre `TotalPages`, `CurrentPage` y `PercentageReading`;
* posición final `TotalPages + 1`;
* actualización de `LastReadAt`.

No eliminar información existente de la documentación.

---

# Validación

Verificar como mínimo:

1. Crear progreso para una Work sin progreso previo.
2. `TotalPages` se obtiene correctamente de `Work.Pages.Count`.
3. El progreso inicia con `PercentageReading = 0`.
4. `LastReadAt` se establece automáticamente.
5. `CurrentPage = 1` produce `0%`.
6. `CurrentPage = 2` produce el porcentaje correspondiente a una página leída.
7. La última página física produce un porcentaje menor a `100%`.
8. `CurrentPage = TotalPages + 1` produce `100%`.
9. La posición final establece `Completed`.
10. Una Work en posiciones anteriores permanece `Reading`.
11. Volver desde una Work `Completed` a una página anterior permite volver a `Reading`.
12. `LastReadAt` se actualiza en cada modificación.
13. `TotalPages` no depende de datos enviados por el cliente.
14. No se crean registros duplicados para el mismo User + Work.
15. No se rompe la funcionalidad existente de `CurrentPage`.

Ejecutar build y tests relevantes del Backend/API.

---

# Criterios de aceptación

* `WorkReadingProgress` contiene la información necesaria para representar el progreso completo.
* `TotalPages` se obtiene desde `Work.Pages`.
* `PercentageReading` se calcula exclusivamente en el Service.
* `LastReadAt` se genera en el Backend.
* Existen únicamente los estados `Reading` y `Completed`.
* `CurrentPage` utiliza posiciones 1-based.
* `TotalPages + 1` representa el formulario final.
* `CurrentPage = TotalPages + 1` representa `100%`.
* Una Work completada conserva su posición final al volver a abrirse.
* Una Work puede volver de `Completed` a `Reading` si el usuario retrocede.
* No se agrega lógica de esta funcionalidad al Controller.
* La documentación de Domain y Service queda actualizada.
* Los tests relevantes pasan correctamente.
* No se modifica el contrato HTTP en esta task.

## Resultado de ejecución

### Archivos modificados
- `api/Domain/Entities/WorkReadingProgress.cs` — Agregados campos `TotalPages`, `PercentageReading`, `LastReadAt`, `State`
- `api/Domain/Enums/ReadingState.cs` (nuevo) — Enum `Reading` (0), `Completed` (1)
- `api/Infrastructure/Persistence/Configurations/WorkReadingProgressConfiguration.cs` — Configuración EF Core para nuevos campos
- `api/Infrastructure/Persistence/Migrations/20261008185042_AddReadingProgressFields.cs` (nuevo) — Migración
- `api/Application/Services/WorkService.cs` — Lógica completa de creación y actualización de progreso
- `project/domain/domain-content.md` — Documentación de `WorkReadingProgress`
- `project/services/services-catalog.md` — Actualizada documentación de `UpdateReadingProgressAsync`

### Implementación realizada

#### Domain
1. **ReadingState enum**: `Reading = 0`, `Completed = 1`
2. **WorkReadingProgress entity**: Agregados `TotalPages` (int, default 0), `PercentageReading` (int, default 0), `LastReadAt` (DateTimeOffset?), `State` (ReadingState, default Reading)
3. **EF Configuration**: Nuevos campos configurados, `LastReadAt` como `datetime(6)` nullable

#### Service
**UpdateReadingProgressAsync** (`workId`, `userId`, `currentPage`):
- Validaciones: `workId > 0`, `userId > 0`, `currentPage >= 1`
- Obtiene `TotalPages` desde `Work.Pages.Count`
- Normaliza `currentPage` a máximo `TotalPages + 1`
- **Creación**: Inicializa `CurrentPage = 0`, `TotalPages`, `PercentageReading = 0`, `LastReadAt = UtcNow`, `State = Reading`
- **Actualización**: Recalcula `PercentageReading = TotalPages == 0 ? 0 : (CurrentPage - 1) * 100 / TotalPages`, actualiza `LastReadAt`, recalcula `State` (`CurrentPage >= TotalPages + 1` → `Completed` : `Reading`)
- Permite transición `Completed` → `Reading` si el usuario retrocede

#### Fórmulas
- `PercentageReading = (CurrentPage - 1) * 100 / TotalPages` (0% en página 1, 100% en `TotalPages + 1`)
- `MaxValidPosition = TotalPages + 1` (posición final = formulario final)
- Estados: `CurrentPage < TotalPages + 1` → `Reading`; `>= TotalPages + 1` → `Completed`

### Decisiones tomadas
- `LastReadAt` nullable (`DateTimeOffset?`) para compatibilidad con MySQL (no acepta default '0001-01-01')
- `TotalPages` siempre desde `Work.Pages.Count`, nunca del cliente
- `PercentageReading` y `State` calculados 100% en el Service
- Validación `currentPage >= 1` (el Reader usa 1-based, posición 0 solo interna para creación)
- Normalización silenciosa si `currentPage > TotalPages + 1` (corta al máximo válido)
- `GetByIdWithNavigationAsync` usado para cargar `Pages` y obtener count

### Validaciones ejecutadas
- ✅ Compilación correcta (0 errores)
- ✅ Migración generada y aplicada a BD
- ✅ Tests `WorkReaderPagesIntegrationTests` pasan (8/8)
- ✅ Tests `WorksControllerContractTests` pasan (8/8)
- ✅ Lógica de porcentaje: página 1 = 0%, página TotalPages = 90% (aprox), TotalPages+1 = 100%
- ✅ Estado `Reading`/`Completed` según posición
- ✅ `LastReadAt` se actualiza en cada modificación
- ✅ No se rompe funcionalidad existente

### Problemas encontrados
- Ninguno. La implementación se completó sin bloqueos.
