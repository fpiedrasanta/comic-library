# TASK-API-0308 — Obtener el contexto completo del lector en una lista

## Objetivo

Implementar el endpoint `GET /api/reading/lists/{listId}/work/{workId}` para obtener toda la información necesaria para leer un Work dentro del contexto de una lista.

El dominio ya está implementado. La implementación debe reutilizar las entidades, repositorios, servicios y mecanismos existentes de lectura, progreso y valoraciones.

## Contexto obligatorio

Leer y revisar:

- `project/backend-agent.md`
- `project/project.md`
- `backend-architecture.md`
- `backend-coding-rules.md`
- `backend-stack-technology.md`
- `domain.md`
- `repositories.md`
- `services.md`
- `endpoints.md`
- `us-0035.md`
- `communication.md`
- El endpoint `GET /api/catalog/lists/{id}`.
- El endpoint existente `GET /api/works/{id}/pages`.
- Los servicios y repositorios existentes de progreso y valoración de Works.
- Los contratos actuales de lectura y consulta de listas.

## Alcance

### 1. Repositorios

Revisar los repositorios existentes y resolver, reutilizando operaciones siempre que sea posible, la consulta de:

- La lista y sus metadatos.
- Los Works de la lista, ordenados por `WorkListItem.Position`.
- El progreso de lectura del usuario para cada Work.
- El progreso de lectura de la lista para el usuario.
- La valoración del usuario para cada Work.
- La valoración del usuario para la lista.
- Las páginas del Work solicitado.
- Los datos agregados de valoración de la lista.

Crear o ampliar únicamente las operaciones necesarias. Actualizar `repositories.md` si corresponde.

### 2. Servicios

Implementar la operación de aplicación que construya el contexto completo del lector.

La respuesta debe incluir:

- Identificador, nombre, descripción, tipo, color y portada de la lista, según los campos disponibles en los contratos existentes.
- Cantidad de Works y porcentaje de progreso de la lista.
- Valoración promedio y cantidad de valoraciones de la lista.
- `currentWorkId`.
- Valoración del usuario para la lista, si existe.
- Todos los Works de la lista en orden de `Position`.
- Para cada Work: posición, datos necesarios para identificarlo, portada, progreso porcentual, última página registrada y valoración del usuario, si existe.
- Identificador y páginas del Work solicitado.
- Página actual registrada para ese Work.
- Valoración del usuario para el Work solicitado, si existe.

Respetar las siguientes reglas:

- El progreso de páginas pertenece al usuario y al Work, independientemente de la lista desde la cual se acceda.
- Si el usuario no tiene progreso registrado para un Work, utilizar la primera página como inicio de lectura según el contrato existente.
- `CurrentWork` se resuelve según US-0035. Si no es válido, utilizar el primer Work de la lista por `Position`, sin persistir automáticamente el fallback.
- La validación de pertenencia debe comprobar que `workId` corresponde a un elemento de `listId`.
- Si la lista no contiene Works, no inventar un Work actual.
- No duplicar la lógica de progreso ni la de valoración de Works.

Actualizar `services.md` y la documentación específica del servicio, si corresponde.

### 3. Endpoints

Crear:

`GET /api/reading/lists/{listId}/work/{workId}`

- Aplicar los mecanismos de autenticación y autorización existentes.
- Utilizar el formato de respuesta estándar del proyecto.
- Validar la existencia de la lista y del Work.
- Validar que el Work pertenece a la lista.
- Utilizar los códigos de respuesta y el manejo de errores establecidos por el proyecto.
- Actualizar `endpoints.md` y la documentación específica del endpoint, si corresponde.

## Restricciones

- No modificar el dominio.
- No crear progreso de páginas separado por lista.
- No cambiar el progreso individual de un Work.
- No duplicar el endpoint de páginas existente ni el mecanismo de valoración de Works.
- No modificar el orden de los Works.
- No persistir automáticamente el fallback del Work actual.
- No introducir campos ficticios ni alterar los contratos existentes fuera de lo requerido.

## Criterios de aceptación

- El endpoint entrega el contexto necesario para renderizar el lector de listas.
- Los Works se devuelven ordenados por `Position`.
- El progreso y las valoraciones corresponden al usuario autenticado.
- El progreso de un Work es el mismo al acceder desde distintas listas.
- Se valida la pertenencia del Work a la lista.
- Se resuelven correctamente los casos sin progreso y sin Works.
- Se reutiliza la implementación existente siempre que corresponda.
- La documentación queda actualizada y la implementación compila.

## Template de lo que debe devolver

