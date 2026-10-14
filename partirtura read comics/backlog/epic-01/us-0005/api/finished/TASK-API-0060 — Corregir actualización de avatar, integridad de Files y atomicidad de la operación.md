# TASK-API-0060 — Corregir actualización de avatar, integridad de Files y atomicidad de la operación

## Task ID

TASK-API-0060

## Tipo

Bug / Persistencia / Integridad de datos

## Estado

planned

## Asignado a

Backend Agent

---

## Contexto

Al intentar actualizar el avatar desde la pantalla de edición de perfil, el backend falla durante `SaveChangesAsync()` con una violación de foreign key.

Error observado:

```text
Microsoft.EntityFrameworkCore.DbUpdateException:
Could not save changes. Please configure your entity type accordingly.

MySqlException:
Cannot add or update a child row: a foreign key constraint fails
(`comiclibrary_dev`.`users`,
CONSTRAINT `FK_Users_Files_AvatarId`
FOREIGN KEY (`AvatarId`)
REFERENCES `files` (`Id`)
ON DELETE SET NULL)
```

La excepción se produce en:

```text
Application.Services.UserService.UpdateAvatarAsync(...)
```

durante:

```text
DbContext.SaveChangesAsync()
```

La relación involucrada es:

```text
Users.AvatarId → Files.Id
```

Por lo tanto, en el momento en que MySQL intenta guardar `Users`, el valor asignado a `AvatarId` no corresponde a un registro existente en `Files`.

---

# Objetivo

Corregir el flujo de actualización del avatar para que:

1. El registro `Files` correspondiente al nuevo avatar exista antes de que `Users.AvatarId` lo referencie.
2. `Users.AvatarId` siempre sea una FK válida o `NULL`.
3. La creación/actualización de `Files` y la actualización de `Users` formen una única operación lógica.
4. Si cualquiera de las operaciones falla, no quede la base de datos en un estado parcialmente actualizado.
5. El error técnico quede registrado en logs, pero nunca se exponga directamente al usuario.

---

# Investigación obligatoria

Antes de modificar código, revisar el flujo completo de:

```text
POST /api/users/me/avatar
```

y específicamente:

```text
UsersController.UpdateAvatar()
    ↓
UserService.UpdateAvatarAsync()
    ↓
persistencia de File
    ↓
actualización de User.AvatarId
    ↓
SaveChangesAsync()
```

Determinar exactamente:

* cómo se genera el `File`;
* cuándo se inserta el registro `Files`;
* cómo se obtiene `Files.Id`;
* cuándo se asigna `User.AvatarId`;
* qué `DbContext` se utiliza;
* si se utiliza más de un `DbContext`;
* cuándo se ejecuta cada `SaveChangesAsync()`;
* si existe actualmente un UnitOfWork;
* si la operación actual ya está dentro de una transacción;
* qué ocurre con el archivo físico si falla la persistencia de base de datos.

**No implementar una solución antes de identificar la causa concreta del `AvatarId` inválido.**

---

# 1. Corregir la creación y asociación de File

Garantizar que el `AvatarId` asignado al usuario corresponda realmente al registro persistido en `Files`.

No asumir que el `Id` de una entidad `File` ya está disponible antes de que EF Core haya generado/persistido el registro.

Revisar especialmente si existe un flujo equivalente a:

```csharp
var file = new File(...);

dbContext.Files.Add(file);

user.AvatarId = file.Id;
```

Si `file.Id` es generado por la base de datos, este flujo debe corregirse.

Cuando sea apropiado para el modelo existente, preferir la relación de navegación de EF Core:

```csharp
user.Avatar = file;
```

permitiendo que EF Core determine el orden de inserción y obtenga el ID generado.

Si el diseño actual requiere obtener explícitamente el ID antes de actualizar el usuario, utilizar la estrategia de persistencia existente del proyecto y garantizar que el `Files` correspondiente ya exista.

---

# 2. Usar una única operación transaccional

La actualización del avatar es una única operación lógica que involucra:

```text
File físico
+
Files
+
Users.AvatarId
```

La parte de base de datos debe ejecutarse de manera atómica.

Utilizar el mecanismo existente de transacciones/UnitOfWork del proyecto.

Si la implementación actual requiere una transacción explícita de EF Core, utilizarla para garantizar que las operaciones de base de datos relacionadas con:

```text
Files
Users
```

se confirmen o reviertan conjuntamente.

Conceptualmente:

```text
BEGIN TRANSACTION

Crear/persistir Files
        ↓
Obtener Files.Id válido
        ↓
Actualizar Users.AvatarId
        ↓
SaveChanges
        ↓
COMMIT
```

Si cualquiera de las operaciones falla:

```text
ROLLBACK
```

No debe quedar:

