using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Application.Mapping;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.TrafficIncidents.GetAll;

public sealed class GetAllTrafficIncidentsHandler
{
    private readonly ITrafficIncidentRepository _repository;

    public GetAllTrafficIncidentsHandler(ITrafficIncidentRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<IReadOnlyList<TrafficIncidentDto>>> HandleAsync(CancellationToken cancellationToken = default)
    {
        var incidents = await _repository.GetAllAsync(cancellationToken);
        var payload = incidents.Select(i => i.ToDto()).ToList();

        return Result<IReadOnlyList<TrafficIncidentDto>>.Success(payload, 200);
    }
}
