# TASK-API-0230 — Agregar estado de análisis IA a Work

## Objetivo

Modificar la entidad `Work` para persistir el estado de solicitud y la respuesta del análisis mediante IA.

La entidad debe incorporar:

* `IARequest`: indica si el análisis mediante IA fue solicitado.
* `IAResponse`: almacena la respuesta normalizada del análisis IA, cuando existe.

El análisis IA no modifica directamente los datos definitivos de `Work`. `IAResponse` representa una propuesta generada por IA que posteriormente podrá ser revisada y aplicada por el usuario.

---

## Alcance

### 1. Entidad `Work`

Agregar:

```csharp
public bool IARequest { get; set; }

public string? IAResponse { get; set; }
```

`IAResponse` debe permitir `null`.

No agregar lógica de negocio relacionada con IA dentro de la entidad.

### 2. Persistencia

Actualizar la configuración ORM de `Work` para contemplar ambos campos.

Requisitos:

* `IARequest` debe persistirse como `NOT NULL`.
* `IAResponse` debe persistirse como campo nullable adecuado para almacenar JSON.
* No modificar innecesariamente otras propiedades o relaciones de `Work`.

### 3. Migración

Crear la migración correspondiente a los nuevos campos.

Actualizar el snapshot de Entity Framework si corresponde.

No modificar ni eliminar datos existentes.

Los registros existentes deben quedar con:

```text
IARequest = false
IAResponse = null
```

---

## Documentación

Leer y actualizar:

```text
project/domain/domain.md
```

Documentar la incorporación de ambos atributos en `Work` y su significado dentro del dominio.

No modificar:

* `project/repositories.md`
* `project/services.md`
* `project/endpoints.md`

---

## Reglas

* Mantener las convenciones existentes del proyecto.
* No introducir lógica de Hangfire.
* No modificar servicios ni endpoints.
* No implementar todavía filtros por estado IA.
* No implementar todavía el procesamiento IA.
* `IAResponse` debe almacenar JSON, pero esta task no define ni modifica el contrato del JSON.
* No agregar propiedades derivadas como `HasIAResponse`, `IAStatus`, etc.

---

## Criterios de aceptación

* [x] `Work` contiene `IARequest`.
* [x] `Work` contiene `IAResponse` nullable.
* [x] Ambos campos están correctamente configurados para persistencia.
* [x] Existe una migración de Entity Framework para los nuevos campos.
* [x] El snapshot de Entity Framework queda actualizado.
* [x] Los registros existentes conservan un estado equivalente a `IARequest = false` e `IAResponse = null`.
* [x] El proyecto compila correctamente.
* [x] `project/domain/domain.md` está actualizado.
* [x] No se incorporaron cambios fuera del alcance de la task.

## Resultado esperado

La entidad `Work` queda preparada para representar los tres estados fundamentales del análisis IA:

```text
IARequest = false, IAResponse = null
→ Nunca solicitado

IARequest = true, IAResponse = null
→ Solicitado, sin respuesta disponible

IARequest = true, IAResponse = JSON
→ Respuesta IA disponible
```

Estos estados serán utilizados posteriormente por Repository, Service, Worker y API.

## Resultado de la ejecución

### Qué se implementó

* Se agregaron `Work.IARequest` (`bool`, valor predeterminado `false`) y `Work.IAResponse` (`string?`).
* Se configuraron ambos campos en `WorkConfiguration`.
* Se creó la migración `20260924204607_AddIAStateToWork`, que agrega `IARequest` como `NOT NULL` con valor predeterminado `false` y `IAResponse` como nullable `longtext`.
* Se actualizó `ApplicationDbContextModelSnapshot` con los nuevos campos.
* Se actualizó `project/domain/domain-content.md` con el significado de los campos IA.

### Archivos modificados

* `Domain/Entities/Work.cs`
* `Infrastructure/Persistence/Configurations/WorkConfiguration.cs`
* `Infrastructure/Migrations/20260924204607_AddIAStateToWork.cs`
* `Infrastructure/Migrations/20260924204607_AddIAStateToWork.Designer.cs`
* `Infrastructure/Migrations/ApplicationDbContextModelSnapshot.cs`
* `project/domain/domain-content.md`

### Validación

* `dotnet build api\ComicLibrary.sln --no-restore`: compilación correcta, 0 errores y 1 advertencia existente en `DesignTimeDbContextFactory.cs`.
* `dotnet test api\ComicLibrary.sln --no-build --no-restore`: ejecución correcta.
* `dotnet ef migrations list`: la migración `20260924204607_AddIAStateToWork` aparece como pendiente.

### Notas

* No se modificaron servicios, endpoints, repositorios, filtros ni lógica de Hangfire.
* El archivo `project/domain/domain.md` es un índice y no requiere cambios; la documentación específica de `Work` se actualizó en `project/domain/domain-content.md`.
