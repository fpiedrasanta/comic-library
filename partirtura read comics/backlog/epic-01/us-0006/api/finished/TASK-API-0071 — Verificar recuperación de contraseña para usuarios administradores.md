# TASK-API-0071 — Verificar recuperación de contraseña para usuarios administradores

## Objetivo

Verificar que el mecanismo existente de recuperación de contraseña sea completamente compatible con usuarios que poseen el rol `Administrator`.

La recuperación de contraseña administrativa debe utilizar exactamente el mismo mecanismo existente para el resto de los usuarios.

No debe implementarse un flujo de recuperación de contraseña específico para administradores.

---

## Alcance

Revisar el flujo existente de:

```text
Solicitud de recuperación
        ↓
Generación de código
        ↓
Hash del código
        ↓
Persistencia
        ↓
Envío de email
        ↓
Validación del código
        ↓
Generación de autorización temporal
        ↓
Nueva contraseña
        ↓
Revocación de sesiones
```

Verificar específicamente que:

- Un administrador pueda recuperar su contraseña.
- El proceso no modifique su rol.
- El proceso no otorgue privilegios administrativos.
- El cambio de contraseña invalide las sesiones existentes según las reglas actuales.
- Los códigos y tokens continúen protegidos.
- No exista un mecanismo de recuperación paralelo para administradores.

---

## 1. Revisión del mecanismo existente

Antes de realizar cambios, revisar:

- `PasswordResetService`.
- `IPasswordResetTokenRepository`.
- `IPasswordResetCodeService`.
- `IPasswordResetAuthorizationService`.
- `IPasswordResetAuthorizationRepository`.
- `IPasswordHasher`.
- `IPasswordValidator`.
- `IEmailService`.
- `IRefreshTokenRepository`.
- `IUnitOfWork`.

También revisar:

```text
TASK-API-0066
TASK-API-0067
TASK-API-0069
TASK-API-0070
```

Si el mecanismo actual ya funciona correctamente para administradores, no realizar cambios innecesarios.

---

## 2. Solicitud de recuperación

Un administrador debe poder iniciar el proceso de recuperación utilizando el mismo endpoint existente.

No crear:

```text
/api/admin/password-reset
```

si el endpoint actual puede resolver correctamente el caso.

La solicitud debe continuar utilizando el comportamiento genérico existente y no revelar si el email pertenece a:

- Un administrador.
- Un usuario común.
- Un usuario inexistente.

---

## 3. Generación del código

El código de recuperación debe continuar siendo generado mediante:

```text
IPasswordResetCodeService
```

Debe mantenerse:

- Código numérico de 6 dígitos.
- Generación criptográficamente segura.
- Expiración configurable.
- Hash antes de persistencia.
- No almacenamiento del código en texto plano.

No crear una variante administrativa del generador.

---

## 4. Envío del email

El administrador debe recibir el email de recuperación utilizando el mecanismo existente de email.

No implementar un SMTP diferente ni templates específicos para administradores salvo que exista una necesidad funcional explícita.

El contenido del email no debe revelar información innecesaria sobre el rol del usuario.

---

## 5. Validación del código

La validación debe continuar utilizando:

```text
IPasswordResetCodeService
```

y el repositorio existente.

Verificar:

- Código correcto.
- Código incorrecto.
- Código expirado.
- Código ya utilizado.
- Código invalidado por una nueva solicitud.

El rol del usuario no debe modificar las reglas de validación.

---

## 6. Autorización temporal

Una vez validado correctamente el código, debe generarse el mecanismo de autorización temporal existente.

Debe continuar utilizando:

```text
IPasswordResetAuthorizationService
```

El token temporal debe:

- Ser criptográficamente seguro.
- Almacenarse únicamente mediante hash.
- Tener expiración.
- Ser de un solo uso.
- No aparecer en logs.
- No almacenarse en texto plano.

No crear tokens administrativos diferentes.

---

## 7. Cambio de contraseña

Un administrador debe poder establecer una nueva contraseña mediante el flujo existente.

La nueva contraseña debe continuar pasando por:

```text
IPasswordValidator
```

y debe almacenarse utilizando:

```text
IPasswordHasher
```

Nunca almacenar la contraseña en texto plano.

---

## 8. Conservación del rol

