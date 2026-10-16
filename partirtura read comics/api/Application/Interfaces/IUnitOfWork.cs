using Domain.Entities;

namespace Application.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IWorkRepository WorkRepository { get; }
    IWorkTypeRepository WorkTypeRepository { get; }
    ISeriesRepository SeriesRepository { get; }
    IFranchiseRepository FranchiseRepository { get; }
    IPublisherRepository PublisherRepository { get; }
    IPersonRepository PersonRepository { get; }
    IRoleRepository RoleRepository { get; }
    IListTypeRepository ListTypeRepository { get; }
    IWorkListRepository WorkListRepository { get; }
    ITagRepository TagRepository { get; }
    ILanguageRepository LanguageRepository { get; }
    IImageRepository ImageRepository { get; }
    IPageRepository PageRepository { get; }
    IUserRepository UserRepository { get; }
    IAccountDeletionTokenRepository AccountDeletionTokenRepository { get; }
    IRefreshTokenRepository RefreshTokenRepository { get; }
    ICountryRepository CountryRepository { get; }
    IBanRepository BanRepository { get; }
    IPasswordResetTokenRepository PasswordResetTokenRepository { get; }
    IPasswordResetAuthorizationRepository PasswordResetAuthorizationRepository { get; }
    IWorkReadingProgressRepository WorkReadingProgressRepository { get; }
    IWorkRatingRepository WorkRatingRepository { get; }
    IListRatingRepository ListRatingRepository { get; }
    IListReadingProgressRepository ListReadingProgressRepository { get; }


    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransAsync(CancellationToken cancellationToken = default);
    Task CommitAsync(CancellationToken cancellationToken = default);
    Task RollbackAsync(CancellationToken cancellationToken = default);
}