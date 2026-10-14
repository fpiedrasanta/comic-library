# TASK-API-0069 — Adaptar el login existente para usuarios administradores

## Objetivo

Verificar y adaptar el flujo de login existente para garantizar que un usuario con rol `Administrator` pueda autenticarse correctamente utilizando el mecanismo de autenticación actual del sistema.

La implementación debe reutilizar el flujo existente de autenticación y no crear un mecanismo de login separado para el Dashboard.

El objetivo específico de esta task es asegurar que el login tradicional mediante email y contraseña funcione correctamente para usuarios administrativos y que la identidad generada contenga la información necesaria para la autorización administrativa.

---

## Alcance

Revisar el flujo existente de:

```text
Email + Password
       ↓
AuthService
       ↓
Validación de credenciales
       ↓
Validación de email
       ↓
Generación de JWT
       ↓
Generación de Refresh Token
       ↓
Sesión autenticada
```

Verificar especialmente:

- Usuario administrador.
- Contraseña.
- Email validado.
- Rol `Administrator`.
- Generación del Access Token.
- Generación del Refresh Token.
- Cookie `HttpOnly`.
- Compatibilidad con la autorización administrativa.
- Compatibilidad con el Public Web.

No crear endpoints separados como:

```text
/api/admin/login
```

si el endpoint de login existente puede resolver correctamente el caso.

---

## 1. Reutilización del login existente

El Dashboard debe utilizar el mismo endpoint de autenticación utilizado por el Public Web.

El login administrativo debe continuar utilizando:

- `AuthService`.
- `IUserRepository`.
- `IPasswordHasher`.
- `IJwtTokenGenerator`.
- `IRefreshTokenRepository`.
- `IRefreshTokenGenerator`.
- `IRefreshTokenHasher`.
- `IUnitOfWork`.
- Configuración existente de Refresh Token.
- Configuración existente de JWT.

No duplicar el proceso de autenticación exclusivamente para administradores.

---

## 2. Validación de credenciales

El flujo debe continuar validando:

- Existencia del usuario.
- Contraseña correcta.
- Email validado.
- Estado del usuario según las reglas existentes.

Las credenciales incorrectas deben mantener el comportamiento genérico existente.

No revelar si:

```text
El email no existe
```

o:

```text
La contraseña es incorrecta
```

cuando actualmente el sistema utiliza un mensaje genérico para ambos casos.

---

## 3. Usuario administrador

Cuando las credenciales pertenecen a un usuario con:

```text
Role = Administrator
```

el login debe completarse correctamente siempre que las demás condiciones de autenticación sean válidas.

El flujo no debe requerir una condición adicional basada en:

- Email.
- Lista de emails.
- Configuración específica del Dashboard.
- Header especial.
- Parámetro `isAdmin`.
- Parámetro `role`.

La autorización administrativa debe derivarse del rol real del usuario.

---

## 4. Email validado

Un usuario administrador debe tener el email validado para poder iniciar sesión.

El flujo debe mantener la regla existente:

```text
Email no validado
       ↓
Login rechazado
```

Esto también debe aplicar al usuario administrador.

No debe existir una excepción del tipo:

```text
Administrator puede iniciar sesión aunque no tenga email validado.
```

---

## 5. Access Token

Verificar que el JWT generado durante el login administrativo incluya el rol:

```text
Administrator
```

mediante el claim:

```text
role
```

La generación debe continuar centralizada en `JwtTokenGenerator`.

No generar manualmente el JWT dentro de:

- `AuthService`.
- `UsersController`.
- Controllers administrativos.
- Dashboard.

El JWT debe mantener los claims existentes y agregar o conservar el claim de rol según lo definido en las tasks anteriores.

---

## 6. AuthResponse

Revisar `AuthResponse` y confirmar que el login continúe devolviendo únicamente la información pública definida para el cliente.

Debe continuar incluyendo:

- `AccessToken`.
- `UserId`.
- `Email`.
- `FullName`.
- `Role`.

No agregar:

- PasswordHash.
- Refresh Token.
- Refresh Token Hash.
- Tokens de recuperación.
- Tokens de validación.
- Secretos.
- Información interna de infraestructura.

El Refresh Token debe continuar siendo transportado exclusivamente mediante cookie `HttpOnly`.

---

## 7. Refresh Token

El login administrativo debe continuar generando un Refresh Token utilizando:

```text
IRefreshTokenGenerator
```

El token debe:

- Generarse criptográficamente.
- Almacenarse únicamente como hash.
- No aparecer en `AuthResponse`.
- No aparecer en la respuesta JSON.
- Ser enviado mediante cookie `HttpOnly`.
- Mantener la configuración existente.

La lógica de Refresh Token no debe duplicarse para administradores.

---

## 8. Cookie HttpOnly

Verificar que el login administrativo continúe utilizando la configuración existente de:

```text
Cookies:RefreshToken
```

incluyendo:

- Nombre.
- `HttpOnly`.
- `Secure`.
- `SameSite`.
- Expiración.

