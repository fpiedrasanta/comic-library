# TASK-API-0007 — Crear repositorios para usuarios y validación

Crear las interfaces y las implementaciones de persistencia necesarias para registrar usuarios y gestionar la información relacionada con la validación del email.

Crear las interfaces de repositorio en la capa correspondiente de la aplicación.

Crear las implementaciones utilizando Entity Framework Core en la infraestructura.

Los repositorios deben permitir:

- Crear y consultar usuarios.
- Verificar la existencia de un usuario mediante su email.
- Crear y consultar la información necesaria para validar el email.
- Actualizar el estado de validación del email.
- Invalidar o eliminar la información de validación cuando corresponda.

Utilizar `UnitOfWork` para las operaciones que requieran una transacción.

Actualizar `repositories.md` con los repositorios creados y sus responsabilidades.

UserStory: `/partirtura read comics/backlog/epic-01/us-0001/us-0001.md`
Epic: `/partirtura read comics/backlog/epic-01/epic-01.md`

Estado:
Finished

Trabajo realizado:
Lectura del contexto obligatorio.
Actualización de IUserRepository con métodos de validación de email.
Creación de IUnitOfWork y UnitOfWork en Infrastructure/Repositories.
Actualización de UserRepository con:
  - GetByIdAsync
  - UpdateAsync
  - SetEmailValidationAsync
  - ClearEmailValidationAsync
Registro de IUnitOfWork en Api/Program.cs.
Actualización de project/repositories.md.
Verificación de compilación exitosa de ComicLibrary.sln.

Resultado:
Los repositorios de usuario y la unidad de trabajo quedan implementados y registrados en DI.
