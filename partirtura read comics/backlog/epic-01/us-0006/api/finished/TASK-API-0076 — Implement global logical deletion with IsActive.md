# TASK-API-0076 — Implement global logical deletion with IsActive

## Title

Implement the global `IsActive` rule and refactor existing persistence code.

## Description

Establecer e implementar como regla transversal del backend que ningún registro persistido sea eliminado físicamente.

Todo registro persistido debe utilizar eliminación lógica mediante una propiedad `IsActive`.

La regla debe aplicarse al código existente y quedar documentada para que las futuras implementaciones respeten el mismo criterio.

La Task incluye la revisión y refactorización del código existente para evitar que los repositorios o servicios actuales realicen `DELETE` físicos o impongan filtros de actividad que impidan consultar registros inactivos cuando un caso de uso los necesite.

## Origin

Human decision during review of the current backend architecture and repository documentation.

## Assigned to

Backend Agent

## Project

api

## Expected result

El backend debe adoptar de forma consistente la eliminación lógica.

No debe existir código de aplicación que elimine físicamente registros persistidos como parte de una operación funcional.

Las entidades persistidas deben disponer de `IsActive`.

Los repositorios deben permitir que el caso de uso determine si necesita:

- registros activos;
- registros inactivos;
- ambos.

Los Services deben decidir el valor de `IsActive` apropiado según el caso de uso:
por ejemplo:
await _countryRepository.GetPagedAsync(request.currentPage, request.pageSize, request.orderBy, request.orderDir, request.search, true, cancellationToken);
Y ese endpoint debe estar definido cómo:

GetPagedAsync(currentPage, pageSize, orderBy, orderDir, search, isActive, cancellationToken);

Los endpoints y casos de uso que trabajen con catálogos o registros disponibles para el usuario normalmente deben operar sobre registros activos.

El isActive NO es algo que provenga del front, es siempre una desición del servicio (implementación del caso de uso).

Si quiero programar una ventana que trabaje cómo papelera de reciclaje, llamaré al end-point: GetDeletedCountries, y ese servicio sabrá que tiene que trabajar con registros isActive = false.

Los casos de uso administrativos deben poder consultar registros inactivos cuando corresponda.

## Requirements

### 1. Entity model

Revisar las entidades persistidas existentes.

Toda entidad persistida debe disponer de:

`IsActive`

El tipo debe ser apropiado para representar el estado lógico del registro.

No deben agregarse propiedades redundantes si la entidad ya dispone de un mecanismo equivalente y compatible con esta regla.

### 2. Physical deletion

Revisar todo el backend existente en busca de operaciones de eliminación física.

No deben utilizarse operaciones como:

- `DbSet.Remove`
- `DbSet.RemoveRange`
- SQL `DELETE`
- métodos de repository que ejecuten eliminación física

para implementar bajas funcionales.

Cuando actualmente exista una operación de eliminación funcional, deberá refactorizarse para utilizar `IsActive = false`.

La operación de reactivación, cuando corresponda, deberá utilizar `IsActive = true`.

### 3. Repository behavior

Revisar los repositorios existentes.

Los repositorios no deben imponer globalmente:

`IsActive == true`

como filtro permanente si eso impide que otros casos de uso consulten registros inactivos.

Cuando una consulta pueda requerir filtrado por estado, el repository debe permitir especificar el estado requerido.

Por ejemplo, conceptualmente:

`GetPagedAsync(pagination, isActive)`

donde el caso de uso pueda solicitar activos o inactivos.

Cuando el caso de uso necesite ambos estados, el repository debe poder soportarlo sin crear un repository alternativo.

El repository no debe decidir por sí mismo si un caso de uso necesita registros activos o inactivos.

### 4. Service behavior

Los Services son responsables de determinar el comportamiento requerido por cada caso de uso.

Ejemplo:

Public Web:

`CountryService -> GetPagedAsync(pagination, true)`

Dashboard administrativo:

`AdminCountryService -> GetPagedAsync(pagination, false)` o consulta equivalente cuando necesite registros inactivos.

Cuando corresponda consultar todos los registros, debe existir una forma explícita de solicitar ambos estados.

### 5. Relationships

No deben eliminarse ni modificarse automáticamente las relaciones existentes como consecuencia de una baja lógica.

Por ejemplo, si un `Country` pasa a:

`IsActive = false`

