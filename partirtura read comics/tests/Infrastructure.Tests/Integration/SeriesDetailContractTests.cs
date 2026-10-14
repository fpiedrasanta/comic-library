using System.Reflection;
using Api.Controllers;
using Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace Infrastructure.Tests.Integration;

public class SeriesDetailContractTests
{
    [Fact]
    public void SeriesDetail_RequiresAuthenticatedUserWithoutAdministratorRole()
    {
        var authorize = typeof(SeriesController).GetCustomAttribute<AuthorizeAttribute>();
        var allowAnonymous = typeof(SeriesController).GetCustomAttribute<AllowAnonymousAttribute>();

        Assert.NotNull(authorize);
        Assert.Null(allowAnonymous);
        Assert.True(string.IsNullOrEmpty(authorize!.Roles));
    }

    [Fact]
    public void SeriesDetail_ExposesGetByIdOnPublicRoute()
    {
        var route = typeof(SeriesController).GetCustomAttribute<RouteAttribute>();
        var method = typeof(SeriesController).GetMethod("GetById");
        var parameters = method!.GetParameters();

        Assert.Equal("api/series", route!.Template);
        Assert.NotNull(method.GetCustomAttribute<HttpGetAttribute>());
        Assert.Equal("{id:long}", method.GetCustomAttribute<HttpGetAttribute>()!.Template);
        Assert.Equal(typeof(long), parameters[0].ParameterType);
        Assert.Equal(typeof(CancellationToken), parameters[1].ParameterType);
        Assert.Equal(typeof(Task<IActionResult>), method.ReturnType);
    }

    [Fact]
    public void SeriesDetail_ActionIsNotAnonymous()
    {
        var method = typeof(SeriesController).GetMethod("GetById");

        Assert.Null(method!.GetCustomAttribute<AllowAnonymousAttribute>());
    }

    [Fact]
    public void PublicSeriesDetailDto_ExposesOnlyPublicFields()
    {
        var properties = typeof(PublicSeriesDetailDto).GetProperties().Select(p => p.Name).ToArray();

        Assert.Equal(
            new[] { "Color", "Description", "Franchise", "Id", "Name", "Publisher", "UrlImage" },
            properties.OrderBy(name => name));
    }

    [Fact]
    public void PublicSeriesNodeDto_ExposesIdNameAndNullableColor()
    {
        var properties = typeof(PublicSeriesNodeDto).GetProperties().ToDictionary(p => p.Name, p => p.PropertyType);

        Assert.Equal(new[] { "Color", "Id", "Name" }, properties.Keys.OrderBy(name => name));
        Assert.Equal(typeof(long), properties["Id"]);
        Assert.Equal(typeof(string), properties["Name"]);
        Assert.Equal(typeof(string), properties["Color"]);
    }

    [Fact]
    public void PublicSeriesNodeDto_AcceptsNullNodesWithoutThrowing()
    {
        var withColors = new PublicSeriesNodeDto(1, "Fly", "#f10d04");
        var withoutColors = new PublicSeriesNodeDto(2, "Zenescope", null);

        Assert.Equal("#f10d04", withColors.Color);
        Assert.Null(withoutColors.Color);

        var detail = new PublicSeriesDetailDto(1, "Fly Vol.1", null, "#00B4D8", null, null, null);

        Assert.Null(detail.Franchise);
        Assert.Null(detail.Publisher);
    }

    [Fact]
    public void PublicSeriesDetailDto_DoesNotExposeAdminOrStorageData()
    {
        var properties = typeof(PublicSeriesDetailDto).GetProperties().Select(p => p.Name).ToArray();

        Assert.DoesNotContain("IsActive", properties);
        Assert.DoesNotContain("IsFeatured", properties);
        Assert.DoesNotContain("IsOngoing", properties);
        Assert.DoesNotContain("CreatedAt", properties);
        Assert.DoesNotContain("ImageId", properties);
        Assert.DoesNotContain("FranchiseId", properties);
        Assert.DoesNotContain("StoragePath", properties);
        Assert.DoesNotContain("FileName", properties);
    }

    [Fact]
    public void SeriesDetail_ReusesTheProjectImageUrlMechanism()
    {
        var image = new Domain.Entities.Image();
        var expected = Application.Helpers.ImageUrlBuilder.ToUrl(image);

        Assert.StartsWith("/images/", expected);
        Assert.Equal($"/images/{image.Id}", expected);
        Assert.Null(Application.Helpers.ImageUrlBuilder.ToUrl(null));
    }

    [Fact]
    public void PublicSeriesDetail_IsADistinctContractFromTheAdministrativeOne()
    {
        var publicDto = typeof(PublicSeriesDetailDto);
        var adminDto = typeof(SeriesDetailDto);

        Assert.NotEqual(adminDto, publicDto);
        Assert.NotEmpty(adminDto.GetProperties().Select(p => p.Name).Except(publicDto.GetProperties().Select(p => p.Name)));
    }
}