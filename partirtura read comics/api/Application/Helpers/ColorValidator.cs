using System.Text.RegularExpressions;

namespace Application.Helpers;

public static partial class ColorValidator
{
    [GeneratedRegex(@"^#[0-9A-Fa-f]{6}$", RegexOptions.Compiled)]
    private static partial Regex HexColorRegex();

    public static bool IsValidHex(string? color)
    {
        if (string.IsNullOrWhiteSpace(color))
        {
            return false;
        }
        return HexColorRegex().IsMatch(color);
    }
}
