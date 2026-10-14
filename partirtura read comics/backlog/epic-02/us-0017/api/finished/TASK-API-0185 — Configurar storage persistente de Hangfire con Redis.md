# TASK-API-0185 — Configurar storage persistente de Hangfire con Redis

**Tipo:** Backend / Infrastructure
**Agente:** API Agent
**Épica:** EPIC-02 — Gestión del catálogo y contenido editorial
**Estado:** pending

## Objetivo

Configurar Hangfire con un storage persistente basado en Redis, compatible con .NET 10 y con la versión de Hangfire utilizada por el proyecto, eliminando el storage MySQL actualmente instalado y garantizando que los jobs de procesamiento CBR/CBZ sean realmente encolados, persistidos y ejecutados en segundo plano.

## Decisión arquitectónica

El proyecto utiliza MySQL como base de datos principal del dominio.

Redis se utilizará exclusivamente como infraestructura de almacenamiento de Hangfire.

No se utilizará SQL Server para Hangfire.

No se utilizará un provider MySQL antiguo o no mantenido para Hangfire.

La arquitectura resultante será:

```text
API
├── MySQL
│   └── Persistencia del dominio
│
└── Redis
    └── Hangfire Job Storage
```

Redis no debe introducirse como mecanismo de persistencia de entidades del dominio.

## Contexto

Actualmente Hangfire está registrado en la API, pero no dispone de un `JobStorage` persistente correctamente configurado.

Existe además una dependencia de `Hangfire.MySqlStorage`, pero dicho paquete es antiguo y no debe utilizarse como solución para el proyecto actual.

La investigación realizada determinó que:

* `Hangfire.MySqlStorage 2.0.3` está compilado para .NET Standard 2.0 y NuGet lo considera compatible con .NET 10, pero es un paquete antiguo cuya última versión fue publicada en 2020.
* Existen otras implementaciones MySQL antiguas o deprecated.
* No se debe basar la infraestructura de producción en un provider MySQL de Hangfire antiguo/no mantenido.
* Hangfire dispone de integración con Redis como storage.
* Debe verificarse antes de implementar el paquete Redis concreto, su compatibilidad con la versión actual de Hangfire, .NET 10 y sus condiciones de licencia.

## Alcance

### 1. Seleccionar e instalar el provider Redis correcto

Verificar y seleccionar la implementación Redis de Hangfire que cumpla simultáneamente:

* Compatibilidad con .NET 10.
* Compatibilidad con la versión de Hangfire utilizada por el proyecto.
* Soporte de producción.
* Persistencia de jobs.
* Compatibilidad con el modelo de ejecución utilizado por `HangfireServer`.
* Licencia compatible con el proyecto.

No utilizar paquetes deprecated, abandonados o exclusivamente experimentales.

Documentar en `project/backend-stack-technology.md`:

* Nombre del paquete.
* Versión.
* Redis como storage de Hangfire.
* Motivo de la elección.
* Dependencia de infraestructura Redis.

### 2. Eliminar el storage MySQL de Hangfire

Eliminar del proyecto cualquier dependencia de:

```text
Hangfire.MySqlStorage
Hangfire.Storage.MySql
Hangfire.MySql.Core
```

o cualquier otro provider MySQL utilizado únicamente como storage de Hangfire.

No modificar el provider MySQL utilizado por Entity Framework Core para la base de datos del dominio.

### 3. Configurar Redis

Agregar la configuración necesaria para Redis mediante configuración de la aplicación.

Utilizar una configuración equivalente a:

```text
ConnectionStrings
└── Redis
```

o la convención de configuración que ya utilice el proyecto.

No hardcodear host, puerto, contraseña ni credenciales dentro del código.

Permitir configuración mediante `appsettings.json` para desarrollo y variables de entorno para despliegue.

Si se utiliza un Redis compartido entre ambientes, configurar un prefix específico para Hangfire que evite colisiones entre ambientes.

### 4. Configurar Hangfire

Modificar `Program.cs` para que:

* `AddHangfire()` configure el storage Redis real.
* `AddHangfireServer()` utilice dicho storage.
* No exista ninguna configuración comentada de Hangfire.
* No exista `JobStorage` sin inicializar.
* No exista código alternativo o fallback silencioso hacia storage en memoria.

La aplicación debe iniciar correctamente con Redis disponible.

### 5. Restaurar BackgroundJobService real

Eliminar:

```text
BackgroundJobServiceStub
```

Registrar nuevamente:

```text
BackgroundJobService
```

como implementación real de `IBackgroundJobService`.

`IBackgroundJobService` debe permanecer en Application sin depender de Hangfire.

La referencia a Hangfire debe permanecer exclusivamente en Infrastructure.

### 6. Verificar el flujo CBR/CBZ

Verificar el flujo completo:

```text
POST /api/admin-numbers/{numberId}/content
        ↓
guardar archivo temporal
        ↓
IBackgroundJobService
        ↓
Hangfire
        ↓
Redis
        ↓
Hangfire Server
        ↓
CbrProcessingJob
        ↓
Pages + Images
        ↓
ContentStatus.Completed
```

