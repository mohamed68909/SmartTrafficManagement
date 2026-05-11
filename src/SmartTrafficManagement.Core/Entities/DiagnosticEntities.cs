namespace SmartTrafficManagement.Core.Entities;

/// <summary>
/// A node in the car-diagnostics decision tree.
/// Each question has multiple answers; each answer either points to the next question
/// or to a final DiagnosticResult.
/// </summary>
public sealed class DiagnosticQuestion : BaseEntity
{
    /// <summary>The question text shown to the user.</summary>
    public string Text { get; set; } = string.Empty;

    /// <summary>Display order (lower = shown first).</summary>
    public int Order { get; set; }

    /// <summary>True if this is the entry-point question (root of the tree).</summary>
    public bool IsRoot { get; set; }

    // Navigation
    public ICollection<DiagnosticAnswer> Answers { get; set; } = new List<DiagnosticAnswer>();
}

/// <summary>
/// An answer option for a DiagnosticQuestion.
/// Points either to the next question OR to a final result (not both).
/// </summary>
public sealed class DiagnosticAnswer : BaseEntity
{
    public Guid QuestionId { get; set; }

    /// <summary>The answer label shown to the user (e.g. "Yes", "No", "Sometimes").</summary>
    public string Text { get; set; } = string.Empty;

    /// <summary>If set, this answer leads to another question.</summary>
    public Guid? NextQuestionId { get; set; }

    /// <summary>If set, this answer terminates the diagnostic with a result.</summary>
    public Guid? ResultId { get; set; }

    // Navigation
    public DiagnosticQuestion Question     { get; set; } = null!;
    public DiagnosticQuestion? NextQuestion { get; set; }
    public DiagnosticResult?   Result       { get; set; }
}

/// <summary>
/// The final diagnosis produced by the Expert System.
/// Contains a human-readable description and the recommended service type.
/// </summary>
public sealed class DiagnosticResult : BaseEntity
{
    /// <summary>Short title (e.g. "Battery Issue").</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Full description of the likely problem.</summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Recommended service type that maps to ServiceType enum.
    /// E.g. "Towing", "Maintenance", "Emergency".
    /// </summary>
    public string RecommendedServiceType { get; set; } = string.Empty;

    /// <summary>Urgency level: Low / Medium / High.</summary>
    public string Urgency { get; set; } = "Medium";

    /// <summary>Optional advice shown to the user before requesting a service.</summary>
    public string? Tip { get; set; }
}
