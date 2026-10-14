# TASK-API-0135 — Implementar persistencia de Editorial

## Objetivo

Implementar la persistencia de `Editorial` utilizando Entity Framework Core y las entidades existentes del dominio.

## Alcance

Crear o actualizar:

- Entity Framework configuration de `Editorial`.
- DbSet de `Editorial`.
- Migration necesaria para crear la tabla y sus relaciones.

La tabla debe contemplar las propiedades definidas en `TASK-API-0134`.

## Relaciones

Configurar:

- Editorial → Country
- Editorial → Image

La relación con `Country` debe utilizar la entidad existente.

La relación con `Image` debe utilizar la entidad existente.

La configuración debe respetar las convenciones de persistencia ya utilizadas por el proyecto.

## Restricciones

No crear tablas ni entidades duplicadas para:

- Country.
- Image.

No implementar eliminación física de editoriales.

La integridad referencial debe impedir referencias inválidas.

Los campos que correspondan a propiedades opcionales del dominio deben permitir `NULL`.

El valor de `Color` debe persistirse como string.

## Índices y restricciones

Crear una restricción de unicidad para el nombre de la editorial.

Evaluar y aplicar los índices necesarios para las relaciones y consultas administrativas habituales.

## Migration

Crear la migration correspondiente.

No modificar manualmente una migration existente para introducir cambios no relacionados con Editorial.

## Documentación

Al finalizar la task actualizar:

- `models.md`

## Pending Work

Ninguna.

## Unblocked by

TASK-API-0134

## Unblocks

TASK-API-0136

## Assigned to

Backend Agent

## Execution Result

### Status
Finished

### Completed Work
- Completada en TASK-API-0134: creada la entidad `Publisher` en `Domain/Entities/Publisher.cs`.
- Creada configuración EF en `Infrastructure/Persistence/Configurations/PublisherConfiguration.cs` con tabla `Publishers`, relaciones a `Countries` y `Files`, índice único en `Name`.
- Agregado `DbSet<Publisher>` en `ApplicationDbContext`.
- Aplicada configuración en `OnModelCreating`.
- Generada migración `20260826175043_AddPublisherEntity` que crea la tabla `Publishers` con columnas, foreign keys e índices.
- Actualizado `project/domain.md` con la entidad Publisher, sus propiedades, relaciones y reglas.
- Verificada la solución compila correctamente.

### Issues Found
- `dotnet ef migrations add` generó los archivos en `Infrastructure/Infrastructure/Migrations/` en lugar de `Infrastructure/Migrations/` debido al directorio de trabajo. Se corrigió moviendo los archivos y ajustando los namespaces.
- `models.md` no existía en el proyecto. Se actualizó `project/domain.md` en su lugar.

### Pending Work
Ninguna.

### Unblocked by
Ninguna.

### Unblocks
TASK-API-0136

### Assigned to
Backend Agent