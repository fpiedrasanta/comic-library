using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Application.DTOs;

namespace Api.DTOs;

public class CreateWorkFormRequest
{
    [Required]
    public long WorkTypeId { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public long LanguageId { get; set; }

    public long? CoverImageId { get; set; }

    [Required]
    public DateTime PublicationDate { get; set; }

    public long? SeriesId { get; set; }
    public long? FranchiseId { get; set; }
    public long? PublisherId { get; set; }

    public string? NumberValue { get; set; }
    public long? PreviousNumberId { get; set; }
    public long? NextNumberId { get; set; }

    public string? PersonByRoles { get; set; }
    public string? Tags { get; set; }

    public IFormFile? Cover { get; set; }
}

public class UpdateWorkFormRequest
{
    [Required]
    public long WorkTypeId { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public long LanguageId { get; set; }

    public long? CoverImageId { get; set; }

    [Required]
    public DateTime PublicationDate { get; set; }

    public long? SeriesId { get; set; }
    public long? FranchiseId { get; set; }
    public long? PublisherId { get; set; }

    public string? NumberValue { get; set; }
    public long? PreviousNumberId { get; set; }
    public long? NextNumberId { get; set; }

    public string? PersonByRoles { get; set; }
    public string? Tags { get; set; }

    public IFormFile? Cover { get; set; }
}

public class CreateWorkWithContentFormRequest
{
    public long? WorkTypeId { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    public long? LanguageId { get; set; }
    public DateTime? PublicationDate { get; set; }

    public long? CoverImageId { get; set; }
    public long? SeriesId { get; set; }
    public long? FranchiseId { get; set; }
    public long? PublisherId { get; set; }

    public string? NumberValue { get; set; }
    public long? PreviousNumberId { get; set; }
    public long? NextNumberId { get; set; }

    public string? PersonByRoles { get; set; }
    public string? Tags { get; set; }

    public IFormFile? Cover { get; set; }
    public IFormFile? Content { get; set; }
}

public class RetryContentFormRequest
{
    public IFormFile? Content { get; set; }
}