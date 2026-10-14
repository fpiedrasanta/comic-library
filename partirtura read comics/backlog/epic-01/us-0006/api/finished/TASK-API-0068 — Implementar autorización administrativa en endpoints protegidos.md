# TASK-API-0068 — Implementar autorización administrativa en endpoints protegidos

## Objetivo

Implementar la autorización administrativa en el Backend para garantizar que únicamente los usuarios autenticados que posean el rol `Administrator` puedan acceder a los recursos administrativos.

La autorización debe ser aplicada por el Backend y no depender de controles visuales o lógicos implementados exclusivamente en el Dashboard.

Esta task debe utilizar el mecanismo de roles incorporado en `TASK-API-0067`.

---

## Alcance

Implementar la protección de los endpoints administrativos existentes o preparados para esta User Story mediante el mecanismo de autorización de ASP.NET Core.

La implementación debe:

- Requerir autenticación para los endpoints administrativos.
- Requerir el rol `Administrator`.
- Rechazar usuarios autenticados que no posean dicho rol.
- Rechazar usuarios no autenticados.
- Utilizar el JWT existente.
- Utilizar el claim `role` generado por el Backend.
- Evitar cualquier validación basada en emails.
- Evitar cualquier validación basada en información enviada por el frontend.
- Mantener el mecanismo global de autenticación y autorización existente.
- Permitir que futuros endpoints administrativos reutilicen el mismo mecanismo.

---

## Revisión previa

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
- `epic-01.md`
- User Story US-0006.
- Implementación de JWT.
- Configuración de JWT Bearer Authentication.
- Configuración de `MapInboundClaims = false`.
- Claim `role`.
- Mecanismo de manejo global de errores.
- Controllers existentes relacionados con administración.

También revisar el resultado de:

```text
TASK-API-0067
```

El claim de rol debe estar correctamente disponible antes de implementar la autorización.

---

## 1. Protección de endpoints administrativos

Los endpoints que pertenezcan al área administrativa deben requerir:

```text
Authenticated User
+
Administrator Role
```

La autorización debe realizarse mediante los mecanismos estándar de ASP.NET Core.

Cuando corresponda, utilizar:

```csharp
[Authorize(Roles = "Administrator")]
```

o una política equivalente si la arquitectura existente requiere una política nombrada.

No implementar verificaciones manuales del rol dentro de cada método del Controller si el mecanismo estándar de autorización puede resolver el caso.

Evitar lógica como:

```csharp
if (user.Role != "Administrator")
{
    ...
}
```

dentro de cada endpoint cuando dicha validación pueda resolverse mediante autorización declarativa.

---

## 2. Endpoints administrativos actuales

Identificar los endpoints que correspondan al Dashboard administrativo dentro del alcance actual de US-0006.

La autorización administrativa debe quedar preparada para los endpoints administrativos implementados actualmente.

No crear endpoints de administración de usuarios como parte de esta task si todavía pertenecen a la siguiente User Story.

La siguiente User Story implementará la gestión administrativa de usuarios sobre esta infraestructura de autorización.

---

## 3. Usuarios no autenticados

Un usuario que no posea un Access Token válido no debe poder acceder a un endpoint administrativo.

El comportamiento debe ser el estándar definido por la configuración de autenticación de la API.

Conceptualmente:

```text
Request
   ↓
Endpoint administrativo
   ↓
¿JWT válido?
   │
   ├── No → Unauthorized
   │
   └── Sí
        ↓
     Verificar rol
```

No debe existir ningún bypass para endpoints administrativos.

---

## 4. Usuarios autenticados sin rol administrativo

Un usuario correctamente autenticado pero que no posea el rol:

```text
Administrator
```

debe ser rechazado al intentar acceder a un recurso administrativo.

Conceptualmente:

```text
Usuario autenticado
       ↓
Endpoint administrativo
       ↓
role != Administrator
       ↓
Acceso rechazado
```

El frontend puede interpretar la respuesta y redirigir al usuario, pero la decisión de autorización debe permanecer en el Backend.

---

## 5. Administradores

Un usuario que posea:

```text
role = Administrator
```

y cuyo JWT sea válido debe poder acceder a los endpoints administrativos protegidos.

La autorización debe utilizar la identidad autenticada del usuario.

No debe ser necesario enviar:

