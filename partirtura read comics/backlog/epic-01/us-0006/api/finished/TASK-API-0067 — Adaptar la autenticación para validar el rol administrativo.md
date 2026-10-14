# TASK-API-0067 — Adaptar la autenticación para validar el rol administrativo

## Objetivo

Adaptar el mecanismo de autenticación del Backend para que la identidad autenticada incluya y permita utilizar el rol del usuario como parte del proceso de autorización administrativa.

La implementación debe integrarse con el sistema de autenticación existente, sin crear un mecanismo paralelo para administradores.

El objetivo de esta task es garantizar que el rol `Administrator` pueda ser utilizado de forma segura por el Backend para determinar si un usuario autenticado posee privilegios administrativos.

---

## Alcance

Implementar o adaptar los componentes necesarios para:

- Obtener el rol del usuario desde su identidad persistida.
- Incorporar el rol a la identidad autenticada cuando corresponda.
- Mantener el rol durante el proceso de autenticación.
- Permitir que el mecanismo de autorización del Backend pueda utilizar el rol.
- Evitar que el rol sea determinado a partir de información enviada por el cliente.
- Evitar que el rol sea inferido mediante el email del usuario.
- Mantener la compatibilidad con los usuarios existentes.
- Mantener la compatibilidad con el login tradicional mediante email y contraseña.
- Mantener la compatibilidad con el login mediante Google existente.
- Mantener el comportamiento actual de Refresh Token y Refresh Token Rotation.

---

## Revisión previa

Antes de implementar, revisar:

- `project/domain.md`
- `project/services.md`
- `project/repositories.md`
- `project/endpoints.md`
- `project/backend-architecture.md`
- `project/backend-coding-rules.md`
- `project/backend-stack-technology.md`
- Implementación actual de `User`.
- Implementación actual de `AuthService`.
- Implementación actual de `JwtTokenGenerator`.
- Configuración actual de JWT Bearer Authentication.
- Configuración de `MapInboundClaims = false`.
- Implementación actual de login.
- Implementación actual de Google Authentication.
- Implementación actual de Refresh Token.
- Implementación actual de Refresh Token Rotation.

No modificar componentes que no sean necesarios para resolver esta task.

---

## 1. Rol del usuario

El sistema debe disponer de una propiedad de rol asociada al usuario.

El rol debe formar parte de la identidad persistida del usuario y no debe determinarse dinámicamente mediante condiciones como:

```text
if (user.Email == "...")
```

o mediante listas de emails configuradas en código.

El valor utilizado inicialmente para esta User Story será:

```text
Administrator
```

La implementación debe permitir que posteriormente puedan incorporarse otros roles sin tener que modificar el mecanismo fundamental de generación y validación del JWT.

---

## 2. Obtención del rol

Durante la autenticación, el Backend debe obtener el rol desde el usuario autenticado.

El rol debe provenir de información confiable del sistema, concretamente de la identidad persistida del usuario.

No debe aceptarse el rol desde:

- Request body.
- Query string.
- Headers enviados por el cliente.
- Cookies controladas por el cliente.
- Información del frontend.
- Parámetros del endpoint de login.

El cliente únicamente proporciona las credenciales necesarias para autenticarse.

---

## 3. Generación del JWT

Adaptar `JwtTokenGenerator` para incluir el rol del usuario en el JWT cuando corresponda.

El claim utilizado para representar el rol debe ser compatible con el mecanismo estándar de autorización de ASP.NET Core.

La implementación existente utiliza:

```text
sub
email
name
role
```

Mantener los claims existentes y agregar el rol sin modificar innecesariamente el resto de la estructura del token.

El JWT de un administrador debe contener:

```text
role = Administrator
```

Un usuario sin rol administrativo no debe recibir artificialmente el claim:

```text
role = Administrator
```

---

## 4. Seguridad del claim de rol

El rol incluido en el JWT debe ser generado exclusivamente por el Backend.

El Backend no debe confiar en un rol enviado por el cliente.

La implementación debe garantizar que modificar manualmente el request no permita obtener privilegios administrativos.

Por ejemplo, no debe ser posible realizar algo equivalente a:

```json
{
  "email": "usuario@example.com",
  "password": "password",
  "role": "Administrator"
}
```

y obtener como consecuencia un JWT administrativo.

El rol debe derivarse exclusivamente del usuario autenticado.

---

## 5. Compatibilidad con autenticación existente

La modificación debe mantener funcionando:

- Login mediante email y contraseña.
- Login mediante Google.
- Generación de Access Token.
- Generación de Refresh Token.
- Refresh Token Rotation.
- Logout.
- Recuperación de contraseña.
- Validación de email.

No debe crearse:

```text
AdminJwtTokenGenerator
AdminAuthenticationService
AdminLoginService
```

ni ninguna estrategia equivalente específica para administradores.

Debe utilizarse el mecanismo de autenticación existente.

---

## 6. Login tradicional

Verificar que cuando un usuario inicia sesión mediante email y contraseña:

1. Se recupera el usuario.
2. Se validan las credenciales.
3. Se verifica que el email esté validado.
4. Se obtiene el rol persistido del usuario.
5. Se genera el JWT con el rol correspondiente.
6. Se genera el Refresh Token utilizando el mecanismo existente.

