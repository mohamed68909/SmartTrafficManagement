using FluentValidation;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Enums;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Support.CloseTicket;

public sealed class CloseTicketCommand
{
    public Guid TicketId { get; set; }
}

public sealed class CloseTicketCommandValidator : AbstractValidator<CloseTicketCommand>
{
    public CloseTicketCommandValidator()
    {
        RuleFor(x => x.TicketId).NotEmpty();
    }
}

public sealed class CloseTicketCommandHandler
{
    private readonly ISupportRepository _supportRepository;
    private readonly IValidator<CloseTicketCommand> _validator;

    public CloseTicketCommandHandler(ISupportRepository supportRepository, IValidator<CloseTicketCommand> validator)
    {
        _supportRepository = supportRepository;
        _validator = validator;
    }

    public async Task<Result<SupportTicketDto>> HandleAsync(
        string userId,
        bool isCsAgent,
        CloseTicketCommand command,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Result<SupportTicketDto>.Failure(DomainErrors.Common.Unauthorized, 401);
        }

        var validationResult = await _validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = string.Join("; ", validationResult.Errors.Select(x => x.ErrorMessage));
            return Result<SupportTicketDto>.Failure(DomainErrors.Common.Validation(errors), 400);
        }

        var ticket = await _supportRepository.GetTicketByIdAsync(command.TicketId, cancellationToken);
        if (ticket is null)
        {
            return Result<SupportTicketDto>.Failure(DomainErrors.Support.TicketNotFound, 404);
        }

        if (ticket.UserId != userId && !isCsAgent)
        {
            return Result<SupportTicketDto>.Failure(DomainErrors.Common.Forbidden, 403);
        }

        ticket.Status = TicketStatus.Closed;
        ticket.UpdatedOnUtc = DateTime.UtcNow;
        await _supportRepository.SaveChangesAsync(cancellationToken);

        var dto = new SupportTicketDto
        {
            Id = ticket.Id,
            UserId = ticket.UserId,
            Subject = ticket.Subject,
            Description = ticket.Description,
            Priority = ticket.Priority,
            Status = ticket.Status,
            CreatedOnUtc = ticket.CreatedOnUtc
        };

        return Result<SupportTicketDto>.Success(dto, 200);
    }
}