```text
userId
role
isAdmin
administrator
```

en el request para demostrar autorización.

El JWT debe ser la fuente de identidad utilizada por el mecanismo de autorización.

---

## 6. No utilizar emails para autorizar

La autorización administrativa no debe depender de:

```text
fede.piedrasanta@gmail.com
```

ni de ningún otro email concreto.

No implementar:

```csharp
if (user.Email == "...")
```

ni:

```text
AllowedAdminEmails
AdministratorEmails
AdminEmailList
```

como mecanismo de autorización.

El usuario administrador inicial posee el rol `Administrator`; su email únicamente identifica al usuario que debe ser creado por el mecanismo de inicialización correspondiente.

---

## 7. No confiar en el frontend

El Backend no debe confiar en:

- Una ruta del Dashboard.
- Una bandera `isAdmin`.
- Un campo `role` enviado desde JavaScript.
- Un header personalizado.
- Una cookie creada por el frontend.
- Información almacenada en `localStorage`.
- Información almacenada en `sessionStorage`.
- Cualquier otra señal proveniente exclusivamente del cliente.

El Backend debe determinar la autorización utilizando la identidad autenticada y el rol contenido en el JWT validado.

---

## 8. Refresh Token

La autorización administrativa debe funcionar correctamente después de una renovación de sesión.

Cuando un administrador utiliza Refresh Token Rotation:

```text
Refresh Token válido
       ↓
Nuevo Access Token
       ↓
role = Administrator
       ↓
Acceso administrativo continúa disponible
```

El nuevo Access Token debe conservar el rol correspondiente al usuario.

No debe ser necesario volver a iniciar sesión para recuperar los privilegios administrativos mientras la sesión continúe siendo válida.

---

## 9. Expiración del Access Token

Cuando el Access Token expire:

- El endpoint administrativo debe rechazar el token expirado.
- El Dashboard podrá utilizar Refresh Token para obtener un nuevo Access Token.
- El nuevo Access Token deberá conservar el rol del usuario.
- Una vez renovada la sesión, el administrador podrá continuar utilizando los recursos administrativos.

No implementar un mecanismo separado de renovación para administradores.

---

## 10. Logout

La autorización administrativa debe respetar el mecanismo de logout existente.

Después de cerrar sesión:

```text
Logout
  ↓
Refresh Token invalidado
  ↓
Sesión finalizada
```

Un token inválido o expirado no debe permitir continuar accediendo a recursos administrativos.

No implementar un mecanismo de logout específico para administradores.

---

## 11. Manejo de respuestas HTTP

Verificar que los endpoints administrativos respeten la semántica HTTP existente para autenticación y autorización.

Como regla general:

```text
No autenticado
    → 401 Unauthorized

Autenticado sin Administrator
    → 403 Forbidden
```

Debe respetarse el comportamiento global configurado actualmente en la API si existe una personalización de estas respuestas.

No crear respuestas diferentes exclusivamente para el Dashboard salvo que exista una necesidad arquitectónica documentada.

---

## 12. Manejo global de errores

La implementación debe continuar utilizando el mecanismo global de manejo de errores existente.

No introducir `try/catch` específicos en cada endpoint únicamente para gestionar errores de autorización.

Los Controllers deben permanecer delgados.

La autorización debe resolverse preferentemente mediante middleware, attributes o policies de ASP.NET Core.

---

## 13. Arquitectura

La autorización administrativa debe integrarse con la arquitectura existente.

Verificar:

- Controllers sin lógica de autorización duplicada innecesariamente.
- Application sin dependencias directas de ASP.NET Core cuando no sean necesarias.
- Infrastructure sin asumir responsabilidades de autorización HTTP.
- Autorización HTTP resuelta en Presentation/configuración de API.
- Servicios de Application protegidos indirectamente mediante endpoints autorizados.
- No crear un sistema de autorización paralelo.

La regla:

```text
Administrator
```

debe estar centralizada y ser reutilizable.

Si se considera necesario crear una policy como:

```text
AdministratorOnly
```

debe registrarse centralmente y reutilizarse.

---

## 14. Extensibilidad

La implementación debe permitir que posteriormente se incorporen nuevos roles o policies.

No es necesario implementar ahora:

- RBAC avanzado.
- Permisos por recurso.
- Permisos por acción.
- Roles jerárquicos.
- ACL.
- Claims dinámicos complejos.

