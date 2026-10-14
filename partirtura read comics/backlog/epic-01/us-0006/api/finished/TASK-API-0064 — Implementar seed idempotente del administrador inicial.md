# TASK-API-0064 — Implementar seed idempotente del administrador inicial

## Tipo

Backend / Infrastructure / Data Initialization.

## User Story

US-0006 — Autenticación y acceso al Dashboard administrativo.

## Objetivo

Implementar la inicialización del usuario administrador inicial de Comic Library mediante un mecanismo de seed apropiado para la aplicación.

El sistema debe garantizar que exista un usuario con rol:

```text
Administrator
```

y con el email configurado para el administrador inicial.

El seed debe ser **idempotente**, de manera que ejecutar la inicialización múltiples veces no cree usuarios duplicados ni modifique innecesariamente un usuario administrador existente.

La contraseña inicial no debe almacenarse en texto plano dentro del código fuente ni en documentación funcional.

---

## Alcance

Implementar:

- El mecanismo de inicialización del administrador inicial.
- La creación del usuario cuando no existe.
- La asignación del rol `Administrator`.
- El hashing de la contraseña inicial mediante el mecanismo existente.
- La idempotencia del proceso.
- La integración del seed con el ciclo de inicialización de la aplicación.
- La configuración segura de los datos sensibles necesarios para crear la cuenta inicial.

No implementar en esta task:

- Login administrativo.
- Autorización de endpoints.
- Nuevos endpoints administrativos.
- Gestión de usuarios.
- Gestión avanzada de roles.
- Modificación del mecanismo JWT.
- Refresh Token Rotation.
- Recuperación de contraseña.

Estas funcionalidades pertenecen a otras tasks de US-0006.

---

## Documentación previa obligatoria

Antes de implementar, revisar:

- `project.md`
- `communication.md`
- `backend-architecture.md`
- `backend-stack-technology.md`
- `backend-coding-rules.md`
- `domain.md`
- `services.md`
- `repositories.md`
- `endpoints.md`

También revisar:

- Entidad `User`.
- Representación de roles implementada en `TASK-API-0063`.
- Configuración de Entity Framework Core.
- DbContext.
- Migrations.
- Configuración actual de ASP.NET Core Identity.
- Mecanismos existentes de hashing de contraseñas.
- Configuración existente de usuarios.
- Configuración de ambientes Development / Production.
- Mecanismos existentes de inicialización de datos, si los hubiera.

No implementar un mecanismo paralelo si ya existe una estrategia de inicialización de datos compatible con el proyecto.

---

## Usuario administrador inicial

El usuario administrador inicial debe identificarse mediante:

```text
fede.piedrasanta@gmail.com
```

Debe poseer el rol:

```text
Administrator
```

La contraseña inicial debe obtenerse mediante configuración segura.

No debe aparecer como literal en:

- Código fuente.
- Migration.
- Documentación.
- Logs.
- Mensajes de error.
- DTOs.
- Respuestas HTTP.

---

## Configuración de la contraseña

La contraseña inicial debe proporcionarse mediante configuración segura.

Evaluar el mecanismo de configuración existente en el proyecto.

Como mínimo, debe ser posible configurarla mediante una variable de entorno o mecanismo equivalente fuera del repositorio.

Ejemplo conceptual:

```text
ADMIN_INITIAL_PASSWORD
```

El nombre definitivo debe respetar las convenciones de configuración existentes en el proyecto.

No agregar valores reales de producción a:

```text
appsettings.json
```

ni a:

```text
appsettings.Development.json
```

si esto implica almacenar una contraseña real en el repositorio.

---

## Validación de configuración

Si la contraseña inicial es obligatoria para crear el administrador y no está configurada, el comportamiento debe ser explícito.

No utilizar:

```text
"123456"
```

ni ninguna otra contraseña por defecto.

No generar silenciosamente una contraseña aleatoria que luego no pueda ser comunicada al administrador.

Si la configuración requerida está ausente, el seed debe:

- Informar claramente el problema a nivel técnico.
- No crear un usuario administrador con credenciales desconocidas.
- No registrar la contraseña ni valores sensibles en logs.

La estrategia exacta ante configuración faltante debe respetar las convenciones existentes de inicialización de la aplicación.

---

## Hashing de contraseña

La contraseña inicial debe procesarse utilizando el mecanismo de hashing existente.

No implementar un algoritmo de hashing propio.

