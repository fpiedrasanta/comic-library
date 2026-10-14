using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class WorkConfiguration : IEntityTypeConfiguration<Work>
{
    public void Configure(EntityTypeBuilder<Work> builder)
    {
        builder.HasKey(work => work.Id);

        builder.Property(work => work.Title)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(work => work.Description)
            .HasMaxLength(4000);

        builder.Property(work => work.ContentError)
            .HasMaxLength(4000);

        builder.Property(work => work.IARequest);

        builder.Property(work => work.IAStatus)
            .HasConversion<int>();

        builder.Property(work => work.IAResult);

        builder.Property(work => work.IARequestedAt);

        builder.Property(work => work.NumberValue)
            .HasMaxLength(100);

        builder.HasOne(work => work.Language)
            .WithMany()
            .HasForeignKey("LanguageId")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(work => work.Cover)
            .WithMany()
            .HasForeignKey("CoverId")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(work => work.File)
            .WithMany()
            .HasForeignKey("FileId")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(work => work.Series)
            .WithMany()
            .HasForeignKey("SeriesId")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(work => work.Franchise)
            .WithMany()
            .HasForeignKey("FranchiseId")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(work => work.Publisher)
            .WithMany()
            .HasForeignKey("PublisherId")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(work => work.PreviousNumber)
            .WithMany()
            .HasForeignKey("PreviousNumberId")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(work => work.NextNumber)
            .WithMany()
            .HasForeignKey("NextNumberId")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(work => work.WorkType)
            .WithMany()
            .HasForeignKey("WorkTypeId")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex("LanguageId");
        builder.HasIndex("PublicationDate");
        builder.HasIndex("ContentStatus");
        builder.HasIndex("CoverId");
        builder.HasIndex("FileId");
        builder.HasIndex("SeriesId");
        builder.HasIndex("FranchiseId");
        builder.HasIndex("PublisherId");
        builder.HasIndex("WorkTypeId");
        builder.HasIndex("PreviousNumberId");
        builder.HasIndex("NextNumberId");
    }
}