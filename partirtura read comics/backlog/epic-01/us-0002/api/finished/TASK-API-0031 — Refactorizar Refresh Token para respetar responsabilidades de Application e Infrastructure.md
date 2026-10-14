# TASK-API-0031 — Refactorizar Refresh Token para respetar responsabilidades de Application e Infrastructure

## Objetivo

Refactorizar la implementación actual del Refresh Token para que respete la arquitectura definida por el proyecto, separando correctamente:

- Orquestación y reglas del caso de uso en `Application`.
- Persistencia en `Repositories`.
- Capacidades técnicas concretas en `Infrastructure`.

El objetivo de esta Task es **exclusivamente estructural**.

No se debe modificar el comportamiento funcional actual de Login, Refresh Token Rotation, expiración, revocación ni generación de tokens.

Los problemas de concurrencia, Refresh Token Reuse Detection u otras mejoras funcionales quedan fuera del alcance de esta Task.

---

## 1. Regla arquitectónica

El `Application Service` es responsable de orquestar el caso de uso.

Un Application Service puede:

- llamar interfaces de repositorios;
- llamar interfaces de servicios técnicos implementados en Infrastructure;
- iniciar una operación transaccional mediante `IUnitOfWork`;
- ejecutar las reglas del caso de uso;
- persistir cambios mediante repositorios y `IUnitOfWork`;
- hacer el commit;
- realizar los mapeos necesarios;
- devolver DTOs.

Infrastructure debe proporcionar implementaciones concretas de las capacidades técnicas solicitadas por Application.

---

## 2. Prohibición de servicios de Infrastructure que oculten comportamiento de Application

No crear ni mantener servicios en Infrastructure que:

- llamen directamente a repositorios;
- orquesten múltiples operaciones de persistencia;
- implementen casos de uso completos;
- oculten reglas de negocio;
- decidan cuándo iniciar o finalizar una transacción;
- realicen internamente una secuencia de operaciones que debería ser visible y controlada por el Application Service.

Por ejemplo, NO debe existir este patrón:

```text
Application
    ↓
IRefreshTokenService
    ↓
Infrastructure/RefreshTokenService
    ↓
IRefreshTokenRepository
```

si `RefreshTokenService` está utilizando el repositorio para implementar el flujo completo de Refresh Token Rotation.

Esto oculta comportamiento de Application.

El flujo debe ser visible en el Application Service.

---

## 3. Refactor de RefreshTokenService

Revisar:

```text
Application/Interfaces/IRefreshTokenService.cs
Infrastructure/Services/RefreshTokenService.cs
```

y determinar qué responsabilidades corresponden realmente a un servicio técnico de Infrastructure.

La lógica de orquestación actualmente encapsulada en `RefreshTokenService` debe trasladarse al Application Service correspondiente.

En particular, el Application Service debe ser quien controle el flujo de:

```text
buscar RefreshToken
    ↓
validar el estado necesario
    ↓
obtener usuario
    ↓
invalidar RefreshToken anterior
    ↓
generar nuevo RefreshToken
    ↓
persistir cambios
    ↓
generar AccessToken
    ↓
commit
    ↓
mapear respuesta
```

La implementación concreta de Infrastructure debe limitarse a las capacidades técnicas que realmente correspondan a Infrastructure.

---

## 4. Repositorios

Los repositorios deben ser utilizados directamente desde Application mediante sus interfaces.

Ejemplo:

```text
Application
    ↓
IRefreshTokenRepository
    ↓
Infrastructure/RefreshTokenRepository
```

El Repository debe encargarse exclusivamente de persistencia y consultas relacionadas con su entidad.

No debe:

- generar tokens;
- validar reglas de negocio;
- generar JWT;
- iniciar casos de uso;
- llamar a otros servicios de Infrastructure;
- devolver DTOs de Presentation;
- realizar mapeos de entidades a DTOs de API.

Los repositorios trabajan con entidades de Domain.

---

## 5. Servicios técnicos de Infrastructure

Si existe una operación que requiere una implementación técnica concreta, Application debe depender de una interfaz y Infrastructure debe proporcionar la implementación.

Ejemplo:

```text
Application
    ↓
IRefreshTokenGenerator
    ↓
Infrastructure
```

Un servicio técnico de Infrastructure puede:

- generar valores criptográficamente seguros;
- generar hashes;
- enviar emails;
- guardar archivos;
- generar JWT;
- realizar otras operaciones técnicas.

