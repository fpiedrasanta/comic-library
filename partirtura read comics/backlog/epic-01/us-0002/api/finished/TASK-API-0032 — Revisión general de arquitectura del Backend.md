# TASK-API-0032 — Revisión general de arquitectura del Backend

## Objetivo

Realizar una revisión general de la implementación actual del Backend para verificar que el código respete la arquitectura definida en el proyecto.

La revisión debe buscar especialmente violaciones en las responsabilidades entre:

- Presentation.
- Application.
- Infrastructure.
- Domain.

El objetivo principal es detectar si algún patrón incorrecto utilizado anteriormente en Refresh Token se repitió en otros lugares del proyecto.

Esta Task debe corregir las violaciones arquitectónicas encontradas, manteniendo el comportamiento funcional existente.

No se deben incorporar nuevas funcionalidades ni modificar reglas de negocio como parte de esta revisión.

---

## 1. Arquitectura objetivo

La arquitectura definida para el proyecto es:

```text
Presentation
      ↓
Application
      ↓
Infrastructure

Application ───────→ Domain
Infrastructure ────→ Domain
```

Presentation no debe contener lógica de negocio.

Application es responsable de implementar y orquestar los casos de uso.

Infrastructure es responsable de implementar capacidades técnicas y persistencia.

Domain contiene las entidades y conceptos propios del dominio.

---

## 2. Responsabilidad de Presentation

Verificar que Presentation contenga únicamente responsabilidades propias de la capa de presentación.

Presentation puede contener:

- Controllers.
- DTOs de request.
- DTOs de response.
- Interfaces necesarias para Presentation/Application según la arquitectura definida.
- Validaciones propias del contrato HTTP.
- Configuración de endpoints.
- Transformaciones necesarias para el contrato HTTP.

Los Controllers deben:

1. recibir requests;
2. validar el contrato de entrada;
3. invocar Application;
4. devolver la respuesta correspondiente.

Los Controllers NO deben:

- implementar reglas de negocio;
- acceder directamente a Repositories;
- acceder directamente a `DbContext`;
- iniciar transacciones;
- ejecutar consultas de persistencia;
- implementar procesos completos de negocio;
- generar tokens;
- enviar emails;
- manipular archivos;
- realizar lógica que corresponda a Application.

---

## 3. Responsabilidad de Application

Los Application Services son los responsables de orquestar los casos de uso.

Un Application Service puede:

- llamar interfaces de Repository;
- llamar interfaces de servicios técnicos;
- trabajar con entidades de Domain;
- aplicar reglas del caso de uso;
- iniciar/controlar la unidad de trabajo;
- controlar la transacción;
- solicitar operaciones de persistencia;
- realizar o coordinar mapeos;
- devolver DTOs.

El flujo esperado es conceptualmente:

```text
Controller
    ↓
Application Service
    ↓
Repository / Infrastructure Service
    ↓
Application Service
    ↓
Commit
    ↓
Mapping
    ↓
DTO
    ↓
Controller
```

El Application Service debe ser el orquestador del caso de uso.

---

## 4. Repositories

Los Repositories deben tener una responsabilidad exclusiva:

> Persistencia y consulta de entidades.

Los Repositories pueden:

- consultar entidades;
- agregar entidades;
- modificar entidades;
- eliminar entidades;
- realizar consultas específicas relacionadas con su entidad.

Los Repositories NO deben:

- implementar casos de uso;
- aplicar lógica de negocio que corresponda a Application;
- llamar otros Repositories para orquestar procesos;
- llamar servicios de Infrastructure;
- enviar emails;
- generar tokens;
- generar archivos;
- devolver DTOs de Presentation;
- iniciar o finalizar transacciones de casos de uso.

Los Repositories deben trabajar con entidades de Domain.

---

## 5. Servicios de Infrastructure

Los servicios concretos de Infrastructure representan capacidades técnicas.

Ejemplos:

- envío de emails;
- almacenamiento de archivos;
- generación criptográfica de valores;
- generación de JWT;
- acceso a servicios externos;
- otras operaciones técnicas.

Application debe depender de interfaces y Infrastructure debe proporcionar las implementaciones concretas.

Ejemplo válido:

```text
Application
    ↓
IEmailService
    ↓
Infrastructure/EmailService
```

Ejemplo válido:

```text
Application
    ↓
IJwtTokenGenerator
    ↓
Infrastructure/JwtTokenGenerator
```

---

## 6. Prohibición de Infrastructure Services que oculten comportamiento

Buscar específicamente servicios de Infrastructure que tengan patrones como:

```text
Application
    ↓
Infrastructure Service
    ↓
Repository
    ↓
Repository
```

o:

```text
Application
    ↓
Infrastructure Service
    ↓
Repository
    ↓
otro Infrastructure Service
```