Para un administrador:

```text
User
 ├── Email
 ├── PasswordHash
 └── Role = Administrator
          │
          ▼
       JWT
          │
          └── role = Administrator
```

Para un usuario común, el JWT debe contener únicamente los roles que correspondan a su identidad.

---

## 7. Login mediante Google

Verificar que la incorporación del rol no rompa el login mediante Google.

El flujo de Google debe continuar funcionando como actualmente:

```text
Google ID Token
      ↓
GoogleAuthenticationService
      ↓
GoogleUserInfo
      ↓
AuthService
      ↓
User
      ↓
JWT
```

El rol debe obtenerse del usuario persistido después de resolver o crear la identidad local.

La información obtenida desde Google no debe utilizarse para determinar privilegios administrativos.

Google no debe poder otorgar el rol:

```text
Administrator
```

por sí mismo.

---

## 8. Claims y configuración JWT

Revisar la configuración existente de JWT Bearer Authentication.

La aplicación utiliza:

```text
MapInboundClaims = false
```

Mantener esta configuración si continúa siendo necesaria para preservar los claims estándar:

```text
sub
email
name
role
```

Verificar que ASP.NET Core pueda utilizar correctamente el claim `role` para autorización mediante `[Authorize(Roles = "Administrator")]` o el mecanismo equivalente definido por la arquitectura.

No introducir una transformación innecesaria de claims si la configuración actual ya permite resolver correctamente el rol.

---

## 9. Usuarios existentes

La modificación debe contemplar usuarios que ya existan en la base de datos.

Si la incorporación del rol requiere una migración de base de datos, deberá realizarse de forma compatible con los registros existentes.

Debe definirse un valor inicial seguro para los usuarios existentes que no sean administradores.

No convertir usuarios existentes en administradores de forma accidental.

El usuario administrador inicial será resuelto por la task correspondiente al seed administrativo.

---

## 10. Persistencia

Si el modelo `User` todavía no dispone del campo necesario para representar el rol, implementar la modificación correspondiente.

Actualizar:

- Entidad `User`.
- Configuración de Entity Framework Core.
- Migración correspondiente.
- Seed o mecanismo de inicialización cuando corresponda.

La persistencia del rol debe estar centralizada en el modelo de usuario.

No crear una tabla o mecanismo complejo de permisos si no es necesario para esta User Story.

El objetivo inicial es soportar un modelo simple de roles.

---

## 11. Autorización

Esta task debe preparar la identidad para que la siguiente task pueda aplicar autorización administrativa sobre endpoints.

No es responsabilidad principal de esta task proteger todos los endpoints administrativos.

La responsabilidad de esta task termina cuando:

- El usuario posee un rol persistido.
- El rol puede ser recuperado durante la autenticación.
- El rol es incorporado correctamente al JWT.
- El claim `role` puede ser utilizado por el sistema de autorización.

La protección concreta de endpoints será implementada en:

```text
TASK-API-0068
```

---

## 12. Seguridad

Verificar especialmente:

- El rol nunca es aceptado desde el cliente.
- El rol nunca se determina mediante el email.
- El rol no se obtiene desde información controlada por el frontend.
- El JWT continúa siendo firmado por el Backend.
- El JWT continúa utilizando la configuración existente.
- No se exponen secretos.
- No se registran contraseñas.
- No se registran Refresh Tokens.
- No se registran códigos de recuperación.
- No se registran tokens de validación.
- No se modifica el mecanismo existente de hashing de contraseñas.
- No se modifica innecesariamente el mecanismo de Refresh Tokens.

---

## 13. Documentación

Si la implementación modifica el modelo de usuario o los claims utilizados por la autenticación, actualizar los documentos correspondientes.

Como mínimo evaluar:

```text
project/domain.md
project/services.md
project/endpoints.md
```

Si el cambio afecta reglas generales de autenticación o autorización, actualizar también el documento correspondiente de arquitectura o reglas de Backend.

No documentar valores de contraseñas iniciales ni secretos.

---

## 14. Criterios de aceptación

### CA-01 — Rol persistido

El usuario debe disponer de una representación persistida de su rol.

### CA-02 — Rol Administrator

Debe ser posible representar el rol:

```text
Administrator
```

### CA-03 — Rol obtenido del usuario

El rol utilizado durante la autenticación debe obtenerse desde la identidad persistida del usuario.

### CA-04 — Rol no controlable por el cliente

Modificar manualmente el request de login no debe permitir asignar el rol `Administrator`.

### CA-05 — JWT administrativo

Cuando un usuario con rol `Administrator` inicia sesión correctamente, el JWT debe contener:

```text
role = Administrator
```

### CA-06 — Usuario no administrativo

Un usuario que no posee el rol `Administrator` no debe recibir dicho rol en su JWT.

### CA-07 — Login existente

El login mediante email y contraseña debe continuar funcionando.

### CA-08 — Google

El login mediante Google debe continuar funcionando y no debe utilizar información proveniente de Google para otorgar privilegios administrativos.

### CA-09 — Claims

