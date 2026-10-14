using System.Reflection;
using Api.Controllers;
using Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace Infrastructure.Tests.Integration;

public class FranchiseDetailContractTests
{
    [Fact]
    public void FranchiseDetail_RequiresAuthenticatedUserWithoutAdministratorRole()
    {
        var authorize = typeof(FranchisesController).GetCustomAttribute<AuthorizeAttribute>();
        var allowAnonymous = typeof(FranchisesController).GetCustomAttribute<AllowAnonymousAttribute>();

        Assert.NotNull(authorize);
        Assert.Null(allowAnonymous);
        Assert.True(string.IsNullOrEmpty(authorize!.Roles));
    }

    [Fact]
    public void FranchiseDetail_ExposesGetByIdOnPublicRoute()
    {
        var route = typeof(FranchisesController).GetCustomAttribute<RouteAttribute>();
        var method = typeof(FranchisesController).GetMethod("GetById");
        var parameters = method!.GetParameters();

        Assert.Equal("api/franchises", route!.Template);
        Assert.NotNull(method.GetCustomAttribute<HttpGetAttribute>());
        Assert.Equal("{id:long}", method.GetCustomAttribute<HttpGetAttribute>()!.Template);
        Assert.Equal(typeof(long), parameters[0].ParameterType);
        Assert.Equal(typeof(CancellationToken), parameters[1].ParameterType);
        Assert.Equal(typeof(Task<IActionResult>), method.ReturnType);
    }

    [Fact]
    public void FranchiseDetail_ActionIsNotAnonymous()
    {
        var method = typeof(FranchisesController).GetMethod("GetById");

        Assert.Null(method!.GetCustomAttribute<AllowAnonymousAttribute>());
    }

    [Fact]
    public void PublicFranchiseDetailDto_ExposesOnlyPublicFields()
    {
        var properties = typeof(PublicFranchiseDetailDto).GetProperties().Select(p => p.Name).ToArray();

        Assert.Equal(
            new[] { "Color", "Description", "Id", "Name", "PublisherColor", "PublisherId", "PublisherName", "UrlImage" },
            properties.OrderBy(name => name));
    }

    [Fact]
    public void PublicFranchiseDetailDto_PublisherFieldsAreNullable()
    {
        var properties = typeof(PublicFranchiseDetailDto).GetProperties();

        var publisherId = properties.Single(p => p.Name == "PublisherId").PropertyType;

        Assert.Equal(typeof(long?), publisherId);
        Assert.True(Nullable.GetUnderlyingType(publisherId) != null);
    }

    [Fact]
    public void PublicFranchiseDetailDto_AcceptsNullPublisherWithoutThrowing()
    {
        var detail = new PublicFranchiseDetailDto(1, "Spiderman", null, "#f10d04", null, null, null, null);

        Assert.Null(detail.PublisherId);
        Assert.Null(detail.PublisherName);
        Assert.Null(detail.PublisherColor);
    }

    [Fact]
    public void PublicFranchiseDetailDto_DoesNotExposeAdminOrStorageData()
    {
        var properties = typeof(PublicFranchiseDetailDto).GetProperties().Select(p => p.Name).ToArray();

        Assert.DoesNotContain("IsActive", properties);
        Assert.DoesNotContain("IsFeatured", properties);
        Assert.DoesNotContain("IsOngoing", properties);
        Assert.DoesNotContain("CreatedAt", properties);
        Assert.DoesNotContain("ImageId", properties);
        Assert.DoesNotContain("PublisherCountryName", properties);
        Assert.DoesNotContain("StoragePath", properties);
        Assert.DoesNotContain("FileName", properties);
    }

    [Fact]
    public void FranchiseDetail_ReusesTheProjectImageUrlMechanism()
    {
        var image = new Domain.Entities.Image();
        var expected = Application.Helpers.ImageUrlBuilder.ToUrl(image);

        Assert.StartsWith("/images/", expected);
        Assert.Equal($"/images/{image.Id}", expected);
    }

    [Fact]
    public void FranchiseDetail_ReturnsNullImageUrlWhenImageIsMissing()
    {
        Assert.Null(Application.Helpers.ImageUrlBuilder.ToUrl(null));
    }

    [Fact]
    public void FranchiseDomainHelpers_ReturnNullWhenPublisherIsNotLoaded()
    {
        var franchise = new Domain.Entities.Franchise();

        Assert.Null(franchise.GetPublisherId());
        Assert.Null(franchise.GetPublisherName());
        Assert.Null(franchise.Publisher?.Color);
    }

    [Fact]
    public void PublicFranchiseDetail_IsADistinctContractFromTheAdministrativeOne()
    {
        var publicDto = typeof(PublicFranchiseDetailDto);
        var adminDto = typeof(FranchiseDetailDto);

        Assert.NotEqual(adminDto, publicDto);
        Assert.NotEmpty(adminDto.GetProperties().Select(p => p.Name).Except(publicDto.GetProperties().Select(p => p.Name)));
    }
}