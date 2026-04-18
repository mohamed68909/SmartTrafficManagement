using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartTrafficManagement.Application.DTOs.Ratings;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Infrastructure.Persistence;

namespace SmartTrafficManagement.API.Controllers;

[ApiController]
//[Authorize]
[Route("api/ratings")]
public sealed class RatingsController : BaseController
{
    /// <summary>
    /// Submit a rating for a completed service request (SOS/Emergency) or an order.
    /// Matches the mobile "rate" screen.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(Result<RatingResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(Result<RatingResponseDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Result<RatingResponseDto>), StatusCodes.Status409Conflict)]
    public async Task<ActionResult> Submit(
        [FromBody] SubmitRatingRequestDto request,
        [FromServices] ApplicationDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        if (string.IsNullOrWhiteSpace(userId))
            return ProcessResult(Result<RatingResponseDto>.Failure(DomainErrors.Common.Unauthorized, 401));

        // Validate stars
        if (request.Stars is < 1 or > 5)
            return ProcessResult(Result<RatingResponseDto>.Failure(DomainErrors.Ratings.InvalidStars, 400));

        // Ensure at least one target is provided
        if (request.ServiceRequestId is null && request.OrderId is null)
            return ProcessResult(Result<RatingResponseDto>.Failure(DomainErrors.Ratings.TargetRequired, 400));

        // Prevent duplicate ratings
        var alreadyRated = await dbContext.Ratings.AnyAsync(
            r => r.UserId == userId &&
                 r.ServiceRequestId == request.ServiceRequestId &&
                 r.OrderId == request.OrderId,
            cancellationToken);

        if (alreadyRated)
            return ProcessResult(Result<RatingResponseDto>.Failure(DomainErrors.Ratings.AlreadyRated, 409));

        var rating = new Rating
        {
            UserId = userId,
            ServiceRequestId = request.ServiceRequestId,
            OrderId = request.OrderId,
            Stars = request.Stars,
            Comment = request.Comment?.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };

        await dbContext.Ratings.AddAsync(rating, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ProcessResult(Result<RatingResponseDto>.Success(new RatingResponseDto
        {
            Id = rating.Id,
            Stars = rating.Stars,
            Comment = rating.Comment,
            ServiceRequestId = rating.ServiceRequestId,
            OrderId = rating.OrderId,
            CreatedAtUtc = rating.CreatedAtUtc
        }, 201));
    }

    /// <summary>
    /// Get all ratings submitted by the current user.
    /// </summary>
    [HttpGet("my")]
    [ProducesResponseType(typeof(Result<IReadOnlyList<RatingResponseDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetMy(
        [FromServices] ApplicationDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
        if (string.IsNullOrWhiteSpace(userId))
            return ProcessResult(Result<IReadOnlyList<RatingResponseDto>>.Failure(DomainErrors.Common.Unauthorized, 401));

        var ratings = await dbContext.Ratings
            .AsNoTracking()
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAtUtc)
            .Select(r => new RatingResponseDto
            {
                Id = r.Id,
                Stars = r.Stars,
                Comment = r.Comment,
                ServiceRequestId = r.ServiceRequestId,
                OrderId = r.OrderId,
                CreatedAtUtc = r.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return ProcessResult(Result<IReadOnlyList<RatingResponseDto>>.Success(ratings, 200));
    }
}
