using System.Reflection;
using Api.Controllers;
using Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace Infrastructure.Tests.Integration;

public class ReadingHistoryControllerContractTests
{
    [Fact]
    public void ReadingHistoryController_RequiresAuthenticatedUser()
    {
        var authorize = typeof(ReadingHistoryController).GetCustomAttribute<AuthorizeAttribute>();
        var allowAnonymous = typeof(ReadingHistoryController).GetCustomAttribute<AllowAnonymousAttribute>();

        Assert.NotNull(authorize);
        Assert.Null(allowAnonymous);
    }

    [Fact]
    public void ReadingHistoryController_ExposesReadingHistoryRoute()
    {
        var route = typeof(ReadingHistoryController).GetCustomAttribute<RouteAttribute>();
        var method = typeof(ReadingHistoryController).GetMethod("Get");

        Assert.NotNull(route);
        Assert.Equal("api/users/me/reading-history", route!.Template);
        Assert.NotNull(method!.GetCustomAttribute<HttpGetAttribute>());
    }

    [Fact]
    public void ReadingHistoryController_Get_BindsHistoryRequestFromQuery()
    {
        var method = typeof(ReadingHistoryController).GetMethod("Get");
        var parameters = method!.GetParameters();

        Assert.Equal(typeof(GetReadingHistoryRequest), parameters[0].ParameterType);
        Assert.Equal(typeof(CancellationToken), parameters[1].ParameterType);
        Assert.Equal(typeof(Task<IActionResult>), method.ReturnType);
        Assert.NotNull(parameters[0].GetCustomAttribute<FromQueryAttribute>());
    }

    [Fact]
    public void ReadingHistoryController_DoesNotAcceptUserIdFromClient()
    {
        var parameters = typeof(ReadingHistoryController).GetMethod("Get")!.GetParameters();
        var requestProperties = typeof(GetReadingHistoryRequest).GetProperties();

        Assert.DoesNotContain(parameters, parameter => parameter.Name!.Equals("userId", StringComparison.OrdinalIgnoreCase));
        Assert.DoesNotContain(requestProperties, property => property.Name.Equals("UserId", StringComparison.OrdinalIgnoreCase));
    }
}
