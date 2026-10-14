using Domain.Entities;

namespace Application.DTOs;

public record UserPagedItem(User User, int BanCount, bool IsBanned);
