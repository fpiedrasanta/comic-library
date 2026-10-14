using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Api.ModelBinders;

public class NullableLongModelBinder : IModelBinder
{
    public Task BindModelAsync(ModelBindingContext bindingContext)
    {
        var rawValue = bindingContext.ValueProvider.GetValue(bindingContext.ModelName);
        var value = rawValue.FirstValue;

        if (string.IsNullOrWhiteSpace(value) || value.Equals("undefined", StringComparison.OrdinalIgnoreCase) || value.Equals("null", StringComparison.OrdinalIgnoreCase))
        {
            bindingContext.Result = ModelBindingResult.Success(null);
            return Task.CompletedTask;
        }

        if (long.TryParse(value, out var result))
        {
            bindingContext.Result = ModelBindingResult.Success(result);
            return Task.CompletedTask;
        }

        bindingContext.ModelState.TryAddModelError(bindingContext.ModelName, $"The value '{value}' is not valid for {bindingContext.ModelName}.");
        return Task.CompletedTask;
    }
}

public class NullableLongModelBinderProvider : IModelBinderProvider
{
    public IModelBinder? GetBinder(ModelBinderProviderContext context)
    {
        if (context.Metadata.ModelType == typeof(long?))
        {
            return new NullableLongModelBinder();
        }

        return null;
    }
}