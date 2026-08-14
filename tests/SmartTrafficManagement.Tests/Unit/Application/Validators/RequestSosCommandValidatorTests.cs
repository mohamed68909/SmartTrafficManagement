using FluentValidation.TestHelper;
using SmartTrafficManagement.Application.Features.Sos.RequestSos;
using SmartTrafficManagement.Core.Enums;
using Xunit;

namespace SmartTrafficManagement.Tests.Unit.Application.Validators;

public class RequestSosCommandValidatorTests
{
    private readonly RequestSosCommandValidator _validator = new();

    [Fact]
    public void Validate_WithValidCommand_ShouldHaveNoErrors()
    {
        // Arrange
        var command = new RequestSosCommand
        {
            Lat = 30.0444m,
            Lng = 31.2357m,
            ServiceType = ServiceType.Towing,
            Notes = "Towing required"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData(-91.0)]
    [InlineData(91.0)]
    public void Validate_WithInvalidLatitude_ShouldHaveValidationError(decimal invalidLat)
    {
        // Arrange
        var command = new RequestSosCommand
        {
            Lat = invalidLat,
            Lng = 31.2357m,
            ServiceType = ServiceType.Towing
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Lat);
    }

    [Theory]
    [InlineData(-181.0)]
    [InlineData(181.0)]
    public void Validate_WithInvalidLongitude_ShouldHaveValidationError(decimal invalidLng)
    {
        // Arrange
        var command = new RequestSosCommand
        {
            Lat = 30.0444m,
            Lng = invalidLng,
            ServiceType = ServiceType.Towing
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Lng);
    }

    [Fact]
    public void Validate_WithOverlengthNotes_ShouldHaveValidationError()
    {
        // Arrange
        var command = new RequestSosCommand
        {
            Lat = 30.0444m,
            Lng = 31.2357m,
            ServiceType = ServiceType.Towing,
            Notes = new string('A', 501)
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Notes);
    }
}