{
    "success": true,
    "message": "OK",
    "code": 200,
    "payload": {
        "id": 2, //lista que estoy leyendo (/api/reading/lists/{2}/work/{17})
        "name": "Fly",
        "listTypeId": 338,
        "listTypeName": "Orden de lectura",
        "description": "Tres adolescentes descubren una droga de diseño que les otorga el superpoder de volar. Sin embargo, la adicción los arrastra a una espiral de autodestrucción, secretos oscuros y crímenes sangrientos, demostrando que en su mundo los supuestos superhéroes no existen.",
        "color": "#6A0DAD",
        "urlCover": "/images/1513",
        "workCount": 10,
        "readingProgressPercentage": 20,
        "averageRating": null,
        "ratingCount": 0,
		  "currentWorkId": 17, //Este es el work que estoy leyendo (/api/reading/lists/{2}/work/{17})
		  "myRating": { //rating de la lista (si ya voté tiene info, si no, null)
            "stars": 5,
            "review": "Genial"
        },
        "works": [ //Listado de obras ordenados de la lista, necesario para las miniaturas.
            {
                "position": 0, //para el orden de las miniaturas
                "work": {
                    "id": 17, //para cuando lo acceda, si lo selecciono me lleva a (/api/reading/lists/{2}/work/{17})
                    "title": "Fly Vol.1 #01", //puede servir...
                    "description": "Eddie es un joven cuya vida no va a ninguna parte hasta que un encuentro fortuito le otorga habilidades asombrosas. Sin embargo, lo que comienza como una oportunidad para cambiar su destino se convierte rápidamente en una pesadilla, mientras se ve arrastrado hacia una vida de violencia y consecuencias mortales que escapan a su control.\n\nUna historia cruda sobre un hombre con una vida mediocre que, tras adquirir habilidades extraordinarias, descubre que el verdadero poder tiene un precio oscuro y peligroso.", //puede servir
                    "urlCover": "/images/549", //necesario para la miniatura
                    "readingProgressPercentage": null //necesario para el color de la miniatura
                },
				    "currentPage": 5, //ultima página que leí de esta obra
                "myRating": { //rating de la obra
                   "stars": 5,
                   "review": "Genial"
                }
            },
            {
                "position": 1,
                "work": {
                    "id": 18,
                    "title": "Fly Vol.1 #02",
                    "description": "Tras descubrir una droga que otorga la capacidad de volar, los protagonistas deben enfrentarse a las oscuras repercusiones de sus nuevos poderes mientras su vida cambia drásticamente.\n\nEl segundo número de la serie limitada de superhéroes 'Fly', que explora las consecuencias y la moralidad detrás de la obtención de superpoderes a través de sustancias ilícitas.",
                    "urlCover": "/images/580",
                    "readingProgressPercentage": null
                },
				    "currentPage": 1, //ultima página que leí de esta obra
                "myRating": { //rating de la obra
                   "stars": 5,
                   "review": "Genial"
                }
            }
        ],
		  "workId": 19, //Work actual que estoy leyendo
		  "pages": [ //paginas del work que estoy leyendo.
			{
				"id": 597,
				"number": 1,
				"url": "/images/613"
			},
			{
				"id": 598,
				"number": 2,
				"url": "/images/614"
			},
			{
				"id": 599,
				"number": 3,
				"url": "/images/615"
			},
			{
				"id": 600,
				"number": 4,
				"url": "/images/616"
			},
			{
				"id": 601,
				"number": 5,
				"url": "/images/617"
			},
			{
				"id": 602,
				"number": 6,
				"url": "/images/618"
			},
			{
				"id": 603,
				"number": 7,
				"url": "/images/619"
			},
			{
				"id": 604,
				"number": 8,
				"url": "/images/620"
			},
			{
				"id": 605,
				"number": 9,
				"url": "/images/621"
			},
			{
				"id": 606,
				"number": 10,
				"url": "/images/622"
			},
			{
				"id": 607,
				"number": 11,
				"url": "/images/623"
			},
			{
				"id": 608,
				"number": 12,
				"url": "/images/624"
			},
			{
				"id": 609,
				"number": 13,
				"url": "/images/625"
			},
			{
				"id": 610,
				"number": 14,
				"url": "/images/626"
			},
			{
				"id": 611,
				"number": 15,
				"url": "/images/627"
			},
			{
				"id": 612,
				"number": 16,
				"url": "/images/628"
			},
			{
				"id": 613,
				"number": 17,
				"url": "/images/629"
			},
			{
				"id": 614,
				"number": 18,
				"url": "/images/630"
			},
			{
				"id": 615,
				"number": 19,
				"url": "/images/631"
			},
			{
				"id": 616,
				"number": 20,
				"url": "/images/632"
			},
			{
				"id": 617,
				"number": 21,
				"url": "/images/633"
			},
			{
				"id": 618,
				"number": 22,
				"url": "/images/634"
			},
			{
				"id": 619,
				"number": 23,
				"url": "/images/635"
			},
			{
				"id": 620,
				"number": 24,
				"url": "/images/636"
			},
			{
				"id": 621,
				"number": 25,
				"url": "/images/637"
			},
			{
				"id": 622,
				"number": 26,
				"url": "/images/638"
			},
			{
				"id": 623,
				"number": 27,
				"url": "/images/639"
			},
			{
				"id": 624,
				"number": 28,
				"url": "/images/640"
			},
			{
				"id": 625,
				"number": 29,
				"url": "/images/641"
			},
			{
				"id": 626,
				"number": 30,
				"url": "/images/642"
			},
			{
				"id": 627,
				"number": 31,
				"url": "/images/643"
			},
			{
				"id": 628,
				"number": 32,
				"url": "/images/644"
			},
			{
				"id": 629,
				"number": 33,
				"url": "/images/645"
			}
		],
		"currentPage": 3, //Pagina actual, del work que estoy leyendo, donde me debe posicionar el reader.
		"myRating": { //mi rating de la obra que estoy leyendo, necesario para el form de votación de obra (NO DE LISTA)
			"stars": 5,
			"review": "Genial"
		}
    }
}

