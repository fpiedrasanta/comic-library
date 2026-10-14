using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface IPersonService
{
    Task<ListResponse<PersonListItemDto>> GetPagedAsync(GetPersonsRequest request, CancellationToken cancellationToken = default);
    Task<PersonListItemDto> CreatePersonAsync(CreatePersonRequest request, CancellationToken cancellationToken = default);
    Task<Person?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<Person> EnsurePersonAsync(string name, CancellationToken cancellationToken = default);
    Task<PersonListItemDto> UpdatePersonAsync(long personId, UpdatePersonRequest request, CancellationToken cancellationToken = default);
    Task DeactivatePersonAsync(long personId, CancellationToken cancellationToken = default);
    Task ActivatePersonAsync(long personId, CancellationToken cancellationToken = default);
}
