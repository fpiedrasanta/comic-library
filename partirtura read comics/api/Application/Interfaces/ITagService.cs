using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface ITagService
{
    Task<ListResponse<TagListItemDto>> GetPagedAsync(GetTagsRequest request, CancellationToken cancellationToken = default);
    Task<TagListItemDto> CreateTagAsync(CreateTagRequest request, CancellationToken cancellationToken = default);
    Task<Tag> GetTagByIdAsync(long tagId, CancellationToken cancellationToken = default);
    Task<Tag> UpdateTagAsync(long tagId, UpdateTagRequest request, CancellationToken cancellationToken = default);
    Task DeactivateTagAsync(long tagId, CancellationToken cancellationToken = default);
    Task ActivateTagAsync(long tagId, CancellationToken cancellationToken = default);
}