El Dashboard no debe recibir el Refresh Token como valor accesible desde JavaScript.

No implementar una cookie diferente exclusivamente para administradores salvo que exista una decisión arquitectónica explícita.

---

## 9. Usuario común

El login de un usuario que no posea:

```text
Administrator
```

debe continuar funcionando exactamente igual para el Public Web.

Esta task no debe introducir una regla que bloquee el login general de usuarios comunes.

Conceptualmente:

```text
Usuario común
      ↓
Login
      ↓
Autenticado
      ↓
Public Web permitido

Administrador
      ↓
Login
      ↓
Autenticado
      ↓
Public Web permitido
      +
Dashboard permitido
```

El rol determina autorización posterior, no debe convertirse en un requisito general para autenticarse.

---

## 10. Google

El login mediante Google no forma parte de esta task.

No modificar el flujo de:

```text
LoginWithGoogleAsync
```

salvo que sea estrictamente necesario para mantener la coherencia con el modelo de roles.

La autenticación administrativa continuará siendo:

```text
Email + Password
```

Un usuario creado mediante Google que posteriormente tenga contraseña podrá utilizar el login tradicional, siempre que cumpla las condiciones existentes.

El hecho de utilizar Google originalmente no determina el rol administrativo.

---

## 11. Usuario administrador inicial

Verificar que el usuario administrador creado por el mecanismo de seed definido en las tasks anteriores pueda utilizar el login tradicional.

Debe poder realizar:

```text
Email
+
Password
↓
Login
↓
JWT con role=Administrator
↓
Refresh Token
↓
Dashboard
```

La contraseña inicial no debe aparecer:

- En logs.
- En respuestas HTTP.
- En documentación.
- En código fuente como texto plano.

---

## 12. Manejo de errores

El login debe mantener el mecanismo global de errores existente.

No introducir excepciones específicas para administradores cuando no sean necesarias.

Los errores de autenticación deben mantener el comportamiento actual.

No revelar información que permita:

- Enumerar usuarios.
- Obtener el rol de una cuenta.
- Confirmar si un email pertenece a un administrador.
- Obtener información sobre contraseñas.

---

## 13. Compatibilidad con autorización

El resultado del login debe ser compatible con:

```text
TASK-API-0068
```

Específicamente:

```text
Login
  ↓
JWT
  ↓
role = Administrator
  ↓
[Authorize(Roles = "Administrator")]
  ↓
Acceso permitido
```

Un administrador correctamente autenticado debe poder acceder a los endpoints administrativos protegidos sin enviar información adicional.

---

## 14. Arquitectura

Verificar:

- `AuthService` continúa siendo responsable de orquestar el login.
- `JwtTokenGenerator` continúa siendo responsable de generar JWT.
- `RefreshTokenGenerator` continúa siendo responsable de generar Refresh Tokens.
- `RefreshTokenHasher` continúa siendo responsable del hashing.
- `UsersController` continúa siendo delgado.
- No existe lógica administrativa duplicada en el Controller.
- No se creó un `AdminAuthService`.
- No se creó un `AdminJwtTokenGenerator`.
- No se creó un `AdminRefreshTokenGenerator`.
- No se creó un segundo sistema de sesión.

---

## 15. Criterios de aceptación

### CA-01 — Login administrativo

Dado un usuario con rol `Administrator`, email validado y contraseña correcta,

cuando inicia sesión mediante el endpoint existente,

entonces la autenticación debe completarse correctamente.

### CA-02 — JWT administrativo

El Access Token generado para un administrador debe contener:

```text
role = Administrator
```

### CA-03 — AuthResponse

La respuesta de login debe continuar utilizando `AuthResponse` sin exponer Refresh Token ni información sensible.

### CA-04 — Refresh Token

El login administrativo debe generar Refresh Token utilizando el mecanismo existente.

### CA-05 — Cookie HttpOnly

El Refresh Token debe continuar siendo enviado mediante la cookie `HttpOnly` existente.

### CA-06 — Usuario común

Un usuario sin rol administrativo debe poder iniciar sesión normalmente para utilizar las funcionalidades del Public Web.

### CA-07 — Email no validado

Un administrador cuyo email no esté validado no debe poder iniciar sesión.

### CA-08 — Credenciales incorrectas

Una contraseña incorrecta debe producir el comportamiento genérico existente.

### CA-09 — Sin endpoint administrativo de login

No debe crearse un endpoint separado de login administrativo si el endpoint existente resuelve correctamente el caso.

### CA-10 — Sin autorización por email

El acceso administrativo no debe depender del email del usuario.

### CA-11 — Compatibilidad con autorización

Un administrador autenticado mediante este flujo debe poder utilizar los endpoints administrativos protegidos.

### CA-12 — Usuario administrador inicial

El usuario administrador inicial debe poder autenticarse mediante el login existente.

### CA-13 — Compilación

La solución debe compilar correctamente en:

```text
Application
Infrastructure
Api
```

### CA-14 — Regresión

El login existente de usuarios comunes debe continuar funcionando correctamente.

---

## Fuera de alcance

