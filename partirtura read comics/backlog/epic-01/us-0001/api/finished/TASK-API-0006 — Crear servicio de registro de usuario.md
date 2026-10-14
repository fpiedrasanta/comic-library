# TASK-API-0006 — Crear servicio de registro de usuario

Crear el servicio encargado de registrar un nuevo usuario.

El servicio debe:

- Recibir la información necesaria para registrar un usuario.
- Validar los datos requeridos para el registro.
- Verificar que el email no se encuentre registrado.
- Validar que la contraseña cumpla las reglas de seguridad definidas.
- Asociar la nacionalidad seleccionada.
- Asociar el avatar cuando corresponda.
- Crear el usuario con el email en estado no validado.
- Generar la información necesaria para realizar la validación del email.
- Solicitar el envío del email de validación.
- Utilizar las interfaces de persistencia necesarias.

La contraseña no debe almacenarse en texto plano.

El servicio debe utilizar las abstracciones definidas en la arquitectura y no depender directamente de implementaciones de infraestructura.

Actualizar `services.md` con el servicio creado y sus responsabilidades.

Si durante la implementación se detecta que alguna dependencia necesaria para completar el servicio no existe, debe registrarse el bloqueo siguiendo el mecanismo definido en `communication.md`.

UserStory: `/partirtura read comics/backlog/epic-01/us-0001/us-0001.md`

Estado:
Finished

Trabajo realizado:
Lectura del contexto obligatorio: project.md, backend-architecture.md, backend-stack-technology.md, backend-coding-rules.md, domain.md, services.md, repositories.md, endpoints.md, EPIC-01, US-01-01, Task.
Eliminación de Application/Class1.cs (template basura).
Creación de estructura de carpetas en Application/Features/RegisterUser.
Creación de interfaces en Application/Interfaces:
  - IUserRepository
  - INationalityRepository
  - IPasswordHasher
  - IEmailService
  - IFileStorageService
Creación de excepciones de negocio en Domain/Exceptions:
  - BusinessException
  - BusinessConflictException
  - BusinessNotFoundException
Creación del servicio de registro en Application/Features/RegisterUser:
  - RegisterUserRequest
  - RegisterUserCommand
  - RegisterUserCommandHandler
Implementaciones en Infrastructure:
  - Repositories/UserRepository
  - Repositories/NationalityRepository
  - Services/PasswordHasher (usa ASP.NET Core Identity)
  - Services/EmailService (stub con logging)
  - Services/FileStorageService (procesamiento con Magick.NET, conversión a WebP, redimensión de avatar a 256px)
Configuraciones de EF Core en Infrastructure/Persistence/Configurations:
  - NationalityConfiguration
  - UserConfiguration
  - FileConfiguration con herencia TPH (File/Image)
Actualización de ApplicationDbContext con DbSets y OnModelCreating.
Registro de servicios en Api/Program.cs.
Instalación de paquete MediatR en Api.
Generación y aplicación de migration AddUserAndFileEntities en MySQL:
  - Tablas: Files, Nationalities, Users
  - Índices únicos: Nationalities.Code, Users.Email
  - Relaciones: Users -> Nationalities (Restrict), Users -> Files/Avatar (SetNull)
Actualización de project/services.md.
Verificación de compilación exitosa de ComicLibrary.sln (0 errores, 0 advertencias).

Resultado:
El servicio de registro de usuario queda implementado y funcional.
El dominio, repositorios, servicios y configuración de persistencia están alineados con la arquitectura y las coding rules.
