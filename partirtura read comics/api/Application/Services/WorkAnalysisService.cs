using Application.DTOs;
using Application.Interfaces;
using Domain.Exceptions;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class WorkAnalysisService : IWorkAnalysisService
{
    private readonly WorkAnalyzer _analyzer;

    public WorkAnalysisService(WorkAnalyzer analyzer)
    {
        _analyzer = analyzer;
    }

    public async Task<ComicAnalysisResult> AnalyzeWithAiAsync(long workId, AnalyzeComicRequest request, CancellationToken cancellationToken = default)
    {
        if (workId <= 0)
        {
            throw new ValidationException("El identificador de la obra es obligatorio.");
        }

        if (request.ImageIds is null || request.ImageIds.Count == 0)
        {
            throw new ValidationException("Debe seleccionar al menos una imagen para analizar.");
        }

        var result = await _analyzer.AnalyzeAsync(workId, request.ImageIds, cancellationToken);

        if (result is null)
        {
            throw new BusinessNotFoundException("La obra no existe, no está completada, o las imágenes no pertenecen a la obra.");
        }

        return result;
    }
}
