using System.Reflection;
using Api.Controllers;
using Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace Infrastructure.Tests.Integration;

public class RecommendedWorksControllerContractTests
{
    [Fact]
    public void RecommendedWorksController_RequiresAuthenticatedUser()
    {
        var authorize = typeof(RecommendedWorksController).GetCustomAttribute<AuthorizeAttribute>();
        var allowAnonymous = typeof(RecommendedWorksController).GetCustomAttribute<AllowAnonymousAttribute>();

        Assert.NotNull(authorize);
        Assert.Null(allowAnonymous);
    }

    [Fact]
    public void RecommendedWorksController_DoesNotRequireAdministratorRole()
    {
        var authorize = typeof(RecommendedWorksController).GetCustomAttribute<AuthorizeAttribute>();

        Assert.NotNull(authorize);
        Assert.True(string.IsNullOrEmpty(authorize!.Roles));
    }

    [Fact]
    public void RecommendedWorksController_ExposesRecommendedRoute()
    {
        var route = typeof(RecommendedWorksController).GetCustomAttribute<RouteAttribute>();
        var method = typeof(RecommendedWorksController).GetMethod("Get");

        Assert.NotNull(route);
        Assert.Equal("api/works/recommended", route!.Template);
        Assert.NotNull(method!.GetCustomAttribute<HttpGetAttribute>());
    }

    [Fact]
    public void RecommendedWorksController_Get_BindsSortByFromQuery()
    {
        var method = typeof(RecommendedWorksController).GetMethod("Get");
        var parameters = method!.GetParameters();

        Assert.Equal(typeof(string), parameters[0].ParameterType);
        Assert.Equal("sortBy", parameters[0].Name);
        Assert.NotNull(parameters[0].GetCustomAttribute<FromQueryAttribute>());
        Assert.Equal(typeof(CancellationToken), parameters[1].ParameterType);
        Assert.Equal(typeof(Task<IActionResult>), method.ReturnType);
    }

    [Fact]
    public void RecommendedWorksController_DoesNotAcceptUserIdFromClient()
    {
        var parameters = typeof(RecommendedWorksController).GetMethod("Get")!.GetParameters();

        Assert.DoesNotContain(parameters, parameter => parameter.Name!.Equals("userId", StringComparison.OrdinalIgnoreCase));
    }
}
