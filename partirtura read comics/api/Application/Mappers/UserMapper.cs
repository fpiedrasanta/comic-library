using Application.DTOs;
using Domain.Entities;

namespace Application.Mappers;

public static class UserMapper
{
    public static UserListItemDto ToListItemDto(this User user, string? countryName, int banCount, bool isBanned)
    {
        var avatarUrl = user.Avatar != null ? $"/images/{user.Avatar.Id}" : user.AvatarUrl;

        return new UserListItemDto(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            avatarUrl,
            countryName,
            user.IsActive,
            isBanned,
            banCount,
            user.CreatedAt);
    }
}
