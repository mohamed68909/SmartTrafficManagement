using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Application.Mapping;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Modules.Traffic.Domain.Interfaces;

namespace SmartTrafficManagement.Application.Modules.Traffic.Application.Incidents.Queries.GetActiveTrafficIncidents;

public sealed record GetActiveTrafficIncidentsQuery;

public sealed class GetActiveTrafficIncidentsQueryHandler
{
    private readonly ITrafficModuleRepository _repository;

    public GetActiveTrafficIncidentsQueryHandler(ITrafficModuleRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<IReadOnlyList<TrafficIncidentDto>>> Handle(GetActiveTrafficIncidentsQuery request, CancellationToken cancellationToken)
    {
        var incidents = await _repository.GetActiveIncidentsAsync(cancellationToken);
        var payload = incidents.Select(i => i.ToDto()).ToList();
        return Result<IReadOnlyList<TrafficIncidentDto>>.Success(payload, 200);
    }
}