La primera versión debe resolver correctamente:

```text
Administrator
```

pero sin generar una implementación difícil de extender.

---

## 15. Seguridad

Verificar especialmente:

- Un usuario común no puede acceder a recursos administrativos.
- Un usuario no autenticado no puede acceder.
- No se acepta `role` desde el request.
- No se acepta `isAdmin` desde el request.
- No se utilizan emails hardcodeados.
- No se utilizan listas de emails para autorizar.
- No se confía en información del frontend.
- No se puede modificar el rol mediante manipulación del request.
- El JWT continúa siendo validado correctamente.
- La firma del JWT continúa siendo validada.
- La expiración del JWT continúa siendo validada.
- El issuer continúa siendo validado.
- El audience continúa siendo validado.
- Refresh Token Rotation continúa funcionando.
- Logout continúa invalidando la sesión.

---

## 16. Criterios de aceptación

### CA-01 — Endpoint protegido

Un endpoint administrativo debe requerir autenticación y rol `Administrator`.

### CA-02 — Usuario no autenticado

Un request sin autenticación válida hacia un endpoint administrativo debe ser rechazado.

### CA-03 — Usuario autenticado sin rol

Un usuario autenticado que no posea `Administrator` debe recibir una respuesta de acceso rechazado.

### CA-04 — Administrador autorizado

Un usuario autenticado con rol `Administrator` debe poder acceder al endpoint administrativo protegido.

### CA-05 — Backend como autoridad

Modificar manualmente requests o información del frontend no debe permitir obtener autorización administrativa.

### CA-06 — Sin email hardcodeado

La autorización no debe depender del email del usuario.

### CA-07 — JWT

La autorización debe utilizar el rol incluido en el JWT validado.

### CA-08 — Refresh Token

Después de renovar la sesión mediante Refresh Token, el nuevo Access Token debe conservar el rol administrativo.

### CA-09 — Logout

Después del logout, la sesión debe quedar invalidada según el mecanismo existente.

### CA-10 — Respuestas HTTP

La implementación debe mantener el comportamiento esperado de `401 Unauthorized` y `403 Forbidden`, de acuerdo con la configuración existente.

### CA-11 — Arquitectura

No deben introducirse mecanismos paralelos de autenticación o autorización.

### CA-12 — Compilación

La solución debe compilar correctamente en:

```text
Application
Infrastructure
Api
```

### CA-13 — Regresión

Los usuarios comunes deben continuar pudiendo utilizar los endpoints públicos y autenticados para los cuales poseen autorización.

---

## Fuera de alcance

Esta task no incluye:

- Implementación de la pantalla de Login del Dashboard.
- Implementación del frontend Dashboard.
- Registro administrativo.
- Login mediante Google.
- Gestión administrativa de usuarios.
- CRUD de usuarios.
- Gestión avanzada de roles.
- Gestión de permisos granulares.
- Gestión de contenido.
- Administración de países.
- Estadísticas administrativas.
- Implementación de nuevos mecanismos de JWT.
- Implementación de nuevos mecanismos de Refresh Token.
- Implementación de nuevos mecanismos de logout.

---

## Documentación a actualizar

Si corresponde por los cambios realizados, evaluar:

```text
project/endpoints.md
project/services.md
project/domain.md
```

Si se incorpora una policy o mecanismo general de autorización, documentarlo en el artefacto de arquitectura correspondiente.

No modificar documentación que no haya sido afectada por la implementación.

---

## Resultado esperado

Al finalizar esta task, el Backend debe poder distinguir correctamente entre:

```text
Usuario no autenticado
        ↓
       401

Usuario autenticado
        ↓
Sin Administrator
        ↓
       403

Usuario autenticado
        ↓
Administrator
        ↓
Acceso permitido
```

La autorización administrativa debe quedar implementada exclusivamente en el Backend y debe utilizar el sistema de roles y JWT existente.

La siguiente task podrá verificar y adaptar el login específicamente para garantizar que los usuarios administradores obtengan correctamente esta identidad administrativa durante la autenticación.

---

## Reporte de implementación

Al finalizar la implementación, reportar:

### Autorización

