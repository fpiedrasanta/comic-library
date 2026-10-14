# TASK-API-0070 — Verificar compatibilidad de Refresh Token con usuarios administradores

## Objetivo

Verificar que el mecanismo existente de Refresh Token sea completamente compatible con usuarios que poseen el rol `Administrator`.

La renovación de sesión administrativa debe utilizar exactamente el mismo mecanismo existente para el resto de los usuarios.

No debe implementarse un sistema de Refresh Token específico para administradores.

---

## Alcance

Revisar el flujo completo de renovación de sesión:

```text
Refresh Token Cookie
        ↓
Backend
        ↓
Validar token
        ↓
Buscar hash almacenado
        ↓
Validar expiración
        ↓
Validar estado
        ↓
Invalidar token anterior
        ↓
Generar nuevo Access Token
        ↓
Generar nuevo Refresh Token
        ↓
Actualizar cookie
```

Verificar específicamente que el nuevo Access Token mantenga:

```text
role = Administrator
```

cuando el usuario autenticado sea administrador.

---

## 1. Revisión del mecanismo existente

Antes de realizar cambios, revisar la implementación existente de:

- `AuthService`.
- `IRefreshTokenRepository`.
- `IRefreshTokenGenerator`.
- `IRefreshTokenHasher`.
- `JwtTokenGenerator`.
- `RefreshTokenCookieSettingsProvider`.
- Configuración JWT.
- Configuración de Refresh Token.
- Endpoint de refresh.
- Cookie de Refresh Token.
- Refresh Token Rotation.

También revisar:

```text
TASK-API-0066
TASK-API-0067
TASK-API-0069
```

La intención es adaptar únicamente aquello que resulte necesario.

Si el mecanismo existente ya es compatible con usuarios administradores, no realizar cambios innecesarios.

---

## 2. Validación del Refresh Token

El Refresh Token debe continuar siendo validado utilizando el mecanismo existente.

Verificar:

- Hash del token.
- Existencia.
- Usuario asociado.
- Expiración.
- Revocación.
- Uso previo.
- Estado del token.
- Cualquier otra regla existente.

El rol del usuario no debe determinar si el Refresh Token es criptográficamente válido.

La autorización administrativa se deriva posteriormente de la identidad del usuario y del nuevo JWT generado.

---

## 3. Obtención del usuario

Durante el refresh, el Backend debe recuperar correctamente el usuario asociado al Refresh Token.

Verificar que el usuario recuperado contenga su rol actual.

El rol debe obtenerse desde la fuente de datos correspondiente y no desde información enviada por el cliente.

No aceptar:

```text
role
isAdmin
administrator
```

como parámetros del request.

---

## 4. Generación del nuevo JWT

Cuando un administrador utilice un Refresh Token válido, el nuevo Access Token debe contener nuevamente:

```text
role = Administrator
```

Conceptualmente:

```text
Refresh Token
      ↓
Usuario Administrator
      ↓
Nuevo JWT
      ↓
role = Administrator
```

El claim debe ser generado por:

```text
JwtTokenGenerator
```

No copiar manualmente el rol desde el request.

No almacenar el rol dentro del Refresh Token como mecanismo de autorización si el diseño actual obtiene la identidad desde la base de datos.

---

## 5. Cambio de rol

La renovación debe considerar correctamente el estado actual del usuario.

Si el rol del usuario cambia entre dos renovaciones, el nuevo JWT debe reflejar el estado actual.

Ejemplo:

```text
Refresh Token válido
        ↓
Usuario = Administrator
        ↓
Nuevo JWT
        ↓
Administrator
```

Si posteriormente el usuario deja de ser administrador:

```text
Refresh Token válido
        ↓
Usuario = User
        ↓
Nuevo JWT
        ↓
User
```

El Refresh Token no debe permitir conservar privilegios administrativos que ya no correspondan al usuario.

---

## 6. Refresh Token Rotation

Debe mantenerse el mecanismo existente de Refresh Token Rotation.

Al utilizar un Refresh Token válido:

```text
Refresh Token A
       ↓
Invalidar A
       ↓
Generar Refresh Token B
       ↓
Generar nuevo Access Token
       ↓
Enviar B mediante cookie
```

El Refresh Token anterior debe quedar inutilizable.

No crear una variante administrativa del mecanismo de rotation.

---

## 7. Almacenamiento seguro

Verificar que los Refresh Tokens continúen almacenándose únicamente mediante hashes.

No debe almacenarse:

```text
RefreshTokenRaw
```

en la base de datos.

El token crudo debe existir únicamente durante el procesamiento necesario para establecer la cookie.

