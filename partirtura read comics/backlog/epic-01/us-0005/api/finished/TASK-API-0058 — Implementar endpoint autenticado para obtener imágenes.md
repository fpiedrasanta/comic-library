# TASK-API-0058 — Implementar endpoint autenticado para obtener imágenes

## Objetivo

Implementar un endpoint que permita al frontend obtener una imagen almacenada internamente a partir de su identificador.

El endpoint será utilizado por las URLs de avatar devueltas por `GET /api/users/me`.

El frontend utilizará una URL de este tipo:

```text
/images/{id}
```

Por ejemplo:

```html
<img src="{urlBase}/images/123">
```

El backend deberá localizar la imagen, validar el acceso y devolver el archivo listo para ser mostrado por el navegador.

## Endpoint

```http
GET /api/images/{id}
```

Donde:

- `id` es el identificador de la imagen almacenada en la base de datos.

El endpoint debe requerir autenticación.

## Flujo

```text
Frontend
   |
   | GET /images/{id}
   |
   v
ImagesController
   |
   | Validar autenticación
   |
   v
Obtener Image por Id
   |
   +---- No existe ----> 404
   |
   v
Resolver archivo desde StoragePath
   |
   +---- Archivo inexistente ----> 404
   |
   v
Devolver archivo
```

## Reglas funcionales

1. El endpoint debe requerir un usuario autenticado.

2. El identificador recibido debe utilizarse para localizar la entidad `Image`.

3. Si la imagen no existe en la base de datos:
   - devolver `404 Not Found`.

4. Si la entidad existe pero el archivo físico no existe:
   - devolver `404 Not Found`.
   - no exponer el `StoragePath` ni detalles internos del storage.

5. Si la imagen existe y el archivo físico está disponible:
   - devolver el archivo utilizando su MIME type correspondiente.
   - permitir que el navegador lo utilice directamente como `src` de un `<img>`.

6. El endpoint no debe devolver un JSON con la imagen.
   Debe devolver el contenido binario utilizando la respuesta HTTP apropiada.

7. El endpoint no debe permitir acceso anónimo.

8. No se deben exponer rutas físicas del servidor.

9. No se deben registrar en logs datos sensibles o rutas internas innecesarias.

## Autorización

La primera versión debe validar que el usuario esté autenticado.

No es necesario implementar en esta task un sistema complejo de permisos sobre imágenes.

La autorización debe utilizar el mecanismo de autenticación existente del backend.

## Ejemplo

Request:

```http
GET /api/images/123
Authorization: Bearer {accessToken}
```

Respuesta exitosa:

```http
200 OK
Content-Type: image/webp

[binary image content]
```

Si no existe:

```http
404 Not Found
```

Si no está autenticado:

```http
401 Unauthorized
```

## Criterios de aceptación

- [ ] Existe `GET /api/images/{id}`.
- [ ] El endpoint requiere autenticación.
- [ ] Una imagen existente se devuelve como contenido binario.
- [ ] El `Content-Type` corresponde al tipo real de la imagen.
- [ ] Una imagen inexistente devuelve `404`.
- [ ] Un archivo físico inexistente devuelve `404`.
- [ ] Nunca se expone `StoragePath`.
- [ ] El endpoint puede ser utilizado directamente como `src` de un `<img>`.
- [ ] No se crea un mecanismo paralelo de autenticación.
- [ ] Se reutiliza la configuración y servicios de storage existentes.
- [ ] El controller no contiene lógica de negocio ni acceso directo innecesario a infraestructura.
- [ ] Se actualiza `project/endpoints.md` con el nuevo endpoint.
- [ ] Se actualiza `project/services.md` si se crea un servicio específico para resolver/entregar imágenes.
- [ ] La solución compila sin errores ni warnings.

## Fuera de alcance

Esta task no modifica:

- el proceso de upload de imágenes;
- el modelo de `Image`, salvo que sea estrictamente necesario;
- el perfil del usuario;
- el endpoint `GET /api/users/me`;
- el frontend.

La corrección del campo `avatarUrl` en el perfil corresponde a `TASK-API-0054`.

---

# Resultado de la ejecución

## Estado

Finished

## Trabajo realizado

- Se creó `IImageRepository` en `Application/Interfaces/`.
- Se creó `ImageRepository` en `Infrastructure/Repositories/`.
- Se creó `ImagesController` en `Api/Controllers/` con el endpoint `GET /api/images/{id}`.
- El endpoint requiere autenticación (`[Authorize]`).
- Devuelve la imagen como contenido binario con el Content-Type correcto.
- Devuelve 404 si la imagen no existe en la base de datos o el archivo físico no existe.
- No expone `StoragePath` ni rutas internas del servidor.
- Se registró `IImageRepository` en el contenedor de dependencias.
- Se actualizó `project/endpoints.md` con el nuevo endpoint.
- Se actualizó `project/services.md` con `ImageRepository`.

## Verificación

- Build exitoso: 0 errores, 0 advertencias.