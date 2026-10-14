using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using Domain.Enums;
using Infrastructure.Persistence;
using Infrastructure.Repositories;
using Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Hangfire;
using Hangfire.MySql;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class ListWorksIntegrationTests
{
    private readonly IntegrationTestFixture _fixture;

    public ListWorksIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task ListWorks_Global_ReturnsWorks()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var response = await workService.GetPagedAsync(new GetWorksRequest(currentPage: 1, pageSize: 50), default);

        Assert.NotNull(response);
        Assert.NotEmpty(response.Items);
    }

    [Fact]
    public async Task ListWorks_FilterByFranchise_ReturnsOnlyFromThatFranchise()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();
        var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var allFranchises = await franchises.GetPagedAsync(new GetFranchisesRequest { IsActive = true, currentPage = 1, pageSize = 100 }, default);
        Assert.NotEmpty(allFranchises.Items);

        long? targetFranchiseId = null;
        foreach (var frac in allFranchises.Items)
        {
            var request = new GetWorksRequest(currentPage: 1, pageSize: 100) { franchiseId = frac.Id };
            var worksResponse = await workService.GetPagedAsync(request, default);
            if (worksResponse.Items.Count > 0)
            {
                targetFranchiseId = frac.Id;
                break;
            }
        }

        Assert.NotNull(targetFranchiseId);

        var filteredRequest = new GetWorksRequest(currentPage: 1, pageSize: 100) { franchiseId = targetFranchiseId.Value };
        var filtered = await workService.GetPagedAsync(filteredRequest, default);
        Assert.NotEmpty(filtered.Items);
        Assert.All(filtered.Items, w => Assert.Equal(targetFranchiseId.Value, w.FranchiseId));
    }

    [Fact]
    public async Task ListWorks_FilterBySeries_ReturnsOnlyFromThatSeries()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var seriesService = scope.ServiceProvider.GetRequiredService<ISeriesService>();
        var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var allSeries = await seriesService.GetPagedAsync(new GetSeriesRequest { IsActive = true, currentPage = 1, pageSize = 100 }, default);
        Assert.NotEmpty(allSeries.Items);

        long? targetSeriesId = null;
        foreach (var serie in allSeries.Items)
        {
            var request = new GetWorksRequest(currentPage: 1, pageSize: 100) { seriesId = serie.Id };
            var worksResponse = await workService.GetPagedAsync(request, default);
            if (worksResponse.Items.Count > 0)
            {
                targetSeriesId = serie.Id;
                break;
            }
        }

        Assert.NotNull(targetSeriesId);

        var filteredRequest = new GetWorksRequest(currentPage: 1, pageSize: 100) { seriesId = targetSeriesId.Value };
        var filtered = await workService.GetPagedAsync(filteredRequest, default);
        Assert.NotEmpty(filtered.Items);
        Assert.All(filtered.Items, w => Assert.Equal(targetSeriesId.Value, w.SeriesId));
    }

    [Fact]
    public async Task GetWorkById_ReturnsWork()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var list = await workService.GetPagedAsync(new GetWorksRequest(currentPage: 1, pageSize: 1), default);
        Assert.NotEmpty(list.Items);

        var firstWorkId = list.Items[0].Id;
        var detail = await workService.GetByIdAsync(firstWorkId, default);
        Assert.NotNull(detail);
        Assert.Equal(firstWorkId, detail.Id);
    }
}