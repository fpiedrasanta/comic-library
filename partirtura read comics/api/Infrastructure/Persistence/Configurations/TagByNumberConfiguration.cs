using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class TagByWorkConfiguration : IEntityTypeConfiguration<TagByWork>
{
    public void Configure(EntityTypeBuilder<TagByWork> builder)
    {
        builder.ToTable("TagByWorks");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).ValueGeneratedOnAdd();

        builder.HasOne(t => t.Work)
            .WithMany(w => w.Tags)
            .HasForeignKey("WorkId")
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();

        builder.HasOne(t => t.Tag)
            .WithMany()
            .HasForeignKey("TagId")
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        builder.HasIndex("WorkId", "TagId").IsUnique();
        builder.HasIndex("TagId");
    }
}