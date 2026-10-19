using System.Reflection;
using Api.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace Infrastructure.Tests.Integration;

public class FavoritesControllerContractTests
{
    [Fact]
    public void FavoritesController_RequiresAuthenticatedUser()
    {
        var authorize = typeof(FavoritesController).GetCustomAttribute<AuthorizeAttribute>();
        var allowAnonymous = typeof(FavoritesController).GetCustomAttribute<AllowAnonymousAttribute>();

        Assert.NotNull(authorize);
        Assert.Null(allowAnonymous);
    }

    [Fact]
    public void FavoritesController_DoesNotRequireAdministratorRole()
    {
        var authorize = typeof(FavoritesController).GetCustomAttribute<AuthorizeAttribute>();

        Assert.NotNull(authorize);
        Assert.True(string.IsNullOrEmpty(authorize!.Roles));
    }

    [Fact]
    public void FavoritesController_ExposesFavoritesRoute()
    {
        var route = typeof(FavoritesController).GetCustomAttribute<RouteAttribute>();

        Assert.NotNull(route);
        Assert.Equal("api/favorites", route!.Template);
    }

    [Fact]
    public void FavoritesController_ExposesAddFavoriteAsPost()
    {
        var method = typeof(FavoritesController).GetMethod("AddFavorite");
        var httpPost = method!.GetCustomAttribute<HttpPostAttribute>();

        Assert.NotNull(httpPost);
        Assert.Equal("{workId:long}", httpPost!.Template);
    }

    [Fact]
    public void FavoritesController_ExposesRemoveFavoriteAsDelete()
    {
        var method = typeof(FavoritesController).GetMethod("RemoveFavorite");
        var httpDelete = method!.GetCustomAttribute<HttpDeleteAttribute>();

        Assert.NotNull(httpDelete);
        Assert.Equal("{workId:long}", httpDelete!.Template);
    }

    [Fact]
    public void FavoritesController_AddFavorite_BindsWorkIdAndReturnsTask()
    {
        var method = typeof(FavoritesController).GetMethod("AddFavorite");
        var parameters = method!.GetParameters();

        Assert.Equal(typeof(long), parameters[0].ParameterType);
        Assert.Equal(typeof(CancellationToken), parameters[1].ParameterType);
        Assert.Equal(typeof(Task<IActionResult>), method.ReturnType);
    }

    [Fact]
    public void FavoritesController_DoesNotAcceptAUserIdFromTheClient()
    {
        var methods = typeof(FavoritesController)
            .GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(method => method.Name is "AddFavorite" or "RemoveFavorite")
            .ToList();

        Assert.NotEmpty(methods);

        foreach (var method in methods)
        {
            Assert.DoesNotContain(method.GetParameters(), parameter => parameter.ParameterType == typeof(long) && parameter.Name.Contains("user", StringComparison.OrdinalIgnoreCase));
        }
    }
}
