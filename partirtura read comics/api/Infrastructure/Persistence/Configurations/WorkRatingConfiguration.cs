using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class WorkRatingConfiguration : IEntityTypeConfiguration<WorkRating>
{
    public void Configure(EntityTypeBuilder<WorkRating> builder)
    {
        builder.ToTable("WorkRatings");

        builder.HasKey(wr => wr.Id);
        builder.Property(wr => wr.Id).ValueGeneratedOnAdd();

        builder.Property(wr => wr.Stars)
            .IsRequired();

        builder.Property(wr => wr.CreatedAt)
            .HasColumnType("datetime(6)");

        builder.Property(wr => wr.UpdatedAt)
            .HasColumnType("datetime(6)");

        builder.Property(wr => wr.IsActive)
            .IsRequired();

        builder.HasOne(wr => wr.Work)
            .WithMany()
            .HasForeignKey("WorkId")
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();

        builder.HasOne(wr => wr.User)
            .WithMany()
            .HasForeignKey("UserId")
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();

        builder.HasIndex("WorkId", "UserId").IsUnique();
    }
}