Pero no debe utilizar un Repository para ocultar el flujo de un caso de uso.

---

## 6. UnitOfWork

La transacción y la persistencia del caso de uso deben ser controladas desde Application.

El Application Service debe determinar cuándo comienza y termina la operación transaccional de acuerdo con las abstracciones disponibles en el proyecto.

El flujo debe ser conceptualmente:

```text
Application Service
      ↓
iniciar operación transaccional
      ↓
Repository / Infrastructure Services
      ↓
persistir cambios
      ↓
Commit
```

Infrastructure no debe decidir por su cuenta cuándo realizar el commit de una operación de negocio.

---

## 7. AuthService

Refactorizar:

```text
Application/Services/AuthService.cs
```

para que sea el responsable de orquestar:

```text
RefreshTokenAsync
```

El comportamiento actual debe mantenerse.

El método debe continuar:

1. Recibiendo el Refresh Token.
2. Validando el Refresh Token según el comportamiento actual.
3. Obteniendo el usuario correspondiente.
4. Invalidando el Refresh Token anterior.
5. Generando el nuevo Refresh Token.
6. Generando el nuevo Access Token.
7. Persistiendo los cambios.
8. Retornando `AuthResponse`.

La única diferencia debe ser **dónde está implementada cada responsabilidad**.

---

## 8. Mantener el comportamiento actual

No modificar en esta Task:

- reglas de expiración;
- duración del Refresh Token;
- generación criptográfica;
- hashing;
- revocación;
- `IsUsed`;
- generación del Access Token;
- contenido de `AuthResponse`;
- comportamiento de Login;
- comportamiento del endpoint `POST /api/users/refresh-token`;
- manejo actual de errores.

Si para realizar el refactor es necesario modificar alguno de estos comportamientos, detenerse y registrar un bloqueo en la Task en lugar de modificarlo.

---

## 9. Configuración

Mantener el uso de:

```text
IRefreshTokenSettingsProvider
```

para acceder a:

```text
RefreshToken:ExpirationDays
```

No introducir acceso directo a `IConfiguration` desde servicios que no corresponda.

No agregar valores hardcodeados como:

```text
?? 7
```

---

## 10. Coding Rules

Actualizar obligatoriamente:

```text
backend-coding-rules.md
```

para documentar estas reglas arquitectónicas y evitar que el problema vuelva a repetirse.

Debe quedar explícitamente establecido que:

### Application Services

Los Application Services:

- orquestan los casos de uso;
- llaman interfaces de repositorios;
- llaman interfaces de servicios técnicos;
- controlan la unidad de trabajo y la transacción;
- aplican las reglas del caso de uso;
- realizan o coordinan los mapeos necesarios;
- devuelven los DTO correspondientes.

### Repositories

Los Repositories:

- realizan exclusivamente operaciones de persistencia y consulta;
- trabajan con entidades de Domain;
- no implementan casos de uso;
- no llaman servicios de Infrastructure;
- no devuelven DTOs de Presentation.

### Infrastructure Services

Los servicios concretos de Infrastructure:

- implementan capacidades técnicas;
- no deben llamar directamente a Repositories para ocultar comportamiento;
- no deben orquestar casos de uso;
- no deben encapsular secuencias de operaciones que correspondan al Application Service;
- no deben decidir la transacción de un caso de uso.

Debe quedar especialmente documentada la siguiente regla:

> Un servicio de Infrastructure no debe utilizar un Repository para ocultar comportamiento de Application.

---

## 11. Documentación

Actualizar los documentos correspondientes según los cambios realizados.

Si se elimina, agrega o modifica un servicio:

```text
services.md
```

debe quedar actualizado.

Si se modifica un Repository:

```text
repositories.md
```

debe quedar actualizado.

Si se modifica el modelo de Domain:

```text
domain.md
```

debe quedar actualizado.

Si se modifica el endpoint o su contrato:

```text
endpoints.md
```

debe quedar actualizado.

Las actualizaciones deben reflejar únicamente la estructura real resultante.

---

## 12. Contexto obligatorio

Antes de ejecutar la Task, leer:

- `project.md`
- `communication.md`
- `backend-architecture.md`
- `backend-stack-technology.md`
- `backend-coding-rules.md`
- `domain.md`
- `services.md`
- `repositories.md`
- `endpoints.md`
- Epic correspondiente.
- User Story correspondiente.
- `AuthService`
- `IAuthService`
- `RefreshTokenService`
- `IRefreshTokenService`
- `RefreshTokenRepository`
- `IRefreshTokenRepository`
- `IRefreshTokenSettingsProvider`
- `RefreshTokenSettingsProvider`
- `IUnitOfWork`
- `AuthResponse`
- `RefreshTokenRequest`

