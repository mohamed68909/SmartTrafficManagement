using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Application.DTOs.Diagnostics;
using SmartTrafficManagement.Application.Features.Diagnostics;
using SmartTrafficManagement.Core.Common;

namespace SmartTrafficManagement.API.Controllers;

/// <summary>
/// Expert System for car diagnostics.
/// Derived from the CLIPS vehicle-system.clp knowledge base.
/// Flow: GET /start → POST /answer (repeat) → final result with recommended service.
/// </summary>
[ApiController]
[Route("api/diagnostics")]
[Authorize]
public sealed class DiagnosticsController : BaseController
{
    /// <summary>Returns the root question (entry point of the decision tree).</summary>
    [AllowAnonymous]
    [HttpGet("start")]
    [ProducesResponseType(typeof(Result<DiagnosticQuestionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Start(
        [FromServices] GetRootQuestionQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(new GetRootQuestionQuery(), cancellationToken);
        return ProcessResult(result);
    }

    /// <summary>
    /// Submits the user's selected answer ID.
    /// Returns either the next question (IsComplete = false) or the final diagnosis (IsComplete = true).
    /// </summary>
    [AllowAnonymous]
    [HttpPost("answer")]
    [ProducesResponseType(typeof(Result<DiagnosticStepResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> SubmitAnswer(
        [FromBody] SubmitAnswerRequestDto request,
        [FromServices] SubmitAnswerCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(
            new SubmitAnswerCommand(request.AnswerId), cancellationToken);
        return ProcessResult(result);
    }
}
