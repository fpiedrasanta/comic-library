using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;

namespace Application.Services;

public class TagService : ITagService
{
    private readonly IUnitOfWork _unitOfWork;

    public TagService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ListResponse<TagListItemDto>> GetPagedAsync(GetTagsRequest request, CancellationToken cancellationToken = default)
    {
        var currentPage = request.currentPage;
        var pageSize = request.pageSize;
        PaginationGuard.Normalize(PaginationGuard.DefaultPageSize, PaginationGuard.MaxPageSize, ref currentPage, ref pageSize);

        (IReadOnlyList<Tag> tags, int totalCount) = await _unitOfWork.TagRepository.GetPagedAsync(
            currentPage, pageSize, request.search, request.isActive, request.orderBy, request.orderDir, cancellationToken: cancellationToken);

        var items = tags.Select(t => new TagListItemDto(t.Id, t.Name, t.IsActive)).ToList();

        return PaginationGuard.Build(currentPage, pageSize, totalCount, items);
    }

    public async Task<TagListItemDto> CreateTagAsync(CreateTagRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ValidationException("El nombre es obligatorio.");
        }

        var name = request.Name.Trim();

        var existing = await _unitOfWork.TagRepository.GetByNameAsync(name, cancellationToken);
        if (existing is not null)
        {
            throw new BusinessConflictException("Ya existe una etiqueta con ese nombre.");
        }

        var tag = new Tag
        {
            Name = name,
            IsActive = true
        };

        await _unitOfWork.TagRepository.AddAsync(tag, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new TagListItemDto(tag.Id, tag.Name, tag.IsActive);
    }

    public async Task<Tag> GetTagByIdAsync(long tagId, CancellationToken cancellationToken = default)
    {
        var tag = await _unitOfWork.TagRepository.GetByIdAsync(tagId, cancellationToken);
        if (tag is null)
        {
            throw new BusinessNotFoundException("La etiqueta no existe.");
        }

        return tag;
    }

    public async Task<Tag> UpdateTagAsync(long tagId, UpdateTagRequest request, CancellationToken cancellationToken = default)
    {
        var tag = await _unitOfWork.TagRepository.GetByIdAsync(tagId, cancellationToken);
        if (tag is null)
        {
            throw new BusinessNotFoundException("La etiqueta no existe.");
        }

        var name = request.Name.Trim();

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ValidationException("El nombre es obligatorio.");
        }

        var existing = await _unitOfWork.TagRepository.GetByNameAsync(name, cancellationToken);
        if (existing is not null && existing.Id != tagId)
        {
            throw new BusinessConflictException("Ya existe una etiqueta con ese nombre.");
        }

        tag.Name = name;

        await _unitOfWork.TagRepository.UpdateAsync(tag, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return tag;
    }

    public async Task DeactivateTagAsync(long tagId, CancellationToken cancellationToken = default)
    {
        var tag = await _unitOfWork.TagRepository.GetByIdAsync(tagId, cancellationToken);
        if (tag is null)
        {
            throw new BusinessNotFoundException("La etiqueta no existe.");
        }

        if (!tag.IsActive)
        {
            return;
        }

        tag.IsActive = false;

        await _unitOfWork.TagRepository.UpdateAsync(tag, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ActivateTagAsync(long tagId, CancellationToken cancellationToken = default)
    {
        var tag = await _unitOfWork.TagRepository.GetByIdAsync(tagId, cancellationToken);
        if (tag is null)
        {
            throw new BusinessNotFoundException("La etiqueta no existe.");
        }

        if (tag.IsActive)
        {
            return;
        }

        tag.IsActive = true;

        await _unitOfWork.TagRepository.UpdateAsync(tag, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}