namespace SmartTrafficManagement.Application.DTOs;

public sealed class TrafficReportDto
{
    public Guid Id { get; set; }
    public string ReporterId { get; set; } = string.Empty;
    public Guid? VehicleId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public bool IsVerified { get; set; }
    public int EarnedPoints { get; set; }
    public int TotalPoints { get; set; }
}