Esta task no incluye:

- Implementar la pantalla de Login del Dashboard.
- Implementar frontend Dashboard.
- Implementar roles.
- Implementar autorización administrativa.
- Implementar Refresh Token Rotation.
- Implementar logout.
- Implementar recuperación de contraseña.
- Implementar administración de usuarios.
- Implementar nuevos proveedores de identidad.
- Implementar login mediante Google para el Dashboard.
- Crear un sistema de autenticación paralelo.

---

## Documentación a actualizar

Evaluar únicamente los documentos afectados por la implementación.

Posibles documentos:

```text
project/services.md
project/endpoints.md
project/domain.md
```

Si el contrato de autenticación cambia, actualizar `project/endpoints.md`.

Si cambia el comportamiento documentado de `AuthService`, actualizar `project/services.md`.

No modificar documentación que no haya sido afectada.

---

## Resultado esperado

Al finalizar esta task:

1. El login existente debe autenticar correctamente a los administradores.
2. El administrador debe obtener un JWT con `role = Administrator`.
3. El JWT debe ser generado por `JwtTokenGenerator`.
4. El Refresh Token debe utilizar el mecanismo existente.
5. El Refresh Token debe continuar protegido mediante cookie `HttpOnly`.
6. No debe existir un login separado para administradores.
7. Los usuarios comunes deben continuar pudiendo autenticarse.
8. Un administrador con email no validado no debe poder autenticarse.
9. El login debe ser compatible con la autorización administrativa.
10. El usuario administrador inicial debe poder iniciar sesión.
11. No debe exponerse información sensible.
12. No debe modificarse innecesariamente el comportamiento de autenticación existente.

---

## Reporte de implementación

Al finalizar la implementación, reportar:

### Login

- Endpoint utilizado.
- Cambios realizados en `AuthService`.
- Resultado del login con usuario administrador.
- Resultado del login con usuario común.
- Resultado con contraseña incorrecta.
- Resultado con email no validado.

### JWT

- Claims generados.
- Confirmación de `role = Administrator`.
- Confirmación de que el JWT continúa siendo generado por `JwtTokenGenerator`.
- Confirmación de que no se generó un JWT paralelo para administradores.

### Refresh Token

- Confirmación de que se genera correctamente.
- Confirmación de que se almacena únicamente como hash.
- Confirmación de que no aparece en JSON.
- Confirmación de que continúa utilizando cookie `HttpOnly`.

### Autorización

- Confirmación de que el JWT generado permite acceder a endpoints protegidos con `Administrator`.
- Resultado de acceso con administrador.
- Resultado de acceso con usuario común.

### Seguridad

- Confirmación de que no se utilizan emails para determinar privilegios.
- Confirmación de que no se exponen credenciales ni tokens.
- Confirmación de que no se modificó el comportamiento de errores de autenticación.
- Cualquier problema de seguridad detectado.

### Arquitectura

- Clases modificadas.
- Interfaces modificadas, si corresponde.
- Controllers modificados, si corresponde.
- Confirmación de que no se creó un mecanismo paralelo de autenticación.

### Regresión

- Resultado del login normal.
- Resultado del login de usuario común.
- Resultado del refresh.
- Resultado del logout, si fue necesario verificarlo.

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

Informar cualquier diferencia entre el comportamiento esperado y la implementación existente, especialmente si la incorporación del rol requiere cambios adicionales en el flujo de autenticación.

---

## Reporte de implementación (Backend Agent)

### Login
- Endpoint utilizado: `POST /api/users/login` (existente). No se creó endpoint administrativo separado.
- `AuthService.LoginAsync` ya valida existencia, password y email validado; ahora el JWT resultante incluye `role = Administrator` para el admin y `PublicUser` para el resto.
- `AuthResponse.Role` refleja `user.Role.ToString()` (consistente con el JWT).
- Google login: sin cambios salvo el rol en el JWT.

### JWT
- Claims: `sub`, `email`, `name`, `role`. Generado por `JwtTokenGenerator` (sin JWT paralelo).

### Refresh Token
- Generado con el mecanismo existente; almacenado sólo como hash; no aparece en JSON; transportado por cookie `HttpOnly`.

### Autorización
- El JWT con `role = Administrator` habilita el acceso a endpoints protegidos con `[Authorize(Roles = "Administrator")]` (ver TASK-API-0068).

### Seguridad
- No se usan emails para privilegios; no se exponen credenciales ni tokens; comportamiento de errores de autenticación sin cambios.

### Arquitectura
- Sin mecanismo de autenticación paralelo; `AuthService`/`JwtTokenGenerator`/`RefreshToken*` reutilizados.

### Regresión
- Login normal y de usuario común: sin cambios (verificado por compilación y revisión).

### Compilación
- Application / Infrastructure / Api: 0 errores, 0 warnings.

### Documentación
- `services.md` actualizado; resto sin cambios.

### Observaciones
- Solapamiento con TASK-API-0065/0066/0067; implementación compartida. El usuario admin inicial (seed) puede autenticarse vía login existente.