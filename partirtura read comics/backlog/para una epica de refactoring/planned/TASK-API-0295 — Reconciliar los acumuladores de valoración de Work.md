# TASK-API-0295 — Reconciliar los acumuladores de valoración de Work

## Objetivo

`Work.RatingCount` y `Work.AverageRating` son datos derivados que se mantienen de forma incremental y atómica en cada voto (ver `WorkRatingService` y TASK-API-0294). Ninguna otra vía de escritura toca `WorkRating`, pero los datos derivados pueden desincronizarse por escrituras manuales en base, imports, restauraciones o defectos futuros.

Esta task propone un mecanismo de reconciliación que compare los acumuladores con las valoraciones activas reales y los repare, sin afectar las operaciones normales.

## Contexto obligatorio

Leer antes de implementar:

* `backend-agent.md`
* `project.md`
* `backend-architecture.md`
* `backend-stack-technology.md`
* `backend-coding-rules.md`
* `communication.md`
* `project/services.md`
* `project/repositories.md`
* `project/endpoints.md`

Revisar `WorkRatingService`, `WorkRatingRepository`, los jobs de Hangfire existentes (`Infrastructure/Jobs`) y cómo se registran.

## Alcance propuesto

### 1. Detección de desincronización

Consulta que compare, por Work, los acumuladores persistidos con el cálculo real sobre las valoraciones activas:

```text
RatingCount   = COUNT(*)  WHERE WorkId = @workId AND IsActive = 1
AverageRating = AVG(Stars) WHERE WorkId = @workId AND IsActive = 1  (0 si no hay filas)
```

Debe ejecutarse de forma eficiente (una consulta agregada por lote, no una por Work individual) y solo reportar/corregir las Works con diferencias.

### 2. Reparación

Actualizar únicamente las Works desincronizadas, con la misma semántica que el mantenimiento incremental:

* Los votos de cero estrellas cuentan.
* El promedio usa precisión `double` sin redondeo de persistencia.
* La reparación no debe crear ni eliminar valoraciones.

### 3. Ejecución

Registrar la ejecución como job recurrente de Hangfire, siguiendo las convenciones de los jobs existentes (`Infrastructure/Jobs`), con:

* frecuencia acotada (por ejemplo diaria);
* registro del resultado (cantidad de obras revisadas y corregidas) con Serilog;
* cancelación por `CancellationToken`;
* sin efectos sobre el catálogo en línea.

### 4. Pruebas

* Test de integración que construya una desincronización controlada sobre datos reales de desarrollo, ejecute la reconciliación y verifique que los acumuladores vuelvan al valor correcto.
* El test debe limpiar las filas creadas y restaurar los acumuladores.

### 5. Documentación

Actualizar `project/services.md` y el catálogo de servicios con la operación de reconciliación, su frecuencia y su alcance.

## Restricciones

* No modificar el comportamiento del servicio de valoraciones durante las operaciones en línea.
* No calcular el promedio consultando todas las valoraciones en cada solicitud de detalle.
* No eliminar ni crear valoraciones como parte de la reparación.
* No usar datos de prueba artificiales.

## Validación

* Compilar el Backend/API.
* Test de integración en verde.
* Verificar que una desincronización provocada a mano queda corregida.
* Verificar que la base de desarrollo no queda con residuos.

## Resultado de ejecución

Al finalizar, agregar a esta task el resultado de ejecución sin eliminar su contenido original, y moverla a `finished` o `blocked` según `communication.md`.
