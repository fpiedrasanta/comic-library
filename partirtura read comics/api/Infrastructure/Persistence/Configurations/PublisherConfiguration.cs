using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class PublisherConfiguration : IEntityTypeConfiguration<Publisher>
{
    public void Configure(EntityTypeBuilder<Publisher> builder)
    {
        builder.ToTable("Publishers");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).ValueGeneratedOnAdd();

        builder.Property(p => p.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(p => p.Description)
            .HasMaxLength(1000);

        builder.Property(p => p.Website)
            .HasMaxLength(512);

        builder.Property(p => p.History)
            .HasColumnType("text");

        builder.Property(p => p.Color)
            .HasMaxLength(7);

        builder.Property(p => p.IsAlive)
            .IsRequired();

        builder.Property(p => p.IsFeatured)
            .IsRequired();

        builder.Property(p => p.IsActive)
            .IsRequired();

        builder.Property(p => p.CreatedAt)
            .HasColumnType("datetime(6)")
            .IsRequired();

        builder.HasOne(p => p.Country)
            .WithMany()
            .HasForeignKey("CountryId")
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        builder.HasOne(p => p.Image)
            .WithMany()
            .HasForeignKey("ImageId")
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasIndex(p => p.Name)
            .IsUnique();
        builder.HasIndex("CountryId");
        builder.HasIndex("ImageId");
    }
}
