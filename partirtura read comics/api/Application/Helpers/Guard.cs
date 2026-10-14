using Domain.Exceptions;

namespace Application.Helpers;

public static class Guard
{
    public static void Require<T>(T? entity, string message) where T : class
    {
        if (entity is null)
        {
            throw new BusinessNotFoundException(message);
        }
    }

    public static void RequireActive<T>(T? entity, string entityName) where T : class
    {
        if (entity is null)
        {
            throw new BusinessNotFoundException($"{entityName} no existe.");
        }

        var property = typeof(T).GetProperty("IsActive");
        if (property is null || property.PropertyType != typeof(bool))
        {
            return;
        }

        var isActive = (bool)(property.GetValue(entity) ?? false);
        if (!isActive)
        {
            throw new BusinessNotFoundException($"{entityName} no existe o no está activa.");
        }
    }

    public static void RequireGreaterThan(long value, string paramName)
    {
        if (value <= 0)
        {
            throw new ValidationException($"El identificador {paramName} es obligatorio.");
        }
    }

    public static void RequireNotEmpty(byte[]? data, string paramName)
    {
        if (data is null || data.Length == 0)
        {
            throw new ValidationException($"El archivo {paramName} es obligatorio.");
        }
    }

    public static void RequireNotEmpty(string? value, string fieldName)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ValidationException($"El campo {fieldName} es obligatorio.");
        }
    }
}
