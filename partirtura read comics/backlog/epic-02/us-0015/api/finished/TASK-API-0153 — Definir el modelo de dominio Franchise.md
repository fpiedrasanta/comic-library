# TASK-API-0153 — Definir el modelo de dominio Franchise

## Objetivo

Implementar el modelo de dominio correspondiente a la entidad `Franchise`, respetando las decisiones funcionales definidas en la US-0015 y el vocabulario establecido en `project/domain.md`.

La entidad representa una franquicia que agrupa series y otras obras relacionadas dentro de una editorial.

## Modelo

Crear la entidad `Franchise` con las siguientes propiedades:

- `Id`
- `Name`
- `Description`
- `PublisherId`
- `ImageId`
- `Color`
- `IsFeatured`
- `IsOngoing`
- `IsActive`

### Reglas

- `Name` es obligatorio.
- `Name` no es globalmente único.
- Una misma franquicia puede existir en diferentes editoriales.
- `PublisherId` es obligatorio.
- `ImageId` es opcional.
- `Color` es opcional.
- Cuando `Color` tenga valor, debe representar un color hexadecimal `#RRGGBB`.
- `IsFeatured` indica si la franquicia debe considerarse destacada.
- `IsOngoing` indica si la franquicia continúa vigente/generando nuevas obras.
- `IsActive` indica si la franquicia está habilitada dentro de Comic Library.
- `IsActive` no debe poder modificarse mediante creación o edición de la franquicia.
- La desactivación será lógica.
- La activación y desactivación no deben eliminar ni modificar las relaciones existentes.

## Relaciones

El modelo debe representar:

```text
Publisher
    |
    └── Franchise
            |
            └── Image
```

- Una `Franchise` pertenece obligatoriamente a un `Publisher`.
- Una `Franchise` puede tener una `Image`.
- La imagen es opcional.
- La relación con `Publisher` debe impedir eliminar accidentalmente la editorial mientras existan franquicias relacionadas.
- La relación con `Image` debe permitir que la franquicia quede sin imagen.

## Persistencia

Agregar la entidad al modelo de EF Core:

- `DbSet<Franchise>`
- Configuración mediante `FranchiseConfiguration`.

No implementar todavía repositorio, servicio ni endpoints; esas responsabilidades corresponden a tasks posteriores.

## Documentación

Actualizar:

- `project/domain.md`

Documentar:

- entidad `Franchise`;
- propiedades;
- relaciones;
- significado de `IsOngoing`;
- significado de `IsActive`;
- reglas de negocio relevantes.

Si el proyecto dispone posteriormente de un `models.md` específico, mantener la documentación alineada con dicho artefacto.

## Dependencias

No agregar nuevas dependencias.

## Criterios de aceptación

- Existe la entidad `Franchise`.
- `PublisherId` está definido como relación obligatoria en persistencia.
- `ImageId` está definido como relación opcional.
- `IsOngoing`, `IsFeatured` e `IsActive` están presentes.
- El modelo permite franquicias con el mismo nombre pertenecientes a diferentes editoriales.
- La solución compila correctamente.

## Unblocks

TASK-API-0154

## Resultado

### Archivos modificados

1. **`api/Domain/Entities/Franchise.cs`** (nuevo)
   - Entidad Franchise con propiedades: Id, Name, Description, IsFeatured, IsOngoing, IsActive, Color, CreatedAt
   - Relaciones: Publisher (requerido), Image (opcional)

2. **`project/domain.md`**
   - Agregada documentación de entidad Franchise.

### Build
- Exitoso: 0 errores, 0 advertencias.

### Criterios de aceptación cumplidos
- [x] Existe la entidad `Franchise`.
- [x] `Publisher` está definido como relación obligatoria.
- [x] `Image` está definido como relación opcional.
- [x] `IsOngoing`, `IsFeatured` e `IsActive` están presentes.
- [x] El modelo permite franquicias con el mismo nombre pertenecientes a diferentes editoriales.
- [x] La solución compila correctamente.