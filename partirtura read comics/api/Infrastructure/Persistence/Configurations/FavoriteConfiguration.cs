using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class FavoriteConfiguration : IEntityTypeConfiguration<Favorite>
    {
        public void Configure(EntityTypeBuilder<Favorite> builder)
        {
            builder.ToTable("Favorites");

            builder.HasKey(f => f.Id);

            builder.HasOne(f => f.User)
                   .WithMany()
                   .IsRequired();

            builder.HasOne(f => f.Work)
                   .WithMany()
                   .IsRequired();

            builder.HasIndex("UserId", "WorkId")
                   .IsUnique();
        }
    }
}
