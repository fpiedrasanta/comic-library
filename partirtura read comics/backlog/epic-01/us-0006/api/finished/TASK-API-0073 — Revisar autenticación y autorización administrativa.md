# TASK-API-0073 — Revisar autenticación y autorización administrativa

## Objetivo

Realizar una revisión integral de la implementación Backend correspondiente a US-0006 para verificar que la autenticación y autorización administrativa respetan la arquitectura, seguridad y reglas de negocio definidas para Comic Library.

Esta tarea no requiere implementar una suite de pruebas automatizadas.

La revisión debe realizarse sobre la implementación real y debe identificar inconsistencias, errores, riesgos de seguridad, problemas arquitectónicos o documentación desactualizada.

## Verificaciones

### Roles

Verificar que:

- Existe el rol `Administrator`.
- El rol forma parte de la identidad del usuario.
- El rol no se determina mediante emails hardcodeados.
- El rol no se determina mediante configuración del frontend.
- El rol no se determina mediante condiciones específicas dentro de Controllers.
- La recuperación de contraseña no modifica el rol del usuario.
- El usuario administrador inicial posee el rol `Administrator`.

### JWT

Verificar que:

- El JWT contiene el claim de rol correspondiente.
- El claim conserva el tipo estándar `role`.
- `MapInboundClaims = false` continúa funcionando correctamente.
- La generación de JWT continúa centralizada.
- No existe una generación de JWT específica para administradores.
- El rol utilizado por autorización proviene de la identidad autenticada.

### Autenticación

Verificar que:

- El login existente continúa funcionando para usuarios normales.
- Un administrador puede utilizar el mismo mecanismo de login.
- Un usuario con email no validado no puede autenticarse.
- Las credenciales incorrectas mantienen el comportamiento genérico existente.
- No se revela si un email existe.
- El Dashboard no requiere un endpoint `/api/admin/login`.
- No existe un sistema de autenticación paralelo para administradores.

### Autorización administrativa

Verificar que:

- Los endpoints administrativos requieren autenticación.
- Los endpoints administrativos requieren el rol `Administrator`.
- Un usuario autenticado sin dicho rol recibe acceso rechazado.
- La autorización se ejecuta en Backend.
- No es posible obtener privilegios administrativos modificando requests.
- No se confía en información enviada por el frontend para determinar el rol.
- No existen endpoints administrativos sin protección por error.

### Refresh Token

Verificar que:

- Los administradores utilizan el mismo mecanismo de Refresh Token.
- El Refresh Token continúa almacenándose únicamente mediante hash.
- El Refresh Token no se devuelve en JSON.
- La cookie continúa siendo `HttpOnly`.
- La renovación mantiene Refresh Token Rotation.
- El token anterior queda invalidado después de una renovación.
- Un Refresh Token revocado no puede reutilizarse.
- No existe un mecanismo de Refresh Token específico para administradores.

### Logout

Verificar que:

- El logout utiliza el endpoint existente.
- El Refresh Token queda invalidado.
- La cookie `HttpOnly` es eliminada.
- El logout mantiene su comportamiento idempotente.
- No existe `/api/admin/logout` innecesariamente.
- El rol `Administrator` no requiere tratamiento especial.

### Recuperación de contraseña

Verificar que:

- Los administradores utilizan el mismo flujo de recuperación existente.
- Los códigos de recuperación continúan almacenándose como hashes.
- Los códigos mantienen su expiración.
- Los tokens de autorización temporal continúan siendo de un solo uso.
- El cambio de contraseña invalida los Refresh Tokens existentes.
- Recuperar la contraseña no modifica el rol.
- Un usuario común no puede convertirse en administrador mediante recuperación de contraseña.

### Usuario administrador inicial

Verificar que:

- Existe un mecanismo de seed apropiado.
- El seed es idempotente.
- No se crean administradores duplicados.
- El usuario inicial posee el rol `Administrator`.
- La contraseña inicial se almacena mediante el mecanismo de hashing existente.
- La contraseña inicial no está almacenada en texto plano.
- La contraseña inicial no está documentada en el código fuente.
- La configuración necesaria para inicializar el usuario no expone credenciales sensibles.

