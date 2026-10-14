# TASK-API-0022 — Crear servicio de generación y validación de JWT

## Objetivo

Crear el servicio responsable de generar los Access Tokens utilizados por Comic Library.

El Access Token debe ser un JWT.

## Alcance

El servicio debe:

1. Recibir la información necesaria del usuario autenticado.
2. Generar un JWT.
3. Incorporar los claims necesarios.
4. Aplicar el Issuer configurado.
5. Aplicar el Audience configurado.
6. Utilizar el SecretKey configurado.
7. Aplicar la duración configurada mediante `ExpirationMinutes`.

La implementación debe mantener la lógica de generación del JWT encapsulada en un servicio específico.

## Configuración

Utilizar la configuración existente:

```text
Jwt:Issuer
Jwt:Audience
Jwt:SecretKey
Jwt:ExpirationMinutes
```

No hardcodear estos valores.

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
- La Epic correspondiente: `epic-01.md` 
- La User Story correspondiente: `us-0002.md`

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

1. Existe un servicio responsable de generar JWT.
2. El JWT utiliza la configuración definida.
3. El JWT contiene los claims necesarios.
4. La duración del token es configurable.
5. No existen valores sensibles hardcodeados.
6. La lógica no está implementada dentro del Controller.
7. `services.md` está actualizado.

---

## Resultado de la ejecución

### Análisis

La implementación de generación de JWT ya existe en el proyecto como resultado de `US-0001`:

**`Infrastructure/Services/JwtTokenGenerator.cs`**
- Genera JWT utilizando `Microsoft.IdentityModel.JsonWebTokens`.
- Lee configuración desde `Jwt:Issuer`, `Jwt:Audience`, `Jwt:SecretKey`, `Jwt:ExpirationMinutes`.
- Incorpora claims: `sub` (userId), `email`, `name`, `role`.
- La duración es configurable mediante `ExpirationMinutes`.
- No hardcodea valores sensibles.
- La lógica está encapsulada en un servicio, no en el Controller.

**`Application/Interfaces/IJwtTokenGenerator.cs`**
- Interfaz `IJwtTokenGenerator` con método `GenerateToken(long userId, string email, string fullName)`.

**`services.md`**
- Documenta `JwtTokenGenerator` con su responsabilidad, dependencias, comportamiento, ubicación y configuración.

### Conclusión

La tarea ya estaba cumplida por la implementación existente. No se requirieron cambios adicionales.

### Verificación

- `Application` compila correctamente.
- `Infrastructure` compila correctamente.
- El servicio cumple todos los criterios de finalización.
