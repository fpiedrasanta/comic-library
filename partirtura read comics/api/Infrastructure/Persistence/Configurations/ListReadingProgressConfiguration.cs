using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class ListReadingProgressConfiguration : IEntityTypeConfiguration<ListReadingProgress>
{
    public void Configure(EntityTypeBuilder<ListReadingProgress> builder)
    {
        builder.ToTable("ListReadingProgresses");

        builder.HasKey(lrp => lrp.Id);
        builder.Property(lrp => lrp.Id).ValueGeneratedOnAdd();

        builder.Property(lrp => lrp.LastReadAt)
            .HasColumnType("datetime(6)");

        builder.HasOne(lrp => lrp.WorkList)
            .WithMany()
            .HasForeignKey("WorkListId")
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();

        builder.HasOne(lrp => lrp.User)
            .WithMany()
            .HasForeignKey("UserId")
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();

        builder.HasOne(lrp => lrp.CurrentWork)
            .WithMany()
            .HasForeignKey("CurrentWorkId")
            .OnDelete(DeleteBehavior.ClientSetNull)
            .IsRequired(false);

        builder.HasIndex("WorkListId", "UserId").IsUnique();
    }
}
