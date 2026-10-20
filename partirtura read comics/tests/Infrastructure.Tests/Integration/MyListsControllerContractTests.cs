using System.Reflection;
using Api.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace Infrastructure.Tests.Integration;

public class MyListsControllerContractTests
{
    [Fact]
    public void MyListsController_RequiresAuthenticatedUser()
    {
        var authorize = typeof(MyListsController).GetCustomAttribute<AuthorizeAttribute>();
        var allowAnonymous = typeof(MyListsController).GetCustomAttribute<AllowAnonymousAttribute>();

        Assert.NotNull(authorize);
        Assert.Null(allowAnonymous);
    }

    [Fact]
    public void MyListsController_DoesNotRequireAdministratorRole()
    {
        var authorize = typeof(MyListsController).GetCustomAttribute<AuthorizeAttribute>();

        Assert.NotNull(authorize);
        Assert.True(string.IsNullOrEmpty(authorize!.Roles));
    }

    [Fact]
    public void MyListsController_ExposesThePersonalListsRoute()
    {
        var route = typeof(MyListsController).GetCustomAttribute<RouteAttribute>();

        Assert.NotNull(route);
        Assert.Equal("api/users/me/lists", route!.Template);
    }

    [Theory]
    [InlineData("Create", "Post")]
    [InlineData("Update", "Put")]
    [InlineData("Delete", "Delete")]
    [InlineData("AddWork", "Post")]
    [InlineData("RemoveWork", "Delete")]
    [InlineData("ReorderWorks", "Put")]
    public void MyListsController_ExposesTheExpectedVerbs(string actionName, string verb)
    {
        var method = typeof(MyListsController).GetMethod(actionName);
        Assert.NotNull(method);

        var attribute = method!.GetCustomAttributes()
            .FirstOrDefault(candidate => candidate.GetType().Name == $"Http{verb}Attribute");

        Assert.NotNull(attribute);
    }

    [Fact]
    public void MyListsController_ExposesTheWorkRoutes()
    {
        var addWork = typeof(MyListsController).GetMethod("AddWork")!
            .GetCustomAttribute<HttpPostAttribute>();
        var removeWork = typeof(MyListsController).GetMethod("RemoveWork")!
            .GetCustomAttribute<HttpDeleteAttribute>();
        var reorder = typeof(MyListsController).GetMethod("ReorderWorks")!
            .GetCustomAttribute<HttpPutAttribute>();

        Assert.Equal("{listId:long}/works", addWork!.Template);
        Assert.Equal("{listId:long}/works/{workId:long}", removeWork!.Template);
        Assert.Equal("{listId:long}/works/order", reorder!.Template);
    }

    [Fact]
    public void MyListsController_DoesNotAcceptAUserIdFromTheClient()
    {
        var methods = typeof(MyListsController)
            .GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(method => !method.Name.Contains("GetUserId", StringComparison.Ordinal))
            .ToList();

        Assert.NotEmpty(methods);

        foreach (var method in methods)
        {
            Assert.DoesNotContain(method.GetParameters(), parameter =>
                parameter.ParameterType == typeof(long) && parameter.Name.Contains("user", StringComparison.OrdinalIgnoreCase));
        }
    }
}
