using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;

namespace Application.Services;

public class ListTypeService : IListTypeService
{
    private readonly IUnitOfWork _unitOfWork;

    public ListTypeService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ListResponse<ListTypeListItemDto>> GetPagedAsync(GetListTypesRequest request, CancellationToken cancellationToken = default)
    {
        var currentPage = request.currentPage;
        var pageSize = request.pageSize;
        PaginationGuard.Normalize(PaginationGuard.DefaultPageSize, PaginationGuard.MaxPageSize, ref currentPage, ref pageSize);

        (IReadOnlyList<ListType> listTypes, int totalCount) = await _unitOfWork.ListTypeRepository.GetPagedAsync(
            currentPage, pageSize, request.search, request.isActive, request.orderBy, request.orderDir, cancellationToken: cancellationToken);

        var items = listTypes.Select(lt => new ListTypeListItemDto(lt.Id, lt.Name, lt.IsActive)).ToList();

        return PaginationGuard.Build(currentPage, pageSize, totalCount, items);
    }

    public async Task<ListResponse<ListTypeFilterDto>> GetPublicPagedAsync(ListRequest request, CancellationToken cancellationToken = default)
    {
        var currentPage = request.currentPage;
        var pageSize = request.pageSize;
        PaginationGuard.Normalize(PaginationGuard.DefaultPageSize, PaginationGuard.CatalogFilterMaxPageSize, ref currentPage, ref pageSize);

        var (listTypes, totalCount) = await _unitOfWork.ListTypeRepository.GetPagedAsync(
            currentPage, pageSize, request.search, true, request.orderBy, request.orderDir, cancellationToken);

        var items = listTypes.Select(lt => new ListTypeFilterDto(lt.Id, lt.Name)).ToList();

        return PaginationGuard.Build(currentPage, pageSize, totalCount, items);
    }

    public async Task<ListTypeListItemDto> CreateAsync(CreateListTypeRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ValidationException("El nombre es obligatorio.");
        }

        var name = request.Name.Trim();

        var existing = await _unitOfWork.ListTypeRepository.GetByNameAsync(name, cancellationToken);
        if (existing is not null)
        {
            throw new BusinessConflictException("Ya existe un tipo de lista con ese nombre.");
        }

        var listType = new ListType
        {
            Name = name,
            IsActive = true
        };

        await _unitOfWork.ListTypeRepository.AddAsync(listType, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ListTypeListItemDto(listType.Id, listType.Name, listType.IsActive);
    }

    public async Task<ListType> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var listType = await _unitOfWork.ListTypeRepository.GetByIdAsync(id, cancellationToken);
        if (listType is null)
        {
            throw new BusinessNotFoundException("El tipo de lista no existe.");
        }

        return listType;
    }

    public async Task UpdateAsync(long id, UpdateListTypeRequest request, CancellationToken cancellationToken = default)
    {
        var listType = await _unitOfWork.ListTypeRepository.GetByIdAsync(id, cancellationToken);
        if (listType is null)
        {
            throw new BusinessNotFoundException("El tipo de lista no existe.");
        }

        var name = request.Name.Trim();

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ValidationException("El nombre es obligatorio.");
        }

        var existing = await _unitOfWork.ListTypeRepository.GetByNameAsync(name, cancellationToken);
        if (existing is not null && existing.Id != id)
        {
            throw new BusinessConflictException("Ya existe un tipo de lista con ese nombre.");
        }

        listType.Name = name;

        await _unitOfWork.ListTypeRepository.UpdateAsync(listType, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task DeactivateAsync(long id, CancellationToken cancellationToken = default)
    {
        var listType = await _unitOfWork.ListTypeRepository.GetByIdAsync(id, cancellationToken);
        if (listType is null)
        {
            throw new BusinessNotFoundException("El tipo de lista no existe.");
        }

        if (!listType.IsActive)
        {
            return;
        }

        listType.IsActive = false;

        await _unitOfWork.ListTypeRepository.UpdateAsync(listType, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ActivateAsync(long id, CancellationToken cancellationToken = default)
    {
        var listType = await _unitOfWork.ListTypeRepository.GetByIdAsync(id, cancellationToken);
        if (listType is null)
        {
            throw new BusinessNotFoundException("El tipo de lista no existe.");
        }

        if (listType.IsActive)
        {
            return;
        }

        listType.IsActive = true;

        await _unitOfWork.ListTypeRepository.UpdateAsync(listType, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
