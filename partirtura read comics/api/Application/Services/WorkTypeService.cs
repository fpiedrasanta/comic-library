using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;

namespace Application.Services;

public class WorkTypeService : IWorkTypeService
{
    private readonly IUnitOfWork _unitOfWork;

    public WorkTypeService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ListResponse<WorkTypeListItemDto>> GetPagedAsync(GetWorkTypesRequest request, CancellationToken cancellationToken = default)
    {
        var currentPage = request.currentPage;
        var pageSize = request.pageSize;
        PaginationGuard.Normalize(PaginationGuard.DefaultPageSize, PaginationGuard.MaxPageSize, ref currentPage, ref pageSize);

        (IReadOnlyList<WorkType> workTypes, int totalCount) = await _unitOfWork.WorkTypeRepository.GetPagedAsync(
            currentPage, pageSize, request.search, request.isActive, request.orderBy, request.orderDir, cancellationToken: cancellationToken);

        var items = workTypes.Select(wt => new WorkTypeListItemDto(wt.Id, wt.Name, wt.IsActive)).ToList();

        return PaginationGuard.Build(currentPage, pageSize, totalCount, items);
    }

    public async Task<ListResponse<WorkTypeFilterDto>> GetPublicPagedAsync(ListRequest request, CancellationToken cancellationToken = default)
    {
        var currentPage = request.currentPage;
        var pageSize = request.pageSize;
        PaginationGuard.Normalize(PaginationGuard.DefaultPageSize, PaginationGuard.CatalogFilterMaxPageSize, ref currentPage, ref pageSize);

        var (workTypes, totalCount) = await _unitOfWork.WorkTypeRepository.GetPagedAsync(
            currentPage, pageSize, request.search, true, request.orderBy, request.orderDir, cancellationToken);

        var items = workTypes.Select(wt => new WorkTypeFilterDto(wt.Id, wt.Name)).ToList();

        return PaginationGuard.Build(currentPage, pageSize, totalCount, items);
    }

    public async Task<WorkTypeListItemDto> CreateWorkTypeAsync(CreateWorkTypeRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ValidationException("El nombre es obligatorio.");
        }

        var name = request.Name.Trim();

        var existing = await _unitOfWork.WorkTypeRepository.GetByNameAsync(name, cancellationToken);
        if (existing is not null)
        {
            throw new BusinessConflictException("Ya existe un tipo de obra con ese nombre.");
        }

        var workType = new WorkType
        {
            Name = name,
            IsActive = true
        };

        await _unitOfWork.WorkTypeRepository.AddAsync(workType, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new WorkTypeListItemDto(workType.Id, workType.Name, workType.IsActive);
    }

    public async Task<WorkType> GetWorkTypeByIdAsync(long workTypeId, CancellationToken cancellationToken = default)
    {
        var workType = await _unitOfWork.WorkTypeRepository.GetByIdAsync(workTypeId, cancellationToken);
        if (workType is null)
        {
            throw new BusinessNotFoundException("El tipo de obra no existe.");
        }

        return workType;
    }

    public async Task<WorkType> UpdateWorkTypeAsync(long workTypeId, UpdateWorkTypeRequest request, CancellationToken cancellationToken = default)
    {
        var workType = await _unitOfWork.WorkTypeRepository.GetByIdAsync(workTypeId, cancellationToken);
        if (workType is null)
        {
            throw new BusinessNotFoundException("El tipo de obra no existe.");
        }

        var name = request.Name.Trim();

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ValidationException("El nombre es obligatorio.");
        }

        var existing = await _unitOfWork.WorkTypeRepository.GetByNameAsync(name, cancellationToken);
        if (existing is not null && existing.Id != workTypeId)
        {
            throw new BusinessConflictException("Ya existe un tipo de obra con ese nombre.");
        }

        workType.Name = name;

        await _unitOfWork.WorkTypeRepository.UpdateAsync(workType, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return workType;
    }

    public async Task DeactivateWorkTypeAsync(long workTypeId, CancellationToken cancellationToken = default)
    {
        var workType = await _unitOfWork.WorkTypeRepository.GetByIdAsync(workTypeId, cancellationToken);
        if (workType is null)
        {
            throw new BusinessNotFoundException("El tipo de obra no existe.");
        }

        if (!workType.IsActive)
        {
            return;
        }

        workType.IsActive = false;

        await _unitOfWork.WorkTypeRepository.UpdateAsync(workType, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ActivateWorkTypeAsync(long workTypeId, CancellationToken cancellationToken = default)
    {
        var workType = await _unitOfWork.WorkTypeRepository.GetByIdAsync(workTypeId, cancellationToken);
        if (workType is null)
        {
            throw new BusinessNotFoundException("El tipo de obra no existe.");
        }

        if (workType.IsActive)
        {
            return;
        }

        workType.IsActive = true;

        await _unitOfWork.WorkTypeRepository.UpdateAsync(workType, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}