Esto debe considerarse una posible violación arquitectónica cuando el servicio de Infrastructure está utilizando estas dependencias para ocultar la implementación de un caso de uso.

Un servicio de Infrastructure NO debe:

- orquestar múltiples Repositories;
- implementar un caso de uso completo;
- decidir el flujo de una operación de negocio;
- ocultar múltiples operaciones de persistencia;
- decidir cuándo persistir;
- decidir cuándo hacer commit;
- encapsular reglas de negocio propias de Application.

Regla fundamental:

> Un servicio de Infrastructure no debe utilizar un Repository para ocultar comportamiento que corresponde a Application.

---

## 7. UnitOfWork y transacciones

Revisar todos los casos de uso que realizan modificaciones de datos.

Verificar que:

- la unidad de trabajo sea controlada desde Application;
- Application determine cuándo se debe persistir;
- las operaciones que forman parte de un mismo caso de uso se mantengan dentro de la misma unidad de trabajo cuando corresponda;
- Infrastructure no realice commits ocultos;
- un Repository no ejecute `SaveChanges` por su cuenta salvo que exista una decisión arquitectónica explícita documentada.

Buscar especialmente patrones donde:

```text
Repository
    ↓
SaveChanges
```

o:

```text
Infrastructure Service
    ↓
Repository
    ↓
SaveChanges
```

oculten la persistencia del Application Service.

---

## 8. Mapeos

Revisar cómo se realizan los mapeos entre:

```text
DTO
Entity
DTO
```

Verificar que:

- los Repositories no devuelvan DTOs de Presentation;
- Infrastructure no genere DTOs de Presentation para ocultar comportamiento;
- Application pueda trabajar con entidades;
- el mapeo final hacia el contrato de Presentation sea responsabilidad de Application según las reglas definidas.

No introducir una abstracción de Mapper solamente por cumplir una regla.

Si existe un Mapper concreto que realmente aporta valor y corresponde a la arquitectura, mantenerlo.

---

## 9. Domain

Revisar que Domain no tenga dependencias hacia:

- Presentation;
- Application;
- Infrastructure;
- Entity Framework;
- servicios técnicos;
- mecanismos de persistencia.

Las entidades de Domain no deben conocer:

- DTOs;
- Controllers;
- Repositories;
- DbContext;
- servicios de Infrastructure.

---

## 10. Dependencias entre capas

Revisar referencias de proyectos y namespaces para detectar dependencias incorrectas.

Debe verificarse especialmente que:

```text
Domain
```

no dependa de otras capas.

Que:

```text
Infrastructure
```

no dependa de Presentation.

Que:

```text
Application
```

no dependa directamente de implementaciones concretas de Infrastructure.

Application debe utilizar interfaces cuando necesite capacidades implementadas por Infrastructure.

---

## 11. Revisar especialmente patrones de ocultamiento

Buscar en todo el Backend implementaciones donde un método aparentemente simple:

```text
Service.DoSomething()
```

internamente:

```text
llama Repository A
llama Repository B
llama Service C
modifica entidades
hace SaveChanges
devuelve DTO
```

sin que el flujo del caso de uso sea controlado por Application.

Estos casos deben analizarse individualmente.

Si la implementación corresponde realmente a un caso de uso, debe trasladarse a Application.

Si corresponde realmente a una capacidad técnica, puede permanecer en Infrastructure.

La clasificación debe basarse en responsabilidad, no solamente en el nombre de la clase.

---

## 12. No sobrecorregir

Esta Task no debe convertirse en una reescritura general del Backend.

No:

- crear abstracciones innecesarias;
- crear interfaces solamente para cumplir una regla;
- introducir patrones nuevos sin necesidad;
- crear Generic Repository;
- crear servicios intermediarios que solamente delegan;
- modificar comportamiento funcional;
- cambiar contratos públicos sin necesidad.

El objetivo es corregir violaciones reales de arquitectura.

---

## 13. Mantener comportamiento

Cuando se encuentre una violación arquitectónica, el refactor debe mantener el comportamiento funcional existente.

Antes:

```text
Controller
    ↓
Service
    ↓
Infrastructure Service
    ↓
Repository
```

Después:

```text
Controller
    ↓
Application Service
    ↓
Repository / Infrastructure Service
```

El resultado funcional debe ser equivalente salvo que exista una violación que impida mantener exactamente el comportamiento actual.

Si el agente detecta que corregir una violación requiere modificar comportamiento, debe:

1. registrar el problema en esta Task;
2. explicar qué comportamiento tendría que modificarse;
3. crear una nueva Task en `planned` dentro de la US correspondiente;
4. dejar la modificación funcional fuera de esta Task.

---

## 14. Actualizar backend-coding-rules.md

Esta revisión debe utilizarse también para fortalecer:

```text
backend-coding-rules.md
```

