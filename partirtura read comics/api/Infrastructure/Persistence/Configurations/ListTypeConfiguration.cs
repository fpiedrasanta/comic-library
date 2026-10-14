using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class ListTypeConfiguration : IEntityTypeConfiguration<ListType>
{
    public void Configure(EntityTypeBuilder<ListType> builder)
    {
        builder.ToTable("ListTypes");

        builder.HasKey(lt => lt.Id);
        builder.Property(lt => lt.Id).ValueGeneratedOnAdd();

        builder.Property(lt => lt.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(lt => lt.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(lt => lt.CreatedAt)
            .HasColumnType("datetime(6)")
            .IsRequired();

        builder.HasIndex(lt => lt.Name).IsUnique();
    }
}
