using FluentValidation;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Chat.GetHistory;

public sealed class GetChatHistoryQuery
{
    public Guid TicketId { get; set; }
}

public sealed class GetChatHistoryQueryValidator : AbstractValidator<GetChatHistoryQuery>
{
    public GetChatHistoryQueryValidator()
    {
        RuleFor(x => x.TicketId).NotEmpty();
    }
}

public sealed class GetChatHistoryQueryHandler
{
    private readonly ISupportRepository _supportRepository;
    private readonly IValidator<GetChatHistoryQuery> _validator;

    public GetChatHistoryQueryHandler(ISupportRepository supportRepository, IValidator<GetChatHistoryQuery> validator)
    {
        _supportRepository = supportRepository;
        _validator = validator;
    }

    public async Task<Result<List<MessageDto>>> HandleAsync(
        string userId,
        bool isCsAgent,
        GetChatHistoryQuery query,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Result<List<MessageDto>>.Failure(DomainErrors.Common.Unauthorized, 401);
        }

        var validationResult = await _validator.ValidateAsync(query, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = string.Join("; ", validationResult.Errors.Select(x => x.ErrorMessage));
            return Result<List<MessageDto>>.Failure(DomainErrors.Common.Validation(errors), 400);
        }

        var ticket = await _supportRepository.GetTicketByIdWithMessagesAsync(query.TicketId, cancellationToken);
        if (ticket is null)
        {
            return Result<List<MessageDto>>.Failure(DomainErrors.Support.TicketNotFound, 404);
        }

        if (ticket.UserId != userId && !isCsAgent)
        {
            return Result<List<MessageDto>>.Failure(DomainErrors.Chat.HistoryNotAllowed, 403);
        }

        var messages = ticket.ChatMessages
            .OrderBy(x => x.SentOnUtc)
            .Select(x => new MessageDto
            {
                Id = x.Id,
                TicketId = x.SupportTicketId,
                SenderId = x.SenderId,
                SenderName = $"{x.Sender.FirstName} {x.Sender.LastName}".Trim(),
                Message = x.Message,
                Type = x.Type,
                SentOnUtc = x.SentOnUtc
            })
            .ToList();

        return Result<List<MessageDto>>.Success(messages, 200);
    }
}
