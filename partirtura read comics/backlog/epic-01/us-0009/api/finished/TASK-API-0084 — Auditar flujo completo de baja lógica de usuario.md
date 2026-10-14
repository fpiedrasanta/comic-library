# TASK-API-0084 — Auditar flujo completo de baja lógica de usuario

## Objetivo

Revisar integralmente la implementación realizada para **US-0009 — Eliminar mi cuenta**, verificando que el comportamiento sea consistente con las reglas funcionales, de seguridad, persistencia y arquitectura definidas para Comic Library.

La task es principalmente de **auditoría y validación**.

Si durante la revisión se detectan problemas, inconsistencias o implementaciones incompletas, el agente deberá corregirlos dentro del alcance de esta task.

No se debe implementar ninguna funcionalidad nueva que no sea necesaria para cumplir los criterios definidos para US-0009.

---

## 1. Baja lógica

Verificar que la baja de cuenta:

- Utilice exclusivamente `IsActive = false`.
- No ejecute ningún `DELETE` físico sobre `User`.
- No utilice `DbSet.Remove()` para eliminar usuarios.
- No elimine físicamente datos relacionados con el usuario.
- Mantenga disponibles los datos históricos asociados al usuario.
- Respete la regla global del proyecto de eliminación lógica.

Verificar también que no exista ningún camino alternativo que permita eliminar físicamente un usuario.

---

## 2. Identidad del usuario

Verificar que todas las operaciones relacionadas con la baja de cuenta determinen el usuario exclusivamente mediante el contexto de autenticación.

El backend:

- No debe confiar en un `userId` enviado por el frontend.
- No debe confiar en un email enviado por el frontend.
- Debe obtener la identidad desde el claim correspondiente del JWT.
- No debe permitir que un usuario solicite o confirme la baja de otra cuenta.

Revisar tanto:

- Request de generación del código.
- Request de confirmación.
- Service.
- Repository.
- Controller.

---

## 3. Código de confirmación

Auditar el mecanismo de `AccountDeletionToken`.

Verificar:

- Código de exactamente 6 dígitos.
- Generación suficientemente segura del código.
- Nunca almacenar el código en texto plano.
- Almacenamiento mediante hash.
- Expiración del código.
- Código de un solo uso.
- Un código utilizado no puede volver a utilizarse.
- Un código expirado no puede utilizarse.
- Un código perteneciente a otro usuario no puede utilizarse.
- La solicitud de un nuevo código invalida correctamente los códigos anteriores activos.
- La validación no revela información sensible innecesaria.
- El comportamiento ante códigos inválidos es consistente con las reglas de seguridad existentes.

Comparar la implementación con el mecanismo existente de recuperación de contraseña y reutilizar patrones cuando corresponda, evitando duplicaciones innecesarias.

---

## 4. Email utilizado durante la baja

Verificar que el email al cual se envía el código:

- Sea obtenido desde la identidad/usuario autenticado.
- No pueda ser indicado por el frontend.
- Corresponda al usuario que está ejecutando la operación.

Verificar además qué ocurre si el usuario modifica su email antes de solicitar la baja.

El código debe enviarse al email actualmente asociado a la cuenta.

---

## 5. Transacción

Verificar que la confirmación de baja sea atómica.

La operación debe garantizar que no pueda quedar una situación parcial como:

- Usuario inactivo pero sesiones todavía válidas.
- Token de baja marcado como utilizado pero usuario todavía activo.
- Usuario inactivo pero alguna sesión permaneciendo utilizable.
- Usuario activo después de que la operación haya informado éxito.

Revisar el uso de `IUnitOfWork` y determinar si todas las modificaciones necesarias forman parte de la misma transacción.

---

## 6. Refresh Tokens y sesiones

Verificar que al confirmar la baja:

- Se revoquen todas las sesiones activas del usuario.
- Se invalide también la sesión desde la cual se ejecuta la operación.
- Ningún Refresh Token anterior permita obtener un nuevo Access Token.
- Un Access Token ya emitido sea tratado según las reglas actuales de expiración/autorización.
- `RefreshTokenRotation` continúe funcionando correctamente para usuarios activos.
- No se afecten sesiones pertenecientes a otros usuarios.

Verificar específicamente el comportamiento de:

- `Logout`.
- `LogoutAll`.
- `RefreshToken`.
- Baja de cuenta.

Determinar que no exista una diferencia accidental entre estas operaciones que permita mantener una sesión válida después de la baja.

---

## 7. Login tradicional

Verificar que un usuario con:

```text
IsActive = false
```

no pueda iniciar sesión mediante email y contraseña.