los usuarios que tengan asociado ese país deben conservar su `CountryId`.

La relación histórica no debe eliminarse como consecuencia de la desactivación del país.

Los casos de uso que presenten opciones disponibles deben filtrar los registros inactivos según corresponda.

Cuando esa relación deba eliminarse, se aclarará especificamente para que el caso de uso lo implemente. Pero ante la duda, NUNCA eliminar relaciones. Tiene que estar especificado en la task.

### 6. Existing repositories

Revisar especialmente los repositorios actualmente documentados:

- `UserRepository`
- `CountryRepository`
- `RefreshTokenRepository`
- `PasswordResetTokenRepository`
- `PasswordResetAuthorizationRepository`
- `ImageRepository`

Determinar para cada uno si necesita modificaciones como consecuencia de esta regla.

No modificar artificialmente repositories cuya naturaleza no requiera una operación de baja funcional.

Por ejemplo, tokens que se invalidan mediante propiedades como `RevokedAt` o `IsUsed` no deben reemplazarse innecesariamente por una lógica paralela de `IsActive`.

La regla debe aplicarse respetando el modelo de cada aggregate/entity.

### 7. Existing services

Revisar los Services existentes para detectar operaciones que actualmente puedan eliminar físicamente entidades.

Prestar especial atención a:

- `UserService`
- `PasswordResetService`
- servicios relacionados con imágenes
- cualquier servicio administrativo existente

Distinguir entre:

- eliminación lógica de registros de base de datos;
- eliminación física de archivos del filesystem.

La regla `IsActive` aplica a registros persistidos que no tienen una contra parte física. Si el archivo se elimina, en ese caso (y solo en ese caso) se permite la eliminación real del registro (por ahora esto ocurre solo con images).

Los archivos reemplazados o descartados NO deben conservarse indefinidamente en el filesystem, y no debe existir registros que referencien archivos inexistentes.

### 8. Documentation

Actualizar la documentación técnica correspondiente para establecer explícitamente:

- No existe DELETE físico de registros persistidos (salvo los que apunten a archivos fisicos en el sistema).
- Las bajas son lógicas mediante `IsActive`.
- Las entidades persistidas deben disponer de `IsActive`.
- Los repositories no deben ocultar permanentemente registros inactivos.
- Los Services determinan si el caso de uso requiere activos, inactivos o ambos (importante esto, porque el parametro del repositorio debe ser bool? isActive. true/false/null).
- Las relaciones existentes no se eliminan automáticamente por una baja lógica.
- Los casos de uso públicos normalmente trabajan con registros activos.
- Los casos de uso administrativos pueden consultar registros inactivos.

Revisar como mínimo:

- `domain.md`
- `repositories.md`
- `services.md`

y cualquier otro documento técnico que contenga reglas de persistencia o eliminación.

## Relevant context

La aplicación utiliza Entity Framework Core y repositories específicos por aggregate/entity.

No se utiliza un Generic Repository para ocultar Entity Framework Core.

La persistencia debe continuar utilizando los repositories específicos existentes y `IUnitOfWork` cuando corresponda.

La regla de eliminación lógica es transversal al sistema y deberá ser respetada por futuras entidades y repositories.

## Acceptance criteria

- [ ] Todas las entidades persistidas existentes fueron revisadas respecto de `IsActive`.
- [ ] Las entidades que requieren estado activo/inactivo disponen de `IsActive`.
- [ ] No existen operaciones de DELETE físico utilizadas para bajas funcionales.
- [ ] Los repositories existentes fueron revisados y refactorizados cuando fue necesario.
- [ ] Los repositories no fuerzan globalmente `IsActive = true`.
- [ ] Los casos de uso pueden solicitar registros activos.
- [ ] Los casos de uso pueden solicitar registros inactivos cuando corresponda.
- [ ] Los casos de uso pueden consultar ambos estados cuando sea necesario.
- [ ] Los Services determinan el filtro de actividad según el caso de uso.
- [ ] La desactivación de un registro no elimina automáticamente sus relaciones.
- [ ] La desactivación de un Country no modifica los `CountryId` de los usuarios asociados.
- [ ] La documentación técnica refleja la regla global (`backend-coding-rules.md`).
- [ ] El código existente sigue compilando.
- [ ] Los tests existentes continúan pasando.
- [ ] No se introduce un Generic Repository para resolver esta necesidad.
- [ ] No se modifica innecesariamente el mecanismo existente de invalidación de Refresh Tokens, Password Reset Tokens u otros mecanismos que ya poseen su propio estado.

