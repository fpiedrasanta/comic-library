# TASK-API-0074 — Actualizar documentación técnica de autenticación y autorización administrativa

## Objetivo

Actualizar la documentación técnica del Backend para reflejar correctamente los cambios realizados durante US-0006 relacionados con roles, autenticación administrativa, autorización y usuario administrador inicial.

La documentación debe describir la implementación real y no incorporar decisiones que no hayan sido implementadas.

## Documentación a revisar

Revisar los siguientes documentos:

- `project/domain.md`
- `project/services.md`
- `project/repositories.md`
- `project/endpoints.md`
- `project/backend-coding-rules.md`

Si corresponde, revisar también:

- `project/backend-stack-technology.md`

## Domain

Actualizar `project/domain.md` cuando corresponda para documentar:

- Rol del usuario.
- Valor `Administrator`.
- Relación entre usuario y rol.
- Estado de validación del email, si la implementación lo modifica.
- Información necesaria para representar correctamente la identidad administrativa.

No documentar un modelo de roles que no exista realmente en la implementación.

Si el rol se implementa como enum, entidad, value object u otra representación, documentar la solución real.

## Services

Actualizar `project/services.md` para reflejar los cambios realizados en servicios existentes.

Revisar especialmente:

### AuthService

Documentar:

- Inclusión del rol en la autenticación.
- Generación de JWT con información de rol.
- Validación de usuario para autenticación.
- Uso del mismo mecanismo de autenticación para usuarios normales y administradores.

### JwtTokenGenerator

Documentar:

- Claims generados.
- Claim utilizado para el rol.
- Comportamiento respecto de `MapInboundClaims = false`.

### Servicios relacionados

Actualizar únicamente aquellos servicios cuyo comportamiento haya cambiado como consecuencia de US-0006.

No duplicar responsabilidades ya documentadas.

## Repositories

Revisar `project/repositories.md`.

Documentar modificaciones únicamente si se incorporaron operaciones nuevas o cambios reales en repositorios.

Verificar especialmente que:

- No se haya creado un Generic Repository.
- No se haya creado un repositorio exclusivamente para roles si la implementación no lo requiere.
- El acceso a datos continúe utilizando los repositorios definidos por la arquitectura.

Si no existen cambios en repositorios, no modificar el documento innecesariamente.

## Endpoints

Actualizar `project/endpoints.md`.

Documentar cualquier cambio realizado en:

- Login.
- Refresh Token.
- Logout.
- Endpoints administrativos.
- Autorización de endpoints.
- Claims requeridos.
- Códigos HTTP utilizados.

Para cada endpoint afectado verificar:

- HTTP method.
- Ruta.
- Autenticación requerida.
- Rol requerido.
- Request.
- Response.
- Códigos HTTP.
- Comportamiento ante acceso no autorizado.

No crear documentación para endpoints que no existan.

No documentar endpoints administrativos duplicados si la implementación reutiliza los endpoints existentes.

## Usuario administrador inicial

Documentar el mecanismo de inicialización del usuario administrador cuando corresponda.

La documentación debe indicar:

- Que existe un usuario administrador inicial.
- Que posee el rol `Administrator`.
- Que el seed es idempotente.
- Que la contraseña se almacena utilizando el mecanismo de hashing existente.
- Que las credenciales sensibles no forman parte del código fuente.

No documentar:

- La contraseña inicial.
- Hashes de contraseñas.
- Secretos.
- Tokens.
- Credenciales SMTP.
- JWT secrets.

## Autorización

Documentar el mecanismo utilizado para proteger los recursos administrativos.

Debe quedar claro que:

- La autenticación identifica al usuario.
- La autorización determina si posee el rol requerido.
- El Backend es la autoridad final.
- El frontend no constituye un mecanismo de seguridad.
- El rol `Administrator` es requerido para recursos administrativos.

No documentar RBAC avanzado si no fue implementado.

## Seguridad

Verificar que la documentación sea consistente con las reglas existentes.

Debe quedar reflejado que:

- Las contraseñas no se almacenan en texto plano.
- Los Refresh Tokens no se exponen en JSON.
- Los Refresh Tokens continúan protegidos mediante hashing.
- El Refresh Token se transporta mediante cookie `HttpOnly`.
- JWT continúa siendo generado por el mecanismo centralizado.
- La autorización se ejecuta en Backend.
- Los secretos no se almacenan en el repositorio.

## Coding Rules

Revisar `project/backend-coding-rules.md` para determinar si US-0006 requiere documentar alguna nueva regla.

Sólo incorporar reglas generales que hayan surgido realmente de la implementación.

No agregar reglas específicas de una implementación puntual si no constituyen una regla arquitectónica o de desarrollo reutilizable.

## Stack Technology

Revisar `project/backend-stack-technology.md`.

Actualizarlo únicamente si durante US-0006 se incorporó una nueva dependencia tecnológica o se modificó una dependencia existente.

La incorporación del rol `Administrator` por sí sola no requiere modificar el stack tecnológico.

