using System.Reflection;
using Api.Controllers;
using Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace Infrastructure.Tests.Integration;

public class WorkRatingsControllerContractTests
{
    [Fact]
    public void WorkRatingsController_RequiresAuthenticatedUser()
    {
        var authorize = typeof(WorkRatingsController).GetCustomAttribute<AuthorizeAttribute>();
        var allowAnonymous = typeof(WorkRatingsController).GetCustomAttribute<AllowAnonymousAttribute>();

        Assert.NotNull(authorize);
        Assert.Null(allowAnonymous);
    }

    [Fact]
    public void WorkRatingsController_DoesNotRequireAdministratorRole()
    {
        var authorize = typeof(WorkRatingsController).GetCustomAttribute<AuthorizeAttribute>();

        Assert.NotNull(authorize);
        Assert.True(string.IsNullOrEmpty(authorize!.Roles));
    }

    [Fact]
    public void WorkRatingsController_ExposesRatingsRoute()
    {
        var route = typeof(WorkRatingsController).GetCustomAttribute<RouteAttribute>();

        Assert.NotNull(route);
        Assert.Equal("api/works/{workId:long}/ratings", route!.Template);
    }

    [Fact]
    public void WorkRatingsController_Create_BindsVoteRequestFromBody()
    {
        var method = typeof(WorkRatingsController).GetMethod("Create");
        var parameters = method!.GetParameters();

        Assert.NotNull(method!.GetCustomAttribute<HttpPostAttribute>());
        Assert.Equal(typeof(long), parameters[0].ParameterType);
        Assert.Equal(typeof(WorkRatingVoteRequest), parameters[1].ParameterType);
        Assert.Equal(typeof(CancellationToken), parameters[2].ParameterType);
        Assert.Equal(typeof(Task<IActionResult>), method.ReturnType);
        Assert.NotNull(parameters[1].GetCustomAttribute<FromBodyAttribute>());
    }

    [Fact]
    public void WorkRatingsController_Update_BindsVoteRequestFromBody()
    {
        var method = typeof(WorkRatingsController).GetMethod("Update");
        var parameters = method!.GetParameters();

        Assert.NotNull(method!.GetCustomAttribute<HttpPutAttribute>());
        Assert.Equal(typeof(long), parameters[0].ParameterType);
        Assert.Equal(typeof(WorkRatingVoteRequest), parameters[1].ParameterType);
        Assert.Equal(typeof(CancellationToken), parameters[2].ParameterType);
        Assert.Equal(typeof(Task<IActionResult>), method.ReturnType);
        Assert.NotNull(parameters[1].GetCustomAttribute<FromBodyAttribute>());
    }

    [Fact]
    public void WorkRatingsController_Get_BindsPaginationRequestFromQuery()
    {
        var method = typeof(WorkRatingsController).GetMethod("Get");
        var parameters = method!.GetParameters();

        Assert.NotNull(method!.GetCustomAttribute<HttpGetAttribute>());
        Assert.Equal(typeof(long), parameters[0].ParameterType);
        Assert.Equal(typeof(GetWorkRatingsRequest), parameters[1].ParameterType);
        Assert.Equal(typeof(CancellationToken), parameters[2].ParameterType);
        Assert.Equal(typeof(Task<IActionResult>), method.ReturnType);
        Assert.NotNull(parameters[1].GetCustomAttribute<FromQueryAttribute>());
    }

    [Fact]
    public void WorkRatingsController_DoesNotAcceptUserIdFromClient()
    {
        var createParameters = typeof(WorkRatingsController).GetMethod("Create")!.GetParameters();
        var updateParameters = typeof(WorkRatingsController).GetMethod("Update")!.GetParameters();
        var voteRequestProperties = typeof(WorkRatingVoteRequest).GetProperties();

        Assert.DoesNotContain(createParameters, parameter => parameter.Name!.Equals("userId", StringComparison.OrdinalIgnoreCase));
        Assert.DoesNotContain(updateParameters, parameter => parameter.Name!.Equals("userId", StringComparison.OrdinalIgnoreCase));
        Assert.DoesNotContain(voteRequestProperties, property => property.Name.Equals("UserId", StringComparison.OrdinalIgnoreCase));
    }
}
