namespace SmartTrafficManagement.Application.DTOs.Diagnostics;

// ── Shared response types ─────────────────────────────────────────────────────

public sealed class DiagnosticAnswerDto
{
    public Guid   Id           { get; set; }
    public string Text         { get; set; } = string.Empty;
    public bool   LeadsToResult { get; set; }   // true → answer ends the session
}

public sealed class DiagnosticQuestionDto
{
    public Guid                       Id      { get; set; }
    public string                     Text    { get; set; } = string.Empty;
    public List<DiagnosticAnswerDto>  Answers { get; set; } = [];
}

public sealed class DiagnosticResultDto
{
    public Guid   Id                     { get; set; }
    public string Title                  { get; set; } = string.Empty;
    public string Description            { get; set; } = string.Empty;
    public string RecommendedServiceType { get; set; } = string.Empty;
    public string Urgency                { get; set; } = string.Empty;
    public string? Tip                  { get; set; }
}

// ── Expert System step response ───────────────────────────────────────────────

/// <summary>
/// Returned after each question/answer step.
/// When IsComplete = false → show NextQuestion.
/// When IsComplete = true  → show Result and optionally trigger SOS.
/// </summary>
public sealed class DiagnosticStepResponseDto
{
    public bool                   IsComplete   { get; set; }
    public DiagnosticQuestionDto? NextQuestion { get; set; }
    public DiagnosticResultDto?   Result       { get; set; }
}

// ── Request ───────────────────────────────────────────────────────────────────

public sealed class SubmitAnswerRequestDto
{
    /// <summary>The ID of the answer the user selected.</summary>
    public Guid AnswerId { get; set; }
}