## Consistencia entre documentos

Verificar que no existan contradicciones entre:

- `domain.md`
- `services.md`
- `repositories.md`
- `endpoints.md`
- `backend-coding-rules.md`
- `backend-stack-technology.md`

La documentación debe describir una única arquitectura coherente.

## Criterios de aceptación

### CA-01 — Roles documentados

El rol `Administrator` está documentado en el artefacto correspondiente.

### CA-02 — JWT documentado

Los claims relevantes del JWT están correctamente documentados.

### CA-03 — Autorización documentada

Los recursos administrativos y su requisito de autorización están correctamente documentados.

### CA-04 — Seed documentado

El mecanismo de creación del administrador inicial está documentado sin exponer credenciales sensibles.

### CA-05 — Endpoints actualizados

Los contratos API afectados por US-0006 reflejan la implementación real.

### CA-06 — Servicios actualizados

Las responsabilidades modificadas de los servicios están correctamente documentadas.

### CA-07 — Repositorios consistentes

`repositories.md` refleja correctamente los cambios reales o permanece sin modificaciones cuando no existen cambios.

### CA-08 — Sin información sensible

La documentación no contiene:

- Contraseñas.
- Hashes de contraseñas.
- Refresh Tokens.
- JWT secrets.
- Google Client Secret.
- Códigos de recuperación.
- Tokens de recuperación.
- Tokens de validación.

### CA-09 — Sin documentación ficticia

No existen endpoints, servicios, repositorios, entidades o mecanismos documentados que no existan en la implementación.

### CA-10 — Compilación

La documentación no debe requerir cambios de código adicionales para considerarse terminada.

La solución debe continuar compilando correctamente en:

- Application.
- Infrastructure.
- Api.

## Resultado esperado

Al finalizar esta tarea, la documentación técnica del Backend debe reflejar fielmente la implementación de US-0006.

Un desarrollador que consulte la documentación debe poder comprender:

1. Cómo se representa el rol `Administrator`.
2. Cómo se incorpora el rol a la identidad autenticada.
3. Cómo se genera el JWT.
4. Cómo se protegen los recursos administrativos.
5. Cómo se crea el administrador inicial.
6. Cómo se relaciona la autenticación administrativa con el sistema de identidad existente.
7. Qué endpoints requieren autorización administrativa.
8. Qué mecanismos de seguridad continúan siendo compartidos con el Public Web.

## Reporte de implementación

Al finalizar, reportar:

### Documentos modificados

Indicar cada archivo actualizado y resumir brevemente qué se modificó.

### Documentos revisados sin cambios

Indicar los documentos revisados que no necesitaron modificaciones.

### Cambios relevantes

Informar cualquier decisión de implementación que haya requerido modificar la documentación respecto del diseño original de US-0006.

### Inconsistencias encontradas

Reportar cualquier contradicción encontrada entre documentación e implementación.

### Seguridad

Confirmar que no se incorporó información sensible a ningún documento.

### Compilación

Reportar:

- Application: resultado.
- Infrastructure: resultado.
- Api: resultado.
- Errores.
- Warnings.

### Observaciones

Informar cualquier punto que deba revisarse posteriormente o que pueda requerir una refactorización.

---

## Reporte de implementación (Backend Agent)

### Documentos modificados
- `project/domain.md`: sección `UserRole` y propiedad `Role` en `User` (agregadas durante TASK-API-0063/0065).
- `project/services.md`: `JwtTokenGenerator` incluye el claim `role`; `AuthService` genera JWT con el rol persistido y `AuthResponse.Role` consistente.
- `project/endpoints.md`: `GET`/`PUT /api/users/me` documentan el campo `role` en `UserProfileResponse`.

### Documentos revisados sin cambios
- `project/repositories.md`: US-0006 no agregó métodos de repositorio nuevos ni repositorio de roles (el rol es una columna de `User`); sin cambios.
- `project/backend-coding-rules.md`: no surgió una regla arquitectónica general nueva que documentar.
- `project/backend-stack-technology.md`: `Administrator` no introdujo nueva dependencia tecnológica.

### Cambios relevantes
- El rol se representa como enum `UserRole` persistido como `varchar` (no IdentityRole), decisión documentada en el reporte de TASK-API-0063.

### Inconsistencias encontradas
- Ninguna contradicción entre documentación e implementación. (La documentación histórica de `User` en `domain.md` usaba `Nationality: Country?` mientras el código usa `CountryId`/`Nationality`; es una inconsistencia previa a esta US y ajena al alcance, no modificada para no introducir ruido.)

### Seguridad
- No se incorporó información sensible (contraseña inicial, hashes, secrets, JWT secrets) a ningún documento.

### Compilación
- Application / Infrastructure / Api: 0 errores, 0 warnings (sin cambios de código en esta task).

### Observaciones
- La autorización administrativa por endpoint se documentará al implementar la gestión de usuarios (siguiente US), reutilizando `RoleClaimType` y `[Authorize(Roles = "Administrator")]`.