La recuperación de contraseña no debe modificar el rol del usuario.

Ejemplo:

```text
Administrator
      ↓
Recupera contraseña
      ↓
Nueva contraseña
      ↓
Administrator
```

No debe existir ninguna operación que:

- Elimine el rol.
- Cambie el rol.
- Asigne un rol.
- Eleve privilegios.
- Recalcule el rol a partir del email.

La recuperación modifica exclusivamente las credenciales correspondientes.

---

## 9. Usuario común

Verificar que la recuperación de contraseña de usuarios comunes continúe funcionando sin cambios.

La incorporación del soporte para administradores no debe modificar el comportamiento existente.

---

## 10. Invalidación de sesiones

Después de cambiar correctamente la contraseña, deben revocarse los Refresh Tokens activos según el comportamiento existente de:

```text
PasswordResetService
```

Esto debe aplicarse también a administradores.

Conceptualmente:

```text
Administrador autenticado
        ↓
Recupera contraseña
        ↓
Nueva contraseña
        ↓
Refresh Tokens anteriores
        ↓
Revocados
```

No debe mantenerse una sesión administrativa anterior únicamente por tratarse de un administrador.

---

## 11. Login posterior

Después de recuperar correctamente la contraseña, el administrador debe poder iniciar sesión nuevamente utilizando:

```text
Email + Nueva Password
```

El login debe utilizar el mecanismo existente.

El nuevo JWT debe continuar conteniendo:

```text
role = Administrator
```

---

## 12. Refresh Tokens posteriores

Los Refresh Tokens anteriores al cambio de contraseña deben permanecer inválidos.

Después del nuevo login, debe generarse una nueva sesión utilizando el mecanismo normal de autenticación.

---

## 13. Seguridad

Verificar especialmente:

- No se almacenan códigos en texto plano.
- No se almacenan tokens temporales en texto plano.
- No se almacenan contraseñas en texto plano.
- No se registran códigos en logs.
- No se registran tokens en logs.
- No se exponen códigos en respuestas innecesarias.
- No se revela la existencia de un usuario.
- No se revela el rol del usuario.
- No se puede utilizar un código expirado.
- No se puede reutilizar un código ya consumido.
- No se puede reutilizar un token temporal de un solo uso.
- La recuperación no permite elevar privilegios.

---

## 14. Arquitectura

Verificar que la recuperación continúe respetando:

- `PasswordResetService` como orquestador del caso de uso.
- Repositorios existentes.
- Servicios criptográficos existentes.
- `IEmailService`.
- `IUnitOfWork`.
- Manejo global de errores.

No crear:

```text
AdminPasswordResetService
AdminPasswordResetCodeService
AdminPasswordResetAuthorizationService
```

ni mecanismos equivalentes.

---

## 15. Criterios de aceptación

### CA-01 — Solicitud administrativa

Un administrador debe poder solicitar la recuperación de contraseña mediante el endpoint existente.

### CA-02 — Código

El administrador debe recibir un código de recuperación mediante el mecanismo existente.

### CA-03 — Validación

Un código válido debe poder ser validado correctamente.

### CA-04 — Código inválido

Un código incorrecto debe ser rechazado.

### CA-05 — Código expirado

Un código expirado debe ser rechazado.

### CA-06 — Cambio de contraseña

Un administrador debe poder establecer una nueva contraseña mediante el flujo existente.

### CA-07 — Hashing

La nueva contraseña debe almacenarse utilizando el mecanismo de hashing existente.

### CA-08 — Rol conservado

Después de cambiar la contraseña, el usuario debe conservar:

```text
Administrator
```

### CA-09 — Sin elevación de privilegios

Un usuario común que recupere su contraseña no debe obtener el rol `Administrator`.

### CA-10 — Invalidación de sesiones

Los Refresh Tokens activos deben revocarse después del cambio de contraseña según el comportamiento existente.

### CA-11 — Nuevo login

El administrador debe poder iniciar sesión con la nueva contraseña.

### CA-12 — Nuevo JWT

El nuevo JWT debe contener el rol administrativo correspondiente.

### CA-13 — Sin mecanismo paralelo

No debe existir un flujo de recuperación específico para administradores.

### CA-14 — Seguridad

Los códigos, tokens temporales y contraseñas no deben almacenarse ni registrarse en texto plano.