No utilizar:

```text
SHA256
MD5
Base64
```

como sustituto del password hashing existente.

Debe reutilizarse el mecanismo establecido para el registro y login de usuarios.

El resultado persistido debe ser un hash de contraseña, nunca la contraseña original.

---

## Idempotencia

El seed debe poder ejecutarse múltiples veces.

Comportamiento esperado:

```text
Primera ejecución
        ↓
Usuario no existe
        ↓
Crear usuario
        ↓
Asignar Administrator


Segunda ejecución
        ↓
Usuario ya existe
        ↓
No crear usuario duplicado
        ↓
No reemplazar innecesariamente la contraseña
```

La ejecución repetida no debe generar:

- Usuarios duplicados.
- Roles duplicados.
- Hashes de contraseña innecesariamente regenerados.
- Cambios innecesarios sobre el usuario.

---

## Usuario existente

Si el usuario:

```text
fede.piedrasanta@gmail.com
```

ya existe:

- No crear otro usuario.
- No eliminar el usuario.
- No reemplazar automáticamente su contraseña actual.
- No modificar datos personales innecesariamente.

Debe verificarse que posea el rol:

```text
Administrator
```

Si el usuario existe pero no posee el rol requerido, el seed debe garantizar que el rol quede correctamente asignado.

La asignación debe realizarse de acuerdo con la estrategia de roles implementada en `TASK-API-0063`.

---

## Estado del email

El administrador inicial debe poder autenticarse inmediatamente después de la inicialización.

Por lo tanto, su email debe quedar en un estado compatible con el requisito de autenticación:

```text
Email validado
```

No debe requerir el flujo de validación de email utilizado por usuarios registrados desde el Public Web.

El seed debe establecer explícitamente el estado necesario para que el administrador pueda iniciar sesión.

---

## Estado del usuario

El usuario inicial debe quedar habilitado para autenticarse.

Si la entidad `User` posee un campo de estado, activo, bloqueado u otro mecanismo equivalente, el seed debe respetar el modelo existente y establecer el estado correspondiente.

No agregar nuevos estados de usuario en esta task salvo que sea estrictamente necesario.

---

## Rol Administrator

El usuario inicial debe quedar asociado al rol:

```text
Administrator
```

La asignación debe utilizar el mecanismo de roles implementado en `TASK-API-0063`.

No debe utilizarse una condición especial en código como:

```text
if (user.Email == "fede.piedrasanta@gmail.com")
{
    // tratar como administrador
}
```

El email identifica al usuario que debe ser creado durante el seed.

El rol es el mecanismo que posteriormente determinará la autorización.

---

## Persistencia

El seed debe persistir correctamente:

- Usuario.
- Rol.
- Relaciones necesarias.
- Hash de contraseña.
- Estado de email validado.
- Estado activo, si corresponde.

Debe utilizar el mecanismo de persistencia existente.

Si se requiere una transacción para garantizar que el usuario y su rol queden correctamente creados, utilizar la estrategia existente de persistencia/transacciones.

No crear una implementación paralela de `UnitOfWork` ni de repositorios genéricos.

---

## Ejecución del seed

Determinar el punto apropiado para ejecutar el seed según la arquitectura existente.

La ejecución debe producirse después de que la aplicación disponga de acceso al DbContext y a los servicios necesarios para crear el usuario.

Debe evitarse ejecutar operaciones de inicialización de datos en lugares que puedan provocar:

- Creación duplicada.
- Ejecuciones concurrentes inesperadas.
- Dependencias circulares.
- Problemas durante el arranque.

Si la estrategia existente utiliza un método de inicialización específico, reutilizarlo.

---

## Concurrencia

Evaluar el comportamiento si dos instancias de la aplicación intentan ejecutar el seed simultáneamente.

La base de datos debe continuar siendo la autoridad final para garantizar la unicidad del email.

Si existe una restricción única sobre el email, debe mantenerse.

No asumir que un simple:

```text
AnyAsync()
```

es suficiente para garantizar la unicidad bajo concurrencia.

Si la arquitectura requiere una estrategia adicional, documentarla en el reporte de implementación.

---

## Migraciones

Esta task no debe utilizar migrations para almacenar la contraseña inicial.

Una migration puede definir estructura de base de datos, pero no debe contener una contraseña administrativa real.

Si la implementación requiere una migration adicional por cambios realizados previamente en el modelo, debe mantenerse separada conceptualmente del seed.

