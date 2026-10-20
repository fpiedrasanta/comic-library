using Domain.Entities;

namespace Application.DTOs;

public record PersonalListMembershipData(
    long Id,
    string Name,
    string? Description,
    string? Color,
    Image? Cover,
    int WorkCount,
    bool ContainsWork);
