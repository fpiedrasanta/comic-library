using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class FileConfiguration : IEntityTypeConfiguration<global::Domain.Entities.File>
{
    public void Configure(EntityTypeBuilder<global::Domain.Entities.File> builder)
    {
        builder.ToTable("Files");

        builder.HasKey(f => f.Id);
        builder.Property(f => f.Id).ValueGeneratedOnAdd();

        builder.Property(f => f.FileName)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(f => f.ContentType)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(f => f.Size)
            .IsRequired();

        builder.Property(f => f.StoragePath)
            .HasMaxLength(512)
            .IsRequired();

        builder.Property(f => f.CreatedAt)
            .IsRequired();

        builder.Property(f => f.IsActive)
            .IsRequired();

        builder.HasDiscriminator<string>("FileType")
            .HasValue<global::Domain.Entities.File>("File")
            .HasValue<global::Domain.Entities.Image>("Image");

        builder.HasMany(typeof(global::Domain.Entities.Image))
            .WithOne()
            .HasForeignKey("Id")
            .OnDelete(DeleteBehavior.Cascade);
    }
}