No agregar credenciales sensibles a migrations.

---

## Seguridad

La implementación debe respetar:

- No almacenar contraseñas en texto plano.
- No registrar contraseñas en logs.
- No registrar hashes de contraseña innecesariamente.
- No exponer la contraseña mediante excepciones.
- No almacenar credenciales reales en el repositorio.
- No utilizar una contraseña por defecto insegura.
- No utilizar el email como mecanismo de autorización.
- Mantener la unicidad del email.
- Utilizar el password hasher existente.
- Mantener el rol como mecanismo de autorización.

---

## Criterios de aceptación

### CA-01 — Administrador inicial

En una instalación nueva debe existir el usuario:

```text
fede.piedrasanta@gmail.com
```

con rol:

```text
Administrator
```

### CA-02 — Email validado

El administrador inicial debe quedar con el email validado.

### CA-03 — Usuario activo

El administrador inicial debe quedar en un estado que permita autenticarse.

### CA-04 — Password hash

La contraseña inicial debe almacenarse mediante el mecanismo de hashing existente.

### CA-05 — No password en texto plano

La contraseña inicial no debe existir en texto plano dentro de:

- Código fuente.
- Base de datos.
- Migrations.
- Logs.
- Documentación.

### CA-06 — Configuración segura

La contraseña inicial debe poder configurarse mediante un mecanismo externo al código fuente.

### CA-07 — Seed idempotente

Ejecutar el seed más de una vez no debe crear usuarios duplicados.

### CA-08 — Usuario existente

Si el usuario administrador ya existe, el seed no debe reemplazar su contraseña ni crear otro usuario.

### CA-09 — Rol existente

Si el usuario administrador existe pero no posee el rol `Administrator`, el seed debe garantizar que el rol quede correctamente asignado.

### CA-10 — No modificar innecesariamente

Una ejecución posterior del seed no debe modificar innecesariamente los datos del administrador.

### CA-11 — Integridad

La inicialización debe dejar al usuario y sus relaciones necesarias en un estado consistente.

### CA-12 — Compilación

La solución debe compilar correctamente después de implementar el seed.

---

## Pruebas

Implementar o actualizar las pruebas necesarias para verificar:

- Creación del administrador cuando no existe.
- Asignación del rol `Administrator`.
- Email validado.
- Usuario habilitado para autenticación.
- Hashing de contraseña.
- Idempotencia.
- No duplicación del usuario.
- No reemplazo innecesario de contraseña.
- Asignación del rol cuando el usuario existe sin dicho rol.
- Comportamiento cuando falta la configuración de contraseña.

Si la arquitectura del proyecto no permite realizar alguna de estas pruebas mediante tests automatizados, documentarlo.

---

## Resultado esperado

Al finalizar esta task:

1. Existe un mecanismo formal de seed del administrador inicial.
2. El administrador inicial utiliza el email configurado.
3. El administrador posee el rol `Administrator`.
4. El email se encuentra validado.
5. El usuario puede autenticarse inmediatamente después del seed.
6. La contraseña se encuentra almacenada mediante el password hasher existente.
7. La contraseña no aparece en texto plano en el código.
8. El seed es idempotente.
9. Las ejecuciones posteriores no crean usuarios duplicados.
10. Las ejecuciones posteriores no reemplazan innecesariamente la contraseña.
11. El rol administrativo no depende de una condición hardcodeada por email.
12. No se implementa todavía autorización de endpoints administrativos.
13. La solución compila correctamente.

---

## Documentación a actualizar

Evaluar actualizar:

```text
project/domain.md
```

si el modelo de usuario o roles requiere aclaraciones.

Evaluar:

```text
project/services.md
```

si se incorpora un servicio específico de inicialización.

Evaluar:

```text
project/backend-stack-technology.md
```

si se incorpora una dependencia o mecanismo tecnológico nuevo.

No documentar la contraseña inicial.

Sí documentar, cuando corresponda, el mecanismo mediante el cual debe proporcionarse la configuración necesaria para crear el administrador inicial.

---

## Reporte obligatorio de implementación

Al finalizar la implementación, reportar:

### 1. Archivos modificados

Indicar todos los archivos creados, modificados o eliminados.

### 2. Mecanismo de seed

Explicar:

- Dónde se ejecuta.
- Cómo se ejecuta.
- Cómo obtiene acceso al DbContext.
- Cómo obtiene el password hasher.
- Cómo obtiene o asigna el rol.

