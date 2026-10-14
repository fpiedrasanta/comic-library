using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class SeriesConfiguration : IEntityTypeConfiguration<Series>
{
    public void Configure(EntityTypeBuilder<Series> builder)
    {
        builder.ToTable("Series");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).ValueGeneratedOnAdd();

        builder.Property(s => s.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(s => s.Description)
            .HasMaxLength(1000);

        builder.Property(s => s.Color)
            .HasMaxLength(7);

        builder.Property(s => s.IsFeatured)
            .IsRequired();

        builder.Property(s => s.IsOngoing)
            .IsRequired();

        builder.Property(s => s.IsActive)
            .IsRequired();

        builder.Property(s => s.CreatedAt)
            .HasColumnType("datetime(6)")
            .IsRequired();

        builder.HasOne(s => s.Franchise)
            .WithMany()
            .HasForeignKey("FranchiseId")
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        builder.HasOne(s => s.Image)
            .WithMany()
            .HasForeignKey("ImageId")
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasIndex(s => s.Name);
        builder.HasIndex(s => s.IsActive);
        builder.HasIndex(s => s.IsFeatured);
        builder.HasIndex(s => s.IsOngoing);
        builder.HasIndex("FranchiseId");
    }
}
