using FluentValidation;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.TrafficIntelligence.ReportTraffic;

public sealed class ReportTrafficCommand
{
    public Guid? VehicleId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public bool IsVerified { get; set; }
}

public sealed class ReportTrafficCommandValidator : AbstractValidator<ReportTrafficCommand>
{
    public ReportTrafficCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(250);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(1500);
        RuleFor(x => x.Location).NotEmpty().MaximumLength(250);
    }
}

public sealed class ReportTrafficCommandHandler
{
    private const int BasePoints = 10;
    private const int VerificationBonusPoints = 5;

    private readonly ITrafficIntelligenceRepository _repository;
    private readonly IValidator<ReportTrafficCommand> _validator;

    public ReportTrafficCommandHandler(
        ITrafficIntelligenceRepository repository,
        IValidator<ReportTrafficCommand> validator)
    {
        _repository = repository;
        _validator = validator;
    }

    public async Task<Result<TrafficReportDto>> HandleAsync(
        string userId,
        ReportTrafficCommand command,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Result<TrafficReportDto>.Failure(DomainErrors.Common.Unauthorized, 401);
        }

        var validationResult = await _validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = string.Join("; ", validationResult.Errors.Select(x => x.ErrorMessage));
            return Result<TrafficReportDto>.Failure(DomainErrors.Common.Validation(errors), 400);
        }

        var user = await _repository.GetUserByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return Result<TrafficReportDto>.Failure(DomainErrors.Common.NotFound, 404);
        }

        var earnedPoints = BasePoints + (command.IsVerified ? VerificationBonusPoints : 0);
        user.Points += earnedPoints;

        var report = new TrafficReport
        {
            ReporterId = userId,
            VehicleId = command.VehicleId,
            Title = command.Title,
            Description = command.Description,
            Location = command.Location,
            IsVerified = command.IsVerified
        };

        await _repository.AddTrafficReportAsync(report, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        var dto = new TrafficReportDto
        {
            Id = report.Id,
            ReporterId = report.ReporterId,
            VehicleId = report.VehicleId,
            Title = report.Title,
            Description = report.Description,
            Location = report.Location,
            IsVerified = report.IsVerified,
            EarnedPoints = earnedPoints,
            TotalPoints = user.Points
        };

        return Result<TrafficReportDto>.Success(dto, 201);
    }
}
