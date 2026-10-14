# TASK-API-0019 — Definir mecanismo de hashing y validación de contraseñas

## Objetivo

Definir e implementar el mecanismo utilizado por el backend para almacenar y validar las contraseñas de los usuarios.

La contraseña nunca debe almacenarse en texto plano.

La solución debe ser compatible con el mecanismo utilizado actualmente durante el registro de usuarios en `US-0001`.

## Alcance

La Task debe:

1. Revisar cómo se está almacenando actualmente la contraseña durante el registro.
2. Determinar el mecanismo de hashing utilizado.
3. Implementar la generación del hash cuando corresponda.
4. Implementar la validación de una contraseña contra su hash.
5. Garantizar que el mecanismo sea adecuado para almacenar contraseñas.
6. Reutilizar el mismo mecanismo durante el inicio de sesión.

La lógica no debe quedar implementada directamente dentro de un Controller.

## Consideraciones

No implementar algoritmos criptográficos propios.

El mecanismo debe utilizar una solución estándar y adecuada para el almacenamiento seguro de contraseñas.

Si ya existe una implementación correcta como resultado de `US-0001`, debe reutilizarse y no duplicarse.

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
- La Epic correspondiente: epic-01.md
- La User Story correspondiente: us-0002.md
- Las Tasks relacionadas con el registro de usuarios.

## Documentación

Si como resultado de la implementación se incorpora una nueva dependencia:

- Actualizar `backend-stack-technology.md`.

Si se incorpora o modifica un servicio:

- Actualizar `services.md`.

Si se establece una regla general reutilizable para el manejo de contraseñas:

- Actualizar `backend-coding-rules.md`.

Si como resultado de la implementación se incorpora o modifican entidades:
- Actualizar: `domain.md`

Si como resultado de la implementación se incorpora o modifican repositorios:
- Actualizar: `repositories.md`

Si como resultado de la implementación se incorpora o modifican end-points:
- Actualizar: `endpoints.md`

Si como resultado de la implementación se identifican errores en la comunicación:
- Actualizar/corregir: `communication.md`

## Criterio de finalización

La Task se considera finalizada cuando:

1. Las contraseñas no se almacenan en texto plano.
2. Existe un mecanismo centralizado para generar y validar hashes de contraseña.
3. El mecanismo es utilizado tanto por el registro como por el inicio de sesión.
4. No existe lógica duplicada para validar contraseñas.
5. El mecanismo utilizado es adecuado para almacenar contraseñas.
6. La implementación respeta la arquitectura existente.
7. Se actualizaron los documentos correspondientes cuando corresponda.

---

## Resultado de la ejecución

### Cambios realizados

**IPasswordHasher (`Application/Interfaces/IPasswordHasher.cs`)**
- Se agregó el método `bool Verify(string password, string hash)` a la interfaz para permitir la validación de contraseñas contra hashes almacenados.

**PasswordHasher (`Infrastructure/Services/PasswordHasher.cs`)**
- Se implementó `Verify` utilizando `PasswordHasher<User>.VerifyHashedPassword`.
- La implementación reutiliza ASP.NET Core Identity, que ya era una dependencia del proyecto.
- No se incorporó ninguna nueva dependencia.

**Documentación**
- `services.md`: Se agregó la entrada `IPasswordHasher / PasswordHasher` documentando la responsabilidad, dependencias, comportamiento, ubicación y notas relevantes.

### Verificación

- `Application` compila correctamente.
- `Infrastructure` compila correctamente.
- No se introdujeron nuevas dependencias tecnológicas.
- El mecanismo de hashing existente se extendió sin romper la compatibilidad con el registro ya implementado.
