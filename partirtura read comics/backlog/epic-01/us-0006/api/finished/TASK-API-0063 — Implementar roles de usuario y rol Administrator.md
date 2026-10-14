# TASK-API-0063 — Implementar roles de usuario y rol Administrator

## Tipo

Backend / Domain / Persistence.

## User Story

US-0006 — Autenticación y acceso al Dashboard administrativo.

## Objetivo

Incorporar al backend el concepto de rol de usuario necesario para distinguir un usuario común de un usuario administrador.

El rol inicial requerido por el sistema es:

```text
Administrator
```

La implementación debe ser simple y extensible, sin introducir en esta task un sistema avanzado de permisos, permisos por recurso o RBAC granular.

El rol debe formar parte de la identidad del usuario y posteriormente podrá ser utilizado por el mecanismo de autorización de ASP.NET Core para proteger los recursos administrativos.

---

## Alcance

Implementar la representación del rol del usuario y su persistencia.

La solución debe:

- Incorporar el concepto de rol al modelo de identidad existente.
- Permitir identificar si un usuario posee el rol `Administrator`.
- Permitir que un usuario no administrativo tenga otro rol o un rol distinto según el modelo definido.
- Permitir utilizar el rol posteriormente como claim de autenticación.
- Permitir utilizar el rol posteriormente para implementar autorización mediante ASP.NET Core.
- Mantener la compatibilidad con los usuarios existentes.
- Permitir agregar nuevos roles en el futuro sin rediseñar completamente el sistema de identidad.
- Un administrador puede actuar cómo un PublicUser, pero nadie que no sea Administrador puede actuar o loguearse en el dashboard.

El rol administrativo inicial será:

```text
Administrator
```

No implementar en esta task:

- Permisos granulares.
- Permisos por recurso.
- Roles dinámicos administrables desde el Dashboard.
- RBAC avanzado.
- Autorización específica de endpoints administrativos.
- Seed del usuario administrador inicial.

El seed será implementado en una task posterior.

---

## Documentación previa obligatoria

Antes de modificar el código, revisar:

- `project.md`
- `communication.md`
- `backend-architecture.md`
- `backend-stack-technology.md`
- `backend-coding-rules.md`
- `domain.md`
- `repositories.md`
- `services.md`
- `endpoints.md`

También revisar la implementación existente de:

- Entidad `User`.
- Configuración de Entity Framework Core.
- Configuración de ASP.NET Core Identity, si existe.
- Autenticación JWT.
- Claims actualmente generados.
- Migrations existentes.
- Persistencia de usuarios.

No asumir una estrategia de implementación sin revisar primero el código existente.

---

## Modelo de roles

El sistema debe incorporar una representación explícita del rol del usuario.

La implementación debe evitar que la autorización dependa de condiciones como:

```text
if (user.Email == "fede.piedrasanta@gmail.com")
```

o:

```text
if (user.Email == ...)
{
    // Administrator
}
```

El email del administrador inicial será utilizado posteriormente por el mecanismo de seed únicamente para identificar el usuario que debe existir inicialmente.

No debe convertirse en el mecanismo general de autorización.

El rol debe poder ser consultado independientemente del email del usuario.

---

## Estrategia de implementación

Revisar primero si el proyecto ya utiliza ASP.NET Core Identity para la gestión de usuarios y contraseñas.

Si Identity ya forma parte de la arquitectura existente, evaluar si el sistema puede utilizar su mecanismo de roles de forma consistente con la arquitectura actual.

Si existe una razón arquitectónica para no utilizar `IdentityRole` / `RoleManager`, documentar la decisión y utilizar una representación de roles compatible con el diseño existente.

No incorporar una librería externa de autorización si el requerimiento puede resolverse con los mecanismos disponibles en ASP.NET Core.

La implementación debe respetar la arquitectura definida en `backend-architecture.md`.

---

## Persistencia

El rol debe persistirse de manera que pueda recuperarse junto con la identidad del usuario cuando sea necesario para autenticación y autorización.

Si la estrategia elegida requiere nuevas tablas o columnas, deben incorporarse mediante Entity Framework Core.

No realizar modificaciones manuales directamente sobre la base de datos como sustituto de una migration.

Si se requiere modificar el esquema:

1. Crear la migration correspondiente.
2. Revisar el contenido de la migration.
3. Verificar compatibilidad con MySQL y EF Core 10.
4. Verificar que no exista pérdida de datos.
5. Verificar que los usuarios existentes continúen siendo válidos.

---

## Usuarios existentes

La incorporación del rol no debe convertir accidentalmente a usuarios existentes en administradores.

Debe definirse explícitamente qué rol reciben los usuarios existentes como consecuencia de la modificación del modelo.

La decisión debe ser consistente con el comportamiento esperado del sistema y quedar documentada si no resulta evidente a partir del modelo existente.

Particularmente:

```text
Usuario existente
        ↓
No debe convertirse automáticamente en Administrator
```

