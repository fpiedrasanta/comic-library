using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;

namespace Application.Services;

public class PersonService : IPersonService
{
    private readonly IUnitOfWork _unitOfWork;

    public PersonService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ListResponse<PersonListItemDto>> GetPagedAsync(GetPersonsRequest request, CancellationToken cancellationToken = default)
    {
        var currentPage = request.currentPage;
        var pageSize = request.pageSize;
        PaginationGuard.Normalize(PaginationGuard.DefaultPageSize, PaginationGuard.MaxPageSize, ref currentPage, ref pageSize);

        (IReadOnlyList<Person> persons, int totalCount) = await _unitOfWork.PersonRepository.GetPagedAsync(
            currentPage, pageSize, request.search, request.isActive, cancellationToken);

        var items = persons.Select(p => new PersonListItemDto(
            p.Id,
            p.Name,
            p.IsActive)).ToList();

        return PaginationGuard.Build(currentPage, pageSize, totalCount, items);
    }

    public async Task<PersonListItemDto> CreatePersonAsync(CreatePersonRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ValidationException("El nombre es obligatorio.");
        }

        var name = request.Name.Trim();

        var existing = await GetByNameAsync(name, cancellationToken);
        if (existing is not null)
        {
            throw new BusinessConflictException("Ya existe una persona con el mismo nombre.");
        }

        var person = new Person
        {
            Name = name,
            IsActive = true
        };

        await _unitOfWork.PersonRepository.AddAsync(person, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new PersonListItemDto(person.Id, person.Name, person.IsActive);
    }

    public async Task<Person?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return null;
        }

        return await _unitOfWork.PersonRepository.GetByNameAsync(name.Trim(), cancellationToken);
    }

    public async Task<Person> EnsurePersonAsync(string name, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ValidationException("El nombre de la persona es obligatorio.");
        }

        var trimmed = name.Trim();
        var existing = await _unitOfWork.PersonRepository.GetByNameAsync(trimmed, cancellationToken);
        if (existing is not null)
        {
            return existing;
        }

        var person = new Person
        {
            Name = trimmed,
            IsActive = true
        };

        await _unitOfWork.PersonRepository.AddAsync(person, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return person;
    }

    public async Task<PersonListItemDto> UpdatePersonAsync(long personId, UpdatePersonRequest request, CancellationToken cancellationToken = default)
    {
        if (personId <= 0)
        {
            throw new ValidationException("El identificador de la persona es obligatorio.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ValidationException("El nombre es obligatorio.");
        }

        var person = await _unitOfWork.PersonRepository.GetByIdAsync(personId, cancellationToken);
        if (person is null)
        {
            throw new BusinessNotFoundException("La persona no existe.");
        }

        var name = request.Name.Trim();

        var existing = await _unitOfWork.PersonRepository.GetByNameAsync(name, cancellationToken);
        if (existing is not null && existing.Id != personId)
        {
            throw new BusinessConflictException("Ya existe una persona con el mismo nombre.");
        }

        person.Name = name;

        await _unitOfWork.PersonRepository.UpdateAsync(person, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new PersonListItemDto(person.Id, person.Name, person.IsActive);
    }

    public async Task DeactivatePersonAsync(long personId, CancellationToken cancellationToken = default)
    {
        if (personId <= 0)
        {
            throw new ValidationException("El identificador de la persona es obligatorio.");
        }

        var person = await _unitOfWork.PersonRepository.GetByIdAsync(personId, cancellationToken);
        if (person is null)
        {
            throw new BusinessNotFoundException("La persona no existe.");
        }

        if (!person.IsActive)
        {
            return;
        }

        person.IsActive = false;
        await _unitOfWork.PersonRepository.UpdateAsync(person, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ActivatePersonAsync(long personId, CancellationToken cancellationToken = default)
    {
        if (personId <= 0)
        {
            throw new ValidationException("El identificador de la persona es obligatorio.");
        }

        var person = await _unitOfWork.PersonRepository.GetByIdAsync(personId, cancellationToken);
        if (person is null)
        {
            throw new BusinessNotFoundException("La persona no existe.");
        }

        if (person.IsActive)
        {
            return;
        }

        person.IsActive = true;
        await _unitOfWork.PersonRepository.UpdateAsync(person, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
