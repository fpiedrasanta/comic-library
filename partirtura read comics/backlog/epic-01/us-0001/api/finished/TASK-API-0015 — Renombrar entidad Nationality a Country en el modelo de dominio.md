Task ID: TASK-API-0015
Title: Renombrar entidad Nationality a Country en el modelo de dominio
Description: Renombrar la entidad Nationality por Country en todo el backend. La propiedad de navegacion en User mantiene el nombre Nationality. El foreign key pasa a llamarse CountryId. Se deben actualizar entidades, configuraciones EF, repositories, servicios, mappers, DTOs, controllers y documentacion del proyecto.
Expected result: El modelo de dominio utiliza Country como entidad. User sigue exponiendo Nationality como propiedad de navegacion. La API mantiene el contrato existente sin cambios funcionales.
Relevant context: backend-architecture.md, backend-coding-rules.md, domain.md, services.md, repositories.md, endpoints.md, communication.md
Dependencies: TASK-API-0010
Acceptance criteria:
- La entidad Nationality dejo de existir y fue reemplazada por Country en Domain/Entities.
- User.Entity tiene CountryId como foreign key.
- User.Entity mantiene la propiedad de navegacion llamada Nationality.
- INationalityRepository fue renombrada a ICountryRepository.
- NationalityRepository fue renombrado a CountryRepository.
- NationalityConfiguration fue renombrada a CountryConfiguration.
- NationalityService fue renombrado a CountryService.
- NationalityMapper fue renombrado a CountryMapper.
- NationalityDto fue renombrado a CountryDto.
- El controller de nacionalidades utiliza CountryService y CountryRepository.
- Endpoints.md, domain.md, services.md y repositories.md reflejan el nuevo nombre Country.
- No hay referencias a Nationality como entidad en codigo o documentacion, salvo la propiedad de navegacion en User.
- La API sigue devolviendo los mismos datos; el cambio es interno de modelo.
- La migration EF Core refleja el renombrado de tabla y campos cuando corresponda.

# Execution Result

Status: finished

Changes made:
- Created Domain/Entities/Country.cs
- Updated Domain/Entities/User.cs: NationalityId -> CountryId, navigation property Nationality kept
- Created Infrastructure/Persistence/Configurations/CountryConfiguration.cs
- Updated Infrastructure/Persistence/Configurations/UserConfiguration.cs: FK updated to CountryId
- Created Infrastructure/Repositories/CountryRepository.cs
- Created Application/Interfaces/ICountryRepository.cs
- Created Application/Services/CountryService.cs
- Created Application/Mappers/CountryMapper.cs
- Created Application/DTOs/CountryDto.cs
- Updated Api/Controllers/NationalitiesController.cs: uses CountryService/CountryRepository
- Updated Api/Program.cs: DI registrations updated
- Updated Infrastructure/Persistence/ApplicationDbContext.cs: DbSet Countries, CountryConfiguration applied
- Removed old Nationality files (entity, config, repository, interfaces, service, mapper, dto)
- Updated project documentation: domain.md, services.md, repositories.md, endpoints.md
- Created EF Core migration: 20260814181358_RenameNationalityToCountry
- Build succeeded with 0 errors

Notes:
- The endpoint /api/nationalities keeps its route for backwards compatibility.
- The navigation property on User remains named Nationality as requested.
- DTOs for API requests (RegisterUserApiRequest, RegisterUserFormRequest) keep NationalityId field name to preserve API contract.
- Migration renames table Nationalities -> Countries and column NationalityId -> CountryId.