---

## Criterios de finalización

La Task se considera finalizada cuando:

1. `AuthService` es responsable de orquestar el caso de uso de Refresh Token.
2. La lógica de orquestación no está escondida dentro de un servicio de Infrastructure.
3. Application accede a los repositorios mediante sus interfaces.
4. Los repositorios no llaman servicios de Infrastructure para implementar casos de uso.
5. Los repositorios trabajan con entidades y se limitan a persistencia/consulta.
6. Los servicios de Infrastructure solamente implementan capacidades técnicas.
7. Ningún servicio de Infrastructure utiliza un Repository para ocultar comportamiento de Application.
8. La transacción del caso de uso es controlada desde Application mediante las abstracciones disponibles.
9. `IRefreshTokenSettingsProvider` continúa siendo utilizado correctamente.
10. No se modifica el comportamiento funcional del Refresh Token.
11. No se modifica el comportamiento funcional del Login.
12. `backend-coding-rules.md` contiene las nuevas reglas arquitectónicas.
13. `services.md` refleja la estructura real de servicios.
14. `repositories.md` refleja la estructura real de repositorios.
15. `endpoints.md` continúa reflejando correctamente los endpoints existentes.
16. `Api`, `Application` e `Infrastructure` compilan correctamente.
17. No quedan servicios o interfaces sin uso como consecuencia del refactor.

---

## Resultado de la ejecución

### Cambios realizados

**Eliminación de `IRefreshTokenService` y `RefreshTokenService`**
- Se eliminó la interfaz `IRefreshTokenService` de `Application/Interfaces`.
- Se eliminó la implementación `RefreshTokenService` de `Infrastructure/Services`.
- Ambos ocultaban la lógica de orquestación del caso de uso dentro de Infrastructure, violando la arquitectura definida.

**Nuevas capacidades técnicas en Infrastructure**
- `IRefreshTokenGenerator` / `RefreshTokenGenerator`: interfaz e implementación para generar valores criptográficamente seguros (64 bytes, Base64Url).
- `IRefreshTokenHasher` / `RefreshTokenHasher`: interfaz e implementación para generar hashes SHA256 de Refresh Tokens (Base64Url).
- Ambas interfaces están en `Application/Interfaces` y sus implementaciones en `Infrastructure/Services`.

**Refactor de `AuthService`**
- `AuthService` ahora recibe directamente:
  - `IRefreshTokenRepository`
  - `IRefreshTokenGenerator`
  - `IRefreshTokenHasher`
- `LoginAsync`: orquesta directamente la generación del Refresh Token (genera raw token, hashea, crea entidad, persiste).
- `RefreshTokenAsync`: orquesta directamente la rotación (busca token por hash, valida estado, invalida token anterior, genera nuevo token, hashea, persiste, obtiene usuario, genera Access Token).
- Toda la lógica de orquestación es visible en el Application Service.

**Actualización de DI**
- `Api/Program.cs`: Se registraron `IRefreshTokenGenerator` → `RefreshTokenGenerator` e `IRefreshTokenHasher` → `RefreshTokenHasher`.
- Se eliminó el registro de `IRefreshTokenService` → `RefreshTokenService`.

**Documentación**
- `backend-coding-rules.md`: Se agregó la sección `# 52. Responsabilidades arquitectónicas por capa` documentando las reglas de Application Services, Repositories e Infrastructure Services, con la regla prohibitiva de no ocultar comportamiento.
- `project/services.md`: Se reemplazó la entrada `RefreshTokenService` por `RefreshTokenGenerator` y `RefreshTokenHasher`. Se actualizó `AuthService` con sus nuevas dependencias y comportamiento.
- `project/repositories.md`: Se mantiene sin cambios estructurales; `RefreshTokenRepository` continúa exponiendo `AddAsync`, `GetByTokenHashAsync` y `UpdateAsync`.

### Verificación

- `Api` compila correctamente.
- `Application` compila correctamente.
- `Infrastructure` compila correctamente.
- No quedan servicios o interfaces sin uso.
- No se modificó el comportamiento funcional de Login, Refresh Token Rotation, expiración, revocación ni generación de tokens.
- La transacción del caso de uso es controlada desde Application mediante `IUnitOfWork`.
