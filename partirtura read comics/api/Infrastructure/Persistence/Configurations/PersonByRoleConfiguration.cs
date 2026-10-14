using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class PersonByRoleConfiguration : IEntityTypeConfiguration<PersonByRole>
{
    public void Configure(EntityTypeBuilder<PersonByRole> builder)
    {
        builder.ToTable("PersonByRoles");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).ValueGeneratedOnAdd();

        builder.HasOne(p => p.Work)
            .WithMany(w => w.PersonByRoles)
            .HasForeignKey("WorkId")
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();

        builder.HasIndex("WorkId", "PersonId", "RoleId").IsUnique();
        builder.HasIndex("PersonId");
        builder.HasIndex("RoleId");
    }
}