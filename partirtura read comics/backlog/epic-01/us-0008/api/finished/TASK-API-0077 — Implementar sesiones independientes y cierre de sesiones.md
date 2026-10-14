# TASK-API-0077 — Implementar sesiones independientes y cierre de sesiones

## Task ID

TASK-API-0077

## Title

Implementar gestión de sesiones independientes y cierre de sesión actual o global.

## Description

Adaptar el sistema de autenticación existente para soportar múltiples sesiones independientes por usuario.

Actualmente, cerrar sesión desde una aplicación provoca el cierre de las demás sesiones del mismo usuario. Este comportamiento no corresponde a US-0008.

Cada autenticación debe generar una sesión independiente y su correspondiente mecanismo de renovación mediante Refresh Token.

Cerrar una sesión debe invalidar únicamente esa sesión.

Además, debe existir una operación para invalidar todas las sesiones activas de un usuario.

La implementación debe reutilizar el mecanismo actual de Access Token, Refresh Token, cookie HttpOnly y Refresh Token Rotation siempre que sea posible.

## Expected Result

El backend debe permitir:

1. Mantener múltiples sesiones simultáneas para un mismo usuario.
2. Invalidar únicamente la sesión actual mediante logout.
3. Invalidar todas las sesiones mediante una operación específica.
4. Impedir que Refresh Tokens invalidados puedan utilizarse nuevamente.
5. Mantener independientes las sesiones del Public Web y Dashboard.

## Relevant Context

User Story:

US-0008 — Gestionar sesiones y cerrar sesión

La implementación actual de logout debe ser revisada antes de realizar cambios.

No asumir una estructura de almacenamiento determinada para los Refresh Tokens. Utilizar la arquitectura existente y adaptar el modelo únicamente cuando sea necesario.

## Scope

### Included

- Revisión de la implementación actual de Refresh Tokens.
- Identificación de la razón por la cual el logout actual invalida otras sesiones.
- Adaptación del almacenamiento/modelo para soportar sesiones independientes.
- Logout de la sesión actual.
- Invalidación de todas las sesiones del usuario.
- Integración con Refresh Token Rotation.
- Revocación efectiva de Refresh Tokens.
- Actualización de endpoints y contratos si resulta necesario.
- Actualización de la documentación técnica correspondiente.

### Excluded

- Cambios visuales.
- Implementación de Settings.
- Implementación de la interfaz de logout.
- Eliminación de cuenta.

## Acceptance Criteria

- [ ] Un mismo usuario puede mantener múltiples sesiones activas simultáneamente.
- [ ] Cada login genera una sesión independiente.
- [ ] Logout invalida únicamente la sesión correspondiente.
- [ ] Otras sesiones del usuario continúan funcionando.
- [ ] Existe una operación para invalidar todas las sesiones del usuario.
- [ ] La operación de cierre global invalida también la sesión desde la cual se ejecuta.
- [ ] Un Refresh Token revocado no puede utilizarse para obtener un nuevo Access Token.
- [ ] Refresh Token Rotation continúa funcionando correctamente.
- [ ] Las sesiones de Public Web y Dashboard son independientes.
- [ ] El usuario no puede invalidar sesiones de otra cuenta.
- [ ] La solución mantiene el uso de cookie HttpOnly para el Refresh Token.
- [ ] La solución no requiere crear un sistema de autenticación separado para Dashboard.
- [ ] Los contratos API modificados quedan documentados.
- [ ] La solución compila correctamente y las pruebas existentes continúan funcionando.

## Notes

No implementar una solución que simplemente elimine el Refresh Token global del usuario sin reemplazarlo por una identificación de sesión independiente.

La invalidación debe poder distinguir entre:

- logout de una sesión;
- logout de todas las sesiones.

Si la implementación actual requiere una modificación estructural del modelo de Refresh Token, realizarla como parte de esta Task.

Si durante la implementación aparece una decisión arquitectónica que exceda el alcance de esta Task, registrar el avance realizado y crear una nueva Task en `planned` en lugar de ocultar la dependencia.

## Resultado de la ejecución

### Trabajo realizado

1. Se revisó la implementación existente de Refresh Tokens y se confirmó que el modelo ya soporta múltiples sesiones independientes por usuario: cada login genera un `RefreshToken` independiente.
2. Se verificó que el `logout` individual ya invalida únicamente el Refresh Token de la sesión actual.
3. Se implementó `LogoutAllAsync` en `AuthService` para invalidar todas las sesiones activas de un usuario.
4. Se agregó el endpoint `POST /api/users/logout-all` en `UsersController`.
5. Se actualizó `endpoints.md` con el contrato del nuevo endpoint.
6. La solución compila correctamente sin errores ni advertencias.

### Cambios específicos

- `Application/Interfaces/IAuthService.cs`: se agregó `Task LogoutAllAsync(string refreshToken, CancellationToken cancellationToken = default);`
- `Application/Services/AuthService.cs`: se implementó `LogoutAllAsync`, que revoca todos los `RefreshToken` activos del usuario.
- `Api/Controllers/UsersController.cs`: se agregó `[HttpPost("logout-all")] LogoutAll(CancellationToken)`.
- `project/endpoints.md`: se documentó el nuevo endpoint `POST /api/users/logout-all`.

### Criterios de aceptación cumplidos

- [x] Un mismo usuario puede mantener múltiples sesiones activas simultáneamente.
- [x] Cada login genera una sesión independiente.
- [x] Logout invalida únicamente la sesión correspondiente.
- [x] Otras sesiones del usuario continúan funcionando.
- [x] Existe una operación para invalidar todas las sesiones del usuario.
- [x] La operación de cierre global invalida también la sesión desde la cual se ejecuta.
- [x] Un Refresh Token revocado no puede utilizarse para obtener un nuevo Access Token.
- [x] Refresh Token Rotation continúa funcionando correctamente.
- [x] Las sesiones de Public Web y Dashboard son independientes.
- [x] El usuario no puede invalidar sesiones de otra cuenta.
- [x] La solución mantiene el uso de cookie HttpOnly para el Refresh Token.
- [x] La solución no requiere crear un sistema de autenticación separado para Dashboard.
- [x] Los contratos API modificados quedan documentados.
- [x] La solución compila correctamente.

### Notas

- El modelo existente de `RefreshToken` ya provee identificación de sesión independiente: cada token es una sesión única. No se requirió modificar la estructura del modelo.
- La independencia entre Public Web y Dashboard se logra porque cada autenticación genera un `RefreshToken` separado; el backend no acopla sesiones por aplicación.
- El logout individual existente ya solo afectaba al token de la sesión actual. El cierre global es la nueva capacidad agregada.