No debe aparecer en:

- Logs.
- Respuestas JSON.
- Excepciones.
- Mensajes de error.
- Documentación.

---

## 8. Cookie HttpOnly

La renovación debe continuar actualizando la cookie existente.

Verificar:

- Nombre de cookie.
- `HttpOnly`.
- `Secure`.
- `SameSite`.
- Expiración.
- Reemplazo del token anterior.

No crear:

```text
AdminRefreshToken
```

ni otra cookie exclusiva para administradores.

---

## 9. Usuario común

La incorporación del rol administrativo no debe alterar el refresh de usuarios comunes.

Verificar:

```text
Usuario común
      ↓
Refresh Token válido
      ↓
Nuevo JWT
      ↓
role = User
```

El flujo debe continuar funcionando como antes.

---

## 10. Usuario administrador

Verificar:

```text
Administrador
      ↓
Refresh Token válido
      ↓
Nuevo JWT
      ↓
role = Administrator
      ↓
Acceso administrativo
```

No debe ser necesario volver a introducir email y contraseña mientras el Refresh Token continúe siendo válido.

---

## 11. Token expirado

Un Refresh Token expirado debe continuar siendo rechazado.

El hecho de que el usuario sea administrador no debe permitir renovar una sesión mediante un Refresh Token expirado.

---

## 12. Token revocado

Un Refresh Token revocado debe continuar siendo rechazado.

No debe existir una excepción para administradores.

---

## 13. Token utilizado anteriormente

Si el mecanismo existente impide reutilizar un Refresh Token después de la rotation, dicha regla debe mantenerse también para administradores.

Ejemplo:

```text
Refresh Token A
      ↓
Usado correctamente
      ↓
A invalidado
      ↓
Refresh Token A reutilizado
      ↓
Rechazado
```

---

## 14. Logout

Verificar que el logout continúe siendo compatible con Refresh Token Rotation.

Después del logout:

```text
Refresh Token
      ↓
Revocado / invalidado
      ↓
Refresh
      ↓
Rechazado
```

No crear una lógica especial de logout para administradores.

---

## 15. Seguridad

Verificar especialmente:

- No se aceptan roles desde el cliente.
- No se aceptan flags administrativos desde el cliente.
- No se almacenan Refresh Tokens en texto plano.
- No se exponen Refresh Tokens en JSON.
- No se registran Refresh Tokens en logs.
- No se puede reutilizar un token invalidado.
- No se puede utilizar un token expirado.
- El nuevo JWT se genera utilizando la identidad real del usuario.
- El nuevo JWT contiene el rol correspondiente.
- La cookie continúa siendo `HttpOnly`.
- No existe una cookie administrativa paralela.

---

## 16. Arquitectura

La implementación debe continuar respetando:

- `AuthService` como orquestador del caso de uso.
- `JwtTokenGenerator` para generación de JWT.
- `RefreshTokenGenerator` para generación de Refresh Tokens.
- `RefreshTokenHasher` para hashing.
- `RefreshTokenRepository` para persistencia.
- `UnitOfWork` para las operaciones transaccionales correspondientes.
- Presentation para el manejo de la cookie.

No crear:

```text
AdminRefreshTokenService
AdminRefreshTokenRepository
AdminJwtTokenGenerator
```

ni mecanismos equivalentes.

---

## 17. Criterios de aceptación

### CA-01 — Refresh administrativo

Un administrador con Refresh Token válido debe poder renovar su sesión.

### CA-02 — Rol conservado

El nuevo Access Token debe contener:

```text
role = Administrator
```

cuando corresponda.

### CA-03 — Usuario común

Un usuario común debe continuar pudiendo renovar su sesión normalmente.

### CA-04 — Rotation

El Refresh Token anterior debe quedar invalidado después de una renovación exitosa.

### CA-05 — Nuevo Refresh Token

Debe generarse un nuevo Refresh Token y establecerse mediante la cookie existente.

### CA-06 — Token expirado

Un Refresh Token expirado debe ser rechazado.

### CA-07 — Token revocado

Un Refresh Token revocado debe ser rechazado.

### CA-08 — Token reutilizado

Un Refresh Token previamente utilizado no debe poder reutilizarse.

### CA-09 — Cambio de rol

Un cambio de rol del usuario debe reflejarse en el nuevo JWT generado durante el refresh.

### CA-10 — Seguridad

El Refresh Token crudo no debe persistirse ni exponerse.

### CA-11 — Sin mecanismo paralelo

No debe existir un flujo de Refresh Token específico para administradores.