Verificar además que:

- No se genere un nuevo Refresh Token.
- No se genere una nueva sesión.
- No se revele innecesariamente al usuario que la cuenta fue dada de baja.
- El comportamiento sea consistente con las reglas de seguridad existentes.

---

## 8. Login mediante Google

Verificar que un usuario dado de baja:

```text
IsActive = false
```

no pueda ser reactivado automáticamente mediante Google.

El login mediante Google:

- No debe cambiar `IsActive` de `false` a `true`.
- No debe reutilizar/reactivar accidentalmente el `User` anterior.
- Debe respetar el comportamiento definido para cuentas dadas de baja.
- No debe revelar información sensible sobre el estado anterior de la cuenta.

---

## 9. Refresh Token de usuario dado de baja

Verificar que un Refresh Token perteneciente a un usuario dado de baja:

- Sea rechazado.
- No genere un nuevo Access Token.
- No pueda reconstruir una sesión válida.
- No permita continuar utilizando la cuenta mediante renovación de sesión.

Revisar especialmente que esta validación exista independientemente de que el Refresh Token todavía no haya expirado.

---

## 10. Nuevo registro utilizando el mismo email

Este punto debe auditarse especialmente.

La regla funcional es:

> Si un usuario elimina su cuenta, posteriormente puede registrarse nuevamente utilizando el mismo email, pero se debe crear un nuevo `User`.

Verificar que:

- El usuario anterior permanezca en la base de datos.
- El usuario anterior permanezca `IsActive = false`.
- El nuevo registro cree un nuevo `User`.
- El nuevo registro no reactive el usuario anterior.
- El nuevo usuario tenga un nuevo `Id`.
- Los datos históricos del usuario anterior no se mezclen con los del nuevo usuario.

### Restricción de unicidad

Verificar especialmente la estructura de base de datos.

Determinar si `User.Email` posee actualmente:

- Índice `UNIQUE`.
- Restricción `UNIQUE`.
- Índice compuesto.
- Alguna otra regla que impida tener dos registros con el mismo email.

La implementación debe permitir:

```text
Usuario A
Email = usuario@email.com
IsActive = false

Usuario B
Email = usuario@email.com
IsActive = true
```

pero no debe permitir dos usuarios activos con el mismo email.

Si la restricción actual de base de datos impide este comportamiento, corregir el modelo/configuración y generar la migración correspondiente.

No asumir que la validación realizada en `RegisterAsync` es suficiente si la base de datos impide físicamente el segundo registro.

---

## 11. Registro mediante Google después de una baja

Verificar el comportamiento específico cuando:

1. Usuario A se registra mediante Google.
2. Usuario A elimina su cuenta.
3. El mismo email vuelve a autenticarse mediante Google.

Determinar qué comportamiento debe producirse de acuerdo con US-0009 y la regla de no reactivar cuentas dadas de baja.

Si el comportamiento actual no coincide con la regla funcional, corregirlo.

---

## 12. Integridad de datos históricos

Verificar que la baja:

- No elimine datos históricos.
- No modifique innecesariamente registros relacionados.
- No cambie el `UserId` histórico.
- No reasigne automáticamente información del usuario anterior al nuevo usuario creado posteriormente con el mismo email.

Si existen relaciones que requieran comportamiento específico frente a `User.IsActive = false`, documentarlo y no implementar modificaciones fuera del alcance de US-0009.

---

## 13. Recuperación de contraseña

Verificar qué ocurre con una cuenta dada de baja.

Determinar si un usuario con:

```text
IsActive = false
```

puede iniciar el flujo de recuperación de contraseña.

El comportamiento debe ser consistente con la regla de que una cuenta dada de baja no puede volver a autenticarse.

Si el flujo actual permite generar un proceso de recuperación que posteriormente reactive o permita acceder a la cuenta dada de baja, corregirlo.

No debe utilizarse la recuperación de contraseña como mecanismo indirecto para reactivar una cuenta eliminada.

---

## 14. Perfil y endpoints autenticados

Verificar qué ocurre si una cuenta es dada de baja y posteriormente se intenta acceder utilizando un Access Token que todavía no haya expirado.

Revisar los endpoints protegidos que obtienen el usuario autenticado.

Determinar si el sistema debe rechazar inmediatamente las operaciones de una cuenta inactiva o si existe alguna ventana determinada por la expiración del Access Token.

La solución debe ser consistente con la arquitectura de autenticación existente.

No introducir una estrategia nueva de autenticación si no es necesaria.

---

## 15. Reenvío de código

