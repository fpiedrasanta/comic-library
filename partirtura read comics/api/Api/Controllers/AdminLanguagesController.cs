using Api.DTOs;
using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/admin-languages")]
[Authorize(Roles = Roles.Administrator)]
public class AdminLanguagesController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminLanguagesController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var languages = await _unitOfWork.LanguageRepository.GetAllAsync(cancellationToken);
        var items = languages
            .Select(l => new LanguageDto(l.Id, l.Name, l.Code))
            .ToList();
        return Ok(new ApiResponse<IReadOnlyList<LanguageDto>>(true, "OK", StatusCodes.Status200OK, items));
    }
}