El endpoint no debe esperar a que finalice el procesamiento.

Debe devolver inmediatamente después de que el job haya sido correctamente encolado.

### 7. Verificar retry

Verificar:

```text
POST /api/admin-numbers/{numberId}/content/retry
```

El endpoint debe:

1. Validar que el retry sea válido según el estado actual.
2. Encolar un nuevo job.
3. Devolver inmediatamente.
4. Permitir que Hangfire ejecute el procesamiento en segundo plano.

No debe ejecutar el procesamiento directamente dentro del request HTTP.

### 8. Persistencia de jobs

Verificar que un job encolado permanezca almacenado en Redis y pueda ser procesado después de reiniciar la API.

El procesamiento no debe depender de memoria del proceso de la API.

Debe cumplirse el principio:

```text
API restart ≠ lost background job
```

### 9. Configuración de Redis para Hangfire

Configurar Redis con los parámetros necesarios para garantizar el funcionamiento correcto de Hangfire.

Como mínimo revisar:

* Persistencia de Redis.
* Política `noeviction`.
* Prefix exclusivo de Hangfire.
* Autenticación cuando corresponda.
* TLS cuando corresponda al entorno.
* Timeouts razonables.
* Configuración compatible con el provider Redis elegido.

No asumir que los defaults de Redis son adecuados para producción.

### 10. Infraestructura local

Actualizar la configuración de desarrollo para permitir ejecutar Redis localmente.

Si el proyecto utiliza Docker para infraestructura local, agregar Redis al mecanismo existente de infraestructura local en lugar de introducir un mecanismo paralelo.

No es necesario incorporar Docker si el proyecto todavía no lo utiliza.

## Restricciones arquitectónicas

### Clean Architecture

Application no debe conocer Redis ni Hangfire.

No agregar referencias de:

```text
Application → Hangfire
Application → Redis
```

Las dependencias deben permanecer:

```text
Application
    ↑
Infrastructure
    ↑
API
```

`IBackgroundJobService` pertenece a Application.

`BackgroundJobService` pertenece a Infrastructure.

La implementación concreta de Hangfire pertenece a Infrastructure.

### Dominio

No introducir Redis en entidades, repositorios de dominio ni servicios de dominio.

Redis existe exclusivamente como infraestructura para background jobs.

## Criterios de aceptación

* [ ] Hangfire inicia correctamente con Redis configurado.
* [ ] `JobStorage.Current` queda correctamente inicializado.
* [ ] La API inicia sin `InvalidOperationException: Current JobStorage instance has not been initialized yet`.
* [ ] El provider Redis elegido es compatible con .NET 10 y Hangfire utilizado.
* [ ] El provider Redis elegido no está deprecated ni abandonado.
* [ ] La licencia del provider es compatible con el proyecto.
* [ ] `Hangfire.MySqlStorage` y cualquier otro provider MySQL de Hangfire no utilizado quedan eliminados.
* [ ] `BackgroundJobServiceStub` queda eliminado.
* [ ] `BackgroundJobService` real queda registrado.
* [ ] `IBackgroundJobService` no tiene dependencia de Hangfire.
* [ ] `POST /api/admin-numbers/{numberId}/content` encola un job real.
* [ ] El endpoint de upload no espera la finalización del procesamiento.
* [ ] `POST /api/admin-numbers/{numberId}/content/retry` encola un job real.
* [ ] El job es ejecutado por `HangfireServer`.
* [ ] El job sobrevive al reinicio de la API.
* [ ] El procesamiento CBR/CBZ continúa funcionando mediante `CbrProcessingJob`.
* [ ] ContentStatus refleja correctamente Processing, Completed y Error.
* [ ] Redis se utiliza exclusivamente como storage de Hangfire.
* [ ] MySQL continúa siendo la base de datos del dominio.
* [ ] `backend-stack-technology.md` documenta Redis como Hangfire storage.
* [ ] No existe código comentado relacionado con la configuración anterior de Hangfire.
* [ ] La solución compila correctamente.

## Fuera de alcance

Esta Task no incluye:

* Cambios en entidades del dominio.
* Cambios en EF Core/MySQL como provider de la aplicación.
* Cambios en el modelo `Number`, `Page` o `Image`.
* Refactoring del `CbrProcessingJob`.
* Refactoring de `NumberService`.
* Implementación de nuevos endpoints.
* Dashboard administrativo de Hangfire.

## Resultado esperado

La infraestructura debe quedar funcionando de esta forma:

```text
                    ┌─────────────────┐
                    │       API       │
                    └────────┬────────┘
                             │
             ┌───────────────┴───────────────┐
             │                               │
             ▼                               ▼
          MySQL                            Redis
       Domain Storage                  Hangfire Storage
             │                               │
             │                               ▼
             │                         Hangfire Server
             │                               │
             └───────────────────────────────┤
                                             ▼
                                      CbrProcessingJob
                                             │
                                             ▼
                                      Pages + Images
```

La API debe poder reiniciarse sin perder jobs pendientes y el procesamiento CBR/CBZ debe ejecutarse realmente en segundo plano mediante Hangfire.
