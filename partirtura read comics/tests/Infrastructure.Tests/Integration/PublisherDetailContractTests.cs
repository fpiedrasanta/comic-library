using System.Reflection;
using Api.Controllers;
using Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace Infrastructure.Tests.Integration;

public class PublisherDetailContractTests
{
    [Fact]
    public void PublisherDetail_RequiresAuthenticatedUserWithoutAdministratorRole()
    {
        var authorize = typeof(PublishersController).GetCustomAttribute<AuthorizeAttribute>();
        var allowAnonymous = typeof(PublishersController).GetCustomAttribute<AllowAnonymousAttribute>();

        Assert.NotNull(authorize);
        Assert.Null(allowAnonymous);
        Assert.True(string.IsNullOrEmpty(authorize!.Roles));
    }

    [Fact]
    public void PublisherDetail_ExposesGetByIdOnPublicRoute()
    {
        var route = typeof(PublishersController).GetCustomAttribute<RouteAttribute>();
        var method = typeof(PublishersController).GetMethod("GetById");
        var parameters = method!.GetParameters();

        Assert.Equal("api/publishers", route!.Template);
        Assert.NotNull(method.GetCustomAttribute<HttpGetAttribute>());
        Assert.Equal("{id:long}", method.GetCustomAttribute<HttpGetAttribute>()!.Template);
        Assert.Equal(typeof(long), parameters[0].ParameterType);
        Assert.Equal(typeof(CancellationToken), parameters[1].ParameterType);
        Assert.Equal(typeof(Task<IActionResult>), method.ReturnType);
    }

    [Fact]
    public void PublisherDetail_ActionIsNotAnonymous()
    {
        var method = typeof(PublishersController).GetMethod("GetById");

        Assert.Null(method!.GetCustomAttribute<AllowAnonymousAttribute>());
    }

    [Fact]
    public void PublisherDetailDto_ExposesOnlyPublicFields()
    {
        var properties = typeof(PublisherDetailDto).GetProperties().Select(p => p.Name).ToArray();

        Assert.Equal(
            new[] { "Color", "CountryName", "Description", "FoundedYear", "History", "Id", "Name", "UrlImage", "Website" },
            properties.OrderBy(name => name));
    }

    [Fact]
    public void PublisherDetailDto_DoesNotExposeAdminOrStorageData()
    {
        var properties = typeof(PublisherDetailDto).GetProperties().Select(p => p.Name).ToArray();

        Assert.DoesNotContain("IsActive", properties);
        Assert.DoesNotContain("IsFeatured", properties);
        Assert.DoesNotContain("IsAlive", properties);
        Assert.DoesNotContain("CreatedAt", properties);
        Assert.DoesNotContain("CountryId", properties);
        Assert.DoesNotContain("ImageId", properties);
        Assert.DoesNotContain("StoragePath", properties);
        Assert.DoesNotContain("FileName", properties);
    }

    [Fact]
    public void PublisherDetail_ReusesTheProjectImageUrlMechanism()
    {
        var image = new Domain.Entities.Image();
        var expected = Application.Helpers.ImageUrlBuilder.ToUrl(image);

        Assert.StartsWith("/images/", expected);
        Assert.Equal($"/images/{image.Id}", expected);
    }
}