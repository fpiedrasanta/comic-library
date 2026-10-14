# TASK-API-0172 — Implementar endpoint de detalle completo de Number

## Objetivo

Implementar el endpoint administrativo que permita obtener todos los datos necesarios de un Número para cargar su formulario de alta/edición en el Dashboard.

El endpoint debe devolver en una única respuesta la información propia del Número y todas las relaciones que el formulario necesita administrar.

No debe ser necesario realizar múltiples requests para reconstruir el estado del Número.

## Alcance

La Task comprende:

- Implementar el endpoint administrativo de detalle de Number.
- Implementar o completar el método correspondiente en el repositorio.
- Implementar o completar el método correspondiente en el servicio de aplicación.
- Obtener las relaciones necesarias para editar el Número.
- Devolver la información de Serie, Franquicia y Editorial como contexto informativo.
- Devolver Personas y Roles asociados.
- Devolver Tags asociados.
- Devolver información de continuidad.
- Devolver información de idioma.
- Devolver información de portada.
- Devolver información del contenido digital y su estado de procesamiento.
- Documentar el endpoint.

## Endpoint

### GET /api/admin-numbers/{numberId}

Obtener el detalle completo de un Número.

El endpoint debe requerir:

- Usuario autenticado.
- Rol `Administrator`.

Si el Número no existe, debe devolver el error correspondiente según el mecanismo centralizado de manejo de errores del proyecto.

## Información propia del Número

La respuesta debe incluir como mínimo:

- `Id`.
- `Number`.
- `Title`.
- `Description`.
- `Language`.
- `PublicationDate`.
- `CreatedAt`.
- `IsActive`.

`CreatedAt` representa la fecha y hora en que el Número fue incorporado al sistema.

`PublicationDate` representa únicamente la fecha de publicación.

## Portada

La respuesta debe incluir la información necesaria para mostrar la portada actual del Número.

Debe permitir que el Dashboard:

- Muestre la portada.
- Identifique su `ImageId`.
- Determine si existe una portada asociada.
- Mantenga la portada actual si el administrador no selecciona una nueva.
- Elimine la portada si el administrador así lo solicita.

Las imágenes continúan siendo recursos privados.

El endpoint no debe exponer una URL pública directa al archivo físico.

## Serie, Franquicia y Editorial

La respuesta debe incluir el contexto estructural del Número:

```text
Editorial
    ↓
Franquicia
    ↓
Serie
    ↓
Número
```

Debe devolver la información necesaria para mostrar:

- Serie.
- Franquicia.
- Editorial.

Esta información es **solamente informativa** en el formulario de Número.

No debe utilizarse para permitir el cambio de Serie, Franquicia o Editorial.

El Número no debe contener `FranchiseId` ni `PublisherId` propios.

Estos datos deben obtenerse mediante las relaciones existentes.

## Idioma

La respuesta debe incluir:

- `LanguageId`.
- Nombre del idioma.

El idioma es obligatorio para un Número.

## Continuidad

La respuesta debe incluir:

- Número anterior.
- Número siguiente.

Cuando existan, debe devolver como mínimo:

- Identificador.
- Número.
- Título.

Ejemplo conceptual:

```json
{
  "previousNumber": {
    "id": 20,
    "number": "#REGULAR-0020",
    "title": "..."
  },
  "nextNumber": {
    "id": 22,
    "number": "#REGULAR-0022",
    "title": "..."
  }
}
```

Ambas relaciones son opcionales.

La información devuelta debe permitir al Dashboard mostrar y modificar la continuidad mediante el POST/PUT de Number.

No se deben implementar endpoints independientes para modificar la continuidad.

## Personas y Roles

La respuesta debe incluir todas las relaciones `PersonByRole` asociadas al Número.

Debe devolver como mínimo:

```json
[
  {
    "personId": 1,
    "personName": "John Doe",
    "roleId": 2,
    "roleName": "Dibujante"
  },
  {
    "personId": 1,
    "personName": "John Doe",
    "roleId": 3,
    "roleName": "Entintador"
  },
  {
    "personId": 2,
    "personName": "Juan Salvo",
    "roleId": 2,
    "roleName": "Dibujante"
  }
]
```

Debe permitirse que:

- Una persona tenga múltiples roles dentro del Número.
- Un rol tenga múltiples personas asociadas.

La respuesta debe representar cada combinación `Person + Role`.

## Tags

