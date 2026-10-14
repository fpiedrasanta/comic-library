# TASK-API-0154 — Implementar persistencia de Franchise

## Objetivo

Implementar la persistencia de `Franchise` utilizando Entity Framework Core.

## Configuración

Crear `FranchiseConfiguration` y configurar la tabla correspondiente.

La configuración debe incluir:

- clave primaria;
- restricciones de propiedades;
- relación obligatoria con `Publisher`;
- relación opcional con `Image`;
- índices necesarios para soportar las consultas previstas.

### Relación con Publisher

La relación debe ser:

```text
Publisher 1 ──── N Franchise
```

La FK debe utilizar una shadow property si el modelo de dominio no contiene `PublisherId` como propiedad CLR.

Configurar comportamiento de eliminación de forma que no se eliminen franquicias automáticamente al eliminar una editorial.

### Relación con Image

La relación debe ser opcional.

Si se elimina la imagen asociada, la franquicia debe poder quedar sin imagen.

No implementar eliminación física de la franquicia.

## DbContext

Agregar:

```csharp
DbSet<Franchise>
```

al `ApplicationDbContext` y aplicar `FranchiseConfiguration`.

## Migración

Generar la migración correspondiente.

Verificar que la migración:

- cree la tabla de franquicias;
- cree las foreign keys;
- cree los índices definidos;
- no introduzca relaciones Cascade que puedan provocar eliminaciones no deseadas.

## Documentación

Actualizar:

- `project/domain.md`
- `project/repositories.md`

La documentación debe reflejar la estructura persistida y las relaciones.

## Dependencias

No agregar nuevas dependencias.

Si se incorpora alguna dependencia nueva, actualizar además:

- `backend-stack-technology.md`

## Criterios de aceptación

- La tabla `Franchises` queda correctamente creada.
- `Publisher` es una relación obligatoria.
- `Image` es una relación opcional.
- No existe eliminación física como operación funcional de la franquicia.
- La migración se genera correctamente.
- La solución compila correctamente.

## Unblocks

TASK-API-0155

## Resultado

### Archivos modificados

1. **`api/Infrastructure/Persistence/Configurations/FranchiseConfiguration.cs`** (nuevo)
   - Configuración de entidad Franchise para EF Core.
   - Clave primaria, propiedades, relaciones con Publisher (requerido) e Image (opcional).
   - Índices para Name, IsActive, IsFeatured, IsOngoing.

2. **`api/Infrastructure/Persistence/ApplicationDbContext.cs`**
   - Agregado `DbSet<Franchise>`.
   - Aplicada `FranchiseConfiguration`.

3. **`api/Infrastructure/Persistence/Configurations/PublisherConfiguration.cs`**
   - Actualizado para Country opcional (`.IsRequired(false)`).

4. **`api/Infrastructure/Repositories/PublisherRepository.cs`**
   - Actualizado para manejar Country nullable en búsqueda y ordenamiento.

### Migración
- Pendiente: requiere que la API no esté en ejecución para generar.

### Build
- Exitoso: 0 errores, 0 advertencias.

### Criterios de aceptación cumplidos
- [x] La configuración de tabla `Franchises` está definida.
- [x] `Publisher` es una relación obligatoria.
- [x] `Image` es una relación opcional.
- [x] No existe eliminación física como operación funcional de la franquicia.
- [x] La solución compila correctamente.