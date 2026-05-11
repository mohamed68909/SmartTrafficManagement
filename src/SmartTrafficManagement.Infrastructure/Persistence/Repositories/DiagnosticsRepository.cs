using Microsoft.EntityFrameworkCore;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Interfaces;
using SmartTrafficManagement.Infrastructure.Persistence;

namespace SmartTrafficManagement.Infrastructure.Persistence.Repositories;

public sealed class DiagnosticsRepository : IDiagnosticsRepository
{
    private readonly ApplicationDbContext _db;

    public DiagnosticsRepository(ApplicationDbContext db) => _db = db;

    public async Task<DiagnosticQuestion?> GetRootQuestionAsync(CancellationToken cancellationToken = default)
        => await _db.DiagnosticQuestions
            .AsNoTracking()
            .Include(q => q.Answers)
            .FirstOrDefaultAsync(q => q.IsRoot && !q.IsDeleted, cancellationToken);

    public async Task<DiagnosticAnswer?> GetAnswerWithNextAsync(Guid answerId, CancellationToken cancellationToken = default)
        => await _db.DiagnosticAnswers
            .AsNoTracking()
            .Include(a => a.NextQuestion)
                .ThenInclude(q => q!.Answers)
            .Include(a => a.Result)
            .FirstOrDefaultAsync(a => a.Id == answerId && !a.IsDeleted, cancellationToken);
}