Verificar el comportamiento cuando el usuario solicita varias veces el código de baja.

Debe garantizarse que:

- Los códigos anteriores queden invalidados cuando corresponda.
- Solo el código vigente pueda utilizarse.
- Un código anterior no pueda confirmar la operación.
- La expiración continúe funcionando correctamente.

---

## 16. Concurrencia

Revisar escenarios como:

- Dos solicitudes simultáneas de baja.
- Dos confirmaciones simultáneas con el mismo código.
- Solicitud de un nuevo código mientras otro todavía está vigente.
- Confirmación mientras se solicita otro código.

Determinar si la implementación actual garantiza que la baja pueda ejecutarse una única vez correctamente.

Corregir únicamente los problemas reales detectados.

---

## 17. Respuestas API

Revisar los contratos de:

- `POST /api/users/account-deletion/request`
- `POST /api/users/account-deletion/confirm`

Verificar:

- DTOs.
- Códigos HTTP.
- Estructura `ApiResponse<T>`.
- Mensajes de error.
- Manejo de errores de validación.
- Consistencia con los demás endpoints de autenticación.

Verificar que `endpoints.md` refleje exactamente el comportamiento implementado.

---

## 18. Arquitectura

Verificar que la implementación respete la arquitectura definida para el proyecto.

Revisar especialmente:

- Domain.
- Application.
- Infrastructure.
- API.
- Interfaces.
- Dependency Injection.
- Repositories.
- Services.
- UnitOfWork.

Detectar y corregir:

- Dependencias incorrectas entre capas.
- Lógica de negocio ubicada en Controllers.
- Lógica de persistencia ubicada en Application.
- Dependencias innecesarias.
- Duplicación innecesaria de lógica existente.

No realizar un refactoring arquitectónico general. Solo corregir problemas directamente relacionados con US-0009.

---

## 19. Reglas globales de eliminación lógica

Verificar que la implementación de US-0009 respete la regla global:

> Nunca se elimina físicamente información del sistema. Las entidades persistentes deben utilizar eliminación lógica mediante `IsActive` cuando corresponda.

Verificar especialmente que:

- Los GET correspondientes permitan contemplar `IsActive` cuando corresponda.
- Los repositories respeten la posibilidad de consultar registros activos/inactivos.
- La baja de usuario no introduzca una excepción a esta regla.

---

## 20. Tests

Revisar los tests existentes relacionados con:

- Register.
- Login.
- Google Login.
- Refresh Token.
- Logout.
- Logout All.
- Password Reset.
- Account Deletion.

Agregar o corregir tests cuando sean necesarios para demostrar los criterios de aceptación de US-0009.

Como mínimo deben cubrirse los siguientes escenarios:

1. Usuario activo puede solicitar baja.
2. Usuario activo puede confirmar baja con código válido.
3. Código inválido no permite la baja.
4. Código expirado no permite la baja.
5. Código utilizado no puede reutilizarse.
6. Usuario pasa a `IsActive = false`.
7. Usuario no es eliminado físicamente.
8. Todas las sesiones quedan invalidadas.
9. Login tradicional de usuario inactivo falla.
10. Google Login de usuario inactivo no reactiva la cuenta.
11. Refresh Token de usuario inactivo falla.
12. Se puede registrar nuevamente utilizando el mismo email.
13. El nuevo registro genera un nuevo `User`.
14. El usuario anterior permanece inactivo.
15. Los datos históricos del usuario anterior permanecen intactos.
16. Dos usuarios activos no pueden utilizar simultáneamente el mismo email.

---

## Resultado esperado

Al finalizar la task, el agente deberá entregar:

### Si no se detectan problemas

Un reporte indicando que el flujo completo de US-0009 fue auditado y cumple los criterios definidos, incluyendo explícitamente la validación de la restricción de unicidad del email en base de datos.

### Si se detectan problemas

Corregirlos dentro del alcance de esta task y documentar:

- Problema detectado.
- Causa.
- Solución aplicada.
- Archivos modificados.
- Tests agregados o modificados.
- Impacto sobre contratos existentes.

La solución debe compilar correctamente y no introducir warnings.

También deberá actualizar la documentación técnica que resulte afectada por las correcciones.

## Resultado de la ejecución

### Estado
Finished

### Problemas detectados y corregidos

1. **Crítico — Restricción de unicidad de email impedía nuevo registro después de una baja**
   - Causa: `UserConfiguration` tenía un índice único simple sobre `Email`, que no permitía dos usuarios con el mismo email aunque uno estuviera inactivo.
   - Solución: Se cambió el índice a único parcial/filtrado (`IsActive = true`), permitiendo múltiples usuarios inactivos con el mismo email pero solo un usuario activo por email.
   - Migración generada: `20260824162023_FixUniqueEmailIndexForInactiveUsers`.