El claim de rol debe ser compatible con la configuración actual de JWT Bearer Authentication.

### CA-10 — Refresh Token

La incorporación del rol no debe romper la generación ni la validación de Refresh Tokens.

### CA-11 — Refresh Token Rotation

La incorporación del rol no debe romper Refresh Token Rotation.

### CA-12 — Seguridad

No debe existir ningún mecanismo que permita obtener privilegios administrativos modificando información enviada desde el cliente.

### CA-13 — Compatibilidad

Los usuarios existentes deben continuar pudiendo autenticarse según las reglas existentes.

### CA-14 — Compilación

La solución debe compilar correctamente en:

```text
Application
Infrastructure
Api
```

### CA-15 — Migraciones

Si el modelo de persistencia fue modificado, las migraciones necesarias deben encontrarse correctamente generadas.

---

## Fuera de alcance

Esta task no incluye:

- Implementación de endpoints administrativos.
- Protección de endpoints mediante `[Authorize(Roles = "Administrator")]`.
- Implementación de la pantalla de Login del Dashboard.
- Implementación del Dashboard.
- Implementación del seed del administrador inicial.
- Gestión administrativa de usuarios.
- Gestión avanzada de roles.
- Permisos granulares.
- RBAC avanzado.
- Gestión de permisos por recurso.
- Nuevos mecanismos de autenticación.
- Nuevos mecanismos de Refresh Token.
- Nuevos mecanismos de logout.
- Nuevos mecanismos de recuperación de contraseña.

---

## Resultado esperado

Al finalizar esta task, el Backend debe disponer de una identidad de usuario capaz de representar roles.

El rol `Administrator` debe poder ser recuperado desde el usuario autenticado y quedar incorporado de forma segura al JWT.

El sistema de autenticación existente debe continuar siendo utilizado tanto por usuarios comunes como por administradores.

La siguiente task podrá utilizar el claim `role` para implementar la autorización efectiva de los endpoints administrativos.

---

## Reporte de implementación

Al finalizar la implementación, reportar:

### Modelo y persistencia

- Si se modificó la entidad `User`.
- Nombre y tipo de la propiedad utilizada para el rol.
- Valor utilizado para `Administrator`.
- Si fue necesaria una migración.
- Nombre de la migración generada.
- Cómo se trataron los usuarios existentes.

### Autenticación

- Archivos modificados.
- Cómo se obtiene el rol durante el login.
- Cómo se incorpora el rol al JWT.
- Confirmación de que el rol no puede ser enviado por el cliente.
- Confirmación de que el login tradicional continúa funcionando.
- Confirmación de que Google Login continúa funcionando.

### JWT

- Claims presentes en el JWT.
- Confirmación de que `role` contiene `Administrator` para un usuario administrador.
- Confirmación de que `MapInboundClaims = false` continúa funcionando correctamente.

### Seguridad

- Cómo se garantiza que un usuario común no pueda obtener el rol `Administrator`.
- Si se detectó alguna vulnerabilidad o comportamiento inesperado.

### Compatibilidad

- Resultado de Refresh Token.
- Resultado de Refresh Token Rotation.
- Resultado de Logout.
- Resultado de recuperación de contraseña.

### Compilación

- Resultado de compilación de `Application`.
- Resultado de compilación de `Infrastructure`.
- Resultado de compilación de `Api`.
- Cantidad de errores.
- Cantidad de warnings.

### Documentación

- Documentos actualizados.
- Documentos que no requirieron cambios.
- Cualquier contradicción encontrada entre la documentación y la implementación.

### Observaciones

Informar cualquier decisión de implementación que no haya podido seguir exactamente esta task y explicar por qué.

---

## Reporte de implementación (Backend Agent)

### Modelo y persistencia
- La propiedad `Role` (enum `UserRole`) ya existía desde TASK-API-0063; no hubo cambio de modelo en esta task.
- Default `PublicUser` para usuarios existentes; `Administrator` sólo vía seed o asignación explícita.

### Autenticación
- `JwtTokenGenerator.GenerateToken` recibe `UserRole` y emite el claim `role`.
- `AuthService`/`UserService` pasan `user.Role` (identidad persistida). El rol no puede ser enviado por el cliente (el login no acepta ningún campo de rol).
- Login tradicional y Google login verificados por revisión; continúan funcionando.

### JWT
- Claims: `sub`, `email`, `name`, `role`. `role` = `Administrator` para admin, `PublicUser` en otro caso.
- `RoleClaimType = "role"` configurado en `AddJwtBearer`; `MapInboundClaims = false` mantenido.

### Seguridad
- Un usuario común no puede obtener `Administrator` (el rol viene exclusivamente de la BD).
- No se registran tokens ni credenciales.

### Compatibilidad
- Refresh Token, Refresh Token Rotation y Logout: sin regresiones (verificado por compilación y revisión).

### Compilación
- Application / Infrastructure / Api: 0 errores, 0 warnings.

### Documentación
- `services.md` actualizado. `domain.md`, `endpoints.md` sin cambios.

### Observaciones
- Esta task se superpone con TASK-API-0065/0066/0069; la implementación compartida satisface las cuatro.