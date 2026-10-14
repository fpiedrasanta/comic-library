# TASK-API-0184 — Configurar storage persistente para Hangfire

**Assignee:** API Agent
**Épica:** EPIC-02 — Gestión del catálogo y contenido editorial
**Origen:** Bloqueo detectado en TASK-API-0174, TASK-API-0175, TASK-API-0176 y cualquier otra Task que requiera encolamiento de procesamiento CBR/CBZ.

## Objetivo

Resolver el storage persistente de Hangfire para que los jobs de procesamiento de contenido digital se encolen y ejecuten correctamente en producción.

## Contexto

El proyecto usa Hangfire 1.8.24 para encolar el procesamiento de CBR/CBZ. Actualmente:

- `Hangfire.MySqlStorage` 2.0.3 está instalado en `Infrastructure.csproj` pero **no compila para .NET 10** (solo `net452` y `netstandard2.0`).
- `Program.cs` tiene registrado `AddHangfire()` y `AddHangfireServer()` sin storage configurado.
- Al iniciar, Hangfire lanza `InvalidOperationException: Current JobStorage instance has not been initialized yet`.
- Se creó un `BackgroundJobServiceStub` temporal que **no encola jobs reales**, solo devuelve un string. Esto deja el procesamiento de CBR/CBZ no funcional en producción.

## Bloqueos actuales

Las siguientes Tasks dependen de que Hangfire funcione:

- `TASK-API-0174` (consulta de estado y retry de procesamiento CBR)
- `TASK-API-0175` (eliminación de contenido digital de Number)
- `TASK-API-0176` (exponer Editorial en detalle de Serie)
- `TASK-API-0173` (gestión del contenido digital de Number)
- `TASK-API-0179` (procesamiento real de contenido CBR/CBZ)
- `TASK-API-0180`, `TASK-API-0181` (correcciones del procesamiento)

Sin storage de Hangfire, los endpoints `POST /api/admin-numbers/{numberId}/content` y `POST /api/admin-numbers/{numberId}/content/retry` aceptan la carga pero **no inician el procesamiento**.

## Alcance

- Definir e implementar el storage de Hangfire compatible con .NET 10.
- Configurar `Program.cs` para usar el storage real.
- Eliminar `BackgroundJobServiceStub` y volver a registrar `BackgroundJobService` real.
- Actualizar `project/backend-stack-technology.md` con el storage elegido.
- Asegurar que el schema de Hangfire se cree/migre correctamente en producción.

## Opciones

### Opción A — SQL Server (Hangfire.SqlServer)

- **Requisito:** Servidor SQL Server accesible desde la API (puede ser una instancia separada de la base de datos MySQL).
- **Cambios:**
  - Agregar connection string `Hangfire` en `appsettings.json` / variables de entorno.
  - Configurar `.UseSqlServerStorage(...)` en `Program.cs`.
  - Actualizar `backend-stack-technology.md`.
- **Pros:** Paquete oficial, estable, soportado por Hangfire.
- **Cons:** Requiere infraestructura adicional (SQL Server).

### Opción B — Redis (Hangfire.Redis)

- **Requisito:** Servidor Redis accesible desde la API.
- **Cambios:**
  - Instalar paquete `Hangfire.Redis`.
  - Configurar `.UseRedisStorage(...)` en `Program.cs`.
  - Actualizar `backend-stack-technology.md`.
- **Pros:** Funcionalmente gratuito, corre en Linux, liviano.
- **Cons:** Requiere infraestructura adicional (Redis).

### Opción C — Actualizar Hangfire.MySqlStorage / alternativa comunitaria

- **Requisito:** Proveedor MySQL compatible con .NET 10.
- **Estado actual:** `Hangfire.MySqlStorage` 2.0.3 RECHAZADO (no compila). `Hangfire.Storage.MySql` 2.0.1-beta compila pero es experimental. Ver TASK-API-0186.
- **Cambios si se aprueba versión estable:**
  - Instalar `Hangfire.Storage.MySql`.
  - Configurar `.UseStorage(new MySqlStorage(...))` en `Program.cs`.
  - Actualizar `backend-stack-technology.md`.
- **Pros:** Usa la misma base de datos MySQL existente, sin infraestructura nueva.
- **Cons:** Depende de paquete comunitario; la versión actual es beta.

## Decisión adoptada

El humano aprobó el uso de **`Hangfire.Storage.MySql` 2.0.1-beta** como storage persistente de Hangfire, con las siguientes condiciones:

1. Volumen de carga bajo (~20 cómics/día, máximo 2 usuarios concurrentes).
2. Mitigaciones aplicadas: `WorkerCount = 2`, `DisableConcurrentExecution(1800s)`, `TransactionIsolationLevel.ReadCommitted`, `Allow User Variables=True`.
3. Monitoreo de estabilidad. Si aparecen deadlocks, jobs zombies o crecimiento de volumen, migrar a `Hangfire.SqlServer`.

Ver TASK-API-0186 para la validación técnica completa.

## Criterios de aceptación

- [ ] Hangfire inicia sin excepción al correr `dotnet run`.
- [ ] `IBackgroundJobService.EnqueueCbrProcessing(...)` encola un job real que se ejecuta en segundo plano.
- [ ] El endpoint `POST /api/admin-numbers/{numberId}/content` inicia el procesamiento y responde 200 sin esperar.
- [ ] El endpoint `POST /api/admin-numbers/{numberId}/content/retry` inicia el reprocesamiento y responde 200 sin esperar.
- [ ] El job de procesamiento persiste en el storage configurado (sobrevive a un restart de la API).
- [ ] `BackgroundJobServiceStub` es eliminado del código.
- [ ] `Program.cs` no tiene código comentado relacionado a Hangfire.
- [ ] `backend-stack-technology.md` refleja el storage elegido.
- [ ] La solución compila con 0 errores.
- [ ] Los tests existentes siguen pasando (180/180).

## Tareas que se desbloquean al finalizar

- TASK-API-0173
- TASK-API-0174
- TASK-API-0175
- TASK-API-0176
- TASK-API-0179
- TASK-API-0180
- TASK-API-0181

## Nota para el humano

Elegí una de las tres opciones y respondé en esta Task. Yo implemento lo que elijas. Si no hay preferencia, recomiendo **Opción B (Redis)** porque es funcionalmente gratuita, corre en Linux y no requiere licencia de SQL Server.

## RESPUESTA EN:
TASK-API-0185 — Configurar storage persistente de Hangfire con Redis