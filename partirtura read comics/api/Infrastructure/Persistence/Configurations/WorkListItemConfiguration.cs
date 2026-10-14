using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class WorkListItemConfiguration : IEntityTypeConfiguration<WorkListItem>
{
    public void Configure(EntityTypeBuilder<WorkListItem> builder)
    {
        builder.ToTable("WorkListItems");

        builder.HasKey(wli => wli.Id);

        builder.Property(wli => wli.Position).IsRequired();

        builder.HasOne(wli => wli.WorkList)
            .WithMany(wl => wl.WorkListItems)
            .HasForeignKey("WorkListId")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(wli => wli.Work)
            .WithMany()
            .HasForeignKey("WorkId")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex("WorkListId");
        builder.HasIndex("WorkId");
        builder.HasIndex("WorkListId", "WorkId").IsUnique();
        builder.HasIndex("WorkListId", "Position").IsUnique();
    }
}
