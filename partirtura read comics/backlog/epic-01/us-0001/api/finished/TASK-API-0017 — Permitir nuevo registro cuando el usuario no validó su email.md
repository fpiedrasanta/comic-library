# TASK-API-0017 — Permitir nuevo registro cuando el usuario no validó su email

## Objetivo

Corregir el proceso de registro para que un usuario cuyo email todavía no fue validado no sea considerado un usuario registrado o activo.

Actualmente, si un usuario inicia el proceso de registro pero no valida su email y el código de validación expira, al intentar registrarse nuevamente con el mismo email la API informa que el usuario ya existe.

Esto no debe ocurrir.

## Regla de negocio

Un usuario que no haya validado su email debe considerarse un registro pendiente, no un usuario activo.

El flujo debe ser:

```text
Registro
   ↓
Usuario creado
   ↓
Email pendiente de validación
   ↓
Código expira
   ↓
Usuario continúa sin validar
```

El usuario debe poder volver a iniciar el proceso de registro utilizando el mismo email.

## Comportamiento esperado

### Caso 1 — Usuario no existe

El usuario se registra con un email que no existe.

La API debe:

1. Crear el usuario.
2. Marcar el email como no validado.
3. Generar el código de validación.
4. Enviar el email de validación.
5. Permitir continuar con el proceso normal.

### Caso 2 — Usuario existe pero su email no fue validado

Si existe un usuario cuyo email no fue validado:

```text
EmailValidated = false
```

un nuevo intento de registro con el mismo email no debe devolver "usuario ya existe".

Debe permitirse iniciar nuevamente el proceso de registro.

La implementación debe resolver correctamente qué hacer con el registro anterior pendiente.

No debe terminar existiendo una situación inconsistente con múltiples usuarios activos para el mismo email.

### Caso 3 — Usuario existe y su email fue validado

Si existe un usuario cuyo email ya fue validado:

```text
EmailValidated = true
```

el nuevo intento de registro debe ser rechazado indicando que el usuario ya existe.

## Código de validación expirado

La expiración del código de validación no debe impedir que el usuario vuelva a iniciar el proceso de registro.

Un código expirado deja de ser válido para verificar el email, pero no convierte al usuario en un usuario activo.

## Consideraciones de persistencia

Revisar la implementación actual de la creación de usuarios y las restricciones de unicidad del email.

Debe garantizarse que:

- No existan múltiples usuarios activos con el mismo email.
- Un registro pendiente pueda ser reemplazado o reutilizado correctamente.
- La solución sea consistente con las restricciones de la base de datos.
- No se elimine información de un usuario cuyo email ya haya sido validado.

La solución concreta debe respetar la arquitectura existente.

## Contexto obligatorio

Antes de comenzar, leer:

- `project.md`
- `backend-architecture.md`
- `backend-stack-technology.md`
- `backend-coding-rules.md`
- `domain.md`
- `services.md`
- `repositories.md`
- `endpoints.md`
- `communication.md`
- La Epic correspondiente.
- La User Story correspondiente.

Leer además la implementación actual de:

- Registro de usuario.
- Validación de email.
- Generación y expiración del código de validación.
- Persistencia de usuarios.
- Repositorio de usuarios.
- Restricciones de unicidad del email.

## Documentación

Si como resultado de la implementación se modifica:

- El modelo de dominio → actualizar `domain.md`.
- Un servicio → actualizar `services.md`.
- Un repositorio → actualizar `repositories.md`.
- Un endpoint → actualizar `endpoints.md`.
- Una regla general reutilizable → actualizar `backend-coding-rules.md`.

## Criterio de finalización

La Task se considera finalizada cuando:

1. Un usuario cuyo email no fue validado no es considerado un usuario activo.
2. Un código expirado no impide volver a iniciar el registro.
3. Un nuevo registro con un email previamente utilizado pero nunca validado puede comenzar correctamente.
4. Un usuario cuyo email ya fue validado no puede volver a registrarse con el mismo email.
5. No pueden existir múltiples usuarios activos con el mismo email.
6. La solución respeta las restricciones de la base de datos.
7. El flujo actual de validación de email continúa funcionando correctamente.
8. Se actualizaron los documentos correspondientes si la implementación produjo cambios en ellos.

---

## Resultado de la ejecución

### Cambios realizados

**UserService (`Application/Services/UserService.cs`)**
- Se modificó `RegisterAsync` para verificar si existe un usuario con el email solicitado.
- Si el usuario existe y `IsEmailValidated == false`, se elimina el registro pendiente antes de crear el nuevo usuario.
- Si el usuario existe y `IsEmailValidated == true`, se mantiene el rechazo con `BusinessConflictException("Email is already registered.")`.

**IUserRepository (`Application/Interfaces/IUserRepository.cs`)**
- Se agregó el método `DeleteAsync(User user, CancellationToken cancellationToken = default)`.

**UserRepository (`Infrastructure/Repositories/UserRepository.cs`)**
- Se implementó `DeleteAsync` utilizando `_context.Users.Remove(user)`.

**Documentación**
- `repositories.md`: Se agregó `DeleteAsync` a las operaciones de `UserRepository`.
- `services.md`: Se actualizó el comportamiento de `UserService` para documentar la eliminación del registro pendiente cuando el email no fue validado.

### Verificación

- `Application` compila correctamente.
- `Infrastructure` compila correctamente.
- La restricción de unicidad del email se mantiene para usuarios validados.
- Un usuario no validado puede volver a registrarse con el mismo email sin errores.