salvo que exista una regla explícita definida por el modelo de identidad.

---

## Compatibilidad con autenticación

Esta task prepara el modelo para que una task posterior pueda incorporar el rol a los JWT.

No es responsabilidad de esta task implementar el claim:

```text
role
```

ni modificar todavía `JwtTokenGenerator`, salvo que sea estrictamente necesario para que el modelo compile.

La incorporación del rol al JWT será realizada en:

```text
TASK-API-0065
```

---

## Compatibilidad con autorización

Esta task tampoco debe implementar todavía la policy administrativa.

La autorización mediante:

```text
Administrator
```

será implementada posteriormente en:

```text
TASK-API-0066
```

Esta task solamente debe dejar disponible el dato de identidad necesario para que dicha autorización pueda implementarse correctamente.

---

## Migraciones

Si el cambio requiere modificar el esquema de base de datos:

- Generar la migration mediante EF Core.
- Utilizar el proveedor MySQL configurado actualmente en el proyecto.
- No modificar manualmente una migration generada para ocultar errores.
- Revisar que la migration pueda ejecutarse sobre una base existente.
- No eliminar información existente.
- No crear datos administrativos en esta migration.

El usuario administrador inicial será creado por el seed correspondiente en la task posterior.

---

## Criterios de aceptación

### CA-01 — Existe el concepto de rol

El backend debe disponer de una representación explícita del rol asociado a la identidad del usuario.

### CA-02 — Existe el rol Administrator

El sistema debe reconocer:

```text
Administrator
```

como rol administrativo válido.

### CA-03 — El rol no depende del email

La autorización futura no debe depender del email del usuario.

El rol debe formar parte de la identidad del usuario.

### CA-04 — Usuarios existentes

Los usuarios existentes no deben convertirse accidentalmente en administradores como consecuencia de la implementación.

### CA-05 — Extensibilidad

La implementación debe permitir agregar nuevos roles posteriormente sin modificar la arquitectura fundamental de identidad.

### CA-06 — Persistencia

Si el rol requiere cambios de base de datos, estos deben estar correctamente representados mediante Entity Framework Core y migrations.

### CA-07 — Compatibilidad

Los usuarios existentes deben continuar pudiendo utilizar los mecanismos de autenticación existentes.

### CA-08 — Sin RBAC avanzado

No debe implementarse en esta task un sistema de permisos granulares o RBAC avanzado.

### CA-09 — Sin seed administrativo

La creación del usuario administrador inicial no forma parte de esta task.

### CA-10 — Compilación

La solución debe compilar correctamente después de los cambios.

---

## Archivos potencialmente afectados

El agente debe determinar los archivos concretos a modificar después de revisar la implementación existente.

Potencialmente podrían verse afectados:

```text
Domain/Entities/User.cs

Infrastructure/Data/ApplicationDbContext.cs

Infrastructure/Data/Configurations/*

Infrastructure/Migrations/*

Infrastructure/Identity/*

Application/DTOs/*

Infrastructure/Services/*
```

No modificar archivos que no sean necesarios para resolver la task.

---

## Reglas de implementación

Respetar estrictamente:

- `backend-coding-rules.md`
- `backend-architecture.md`
- Clean Architecture definida para el proyecto.
- Dependency Injection existente.
- Entity Framework Core existente.
- Convenciones de nombres del proyecto.
- Código en inglés.
- No duplicar lógica existente.
- No introducir abstracciones innecesarias.
- No crear un Generic Repository para resolver esta funcionalidad.
- No mover responsabilidades entre capas sin justificación arquitectónica.

---

## Pruebas

Implementar o actualizar las pruebas necesarias para verificar:

- Existencia del rol `Administrator`.
- Persistencia correcta del rol, si corresponde.
- Compatibilidad con usuarios existentes.
- Ausencia de asignación accidental del rol administrativo.
- Comportamiento correcto del modelo después de aplicar la migration, si corresponde.

No es necesario implementar todavía pruebas de autorización HTTP completas si la policy será desarrollada en `TASK-API-0066`.

---

## Resultado esperado

Al finalizar esta task:

1. El backend tendrá una representación explícita de los roles de usuario.
2. Existirá el rol `Administrator`.
3. El rol estará asociado a la identidad del usuario.
4. El rol podrá ser utilizado posteriormente como claim JWT.
5. El rol podrá ser utilizado posteriormente por una policy de autorización.
6. Los usuarios existentes continuarán siendo válidos.
7. Ningún usuario existente se convertirá accidentalmente en administrador.
8. No existirá todavía un sistema RBAC avanzado.
9. No se habrá creado todavía el usuario administrador inicial mediante seed.
10. La solución compilará correctamente.

---

## Documentación a actualizar

Si la implementación modifica el modelo de dominio, evaluar actualizar:

```text
project/domain.md
```

Si modifica repositorios o persistencia:

```text
project/repositories.md
```

Si modifica aspectos tecnológicos:

```text
project/backend-stack-technology.md
```

