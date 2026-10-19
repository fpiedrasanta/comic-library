using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence.Configurations;

namespace Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<Domain.Entities.User> Users => Set<Domain.Entities.User>();
    public DbSet<Domain.Entities.Country> Countries => Set<Domain.Entities.Country>();
    public DbSet<Domain.Entities.File> Files => Set<Domain.Entities.File>();
    public DbSet<Domain.Entities.RefreshToken> RefreshTokens => Set<Domain.Entities.RefreshToken>();
    public DbSet<Domain.Entities.PasswordResetToken> PasswordResetTokens => Set<Domain.Entities.PasswordResetToken>();
    public DbSet<Domain.Entities.PasswordResetAuthorization> PasswordResetAuthorizations => Set<Domain.Entities.PasswordResetAuthorization>();
    public DbSet<Domain.Entities.AccountDeletionToken> AccountDeletionTokens => Set<Domain.Entities.AccountDeletionToken>();
    public DbSet<Domain.Entities.Ban> Bans => Set<Domain.Entities.Ban>();
    public DbSet<Domain.Entities.Publisher> Publishers => Set<Domain.Entities.Publisher>();
    public DbSet<Domain.Entities.Franchise> Franchises => Set<Domain.Entities.Franchise>();
    public DbSet<Domain.Entities.Series> Series => Set<Domain.Entities.Series>();
    public DbSet<Domain.Entities.Language> Languages => Set<Domain.Entities.Language>();
    public DbSet<Domain.Entities.Work> Works => Set<Domain.Entities.Work>();
    public DbSet<Domain.Entities.WorkType> WorkTypes => Set<Domain.Entities.WorkType>();
    public DbSet<Domain.Entities.Person> Persons => Set<Domain.Entities.Person>();
    public DbSet<Domain.Entities.Role> Roles => Set<Domain.Entities.Role>();
    public DbSet<Domain.Entities.Tag> Tags => Set<Domain.Entities.Tag>();
    public DbSet<Domain.Entities.ListType> ListTypes => Set<Domain.Entities.ListType>();
    public DbSet<Domain.Entities.PersonByRole> PersonByRoles => Set<Domain.Entities.PersonByRole>();
    public DbSet<Domain.Entities.TagByWork> TagByWorks => Set<Domain.Entities.TagByWork>();
    public DbSet<Domain.Entities.Page> Pages => Set<Domain.Entities.Page>();
    public DbSet<Domain.Entities.WorkList> WorkLists => Set<Domain.Entities.WorkList>();
    public DbSet<Domain.Entities.WorkListItem> WorkListItems => Set<Domain.Entities.WorkListItem>();
    public DbSet<Domain.Entities.WorkReadingProgress> WorkReadingProgresses => Set<Domain.Entities.WorkReadingProgress>();
    public DbSet<Domain.Entities.WorkRating> WorkRatings => Set<Domain.Entities.WorkRating>();
    public DbSet<Domain.Entities.ListRating> ListRatings => Set<Domain.Entities.ListRating>();
    public DbSet<Domain.Entities.ListReadingProgress> ListReadingProgresses => Set<Domain.Entities.ListReadingProgress>();
    public DbSet<Domain.Entities.Favorite> Favorites => Set<Domain.Entities.Favorite>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Domain.Entities.File>()
            .HasDiscriminator<string>("FileType")
            .HasValue<Domain.Entities.File>("File")
            .HasValue<Domain.Entities.Image>("Image");

        modelBuilder.Entity<Domain.Entities.Image>(entity =>
        {
            entity.Property(e => e.Width);
            entity.Property(e => e.Height);
            entity.Property(e => e.Type).IsRequired();
        });

        modelBuilder.ApplyConfiguration(new CountryConfiguration());
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new FileConfiguration());
        modelBuilder.ApplyConfiguration(new RefreshTokenConfiguration());
        modelBuilder.ApplyConfiguration(new PasswordResetTokenConfiguration());
        modelBuilder.ApplyConfiguration(new PasswordResetAuthorizationConfiguration());
        modelBuilder.ApplyConfiguration(new AccountDeletionTokenConfiguration());
        modelBuilder.ApplyConfiguration(new BanConfiguration());
        modelBuilder.ApplyConfiguration(new PublisherConfiguration());
        modelBuilder.ApplyConfiguration(new FranchiseConfiguration());
        modelBuilder.ApplyConfiguration(new SeriesConfiguration());
        modelBuilder.ApplyConfiguration(new LanguageConfiguration());
        modelBuilder.ApplyConfiguration(new WorkConfiguration());
        modelBuilder.ApplyConfiguration(new WorkTypeConfiguration());
        modelBuilder.ApplyConfiguration(new PersonConfiguration());
        modelBuilder.ApplyConfiguration(new RoleConfiguration());
        modelBuilder.ApplyConfiguration(new TagConfiguration());
        modelBuilder.ApplyConfiguration(new ListTypeConfiguration());
        modelBuilder.ApplyConfiguration(new PersonByRoleConfiguration());
        modelBuilder.ApplyConfiguration(new TagByWorkConfiguration());
        modelBuilder.ApplyConfiguration(new PageConfiguration());
        modelBuilder.ApplyConfiguration(new WorkListConfiguration());
        modelBuilder.ApplyConfiguration(new WorkListItemConfiguration());
        modelBuilder.ApplyConfiguration(new WorkReadingProgressConfiguration());
        modelBuilder.ApplyConfiguration(new WorkRatingConfiguration());
        modelBuilder.ApplyConfiguration(new ListRatingConfiguration());
        modelBuilder.ApplyConfiguration(new ListReadingProgressConfiguration());
        modelBuilder.ApplyConfiguration(new FavoriteConfiguration());
    }
}

