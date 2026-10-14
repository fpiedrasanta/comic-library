using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class ListRatingConfiguration : IEntityTypeConfiguration<ListRating>
{
    public void Configure(EntityTypeBuilder<ListRating> builder)
    {
        builder.ToTable("ListRatings");

        builder.HasKey(lr => lr.Id);
        builder.Property(lr => lr.Id).ValueGeneratedOnAdd();

        builder.Property(lr => lr.Stars)
            .IsRequired();

        builder.Property(lr => lr.CreatedAt)
            .HasColumnType("datetime(6)");

        builder.Property(lr => lr.UpdatedAt)
            .HasColumnType("datetime(6)");

        builder.Property(lr => lr.IsActive)
            .IsRequired();

        builder.HasOne(lr => lr.WorkList)
            .WithMany()
            .HasForeignKey("WorkListId")
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();

        builder.HasOne(lr => lr.User)
            .WithMany()
            .HasForeignKey("UserId")
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();

        builder.HasIndex("WorkListId", "UserId").IsUnique();
    }
}