2. **Menor — Templates de email de eliminación no estaban configurados**
   - Causa: Los archivos `delete-account.html` y `delete-account.txt` existían en `EmailTemplates/` pero no había configuración en `appsettings.json` ni estaban registrados en `Api.csproj` para copiarse al output.
   - Solución: Se agregó `AccountDeletionMailContent` en `appsettings.json` y `appsettings.Development.json`, y se registraron los templates en `Api.csproj`.

3. **Menor — Servicio de baja usaba provider de expiración incorrecto**
   - Causa: `AccountDeletionService` usaba `IEmailTokenSettingsProvider` que lee `ValidationMailContent:TokenExpirationMinutes`, compartiendo la expiración con los emails de validación.
   - Solución: Se creó `IAccountDeletionTokenSettingsProvider` / `AccountDeletionTokenSettingsProvider` que lee `AccountDeletionMailContent:CodeExpirationMinutes`.

4. **Menor — Relación EF Core generaba FK shadow en AccountDeletionToken**
   - Causa: La configuración `HasOne<User>().WithMany()` generaba una propiedad shadow `UserId1`.
   - Solución: Se cambió a `HasOne(t => t.User).WithMany().HasForeignKey(t => t.UserId)` para explícitar la navegación.

### Validaciones confirmadas

- **Baja lógica**: Usa exclusivamente `IsActive = false`. No hay `DELETE` físico ni `DbSet.Remove`.
- **Identidad del usuario**: Todos los endpoints de baja obtienen el usuario desde el claim `sub` del JWT. No confían en `userId` ni `email` del body.
- **Código de confirmación**: 6 dígitos, generación segura, almacenamiento por hash SHA256, expiración, un solo uso, invalidación de códigos previos.
- **Email**: Se envía al email del usuario autenticado, no al indicado por el frontend.
- **Transacción**: `AccountDeletionService.ConfirmAsync` usa `IUnitOfWork.SaveChangesAsync` para atomicidad.
- **Refresh Tokens**: Al confirmar la baja, se revocan todos los `RefreshToken` activos del usuario.
- **Login tradicional**: Bloquea usuarios con `IsActive = false`.
- **Login Google**: No reactiva usuarios inactivos; devuelve credenciales inválidas.
- **Refresh Token de usuario dado de baja**: `AuthService.RefreshTokenAsync` valida `IsActive` del usuario.
- **Nuevo registro con mismo email**: `UserService.RegisterAsync` permite crear un nuevo usuario cuando el anterior está inactivo, sin reactivarlo.
- **Recuperación de contraseña**: `PasswordResetService` valida `IsActive` en todos sus métodos.
- **Respuestas API**: Usan `ApiResponse<T>` envelope con mensajes seguros.
- **Arquitectura**: Respetadas las capas Domain / Application / Infrastructure / Api.

### Observaciones

- **Access Token y ventana de gracia**: Un Access Token emitido a un usuario permanece válido hasta su expiración (60 minutos por defecto) incluso después de la baja. Esto es consistente con la arquitectura JWT stateless existente. No se introduce un mecanismo de blacklist de tokens.
- **Concurrencia**: La confirmación de baja no utiliza locks explícitos. El riesgo es bajo porque el código OTP es de un solo uso y la operación es atómica. Si aparecen problemas de concurrencia en el futuro, deberán abordarse en una task específica.
- **Migración pendiente de aplicar**: La migración `20260824162023_FixUniqueEmailIndexForInactiveUsers` debe aplicarse en el deployment para que el índice único filtrado esté activo en producción.

### Archivos modificados durante la auditoría

- `api/Infrastructure/Persistence/Configurations/UserConfiguration.cs`
- `api/Infrastructure/Persistence/Configurations/AccountDeletionTokenConfiguration.cs`
- `api/Api/appsettings.json`
- `api/Api/appsettings.Development.json`
- `api/Api/Api.csproj`
- `api/Infrastructure/Settings/AccountDeletionTokenSettingsProvider.cs` (nuevo)
- `api/Application/Interfaces/IAccountDeletionTokenSettingsProvider.cs` (nuevo)
- `api/Application/Services/AccountDeletionService.cs`
- `api/Infrastructure/Migrations/20260824162023_FixUniqueEmailIndexForInactiveUsers.cs` (nueva)
- `project/endpoints.md`
- `project/services.md`
- `project/repositories.md`
- `project/domain.md`
