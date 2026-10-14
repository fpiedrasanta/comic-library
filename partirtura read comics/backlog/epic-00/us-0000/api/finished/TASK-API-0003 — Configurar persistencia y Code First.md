TASK-API-0003 — Configurar persistencia y Code First

Responsabilidad:

Crear la configuración inicial de persistencia.
Configurar DbContext.
Configurar conexión a MySQL mediante configuración externa.
Configurar el mecanismo de Code First.
Configurar la ejecución de migraciones durante el despliegue, según lo definido en stack.
Verificar que una base de datos vacía pueda ser creada/actualizada correctamente.

Importante: no crearía todavía las entidades de negocio. Eso pertenece a las User Stories correspondientes.

Esta Task podría depender de TASK-API-0002.

Estado:
Finished

Bloqueo resuelto por:
TASK-API-DEC-0002

Trabajo realizado:
Lectura del contexto obligatorio.
Creación de ApplicationDbContext en Infrastructure/Persistence/ApplicationDbContext.cs.
Creación de configuración de connection string en:
  - Api/appsettings.json
  - Api/appsettings.Development.json
Creación de método de extensión AddDatabase en Infrastructure/Persistence/ServiceCollectionExtensions.cs.
Actualización de Api/Program.cs para registrar la base de datos mediante AddDatabase.
Resolución de incompatibilidad de API de MySql.EntityFrameworkCore 10.0.9:
  - Se determinó que la API oficial expone UseMySQL, no UseMySql.
  - No se utiliza MySqlServerVersion ni APIs de Pomelo.
Instalación de Microsoft.EntityFrameworkCore.Design 10.0.11 en Api para habilitar las herramientas de EF Core.
Creación de migration inicial vacía:
  - Infrastructure/Migrations/20260811213001_InitialCreate.cs
  - Infrastructure/Migrations/ApplicationDbContextModelSnapshot.cs
La migration inicial no incluye entidades porque la task lo excluye expresamente.
Verificación de compilación exitosa de ComicLibrary.sln.

Verificación contra entorno MySQL:
La migration se generó correctamente y el proyecto compila.
Se ejecutó `dotnet ef database update` contra MySQL real, creando la base de datos `comiclibrary_dev` y aplicando la migration inicial.
La conexión real contra MySQL fue verificada.

Trabajo pendiente:
Ninguno dentro del alcance de esta Task.

Resultado:
El mecanismo de persistencia y Code First queda configurado y listo para que las entidades de dominio sean agregadas por las User Stories correspondientes.