La respuesta debe incluir todos los Tags asociados al Número.

Debe devolver como mínimo:

```json
[
  {
    "id": 1,
    "name": "Terror"
  },
  {
    "id": 2,
    "name": "Acción"
  }
]
```

El identificador es necesario para que el PUT pueda distinguir los Tags existentes de los nuevos.

Al guardar, el Dashboard podrá enviar, por ejemplo:

```json
[
  {
    "name": "Terror",
    "id": 1
  },
  {
    "name": "Amor",
    "id": 0
  }
]
```

La sincronización de Tags forma parte del POST/PUT de Number y no de este endpoint de detalle.

## Contenido digital

La respuesta debe incluir información suficiente para que el Dashboard conozca el estado actual del contenido digital.

Como mínimo debe informar:

- Si existe contenido digital.
- Estado del procesamiento.
- Información necesaria para mostrar el estado al administrador.
- Información del error cuando el procesamiento haya fallado, si existe.

Los estados contemplados son:

```text
Missing
Processing
Completed
Error
```

El detalle completo del error debe estar disponible cuando el estado sea `Error`.

La administración del procesamiento, reintento y eliminación del contenido será implementada en las Tasks específicas de contenido digital.

## Páginas

El endpoint **no debe devolver las páginas completas ni sus archivos**.

Las páginas son recursos individuales asociados al contenido digital y no deben cargarse junto con el formulario administrativo de Number.

El detalle solamente debe informar el estado y los metadatos necesarios del contenido digital.

## Consulta y rendimiento

La implementación debe evitar consultas N+1.

Cuando corresponda, debe utilizar:

- `Include`.
- Proyecciones.
- Consultas específicas de detalle.

Las lecturas deben utilizar `AsNoTracking`.

No debe recuperarse información innecesaria.

El objetivo es que el Dashboard pueda cargar el formulario completo del Número mediante una única llamada HTTP.

## Seguridad

El endpoint debe requerir:

- Usuario autenticado.
- Rol `Administrator`.

No debe existir una versión pública de este endpoint.

La información de contenido digital y relaciones administrativas no debe exponerse a usuarios públicos mediante este endpoint.

## Servicio

El servicio de aplicación debe encargarse de:

- Obtener el Número.
- Validar su existencia.
- Obtener las relaciones necesarias.
- Construir el DTO de detalle.
- Devolver el resultado.

El controlador no debe contener lógica de acceso a datos ni reglas de negocio.

## Repositorio

El repositorio debe proporcionar una operación específica para obtener el detalle completo del Número.

La consulta debe permitir obtener de forma eficiente:

- Number.
- Series.
- Franchise.
- Publisher.
- Language.
- Cover.
- Previous Number.
- Next Number.
- PersonByRole.
- Person.
- Role.
- TagByNumber.
- Tag.
- Información del contenido digital.

Debe evitarse cargar colecciones o entidades que no sean necesarias para el formulario.

## Fuera de alcance

No implementar en esta Task:

- Crear Number.
- Modificar Number.
- Activar Number.
- Desactivar Number.
- Crear Person.
- Crear Role.
- Crear Tag.
- Modificar PersonByRole.
- Modificar TagByNumber.
- Modificar continuidad.
- Procesar CBR.
- Reintentar procesamiento CBR.
- Eliminar contenido digital.
- Administrar Pages manualmente.
- Generar descripción mediante IA.
- Generar Tags mediante IA.
- Cambiar Serie.
- Cambiar Franquicia.
- Cambiar Editorial.

## Documentación

Actualizar:

- `project/endpoints.md`.
- `project/endpoints/endpoints-numbers.md`.
- `project/services/services-application.md`.
- `project/repositories.md`.

La documentación debe describir el contrato real del endpoint y todos los datos incluidos en la respuesta.

## Criterios de aceptación

