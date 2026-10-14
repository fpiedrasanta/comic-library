using Application.Interfaces;
using System.Text.RegularExpressions;

namespace Infrastructure.Services;

public class PasswordValidator : IPasswordValidator
{
    public bool IsValid(string password, out string error)
    {
        if (string.IsNullOrEmpty(password) || password.Length < 8)
        {
            error = "Password must be at least 8 characters long.";
            return false;
        }

        if (!Regex.IsMatch(password, @"\d"))
        {
            error = "Password must contain at least one number.";
            return false;
        }

        if (!Regex.IsMatch(password, @"[a-z]"))
        {
            error = "Password must contain at least one lowercase letter.";
            return false;
        }

        if (!Regex.IsMatch(password, @"[A-Z]"))
        {
            error = "Password must contain at least one uppercase letter.";
            return false;
        }

        if (!Regex.IsMatch(password, @"[^a-zA-Z0-9]"))
        {
            error = "Password must contain at least one special character.";
            return false;
        }

        error = string.Empty;
        return true;
    }
}