using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Application.Mappers;
using Domain.Entities;
using Domain.Exceptions;

namespace Application.Services;

public class UserQueryService(
    IUnitOfWork unitOfWork) : IUserQueryService
{
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    public async Task<ListResponse<UserListItemDto>> GetPagedAsync(GetUsersRequest request, CancellationToken cancellationToken = default)
    {
        if (request.currentPage < 1) request.currentPage = 1;
        if (request.pageSize < 1) request.pageSize = 12;
        if (request.pageSize > 50) request.pageSize = 50;
        if (string.IsNullOrWhiteSpace(request.orderDir)) request.orderDir = SortDirection.ASC;

        var allowedOrderBy = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "LastName",
            "CreatedAt",
            "BanCount"
        };

        if (!string.IsNullOrWhiteSpace(request.orderBy) && !allowedOrderBy.Contains(request.orderBy))
        {
            throw new ValidationException("El campo de ordenamiento no es válido.");
        }

        (IReadOnlyList<User> users, int totalCount) = await _unitOfWork.UserRepository.GetPagedAsync(request, cancellationToken);

        List<UserListItemDto> userListItemDtos = new List<UserListItemDto>();
        
        //TODO - Fede: ver bans.
        foreach(User user in users)
        {
            userListItemDtos.Add(new UserListItemDto(
                user.Id, 
                user.FirstName, 
                user.LastName, 
                user.Email,
                user.AvatarUrl,
                user.GetCountryName(),
                user.IsActive,
                false,
                0,
                user.CreatedAt));
        }
        
        var totalPages = (int)Math.Ceiling(totalCount / (double)request.pageSize);

        return new ListResponse<UserListItemDto>(
            request.currentPage,
            request.currentPage < totalPages,
            request.currentPage > 1,
            totalPages,
            request.pageSize,
            request.currentPage < totalPages ? request.currentPage + 1 : null,
            request.currentPage > 1 ? request.currentPage - 1 : null,
            totalCount,
            userListItemDtos);
    }

    public async Task<ListResponse<UserListItemDto>> GetActiveForBanSelectionAsync(GetUsersForBanSelectionRequest request, CancellationToken cancellationToken = default)
    {
        if (request.currentPage < 1) request.currentPage = 1;
        if (request.pageSize < 1) request.pageSize = 48;
        if (request.pageSize > 100) request.pageSize = 100;
        if (string.IsNullOrWhiteSpace(request.orderDir)) request.orderDir = SortDirection.DESC;

        var allowedOrderBy = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "CreatedAt",
            "FirstName",
            "LastName",
            "Email"
        };

        if (!string.IsNullOrWhiteSpace(request.orderBy) && !allowedOrderBy.Contains(request.orderBy))
        {
            throw new ValidationException("El campo de ordenamiento no es válido.");
        }

        (IReadOnlyList<User> users, int totalCount) = await _unitOfWork.UserRepository.GetActiveForBanSelectionAsync(request, cancellationToken);

        List<UserListItemDto> usersDto = new List<UserListItemDto>();

        //TODO - Fede: ver bans.
        foreach(User user in users)
        {
            usersDto.Add(new UserListItemDto(
                user.Id, 
                user.FirstName, 
                user.LastName, 
                user.Email, 
                user.AvatarUrl, 
                user.GetCountryName(), 
                user.IsActive, 
                false, 
                0, 
                user.CreatedAt));
        }
        
        var totalPages = (int)Math.Ceiling(totalCount / (double)request.pageSize);

        return new ListResponse<UserListItemDto>(
            request.currentPage,
            request.currentPage < totalPages,
            request.currentPage > 1,
            totalPages,
            request.pageSize,
            request.currentPage < totalPages ? request.currentPage + 1 : null,
            request.currentPage > 1 ? request.currentPage - 1 : null,
            totalCount,
            usersDto);
    }

    public async Task<UserDetailDto> GetDetailAsync(long userId, CancellationToken cancellationToken = default)
    {
        if (userId <= 0)
        {
            throw new ValidationException("El identificador del usuario es obligatorio.");
        }

        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId, cancellationToken)
            ?? throw new BusinessNotFoundException("El usuario no existe.");

        var avatarUrl = user.Avatar != null ? $"/images/{user.Avatar.Id}" : user.AvatarUrl;

        return new UserDetailDto(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            avatarUrl,
            user.Nationality?.Name);
    }
}
