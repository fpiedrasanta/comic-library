using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class FranchiseConfiguration : IEntityTypeConfiguration<Franchise>
{
    public void Configure(EntityTypeBuilder<Franchise> builder)
    {
        builder.ToTable("Franchises");

        builder.HasKey(f => f.Id);
        builder.Property(f => f.Id).ValueGeneratedOnAdd();

        builder.Property(f => f.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(f => f.Description)
            .HasMaxLength(1000);

        builder.Property(f => f.Color)
            .HasMaxLength(7);

        builder.Property(f => f.IsFeatured)
            .IsRequired();

        builder.Property(f => f.IsOngoing)
            .IsRequired();

        builder.Property(f => f.IsActive)
            .IsRequired();

        builder.Property(f => f.CreatedAt)
            .HasColumnType("datetime(6)")
            .IsRequired();

        builder.HasOne(f => f.Publisher)
            .WithMany()
            .HasForeignKey("PublisherId")
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        builder.HasOne(f => f.Image)
            .WithMany()
            .HasForeignKey("ImageId")
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasIndex(f => f.Name);
        builder.HasIndex(f => f.IsActive);
        builder.HasIndex(f => f.IsFeatured);
        builder.HasIndex(f => f.IsOngoing);
        builder.HasIndex("PublisherId");
    }
}
