namespace SmartTrafficManagement.Infrastructure.Persistence.Repositories;

public sealed class AuthRepository : IAuthRepository
{
    private readonly ApplicationDbContext _dbContext;

    public AuthRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddRefreshTokenAsync(RefreshToken token, CancellationToken cancellationToken = default)
    {
        await _dbContext.RefreshTokens.AddAsync(token, cancellationToken);
    }

    public async Task<RefreshToken?> GetActiveRefreshTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await _dbContext.RefreshTokens
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.Token == token && x.RevokedOnUtc == null, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