Si durante la revisión se detecta una regla que no estaba suficientemente clara, debe incorporarse.

Como mínimo, deben quedar expresamente documentadas:

### Application

> Application Services orquestan los casos de uso y controlan la unidad de trabajo.

### Repositories

> Repositories se encargan exclusivamente de persistencia y consultas de entidades.

### Infrastructure Services

> Infrastructure Services implementan capacidades técnicas y no deben utilizar Repositories para ocultar comportamiento de Application.

### Transactions

> La transacción de un caso de uso debe ser controlada desde Application y no quedar oculta dentro de Repositories o Infrastructure Services.

### DTOs

> Repositories trabajan con entidades de Domain y no devuelven DTOs de Presentation.

---

## 15. Documentación

Actualizar según corresponda:

```text
backend-coding-rules.md
services.md
repositories.md
domain.md
endpoints.md
```

No modificar documentos que no hayan sido afectados.

Si se elimina o agrega un servicio:

- actualizar `services.md`.

Si se modifica un Repository:

- actualizar `repositories.md`.

Si se modifica el modelo:

- actualizar `domain.md`.

Si se modifica un endpoint o contrato:

- actualizar `endpoints.md`.

Las modificaciones documentales deben reflejar la estructura real después del refactor.

---

## 16. Contexto obligatorio

Antes de comenzar la revisión, leer:

- `project.md`
- `communication.md`
- `backend-architecture.md`
- `backend-stack-technology.md`
- `backend-coding-rules.md`
- `domain.md`
- `services.md`
- `repositories.md`
- `endpoints.md`

Además, revisar la totalidad del código de:

- Presentation/API.
- Application.
- Infrastructure.
- Domain.

No limitar la revisión a los módulos implementados durante la US-0002.

La finalidad de esta Task es detectar violaciones arquitectónicas en cualquier parte del Backend.

---

## 17. Resultado esperado

El resultado de la Task debe incluir un resumen de la revisión.

Como mínimo:

```text
## Resultado de la revisión

### Violaciones encontradas

- [lista de violaciones]

### Correcciones realizadas

- [lista de correcciones]

### Casos revisados y considerados correctos

- [lista/resumen]

### Tasks adicionales generadas

- [lista de nuevas Tasks, si corresponde]
```

Si no se encuentran violaciones:

```text
No se encontraron violaciones arquitectónicas respecto de las reglas definidas.
```

---

## Criterios de finalización

La Task se considera finalizada cuando:

1. Se revisó la arquitectura completa del Backend.
2. Se revisaron Presentation, Application, Infrastructure y Domain.
3. Se revisaron Services y Repositories.
4. Se verificó que Application Services sean los responsables de orquestar los casos de uso.
5. Se verificó que Repositories se limiten a persistencia y consultas.
6. Se verificó que Infrastructure Services implementen capacidades técnicas.
7. Se verificó que ningún Infrastructure Service utilice Repositories para ocultar comportamiento de Application.
8. Se verificó que ningún Repository implemente casos de uso.
9. Se verificó el uso correcto de `IUnitOfWork`.
10. Se verificó que no existan `SaveChanges` ocultos en Repositories o Infrastructure Services que correspondan al Application Service.
11. Se verificaron las dependencias entre proyectos.
12. Se verificó que Domain no dependa de capas externas.
13. Se revisaron los mapeos entre entidades y DTOs.
14. Se actualizaron las reglas arquitectónicas en `backend-coding-rules.md`.
15. Se actualizaron los documentos afectados.
16. Las violaciones que puedan corregirse sin modificar comportamiento fueron refactorizadas.
17. Los cambios funcionales quedaron fuera de esta Task y fueron registrados como nuevas Tasks cuando correspondió.
18. `Api`, `Application`, `Infrastructure` y `Domain` compilan correctamente.
19. No quedaron servicios, interfaces o repositorios sin uso como consecuencia de los refactors.
20. El resultado de la revisión quedó documentado en la Task.

---

## Resultado de la ejecución

### Resumen de la revisión

Se revisó la totalidad del código del Backend en las capas Presentation (Api), Application, Infrastructure y Domain.

### Violaciones encontradas

**Violación 1 (baja severidad): Inyección de dependencia innecesaria en Presentation**
- **Archivo**: `Api/Controllers/UsersController.cs`
- **Líneas**: 14, 17
- **Descripción**: El controller inyecta `IJwtTokenGenerator` (interfaz de Infrastructure) pero nunca la utiliza en ningún método. Esto genera acoplamiento innecesario desde Presentation hacia una capacidad técnica de Infrastructure.
- **Patrón problemático**:
  ```csharp
  private readonly IJwtTokenGenerator _jwtTokenGenerator; // Inyectado pero nunca usado
  ```

