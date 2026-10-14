using System.Reflection;
using Api.Controllers;
using Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace Infrastructure.Tests.Integration;

public class WorksControllerContractTests
{
    [Fact]
    public void WorksController_RequiresAuthenticatedUser()
    {
        var authorize = typeof(WorksController).GetCustomAttribute<AuthorizeAttribute>();
        var allowAnonymous = typeof(WorksController).GetCustomAttribute<AllowAnonymousAttribute>();

        Assert.NotNull(authorize);
        Assert.Null(allowAnonymous);
    }

    [Fact]
    public void WorksController_DoesNotRequireAdministratorRole()
    {
        var authorize = typeof(WorksController).GetCustomAttribute<AuthorizeAttribute>();

        Assert.NotNull(authorize);
        Assert.True(string.IsNullOrEmpty(authorize!.Roles));
    }

    [Fact]
    public void WorksController_ExposesCatalogRoute()
    {
        var route = typeof(WorksController).GetCustomAttribute<RouteAttribute>();
        var method = typeof(WorksController).GetMethod("Get");

        Assert.NotNull(route);
        Assert.Equal("api/works", route!.Template);
        Assert.NotNull(method);
        Assert.NotNull(method!.GetCustomAttribute<HttpGetAttribute>());
    }

    [Fact]
    public void WorksController_Get_BindsCatalogRequestAndReturnsTask()
    {
        var method = typeof(WorksController).GetMethod("Get");
        var parameters = method!.GetParameters();

        Assert.Equal(typeof(GetCatalogWorksRequest), parameters[0].ParameterType);
        Assert.Equal(typeof(CancellationToken), parameters[1].ParameterType);
        Assert.Equal(typeof(Task<IActionResult>), method.ReturnType);
    }

    [Fact]
    public void WorksController_ExposesDetailRoute()
    {
        var method = typeof(WorksController).GetMethod("GetById");
        var httpGet = method!.GetCustomAttribute<HttpGetAttribute>();

        Assert.NotNull(httpGet);
        Assert.Equal("{id:long}", httpGet!.Template);
    }

    [Fact]
    public void WorksController_GetById_BindsLongIdAndReturnsTask()
    {
        var method = typeof(WorksController).GetMethod("GetById");
        var parameters = method!.GetParameters();

        Assert.Equal(typeof(long), parameters[0].ParameterType);
        Assert.Equal(typeof(CancellationToken), parameters[1].ParameterType);
        Assert.Equal(typeof(Task<IActionResult>), method.ReturnType);
    }

    [Fact]
    public void WorksController_ExposesReaderPagesRoute()
    {
        var method = typeof(WorksController).GetMethod("GetPages");
        var httpGet = method!.GetCustomAttribute<HttpGetAttribute>();

        Assert.NotNull(httpGet);
        Assert.Equal("{id:long}/pages", httpGet!.Template);
    }

    [Fact]
    public void WorksController_GetPages_BindsLongIdAndReturnsTask()
    {
        var method = typeof(WorksController).GetMethod("GetPages");
        var parameters = method!.GetParameters();

        Assert.Equal(typeof(long), parameters[0].ParameterType);
        Assert.Equal(typeof(CancellationToken), parameters[1].ParameterType);
        Assert.Equal(typeof(Task<IActionResult>), method.ReturnType);
    }
}
