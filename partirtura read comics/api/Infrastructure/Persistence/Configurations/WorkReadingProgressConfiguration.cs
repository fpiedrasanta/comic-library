using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class WorkReadingProgressConfiguration : IEntityTypeConfiguration<WorkReadingProgress>
{
    public void Configure(EntityTypeBuilder<WorkReadingProgress> builder)
    {
        builder.ToTable("WorkReadingProgresses");

        builder.HasKey(wrp => wrp.Id);
        builder.Property(wrp => wrp.Id).ValueGeneratedOnAdd();

        builder.Property(wrp => wrp.CurrentPage)
            .IsRequired();

        builder.Property(wrp => wrp.TotalPages)
            .IsRequired();

        builder.Property(wrp => wrp.PercentageReading)
            .IsRequired();

        builder.Property(wrp => wrp.LastReadAt)
            .HasColumnType("datetime(6)");

        builder.Property(wrp => wrp.State)
            .HasConversion<int>()
            .IsRequired();

        builder.HasOne(wrp => wrp.Work)
            .WithMany()
            .HasForeignKey("WorkId")
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();

        builder.HasOne(wrp => wrp.User)
            .WithMany()
            .HasForeignKey("UserId")
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();

        builder.HasIndex("WorkId", "UserId").IsUnique();
    }
}