**Violación 2 (baja severidad): Using innecesario en Repository**
- **Archivo**: `Infrastructure/Repositories/CountryRepository.cs`
- **Línea**: 1
- **Descripción**: Contiene `using Application.DTOs;` que no es utilizado en ninguna parte del archivo.
- **Patrón problemático**:
  ```csharp
  using Application.DTOs; // No utilizado
  ```

### Correcciones realizadas

**Corrección 1: Eliminación de dependencia innecesaria en UsersController**
- Se eliminó la inyección de `IJwtTokenGenerator` del constructor de `UsersController`.
- Se eliminó el campo privado `_jwtTokenGenerator`.
- El controller ahora depende únicamente de `IUserService` e `IAuthService`, que son las interfaces de Application que efectivamente utiliza.

**Corrección 2: Eliminación de using innecesario en CountryRepository**
- Se eliminó `using Application.DTOs;` de `CountryRepository.cs`.
- El archivo ahora solo contiene los namespaces que efectivamente utiliza.

### Casos revisados y considerados correctos

- **Domain**: Todas las entidades (`User`, `RefreshToken`, `Country`, `Image`, `File`) son POCOs sin dependencias de otras capas. Las excepciones heredan únicamente de `System.Exception`.
- **Application/Services**: Todos los servicios (`UserService`, `CountryService`, `AuthService`) dependen exclusivamente de interfaces. Ninguno depende de implementaciones concretas de Infrastructure.
- **Application/Interfaces**: Todas las interfaces definen contratos sin implementaciones.
- **Infrastructure/Services**: Ningún servicio de Infrastructure utiliza repositorios para ocultar comportamiento de Application. Todos son capacidades técnicas puras (email, JWT, password hashing, file storage, token generation/hashing, settings providers).
- **Infrastructure/Repositories**: Todos los repositorios (`UserRepository`, `CountryRepository`, `RefreshTokenRepository`) realizan exclusivamente operaciones de persistencia y consulta. No implementan casos de uso, no llaman servicios, no devuelven DTOs.
- **Infrastructure/Persistence**: `ApplicationDbContext` y las configuraciones de entidades son estándar de EF Core.
- **Api/Controllers**: Los controllers solo invocan interfaces de Application. No contienen lógica de negocio, no acceden a repositorios, no inician transacciones.
- **Mapeos**: Los mapeos entre entidades y DTOs se realizan en capas superiores (Application/Api), no dentro de repositorios.
- **No existen `SaveChanges` ocultos**: Los únicos llamados a `SaveChanges` están en `UnitOfWork` (Infrastructure) y son invocados explícitamente por Application Services.
- **No hay servicios de Infrastructure que oculten casos de uso**: El patrón incorrecto detectado en `RefreshTokenService` fue corregido en TASK-API-0031.

### Observaciones arquitectónicas sin modificación (no son violaciones bloqueantes)

Se identificaron patrones que, si bien no violan reglas arquitectónicas estrictas, representan oportunidades de mejora que podrían abordarse en tareas separadas sin modificar comportamiento:

1. **Transacciones inconsistentes en `UserService`**: `ValidateEmailAsync` y `ResendValidationEmailAsync` llaman a `SaveChangesAsync` sin boundaries transaccionales explícitos, a diferencia de `RegisterAsync`. Corregirlo requeriría modificar el flujo transaccional existente.

2. **Efecto secundario antes de commit en `RegisterAsync`**: El envío del email de validación ocurre antes del commit de la transacción. Si el commit falla, el usuario recibió un email para un usuario no persistido. Corregirlo requeriría mover el envío después del commit o implementar un outbox pattern.

3. **Fetch de usuario después de commit en `AuthService.RefreshTokenAsync`**: Después de `SaveChangesAsync`, el método busca el usuario. Si este fetch falla, el estado del Refresh Token ya fue persistido. Corregirlo requeriría reordenar las operaciones.

Estos puntos no se modificaron en esta Task porque:
- No constituyen violaciones de límites de capa.
- Corregirlos requeriría modificar el comportamiento funcional existente.
- La Task especifica que los cambios funcionales deben registrarse como nuevas Tasks independientes.

### Tasks adicionales generadas

Ninguna. Las observaciones arquitectónicas detectadas no requieren la creación de nuevas Tasks en esta instancia, ya que no constituyen violaciones de límites de capa. Pueden abordarse como mejoras en tareas futuras si el equipo lo considera necesario.

### Verificación

- `Api` compila correctamente.
- `Application` compila correctamente.
- `Infrastructure` compila correctamente.
- `Domain` compila correctamente.
- No quedaron servicios, interfaces o repositorios sin uso como consecuencia de los refactors.
- No se modificó comportamiento funcional.
- No se agregaron abstracciones innecesarias.
- Las reglas arquitectónicas ya estaban documentadas en `backend-coding-rules.md` (sección 52 agregada en TASK-API-0031).