- [ ] Existe `GET /api/admin-numbers/{numberId}`.
- [ ] El endpoint requiere autenticación.
- [ ] El endpoint requiere rol `Administrator`.
- [ ] El endpoint devuelve los datos propios del Número.
- [ ] Devuelve `Number`.
- [ ] Devuelve `Title`.
- [ ] Devuelve `Description`.
- [ ] Devuelve `Language`.
- [ ] Devuelve `PublicationDate`.
- [ ] Devuelve `CreatedAt`.
- [ ] Devuelve `IsActive`.
- [ ] Devuelve la información de la portada.
- [ ] Devuelve Serie.
- [ ] Devuelve Franquicia.
- [ ] Devuelve Editorial.
- [ ] Serie, Franquicia y Editorial se devuelven únicamente como contexto informativo.
- [ ] Devuelve el idioma.
- [ ] Devuelve Número anterior cuando existe.
- [ ] Devuelve Número siguiente cuando existe.
- [ ] Devuelve todas las relaciones `PersonByRole`.
- [ ] Permite representar múltiples roles para una misma persona.
- [ ] Permite representar múltiples personas para un mismo rol.
- [ ] Devuelve todos los Tags asociados.
- [ ] Los Tags incluyen su identificador.
- [ ] Devuelve el estado del contenido digital.
- [ ] Devuelve el detalle del error cuando corresponde.
- [ ] No devuelve las páginas completas ni sus archivos.
- [ ] El formulario puede reconstruirse completamente utilizando la respuesta del endpoint.
- [ ] No son necesarios múltiples requests para obtener los datos del Número.
- [ ] La consulta no genera problemas N+1.
- [ ] Las lecturas utilizan `AsNoTracking` cuando corresponde.
- [ ] El controlador no contiene lógica de negocio.
- [ ] La solución compila correctamente.
- [ ] La documentación queda alineada con la implementación.

## Resultado

### Endpoint implementado

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin-numbers/{numberId}` | Obtener detalle completo de un Número |

### Archivos creados/modificados

| Archivo | Descripción |
|---------|-------------|
| `api/Application/DTOs/NumberDetailDto.cs` | DTO con toda la información del Número |
| `api/Application/Services/NumberService.cs` | Método GetById completado |
| `api/Infrastructure/Repositories/NumberRepository.cs` | Método GetById con Includes |
| `api/Api/Controllers/AdminNumbersController.cs` | Endpoint GET by ID |

### Información devuelta

- Datos propios: Id, Number, Title, Description, Language, PublicationDate, CreatedAt, IsActive
- Portada: ImageId, ImageUrl
- Contexto estructural: Series, Franchise, Publisher (solo informativo)
- Idioma: LanguageId, LanguageName
- Continuidad: PreviousNumber, NextNumber (con Id, Number, Title)
- Personas y Roles: colección de PersonByRole (personId, personName, roleId, roleName)
- Tags: colección de Tags (id, name)
- Contenido digital: Status, ErrorMessage, ErrorDetails

### Decisiones relevantes

- Una única llamada HTTP carga el formulario completo
- Include de navegaciones para evitar N+1
- AsNoTracking en consultas de lectura
- No devuelve páginas completas ni archivos

### Build

- Exitoso: 0 errores, 0 warnings

### Criterios de aceptación cumplidos

- [x] Existe `GET /api/admin-numbers/{numberId}`
- [x] El endpoint requiere autenticación
- [x] El endpoint requiere rol `Administrator`
- [x] El endpoint devuelve los datos propios del Número
- [x] Devuelve `Number`
- [x] Devuelve `Title`
- [x] Devuelve `Description`
- [x] Devuelve `Language`
- [x] Devuelve `PublicationDate`
- [x] Devuelve `CreatedAt`
- [x] Devuelve `IsActive`
- [x] Devuelve la información de la portada
- [x] Devuelve Serie
- [x] Devuelve Franquicia
- [x] Devuelve Editorial
- [x] Serie, Franquicia y Editorial se devuelven únicamente como contexto informativo
- [x] Devuelve el idioma
- [x] Devuelve Número anterior cuando existe
- [x] Devuelve Número siguiente cuando existe
- [x] Devuelve todas las relaciones `PersonByRole`
- [x] Permite representar múltiples roles para una misma persona
- [x] Permite representar múltiples personas para un mismo rol
- [x] Devuelve todos los Tags asociados
- [x] Los Tags incluyen su identificador
- [x] Devuelve el estado del contenido digital
- [x] Devuelve el detalle del error cuando corresponde
- [x] No devuelve las páginas completas ni sus archivos
- [x] El formulario puede reconstruirse completamente utilizando la respuesta del endpoint
- [x] No son necesarios múltiples requests para obtener los datos del Número
- [x] La consulta no genera problemas N+1
- [x] Las lecturas utilizan `AsNoTracking` cuando corresponde
- [x] El controlador no contiene lógica de negocio
- [x] La solución compila correctamente
- [x] La documentación queda alineada con la implementación