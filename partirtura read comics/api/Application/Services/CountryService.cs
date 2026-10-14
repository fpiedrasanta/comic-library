using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Application.Mappers;
using Domain.Entities;
using Domain.Exceptions;

namespace Application.Services;

public class CountryService : ICountryService
{
    private readonly IUnitOfWork _unitOfWork;

    public CountryService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ListResponse<CountryDto>> GetPagedAsync(ListRequest request, CancellationToken cancellationToken = default)
    {
        return await GetPagedInternalAsync(request.currentPage, request.pageSize, request.orderBy, request.orderDir, request.search, true, cancellationToken);
    }

    public async Task<ListResponse<CountryDto>> GetPagedAsync(GetCountriesRequest request, CancellationToken cancellationToken = default)
    {
        return await GetPagedInternalAsync(request.currentPage, request.pageSize, request.orderBy, request.orderDir, request.search, request.IsActive, cancellationToken);
    }

    private async Task<ListResponse<CountryDto>> GetPagedInternalAsync(int currentPage, int pageSize, string? orderBy, string orderDir, string? search, bool? isActiveFilter, CancellationToken cancellationToken)
    {
        if (currentPage < 1) currentPage = 1;
        if (pageSize < 1) pageSize = 12;
        if (pageSize > 50) pageSize = 50;
        if (string.IsNullOrWhiteSpace(orderDir)) orderDir = SortDirection.ASC;

        (IReadOnlyList<Country> countries, int totalCount) = await _unitOfWork.CountryRepository.GetPagedAsync(currentPage, pageSize, orderBy, orderDir, search, isActiveFilter, cancellationToken);

        var dtos = countries.ToDtoList();

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        return new ListResponse<CountryDto>(
            currentPage,
            currentPage < totalPages,
            currentPage > 1,
            totalPages,
            pageSize,
            currentPage < totalPages ? currentPage + 1 : null,
            currentPage > 1 ? currentPage - 1 : null,
            totalCount,
            dtos);
    }

    public async Task<Country> CreateCountryAsync(CreateCountryRequest request, CancellationToken cancellationToken = default)
    {
        var code = request.Code.Trim();
        var name = request.Name.Trim();

        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ValidationException("El código es obligatorio.");
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ValidationException("El nombre es obligatorio.");
        }

        var existingByCode = await _unitOfWork.CountryRepository.GetByCodeAsync(code, cancellationToken);
        if (existingByCode != null)
        {
            throw new BusinessConflictException("Ya existe un país con el mismo código.");
        }

        var existingByName = await _unitOfWork.CountryRepository.GetByNameAsync(name, cancellationToken);
        if (existingByName != null)
        {
            throw new BusinessConflictException("Ya existe un país con el mismo nombre.");
        }

        var country = new Country
        {
            Code = code,
            Name = name,
            IsActive = true
        };

        await _unitOfWork.CountryRepository.AddAsync(country, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return country;
    }

    public async Task<Country> UpdateCountryAsync(long countryId, UpdateCountryRequest request, CancellationToken cancellationToken = default)
    {
        var country = await _unitOfWork.CountryRepository.GetByIdAsync(countryId, cancellationToken);
        if (country == null)
        {
            throw new BusinessNotFoundException("El país no existe.");
        }

        var code = request.Code.Trim();
        var name = request.Name.Trim();

        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ValidationException("El código es obligatorio.");
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ValidationException("El nombre es obligatorio.");
        }

        var existingByCode = await _unitOfWork.CountryRepository.GetByCodeAsync(code, cancellationToken);
        if (existingByCode != null && existingByCode.Id != countryId)
        {
            throw new BusinessConflictException("Ya existe un país con el mismo código.");
        }

        var existingByName = await _unitOfWork.CountryRepository.GetByNameAsync(name, cancellationToken);
        if (existingByName != null && existingByName.Id != countryId)
        {
            throw new BusinessConflictException("Ya existe un país con el mismo nombre.");
        }

        country.Code = code;
        country.Name = name;

        await _unitOfWork.CountryRepository.UpdateAsync(country, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return country;
    }

    public async Task DeactivateCountryAsync(long countryId, CancellationToken cancellationToken = default)
    {
        var country = await _unitOfWork.CountryRepository.GetByIdAsync(countryId, cancellationToken);
        if (country == null)
        {
            throw new BusinessNotFoundException("El país no existe.");
        }

        if (!country.IsActive)
        {
            return;
        }

        country.IsActive = false;

        await _unitOfWork.CountryRepository.UpdateAsync(country, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ActivateCountryAsync(long countryId, CancellationToken cancellationToken = default)
    {
        var country = await _unitOfWork.CountryRepository.GetByIdAsync(countryId, cancellationToken);
        if (country == null)
        {
            throw new BusinessNotFoundException("El país no existe.");
        }

        if (country.IsActive)
        {
            return;
        }

        country.IsActive = true;

        await _unitOfWork.CountryRepository.UpdateAsync(country, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
