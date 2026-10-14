# TASK-API-0255 — Revisar Domain de Franchise

## Objetivo

Revisar el dominio de `Franchise` antes de implementar el listado público de Franchises definido en US-0026.

## Instrucciones

Revisar:

* entidad `Franchise`;
* estado activo/inactivo;
* relación con `Publisher`;
* propiedades `Id`, `Name`, `Color`;
* relación con `Image`;
* información necesaria de Publisher para la card.

Determinar si el dominio actual permite implementar el caso de uso sin modificaciones.

Si no requiere cambios, no modificar código.

Si requiere cambios, realizar únicamente los cambios necesarios.

No implementar Repository, Service ni Endpoint.

## Validación

Verificar que el dominio permite obtener:

```text
Franchise:
    Id
    Name
    Color
    UrlImage

Publisher:
    Id
    Name
    Color

Active
```

---

# Resultado de ejecución

## Veredicto

**No se requieren cambios en el dominio.** `Domain/Entities/Franchise.cs` ya expone la información de la card y la del pill de Publisher.

## Datos verificados

| Contrato de la Task | Dominio | Tipo |
| --- | --- | --- |
| `Franchise.Id` | `Franchise.Id` | `long` (PK) |
| `Franchise.Name` | `Franchise.Name` | `string` |
| `Franchise.Color` | `Franchise.Color` | `string?` |
| `Franchise.UrlImage` | `Franchise.Image` + `ImageUrlBuilder.ToUrl` | `virtual Image?` → `ImageId` |
| `Publisher.Id` | `Franchise.Publisher.Id` / `GetPublisherId()` | FK requerida |
| `Publisher.Name` | `Franchise.Publisher.Name` / `GetPublisherName()` | FK requerida |
| `Publisher.Color` | `Franchise.Publisher.Color` | `string?` |
| `Active` | `Franchise.IsActive` | `bool`, default `true` |

Se revisó también `FranchiseConfiguration.cs`, que confirma `PublisherId` como FK requerida e indexada, e `project/domain/domain-catalog.md`, que documenta la entidad correctamente. No se detectaron inconsistencias.

## Hallazgo relevante: la FK de Publisher es requerida

`Franchise.Publisher` está declarado `= null!` y configurado como FK obligatoria. Eso significa que una Franchise sin editorial no puede existir, por lo que el nodo `Publisher` de la card se puede tipar como no-nullable sin ser una mentira del contrato. La protección real contra un Publisher desactivado la hace el Repository, filtrando en SQL (ver TASK-API-0256).

## Archivos modificados

Ninguno. La task era de revisión.

## Decisión

El nodo de Publisher se arma en la capa de Application a partir de la navegación ya cargada por el Repository, con los helpers de dominio `GetPublisherId()` y `GetPublisherName()` más `Publisher.Color`. No se agregó ninguna propiedad derivada al dominio.

`Color` e `Image` son opcionales y se exponen como `null` cuando no existen.

## Verificación

- `dotnet build api/ComicLibrary.sln` → 0 errores.
- Suite completa: **219/219 en verde** tras completar las 12 tasks de US-0026.

## Criterios de aceptación

Dominio: la entidad contiene `Id`, `Name`, `Color`, `Image`, `IsActive` y la navegación a `Publisher` con `Id`, `Name` y `Color`.

Alcance: no se modificó código, ni se implementó Repository, Service o Endpoint en esta task.