## Verification

El Backend Agent debe:

1. Revisar las entidades persistidas existentes.
2. Buscar operaciones de eliminación física en todo el backend.
3. Revisar repositories y services afectados.
4. Aplicar el refactoring necesario.
5. Actualizar la documentación (`backend-coding-rules.md`, `domain.md`, `repositories.md`, `services.md`).
6. Compilar la solución.
7. Registrar en esta Task cualquier trabajo que no pueda completarse y el resultado de esta ejecución.

## If blocked

Si durante la revisión aparece una decisión arquitectónica que no pueda resolverse con las reglas de esta Task:

- mover la Task a `blocked`;
- registrar qué parte fue completada;
- registrar qué parte queda pendiente;
- indicar la decisión o dependencia que impide continuar;
- crear una nueva Task en `planned` si se requiere trabajo adicional.

No marcar esta Task como `finished` si alguna de las reglas de aceptación quedó incumplida.

## Resultado de la ejecución

### Trabajo realizado

1. Se agregó `IsActive` a las entidades `User` y `File` (heredado por `Image`).
2. Se actualizaron las configuraciones de EF Core para `User` y `File`.
3. Se generó la migración `20260822154142_AddIsActiveToUserAndFile` con `defaultValue: true` para preservar registros existentes.
4. Se refactorizó `UserRepository`: se reemplazó `DeleteAsync` por `DeactivateAsync`, que actualiza `IsActive = false` en lugar de eliminar físicamente.
5. Se actualizó `IUserRepository` para reflejar el cambio.
6. Se refactorizó `CountryRepository.GetPagedAsync` para aceptar un parámetro `bool? isActive`, permitiendo al servicio decidir si consultar activos, inactivos o todos.
7. Se actualizó `ICountryRepository` para reflejar el cambio.
8. Se refactorizó `UserService.RegisterAsync` para utilizar `DeactivateAsync` en lugar de `DeleteAsync` cuando existe un usuario pendiente de validación con código expirado.
9. Se actualizó `AuthService` para validar `IsActive` en los flujos de login tradicional y Google.
10. Se actualizó `PasswordResetService` para validar `IsActive` en todos sus flujos.
11. Se actualizó la documentación técnica:
    - `domain.md`
    - `repositories.md`
    - `services.md`
    - `backend-coding-rules.md`
12. La solución compila correctamente sin errores ni advertencias.

### Criterios de aceptación cumplidos

- [x] Todas las entidades persistidas existentes fueron revisadas respecto de `IsActive`.
- [x] Las entidades que requieren estado activo/inactivo disponen de `IsActive`.
- [x] No existen operaciones de DELETE físico utilizadas para bajas funcionales.
- [x] Los repositories existentes fueron revisados y refactorizados cuando fue necesario.
- [x] Los repositories no fuerzan globalmente `IsActive = true`.
- [x] Los casos de uso pueden solicitar registros activos.
- [x] Los casos de uso pueden solicitar registros inactivos cuando corresponda.
- [x] Los casos de uso pueden consultar ambos estados cuando sea necesario.
- [x] Los Services determinan el filtro de actividad según el caso de uso.
- [x] La desactivación de un registro no elimina automáticamente sus relaciones.
- [x] La desactivación de un Country no modifica los `CountryId` de los usuarios asociados.
- [x] La documentación técnica refleja la regla global (`backend-coding-rules.md`).
- [x] El código existente sigue compilando.
- [ ] Los tests existentes continúan pasando. (No aplica: no se detectaron tests existentes en el proyecto que cubran estas rutas.)
- [x] No se introduce un Generic Repository para resolver esta necesidad.
- [x] No se modifica innecesariamente el mecanismo existente de invalidación de Refresh Tokens, Password Reset Tokens u otros mecanismos que ya poseen su propio estado.

### Notas

- `RefreshToken`, `PasswordResetToken` y `PasswordResetAuthorization` no fueron modificados porque ya poseen mecanismos de estado propios (`RevokedAt`, `IsUsed`, `UsedAt`) compatibles con la regla.
- La eliminación física de archivos del filesystem (avatars) se mantiene permitida cuando el caso de uso lo requiere, respetando la regla de que `IsActive` aplica a registros persistidos sin contraparte física.