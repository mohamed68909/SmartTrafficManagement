using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Application.Features.Chat.GetHistory;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Enums;
using SmartTrafficManagement.Core.Interfaces;
using SmartTrafficManagement.Core.Constants;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Infrastructure.Realtime;

namespace SmartTrafficManagement.API.Controllers;

[Route("api/chat")]
//[Authorize(Roles = $"{AppRoles.Client},{AppRoles.CSAgent}")]
public sealed class ChatController : BaseController
{
    public sealed class SendChatMessageRequest
    {
        public Guid TicketId { get; set; }
        public string Message { get; set; } = string.Empty;
        public ChatMessageType Type { get; set; } = ChatMessageType.Text;
    }

    [HttpGet("history/{ticketId:guid}")]
    [ProducesResponseType(typeof(Result<List<MessageDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<List<MessageDto>>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(Result<List<MessageDto>>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetHistory(
        Guid ticketId,
        [FromServices] GetChatHistoryQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        var isCsAgent = User.IsInRole(AppRoles.CSAgent);
        var result = await handler.HandleAsync(userId, isCsAgent, new GetChatHistoryQuery { TicketId = ticketId }, cancellationToken);
        return ProcessResult(result);
    }

    [HttpPost("send")]
    [ProducesResponseType(typeof(Result<MessageDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<MessageDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Result<MessageDto>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(Result<MessageDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> SendMessage(
        [FromBody] SendChatMessageRequest request,
        [FromServices] ISupportRepository supportRepository,
        [FromServices] IHubContext<TrafficHub> hubContext,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return ProcessResult(Result<MessageDto>.Failure(DomainErrors.Common.Validation("Message is required."), 400));
        }

        var isCsAgent = User.IsInRole(AppRoles.CSAgent);
        var ticket = await supportRepository.GetTicketByIdAsync(request.TicketId, cancellationToken);
        if (ticket is null)
        {
            return ProcessResult(Result<MessageDto>.Failure(DomainErrors.Support.TicketNotFound, 404));
        }

        if (ticket.UserId != userId && !isCsAgent)
        {
            return ProcessResult(Result<MessageDto>.Failure(DomainErrors.Chat.HistoryNotAllowed, 403));
        }

        var chatMessage = new ChatMessage
        {
            SupportTicketId = request.TicketId,
            SenderId = userId,
            Message = request.Message.Trim(),
            Type = request.Type,
            SentOnUtc = DateTime.UtcNow
        };

        await supportRepository.AddChatMessageAsync(chatMessage, cancellationToken);
        await supportRepository.SaveChangesAsync(cancellationToken);

        var senderName = User.Identity?.Name ?? userId;
        await hubContext.Clients.Group(request.TicketId.ToString()).SendAsync("ReceiveMessage", new
        {
            TicketId = request.TicketId,
            SenderId = userId,
            SenderName = senderName,
            Message = chatMessage.Message,
            Type = request.Type.ToString(),
            SentOnUtc = chatMessage.SentOnUtc
        }, cancellationToken);

        return ProcessResult(Result<MessageDto>.Success(new MessageDto
        {
            Id = chatMessage.Id,
            TicketId = chatMessage.SupportTicketId,
            SenderId = chatMessage.SenderId,
            SenderName = senderName,
            Message = chatMessage.Message,
            Type = chatMessage.Type,
            SentOnUtc = chatMessage.SentOnUtc
        }, 200));
    }
}