- Qué endpoints quedaron protegidos.
- Qué mecanismo se utilizó (`[Authorize]`, policy u otro).
- Cómo se verifica el rol `Administrator`.
- Cómo se comportan usuarios no autenticados.
- Cómo se comportan usuarios autenticados sin rol administrativo.
- Cómo se comportan usuarios administradores.

### Seguridad

- Confirmación de que no se utilizan emails hardcodeados.
- Confirmación de que el rol no se acepta desde el cliente.
- Confirmación de que `isAdmin` u otros flags enviados por el cliente no tienen efecto.
- Confirmación de que el Backend es la autoridad final.
- Cualquier vulnerabilidad o comportamiento inesperado detectado.

### JWT

- Confirmación de que la autorización utiliza el claim `role`.
- Confirmación de que el claim se conserva después de Refresh Token Rotation.
- Confirmación de que tokens inválidos o expirados no permiten acceso administrativo.

### HTTP

- Resultado para usuario no autenticado.
- Resultado para usuario autenticado sin `Administrator`.
- Resultado para usuario con `Administrator`.

### Regresión

- Resultado del acceso de usuarios comunes a endpoints no administrativos.
- Resultado de login.
- Resultado de refresh.
- Resultado de logout.

### Arquitectura

- Controllers modificados.
- Policies o configuraciones agregadas.
- Servicios modificados, si corresponde.
- Confirmación de que no se creó un mecanismo paralelo de autorización.

### Compilación

- Resultado de compilación de `Application`.
- Resultado de compilación de `Infrastructure`.
- Resultado de compilación de `Api`.
- Cantidad de errores.
- Cantidad de warnings.

### Documentación

- Documentos actualizados.
- Documentos que no requirieron cambios.

### Observaciones

Informar cualquier diferencia entre esta task y la implementación final, especialmente si algún endpoint administrativo todavía no existe y, por lo tanto, quedó preparado para una User Story posterior.

---

## Reporte de implementación (Backend Agent)

### Autorización
- Mecanismo habilitado: `AddJwtBearer` con `TokenValidationParameters.RoleClaimType = "role"` (ya configurado en las tasks previas de esta US). Esto permite usar `[Authorize(Roles = "Administrator")]` o una policy equivalente sobre los endpoints administrativos.
- Endpoints protegidos: **ninguno en el alcance de US-0006**. Los controllers actuales (`UsersController`, `CountriesController`, `ImagesController`, `TestingController`) son públicos o de usuario autenticado; los endpoints de administración de usuarios pertenecen a la siguiente User Story (gestión administrativa de usuarios) y aún no existen.
- Por lo tanto, la autorización administrativa quedó **preparada** (el claim `role` viaja en el JWT y `RoleClaimType` está configurado), sin endpoints que proteger aún. No se crearon endpoints de administración ni un mecanismo paralelo.

### Seguridad
- No se usan emails hardcodeados ni listas de emails para autorizar.
- El rol no se acepta desde el cliente; deriva del JWT validado por el Backend.
- `[Authorize(Roles = "Administrator")]` aplicará 401 (no autenticado) / 403 (autenticado sin rol) sobre los futuros endpoints administrativos.

### JWT
- La autorización usará el claim `role` incluido en el JWT.
- El claim se conserva tras Refresh Token Rotation (el nuevo Access Token se genera con el rol actual del usuario).

### HTTP
- Comportamiento esperado (a confirmar al implementar los endpoints): 401 sin autenticación, 403 autenticado sin `Administrator`, 200 con `Administrator`.

### Regresión
- Usuarios comunes: login, refresh y logout sin regresiones (verificado por compilación y revisión).

### Arquitectura
- Sin policies nuevas creadas (la task permitía crear `AdministratorOnly` si hiciera falta; no fue necesario aún).
- Sin controllers modificados (no hay endpoints administrativos que proteger en esta US).

### Compilación
- Application / Infrastructure / Api: 0 errores, 0 warnings.

### Documentación
- `services.md` actualizado con la nota del claim `role`. `endpoints.md` sin cambios (no hay endpoints administrativos nuevos).

### Observaciones
- La protección concreta de endpoints se aplicará en la siguiente User Story (gestión de usuarios), reutilizando `RoleClaimType` y `[Authorize(Roles = "Administrator")]`. Esto es coherente con la propia indicación de la task: "No crear endpoints de administración de usuarios como parte de esta task si todavía pertenecen a la siguiente User Story."