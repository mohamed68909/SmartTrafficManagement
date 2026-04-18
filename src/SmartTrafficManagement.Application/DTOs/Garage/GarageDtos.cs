namespace SmartTrafficManagement.Application.DTOs.Garage;

public sealed class AddVehicleRequestDto
{
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string PlateNumber { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public string? RegistrationPhotoUrl { get; set; }
}

public sealed class UpdateVehicleRequestDto
{
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Color { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public string? RegistrationPhotoUrl { get; set; }
}

public sealed class VehicleResponseDto
{
    public Guid Id { get; set; }
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string PlateNumber { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
}