### CA-12 — Autorización

Un nuevo JWT administrativo debe permitir acceder a recursos protegidos con `Administrator`.

### CA-13 — Compilación

La solución debe compilar correctamente en:

```text
Application
Infrastructure
Api
```

---

## Fuera de alcance

Esta task no incluye:

- Implementar Refresh Token desde cero.
- Crear un nuevo mecanismo de rotation.
- Crear un sistema de autenticación separado.
- Implementar autorización administrativa.
- Implementar login.
- Implementar logout.
- Implementar recuperación de contraseña.
- Implementar gestión administrativa de usuarios.
- Implementar permisos granulares.
- Modificar el frontend Dashboard.

---

## Documentación a actualizar

Evaluar únicamente los documentos afectados.

Posibles documentos:

```text
project/services.md
project/repositories.md
project/endpoints.md
project/domain.md
```

Si no existen cambios funcionales o contractuales, no modificar documentación innecesariamente.

---

## Resultado esperado

Al finalizar esta task, el mecanismo existente de Refresh Token debe funcionar correctamente tanto para usuarios comunes como para administradores.

Un administrador debe poder renovar su sesión sin volver a ingresar sus credenciales y continuar recibiendo un JWT con:

```text
role = Administrator
```

La implementación debe conservar Refresh Token Rotation, hashing, cookie `HttpOnly` y todas las reglas de seguridad existentes.

---

## Reporte de implementación

Al finalizar la implementación, reportar:

### Refresh Token

- Resultado de refresh con usuario administrador.
- Resultado de refresh con usuario común.
- Resultado con Refresh Token expirado.
- Resultado con Refresh Token revocado.
- Resultado de reutilización de un token ya utilizado.

### JWT

- Claims del nuevo JWT.
- Confirmación de `role = Administrator`.
- Confirmación de que el rol se obtiene del usuario y no del request.
- Resultado del acceso a un endpoint administrativo después del refresh.

### Rotation

- Confirmación de que el token anterior queda invalidado.
- Confirmación de que se genera un nuevo Refresh Token.
- Confirmación de que la cookie se actualiza correctamente.

### Seguridad

- Confirmación de que el token crudo no se almacena.
- Confirmación de que no aparece en JSON.
- Confirmación de que no aparece en logs.
- Confirmación de que no se creó una cookie administrativa paralela.

### Cambio de rol

Si fue posible probarlo:

- Resultado cuando el usuario pasa de `User` a `Administrator`.
- Resultado cuando el usuario pasa de `Administrator` a `User`.
- Confirmación de que el nuevo JWT refleja el rol actual.

### Arquitectura

- Clases modificadas.
- Interfaces modificadas, si corresponde.
- Confirmación de que se reutilizaron los mecanismos existentes.
- Confirmación de que no se creó un sistema paralelo de Refresh Token.

### Compilación

- Resultado de `Application`.
- Resultado de `Infrastructure`.
- Resultado de `Api`.
- Cantidad de errores.
- Cantidad de warnings.

### Documentación

- Documentos actualizados.
- Documentos que no requirieron cambios.

### Observaciones

Informar cualquier comportamiento inesperado, incompatibilidad o cambio necesario que haya surgido durante la revisión.

---

## Reporte de verificación (Backend Agent)

### Resultado
- **No fue necesario realizar cambios de código.** El mecanismo de Refresh Token ya es compatible con usuarios `Administrator`.

### Refresh Token
- `AuthService.RefreshTokenAsync` resuelve el usuario vía `GetByIdAsync` y genera el Access Token con `GenerateAuthResultAsync`, que ahora usa `user.Role` (incluido en la task previa de rol-en-JWT). Un admin obtiene `role = Administrator`; un usuario común `role = PublicUser`.
- Validación (hash, existencia, expiración, revocación, uso previo) es independiente del rol.
- Refresh Token Rotation: el token anterior queda invalidado (`RevokedAt`/`IsUsed`) y se genera uno nuevo en la cookie existente. Sin variante administrativa.
- Hashing, cookie `HttpOnly` y no exposición en JSON: sin cambios.
- Cambio de rol entre renovaciones: el nuevo JWT refleja el rol actual del usuario (no se conserva el rol del token anterior).

### Seguridad
- El rol se obtiene de la identidad persistida, nunca del request. No hay cookie paralela para admins.

### Compilación
- Application / Infrastructure / Api: 0 errores, 0 warnings (verificado en build previo de la US).

### Documentación
- Sin cambios necesarios (el comportamiento ya era correcto).

### Observaciones
- Ninguna incompatibilidad detectada.