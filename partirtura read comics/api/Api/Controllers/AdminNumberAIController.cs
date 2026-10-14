using Api.DTOs;
using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Api.Controllers;

[ApiController]
[Route("api/admin-works")]
[Authorize(Roles = Roles.Administrator)]
public class AdminWorkAIController : ControllerBase
{
    private readonly IWorkService _workService;

    public AdminWorkAIController(IWorkService workService)
    {
        _workService = workService;
    }

    [HttpPost("{workId:long}/ai-analysis")]
    [EnableRateLimiting(RateLimitPolicies.AdminAiAnalysis)]
    public async Task<IActionResult> AnalyzeWork(long workId, [FromBody] AnalyzeComicRequest request, CancellationToken cancellationToken)
    {
        await _workService.EnqueueWorkAnalysisAsync(workId, request.ImageIds, cancellationToken);
        return Ok(new ApiResponse<object>(true, "AI analysis enqueued successfully.", StatusCodes.Status200OK, null));
    }
}