### CA-15 — Compilación

La solución debe compilar correctamente en:

```text
Application
Infrastructure
Api
```

---

## Fuera de alcance

Esta task no incluye:

- Crear el mecanismo de recuperación de contraseña.
- Crear códigos de recuperación.
- Crear autorización temporal.
- Implementar login.
- Implementar Refresh Token Rotation.
- Implementar logout.
- Implementar gestión de usuarios.
- Implementar roles.
- Implementar permisos granulares.
- Implementar frontend del Dashboard.

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

Si no se realizan cambios funcionales, no modificar documentación innecesariamente.

---

## Resultado esperado

Al finalizar esta task, un usuario con rol `Administrator` debe poder recuperar su contraseña utilizando exactamente el mismo mecanismo de recuperación existente para los demás usuarios.

La recuperación debe:

1. Utilizar el endpoint existente.
2. Generar códigos mediante el servicio existente.
3. Enviar el email mediante el servicio existente.
4. Validar el código mediante el mecanismo existente.
5. Generar autorización temporal mediante el servicio existente.
6. Validar la nueva contraseña.
7. Almacenar la contraseña mediante hashing.
8. Revocar las sesiones existentes.
9. Mantener el rol `Administrator`.
10. Permitir posteriormente un nuevo login administrativo.
11. Generar un JWT administrativo después del nuevo login.
12. No crear mecanismos paralelos.

---

## Reporte de implementación

Al finalizar la implementación, reportar:

### Recuperación

- Resultado de solicitud de recuperación con administrador.
- Resultado de solicitud con usuario común.
- Resultado con email inexistente.
- Resultado con código correcto.
- Resultado con código incorrecto.
- Resultado con código expirado.

### Cambio de contraseña

- Resultado del cambio de contraseña.
- Confirmación de hashing.
- Resultado con contraseña que no cumple las reglas.
- Confirmación de que el rol no fue modificado.

### Seguridad

- Confirmación de que los códigos no se almacenan en texto plano.
- Confirmación de que los tokens temporales no se almacenan en texto plano.
- Confirmación de que las contraseñas no se almacenan en texto plano.
- Confirmación de que no se registran datos sensibles.
- Confirmación de que no existe elevación de privilegios.

### Sesiones

- Resultado de la invalidación de Refresh Tokens después del cambio de contraseña.
- Resultado intentando utilizar un Refresh Token anterior.
- Resultado del nuevo login con la contraseña modificada.
- Confirmación de que el nuevo JWT contiene `role = Administrator`.

### Arquitectura

- Clases modificadas.
- Interfaces modificadas, si corresponde.
- Confirmación de que se reutilizaron los servicios existentes.
- Confirmación de que no se creó un mecanismo paralelo para administradores.

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

Informar cualquier incompatibilidad, comportamiento inesperado o cambio adicional que haya sido necesario durante la revisión.

---

## Reporte de verificación (Backend Agent)

### Resultado
- **No fue necesario realizar cambios de código.** La recuperación de contraseña ya es compatible con usuarios `Administrator`.

### Recuperación
- `PasswordResetService` utiliza el endpoint y servicios existentes para admin y usuario común (sin `/api/admin/password-reset`).
- `RequestResetAsync`/`ResendResetAsync`: generan código de 6 dígitos, lo hashean, lo persisten y envían email; no revelan si el email existe ni su rol.
- `ValidateResetAsync`: valida código (correcto/incorrecto/expirado/usado) independientemente del rol.
- `ChangePasswordAsync`: valida la nueva contraseña (`IPasswordValidator`), la hashea (`IPasswordHasher`), actualiza `PasswordHash`/`UpdatedAt` y **no modifica `Role`** (rol conservado). Además revoca los Refresh Tokens activos (`GetActiveByUserIdAsync` + `RevokedAt`), aplicándose también a administradores.

### Seguridad
- Códigos y tokens temporales: generados de forma segura, hasheados, con expiración, de un solo uso; sin texto plano ni logs.
- No hay elevación de privilegios: un usuario común no obtiene `Administrator` por recuperación.

### Compilación
- Application / Infrastructure / Api: 0 errores, 0 warnings.

### Documentación
- Sin cambios necesarios.

### Observaciones
- Ninguna incompatibilidad detectada.