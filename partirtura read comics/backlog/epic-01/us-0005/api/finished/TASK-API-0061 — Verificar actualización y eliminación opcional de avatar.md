# TASK-API-0061 — Verificar actualización y eliminación opcional de avatar

## Task ID

TASK-API-0061

## Tipo

Bug / Verification

## Estado

planned

## Asignado a

Backend Agent

---

## Contexto

La implementación de `TASK-API-0060` corrigió el problema de integridad referencial al actualizar el avatar del usuario.

La operación ahora persiste la entidad `Image` mediante `IImageRepository`, asocia el nuevo avatar mediante la navegación `User.Avatar` y utiliza el mismo `DbContext` para guardar los cambios.

El avatar del usuario es **opcional**. Por lo tanto, el sistema debe permitir que un usuario no tenga avatar y que pueda eliminar su avatar actual sin reemplazarlo por otro.

---

## Problema a verificar

La implementación actual debe garantizar correctamente todos los escenarios de actualización del avatar.

No se debe solucionar un error de FK simplemente prohibiendo `AvatarId = null`.

**`AvatarId = null` es un estado válido del dominio.**

La FK existente:

```text
Users.AvatarId → Files.Id
ON DELETE SET NULL
```

debe mantenerse.

---

## Objetivo

Verificar y corregir, si fuera necesario, `UserService.UpdateAvatarAsync` para que soporte correctamente los siguientes escenarios:

### Escenario 1 — Usuario sin avatar → carga un avatar

Debe:

1. Crear/persistir la entidad `Image`.
2. Obtener correctamente el ID generado por la base de datos.
3. Asociar el `User` con el nuevo `Image`.
4. Guardar ambas modificaciones de forma atómica dentro del mismo `DbContext`.
5. Mantener el archivo físico correctamente almacenado.
6. Finalizar con `User.AvatarId` apuntando al nuevo `Files.Id`.

---

### Escenario 2 — Usuario con avatar → reemplaza el avatar

Debe:

1. Crear y persistir el nuevo `Image`.
2. Asociar el usuario al nuevo avatar.
3. Guardar correctamente el cambio de FK.
4. Eliminar el archivo físico anterior **solamente cuando sea seguro hacerlo**.
5. No dejar al usuario apuntando a un archivo inexistente.
6. No dejar una FK apuntando a un `Files.Id` inexistente.

---

### Escenario 3 — Usuario con avatar → elimina su avatar

Este escenario es obligatorio.

El backend debe aceptar que el avatar sea eliminado y que el usuario quede sin avatar.

El resultado esperado es:

```text
User.AvatarId = null
```

No se debe generar un error de foreign key.

No se debe crear una entidad `Image` ficticia.

No se debe utilizar `Id = 0`.

No se debe mantener obligatoriamente el avatar anterior.

El archivo físico correspondiente al avatar anterior debe eliminarse según las reglas de almacenamiento existentes.

---

### Escenario 4 — Usuario sin avatar → solicita eliminar avatar

Debe ser una operación válida e idempotente.

Si:

```text
User.AvatarId = null
```

y se solicita nuevamente eliminar el avatar, la operación no debe fallar.

---

## Atomicidad

La operación de base de datos debe utilizar el `IUnitOfWork` / `DbContext` existente.

No crear un `GenericRepository<T>`.

No crear una nueva abstracción de Unit of Work.

La creación del nuevo `Image` y la actualización del `User` deben persistirse dentro de la misma operación de `SaveChangesAsync`.

### Importante

Una transacción de base de datos **no hace rollback del filesystem**.

Por lo tanto, si se crea un archivo físico y posteriormente falla la transacción de DB, debe existir una estrategia de compensación para eliminar ese archivo físico.

De la misma manera, **no debe eliminarse el archivo físico anterior antes de tener garantizado que la actualización de DB fue exitosa**, porque una transacción de DB tampoco puede recuperar un archivo físico eliminado.

Revisar específicamente el orden actual de estas operaciones.

---

## Reglas

### Mantener

* FK `Users.AvatarId → Files.Id`.
* `ON DELETE SET NULL`.
* `AvatarId` nullable.
* `IImageRepository`.
* `IUnitOfWork`.
* EF Core como mecanismo de persistencia.
* El almacenamiento físico existente.
* La arquitectura actual.

### No hacer

* No eliminar la FK.
* No convertir `AvatarId` en obligatorio.
* No utilizar `0` como `AvatarId`.
* No crear `Image` con un ID artificial.
* No ocultar `DbUpdateException`.
* No agregar `GenericRepository<T>`.
* No crear un segundo `DbContext` para resolver el problema.
* No modificar el contrato para impedir `null`.
* No eliminar la política `ON DELETE SET NULL`.

---

## Criterios de aceptación

1. Un usuario sin avatar puede cargar un avatar correctamente.

2. Un usuario con avatar puede reemplazarlo correctamente.

3. Un usuario con avatar puede eliminarlo y quedar con:

```text
AvatarId = null
```

4. Un usuario que ya no tiene avatar puede volver a solicitar su eliminación sin error.

5. Nunca se utiliza `AvatarId = 0` como referencia temporal.

6. Nunca se inserta `Users.AvatarId` apuntando a un `Files.Id` inexistente.

7. La creación del nuevo `Image` y la actualización del `User` se realizan dentro del mismo `DbContext` y `SaveChangesAsync`.

8. Si falla la persistencia de DB después de crear el archivo físico nuevo, el archivo nuevo se elimina mediante compensación.

9. Si falla la actualización de DB, el avatar físico anterior no debe quedar eliminado de forma irreversible.

10. No se modifica la FK existente ni su comportamiento `ON DELETE SET NULL`.

11. `POST /api/users/me/avatar` continúa funcionando para cargar/reemplazar avatar.

12. El contrato utilizado para eliminar el avatar permite representar explícitamente la ausencia de avatar.

13. No se introducen repositorios genéricos ni nuevas abstracciones innecesarias.

14. `dotnet build` finaliza con **0 errores y 0 warnings**.

15. Se prueban explícitamente los cuatro escenarios descritos en esta task.

---

## Resultado esperado

La gestión del avatar debe soportar correctamente todo el ciclo de vida:

```text
Sin avatar
    ↓
Cargar avatar
    ↓
Avatar A
    ↓
Reemplazar
    ↓
Avatar B
    ↓
Eliminar
    ↓
Sin avatar
```

La ausencia de avatar (`AvatarId = null`) es un estado válido y no debe considerarse un error de integridad referencial.

La consistencia entre base de datos y filesystem debe mantenerse mediante transacción para la parte de DB y compensación para las operaciones sobre archivos físicos.

---

## Nota para la ejecución

No hacer una refactorización general.

Trabajar únicamente sobre el flujo de actualización/eliminación de avatar y las clases estrictamente necesarias.

Antes de modificar código, revisar el contrato actual de `UpdateAvatarRequest` y determinar cómo está representada actualmente la operación de eliminación del avatar.

Si el contrato actual no permite distinguir correctamente entre:

* no modificar avatar;
* cargar/reemplazar avatar;
* eliminar avatar;

corregirlo de forma explícita y documentar el cambio.
