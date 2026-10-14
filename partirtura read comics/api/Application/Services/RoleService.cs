using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;

namespace Application.Services;

public class RoleService : IRoleService
{
    private readonly IUnitOfWork _unitOfWork;

    public RoleService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ListResponse<RoleListItemDto>> GetPagedAsync(GetRolesRequest request, CancellationToken cancellationToken = default)
    {
        var currentPage = request.currentPage;
        var pageSize = request.pageSize;
        PaginationGuard.Normalize(PaginationGuard.DefaultPageSize, PaginationGuard.MaxPageSize, ref currentPage, ref pageSize);

        (IReadOnlyList<Role> roles, int totalCount) = await _unitOfWork.RoleRepository.GetPagedAsync(
            currentPage, pageSize, request.search, request.isActive, request.orderBy, request.orderDir, cancellationToken: cancellationToken);

        var items = roles.Select(r => new RoleListItemDto(
            r.Id,
            r.Name,
            r.IsActive)).ToList();

        return PaginationGuard.Build(currentPage, pageSize, totalCount, items);
    }

    public async Task<RoleListItemDto> CreateRoleAsync(CreateRoleRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ValidationException("El nombre es obligatorio.");
        }

        var name = request.Name.Trim();

        var existing = await GetByNameAsync(name, cancellationToken);
        if (existing is not null)
        {
            throw new BusinessConflictException("Ya existe un rol con el mismo nombre.");
        }

        var role = new Role
        {
            Name = name,
            IsActive = true
        };

        await _unitOfWork.RoleRepository.AddAsync(role, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new RoleListItemDto(role.Id, role.Name, role.IsActive);
    }

    public async Task<Role?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return null;
        }

        return await _unitOfWork.RoleRepository.GetByNameAsync(name.Trim(), cancellationToken);
    }

    public async Task<Role> EnsureRoleAsync(string name, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ValidationException("El nombre del rol es obligatorio.");
        }

        var trimmed = name.Trim();
        var existing = await _unitOfWork.RoleRepository.GetByNameAsync(trimmed, cancellationToken);
        if (existing is not null)
        {
            return existing;
        }

        var role = new Role
        {
            Name = trimmed,
            IsActive = true
        };

        await _unitOfWork.RoleRepository.AddAsync(role, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return role;
    }

    public async Task<Role> GetRoleByIdAsync(long roleId, CancellationToken cancellationToken = default)
    {
        var role = await _unitOfWork.RoleRepository.GetByIdAsync(roleId, cancellationToken);
        if (role is null)
        {
            throw new BusinessNotFoundException("El rol no existe.");
        }

        return role;
    }

    public async Task<Role> UpdateRoleAsync(long roleId, UpdateRoleRequest request, CancellationToken cancellationToken = default)
    {
        var role = await _unitOfWork.RoleRepository.GetByIdAsync(roleId, cancellationToken);
        if (role is null)
        {
            throw new BusinessNotFoundException("El rol no existe.");
        }

        var name = request.Name.Trim();

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ValidationException("El nombre es obligatorio.");
        }

        var existing = await _unitOfWork.RoleRepository.GetByNameAsync(name, cancellationToken);
        if (existing is not null && existing.Id != roleId)
        {
            throw new BusinessConflictException("Ya existe un rol con el mismo nombre.");
        }

        role.Name = name;

        await _unitOfWork.RoleRepository.UpdateAsync(role, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return role;
    }

    public async Task DeactivateRoleAsync(long roleId, CancellationToken cancellationToken = default)
    {
        var role = await _unitOfWork.RoleRepository.GetByIdAsync(roleId, cancellationToken);
        if (role is null)
        {
            throw new BusinessNotFoundException("El rol no existe.");
        }

        if (!role.IsActive)
        {
            return;
        }

        role.IsActive = false;

        await _unitOfWork.RoleRepository.UpdateAsync(role, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ActivateRoleAsync(long roleId, CancellationToken cancellationToken = default)
    {
        var role = await _unitOfWork.RoleRepository.GetByIdAsync(roleId, cancellationToken);
        if (role is null)
        {
            throw new BusinessNotFoundException("El rol no existe.");
        }

        if (role.IsActive)
        {
            return;
        }

        role.IsActive = true;

        await _unitOfWork.RoleRepository.UpdateAsync(role, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