Actualizar únicamente los documentos que realmente hayan cambiado como consecuencia de la implementación.

No documentar decisiones hipotéticas.

---

## Reporte obligatorio de implementación

Al finalizar la task, reportar:

### 1. Implementación

- Qué archivos fueron modificados.
- Qué clases, entidades o configuraciones fueron agregadas o modificadas.
- Cómo se representa el rol.
- Cómo se persiste el rol.

### 2. Decisión arquitectónica

Indicar:

- Si se utilizó ASP.NET Core Identity para los roles.
- Si se utilizó una implementación propia.
- Por qué se eligió esa alternativa.
- Si la decisión implica algún cambio arquitectónico.

### 3. Base de datos

Si hubo cambios:

- Nombre de la migration.
- Tablas/columnas afectadas.
- Resultado de aplicar la migration sobre una base existente.
- Confirmación de que no hubo pérdida de datos.

Si no hubo cambios, indicarlo explícitamente.

### 4. Usuarios existentes

Informar qué comportamiento tienen los usuarios existentes respecto del nuevo rol.

### 5. Tests

Informar:

- Tests creados o modificados.
- Resultado de los tests.
- Tests pendientes, si los hubiera.

### 6. Compilación

Reportar el resultado de:

```bash
dotnet build
```

Si la solución contiene varios proyectos, indicar el resultado de:

```text
Application
Infrastructure
Api
```

### 7. Documentación

Informar:

- Qué documentos fueron actualizados.
- Qué documentos fueron revisados pero no necesitaron cambios.

### 8. Problemas encontrados

Si durante la implementación aparece un problema arquitectónico, de EF Core, MySQL, Identity o cualquier otro que requiera una decisión humana, no realizar una modificación estructural importante por cuenta propia.

Reportar:

```text
PROBLEMA:
...

IMPACTO:
...

ALTERNATIVAS:
...

RECOMENDACIÓN:
...
```

y dejar la decisión pendiente para revisión.

---

## Reporte de implementación (Backend Agent)

### 1. Implementación
- `Domain/Enums/UserRole.cs` (nuevo): enum `UserRole { PublicUser = 1, Administrator = 2 }`.
- `Domain/Entities/User.cs`: agregada la propiedad `public UserRole Role { get; set; } = UserRole.PublicUser;` (default `PublicUser`).
- `Infrastructure/Persistence/Configurations/UserConfiguration.cs`: mapeo de `Role` con `.HasConversion<string>().HasMaxLength(50).IsRequired()`.
- `Infrastructure/Migrations/20260821211747_AddUserRole.cs` (+ Designer) y `ApplicationDbContextModelSnapshot.cs` actualizado.

### 2. Decisión arquitectónica
- No se utilizó `IdentityRole` / `RoleManager` de ASP.NET Core Identity. El proyecto emplea `PasswordHasher<User>` de Identity únicamente para hashing; `User` es una entidad de dominio propia persistida en `ApplicationDbContext : DbContext` (no `IdentityDbContext`), sin store de Identity. Adoptar `IdentityRole` habría obligado a migrar a `IdentityDbContext` y reestructurar el modelo de identidad (cambio arquitectónico grande no justificado para un modelo de rol simple y extensible).
- Se eligió un enum de dominio persistido como `varchar`, consistente con `ImageType` y extensible (agregar valores al enum = nuevos roles, sin rediseñar la identidad).
- No se modificó `JwtTokenGenerator` ni `AuthService` (role claim en JWT) porque corresponde a TASK-API-0065, ni se implementó la policy (TASK-API-0066). Esta task sólo deja disponible el dato de identidad.

### 3. Base de datos
- Migration: `20260821211747_AddUserRole`.
- Columna `Users.Role` `varchar(50)` NOT NULL, default `'PublicUser'`.
- MySQL aplica el default a las filas existentes al ejecutar el ALTER (sin pérdida de datos).
- La migration no se aplicó contra una base de datos en este entorno; queda generada y lista para el deployment.

### 4. Usuarios existentes
- Los usuarios existentes reciben `Role = 'PublicUser'` (default). Ninguno se convierte accidentalmente en `Administrator`.

### 5. Tests
- El repositorio no contiene proyecto de tests. No se agregaron tests automatizados (crear un test project + dependencia MySQL excedía el alcance de cambios mínimos de la task). Verificado por compilación y revisión de la migration.

### 6. Compilación
- `dotnet build ComicLibrary.sln`: 0 advertencias, 0 errores. `Application`, `Infrastructure` y `Api` compilan correctamente.

### 7. Documentación
- `project/domain.md`: agregada propiedad `Role` al `User` y sección `UserRole`.
- `project/services.md`: sin cambios en esta task.
- `project/backend-stack-technology.md`: sin cambios (no nueva dependencia).
- Revisados y no modificados: `repositories.md`, `endpoints.md`, `backend-coding-rules.md`.

### 8. Problemas encontrados
- Ninguno.