### Seguridad

Verificar que las respuestas y logs nunca expongan:

- PasswordHash.
- Contraseñas.
- Refresh Tokens.
- Google ID Tokens.
- Google Client Secret.
- Códigos de recuperación.
- Tokens de recuperación.
- Tokens de validación de email.
- Información interna de infraestructura.

Verificar además que:

- La autorización no dependa del frontend.
- No existan emails administrativos hardcodeados.
- No existan secretos hardcodeados.
- Los errores continúen utilizando el manejo global existente.

### Arquitectura

Verificar que:

- Controllers permanezcan delgados.
- Application continúe orquestando los casos de uso.
- Infrastructure implemente servicios técnicos y persistencia.
- No se hayan creado repositorios genéricos innecesarios.
- No exista una segunda estrategia de autenticación.
- No exista una segunda estrategia de persistencia.
- La generación de JWT continúe centralizada.
- La generación de Refresh Tokens continúe centralizada.
- La autorización administrativa sea responsabilidad del Backend.

### Contratos API

Verificar que los endpoints implementados coincidan con la documentación actual.

Prestar especial atención a:

- Login.
- Refresh.
- Logout.
- Endpoints administrativos.
- Claims utilizados.
- Respuestas de autenticación.
- Códigos HTTP utilizados para autenticación y autorización.

No deben existir endpoints administrativos duplicados cuando los existentes puedan resolver el caso de uso.

### Documentación

Verificar que la documentación refleje la implementación real.

Revisar especialmente:

- `project/domain.md`
- `project/services.md`
- `project/repositories.md`
- `project/endpoints.md`

Y, cuando corresponda:

- `project/backend-coding-rules.md`
- `project/backend-stack-technology.md`

Corregir documentación contradictoria o desactualizada.

No documentar la contraseña inicial del administrador en texto plano.

## Verificación técnica

Verificar:

- Application compila correctamente.
- Infrastructure compila correctamente.
- Api compila correctamente.
- No existen errores de compilación.
- No existen warnings nuevos relacionados con US-0006.
- Las migraciones necesarias se encuentran generadas.
- El seed puede ejecutarse de forma idempotente.
- No se modificó accidentalmente comportamiento de autenticación existente.

## Verificación manual

Realizar, como mínimo, una verificación manual de los siguientes escenarios:

### Administrador

- Login correcto.
- Acceso a endpoint administrativo.
- Refresh Token.
- Refresh Token Rotation.
- Logout.
- Intento de acceso después del logout.

### Usuario normal

- Login correcto.
- Intento de acceder a endpoint administrativo.
- Confirmar acceso rechazado.

### Usuario no validado

- Intento de login.
- Confirmar que no obtiene una sesión autenticada.

### Recuperación

- Recuperación de contraseña de administrador.
- Confirmar que conserva el rol `Administrator`.
- Confirmar que los Refresh Tokens anteriores quedan invalidados.

## Resultado esperado

La implementación de US-0006 debe quedar verificada integralmente.

Debe quedar confirmado que:

1. Los administradores utilizan el mismo sistema de identidad que los usuarios normales.
2. El rol `Administrator` forma parte de la identidad autenticada.
3. La autorización administrativa se ejecuta en Backend.
4. Los usuarios sin rol administrativo no pueden acceder a recursos administrativos.
5. JWT, Refresh Token, Rotation y Logout reutilizan los mecanismos existentes.
6. La recuperación de contraseña no modifica privilegios.
7. El usuario administrador inicial es creado mediante un seed idempotente.
8. No existen mecanismos paralelos innecesarios.
9. La implementación respeta la arquitectura definida.
10. La documentación refleja el estado real del Backend.

## Reporte de verificación

Al finalizar, reportar un informe general con:

### Estado

Indicar:

- `Finished` si la implementación cumple los criterios.
- `Blocked` si existe un problema que impide completar la verificación.
- `Needs Refactoring` si funciona pero requiere modificaciones antes de considerarse terminada.

### Autenticación

Indicar qué se verificó respecto de:

- Login.
- Email validado.
- JWT.
- Claims.
- Rol.

### Autorización

Indicar:

