# EPIC-01 — Gestión de usuarios e identidad

## Tipo

Epic funcional.

## Objetivo

Permitir que las personas puedan registrarse, autenticarse y gestionar su cuenta dentro del sistema de forma segura.

La Epic establece la identidad del usuario como una capacidad transversal del sistema, utilizada posteriormente por las funcionalidades de lectura, progreso, favoritos, reseñas, historial, notas y demás funcionalidades personalizadas.

También comprende las capacidades necesarias para que los usuarios con rol `Administrator` puedan acceder y operar el Dashboard administrativo, así como las funcionalidades de administración relacionadas directamente con los usuarios, sus baneos, los usuarios administradores y los países disponibles para sus cuentas.

## Alcance

La Epic comprende:

- Registro de usuarios mediante email y contraseña.
- Validación del email antes de considerar validada una cuenta registrada mediante email.
- Aplicación de reglas de seguridad para las contraseñas.
- Registro e inicio de sesión mediante Google.
- Autenticación de usuarios.
- Gestión del perfil personal.
- Cambio seguro de contraseña.
- Recuperación de acceso mediante email.
- Gestión de sesiones.
- Cierre de sesión.
- Eliminación de la cuenta.
- Autenticación y acceso al Dashboard administrativo.
- Administración de usuarios desde el Dashboard.
- Administración de bloqueos/baneos de usuarios.
- Administración de usuarios con rol `Administrator`.
- Administración de países disponibles para los usuarios.
- Gestión de la información asociada a la identidad del usuario.
- Gestión de roles necesarios para distinguir usuarios públicos y administradores.

## Seguridad

La cuenta de un usuario registrado mediante email y contraseña no debe considerarse completamente validada hasta que su dirección de email haya sido confirmada.

Las contraseñas deben cumplir las reglas de seguridad definidas para el sistema y nunca deben almacenarse en texto plano.

El cambio de contraseña de un usuario autenticado debe requerir una validación adicional mediante email, evitando que una sesión comprometida permita cambiar directamente las credenciales de acceso.

La recuperación de acceso debe permitir al usuario recuperar el control de su cuenta sin conocer su contraseña anterior, utilizando un mecanismo seguro de validación mediante email.

Los códigos y tokens utilizados durante los procesos de validación, recuperación y cambio de contraseña deben almacenarse de forma segura y nunca en texto plano cuando su naturaleza requiera almacenamiento persistente.

La autenticación debe utilizar el mecanismo de sesión definido para el sistema:

- Access Token mediante JWT.
- Refresh Token.
- Refresh Token mediante cookie HttpOnly.
- Refresh Token Rotation.

Los Refresh Tokens no deben almacenarse en texto plano.

Los usuarios registrados mediante Google se consideran poseedores de un email previamente validado por el proveedor de identidad y, por lo tanto, su cuenta debe registrarse con el email validado.

El rol del usuario debe provenir de la identidad persistida y no debe poder ser modificado mediante funcionalidades destinadas a la gestión del perfil personal.

Las funcionalidades administrativas que permiten gestionar usuarios administradores deben estar restringidas a los permisos correspondientes y no deben permitir que un usuario público modifique su propio rol.

## País

El país asociado al usuario no debe almacenarse como un `string` libre.

Debe existir una representación propia dentro del modelo de dominio que permita identificar de manera consistente el país seleccionado.

Los países disponibles para selección deben ser administrados desde el Dashboard administrativo.

Los países deben poder ser activados o desactivados sin eliminar físicamente sus registros.

La desactivación de un país no debe modificar automáticamente las referencias existentes de los usuarios que lo tengan asociado.

Un país inactivo no debe estar disponible para nuevas selecciones durante el registro o la edición del perfil, pero los usuarios existentes que lo tengan asociado deben conservar su referencia.

## Administración

El sistema debe proporcionar al administrador herramientas para consultar y gestionar los usuarios registrados.

La autenticación y autorización necesaria para acceder al Dashboard administrativo pertenece a esta Epic.

La administración funcional de usuarios pertenece al Dashboard y no debe confundirse con la gestión del perfil personal realizada desde el Public Web.

El administrador debe poder operar únicamente las funcionalidades que correspondan a su rol.

La administración de usuarios comprende exclusivamente las operaciones definidas en las User Stories correspondientes.

Los permisos y roles complejos relacionados con la administración del contenido de comics quedan fuera del alcance de esta Epic.

## User Stories

La Epic comprende las siguientes User Stories:

### US-0001 — Registrarse

Permitir que una persona cree una cuenta mediante email y contraseña y complete la validación de su dirección de email.

Durante el registro, el usuario podrá seleccionar un país entre los países disponibles.

### US-0002 — Iniciar sesión

Permitir que un usuario registrado y con email validado inicie sesión mediante email y contraseña y mantenga una sesión mediante Access Token y Refresh Token.

### US-0003 — Recuperar contraseña

Permitir que un usuario que olvidó su contraseña recupere el acceso mediante un código enviado por email y establezca una nueva contraseña.

### US-0004 — Autenticación mediante Google

Permitir que una persona se registre o inicie sesión utilizando su cuenta de Google, integrando la identidad resultante con el usuario existente cuando corresponda.

### US-0005 — Gestión del perfil personal del usuario

Permitir que un usuario autenticado consulte y modifique la información personal correspondiente a su propia cuenta.

### US-0006 — Autenticación y acceso al Dashboard administrativo

Permitir que un usuario con rol `Administrator` se autentique y acceda al Dashboard administrativo utilizando el mecanismo de sesión existente.

