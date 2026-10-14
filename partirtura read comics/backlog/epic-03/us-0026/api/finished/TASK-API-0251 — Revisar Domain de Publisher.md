# TASK-API-0251 — Revisar Domain de Publisher

## Objetivo

Revisar el dominio de `Publisher` antes de implementar el listado público de Publishers definido en US-0026.

## Instrucciones

Leer la documentación obligatoria del backend y revisar:

* entidad `Publisher`;
* propiedades necesarias para el listado;
* estado activo/inactivo;
* relaciones con `Image` y `Color`;
* convenciones existentes para identificar entidades activas.

Determinar si el dominio actual permite implementar el listado sin modificaciones.

### Si no requiere cambios

No modificar código.

### Si requiere cambios

Realizar únicamente los cambios necesarios para soportar US-0026.

No implementar Repository, Service ni Endpoint en esta task.

## Validación

Verificar que el dominio contiene toda la información necesaria para que las capas posteriores puedan obtener:

```text
Id
Name
Color
UrlImage
Active
```

---

# Resultado de ejecución

## Veredicto

**No se requieren cambios en el dominio.** `Domain/Entities/Publisher.cs` ya expone toda la información que la card necesita.

## Datos verificados

| Contrato de la Task | Dominio | Tipo |
| --- | --- | --- |
| `Id` | `Publisher.Id` | `long` (PK) |
| `Name` | `Publisher.Name` | `string` |
| `Color` | `Publisher.Color` | `string?` |
| `UrlImage` | `Publisher.Image` + `ImageUrlBuilder.ToUrl` | `virtual Image?` → `ImageId` |
| `Active` | `Publisher.IsActive` | `bool`, default `true` |

Se leyeron además `PublisherConfiguration.cs` (confirmando índices en `Name`, `CountryId` e `ImageId`) y `project/domain/domain-catalog.md`, que ya documenta la entidad de forma completa y sin contradicciones. No se detectaron campos inexistentes ni Entity Framework sin mapear.

## Archivos modificados

Ninguno. La task era de revisión.

## Decisión

El mapeo `UrlImage` se resuelve en la capa de Application con el helper existente `ImageUrlBuilder.ToUrl`, igual que ya hacen `GetPublicDetailAsync` de Publisher y el detalle público de Franchise. No se agregó ninguna propiedad derivada al dominio, porque el dominio no debe conocer la forma de la URL HTTP.

`Color` e `Image` son opcionales: la card los expone como `null` cuando no existen, sin excepción y sin placeholders.

## Verificación

- `dotnet build api/ComicLibrary.sln` → 0 errores.
- Suite completa: **219/219 en verde** tras completar las 12 tasks de US-0026.

## Criterios de aceptación

Dominio: la entidad contiene `Id`, `Name`, `Color`, `Image` e `IsActive`, con los tipos correctos y las relaciones ya mapeadas.

Alcance: no se modificó código, ni se implementó Repository, Service o Endpoint en esta task.