using System.Reflection;
using Api.Controllers;
using Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace Infrastructure.Tests.Integration;

public class CatalogFilterControllerContractTests
{
    public static TheoryData<Type, string> Controllers => new()
    {
        { typeof(PublishersController), "api/publishers" },
        { typeof(FranchisesController), "api/franchises" },
        { typeof(SeriesController), "api/series" },
        { typeof(WorkTypesController), "api/work-types" },
        { typeof(ListTypesController), "api/list-types" }
    };

    [Theory]
    [MemberData(nameof(Controllers))]
    public void CatalogFilters_RequireAuthenticatedUserWithoutAdministratorRole(Type controllerType, string route)
    {
        var authorize = controllerType.GetCustomAttribute<AuthorizeAttribute>();
        var allowAnonymous = controllerType.GetCustomAttribute<AllowAnonymousAttribute>();

        Assert.NotNull(authorize);
        Assert.Null(allowAnonymous);
        Assert.True(string.IsNullOrEmpty(authorize!.Roles));
        Assert.Equal(route, controllerType.GetCustomAttribute<RouteAttribute>()?.Template);
    }

    [Theory]
    [InlineData(typeof(PublishersController), typeof(ListRequest))]
    [InlineData(typeof(FranchisesController), typeof(GetPublicFranchisesRequest))]
    [InlineData(typeof(SeriesController), typeof(GetPublicSeriesRequest))]
    [InlineData(typeof(WorkTypesController), typeof(ListRequest))]
    [InlineData(typeof(ListTypesController), typeof(ListRequest))]
    public void CatalogFilters_ExposeGetWithListRequest(Type controllerType, Type requestType)
    {
        var method = controllerType.GetMethod("Get");
        var parameters = method!.GetParameters();

        Assert.NotNull(method.GetCustomAttribute<HttpGetAttribute>());
        Assert.Equal(requestType, parameters[0].ParameterType);
        Assert.Equal(typeof(CancellationToken), parameters[1].ParameterType);
        Assert.Equal(typeof(Task<IActionResult>), method.ReturnType);
    }

    [Fact]
    public void FilterDtos_ExposeOnlyPublicCatalogFields()
    {
        AssertPublicShape(typeof(PublisherFilterDto), "Id", "Name", "Color");
        AssertPublicShape(typeof(FranchiseFilterDto), "Id", "Name", "Color", "PublisherId", "PublisherName");
        AssertPublicShape(typeof(SeriesFilterDto), "Id", "Name", "Color", "FranchiseId", "FranchiseName", "PublisherId", "PublisherName");
        AssertPublicShape(typeof(WorkTypeFilterDto), "Id", "Name");
        AssertPublicShape(typeof(ListTypeFilterDto), "Id", "Name");
    }

    private static void AssertPublicShape(Type dtoType, params string[] expectedProperties)
    {
        var actual = dtoType.GetProperties().Select(property => property.Name).OrderBy(name => name).ToArray();
        var expected = expectedProperties.OrderBy(name => name).ToArray();

        Assert.Equal(expected, actual);
        Assert.DoesNotContain("IsActive", actual);
        Assert.DoesNotContain("IsFeatured", actual);
        Assert.DoesNotContain("IsAlive", actual);
        Assert.DoesNotContain("IsOngoing", actual);
        Assert.DoesNotContain("CreatedAt", actual);
    }
}