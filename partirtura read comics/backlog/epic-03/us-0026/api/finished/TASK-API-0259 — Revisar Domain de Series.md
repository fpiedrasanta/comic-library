# TASK-API-0259 — Revisar Domain de Series

## Objetivo

Revisar el dominio de `Series` antes de implementar el listado público de Series definido en US-0026.

## Instrucciones

Revisar:

* entidad `Series`;
* estado activo/inactivo;
* relación con `Franchise`;
* relación de `Franchise` con `Publisher`;
* propiedades `Id`, `Name`, `Color`;
* relación con `Image`.

Determinar si el dominio actual permite implementar el caso de uso sin modificaciones.

Si no requiere cambios, no modificar código.

Si requiere cambios, realizar únicamente los cambios necesarios.

No implementar Repository, Service ni Endpoint.

## Validación

Verificar que el dominio permite obtener:

```text
Series:
    Id
    Name
    Color
    UrlImage

Franchise:
    Id
    Name
    Color

Publisher:
    Id
    Name
    Color

Active
```

---

# Resultado de ejecución

## Veredicto

**No se requieren cambios en el dominio.** `Domain/Entities/Series.cs` ya expone la información de la card y la de ambos pills.

## Datos verificados

| Contrato de la Task | Dominio | Tipo |
| --- | --- | --- |
| `Series.Id` | `Series.Id` | `long` (PK) |
| `Series.Name` | `Series.Name` | `string` |
| `Series.Color` | `Series.Color` | `string?` |
| `Series.UrlImage` | `Series.Image` + `ImageUrlBuilder.ToUrl` | `virtual Image?` → `ImageId` |
| `Franchise.Id` | `Series.Franchise.Id` / `GetFranchiseId()` | FK requerida |
| `Franchise.Name` | `Series.Franchise.Name` / `GetFranchiseName()` | FK requerida |
| `Franchise.Color` | `Series.Franchise.Color` | `string?` |
| `Publisher.Id` | `Series.Franchise.Publisher.Id` / `GetPublisherId()` | FK requerida indirecta |
| `Publisher.Name` | `Series.Franchise.Publisher.Name` / `GetPublisherName()` | FK requerida indirecta |
| `Publisher.Color` | `Series.Franchise.Publisher.Color` | `string?` |
| `Active` | `Series.IsActive` | `bool`, default `true` |

La entidad ya incluye `Description` nullable (agregado en TASK-API-0248), pero **no** se expone en el listado: la card no lo necesita y `project/domain/domain-catalog.md` ya lo documenta correctamente. Se revisó `SeriesConfiguration.cs`, que confirma `FranchiseId` como FK requerida e indexada.

## Hallazgo relevante: la cadena de FKs es obligatoria

`Series.Franchise` y `Franchise.Publisher` están declaradas `= null!` y configuradas como FKs requeridas. La navegación del Publisher se alcanza transitivamente, y por eso los dos nodos de la card pueden tiparse como no-nullables. La protección contra Franchise o Publisher desactivados la hace el Repository filtrando en SQL (ver TASK-API-0260).

## Archivos modificados

Ninguno. La task era de revisión.

## Decisión

Los dos nodos se arman en la capa de Application desde la navegación ya cargada por el Repository. No se agregó ninguna propiedad derivada al dominio ni se usó el helper `GetPublisherId()`/`GetPublisherName()` en la card, porque esos métodos también recorren `Country` y la card no expone el país: se lee directamente `s.Franchise.Publisher`.

## Verificación

- `dotnet build api/ComicLibrary.sln` → 0 errores.
- Suite completa: **219/219 en verde** tras completar las 12 tasks de US-0026.

## Criterios de aceptación

Dominio: la entidad contiene `Id`, `Name`, `Color`, `Image`, `IsActive`, la navegación a `Franchise` con `Id`, `Name` y `Color`, y el acceso transitivo a `Publisher` con `Id`, `Name` y `Color`.

Alcance: no se modificó código, ni se implementó Repository, Service o Endpoint en esta task.