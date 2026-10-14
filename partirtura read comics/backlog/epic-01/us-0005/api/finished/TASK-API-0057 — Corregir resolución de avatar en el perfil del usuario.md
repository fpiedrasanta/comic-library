# TASK-API-0057 — Corregir resolución de avatar en el perfil del usuario

## Objetivo

Corregir la forma en que el backend construye la URL del avatar devuelta al frontend.

El sistema maneja dos fuentes posibles de avatar:

- `AvatarUrl`: URL externa del avatar, utilizada principalmente para usuarios registrados mediante Google.
- `Avatar`: imagen almacenada internamente en el storage de la aplicación.

El frontend **no debe recibir nunca un `StoragePath` ni una ruta física del servidor**.

Cuando el usuario posee una imagen almacenada internamente, el backend debe devolver una URL relativa que permita al frontend acceder posteriormente a la imagen mediante el endpoint correspondiente.

## Reglas funcionales

1. Si el usuario tiene una entidad `Avatar` asociada:
   - No devolver `Avatar.StoragePath`.
   - Construir una URL relativa utilizando el identificador de la imagen.
   - El formato esperado es:

```text
/images/{id}
```

2. Si el usuario no tiene una entidad `Avatar`, pero posee `AvatarUrl`:
   - Devolver directamente el valor de `AvatarUrl`.
   - Esta URL corresponde al avatar externo proporcionado por Google.

3. Si el usuario no posee `Avatar` ni `AvatarUrl`:
   - Devolver `null`.

4. El frontend debe recibir siempre una URL utilizable como `src` de un `<img>`.

5. No exponer:
   - rutas físicas del storage;
   - `StoragePath`;
   - información interna de infraestructura;
   - nombres físicos de archivos.

## Ejemplo esperado

Si el usuario posee:

```text
Avatar.Id = 123
Avatar.StoragePath = /storage/avatars/2026/08/f8a91c.webp
```

La respuesta del perfil debe contener:

```json
{
  "avatarUrl": "/images/123"
}
```

No debe contener:

```json
{
  "avatarUrl": "/storage/avatars/2026/08/f8a91c.webp"
}
```

## Criterios de aceptación

- [ ] `GET /api/users/me` devuelve `/images/{id}` cuando el usuario posee un `Avatar`.
- [ ] `GET /api/users/me` devuelve `AvatarUrl` cuando no existe `Avatar` pero sí existe `AvatarUrl`.
- [ ] `GET /api/users/me` devuelve `null` cuando no existe ninguna de las dos fuentes.
- [ ] `StoragePath` nunca se expone al frontend.
- [ ] No se modifica el comportamiento de almacenamiento físico de las imágenes.
- [ ] La solución mantiene la separación entre Application e Infrastructure.
- [ ] El código sigue las reglas existentes de arquitectura y coding rules.
- [ ] La solución compila sin errores ni warnings.
- [ ] Se actualiza `project/endpoints.md` si el contrato de `UserProfileResponse` cambia.
- [ ] Se actualiza `project/services.md` si cambia la responsabilidad de algún servicio.

## Fuera de alcance

Esta task no implementa el endpoint que entrega físicamente la imagen.

El endpoint `/images/{id}` será implementado en una task separada.

---

# Resultado de la ejecución

## Estado

Finished

## Trabajo realizado

- Se corrigió la resolución de avatar en `UserService.GetProfileAsync`, `UpdateProfileAsync` y `UpdateAvatarAsync` para devolver `/images/{id}` cuando el usuario posee un avatar local.
- Se corrigió la resolución de avatar en `AuthService.GenerateAuthResultAsync` para devolver `/images/{id}` en lugar de `StoragePath`.
- Cuando el usuario no tiene avatar local, se devuelve `AvatarUrl` (URL externa de Google).
- Cuando no tiene ninguna fuente, se devuelve `null`.
- Se actualizó `project/endpoints.md` para reflejar el nuevo formato de `avatarUrl`.
- Se actualizó `project/services.md` para reflejar la nueva responsabilidad de resolución de avatar.

## Verificación

- Build exitoso: 0 errores, 0 advertencias.
