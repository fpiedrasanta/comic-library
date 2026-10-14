using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class PasswordResetAuthorizationConfiguration : IEntityTypeConfiguration<PasswordResetAuthorization>
{
    public void Configure(EntityTypeBuilder<PasswordResetAuthorization> builder)
    {
        builder.ToTable("PasswordResetAuthorizations");

        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).ValueGeneratedOnAdd();

        builder.Property(a => a.TokenHash)
            .HasMaxLength(512)
            .IsRequired();

        builder.Property(a => a.CreatedAt)
            .IsRequired();

        builder.Property(a => a.ExpiresAt)
            .IsRequired();

        builder.Property(a => a.UsedAt)
            .IsRequired(false);

        builder.HasOne(a => a.User)
            .WithMany(u => u.PasswordResetAuthorizations)
            .HasForeignKey("UserId")
            .OnDelete(DeleteBehavior.Cascade);
    }
}