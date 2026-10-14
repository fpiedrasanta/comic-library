# TASK-API-0062 — Corregir resolución de rutas físicas para imágenes protegidas

## Task ID

TASK-API-0062

## Tipo

Bug

## Estado

planned

## Asignado a

Backend Agent

---

## Contexto

Al intentar obtener una imagen protegida mediante el endpoint existente de imágenes, el backend falla con:

```text
System.NotSupportedException:
Path 'Storage\Images\ffa46fe6-2528-449b-af4d-ab71ab6aa049.png' was not rooted.
```

El error se produce dentro de:

```text
Microsoft.AspNetCore.Mvc.Infrastructure.PhysicalFileResultExecutor
```

Esto indica que el endpoint está entregando a `PhysicalFile(...)` una ruta relativa:

```text
Storage\Images\ffa46fe6-2528-449b-af4d-ab71ab6aa049.png
```

cuando `PhysicalFileResult` requiere una ruta física absoluta.

También aparece:

```text
System.InvalidOperationException:
Response Content-Length mismatch: too few bytes written
```

Este segundo error debe considerarse inicialmente una consecuencia del fallo al intentar ejecutar el `PhysicalFileResult`, y no el problema raíz.

---

# Objetivo

Corregir la resolución de la ruta física utilizada por el endpoint de imágenes para que:

```text
GET /api/images/{id}
```

pueda devolver correctamente las imágenes almacenadas en:

```text
Storage/Images
```

independientemente de cuál sea el directorio de trabajo desde el que se ejecuta la aplicación.

---

# Trabajo requerido

## 1. Investigar el endpoint actual

Localizar el endpoint que devuelve las imágenes protegidas y revisar:

* cómo obtiene `StoragePath`;
* cómo construye la ruta del archivo;
* qué valor recibe actualmente `PhysicalFile(...)`;
* cómo está configurado el directorio de almacenamiento;
* si existe una abstracción o servicio existente para resolver paths físicos.

No crear una segunda estrategia de resolución de paths si ya existe una abstracción adecuada.

---

## 2. Resolver una ruta física absoluta

La ruta enviada a `PhysicalFile(...)` debe ser absoluta.

No utilizar directamente:

```text
Storage\Images\archivo.png
```

Debe resolverse contra el directorio físico de la aplicación/configuración correspondiente.

La solución debe funcionar tanto ejecutando la API desde Visual Studio como desde:

```text
dotnet run
```

y no depender del `CurrentDirectory`.

Utilizar la infraestructura estándar de ASP.NET Core (`IWebHostEnvironment`, configuración existente u otra abstracción ya utilizada por el proyecto) según corresponda a la arquitectura actual.

---

## 3. Mantener StoragePath como ruta lógica

No cambiar el valor almacenado en base de datos únicamente para solucionar este problema.

Si actualmente `StoragePath` contiene:

```text
Storage/Images/ffa46fe6-2528-449b-af4d-ab71ab6aa049.png
```

ese valor debe seguir representando la ruta lógica/relativa utilizada por el sistema.

La resolución de la ruta física debe realizarse en el momento de acceder al archivo.

Conceptualmente:

```text
StoragePath
    ↓
resolver contra root físico de la aplicación
    ↓
ruta absoluta
    ↓
PhysicalFile(...)
```

---

## 4. Validar existencia del archivo

Antes de devolver `PhysicalFile(...)`, verificar que el archivo físico exista.

Si el archivo no existe:

* no ejecutar `PhysicalFile` con una ruta inexistente;
* devolver el status HTTP apropiado según el comportamiento existente para recursos inexistentes;
* registrar información suficiente para diagnóstico.

No exponer al usuario la ruta física completa del servidor.

---

## 5. No exponer rutas físicas

La respuesta HTTP nunca debe revelar:

```text
C:\Users\...
D:\...
Storage\...
```

ni ninguna ruta física interna.

El frontend debe seguir consumiendo:

```text
/images/{id}
```

o el endpoint actual definido por la API.

---

## 6. Revisar el error Content-Length

Una vez corregida la ruta física, verificar que desaparezca también:

```text
Response Content-Length mismatch: too few bytes written
```

No implementar un workaround específico para `Content-Length` antes de corregir el problema de la ruta.

Si el error continúa después de corregir la ruta, investigar su causa y corregirla.

---

# Fuera de alcance

* No modificar el frontend.
* No modificar `ProtectedImage`.
* No modificar autenticación.
* No modificar JWT.
* No cambiar el modelo `Image`.
* No mover físicamente el directorio `Storage`.
* No modificar los valores almacenados de `StoragePath` salvo que la investigación demuestre que están incorrectos.
* No hacer público el directorio `Storage`.
* No utilizar `UseStaticFiles` para reemplazar el endpoint protegido.
* No eliminar la protección `[Authorize]` del endpoint.
* No crear un nuevo sistema de almacenamiento.

---

# Criterios de aceptación

1. `GET /api/images/{id}` devuelve correctamente una imagen existente.

2. `PhysicalFile(...)` recibe una ruta física absoluta.

3. El funcionamiento no depende del `CurrentDirectory`.

4. La solución funciona ejecutando la API desde Visual Studio.

5. La solución funciona ejecutando la API mediante `dotnet run`.

6. Una imagen existente se descarga/renderiza correctamente desde el frontend mediante `ProtectedImage`.

7. Una imagen inexistente devuelve el status HTTP apropiado y no produce una excepción de `PhysicalFile`.

8. No se exponen rutas físicas internas del servidor.

9. `StoragePath` continúa funcionando como ruta lógica/relativa según el diseño actual.

10. El error:

```text
Path 'Storage\Images\...' was not rooted.
```

desaparece.

11. El error:

```text
Response Content-Length mismatch: too few bytes written
```

también desaparece al corregirse la causa raíz.

12. El endpoint continúa requiriendo autenticación.

13. No se realizan cambios innecesarios en arquitectura, almacenamiento o frontend.

14. `dotnet build` finaliza con **0 errores y 0 warnings**.

---

# Evidencia del error actual

```text
System.NotSupportedException:
Path 'Storage\Images\ffa46fe6-2528-449b-af4d-ab71ab6aa049.png' was not rooted.

at Microsoft.AspNetCore.Mvc.Infrastructure.PhysicalFileResultExecutor.WriteFileAsyncInternal(...)
```

Error secundario observado:

```text
System.InvalidOperationException:
Response Content-Length mismatch: too few bytes written (119 of 3652).
```

La causa raíz a corregir es la utilización de una ruta relativa como ruta física para `PhysicalFile(...)`.

---

# Nota para la ejecución

Resolver únicamente el problema de resolución de ruta.

No convertir esta task en una refactorización general del sistema de archivos.

Primero corregir la ruta y verificar el endpoint completo de imágenes protegidas.
