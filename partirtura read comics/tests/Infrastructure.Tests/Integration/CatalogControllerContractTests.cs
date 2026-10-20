using System.Reflection;
using Api.Controllers;
using Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace Infrastructure.Tests.Integration;

public class CatalogControllerContractTests
{
    public static TheoryData<string, string, Type> Endpoints => new()
    {
        { "publishers", "GetPublishers", typeof(GetCatalogPublishersRequest) },
        { "franchises", "GetFranchises", typeof(GetCatalogFranchisesRequest) },
        { "series", "GetSeries", typeof(GetCatalogSeriesRequest) },
        { "lists", "GetLists", typeof(GetCatalogListsRequest) }
    };

    [Fact]
    public void CatalogController_RequiresAuthenticatedUserWithoutAdministratorRole()
    {
        var authorize = typeof(CatalogController).GetCustomAttribute<AuthorizeAttribute>();
        var allowAnonymous = typeof(CatalogController).GetCustomAttribute<AllowAnonymousAttribute>();

        Assert.NotNull(authorize);
        Assert.Null(allowAnonymous);
        Assert.True(string.IsNullOrEmpty(authorize!.Roles));
    }

    [Fact]
    public void CatalogController_UsesCatalogRoutePrefix()
    {
        var route = typeof(CatalogController).GetCustomAttribute<RouteAttribute>();

        Assert.NotNull(route);
        Assert.Equal("api/catalog", route!.Template);
    }

    [Theory]
    [MemberData(nameof(Endpoints))]
    public void CatalogController_ExposesGetPerEntity(string segment, string actionName, Type requestType)
    {
        var method = typeof(CatalogController).GetMethod(actionName);
        var httpGet = method!.GetCustomAttribute<HttpGetAttribute>();
        var parameters = method.GetParameters();

        Assert.NotNull(httpGet);
        Assert.Equal(segment, httpGet!.Template);
        Assert.Equal(requestType, parameters[0].ParameterType);
        Assert.Equal(typeof(CancellationToken), parameters[1].ParameterType);
        Assert.Equal(typeof(Task<IActionResult>), method.ReturnType);
    }

    [Fact]
    public void CatalogController_ExposesGetListById()
    {
        var method = typeof(CatalogController).GetMethod("GetList");
        var httpGet = method!.GetCustomAttribute<HttpGetAttribute>();
        var parameters = method.GetParameters();

        Assert.NotNull(httpGet);
        Assert.Equal("lists/{id:long}", httpGet!.Template);
        Assert.Equal(typeof(long), parameters[0].ParameterType);
        Assert.Equal(typeof(CancellationToken), parameters[1].ParameterType);
        Assert.Equal(typeof(Task<IActionResult>), method.ReturnType);
    }

    [Fact]
    public void CatalogRequests_AcceptOnlyPagingAndSearch()
    {
        AssertRequestShape(typeof(GetCatalogPublishersRequest));
        AssertRequestShape(typeof(GetCatalogFranchisesRequest));
        AssertRequestShape(typeof(GetCatalogSeriesRequest));
        AssertRequestShape(typeof(GetCatalogListsRequest));
    }

    [Fact]
    public void CatalogCardDtos_ExposeOnlyTheCardInformation()
    {
        AssertShape(typeof(CatalogPublisherCardDto), "Id", "Name", "Color", "UrlImage");
        AssertShape(typeof(CatalogFranchiseCardDto), "Id", "Name", "Color", "UrlImage", "Publisher");
        AssertShape(typeof(CatalogSeriesCardDto), "Id", "Name", "Color", "UrlImage", "Franchise", "Publisher");
        AssertShape(typeof(CatalogListCardDto), "Id", "Name", "ListTypeId", "ListTypeName", "Color", "UrlCover", "WorkCount", "ReadingProgressPercentage", "AverageRating", "RatingCount");
        AssertShape(typeof(CatalogNodeDto), "Id", "Name", "Color");
    }

    [Fact]
    public void CatalogListDetailDto_ExposesRequiredFields()
    {
        AssertShape(typeof(CatalogListDetailDto), "Id", "Name", "ListTypeId", "ListTypeName", "Description", "Color", "UrlCover", "WorkCount", "ReadingProgressPercentage", "CurrentWorkId", "AverageRating", "RatingCount", "Works");
    }

    [Fact]
    public void CatalogListWorkItemDto_ExposesRequiredFields()
    {
        AssertShape(typeof(CatalogListWorkItemDto), "Position", "Work");
    }

    [Fact]
    public void CatalogListWorkDto_ExposesRequiredFields()
    {
        AssertShape(typeof(CatalogListWorkDto), "Id", "Title", "Description", "PublisherId", "PublisherName", "PublisherColor", "FranchiseId", "FranchiseName", "FranchiseColor", "SeriesId", "SeriesName", "SeriesColor", "PublicationDate", "UrlCover", "WorkTypeId", "WorkTypeName", "NumberValue", "CreatedAt", "ReadingProgressPercentage");
    }

    private static void AssertRequestShape(Type requestType)
    {
        var properties = requestType.GetProperties().Select(property => property.Name).OrderBy(name => name).ToArray();

        if (requestType == typeof(GetCatalogListsRequest))
        {
            Assert.Equal(new[] { "currentPage", "franchiseId", "listTypeId", "myLists", "orderBy", "orderDir", "pageSize", "publisherId", "search", "seriesId" }, properties);
        }
        else
        {
            Assert.Equal(new[] { "currentPage", "pageSize", "search" }, properties);
        }
    }

    private static void AssertShape(Type type, params string[] expectedProperties)
    {
        var actual = type.GetProperties().Select(property => property.Name).OrderBy(name => name).ToArray();

        Assert.Equal(expectedProperties.OrderBy(name => name).ToArray(), actual);
        Assert.DoesNotContain("IsActive", actual);
        Assert.DoesNotContain("IsFeatured", actual);
        Assert.DoesNotContain("IsOngoing", actual);
        Assert.DoesNotContain("IsAlive", actual);
        Assert.DoesNotContain("CountryName", actual);
    }
}