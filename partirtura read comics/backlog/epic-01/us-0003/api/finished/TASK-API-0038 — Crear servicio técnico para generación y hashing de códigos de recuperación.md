# TASK-API-0038 — Crear servicio técnico para generación y hashing de códigos de recuperación

## Objetivo

Crear las capacidades técnicas necesarias para generar y validar códigos de recuperación de contraseña.

El código enviado al usuario debe ser un código numérico de exactamente 6 dígitos.

El código raw nunca debe almacenarse en la base de datos.

---

## Contexto obligatorio

Antes de comenzar, leer:

- `project.md`
- `communication.md`
- `backend-architecture.md`
- `backend-stack-technology.md`
- `backend-coding-rules.md`
- `domain.md`
- `repositories.md`
- `services.md`
- `endpoints.md`
- `epic-01.md`
- `us-0003.md`

Revisar especialmente los mecanismos existentes para:

- generación criptográficamente segura;
- hashing;
- tokens de validación de email;
- Refresh Tokens;
- configuración mediante `IConfiguration`;
- separación entre Application e Infrastructure.

Reutilizar capacidades existentes cuando sea técnicamente apropiado.

No duplicar mecanismos ya existentes sin necesidad.

---

## Generación del código

El servicio técnico debe generar:

- exactamente 6 dígitos;
- únicamente caracteres numéricos;
- incluyendo ceros iniciales cuando corresponda.

Ejemplos válidos:

```text
004821
126829
900015
```

Ejemplos inválidos:

```text
12345
1234567
12AB45
```

La generación debe utilizar un mecanismo criptográficamente seguro.

No utilizar `Random` convencional para generar códigos de recuperación.

---

## Hashing

El código raw:

```text
126829
```

se envía únicamente al usuario por email.

En la base de datos debe almacenarse únicamente un hash.

El servicio debe permitir validar un código recibido contra su hash persistido.

No registrar el código raw en logs.

No devolver el código raw a través de APIs.

---

## Configuración

La duración del código debe obtenerse desde configuración.

Utilizar una configuración específica para recuperación de contraseña, por ejemplo:

```text
PasswordReset:CodeExpirationMinutes
```

La configuración debe estar en `appsettings.json` y poder ser sobrescrita por ambiente.

No hardcodear la duración dentro del código.

No agregar esta configuración a `backend-stack-technology.md`.

Si existe una configuración equivalente reutilizable y documentada para tokens de validación, evaluar si corresponde reutilizarla en lugar de duplicarla.

---

## Arquitectura

Crear la interfaz en:

```text
Application/Interfaces
```

y la implementación concreta en:

```text
Infrastructure/Services
```

El servicio es una capacidad técnica.

No debe:

- llamar repositories;
- consultar usuarios;
- decidir si un usuario puede recuperar su contraseña;
- invalidar códigos;
- ejecutar casos de uso;
- manejar transacciones.

La coordinación del proceso corresponde al Application Service.

---

## Documentación

Actualizar `services.md` documentando:

- interfaz;
- implementación;
- responsabilidad;
- ubicación;
- dependencias;
- reglas de seguridad.

Actualizar `backend-coding-rules.md` solamente si se identifica una regla general reutilizable que todavía no esté documentada.

---

## Criterios de finalización

La Task está terminada cuando:

1. Se puede generar un código de exactamente 6 dígitos numéricos.
2. La generación es criptográficamente segura.
3. Se permiten ceros iniciales.
4. El código raw no se persiste.
5. El código raw no aparece en logs.
6. Se puede generar su hash.
7. Se puede validar un código contra su hash.
8. La expiración proviene de configuración.
9. La configuración puede variar por ambiente.
10. El servicio no accede a repositories.
11. El servicio no contiene lógica de negocio del caso de recuperación.
12. Application e Infrastructure compilan correctamente.
13. `services.md` está actualizado.

---

## Resultado de la ejecución

### Cambios realizados

**`Application/Interfaces/IPasswordResetCodeService.cs`** (nuevo)
- Interfaz con métodos:
  - `GenerateCode()`: genera un código de 6 dígitos numéricos.
  - `HashCode(string code)`: genera el hash del código.
  - `ValidateCode(string rawCode, string hash)`: valida un código contra su hash.
  - `GetExpirationMinutes()`: obtiene la expiración desde configuración.

**`Infrastructure/Services/PasswordResetCodeService.cs`** (nuevo)
- Implementación de `IPasswordResetCodeService`.
- `GenerateCode()`: utiliza `RandomNumberGenerator` para generar un número entre 0 y 999999, formateado como 6 dígitos con ceros iniciales (`ToString("D6")`).
- `HashCode(string code)`: utiliza SHA256 para generar el hash del código.
- `ValidateCode(string rawCode, string hash)`: compara el hash del código raw contra el hash almacenado usando `CryptographicOperations.FixedTimeEquals` para evitar timing attacks.
- `GetExpirationMinutes()`: lee `PasswordReset:CodeExpirationMinutes` desde configuración.

**`Api/appsettings.json`**
- Se agregó la sección `PasswordReset` con `CodeExpirationMinutes: 15`.

**`Api/appsettings.Development.json`**
- Se agregó la sección `PasswordReset` con `CodeExpirationMinutes: 15`.

**`Api/Program.cs`**
- Se registró `IPasswordResetCodeService` → `PasswordResetCodeService`.

**`project/services.md`**
- Se agregó la sección `PasswordResetCodeService` documentando la interfaz, implementación, responsabilidad, ubicación, dependencias, configuración y reglas de seguridad.

### Verificación

- `Application` compila correctamente.
- `Infrastructure` compila correctamente.
- `Api` compila correctamente.
- No se incorporaron nuevas dependencias tecnológicas.
- El servicio no accede a repositories ni contiene lógica de negocio.
- La configuración puede variar por ambiente.
