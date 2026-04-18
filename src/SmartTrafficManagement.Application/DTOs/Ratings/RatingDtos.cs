namespace SmartTrafficManagement.Application.DTOs.Ratings;

public sealed class SubmitRatingRequestDto
{
    /// <summary>ID of the service request to rate (SOS/Emergency). Required if OrderId is null.</summary>
    public Guid? ServiceRequestId { get; set; }

    /// <summary>ID of the order to rate. Required if ServiceRequestId is null.</summary>
    public Guid? OrderId { get; set; }

    /// <summary>Rating value from 1 to 5.</summary>
    public int Stars { get; set; }

    /// <summary>Optional review comment.</summary>
    public string? Comment { get; set; }
}

public sealed class RatingResponseDto
{
    public Guid Id { get; set; }
    public int Stars { get; set; }
    public string? Comment { get; set; }
    public Guid? ServiceRequestId { get; set; }
    public Guid? OrderId { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
