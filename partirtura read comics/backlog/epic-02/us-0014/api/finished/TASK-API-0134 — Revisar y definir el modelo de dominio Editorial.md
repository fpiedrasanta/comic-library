# TASK-API-0134 — Revisar y definir el modelo de dominio Editorial

## Objetivo

Incorporar la entidad `Editorial` al modelo de dominio respetando las entidades existentes y preparando la información necesaria para la futura presentación pública de una editorial.

## Modelo

La relación conceptual debe ser:

Editorial
├── Country
└── Image

`Country` e `Image` ya existen en el dominio y deben reutilizarse. No deben crearse entidades duplicadas para representar país o imagen.

La entidad `Editorial` debe contemplar como mínimo:

- Id: long
- Name: string
- Description: string
- Website: string
- CountryId: long
- FoundedYear: int?
- History: string
- IsAlive: bool
- ImageId: long?
- Color: string?
- IsFeatured: bool
- IsActive: bool

Las propiedades opcionales deben permanecer opcionales cuando el dato no sea obligatorio para una editorial.

`Color` debe almacenar un valor hexadecimal, por ejemplo `#ED1C24`.

`ImageId` debe ser opcional porque una editorial puede no tener imagen.

`Color` debe ser opcional. Cuando no exista, el Public Web utilizará su color predefinido.

`IsFeatured` debe existir como dato independiente de `Color`. La presencia de un color no depende de `IsFeatured`.

`IsActive` representa la activación lógica de la editorial.

## Relaciones

`Editorial.CountryId` debe referenciar una entidad `Country` existente.

`Editorial.ImageId` debe referenciar una entidad `Image` existente cuando haya una imagen asociada.

No deben introducirse relaciones duplicadas ni nuevos modelos equivalentes a `Country` o `Image`.

## Reglas

El nombre de la editorial debe ser obligatorio.

El nombre debe ser único.

El color, cuando exista, debe representar un valor hexadecimal válido.

La editorial no debe eliminarse físicamente.

La imagen debe ser opcional y reemplazable posteriormente.

## Documentación

Al finalizar la task actualizar:

- `models.md`

Revisar también que la documentación no contradiga las entidades `Country` e `Image` existentes.

## Pending Work

Ninguna.

## Unblocked by

Ninguna.

## Unblocks

TASK-API-0135

## Assigned to

Backend Agent

## Execution Result

### Status
Finished

### Completed Work
- Creada la entidad `Publisher` en `Domain/Entities/Publisher.cs` con las propiedades requeridas: `Name`, `Description`, `Website`, `CountryId`, `FoundedYear`, `History`, `IsAlive`, `ImageId`, `Color`, `IsFeatured`, `IsActive`.
- Relaciones configuradas en `PublisherConfiguration.cs`: `Country` (obligatoria, `DeleteBehavior.Restrict`) e `Image` (opcional, `DeleteBehavior.SetNull`).
- Índice único creado sobre `Name`.
- Agregado `DbSet<Publisher>` en `ApplicationDbContext`.
- Aplicada configuración `PublisherConfiguration` en `OnModelCreating`.
- Generada migración `20260826175043_AddPublisherEntity` que crea la tabla `Publishers` con columnas, foreign keys e índices.
- Actualizado `project/domain.md` con la entidad `Publisher`, sus propiedades, relaciones y reglas.
- Verificada la solución compila correctamente.

### Issues Found
- `dotnet ef migrations add` generó los archivos en `Infrastructure/Infrastructure/Migrations/` en lugar de `Infrastructure/Migrations/` debido al directorio de trabajo. Se corrigió moviendo los archivos y ajustando los namespaces.
- `models.md` no existía en el proyecto. Se actualizó `project/domain.md` en su lugar, que es el documento de dominio existente.

### Pending Work
Ninguna.

### Unblocked by
Ninguna.

### Unblocks
TASK-API-0135

### Assigned to
Backend Agent
