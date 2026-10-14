using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;
using System.Linq;

namespace Application.Services;

public class BanService : IBanService
{
    private readonly IUnitOfWork _unitOfWork;

    public BanService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ListResponse<BanListItemDto>> GetPagedAsync(GetBansRequest request, CancellationToken cancellationToken = default)
    {
        if (request.currentPage < 1) request.currentPage = 1;
        if (request.pageSize < 1) request.pageSize = 48;
        if (request.pageSize > 100) request.pageSize = 100;
        if (string.IsNullOrWhiteSpace(request.orderDir)) request.orderDir = SortDirection.DESC;

        (IReadOnlyList<Ban> items, int totalCount) = await _unitOfWork.BanRepository.GetPagedAsync(request, cancellationToken);

        List<BanListItemDto> banListItemDtos = new List<BanListItemDto>();

        foreach(Ban ban in items)
        {
            banListItemDtos.Add(new BanListItemDto(
                ban.Id, 
                ban.GetUserId(), 
                ban.GetUserFirstName(), 
                ban.GetUserLasName(), 
                ban.GetUserEmail(), 
                ban.GetUserAvatarUrl(), 
                ban.CreatedAt, 
                ban.StartDate, 
                ban.EndDate, 
                ban.Reason, 
                ban.IsActive, 
                ban.GetStatus()));
        }

        return BuildListResponse(request.currentPage, request.pageSize, totalCount, banListItemDtos);
    }

    private ListResponse<T> BuildListResponse<T>(int currentPage, int pageSize, int totalCount, IReadOnlyList<T> items)
    {
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        return new ListResponse<T>(
            currentPage,
            currentPage < totalPages,
            currentPage > 1,
            totalPages,
            pageSize,
            currentPage < totalPages ? currentPage + 1 : null,
            currentPage > 1 ? currentPage - 1 : null,
            totalCount,
            items.ToList());
    }

    public async Task<BanDetailDto> GetByIdAsync(long banId, CancellationToken cancellationToken = default)
    {
        if (banId <= 0)
        {
            throw new ValidationException("El identificador del ban es obligatorio.");
        }

        var ban = await _unitOfWork.BanRepository.GetByIdAsync(banId, cancellationToken);
        if (ban is null)
        {
            throw new BusinessNotFoundException("El ban no existe.");
        }

        string? avatarUrl = null;
        if (ban.User.Avatar is not null)
        {
            avatarUrl = $"/images/{ban.User.Avatar.Id}";
        }
        else if (!string.IsNullOrWhiteSpace(ban.User.AvatarUrl))
        {
            avatarUrl = ban.User.AvatarUrl;
        }

        return new BanDetailDto(
            ban.Id,
            ban.User.Id,
            ban.User.FirstName,
            ban.User.LastName,
            ban.User.Email,
            avatarUrl,
            ban.StartDate,
            ban.EndDate,
            ban.Reason,
            ban.IsActive,
            ban.CreatedAt);
    }

    public async Task<CreateBanResponse> CreateBanAsync(CreateBanRequest request, CancellationToken cancellationToken = default)
    {
        if (request.StartDate == default)
        {
            throw new ValidationException("La fecha de inicio es obligatoria.");
        }

        if (request.EndDate.HasValue && request.EndDate.Value.Kind != DateTimeKind.Utc)
        {
            throw new ValidationException("EndDate must be in UTC.");
        }

        if (request.EndDate.HasValue && request.EndDate.Value <= request.StartDate)
        {
            throw new ValidationException("La fecha de finalización debe ser posterior a la fecha de inicio.");
        }

        if (string.IsNullOrWhiteSpace(request.Reason))
        {
            throw new ValidationException("El motivo es obligatorio.");
        }

        var user = await _unitOfWork.UserRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null || !user.IsActive)
        {
            throw new BusinessNotFoundException("El usuario no existe o no está activo.");
        }

        var existingActiveBans = await _unitOfWork.BanRepository.GetActiveByUserIdAsync(request.UserId, cancellationToken);
        if (existingActiveBans.Count > 0)
        {
            throw new BusinessConflictException("El usuario ya tiene un ban vigente.");
        }

        var now = DateTime.UtcNow;
        var ban = new Ban
        {
            User = user,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Reason = request.Reason.Trim(),
            IsActive = true,
            CreatedAt = now
        };

        await _unitOfWork.BanRepository.AddAsync(ban, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new CreateBanResponse(ban.Id);
    }

    public async Task UpdateBanAsync(long banId, UpdateBanRequest request, CancellationToken cancellationToken = default)
    {
        if (banId <= 0)
        {
            throw new ValidationException("El ban es obligatorio.");
        }

        if (request.StartDate.Kind != DateTimeKind.Utc)
        {
            throw new ValidationException("StartDate must be in UTC.");
        }

        if (request.StartDate == default)
        {
            throw new ValidationException("La fecha de inicio es obligatoria.");
        }

        if (request.EndDate.HasValue && request.EndDate.Value.Kind != DateTimeKind.Utc)
        {
            throw new ValidationException("EndDate must be in UTC.");
        }

        if (request.EndDate.HasValue && request.EndDate.Value <= request.StartDate)
        {
            throw new ValidationException("La fecha de finalización debe ser posterior a la fecha de inicio.");
        }

        if (string.IsNullOrWhiteSpace(request.Reason))
        {
            throw new ValidationException("El motivo es obligatorio.");
        }

        var ban = await _unitOfWork.BanRepository.GetByIdAsync(banId, cancellationToken);
        if (ban == null)
        {
            throw new BusinessNotFoundException("El ban no existe.");
        }

        var now = DateTime.UtcNow;
        var newStartDate = request.StartDate;
        var newEndDate = request.EndDate;

        var wouldBeActive = ban.IsActive && newStartDate <= now && (newEndDate == null || newEndDate > now);

        if (wouldBeActive)
        {
            var activeBans = await _unitOfWork.BanRepository.GetActiveByUserIdAsync(ban.User.Id, cancellationToken);
            var hasConflictingActiveBan = activeBans.Any(b => b.Id != banId);
            if (hasConflictingActiveBan)
            {
                throw new BusinessConflictException("El usuario ya tiene otro ban vigente.");
            }
        }

        ban.StartDate = newStartDate;
        ban.EndDate = newEndDate;
        ban.Reason = request.Reason.Trim();

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task DeactivateBanAsync(long banId, CancellationToken cancellationToken = default)
    {
        if (banId <= 0)
        {
            throw new ValidationException("El ban es obligatorio.");
        }

        var ban = await _unitOfWork.BanRepository.GetByIdAsync(banId, cancellationToken);
        if (ban == null)
        {
            throw new BusinessNotFoundException("El ban no existe.");
        }

        if (!ban.IsActive)
        {
            return;
        }

        ban.IsActive = false;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
