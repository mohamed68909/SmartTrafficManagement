using SmartTrafficManagement.Core.Enums;

namespace SmartTrafficManagement.Application.DTOs;

public sealed class SosStatusDto
{
    public Guid RequestId { get; set; }
    public RequestStatus Status { get; set; }
    public DateTime RequestedAtUtc { get; set; }
    public ProviderInfoDto? Provider { get; set; }
}

public sealed class ProviderInfoDto
{
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
}
