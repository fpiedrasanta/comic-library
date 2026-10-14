using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class WorkListConfiguration : IEntityTypeConfiguration<WorkList>
{
    public void Configure(EntityTypeBuilder<WorkList> builder)
    {
        builder.ToTable("WorkLists", tableBuilder =>
            tableBuilder.HasCheckConstraint(
                "CK_WorkLists_Owner",
                "(OwnerType = 0 AND OwnerId IS NULL) OR (OwnerType = 1 AND OwnerId IS NOT NULL)"));

        builder.HasKey(wl => wl.Id);
        builder.Property(wl => wl.Id).ValueGeneratedOnAdd();

        builder.Property(wl => wl.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(wl => wl.Description)
            .HasMaxLength(2000);

        builder.Property(wl => wl.Color)
            .HasMaxLength(7);

        builder.Property(wl => wl.OwnerType)
            .IsRequired();

        builder.Property(wl => wl.Visibility)
            .IsRequired();

        builder.Property(wl => wl.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(wl => wl.CreatedAt)
            .HasColumnType("datetime(6)")
            .IsRequired();

        builder.HasOne(wl => wl.Cover)
            .WithMany()
            .HasForeignKey("CoverId")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(wl => wl.ListType)
            .WithMany()
            .HasForeignKey("ListTypeId")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(wl => wl.Owner)
            .WithMany()
            .HasForeignKey("OwnerId")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(wl => wl.Name);
        builder.HasIndex("ListTypeId");
        builder.HasIndex("CoverId");
        builder.HasIndex("OwnerId");
        builder.HasIndex("Visibility");
        builder.HasIndex("IsActive");

    }
}