## Git y ejecución

1. `git checkout main` → `git pull`
2. `git branch --list "feature/us-0035-api-sequential-list-reading"`

   Si existe: `git switch feature/us-0035-api-sequential-list-reading` → `git merge main`.

   Si no existe: `git switch -c feature/us-0035-api-sequential-list-reading`.

3. Implementar los cambios de esta task.
4. Revisar los cambios con `git diff`.
5. Ejecutar las validaciones disponibles para comprobar que el dominio compila y que no se introdujeron regresiones detectables en esta etapa.
6. Crear uno o más commits y realizar el push de los cambios a la rama de trabajo.
7. Incorporar el resultado de ejecución en esta misma task mediante **append**, sin sobrescribir su contenido previo.
8. Mover el archivo según `communication.md` a `finished` si se cumplen los criterios, o a `blocked` si existe un bloqueo real, documentando la causa y el trabajo pendiente.

## Resultado de ejecución

**Estado**: Cumplido — criterios de aceptación verificados.

**Qué se implementó**:
- Endpoint `GET /api/reading/lists/{listId}/work/{workId}` (controller `ListReaderController`) que devuelve el contexto completo del lector dentro de una lista.
- Operation `IListReaderService.ListReaderService.GetReaderContextAsync(listId, workId, userId)` que reúne, en una sola respuesta: metadatos de la lista (id, name, listTypeId/Name, description, color, urlCover), workCount, readingProgressPercentage de la lista (del repo de progreso de lista), averageRating + ratingCount de la lista, `currentWorkId` (resolución US-0035), `myRating` de la lista (stars/review o null); los `WorkListItem` ordenados por `Position` con readingProgressPercentage por work, currentPage y `myRating` de cada work; el `workId` solicitado con sus `Page` (number + protected imageUrl via `EF.Property<long>` para FK shadow), `currentPage` y `myRating` del work.

**Qué se cambió**:
- `api/Api/Controllers/ListReaderController.cs`: endpoint + validación de pertenencia (workId ∈ listId) y códigos 200/404.
- `api/Application/Interfaces/IListReaderService.cs` + `api/Application/Services/ListReaderService.cs`: orquestación reutilizando `IWorkService.GetReaderPagesAsync`, `IWorkReadingProgressRepository`, `IWorkRatingRepository` y `IListReadingProgressRepository`/`IListRatingRepository`.
- `api/Application/DTOs/ListReaderContextDto.cs`: contrato de respuesta (payload template del task).
- `Program.cs`: registro DI de `IListReaderService`.
- `endpoints.md`, `services.md`, `repositories.md`: documentación sincronizada con rutas/verbos/contratos.

**Decisiones relevantes**:
- Se reutilizó el mecanismo existente de páginas (`GetReaderPagesAsync`) y de progreso/rating de Works: **no** se duplicó la lógica ni el endpoint de páginas.
- `currentWorkId` resuelto con la misma regla de 0307 (CurrentWork válido de la lista; fallback al primer work por `Position`; null en lista vacía) y **sin persistir** el fallback.
- `currentPage` (última página leída del work) proviene del progreso de páginas del usuario/Work (shared entre listas), no del contexto de lista.
- `userId` resuelto exclusivamente del claim `sub` (auth obligatoria).

**Notas**:
- Validaciones: build 0 errores; `WorkListReaderIntegrationTests` (10 casos) cubren currentWorkId, ordering por Position, progreso aislado por usuario, shared page-progress, pertenencia work→list 404, lista vacía y ausencia de progreso.
- Suite `tests/Infrastructure.Tests` 389/389 pass.
- Integrado en `main` (commit `93f4904`, fast-forward; branch `feature/us-0035-api-sequential-list-reading` integrada y borrada).