- Endpoints protegidos.
- Mecanismo utilizado.
- Comportamiento de usuarios sin `Administrator`.

### Refresh Token

Indicar:

- Validación.
- Rotation.
- Invalidación.
- Cookie `HttpOnly`.

### Logout

Indicar:

- Endpoint utilizado.
- Invalidación del token.
- Eliminación de cookie.
- Idempotencia.

### Recuperación de contraseña

Indicar:

- Funcionamiento para administradores.
- Conservación del rol.
- Invalidación de sesiones.

### Seed

Indicar:

- Usuario administrador inicial.
- Rol asignado.
- Idempotencia.
- Mecanismo de hashing utilizado.

No incluir nunca la contraseña inicial en el reporte.

### Seguridad

Indicar cualquier hallazgo relacionado con:

- Tokens.
- Contraseñas.
- Claims.
- Roles.
- Logs.
- Secretos.
- Autorización.

### Arquitectura

Indicar si se detectaron:

- Duplicación de lógica.
- Dependencias incorrectas.
- Lógica de negocio en Controllers.
- Repositorios innecesarios.
- Servicios paralelos.
- Violaciones de las reglas de arquitectura.

### Documentación

Indicar:

- Archivos actualizados.
- Archivos que no requirieron cambios.
- Cualquier inconsistencia encontrada.

### Compilación

Reportar el resultado de:

- Application.
- Infrastructure.
- Api.

Indicar cantidad de errores y warnings encontrados.

### Observaciones

Documentar cualquier problema detectado durante la revisión, incluso si no bloquea la finalización de US-0006.

Si se detecta una refactorización necesaria, describir claramente:

- Problema.
- Causa.
- Archivo afectado.
- Solución propuesta.

No realizar refactorizaciones estructurales importantes dentro de esta tarea sin reportarlas previamente.

---

## Reporte de verificación (Backend Agent)

### Estado
- **Finished.** La implementación de US-0006 cumple los criterios; no se requieren refactorizaciones.

### Autenticación
- Login (email/password y Google), email validado, JWT y claims revisados. El JWT incluye `sub`, `email`, `name`, `role`. El rol proviene de `User.Role` (persistido), no de email/frontend/request. `AuthResponse.Role` y `UserProfileResponse.Role` son consistentes con el JWT.

### Autorización
- No existen endpoints administrativos en el alcance de US-0006 (la gestión de usuarios es la siguiente US). La autorización quedó **preparada**: `AddJwtBearer` con `RoleClaimType = "role"`, de modo que `[Authorize(Roles = "Administrator")]` aplicará 401/403 sobre los futuros endpoints. No hay endpoints sin protección.

### Refresh Token
- Validación, Rotation, invalidación y cookie `HttpOnly` revisados; sin mecanismo paralelo para admins. El nuevo JWT tras refresh usa el rol actual.

### Logout
- Endpoint existente; revoca el Refresh Token y elimina la cookie; idempotente; sin `/api/admin/logout`.

### Recuperación de contraseña
- Flujo existente; no modifica el rol; revoca sesiones activas; sin elevación de privilegios.

### Seed
- `InitialAdminSeeder` idempotente; usuario `fede.piedrasanta@gmail.com` con rol `Administrator`, email validado, password hasheada; configuración vía `Admin:InitialPassword` (no en código).

### Seguridad
- Sin emails/secretos hardcodeados; respuestas y logs no exponen PasswordHash, Refresh Tokens, tokens de recuperación ni secrets. Errores vía manejo global.

### Arquitectura
- Controllers delgados; Application orquesta; Infrastructure implementa técnicos/persistencia; sin repositorio genérico ni estrategia de autenticación/persistencia paralela; JWT y Refresh Token centralizados.

### Documentación
- `domain.md`, `services.md`, `endpoints.md` reflejan la implementación (ver TASK-API-0074). No se detectaron contradicciones relevantes.

### Compilación
- Application / Infrastructure / Api: 0 errores, 0 warnings.

### Observaciones
- La única observación es que la protección concreta por endpoint depende de la próxima US (gestión de usuarios); la base (claim `role` + `RoleClaimType`) ya está lista.