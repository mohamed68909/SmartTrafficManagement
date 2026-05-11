using SmartTrafficManagement.Core.Entities;

namespace SmartTrafficManagement.Core.Interfaces;

public interface IDiagnosticsRepository
{
    Task<DiagnosticQuestion?> GetRootQuestionAsync(CancellationToken cancellationToken = default);

    Task<DiagnosticAnswer?> GetAnswerWithNextAsync(Guid answerId, CancellationToken cancellationToken = default);
}
