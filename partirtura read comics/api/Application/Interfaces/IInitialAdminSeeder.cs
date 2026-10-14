namespace Application.Interfaces;

public interface IInitialAdminSeeder
{
    Task SeedAsync(CancellationToken cancellationToken = default);
}
