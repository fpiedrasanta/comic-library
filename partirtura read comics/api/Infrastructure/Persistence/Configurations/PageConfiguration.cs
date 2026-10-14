using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class PageConfiguration : IEntityTypeConfiguration<Page>
{
    public void Configure(EntityTypeBuilder<Page> builder)
    {
        builder.ToTable("Pages");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).ValueGeneratedOnAdd();

        builder.Property(p => p.Order)
            .IsRequired();

        builder.HasOne(p => p.Work)
            .WithMany(w => w.Pages)
            .HasForeignKey("WorkId")
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();

        builder.HasOne(p => p.Image)
            .WithMany()
            .HasForeignKey("ImageId")
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        builder.HasIndex("WorkId", nameof(Page.Order)).IsUnique();
        builder.HasIndex("ImageId");
    }
}