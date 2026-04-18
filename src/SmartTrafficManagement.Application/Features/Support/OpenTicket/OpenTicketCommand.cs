using FluentValidation;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Enums;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Support.OpenTicket;

public sealed class OpenTicketCommand
{
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TicketPriority Priority { get; set; } = TicketPriority.Medium;
}

public sealed class OpenTicketCommandValidator : AbstractValidator<OpenTicketCommand>
{
    public OpenTicketCommandValidator()
    {
        RuleFor(x => x.Subject).NotEmpty().MaximumLength(250);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Priority).IsInEnum();
    }
}

public sealed class OpenTicketCommandHandler
{
    private readonly ISupportRepository _supportRepository;
    private readonly IValidator<OpenTicketCommand> _validator;

    public OpenTicketCommandHandler(ISupportRepository supportRepository, IValidator<OpenTicketCommand> validator)
    {
        _supportRepository = supportRepository;
        _validator = validator;
    }

    public async Task<Result<SupportTicketDto>> HandleAsync(string userId, OpenTicketCommand command, CancellationToken cancellationToken = default)
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

        var ticket = new SupportTicket
        {
            UserId = userId,
            Subject = command.Subject,
            Description = command.Description,
            Priority = command.Priority,
            Status = TicketStatus.Open
        };

        await _supportRepository.AddTicketAsync(ticket, cancellationToken);
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

        return Result<SupportTicketDto>.Success(dto, 201);
    }
}