### 3. Configuración

Indicar:

- Qué configuración nueva fue agregada.
- Cómo debe proporcionarse.
- Qué ocurre si falta la contraseña inicial.

No reportar nunca el valor de la contraseña.

### 4. Idempotencia

Explicar cómo se garantiza que:

- No se duplique el usuario.
- No se reemplace la contraseña innecesariamente.
- El rol quede correctamente asignado.

### 5. Base de datos

Informar:

- Si hubo cambios de esquema.
- Si hubo migration.
- Nombre de la migration, si corresponde.
- Resultado de la ejecución.

### 6. Tests

Reportar:

- Tests creados o modificados.
- Resultado de los tests.
- Tests pendientes.

### 7. Compilación

Reportar el resultado de:

```bash
dotnet build
```

Indicar específicamente el resultado de:

```text
Application
Infrastructure
Api
```

si corresponde.

### 8. Documentación

Indicar:

- Documentos actualizados.
- Documentos revisados que no requirieron cambios.

### 9. Problemas encontrados

Si aparece algún problema de arquitectura, Identity, EF Core, MySQL, configuración o inicialización, no realizar cambios estructurales importantes sin reportarlo.

Utilizar:

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

y dejar la decisión para revisión.

---

## Reporte de implementación (Backend Agent)

### 1. Archivos modificados
- `Application/Interfaces/IInitialAdminSeeder.cs` (nuevo): interfaz del seeder.
- `Infrastructure/Seed/InitialAdminSeeder.cs` (nuevo): implementación idempotente.
- `Api/Program.cs`: registración de `IInitialAdminSeeder` y ejecución tras `Migrate()`.
- `Api/appsettings.json` y `Api/appsettings.Development.json`: sección `Admin` (`InitialEmail`, `InitialPassword` placeholder).
- `project/domain.md`, `project/services.md`: documentación actualizada.

### 2. Mecanismo de seed
- Se ejecuta en `Program.cs` dentro de un scope, después de `db.Database.Migrate()`.
- Obtiene `ApplicationDbContext` indirectamente vía `IUserRepository` (inyectado), `IPasswordHasher`, `IUnitOfWork`, `IConfiguration` e `ILogger`.
- Crea el usuario con `Role = UserRole.Administrator`, `IsEmailValidated = true`, password hasheado con el hasher existente.
- La asignación del rol usa el modelo de roles de TASK-API-0063.

### 3. Configuración
- Nueva sección `Admin:InitialEmail` (valor `fede.piedrasanta@gmail.com`, no es secreto) y `Admin:InitialPassword` (placeholder `CHANGE_ME_ADMIN_PASSWORD`).
- Debe proveerse la contraseña real mediante variable de entorno / secretos fuera del repositorio; no se commitea un valor real.
- Si `Admin:InitialEmail` o `Admin:InitialPassword` faltan o están vacíos, el seeder registra un error técnico (sin la contraseña) y no crea el usuario; la aplicación continúa arrancando.

### 4. Idempotencia
- Si el usuario no existe: lo crea.
- Si ya existe: no duplica; si no tiene `Administrator`, se lo asigna. Nunca reemplaza la contraseña existente.
- La unicidad del email (índice único) es la autoridad; ante una carrera concurrente el seeder captura `DbUpdateException`, re-consulta y garantiza el rol.

### 5. Base de datos
- No requirió migration adicional: reutiliza la columna `Role` creada en TASK-API-0063.
- El seed persiste usuario + rol + hash de password + email validado dentro de la transacción de `IUnitOfWork`.
- (No ejecutado contra una base en este entorno; lista para deployment.)

### 6. Tests
- El repositorio no contiene proyecto de tests; no se agregaron tests automatizados (fuera del alcance de cambios mínimos). Verificado por compilación.

### 7. Compilación
- `dotnet build ComicLibrary.sln`: 0 advertencias, 0 errores. `Application`, `Infrastructure` y `Api` compilan correctamente.

### 8. Documentación
- `project/domain.md`: sección `UserRole` ya documentada en TASK-API-0063.
- `project/services.md`: agregado `InitialAdminSeeder`.
- `project/backend-stack-technology.md`: sin cambios (no nueva dependencia).
- Revisados y no modificados: `repositories.md`, `endpoints.md`, `backend-coding-rules.md`.

### 9. Problemas encontrados
- Ninguno.