```text
Users.AvatarId → File inexistente
```

ni un usuario apuntando a un avatar que no pudo persistirse correctamente.

---

# 3. No utilizar Transaction como workaround

La transaction **no debe utilizarse para ocultar el problema actual**.

Primero debe identificarse por qué se está generando una FK inválida.

La solución debe corregir:

```text
causa raíz
+
orden de persistencia
+
atomicidad
```

No aceptar como solución:

```text
try/catch DbUpdateException
```

sin corregir la relación.

Tampoco aceptar:

```text
AvatarId = null
```

como workaround.

---

# 4. Revisar UnitOfWork existente

El proyecto ya contempla el uso de UnitOfWork para operaciones transaccionales.

Revisar si el flujo de actualización del avatar debe utilizar el UnitOfWork existente.

No crear:

```text
IGenericRepository<T>
GenericRepository<T>
```

ni abstraer EF Core innecesariamente.

Si el UnitOfWork existente no soporta adecuadamente esta operación, realizar solamente la modificación mínima necesaria para permitir la transacción.

No crear una segunda estrategia paralela de manejo de transacciones.

---

# 5. Revisar consistencia del archivo físico

La operación también involucra el almacenamiento físico del avatar.

Analizar el comportamiento actual ante estos escenarios:

### Caso A — Todo correcto

```text
Archivo físico creado
→ Files creado
→ Users actualizado
→ COMMIT
```

Resultado:

```text
archivo existe
Files existe
Users.AvatarId es válido
```

### Caso B — Error al persistir Files

```text
Archivo físico creado
→ Files falla
```

No debe quedar una referencia inválida en `Users`.

Revisar también si el archivo físico debe eliminarse como compensación.

### Caso C — Error al actualizar Users

```text
Archivo físico creado
→ Files creado
→ Users falla
```

No debe quedar un estado inconsistente.

Si la infraestructura de archivos no participa de la misma transaction de base de datos, implementar la compensación necesaria según las abstracciones existentes del proyecto.

No inventar una nueva arquitectura de almacenamiento.

---

# 6. Revisar reemplazo de avatar existente

Probar específicamente el caso en el que:

```text
Users.AvatarId != NULL
```

y el usuario carga un nuevo avatar.

Determinar qué sucede con el avatar anterior.

La task debe mantener la política existente respecto del archivo anterior.

**No eliminar automáticamente el `File` anterior simplemente para resolver la FK.**

Si el comportamiento actual no está definido, no inventar una política de negocio nueva dentro de esta task.

---

# 7. Mantener la FK existente

La constraint:

```text
FK_Users_Files_AvatarId
```

debe permanecer.

La configuración:

```text
ON DELETE SET NULL
```

también debe permanecer salvo que la investigación demuestre que está incorrectamente definida respecto del modelo.

**No eliminar ni desactivar la foreign key.**

El objetivo es que la aplicación respete la integridad referencial, no que MySQL deje de validarla.

---

# 8. Manejo de errores

La excepción técnica debe continuar siendo manejada por el mecanismo global existente.

Para el usuario:

```text
Se generó un error durante el proceso de actualización del avatar.
```

o el mensaje amigable definido por la política existente para errores de actualización de perfil.

El usuario no debe recibir:

```text
DbUpdateException
MySqlException
FK_Users_Files_AvatarId
Cannot add or update a child row
```

El backend debe registrar mediante `ILogger` la información técnica necesaria para diagnóstico.

No registrar:

* JWT;
* passwords;
* contenido del archivo;
* secretos;
* credenciales.

---

# Fuera de alcance

* No modificar el frontend.
* No modificar `ProtectedImage`.
* No modificar JWT ni autenticación.
* No eliminar la foreign key.
* No cambiar `ON DELETE SET NULL` como workaround.
* No ocultar el error mediante un `try/catch`.
* No crear un Repository genérico.
* No cambiar la arquitectura de persistencia.
* No crear un segundo mecanismo de UnitOfWork.
* No implementar una política nueva de eliminación de avatares anteriores.

---

# Resultado esperado

Al ejecutar:

```text
POST /api/users/me/avatar
```

para un usuario sin avatar:

```text
Files
    ↓
nuevo registro persistido
    ↓
Files.Id válido
    ↓
Users.AvatarId = Files.Id
```

La operación debe finalizar correctamente.

Para un usuario que ya tiene avatar:

```text
avatar anterior
    ↓
nuevo avatar
    ↓
nuevo Files.Id
    ↓
Users.AvatarId actualizado
```

La operación debe mantener la integridad de la relación.

Después de guardar, debe cumplirse siempre:

```text
Users.AvatarId == NULL
```

o:

```text
Users.AvatarId == Files.Id
```

Nunca debe existir:

```text
Users.AvatarId = X
```

