using SmartTrafficManagement.Application.DTOs.Diagnostics;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Diagnostics;

// ── Commands & Queries ────────────────────────────────────────────────────────

public sealed record GetRootQuestionQuery();
public sealed record SubmitAnswerCommand(Guid AnswerId);

// ── GetRootQuestion Handler ───────────────────────────────────────────────────

public sealed class GetRootQuestionQueryHandler
{
    private readonly IDiagnosticsRepository _repo;

    public GetRootQuestionQueryHandler(IDiagnosticsRepository repo) => _repo = repo;

    public async Task<Result<DiagnosticQuestionDto>> Handle(
        GetRootQuestionQuery query,
        CancellationToken cancellationToken)
    {
        var question = await _repo.GetRootQuestionAsync(cancellationToken);

        if (question is null)
            return Result<DiagnosticQuestionDto>.Failure(
                "NOT_SEEDED",
                "Expert system not seeded yet. Please contact the administrator.",
                404);

        return Result<DiagnosticQuestionDto>.Success(MapQuestion(question), 200);
    }

    internal static DiagnosticQuestionDto MapQuestion(DiagnosticQuestion q) => new()
    {
        Id      = q.Id,
        Text    = q.Text,
        Answers = q.Answers
            .Where(a => !a.IsDeleted)
            .Select(a => new DiagnosticAnswerDto
            {
                Id            = a.Id,
                Text          = a.Text,
                LeadsToResult = a.ResultId.HasValue
            })
            .ToList()
    };
}

// ── SubmitAnswer Handler ──────────────────────────────────────────────────────

public sealed class SubmitAnswerCommandHandler
{
    private readonly IDiagnosticsRepository _repo;

    public SubmitAnswerCommandHandler(IDiagnosticsRepository repo) => _repo = repo;

    public async Task<Result<DiagnosticStepResponseDto>> Handle(
        SubmitAnswerCommand command,
        CancellationToken cancellationToken)
    {
        var answer = await _repo.GetAnswerWithNextAsync(command.AnswerId, cancellationToken);

        if (answer is null)
            return Result<DiagnosticStepResponseDto>.Failure("NOT_FOUND", "Answer not found.", 404);

        // ── Terminal: return the final result ─────────────────────────────────
        if (answer.Result is not null)
        {
            return Result<DiagnosticStepResponseDto>.Success(new DiagnosticStepResponseDto
            {
                IsComplete = true,
                Result     = new DiagnosticResultDto
                {
                    Id                     = answer.Result.Id,
                    Title                  = answer.Result.Title,
                    Description            = answer.Result.Description,
                    RecommendedServiceType = answer.Result.RecommendedServiceType,
                    Urgency                = answer.Result.Urgency,
                    Tip                    = answer.Result.Tip
                }
            }, 200);
        }

        // ── Intermediate: return the next question ────────────────────────────
        if (answer.NextQuestion is not null)
        {
            return Result<DiagnosticStepResponseDto>.Success(new DiagnosticStepResponseDto
            {
                IsComplete   = false,
                NextQuestion = GetRootQuestionQueryHandler.MapQuestion(answer.NextQuestion)
            }, 200);
        }

        return Result<DiagnosticStepResponseDto>.Failure(
            "NO_FOLLOWUP",
            "This answer has no follow-up configured.",
            500);
    }
}
