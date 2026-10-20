using Application.Interfaces;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Infrastructure.Persistence;

namespace Infrastructure.Repositories;

public class UnitOfWork(ApplicationDbContext context) : IUnitOfWork
{
    private readonly ApplicationDbContext _context = context;
    private IDbContextTransaction? _transaction;

    private IWorkRepository? _workRepository;
    private IWorkTypeRepository? _workTypeRepository;
    private ISeriesRepository? _seriesRepository;
    private IFranchiseRepository? _franchiseRepository;
    private IPublisherRepository? _publisherRepository;
    private IPersonRepository? _personRepository;
    private IRoleRepository? _roleRepository;
    private IListTypeRepository? _listTypeRepository;
    private IWorkListRepository? _workListRepository;
    private IWorkListItemRepository? _workListItemRepository;
    private ITagRepository? _tagRepository;
    private ILanguageRepository? _languageRepository;
    private IImageRepository? _imageRepository;
    private IPageRepository? _pageRepository;
    private IUserRepository? _userRepository;
    private IAccountDeletionTokenRepository? _accountDeletionTokenRepository;
    private IRefreshTokenRepository? _refreshTokenRepository;
    private ICountryRepository? _countryRepository;
    private IBanRepository? _banRepository;
    private IPasswordResetTokenRepository? _passwordResetTokenRepository;
    private IPasswordResetAuthorizationRepository? _passwordResetAuthorizationRepository;
    private IWorkReadingProgressRepository? _workReadingProgressRepository;
    private IWorkRatingRepository? _workRatingRepository;
    private IListRatingRepository? _listRatingRepository;
    private IListReadingProgressRepository? _listReadingProgressRepository;
    private IFavoriteRepository? _favoriteRepository;

    public IWorkRepository WorkRepository => _workRepository ??= new WorkRepository(_context);
    public IWorkTypeRepository WorkTypeRepository => _workTypeRepository ??= new WorkTypeRepository(_context);
    public ISeriesRepository SeriesRepository => _seriesRepository ??= new SeriesRepository(_context);
    public IFranchiseRepository FranchiseRepository => _franchiseRepository ??= new FranchiseRepository(_context);
    public IPublisherRepository PublisherRepository => _publisherRepository ??= new PublisherRepository(_context);
    public IPersonRepository PersonRepository => _personRepository ??= new PersonRepository(_context);
    public IRoleRepository RoleRepository => _roleRepository ??= new RoleRepository(_context);
    public IListTypeRepository ListTypeRepository => _listTypeRepository ??= new ListTypeRepository(_context);
    public IWorkListRepository WorkListRepository => _workListRepository ??= new WorkListRepository(_context);
    public IWorkListItemRepository WorkListItemRepository => _workListItemRepository ??= new WorkListItemRepository(_context);
    public ITagRepository TagRepository => _tagRepository ??= new TagRepository(_context);
    public ILanguageRepository LanguageRepository => _languageRepository ??= new LanguageRepository(_context);
    public IImageRepository ImageRepository => _imageRepository ??= new ImageRepository(_context);
    public IPageRepository PageRepository => _pageRepository ??= new PageRepository(_context);
    public IUserRepository UserRepository => _userRepository ??= new UserRepository(_context);
    public IAccountDeletionTokenRepository AccountDeletionTokenRepository => _accountDeletionTokenRepository ??= new AccountDeletionTokenRepository(_context);
    public IRefreshTokenRepository RefreshTokenRepository => _refreshTokenRepository ??= new RefreshTokenRepository(_context);
    public ICountryRepository CountryRepository => _countryRepository ??= new CountryRepository(_context);
    public IBanRepository BanRepository => _banRepository ??= new BanRepository(_context);
    public IPasswordResetTokenRepository PasswordResetTokenRepository => _passwordResetTokenRepository ??= new PasswordResetTokenRepository(_context);
    public IPasswordResetAuthorizationRepository PasswordResetAuthorizationRepository => _passwordResetAuthorizationRepository ??= new PasswordResetAuthorizationRepository(_context);
    public IWorkReadingProgressRepository WorkReadingProgressRepository => _workReadingProgressRepository ??= new WorkReadingProgressRepository(_context);
    public IWorkRatingRepository WorkRatingRepository => _workRatingRepository ??= new WorkRatingRepository(_context);
    public IListRatingRepository ListRatingRepository => _listRatingRepository ??= new ListRatingRepository(_context);
    public IListReadingProgressRepository ListReadingProgressRepository => _listReadingProgressRepository ??= new ListReadingProgressRepository(_context);
    public IFavoriteRepository Favorites => _favoriteRepository ??= new FavoriteRepository(_context);

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransAsync(CancellationToken cancellationToken = default)
    {
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction is null) return;

        await _context.SaveChangesAsync(cancellationToken);
        await _transaction.CommitAsync(cancellationToken);
        _transaction = null;
    }

    public async Task RollbackAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction is null) return;

        await _transaction.RollbackAsync(cancellationToken);
        await _transaction.DisposeAsync();
        _transaction = null;
    }

    public void Dispose()
    {
        if (_transaction is not null)
        {
            _transaction.Rollback();
        }

        _transaction?.Dispose();
        _context.Dispose();
    }
}