# TASK-API-0005 — Crear modelo de dominio de usuario

Crear el modelo de dominio necesario para representar un usuario y los conceptos asociados al registro.

El modelo debe contemplar:

- Nombre.
- Apellido.
- Email.
- Contraseña.
- Nacionalidad mediante una clase propia del dominio.
- Avatar mediante una imagen.
- Estado de validación del email.
- Información necesaria para controlar la validación del email.

Crear una representación de dominio para `Archivo` que permita modelar los archivos almacenados por el sistema.

`Archivo` debe ser una clase abstracta de la que puedan derivarse los diferentes tipos de archivos soportados por el sistema.

Crear `Imagen` como especialización de `Archivo`.

Crear `TipoImagen` para identificar el uso de una imagen dentro del sistema.

Todas las imágenes del sistema deben considerarse privadas. El modelo no debe asumir que una imagen puede ser accedida públicamente mediante su URL física.

La nacionalidad no debe representarse como un `string` dentro del usuario.

La implementación debe respetar las reglas de encapsulamiento y las convenciones definidas en `backend-coding-rules.md`.

Si para representar alguno de los conceptos anteriores es necesario crear nuevas clases de dominio, deben crearse y quedar correctamente relacionadas.

Actualizar `domain.md` con todos los objetos creados o modificados como resultado de esta Task.

UserStory: `/partirtura read comics/backlog/epic-01/us-0001/us-0001.md`

Estado:
Finished

Trabajo realizado:
Lectura del contexto obligatorio: project.md, backend-architecture.md, backend-stack-technology.md, backend-coding-rules.md, domain.md, services.md, repositories.md, endpoints.md, EPIC-01, US-01-01, Task.
Eliminación de Domain/Class1.cs (template basura).
Creación de carpetas Domain/Entities y Domain/Enums.
Creación de entidades de dominio:
  - Domain/Entities/User.cs
  - Domain/Entities/Nationality.cs
  - Domain/Entities/File.cs (abstracta)
  - Domain/Entities/Image.cs
  - Domain/Enums/ImageType.cs
Actualización de project/domain.md con el modelo de dominio resultante.
Verificación de compilación exitosa de ComicLibrary.sln (0 errores, 0 advertencias).

Resultado:
El modelo de dominio de usuario y archivos queda creado y documentado.
Las entidades respetan las reglas de encapsulamiento y codificación definidas en backend-coding-rules.md.
Ninguna entidad depende de frameworks externos.
