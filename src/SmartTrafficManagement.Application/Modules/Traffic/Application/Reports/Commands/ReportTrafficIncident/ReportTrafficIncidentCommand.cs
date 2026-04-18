using FluentValidation;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Modules.Traffic.Domain.Interfaces;

namespace SmartTrafficManagement.Application.Modules.Traffic.Application.Reports.Commands.ReportTrafficIncident;

public sealed class ReportTrafficIncidentCommand
{
    public string UserId { get; set; } = string.Empty;
    public Guid? VehicleId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public bool IsVerified { get; set; }
}

public sealed class ReportTrafficIncidentCommandValidator : AbstractValidator<ReportTrafficIncidentCommand>
{
    public ReportTrafficIncidentCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(250);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(1500);
        RuleFor(x => x.Location).NotEmpty().MaximumLength(250);
    }
}

public sealed class ReportTrafficIncidentCommandHandler
{
    private const int BasePoints = 10;
    private const int VerificationBonusPoints = 5;
    private readonly ITrafficModuleRepository _repository;

    public ReportTrafficIncidentCommandHandler(ITrafficModuleRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<TrafficReportDto>> Handle(ReportTrafficIncidentCommand request, CancellationToken cancellationToken)
    {
        var user = await _repository.GetUserByIdAsync(request.UserId, cancellationToken);
        if (user is null)
        {
            return Result<TrafficReportDto>.Failure(DomainErrors.Common.NotFound, 404);
        }

        var earnedPoints = BasePoints + (request.IsVerified ? VerificationBonusPoints : 0);
        user.Points += earnedPoints;

        var report = new TrafficReport
        {
            ReporterId = request.UserId,
            VehicleId = request.VehicleId,
            Title = request.Title,
            Description = request.Description,
            Location = request.Location,
            IsVerified = request.IsVerified
        };

        await _repository.AddTrafficReportAsync(report, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        return Result<TrafficReportDto>.Success(new TrafficReportDto
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
        }, 201);
    }
}
