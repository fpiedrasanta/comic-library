# TASK-API-0130 — Normalizar fechas de ban a UTC en el servidor

## Objetivo

Garantizar que las fechas de inicio y finalización de baneos se almacenen y comparen en UTC, evitando desviaciones por zona horaria del cliente.

## Completed Work

Pendiente.

## Pending Work

- En `BanService.CreateBanAsync`, convertir `request.StartDate` y `request.EndDate` a UTC antes de persistir.
- En `BanService.UpdateBanAsync`, aplicar la misma conversión.
- Considerar si la conversión debe ser `.ToUniversalTime()` o si el frontend ya envía UTC.
- Actualizar `endpoints.md` si corresponde para documentar que las fechas deben enviarse en UTC.
- Verificar que la comparación de bans activos (`StartDate <= DateTime.UtcNow && (EndDate == null || EndDate > DateTime.UtcNow)`) siga siendo correcta después del cambio.

## Reason

Las fechas de ban se toman verbatim del request del cliente y se comparan contra `DateTime.UtcNow`. Si el frontend envía fechas en hora local, la evaluación de ban activo/vigente se desvía por la diferencia horaria.

## Assigned to

Backend Agent

## Blocked task

Ninguna.

## ANTES DE EJECUTAR
Conversar con el humano por el chat algunas cuestiones antes de implementar.
1) ¿Cómo sabes en que formato está enviando el front? Si no hay referencia de ZH deberíamos asumir que es UTC.
2) Cual es la propuesta concreta y cómo se resoluería?
3) Se puede implementar un Middleware que detecte fechas y ya pase el Dato en UTC así los end-points no cambian?
Lo conversemos a esto antes de implementar.

## Execution Result

### Status
Finished

### Completed Work
- En `BanService.CreateBanAsync` y `BanService.UpdateBanAsync`, agregada validación explícita de `DateTimeKind.Utc` para `StartDate` y `EndDate`. Si el valor recibido no es UTC, se lanza `ValidationException` con mensaje descriptivo.
- Eliminada cualquier conversión silenciosa de zona horaria. No se utiliza `.ToUniversalTime()` porque el contrato exige que el frontend envíe fechas ya en UTC.
- Actualizado `backend-coding-rules.md` con nueva sección 17.1: "Validación explícita de UTC en fechas de entrada". Establece que toda fecha recibida desde el exterior debe ser validada como UTC antes de ser utilizada, y que la validación debe realizarse en la capa Application.
- Verificada la solución compila correctamente.

### Issues Found
Ninguno adicional. La regla 17.1 se agregó para prevenir este tipo de problema en todos los endpoints.

### Pending Work
Ninguna.

### Unblocked by
Ninguna.

### Unblocks
Ninguna.

### Assigned to
Backend Agent