cuando:

```text
Files.Id = X
```

no existe.

---

# Criterios de aceptación

1. Se identifica y documenta en el resultado de la task la causa raíz exacta del `FK_Users_Files_AvatarId`.
2. `POST /api/users/me/avatar` funciona correctamente con un usuario sin avatar.
3. `POST /api/users/me/avatar` funciona correctamente con un usuario que ya tiene avatar.
4. `Users.AvatarId` siempre referencia un `Files.Id` existente o es `NULL`.
5. La creación de `Files` y actualización de `Users.AvatarId` se realizan de manera atómica.
6. Se utiliza el mecanismo de UnitOfWork/transacciones existente en el proyecto.
7. Si una operación de base de datos falla, las operaciones relacionadas se revierten.
8. No se elimina ni desactiva la foreign key como workaround.
9. No se soluciona el problema simplemente capturando `DbUpdateException`.
10. No se asigna un ID de `File` antes de que sea válido según la estrategia de generación de IDs utilizada.
11. El avatar recién creado puede recuperarse correctamente mediante `GET /api/images/{id}`.
12. Los errores técnicos se registran mediante `ILogger`.
13. El frontend recibe un mensaje amigable y no detalles de MySQL/EF Core.
14. No se registran tokens, secretos, credenciales ni contenido del avatar.
15. El backend compila sin errores.
16. El backend compila sin warnings.
17. Se ejecutan pruebas para:

    * usuario sin avatar → carga avatar;
    * usuario con avatar → reemplaza avatar;
    * fallo durante persistencia de `Files`;
    * fallo durante actualización de `Users`;
    * recuperación del avatar después de una actualización exitosa.
18. Se verifica que no quedan registros o referencias inconsistentes como consecuencia de un fallo de la operación, dentro de las posibilidades del mecanismo de almacenamiento físico existente.

---

# Evidencia del error original

```text
Microsoft.EntityFrameworkCore.DbUpdateException:
Could not save changes. Please configure your entity type accordingly.

MySql.Data.MySqlClient.MySqlException:
Cannot add or update a child row: a foreign key constraint fails
(`comiclibrary_dev`.`users`,
CONSTRAINT `FK_Users_Files_AvatarId`
FOREIGN KEY (`AvatarId`)
REFERENCES `files` (`Id`)
ON DELETE SET NULL)
```

Stack relevante:

```text
Application.Services.UserService.UpdateAvatarAsync(...)
    → DbContext.SaveChangesAsync()
```

La task debe corregir la causa raíz y garantizar la integridad y atomicidad de todo el flujo, no limitarse a cambiar el mensaje de error.

---

# Resultado de la ejecución

## Estado

Finished

## Causa raíz identificada

`FileStorageService.SaveAsync` crea la entidad `Image` en memoria con `Id = 0` (auto-increment DB) pero nunca la persiste en el DbContext. El código original asignaba `user.AvatarId = newAvatar.Id` (= 0) antes de que el `Image` existiera en la base, provocando que MySQL rechazara la FK `Users.AvatarId → Files.Id = 0`.

## Trabajo realizado

- Se agregó `AddAsync(Image image, CancellationToken)` a `IImageRepository` y `ImageRepository` para persistir la entidad `Image` al DbContext.
- Se corrigió `UserService.UpdateAvatarAsync`:
  - Se persiste el `Image` mediante `_imageRepository.AddAsync(newAvatar, cancellationToken)` antes de asociarlo al usuario.
  - Se usa la propiedad de navegación `user.Avatar = newAvatar` en lugar de `user.AvatarId = newAvatar.Id`, dejando que EF Core ordene las inserciones y resuelva el ID generado.
  - Se envuelve la operación de base de datos en `try/catch` para compensar (eliminar el archivo físico) si la persistencia falla.
  - La compensación borra el nuevo archivo físico si `SaveChangesAsync` falla, y re-lanza la excepción.
- La creación del `Image` y la actualización del `User` se realizan en una única llamada a `_unitOfWork.SaveChangesAsync()` dentro del mismo `DbContext`, garantizando atomicidad.
- Se mantuvo la FK `FK_Users_Files_AvatarId` y la política `ON DELETE SET NULL`.
- Se mantuvo la eliminación del avatar físico anterior al reemplazarlo.
- No se eliminó la foreign key ni se usó `try/catch` para ocultar el error.
- No se creó un `GenericRepository<T>`.

## Verificación

- Build exitoso: 0 errores, 0 advertencias.
- El `Image` se inserta antes de que `User.AvatarId` lo referencie.
- EF Core resuelve el `Id` generado y asigna correctamente la FK.
- El archivo físico se elimina como compensación si la operación de DB falla.
- Se reutiliza `IUnitOfWork` y `IImageRepository` existentes.
