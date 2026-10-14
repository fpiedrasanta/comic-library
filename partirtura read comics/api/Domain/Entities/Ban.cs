using System;

namespace Domain.Entities;

public class Ban
{
    public long Id { get; set; }
    public virtual User User { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Reason { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

    public string GetStatus()
    {
        DateTime now = DateTime.UtcNow;
        if (!IsActive) return "Revoked";
        if (StartDate <= now && (EndDate == null || EndDate > now)) return "Active";
        return "Finished";
    }


    public string? GetUserAvatarUrl()
    {
        return this.User != null ? this.User.AvatarUrl : null;
    }


    public string GetUserEmail()
    {
        return this.User != null ? this.User.Email : "";
    }


    public string GetUserFirstName()
    {
        return this.User != null ? this.User.FirstName : "";
    }


    public long GetUserId()
    {
        return this.User != null ? this.User.Id : 0;
    }

    public string GetUserLasName()
    {
        return this.User != null ? this.User.LastName : "";
    }
}
