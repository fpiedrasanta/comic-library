namespace Application.DTOs;

public record GetCatalogPublishersRequest(
    int currentPage = 1,
    int pageSize = PaginationGuard.CatalogCardDefaultPageSize,
    string? search = null);

public record GetCatalogFranchisesRequest(
    int currentPage = 1,
    int pageSize = PaginationGuard.CatalogCardDefaultPageSize,
    string? search = null);

public record GetCatalogSeriesRequest(
    int currentPage = 1,
    int pageSize = PaginationGuard.CatalogCardDefaultPageSize,
    string? search = null);

public record CatalogNodeDto(
    long Id,
    string Name,
    string? Color);

public record CatalogPublisherCardDto(
    long Id,
    string Name,
    string? Color,
    string? UrlImage);

public record CatalogFranchiseCardDto(
    long Id,
    string Name,
    string? Color,
    string? UrlImage,
    CatalogNodeDto Publisher);

public record CatalogSeriesCardDto(
    long Id,
    string Name,
    string? Color,
    string? UrlImage,
    CatalogNodeDto Franchise,
    CatalogNodeDto Publisher);