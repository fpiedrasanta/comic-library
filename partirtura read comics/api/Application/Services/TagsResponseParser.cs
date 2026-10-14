namespace Application.Services;

internal static class TagsResponseParser
{
    public static IReadOnlyList<string> Parse(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
        {
            return [];
        }

        return content
            .Split([',', '\n', ';'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(t => t.Trim().TrimStart('"').TrimEnd('"').TrimStart('\'').TrimEnd('\''))
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .Take(5)
            .ToList();
    }
}
