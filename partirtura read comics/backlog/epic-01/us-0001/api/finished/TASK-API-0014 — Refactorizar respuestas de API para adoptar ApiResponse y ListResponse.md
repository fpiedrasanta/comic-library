Task ID: TASK-API-0014
Title: Refactorizar respuestas de API para adoptar ApiResponse y ListResponse
Description: Actualizar todos los endpoints existentes para que devuelvan ApiResponse<T> de forma uniforme. Crear ListResponse<T> en Application/DTOs para representar colecciones paginadas. Los servicios devuelven ListResponse<T> cuando el resultado es una coleccion paginada, o DTOs simples cuando es un solo recurso. El controller envuelve el resultado del servicio en ApiResponse<T>. Actualizar el endpoint de nacionalidades como primera implementacion de paginacion con pageSize=12, currentPage=1, orderBy vacio y orderDir ASC.
Expected result: Todos los endpoints responden con ApiResponse<T>. El frontend consume json.payload sin interpretar estructuras arbitrarias. Los servicios encapsulan la logica de paginacion y mapeo a DTOs.
Relevant context: backend-architecture.md, backend-coding-rules.md, endpoints.md, communication.md
Dependencies: TASK-API-0010
Acceptance criteria:
- Existe ListResponse<T> en Application/DTOs.
- Existe ApiResponse<T> en Api/DTOs (ya existe).
- GET /api/nationalities acepta parametros de paginacion y ordenamiento.
- GET /api/nationalities devuelve ApiResponse<ListResponse<NationalityDto>>.
- Los controllers existentes devuelven ApiResponse<T> para cualquier tipo de respuesta.
- Los servicios devuelven ListResponse<T> para colecciones paginadas.
- Los servicios devuelven DTOs simples para recursos individuales.
- No se exponen entidades de dominio directamente desde controllers.
- pageSize tiene un maximo de 50.
- pageSize por defecto es 12.
- currentPage por defecto es 1.
- orderBy por defecto es vacio.
- orderDir por defecto es ASC.

# Execution Result

Status: finished

Changes made:
- Created Application/DTOs/ListResponse.cs
- Updated Application/Interfaces/ICountryRepository.cs: added GetPagedAsync
- Updated Application/Services/CountryService.cs: added GetPagedAsync, delegates pagination to repository
- Updated Infrastructure/Repositories/CountryRepository.cs: implemented GetPagedAsync with ordering, pagination and mapping
- Updated Api/Controllers/NationalitiesController.cs: returns ApiResponse<ListResponse<CountryDto>> with query parameters
- Updated project documentation: endpoints.md, services.md, repositories.md
- Build succeeded with 0 errors

Notes:
- All endpoints return ApiResponse<T>.
- Collections return ApiResponse<ListResponse<TDto>>.
- Single resources return ApiResponse<Dto>.
- Pagination defaults: pageSize=12, currentPage=1, orderBy=null, orderDir=ASC.
- pageSize max is 50.
- Ordering supports code, name, isactive.