### US-0007 — Cambiar mi contraseña

Permitir que un usuario autenticado cambie su contraseña desde su perfil mediante una validación adicional por email.

### US-0008 — Gestionar sesiones y cerrar sesión

Permitir que un usuario autenticado pueda cerrar su sesión actual o cerrar todas las sesiones activas de su cuenta para controlar de forma segura dónde permanece abierta su cuenta y poder revocar el acceso desde otros dispositivos cuando sea necesario.

### US-0009 — Eliminar mi cuenta

Permitir que un usuario autenticado pueda eliminar su cuenta de forma segura para dejar de utilizar la plataforma y eliminar su acceso personal al sistema.

La eliminación de la cuenta será lógica y no deberá eliminar físicamente la información persistida cuando esta deba conservarse por razones de integridad, historial o auditoría.

### US-0010 — Administrar usuarios

Permitir que los administradores consulten y supervisen los usuarios registrados desde el Dashboard.

La funcionalidad debe permitir buscar, filtrar, ordenar, paginar y visualizar información de los usuarios, incluyendo su fotografía de perfil y la cantidad e historial de baneos.

La administración de usuarios definida en esta User Story es exclusivamente de consulta.

El administrador no puede modificar la identidad, información personal ni credenciales de otro usuario mediante esta User Story.

Las operaciones relacionadas con los baneos pertenecen a `US-0011 — Administrar bloqueos/baneos de usuarios`.

### US-0011 — Administrar bloqueos/baneos de usuarios

Permitir que los administradores consulten y administren los bloqueos/baneos de los usuarios.

La funcionalidad debe permitir revisar el historial de sanciones, identificar baneos vigentes y crear, modificar o revocar baneos cuando corresponda.

Los baneos revocados deben conservarse como historial y no deben eliminarse físicamente.

### US-0012 — Administrar usuarios administradores

Permitir que los administradores autorizados consulten y gestionen los usuarios que poseen el rol `Administrator`.

La funcionalidad debe permitir crear, consultar, modificar y desactivar usuarios administradores de acuerdo con las reglas de seguridad definidas para el sistema.

La administración de usuarios administradores debe estar separada de la gestión del perfil personal de cada usuario.

La asignación y modificación del rol administrativo debe realizarse exclusivamente mediante esta funcionalidad y nunca mediante operaciones destinadas al usuario público.

### US-0013 — Administrar países

Permitir que los administradores consulten y gestionen los países disponibles en el sistema.

La funcionalidad debe permitir crear, consultar, modificar y activar o desactivar países.

Los países no deben eliminarse físicamente cuando hayan sido utilizados por usuarios existentes.

Los países activos estarán disponibles para su selección durante el registro y la gestión del perfil del usuario.

## Fuera de alcance

Esta Epic no comprende:

- Gestión de Personas relacionadas con comics.
- Autores.
- Dibujantes.
- Entintadores.
- Coloristas.
- Portadistas.
- Traductores.
- Editores.
- Editoriales.
- Franquicias.
- Series.
- Números.
- Obras.
- Listas de lectura.
- Progreso de lectura.
- Favoritos.
- Reseñas.
- Recomendaciones.
- Permisos complejos o roles editoriales relacionados con el contenido.
- Administración del catálogo de comics.
- Administración de permisos específicos del contenido de comics.

Estos conceptos serán desarrollados en Epics posteriores.

## Resultado esperado

Al finalizar esta Epic:

### Usuario público

Una persona debe poder:

1. Crear una cuenta mediante email y contraseña.
2. Seleccionar un país disponible durante el registro.
3. Validar su email.
4. Iniciar sesión de forma segura.
5. Registrarse e iniciar sesión utilizando Google.
6. Gestionar su información personal.
7. Cambiar su contraseña mediante un mecanismo de seguridad adicional.
8. Recuperar el acceso si olvidó su contraseña.
9. Gestionar sus sesiones.
10. Cerrar su sesión.
11. Eliminar su cuenta.

### Administrador

Un usuario con rol `Administrator` debe poder:

1. Autenticarse mediante email y contraseña.
2. Acceder al Dashboard administrativo.
3. Cerrar su sesión.
4. Consultar usuarios registrados.
5. Consultar y gestionar los baneos de usuarios.
6. Gestionar los usuarios administradores según los permisos correspondientes.
7. Gestionar los países disponibles para los usuarios.

### Capacidad transversal

La identidad resultante debe estar disponible para que las siguientes Epics puedan asociar correctamente al usuario sus acciones, preferencias, progreso y contenido personal.

## Criterio de finalización de la Epic

EPIC-01 se considera funcionalmente completada cuando todas las User Stories que forman parte de la Epic hayan sido implementadas y se encuentren en estado `finished`.

El conjunto de User Stories que determina la finalización de EPIC-01 es:

- US-0001 — Registrarse.
- US-0002 — Iniciar sesión.
- US-0003 — Recuperar contraseña.
- US-0004 — Autenticación mediante Google.
- US-0005 — Gestión del perfil personal del usuario.
- US-0006 — Autenticación y acceso al Dashboard administrativo.
- US-0007 — Cambiar mi contraseña.
- US-0008 — Gestionar sesiones y cerrar sesión.
- US-0009 — Eliminar mi cuenta.
- US-0010 — Administrar usuarios.
- US-0011 — Administrar bloqueos/baneos de usuarios.
- US-0012 — Administrar usuarios administradores.
- US-0013 — Administrar países.