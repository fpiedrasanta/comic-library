using Domain.Enums;

namespace Domain.Entities;

public class User
{
    public long Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public virtual Country? Nationality { get; set; }
    public virtual Image? Avatar { get; set; }
    public string? AvatarUrl { get; set; }
    public UserRole Role { get; set; } = UserRole.PublicUser;
    public bool IsEmailValidated { get; set; }
    public string? EmailValidationToken { get; set; }
    public DateTime? EmailValidationTokenExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public virtual ICollection<PasswordResetToken> PasswordResetTokens { get; set; } = new List<PasswordResetToken>();
    public virtual ICollection<PasswordResetAuthorization> PasswordResetAuthorizations { get; set; } = new List<PasswordResetAuthorization>();

    public string? GetCountryName()
    {
        if(this.Nationality != null) return this.Nationality.Name;
        return null;
    }
}
