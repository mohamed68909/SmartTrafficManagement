using FluentValidation;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Application.Mapping;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Modules.Traffic.Domain.Interfaces;

namespace SmartTrafficManagement.Application.Modules.Traffic.Application.Incidents.Queries.GetIncidentsByLocation;

public sealed record GetIncidentsByLocationQuery(string Location);

public sealed class GetIncidentsByLocationQueryValidator : AbstractValidator<GetIncidentsByLocationQuery>
{
    public GetIncidentsByLocationQueryValidator()
    {
        RuleFor(x => x.Location).NotEmpty().MaximumLength(250);
    }
}

public sealed class GetIncidentsByLocationQueryHandler
{
    private readonly ITrafficModuleRepository _repository;

    public GetIncidentsByLocationQueryHandler(ITrafficModuleRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<IReadOnlyList<TrafficIncidentDto>>> Handle(GetIncidentsByLocationQuery request, CancellationToken cancellationToken)
    {
        var incidents = await _repository.GetIncidentsByLocationAsync(request.Location, cancellationToken);
        var payload = incidents.Select(i => i.ToDto()).ToList();
        return Result<IReadOnlyList<TrafficIncidentDto>>.Success(payload, 200);
    }
}
